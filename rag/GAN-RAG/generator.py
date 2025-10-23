from langchain_community.chat_models import ChatOpenAI
from langchain_core.prompts import PromptTemplate


def generate_mini_questions(user_question, num_mini=7):
    llm = ChatOpenAI(temperature=0.5)
    prompt = PromptTemplate.from_template(
        """You are a legal question decomposer. Given a user question about Sri Lankan acts, generate exactly {num} related mini-questions that cover additional details or context to help answer the main question better.

Main question: {question}

Output only the list of mini-questions, one per line, no numbering or extra text."""
    )
    chain = prompt | llm
    response = chain.invoke({"question": user_question, "num": num_mini}).content
    mini_questions = [q.strip() for q in response.split("\n") if q.strip()]
    return mini_questions[:num_mini]  # Ensure exactly num_mini