"""
GraphRAG Implementation Example
Demonstrates the three types of GraphRAG retrieval: Global, Local, and Drift Search

This is a proof-of-concept implementation showing how Microsoft GraphRAG concepts
can be applied to the Sri Lanka Government Acts RAG system.
"""

import json
import logging
import re
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from collections import defaultdict

import networkx as nx
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

from graphrag_config import (
    GRAPHRAG_CONFIG,
    QUERY_TYPE_PATTERNS,
    LEGAL_ENTITY_PATTERNS,
    GRAPH_SCHEMA
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GraphRAGSystem:
    """
    Implementation of Microsoft GraphRAG for legal documents.
    
    Supports three retrieval methods:
    1. Global Search - Uses community-level summaries
    2. Local Search - Entity-focused with graph context  
    3. Drift Search - Adaptive multi-hop traversal
    """
    
    def __init__(self, config: Dict = None):
        """Initialize GraphRAG system with configuration."""
        self.config = config or GRAPHRAG_CONFIG
        self.graph = nx.DiGraph()
        self.communities = {}
        self.community_summaries = {}
        self.entity_to_text = defaultdict(list)
        self.llm = ChatOpenAI(
            temperature=self.config["summarization"]["temperature"],
            model=self.config["summarization"]["model"]
        )
        
    # ==================== Graph Construction ====================
    
    def extract_entities(self, text: str) -> List[Tuple[str, str]]:
        """
        Extract legal entities from text.
        
        Args:
            text: Input text from legal document
            
        Returns:
            List of (entity_type, entity_value) tuples
        """
        entities = []
        
        for entity_type, pattern in LEGAL_ENTITY_PATTERNS.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                entity_value = match.group(1).strip()
                entities.append((entity_type, entity_value))
                
        return entities
    
    def build_graph_from_documents(self, documents: List[Dict[str, str]]):
        """
        Build knowledge graph from legal documents.
        
        Args:
            documents: List of dicts with 'id', 'text', and 'metadata' keys
        """
        logger.info("Building knowledge graph from documents...")
        
        for doc in documents:
            doc_id = doc['id']
            text = doc['text']
            
            # Extract entities
            entities = self.extract_entities(text)
            
            # Add entities as nodes
            for entity_type, entity_value in entities:
                node_id = f"{entity_type}:{entity_value}"
                
                if not self.graph.has_node(node_id):
                    self.graph.add_node(
                        node_id,
                        type=entity_type,
                        value=entity_value,
                        documents=[doc_id]
                    )
                else:
                    # Add document to existing node
                    self.graph.nodes[node_id]['documents'].append(doc_id)
                
                # Store text chunks associated with entity
                self.entity_to_text[node_id].append(text)
            
            # Create relationships (simplified - in production use NLP)
            self._create_relationships(entities, doc_id)
        
        logger.info(f"Graph built: {self.graph.number_of_nodes()} nodes, "
                   f"{self.graph.number_of_edges()} edges")
    
    def _create_relationships(self, entities: List[Tuple[str, str]], doc_id: str):
        """Create relationships between entities (simplified version)."""
        # Simple heuristic: entities in same document are related
        entity_ids = [f"{et}:{ev}" for et, ev in entities]
        
        for i, entity1 in enumerate(entity_ids):
            for entity2 in entity_ids[i+1:]:
                if not self.graph.has_edge(entity1, entity2):
                    self.graph.add_edge(
                        entity1,
                        entity2,
                        type="RELATED_TO",
                        source_doc=doc_id
                    )
    
    # ==================== Community Detection ====================
    
    def detect_communities(self):
        """
        Detect hierarchical communities using Leiden/Louvain algorithm.
        
        Note: This is a simplified version. Production would use graspologic
        or python-louvain for proper hierarchical community detection.
        """
        logger.info("Detecting communities...")
        
        # Convert to undirected for community detection
        undirected = self.graph.to_undirected()
        
        # Simple community detection (in production, use Leiden algorithm)
        try:
            from community import community_louvain
            partition = community_louvain.best_partition(undirected)
            
            # Organize by community
            communities_dict = defaultdict(list)
            for node, community_id in partition.items():
                communities_dict[community_id].append(node)
            
            self.communities = dict(communities_dict)
            logger.info(f"Detected {len(self.communities)} communities")
            
        except ImportError:
            logger.warning("python-louvain not installed. Using connected components.")
            # Fallback to connected components
            components = nx.connected_components(undirected)
            self.communities = {i: list(comp) for i, comp in enumerate(components)}
    
    def generate_community_summaries(self):
        """Generate LLM-based summaries for each community."""
        logger.info("Generating community summaries...")
        
        prompt_template = PromptTemplate(
            input_variables=["entities", "relationships"],
            template="""You are analyzing a community of related legal entities.

Entities in this community:
{entities}

Relationships:
{relationships}

Generate a concise summary (2-3 sentences) describing the main theme or purpose 
of this community of legal entities. Focus on what connects these entities.

Summary:"""
        )
        
        for community_id, nodes in self.communities.items():
            # Gather entity information
            entity_info = []
            for node in nodes:
                node_data = self.graph.nodes[node]
                entity_info.append(f"- {node_data['type']}: {node_data['value']}")
            
            # Gather relationships
            edges = []
            for node1 in nodes:
                for node2 in nodes:
                    if self.graph.has_edge(node1, node2):
                        edge_data = self.graph.edges[node1, node2]
                        edges.append(f"- {node1} {edge_data['type']} {node2}")
            
            # Generate summary
            entities_str = "\n".join(entity_info[:20])  # Limit for context
            relationships_str = "\n".join(edges[:20])
            
            try:
                summary = self.llm.predict(
                    prompt_template.format(
                        entities=entities_str,
                        relationships=relationships_str
                    )
                )
                self.community_summaries[community_id] = summary.strip()
                
            except Exception as e:
                logger.error(f"Error generating summary for community {community_id}: {e}")
                self.community_summaries[community_id] = "Summary generation failed."
        
        logger.info(f"Generated {len(self.community_summaries)} community summaries")
    
    # ==================== Retrieval Methods ====================
    
    def classify_query_type(self, query: str) -> str:
        """
        Classify query to determine best retrieval method.
        
        Args:
            query: User's question
            
        Returns:
            'global', 'local', or 'drift'
        """
        query_lower = query.lower()
        
        # Check patterns for each type
        for query_type, patterns in QUERY_TYPE_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    return query_type
        
        # Default to local search
        return "local"
    
    def global_search(self, query: str, community_level: int = 1) -> str:
        """
        Global Search: Use community summaries to answer broad questions.
        
        Args:
            query: User's question
            community_level: Which hierarchy level to use (0=specific, higher=general)
            
        Returns:
            Generated answer
        """
        logger.info(f"Executing global search for: {query}")
        
        # Get all community summaries as context
        context_parts = []
        for community_id, summary in self.community_summaries.items():
            context_parts.append(f"Community {community_id}: {summary}")
        
        context = "\n\n".join(context_parts)
        
        # Generate answer using LLM
        prompt = PromptTemplate(
            input_variables=["query", "context"],
            template="""You are a legal expert assistant. Answer the question using the 
community summaries provided. Synthesize information across communities to provide 
a comprehensive answer.

Community Summaries:
{context}

Question: {query}

Provide a comprehensive answer that synthesizes information from relevant communities:"""
        )
        
        try:
            answer = self.llm.predict(
                prompt.format(query=query, context=context)
            )
            return answer.strip()
        except Exception as e:
            logger.error(f"Error in global search: {e}")
            return f"Error generating answer: {str(e)}"
    
    def local_search(self, query: str, max_entities: int = 10, max_hops: int = 2) -> str:
        """
        Local Search: Entity-focused search with graph context.
        
        Args:
            query: User's question
            max_entities: Maximum entities to retrieve
            max_hops: Maximum graph hops from query entities
            
        Returns:
            Generated answer
        """
        logger.info(f"Executing local search for: {query}")
        
        # Extract entities from query
        query_entities = self.extract_entities(query)
        
        if not query_entities:
            return "No specific entities found in query. Try rephrasing with specific acts, sections, or authorities."
        
        # Get entity nodes
        entity_nodes = []
        for entity_type, entity_value in query_entities:
            node_id = f"{entity_type}:{entity_value}"
            if self.graph.has_node(node_id):
                entity_nodes.append(node_id)
        
        if not entity_nodes:
            return "The specific entities mentioned were not found in the knowledge graph."
        
        # Get neighborhood context (entities within max_hops)
        context_nodes = set(entity_nodes)
        for node in entity_nodes:
            # Get neighbors within max_hops
            try:
                neighbors = nx.single_source_shortest_path_length(
                    self.graph.to_undirected(), 
                    node, 
                    cutoff=max_hops
                )
                context_nodes.update(neighbors.keys())
            except nx.NetworkXError:
                pass
        
        # Limit context size
        context_nodes = list(context_nodes)[:max_entities]
        
        # Gather context information
        entity_context = []
        for node in context_nodes:
            node_data = self.graph.nodes[node]
            entity_context.append(
                f"- {node_data['type']}: {node_data['value']}"
            )
        
        # Get associated text chunks
        text_chunks = []
        for node in context_nodes:
            chunks = self.entity_to_text.get(node, [])
            text_chunks.extend(chunks[:2])  # Limit chunks per entity
        
        # Generate answer
        prompt = PromptTemplate(
            input_variables=["query", "entities", "text"],
            template="""You are a legal expert assistant. Answer the question using the 
entity information and text excerpts provided.

Relevant Entities:
{entities}

Text Excerpts:
{text}

Question: {query}

Provide a detailed, precise answer citing specific entities and requirements:"""
        )
        
        entities_str = "\n".join(entity_context)
        text_str = "\n\n---\n\n".join(text_chunks[:5])  # Limit total text
        
        try:
            answer = self.llm.predict(
                prompt.format(query=query, entities=entities_str, text=text_str)
            )
            return answer.strip()
        except Exception as e:
            logger.error(f"Error in local search: {e}")
            return f"Error generating answer: {str(e)}"
    
    def drift_search(self, query: str, max_hops: int = 3, 
                     entities_per_hop: int = 5) -> str:
        """
        Drift Search: Adaptive multi-hop traversal with community context.
        
        Combines local entity-based retrieval with community-level context,
        dynamically "drifting" through relevant parts of the graph.
        
        Args:
            query: User's question
            max_hops: Maximum graph traversal hops
            entities_per_hop: Number of entities to explore per hop
            
        Returns:
            Generated answer
        """
        logger.info(f"Executing drift search for: {query}")
        
        # Start with query entities (like local search)
        query_entities = self.extract_entities(query)
        
        if not query_entities:
            # Fallback to global search if no entities
            return self.global_search(query)
        
        # Track visited nodes and collected context
        visited = set()
        current_nodes = []
        context_parts = []
        
        # Initialize with query entities
        for entity_type, entity_value in query_entities:
            node_id = f"{entity_type}:{entity_value}"
            if self.graph.has_node(node_id):
                current_nodes.append(node_id)
                visited.add(node_id)
        
        # Drift through graph
        for hop in range(max_hops):
            logger.info(f"Drift hop {hop + 1}: exploring {len(current_nodes)} nodes")
            
            hop_context = []
            next_nodes = []
            
            for node in current_nodes:
                # Add entity information
                node_data = self.graph.nodes[node]
                hop_context.append(
                    f"- {node_data['type']}: {node_data['value']}"
                )
                
                # Add text chunks
                chunks = self.entity_to_text.get(node, [])
                if chunks:
                    hop_context.append(f"  Text: {chunks[0][:200]}...")
                
                # Get neighbors for next hop
                neighbors = list(self.graph.neighbors(node))
                for neighbor in neighbors:
                    if neighbor not in visited:
                        next_nodes.append(neighbor)
                        visited.add(neighbor)
            
            # Add community context for current nodes
            communities_in_hop = set()
            for node in current_nodes:
                for comm_id, comm_nodes in self.communities.items():
                    if node in comm_nodes:
                        communities_in_hop.add(comm_id)
            
            for comm_id in communities_in_hop:
                if comm_id in self.community_summaries:
                    hop_context.append(
                        f"Community {comm_id} theme: {self.community_summaries[comm_id]}"
                    )
            
            context_parts.append(f"\n=== Hop {hop + 1} ===\n" + "\n".join(hop_context))
            
            # Select top entities for next hop (simple: take first N)
            current_nodes = next_nodes[:entities_per_hop]
            
            if not current_nodes:
                logger.info("No more nodes to explore")
                break
        
        # Generate answer from accumulated context
        all_context = "\n".join(context_parts)
        
        prompt = PromptTemplate(
            input_variables=["query", "context"],
            template="""You are a legal expert assistant. Answer the question using the 
information gathered through adaptive graph traversal. The context includes both 
specific entity details and thematic community information.

Context from Graph Traversal:
{context}

Question: {query}

Provide a comprehensive answer that traces the relevant legal connections:"""
        )
        
        try:
            answer = self.llm.predict(
                prompt.format(query=query, context=all_context)
            )
            return answer.strip()
        except Exception as e:
            logger.error(f"Error in drift search: {e}")
            return f"Error generating answer: {str(e)}"
    
    def answer_query(self, query: str, method: str = "auto") -> Dict[str, Any]:
        """
        Answer a query using the specified or auto-detected method.
        
        Args:
            query: User's question
            method: 'auto', 'global', 'local', or 'drift'
            
        Returns:
            Dict with answer and metadata
        """
        if method == "auto":
            method = self.classify_query_type(query)
            logger.info(f"Auto-classified query as: {method}")
        
        if method == "global":
            answer = self.global_search(query)
        elif method == "local":
            answer = self.local_search(query)
        elif method == "drift":
            answer = self.drift_search(query)
        else:
            return {
                "error": f"Unknown method: {method}",
                "valid_methods": ["auto", "global", "local", "drift"]
            }
        
        return {
            "query": query,
            "method": method,
            "answer": answer
        }
    
    # ==================== Utility Methods ====================
    
    def save_graph(self, filepath: str):
        """Save graph to file."""
        graph_data = nx.node_link_data(self.graph)
        with open(filepath, 'w') as f:
            json.dump({
                'graph': graph_data,
                'communities': self.communities,
                'summaries': self.community_summaries
            }, f, indent=2)
        logger.info(f"Graph saved to {filepath}")
    
    def load_graph(self, filepath: str):
        """Load graph from file."""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        self.graph = nx.node_link_graph(data['graph'])
        self.communities = data['communities']
        self.community_summaries = data['summaries']
        logger.info(f"Graph loaded from {filepath}")


# ==================== Example Usage ====================

def example_usage():
    """Demonstrate GraphRAG with example legal documents."""
    
    # Example documents
    documents = [
        {
            'id': 'civil_aviation_act_sec1',
            'text': 'The Civil Aviation Authority of Sri Lanka shall regulate aircraft registration under Section 12. Aircraft operators must comply with Section 15 requirements.',
            'metadata': {'source': 'Civil Aviation Act'}
        },
        {
            'id': 'civil_aviation_act_sec2',
            'text': 'Section 15 of the Civil Aviation Act specifies that aircraft registration requires submission of ownership documents and payment of a fee of Rs. 50,000.',
            'metadata': {'source': 'Civil Aviation Act'}
        },
        {
            'id': 'carriage_by_air_act_sec1',
            'text': 'Article 5 of the Carriage by Air Act establishes liability limits. The Authority responsible for enforcement is the Civil Aviation Authority.',
            'metadata': {'source': 'Carriage by Air Act'}
        },
    ]
    
    # Initialize system
    graphrag = GraphRAGSystem()
    
    # Build graph
    graphrag.build_graph_from_documents(documents)
    
    # Detect communities and generate summaries
    graphrag.detect_communities()
    graphrag.generate_community_summaries()
    
    # Example queries
    queries = [
        ("What are the main themes across aviation laws?", "global"),
        ("What are the requirements in Section 15?", "local"),
        ("How does aircraft registration connect to enforcement?", "drift"),
    ]
    
    print("\n" + "="*70)
    print("GraphRAG Example Demonstration")
    print("="*70)
    
    for query, expected_method in queries:
        print(f"\nQuery: {query}")
        print(f"Expected Method: {expected_method}")
        
        result = graphrag.answer_query(query, method="auto")
        
        print(f"Used Method: {result['method']}")
        print(f"Answer: {result['answer']}")
        print("-"*70)


if __name__ == "__main__":
    # Note: Requires OpenAI API key in environment
    print("GraphRAG Implementation Example")
    print("This is a proof-of-concept implementation.")
    print("\nTo run the example, ensure you have:")
    print("- OpenAI API key configured")
    print("- Required dependencies installed")
    print("\nUncomment the line below to run the example:\n")
    
    # example_usage()
