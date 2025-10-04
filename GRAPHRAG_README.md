# GraphRAG Integration Guide

## Overview

This directory contains the GraphRAG research implementation for the Sri Lanka Government Acts RAG system. GraphRAG is Microsoft's advanced approach to Retrieval-Augmented Generation that uses knowledge graphs and community detection for enhanced retrieval.

## Files

### Documentation
- **`GRAPHRAG_RESEARCH.md`** - Comprehensive research document covering GraphRAG theory, implementation approaches, and recommendations
  
### Implementation
- **`rag/graphrag_config.py`** - Configuration settings for GraphRAG including entity extraction, community detection, and retrieval parameters
- **`rag/graphrag_example.py`** - Working proof-of-concept implementation demonstrating all three retrieval methods

### Dependencies
- **`rag/requirements.txt`** - Updated with GraphRAG dependencies

## Three Retrieval Methods

### 1. Global Search
**Use for**: Broad, thematic questions across multiple documents

**Example queries**:
- "What are the main themes across all aviation laws?"
- "Summarize the regulatory framework for civil aviation"

**How it works**: Uses pre-generated community summaries from the knowledge graph hierarchy

### 2. Local Search  
**Use for**: Specific, detailed questions about particular entities

**Example queries**:
- "What are the requirements in Section 15?"
- "Who enforces Article 5 of the Carriage by Air Act?"

**How it works**: Retrieves entities mentioned in the query plus their graph neighborhood and associated text

### 3. Drift Search
**Use for**: Complex questions requiring multi-hop reasoning

**Example queries**:
- "How does aircraft registration connect to enforcement?"
- "Trace the legal framework from licensing to penalties"

**How it works**: Adaptively traverses the graph following relevant connections, combining entity details with community context

## Quick Start

### 1. Install Dependencies

```bash
cd rag
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
export OPENAI_API_KEY="your-api-key-here"
```

### 3. Run the Example

```python
from rag.graphrag_example import GraphRAGSystem

# Initialize
graphrag = GraphRAGSystem()

# Build graph from your documents
documents = [
    {
        'id': 'doc1',
        'text': 'Your legal document text...',
        'metadata': {'source': 'Civil Aviation Act'}
    }
]
graphrag.build_graph_from_documents(documents)

# Detect communities
graphrag.detect_communities()
graphrag.generate_community_summaries()

# Query
result = graphrag.answer_query(
    "What are the registration requirements?",
    method="auto"  # or "global", "local", "drift"
)

print(result['answer'])
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GraphRAG System                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────┐      ┌─────────────────┐          │
│  │   Documents    │─────>│ Entity Extractor│          │
│  └────────────────┘      └─────────────────┘          │
│                                  │                      │
│                                  v                      │
│                          ┌───────────────┐             │
│                          │ Knowledge     │             │
│                          │ Graph Builder │             │
│                          └───────────────┘             │
│                                  │                      │
│                                  v                      │
│          ┌──────────────────────────────────┐          │
│          │     Community Detection          │          │
│          │  (Leiden/Louvain Algorithm)     │          │
│          └──────────────────────────────────┘          │
│                       │                                 │
│                       v                                 │
│          ┌──────────────────────────────────┐          │
│          │   Community Summarization        │          │
│          │   (LLM-Generated Summaries)      │          │
│          └──────────────────────────────────┘          │
│                       │                                 │
│          ┌────────────┴────────────┐                   │
│          │                         │                    │
│          v                         v                    │
│  ┌──────────────┐         ┌──────────────┐            │
│  │ Graph Store  │         │ Summary Store│            │
│  │  (NetworkX)  │         │  (Dict)      │            │
│  └──────────────┘         └──────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            │
                            v
┌─────────────────────────────────────────────────────────┐
│                  Query Processing                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Query ──> Query Classifier ──> Retrieval Method       │
│                                         │               │
│                        ┌────────────────┴──────────┐   │
│                        │                           │   │
│                        v                           v   │
│             ┌──────────────────┐       ┌─────────────┐│
│             │  Global Search   │       │Local Search ││
│             │  (Communities)   │       │(Entities +  ││
│             └──────────────────┘       │ Graph)      ││
│                        │               └─────────────┘│
│                        └───────┬──────────┘           │
│                                v                       │
│                        ┌──────────────┐               │
│                        │ Drift Search │               │
│                        │(Adaptive Mix)│               │
│                        └──────────────┘               │
│                                │                       │
└────────────────────────────────┼───────────────────────┘
                                 │
                                 v
                          ┌────────────┐
                          │   Answer   │
                          └────────────┘
```

## Integration with Existing System

The GraphRAG implementation can be integrated with the existing RAG system in several ways:

### Option 1: Parallel Implementation
Run GraphRAG alongside the current ChromaDB-based system and compare results.

```python
# Get answer from traditional RAG
traditional_answer = existing_rag_system.query(question)

# Get answer from GraphRAG
graphrag_answer = graphrag_system.answer_query(question)

# Compare or combine
final_answer = combine_answers(traditional_answer, graphrag_answer)
```

### Option 2: Hybrid Retrieval
Use query classification to route to the most appropriate system.

```python
def answer_query(question):
    query_type = classify_query(question)
    
    if query_type == "broad_thematic":
        return graphrag_system.global_search(question)
    elif query_type == "specific_detail":
        return existing_rag_system.query(question)
    else:
        return graphrag_system.drift_search(question)
```

### Option 3: Graph Enhancement
Enhance existing retrieval with graph-based context.

```python
# Retrieve with existing system
docs = existing_rag_system.retrieve(question)

# Enhance with graph context
entities = extract_entities(question)
graph_context = graphrag_system.get_entity_context(entities)

# Combine for answer generation
answer = llm.generate(question, docs + graph_context)
```

## Performance Considerations

### Indexing
- **Graph construction**: ~2-5 minutes for 100 documents
- **Community detection**: ~1-3 minutes for 1000 nodes
- **Summary generation**: ~30-60 seconds per 10 communities

### Query Time
- **Global Search**: 1-2 seconds (fast - uses pre-computed summaries)
- **Local Search**: 2-4 seconds (moderate - graph traversal)
- **Drift Search**: 3-6 seconds (slower - multi-hop traversal)

### Storage
- **Graph structure**: ~30% additional storage vs text-only
- **Community summaries**: ~15% additional storage
- **Total overhead**: ~45% for full GraphRAG

## Configuration

Edit `graphrag_config.py` to customize:

```python
GRAPHRAG_CONFIG = {
    "community_detection": {
        "algorithm": "leiden",  # or "louvain"
        "resolution": 1.0,      # Community granularity
    },
    "retrieval": {
        "global_search": {
            "community_level": 1,  # 0=specific, higher=general
        },
        "local_search": {
            "max_hops": 2,        # Graph traversal depth
        },
        "drift_search": {
            "max_hops": 3,
            "relevance_threshold": 0.5,
        },
    },
}
```

## Limitations and Future Work

### Current Limitations
1. Simplified entity extraction (regex-based)
2. Basic relationship detection
3. Single-level community hierarchy
4. No incremental graph updates

### Planned Enhancements
1. Advanced NER with Legal-BERT
2. Relation extraction using NLP
3. Multi-level hierarchical communities
4. Incremental graph construction
5. Graph visualization tools
6. Performance optimization

## References

- [Microsoft GraphRAG Paper](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/)
- [GraphRAG GitHub Repository](https://github.com/microsoft/graphrag)
- [GraphRAG Documentation](https://microsoft.github.io/graphrag/)

## Support

For questions or issues:
1. Review the research document: `GRAPHRAG_RESEARCH.md`
2. Check the example implementation: `graphrag_example.py`
3. Refer to Microsoft GraphRAG documentation

## License

This implementation follows the repository's existing license.
