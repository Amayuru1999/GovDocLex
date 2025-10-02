# graph_rag.py

from neo4j import GraphDatabase
import os

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "your-password")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def run_graph_rag(question: str, collections=None, max_results=5):
    """
    Query Neo4j graph for relevant context based on the user's question.
    """
    query = """
    MATCH (c:Chunk)
    WHERE c.text CONTAINS $keyword
    RETURN c.text AS chunk, c.source AS source
    LIMIT $limit
    """

    # For simplicity, just split question into first keyword
    keyword = question.split()[0] if question else ""
    results = []

    with driver.session() as session:
        res = session.run(query, keyword=keyword, limit=max_results)
        for record in res:
            results.append({
                "chunk": record["chunk"],
                "source": record["source"]
            })

    return {
        "question": question,
        "context": results,
        "answer": "Graph-based retrieval completed successfully."
    }
