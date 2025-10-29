<<<<<<< Updated upstream
=======
import re
import math
from typing import List, Dict, Tuple, Set
from collections import Counter, defaultdict
from langchain_core.documents import Document
try:
    from langchain_openai import ChatOpenAI
except ImportError:
    from langchain_community.chat_models import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from rank_bm25 import BM25Okapi
import numpy as np


class EnhancedRetriever:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0.1)
        
        # Legal synonyms and related terms for query expansion
        self.legal_synonyms = {
            'penalty': ['fine', 'punishment', 'sanction', 'sentence', 'damages'],
            'violation': ['breach', 'infringement', 'contravention', 'offense', 'transgression'],
            'requirement': ['obligation', 'condition', 'prerequisite', 'mandate', 'provision'],
            'procedure': ['process', 'method', 'steps', 'protocol', 'mechanism'],
            'rights': ['entitlements', 'privileges', 'freedoms', 'liberties', 'prerogatives'],
            'contract': ['agreement', 'covenant', 'pact', 'arrangement', 'deal'],
            'property': ['asset', 'estate', 'possession', 'holding', 'ownership'],
            'court': ['tribunal', 'judiciary', 'bench', 'forum', 'adjudicator'],
            'appeal': ['review', 'revision', 'reconsideration', 'challenge', 'petition'],
            'license': ['permit', 'authorization', 'certification', 'approval', 'clearance'],
            'company': ['corporation', 'enterprise', 'business', 'firm', 'organization'],
            'act': ['statute', 'law', 'legislation', 'code', 'ordinance'],
            'regulation': ['rule', 'directive', 'guideline', 'standard', 'norm']
        }
        
        # Legal domain keywords for contextual expansion
        self.domain_keywords = {
            'civil': ['tort', 'negligence', 'liability', 'damages', 'compensation'],
            'criminal': ['crime', 'offense', 'prosecution', 'conviction', 'sentence'],
            'commercial': ['trade', 'commerce', 'business', 'corporate', 'commercial'],
            'constitutional': ['fundamental', 'constitutional', 'rights', 'government', 'state'],
            'procedural': ['jurisdiction', 'evidence', 'hearing', 'trial', 'judgment']
        }
        
        # BM25 instances for each collection (will be initialized when needed)
        self.bm25_indices = {}
        self.collection_docs = {}

    def expand_query(self, query: str) -> List[str]:
        """Expand query with legal synonyms and related terms."""
        expanded_queries = [query]  # Original query first
        
        # Extract key terms and expand with synonyms
        words = re.findall(r'\b\w+\b', query.lower())
        
        for word in words:
            if word in self.legal_synonyms:
                # Create variations with synonyms
                for synonym in self.legal_synonyms[word][:2]:  # Limit to 2 synonyms
                    expanded_query = query.lower().replace(word, synonym)
                    if expanded_query not in expanded_queries:
                        expanded_queries.append(expanded_query)
        
        # Add domain-specific expansions
        detected_domain = self.detect_query_domain(query)
        if detected_domain and detected_domain in self.domain_keywords:
            domain_terms = ' '.join(self.domain_keywords[detected_domain][:3])
            expanded_queries.append(f"{query} {domain_terms}")
        
        return expanded_queries[:5]  # Limit to 5 variations

    def detect_query_domain(self, query: str) -> str:
        """Detect the legal domain of the query."""
        query_lower = query.lower()
        domain_scores = {}
        
        for domain, keywords in self.domain_keywords.items():
            score = sum(1 for keyword in keywords if keyword in query_lower)
            domain_scores[domain] = score
        
        return max(domain_scores, key=domain_scores.get) if max(domain_scores.values()) > 0 else None

    def initialize_bm25_for_collection(self, collection_name: str, chroma_collection):
        """Initialize BM25 index for a collection if not already done."""
        if collection_name not in self.bm25_indices:
            # Get all documents from the collection
            try:
                # Try to get all documents (this might vary based on ChromaDB version)
                all_docs = chroma_collection.get()
                if 'documents' in all_docs:
                    documents = all_docs['documents']
                    metadatas = all_docs.get('metadatas', [{}] * len(documents))
                    
                    # Create Document objects
                    doc_objects = []
                    for i, doc_text in enumerate(documents):
                        metadata = metadatas[i] if i < len(metadatas) else {}
                        doc_objects.append(Document(page_content=doc_text, metadata=metadata))
                    
                    # Tokenize documents for BM25
                    tokenized_docs = [doc.page_content.lower().split() for doc in doc_objects]
                    
                    # Create BM25 index
                    self.bm25_indices[collection_name] = BM25Okapi(tokenized_docs)
                    self.collection_docs[collection_name] = doc_objects
                    
            except Exception as e:
                print(f"Warning: Could not initialize BM25 for {collection_name}: {e}")
                self.bm25_indices[collection_name] = None
                self.collection_docs[collection_name] = []

    def bm25_search(self, query: str, collection_name: str, k: int = 10) -> List[Tuple[Document, float]]:
        """Perform BM25 keyword search on a collection."""
        if collection_name not in self.bm25_indices or self.bm25_indices[collection_name] is None:
            return []
        
        bm25 = self.bm25_indices[collection_name]
        docs = self.collection_docs[collection_name]
        
        # Tokenize query
        query_tokens = query.lower().split()
        
        # Get BM25 scores
        scores = bm25.get_scores(query_tokens)
        
        # Get top-k documents with scores
        top_indices = np.argsort(scores)[::-1][:k]
        
        results = []
        for idx in top_indices:
            if scores[idx] > 0:  # Only include documents with positive scores
                results.append((docs[idx], float(scores[idx])))
        
        return results
    
    

    def semantic_search(self, query: str, chroma_collection, k: int = 10) -> List[Tuple[Document, float]]:
        """Perform semantic similarity search with robust error handling."""
        try:
            # Method 1: Try similarity_search_with_score (most reliable)
            try:
                docs_with_scores = chroma_collection.similarity_search_with_score(query, k=k)
                if docs_with_scores:
                    # Filter out documents with very low scores
                    filtered_results = [(doc, score) for doc, score in docs_with_scores if score > 0.1]
                    return filtered_results if filtered_results else docs_with_scores[:k]
            except Exception as e:
                print(f"Method 1 failed: {e}")
            
            # Method 2: Try basic similarity search
            try:
                docs = chroma_collection.similarity_search(query, k=k)
                if docs:
                    return [(doc, 0.5) for doc in docs]  # Assign default scores
            except Exception as e:
                print(f"Method 2 failed: {e}")
            
            # Method 3: Try retriever approach
            try:
                retriever = chroma_collection.as_retriever(
                    search_type="similarity",
                    search_kwargs={"k": k}
                )
                
                # Try newer LangChain API
                docs_with_scores = retriever.invoke(query)
                if docs_with_scores:
                    if isinstance(docs_with_scores, list):
                        if docs_with_scores and isinstance(docs_with_scores[0], tuple):
                            return docs_with_scores
                        else:
                            return [(doc, 0.5) for doc in docs_with_scores]
            except Exception as e:
                print(f"Method 3 failed: {e}")
            
            # Method 4: Fallback to older retriever API
            try:
                retriever = chroma_collection.as_retriever(search_kwargs={"k": k})
                docs = retriever.get_relevant_documents(query)
                if docs:
                    return [(doc, 0.5) for doc in docs[:k]]
            except Exception as e:
                print(f"Method 4 failed: {e}")
                
        except Exception as e:
            print(f"Semantic search completely failed for query '{query}': {e}")
        
        # Return empty list if all methods fail
        return []

    def hybrid_search(self, query: str, collections_dict: Dict, k: int = 10) -> List[Tuple[Document, float]]:
        """Combine semantic and keyword search with score fusion."""
        all_results = []
        
        # Expand query for better coverage
        expanded_queries = self.expand_query(query)
        
        for collection_name, chroma_collection in collections_dict.items():
            # Initialize BM25 if needed
            self.initialize_bm25_for_collection(collection_name, chroma_collection)
            
            collection_results = {}  # doc_content -> (doc, best_score, search_type)
            
            # Semantic search with original and expanded queries
            for i, exp_query in enumerate(expanded_queries):
                weight = 1.0 / (i + 1)  # Decrease weight for expanded queries
                
                semantic_results = self.semantic_search(exp_query, chroma_collection, k)
                if semantic_results:  # Check if results exist
                    for doc, score in semantic_results:
                        content = doc.page_content
                        weighted_score = score * weight * 0.7  # 70% weight for semantic
                        
                        if content not in collection_results or collection_results[content][1] < weighted_score:
                            collection_results[content] = (doc, weighted_score, 'semantic')
            
            # BM25 keyword search
            for i, exp_query in enumerate(expanded_queries):
                weight = 1.0 / (i + 1)
                
                bm25_results = self.bm25_search(exp_query, collection_name, k)
                if bm25_results:  # Check if results exist
                    for doc, score in bm25_results:
                        content = doc.page_content
                        # Normalize BM25 score (rough normalization)
                        normalized_score = min(score / 10.0, 1.0)
                        weighted_score = normalized_score * weight * 0.3  # 30% weight for BM25
                        
                        if content in collection_results:
                            # Combine scores if document found by both methods
                            existing_doc, existing_score, existing_type = collection_results[content]
                            combined_score = existing_score + weighted_score
                            collection_results[content] = (existing_doc, combined_score, 'hybrid')
                        else:
                            collection_results[content] = (doc, weighted_score, 'bm25')
            
            # Add collection results to overall results
            for doc, score, search_type in collection_results.values():
                all_results.append((doc, score, search_type, collection_name))
        
        return all_results

    def rerank_documents(self, query: str, doc_results: List[Tuple[Document, float, str, str]], top_k: int = 10) -> List[Document]:
        """Re-rank documents using LLM-based relevance scoring."""
        if not doc_results:
            return []
        
        # Sort by initial scores
        doc_results.sort(key=lambda x: x[1], reverse=True)
        
        # Take top candidates for re-ranking (more than final k to allow for re-ordering)
        candidates = doc_results[:min(top_k * 2, len(doc_results))]
        
        # Prepare documents for LLM re-ranking
        rerank_prompt = PromptTemplate.from_template(
            """You are a legal document relevance expert. Rate how relevant each document is to the query on a scale of 1-10.
            Consider legal accuracy, specificity, and direct applicability.
            
            Query: {query}
            
            Documents to rank:
            {documents}
            
            Output only the relevance scores (1-10) for each document, one per line, in the same order."""
        )
        
        # Prepare document texts for ranking (truncate for efficiency)
        doc_texts = []
        for i, (doc, score, search_type, collection) in enumerate(candidates):
            truncated_content = doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content
            doc_texts.append(f"Document {i+1}: {truncated_content}")
        
        documents_text = "\n\n".join(doc_texts)
        
        try:
            # Get LLM relevance scores
            response = self.llm.invoke(
                rerank_prompt.format(query=query, documents=documents_text)
            ).content
            
            # Parse scores
            score_lines = [line.strip() for line in response.split('\n') if line.strip()]
            llm_scores = []
            
            for line in score_lines:
                try:
                    # Extract number from line
                    score_match = re.search(r'(\d+(?:\.\d+)?)', line)
                    if score_match:
                        llm_scores.append(float(score_match.group(1)))
                    else:
                        llm_scores.append(5.0)  # Default score
                except:
                    llm_scores.append(5.0)
            
            # Ensure we have scores for all documents
            while len(llm_scores) < len(candidates):
                llm_scores.append(5.0)
            
            # Combine original and LLM scores
            final_results = []
            for i, (doc, original_score, search_type, collection) in enumerate(candidates):
                if i < len(llm_scores):
                    # Weighted combination: 40% original, 60% LLM
                    combined_score = (original_score * 0.4) + (llm_scores[i] / 10.0 * 0.6)
                    final_results.append((doc, combined_score, search_type, collection))
            
            # Sort by combined scores and return top documents
            final_results.sort(key=lambda x: x[1], reverse=True)
            return [doc for doc, score, search_type, collection in final_results[:top_k]]
            
        except Exception as e:
            print(f"Re-ranking failed: {e}. Using original scores.")
            # Fallback to original scoring
            candidates.sort(key=lambda x: x[1], reverse=True)
            return [doc for doc, score, search_type, collection in candidates[:top_k]]

    def retrieve_documents(self, question: str, collections_dict: Dict, k: int = 5) -> List[Document]:
        """Enhanced document retrieval with hybrid search and re-ranking."""
        try:
            # Perform hybrid search
            hybrid_results = self.hybrid_search(question, collections_dict, k * 3)  # Get more candidates
            
            if not hybrid_results:
                print(f"Warning: No documents found for query: {question}")
                return []
            
            # Re-rank documents
            final_docs = self.rerank_documents(question, hybrid_results, k)
            
            # Deduplicate by content while preserving order
            seen = set()
            unique_docs = []
            for doc in final_docs:
                if doc and hasattr(doc, 'page_content') and doc.page_content not in seen:
                    seen.add(doc.page_content)
                    unique_docs.append(doc)
            
            return unique_docs
            
        except Exception as e:
            print(f"Error in retrieve_documents: {e}")
            # Fallback to simple retrieval
            try:
                return self.fallback_retrieval(question, collections_dict, k)
            except Exception as fallback_error:
                print(f"Fallback retrieval also failed: {fallback_error}")
                return []

    def fallback_retrieval(self, question: str, collections_dict: Dict, k: int = 5) -> List[Document]:
        """Simple fallback retrieval method."""
        all_docs = []
        for collection_name, chroma_collection in collections_dict.items():
            try:
                # Try the simplest possible search
                docs = chroma_collection.similarity_search(question, k=k)
                if docs:
                    all_docs.extend(docs)
            except Exception as e:
                print(f"Even fallback failed for collection {collection_name}: {e}")
                continue
        
        # Deduplicate and return
        seen = set()
        unique_docs = []
        for doc in all_docs[:k]:
            if doc.page_content not in seen:
                seen.add(doc.page_content)
                unique_docs.append(doc)
        
        return unique_docs


# Global instance for enhanced retrieval
_enhanced_retriever = EnhancedRetriever()

>>>>>>> Stashed changes
def retrieve_docs(question, collections_dict, k=5):
    """Retrieve top-k relevant documents from all Chroma collections."""
    all_docs = []
    for name, chroma in collections_dict.items():
        retriever = chroma.as_retriever(search_type="similarity", search_kwargs={"k": k})

        # Compatible with newer LangChain versions
        try:
            docs = retriever.get_relevant_documents(question)
        except AttributeError:
            docs = retriever.invoke(question)

        all_docs.extend(docs)

    # Deduplicate documents by content
    seen = set()
    unique_docs = []
    for doc in all_docs:
        if doc.page_content not in seen:
            seen.add(doc.page_content)
            unique_docs.append(doc)

    return unique_docs
