# graph_utils.py
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "your-password")

driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def add_nodes_edges_to_graph(pdf_name, chunks, metadatas):
    """
    Store PDF chunks and their relationships into Neo4j.
    """
    with driver.session() as session:
        for chunk, meta in zip(chunks, metadatas):
            session.run(
                """
                MERGE (d:Document {name: $pdf_name})
                MERGE (c:Chunk {id: $chunk_id})
                SET c.text = $text,
                    c.source = $source,
                    c.page = $page
                MERGE (d)-[:HAS_CHUNK]->(c)
                """,
                pdf_name=pdf_name,
                chunk_id=meta["chunk_id"],
                text=chunk,
                source=meta["source"],
                page=meta["page"]
            )
