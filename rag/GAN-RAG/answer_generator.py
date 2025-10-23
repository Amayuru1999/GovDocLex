from langchain_community.chat_models import ChatOpenAI
from langchain_core.prompts import PromptTemplate


def generate_sub_answer(question, docs):
    if not docs:
        return "No relevant information found."
    llm = ChatOpenAI(temperature=0)
    prompt_template = """
You are an expert legal assistant. Use the provided legal documents to answer the question accurately. Ignore unnecessary information.

Question: {question}

Documents:
{context}

Answer based solely on the documents, citing specific sections where relevant. Keep it concise.
"""
    context_text = "\n---\n".join([f"Source: {doc.metadata.get('source', 'Unknown')}\n{doc.page_content}" for doc in docs])
    formatted = prompt_template.format(question=question, context=context_text)
    return llm.invoke(formatted).content
