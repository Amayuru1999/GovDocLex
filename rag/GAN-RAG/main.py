from utils import load_collections
from generator import generate_mini_questions
from retriever import retrieve_docs
from answer_generator import generate_sub_answer
from discriminator import synthesize_final_answer

if __name__ == "__main__":
    print("Loading collections...")
    collections = load_collections()
    print(f"Loaded {len(collections)} collections.")

    while True:
        user_question = input("\nEnter your legal question (or 'exit' to quit): ").strip()
        if user_question.lower() == 'exit':
            print("Exiting GAN-RAG POC.")
            break

        print("\n=== Enhanced Generator: Creating adaptive mini-questions ===")
        mini_qs = generate_mini_questions(user_question)
        print(f"Generated {len(mini_qs)} mini-questions based on complexity analysis:")
        for i, mq in enumerate(mini_qs, 1):
            print(f"{i}. {mq}")

        print("\n=== Enhanced Retrieval: Hybrid search + Re-ranking ===")
        sub_answers = {}
        for i, q in enumerate(mini_qs, 1):
            print(f"Processing question {i}/{len(mini_qs)}: {q[:60]}...")
            docs = retrieve_docs(q, collections)
            sub_answer = generate_sub_answer(q, docs)
            sub_answers[q] = sub_answer
            print(f"Retrieved {len(docs)} documents, generated sub-answer ({len(sub_answer)} chars)")
            print(f"Preview: {sub_answer[:100]}...")  # Truncated preview

        print("\n=== Discriminator: Synthesizing final answer ===")
        final_answer = synthesize_final_answer(user_question, mini_qs, sub_answers)
        print("\nFinal Answer:")
        print(final_answer)