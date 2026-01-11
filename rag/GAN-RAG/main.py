# from utils import load_collections
# from generator import generate_mini_questions
# from retriever import retrieve_docs
# from answer_generator import generate_sub_answer
# from discriminator import synthesize_final_answer

# if __name__ == "__main__":
#     print("Loading collections...")
#     collections = load_collections()
#     print(f"Loaded {len(collections)} collections.")

#     while True:
#         user_question = input("\nEnter your legal question (or 'exit' to quit): ").strip()
#         if user_question.lower() == 'exit':
#             print("Exiting GAN-RAG POC.")
#             break

#         print("\n=== Enhanced Generator: Creating adaptive mini-questions ===")
#         mini_qs = generate_mini_questions(user_question)
#         print(f"Generated {len(mini_qs)} mini-questions based on complexity analysis:")
#         for i, mq in enumerate(mini_qs, 1):
#             print(f"{i}. {mq}")

#         print("\n=== Enhanced Retrieval: Hybrid search + Re-ranking ===")
#         sub_answers = {}
#         for i, q in enumerate(mini_qs, 1):
#             print(f"Processing question {i}/{len(mini_qs)}: {q[:60]}...")
#             docs = retrieve_docs(q, collections)
#             sub_answer = generate_sub_answer(q, docs)
#             sub_answers[q] = sub_answer
#             print(f"Retrieved {len(docs)} documents, generated sub-answer ({len(sub_answer)} chars)")
#             print(f"Preview: {sub_answer[:100]}...")  # Truncated preview

#         print("\n=== Discriminator: Synthesizing final answer ===")
#         final_answer = synthesize_final_answer(user_question, mini_qs, sub_answers)
#         print("\nFinal Answer:")
#         print(final_answer)


import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict

# Import your existing logic from your local files
from utils import load_collections
from generator import generate_mini_questions
from retriever import retrieve_docs
from answer_generator import generate_sub_answer
from discriminator import synthesize_final_answer

# 1. Initialize FastAPI
app = FastAPI(title="GAN-RAG Legal API")

# 2. Global state for collections (keeps them in memory)
COLLECTIONS = None

@app.on_event("startup")
def startup_event():
    """Load legal collections once when the server starts."""
    global COLLECTIONS
    print("--- Loading Legal Collections... ---")
    COLLECTIONS = load_collections()
    print(f"--- Loaded {len(COLLECTIONS)} collections successfully. ---")

# 3. Define the Request Schema (Data Node.js will send)
class QuestionRequest(BaseModel):
    message: str

# 4. Define the API Endpoint
@app.post("/chat")
async def ask_legal_question(payload: QuestionRequest):
    if COLLECTIONS is None:
        raise HTTPException(status_code=503, detail="System is still loading collections.")

    try:
        user_question = payload.message
        
        # --- Step 1: Generator ---
        mini_qs = generate_mini_questions(user_question)
        
        # --- Step 2: Retrieval & Sub-answering ---
        sub_answers = {}
        for q in mini_qs:
            docs = retrieve_docs(q, COLLECTIONS)
            sub_answer = generate_sub_answer(q, docs)
            sub_answers[q] = sub_answer

            print(f"Retrieved {len(docs)} documents, generated sub-answer ({len(sub_answer)} chars)")
            
        # --- Step 3: Discriminator (Synthesis) ---
        final_answer = synthesize_final_answer(user_question, mini_qs, sub_answers)
        
        # 5. Return JSON to Node.js
        return {
            "status": "success",
            "question": user_question,
            "answer": final_answer,
            "metadata": {
                "generated_queries": mini_qs,
                "sub_steps_completed": len(mini_qs)
            }
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal AI Processing Error")

# 6. Run the server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)