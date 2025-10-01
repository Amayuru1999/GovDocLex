
# from ask_pdf import initialize_rag_system


# qa_chain = initialize_rag_system()

# def rag_pipeline(query):
#     """Invoke RAG with a user question."""
#     if not qa_chain:
#         return "RAG system is not initialized properly."

#     try:
#         result = qa_chain.invoke({"query": query})
#         return result["result"]
#     except Exception as e:
#         return f"Error: {e}"


# rag_pipeline.py

from ask_pdf import initialize_rag_system
from graph_rag import run_graph_rag  # ✅ Import our new Neo4j-based graph query function

# Initialize the traditional RAG system
qa_chain = initialize_rag_system()

def rag_pipeline(query):
    """Invoke the standard RAG pipeline with a user question."""
    if not qa_chain:
        return "RAG system is not initialized properly."

    try:
        result = qa_chain.invoke({"query": query})
        return result["result"]
    except Exception as e:
        return f"Error: {e}"

def graph_rag_pipeline(question: str, collections: list[str] = None, max_results: int = 5):
    """
    Invoke the Graph RAG pipeline with a user question.
    This will query Neo4j for connected chunks and return results.
    """
    try:
        result = run_graph_rag(question, collections=collections, max_results=max_results)
        return result
    except Exception as e:
        return {
            "answer": "Graph RAG failed.",
            "error": str(e)
        }
