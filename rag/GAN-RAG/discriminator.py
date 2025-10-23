from langchain_community.chat_models import ChatOpenAI
from langchain_core.prompts import PromptTemplate


def synthesize_final_answer(original_question, mini_questions, sub_answers):
    llm = ChatOpenAI(temperature=0)
    context = ""
    for mq in mini_questions:
        context += f"Mini-question: {mq}\nSub-answer: {sub_answers[mq]}\n\n"
    prompt = PromptTemplate.from_template(
        """You are a legal expert discriminator. Evaluate the sub-answers to mini-questions, extract only relevant information to the original question, discard irrelevant or low-quality parts, and synthesize a clear, comprehensive final answer. Use professional language.

Original Question: {question}

Sub-answers from mini-questions:
{context}

Final Synthesized Answer:
"""
    )
    chain = prompt | llm
    answer = chain.invoke({"question": original_question, "context": context}).content
    return answer