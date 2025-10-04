"""
GraphRAG Configuration
Settings and parameters for Microsoft GraphRAG implementation
"""

# GraphRAG Settings
GRAPHRAG_CONFIG = {
    # Graph Construction
    "entity_extraction": {
        "model": "nlpaueb/legal-bert-base-uncased",
        "entity_types": [
            "ACT",
            "SECTION",
            "ARTICLE", 
            "AUTHORITY",
            "PENALTY",
            "REQUIREMENT",
            "DATE",
            "AMENDMENT"
        ],
        "max_gleanings": 1,  # Number of entity extraction passes
    },
    
    # Community Detection
    "community_detection": {
        "algorithm": "leiden",  # or "louvain"
        "resolution": 1.0,
        "max_community_size": 50,
        "min_community_size": 3,
        "hierarchical_levels": 4,
    },
    
    # Community Summarization
    "summarization": {
        "model": "gpt-3.5-turbo",
        "max_summary_length": 500,
        "temperature": 0.3,
        "batch_size": 10,
    },
    
    # Retrieval Settings
    "retrieval": {
        "global_search": {
            "community_level": 1,  # 0=most specific, higher=more general
            "max_communities": 20,
            "temperature": 0.5,
        },
        "local_search": {
            "max_entities": 10,
            "max_hops": 2,
            "entity_text_chunks": 5,
            "temperature": 0.3,
        },
        "drift_search": {
            "max_hops": 3,
            "entities_per_hop": 5,
            "include_community_context": True,
            "relevance_threshold": 0.5,
            "temperature": 0.4,
        },
    },
    
    # Embedding Settings
    "embeddings": {
        "model": "nlpaueb/legal-bert-base-uncased",
        "dimension": 768,
        "chunk_size": 512,
        "chunk_overlap": 50,
    },
    
    # Storage
    "storage": {
        "graph_db": "networkx",  # or "neo4j" for production
        "vector_db": "chromadb",
        "persist_dir": "graphrag_storage",
    },
}

# Query Type Classification
QUERY_TYPE_PATTERNS = {
    "global": [
        r"summarize.*all",
        r"what are.*main.*themes",
        r"overview.*across",
        r"common.*patterns",
        r"general.*framework",
    ],
    "local": [
        r"what is.*section",
        r"specific.*requirement",
        r"who is responsible",
        r"penalty.*for",
        r"article.*\d+",
        r"section.*\d+",
    ],
    "drift": [
        r"how.*affect.*related",
        r"trace.*from.*to",
        r"connection between",
        r"legal chain",
        r"framework.*connecting",
    ],
}

# Legal Entity Patterns
LEGAL_ENTITY_PATTERNS = {
    "ACT": r"(?i)(?:the\s+)?(\w+(?:\s+\w+)*\s+Act(?:\s+\d{4})?)",
    "SECTION": r"(?i)section\s+(\d+[A-Z]?)",
    "ARTICLE": r"(?i)article\s+(\d+[A-Z]?)",
    "AUTHORITY": r"(?i)(\w+(?:\s+\w+)*\s+Authority)",
    "PENALTY": r"(?i)(?:fine|penalty|imprisonment)(?:\s+of)?\s+([^,\.]+)",
}

# Graph Schema
GRAPH_SCHEMA = {
    "node_types": [
        "Act",
        "Section", 
        "Article",
        "Authority",
        "Penalty",
        "Requirement",
        "Concept",
    ],
    "edge_types": [
        "CONTAINS",
        "REFERENCES",
        "AMENDS",
        "ENFORCED_BY",
        "REQUIRES",
        "IMPOSES",
        "SUPERSEDES",
        "RELATED_TO",
    ],
}
