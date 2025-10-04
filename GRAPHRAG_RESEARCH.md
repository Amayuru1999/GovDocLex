# Microsoft GraphRAG Research

## Overview

GraphRAG is an advanced Retrieval-Augmented Generation (RAG) approach developed by Microsoft Research that enhances traditional RAG systems by incorporating knowledge graphs and graph-based reasoning. This document provides comprehensive research findings on GraphRAG and its application to the Sri Lanka Government Acts RAG system.

## What is GraphRAG?

GraphRAG extends the traditional RAG paradigm by:
1. **Building Knowledge Graphs**: Automatically extracting entities, relationships, and hierarchical community structures from source documents
2. **Community Detection**: Organizing information into hierarchical communities using graph algorithms
3. **LLM-Generated Summaries**: Creating summaries at different levels of the community hierarchy
4. **Enhanced Retrieval**: Using graph structure and community information for more comprehensive and accurate retrieval

## Key Components

### 1. Graph Construction
- **Entity Extraction**: Identifies key entities (e.g., legal acts, sections, regulations, authorities)
- **Relationship Mapping**: Establishes connections between entities (references, amendments, dependencies)
- **Community Detection**: Groups related entities into hierarchical communities using algorithms like Leiden

### 2. Community Hierarchy
- **Multi-level Organization**: Communities are organized in a hierarchy from specific (low-level) to general (high-level)
- **Community Reports**: Each community level has LLM-generated summaries that capture the main themes and information
- **Scalability**: Enables efficient querying across large document collections

## Three Types of GraphRAG Retrieval

### 1. Global Search

**Description**: Uses LLM-generated community reports from a specified level of the graph's community hierarchy as context data to generate responses.

**How it Works**:
- Queries are answered using high-level community summaries
- Provides broad, comprehensive answers by synthesizing information across the entire knowledge graph
- Best for questions requiring understanding of overall themes and patterns

**Use Cases for Legal Acts**:
- "What are the main themes across all Sri Lankan aviation laws?"
- "Summarize the regulatory framework for civil aviation"
- "What are the common penalties across different legal acts?"

**Advantages**:
- Excellent for broad, thematic questions
- Synthesizes information from entire corpus
- Provides comprehensive overviews

**Implementation Approach**:
```python
# Pseudo-code for Global Search
def global_search(query, community_level=0):
    # Get community reports at specified hierarchy level
    community_reports = get_community_reports(level=community_level)
    
    # Use LLM to generate answer from community reports
    context = "\n\n".join(community_reports)
    answer = llm.generate(query, context=context)
    
    return answer
```

### 2. Local Search

**Description**: Combines structured data from the knowledge graph with unstructured data from the input documents to augment the LLM context with relevant entity information.

**How it Works**:
- Starts with entity extraction from the query
- Retrieves directly connected entities and relationships from the graph
- Includes original text chunks associated with those entities
- Provides detailed, entity-focused answers

**Use Cases for Legal Acts**:
- "What are the specific requirements for aircraft registration under the Civil Aviation Act?"
- "Who is responsible for enforcing Section 12 of the Carriage by Air Act?"
- "What penalties are specified in Article 5?"

**Advantages**:
- Precise, fact-based answers
- Leverages both graph structure and original text
- Good for specific, detailed questions

**Implementation Approach**:
```python
# Pseudo-code for Local Search
def local_search(query):
    # Extract entities from query
    query_entities = extract_entities(query)
    
    # Get connected entities and relationships from graph
    graph_context = get_entity_neighborhood(query_entities)
    
    # Retrieve relevant text chunks
    text_chunks = get_associated_text(query_entities)
    
    # Combine structured and unstructured context
    combined_context = merge_contexts(graph_context, text_chunks)
    
    # Generate answer
    answer = llm.generate(query, context=combined_context)
    
    return answer
```

### 3. Drift Search

**Description**: Dynamic Reasoning and Inference with Flexible Traversal - an advanced approach to local search queries that includes community information in the search process, combining benefits of both global and local search.

**How it Works**:
- Starts like local search with entity-based retrieval
- Dynamically "drifts" through the graph following relevant connections
- Incorporates community-level information when beneficial
- Adaptively balances between broad context and specific details

**Use Cases for Legal Acts**:
- "How do amendments to the Civil Aviation Act affect related regulations?"
- "What is the legal framework connecting aircraft safety to passenger liability?"
- "Trace the regulatory chain from licensing to enforcement"

**Advantages**:
- Flexible and adaptive
- Handles complex, multi-faceted questions
- Balances breadth and depth
- Good for exploratory queries

**Implementation Approach**:
```python
# Pseudo-code for Drift Search
def drift_search(query, max_hops=3):
    # Start with local entity-based retrieval
    query_entities = extract_entities(query)
    current_entities = query_entities
    visited = set()
    context_parts = []
    
    for hop in range(max_hops):
        # Get entity neighborhood
        neighbors = get_entity_neighborhood(current_entities)
        
        # Score relevance to query
        scored_neighbors = score_relevance(neighbors, query)
        
        # Add relevant community information
        relevant_communities = get_communities(current_entities)
        community_context = get_community_summaries(relevant_communities)
        
        # Collect context
        context_parts.append(get_associated_text(current_entities))
        context_parts.append(community_context)
        
        # Drift to next most relevant entities
        current_entities = select_top_k(scored_neighbors, k=5)
        visited.update(current_entities)
        
        # Early stopping if relevance drops
        if relevance_below_threshold(scored_neighbors):
            break
    
    # Generate answer from accumulated context
    combined_context = merge_contexts(context_parts)
    answer = llm.generate(query, context=combined_context)
    
    return answer
```

## Comparison of Retrieval Methods

| Aspect | Global Search | Local Search | Drift Search |
|--------|---------------|--------------|--------------|
| **Scope** | Entire corpus | Specific entities | Adaptive |
| **Context Source** | Community reports | Entity + text chunks | Mixed (entities + communities) |
| **Best For** | Thematic questions | Specific questions | Complex questions |
| **Latency** | Low | Medium | Medium-High |
| **Comprehensiveness** | High | Low-Medium | Medium-High |
| **Precision** | Low-Medium | High | High |

## Implementation Considerations for Sri Lanka Government Acts RAG

### 1. Graph Schema Design

For legal documents, the knowledge graph should capture:

```
Entities:
- Acts (e.g., "Civil Aviation Act")
- Sections/Articles (e.g., "Section 12")
- Legal Concepts (e.g., "Aircraft Registration")
- Authorities (e.g., "Civil Aviation Authority")
- Penalties/Fines
- Requirements/Obligations
- Dates/Amendments

Relationships:
- CONTAINS (Act → Section)
- REFERENCES (Section → Section)
- AMENDS (Act → Act)
- ENFORCED_BY (Section → Authority)
- REQUIRES (Section → Requirement)
- IMPOSES (Section → Penalty)
- SUPERSEDES (Act → Act)
```

### 2. Community Detection

For legal acts, communities might represent:
- **Level 0 (Most Specific)**: Individual articles/sections
- **Level 1**: Related sections within an act
- **Level 2**: Thematic groupings across acts (e.g., all safety-related provisions)
- **Level 3**: High-level categories (e.g., regulatory framework, enforcement)

### 3. Integration with Existing System

The current system uses:
- ChromaDB for vector storage
- LangChain for RAG orchestration
- LangGraph for workflow management

Integration approach:
1. **Parallel Implementation**: Run GraphRAG alongside existing RAG
2. **Query Routing**: Use LLM to determine which retrieval method to use
3. **Hybrid Results**: Combine results from both systems for comprehensive answers

### 4. Technical Requirements

**Dependencies**:
```python
graphrag              # Microsoft's GraphRAG library
networkx              # Graph operations
python-louvain        # Community detection
graspologic           # Graph statistics and community detection
```

**Preprocessing Pipeline**:
1. Extract text from legal acts (existing)
2. Build knowledge graph from text
3. Detect communities using Leiden algorithm
4. Generate community summaries using LLM
5. Index everything for efficient retrieval

### 5. Performance Considerations

**Indexing Time**:
- Initial graph construction: O(n) where n = document count
- Community detection: O(m log n) where m = edges, n = nodes
- Community summarization: O(c) where c = number of communities
- **Total**: Significantly longer than traditional RAG

**Query Time**:
- Global Search: Fast (pre-computed summaries)
- Local Search: Medium (graph traversal + text retrieval)
- Drift Search: Slower (adaptive multi-hop traversal)

**Storage Requirements**:
- Original documents: Baseline
- Graph structure: ~20-30% of baseline
- Community reports: ~10-15% of baseline
- **Total**: ~130-145% of traditional RAG

## Evaluation Metrics

To evaluate GraphRAG effectiveness:

1. **Comprehensiveness**: Ability to answer broad questions
2. **Specificity**: Accuracy on detailed questions
3. **Latency**: Query response time
4. **Relevance**: Quality of retrieved information
5. **Coverage**: Percentage of questions answerable

## Example Workflow

### End-to-End GraphRAG Pipeline for Legal Acts

```python
# 1. Build Knowledge Graph
documents = load_legal_acts()
entities, relationships = extract_graph_elements(documents)
graph = build_knowledge_graph(entities, relationships)

# 2. Detect Communities
communities = detect_communities(graph, algorithm="leiden")
hierarchy = build_community_hierarchy(communities)

# 3. Generate Community Reports
for level in hierarchy:
    for community in level:
        community.summary = generate_summary(
            community.entities,
            community.relationships,
            llm=llm
        )

# 4. Query Processing
def answer_query(query, method="auto"):
    if method == "auto":
        method = classify_query_type(query)
    
    if method == "global":
        return global_search(query)
    elif method == "local":
        return local_search(query)
    elif method == "drift":
        return drift_search(query)
```

## Advantages of GraphRAG for Legal Documents

1. **Relationship Awareness**: Understands how different acts and sections relate
2. **Amendment Tracking**: Can trace changes and references across acts
3. **Multi-hop Reasoning**: Follows chains of legal logic
4. **Thematic Understanding**: Groups related legal concepts automatically
5. **Comprehensive Coverage**: Global search ensures no relevant act is missed
6. **Precise Details**: Local search provides exact citations and requirements

## Challenges and Limitations

1. **Initial Setup Cost**: Graph construction is time-intensive
2. **Maintenance**: Requires updating when acts are amended
3. **Complexity**: More moving parts than traditional RAG
4. **Resource Requirements**: Higher compute and storage needs
5. **Entity Extraction Quality**: Depends on quality of NER for legal text
6. **Graph Quality**: Relationships must be accurately identified

## Recommendations

### For Immediate Implementation:
1. **Start with Local Search**: Easier to implement, provides immediate value
2. **Use Pre-trained Legal NER**: Leverage models trained on legal text
3. **Manual Graph Seeding**: Initially seed graph with known relationships
4. **Hybrid Approach**: Combine traditional RAG with GraphRAG

### For Advanced Features:
1. **Implement Global Search**: Once community detection is stable
2. **Add Drift Search**: After local and global are working well
3. **Query Type Classification**: Automatically route queries to best method
4. **Continuous Learning**: Update graph as new acts are added

### For Production:
1. **Caching**: Cache community reports and frequent queries
2. **Incremental Updates**: Support adding new acts without full rebuild
3. **Monitoring**: Track which search type is most effective
4. **A/B Testing**: Compare GraphRAG vs traditional RAG performance

## References and Resources

1. **Microsoft GraphRAG Paper**: "From Local to Global: A Graph RAG Approach to Query-Focused Summarization"
2. **GitHub Repository**: https://github.com/microsoft/graphrag
3. **Documentation**: https://microsoft.github.io/graphrag/
4. **Community Detection**: Leiden algorithm for community detection
5. **Legal NLP**: spaCy legal models, LegalBERT for entity extraction

## Conclusion

GraphRAG represents a significant advancement in RAG systems, particularly for domains like legal documents where:
- Relationships between documents are important
- Multi-hop reasoning is required
- Both broad overviews and specific details are needed

For the Sri Lanka Government Acts RAG system, implementing GraphRAG would:
- Improve answer comprehensiveness for broad questions
- Maintain precision for specific legal queries
- Enable discovery of relationships between acts
- Provide better context through community-level understanding

The phased implementation approach recommended here allows starting with high-value features (Local Search) while building toward the full GraphRAG capability with all three retrieval methods.

---

**Document Status**: Research Complete
**Next Steps**: Prototype implementation of Local Search
**Estimated Implementation Time**: 
- Local Search: 2-3 weeks
- Global Search: 3-4 weeks (after Local)
- Drift Search: 4-5 weeks (after Global)
