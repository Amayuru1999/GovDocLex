
# GovDocLex

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  
[![Python Version](https://img.shields.io/badge/Python-3.8%2B-blue.svg)]()  
[![Frontend](https://img.shields.io/badge/Frontend-React-green.svg)]()  
[![Backend](https://img.shields.io/badge/Backend-FastAPI-orange.svg)]()

> A legal / government document understanding and retrieval system built with LLMs, retrieval-augmented generation, and a RAG (Retrieval-Augmented Generation) architecture.

## Table of Contents

1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Architecture & Components](#architecture--components)  
4. [Getting Started](#getting-started)  
   1. [Prerequisites](#prerequisites)  
   2. [Installation](#installation)  
   3. [Configuration](#configuration)  
   4. [Running Locally](#running-locally)  
5. [Usage](#usage)  
6. [Folder Structure](#folder-structure)  
7. [Contributing](#contributing)  
8. [License](#license)  
9. [Acknowledgments / Credits](#acknowledgments--credits)  
10. [Contact / Support](#contact--support)

---

## Project Overview

**GovDocLex** is a system aimed at understanding, indexing, querying, and generating responses over legal and government documents. It combines large language models with document retrieval techniques (RAG style) to enable:

- Semantic search over statutes, policies, regulations, and legal texts  
- Natural language question-answering over document corpora  
- Summarization, explanation, or short extraction from legal documents  
- A web frontend interface for interactive document querying  

The project has both backend (API, model orchestration, indexing) and frontend (web app) components.

It’s useful for researchers, legal professionals, or government agencies who want to explore legal texts by natural language.

---

## Features

- Vector-based document embedding & retrieval  
- Integration with LLMs for question answering  
- API endpoints for querying, uploading docs, search  
- Web interface (React) to interact and visualize results  
- Modular “rag” component for retrieval + generation  
- Ability to integrate new document sets or domains  

---

## Architecture & Components

Here’s a conceptual overview:

```
User → Frontend (React) → Backend API (FastAPI)  
                 ↘  
         Document Store / Vector DB (e.g. Pinecone, Faiss)  
                 ↘  
     Embedding / Retrieval module → Candidate docs  
                 ↘  
        LLM / Generation module → Answers / outputs  
```

- **frontend/** — React app, query UI, result display  
- **backend/** — FastAPI server, routes for upload/query, orchestration  
- **rag/** — code for retrieval + generation logic, embeddings, index management  
- **.github/** — CI, workflows, etc.  
- **INTEGRATION_README.md** — details on how to integrate components  

Each module is designed to be extensible: you can replace the embedding model, or swap out the LLM provider, or change the vector database.

---

## Getting Started

### Prerequisites

- Python 3.8+  
- Node.js / npm or yarn  
- (Optional) Access to an LLM API (OpenAI, Azure, etc.)  
- (Optional) A vector store (e.g. Pinecone, FAISS, Redis + vector extension)  

### Installation

Clone the repository:

```bash
git clone https://github.com/Amayuru1999/GovDocLex.git
cd GovDocLex
```

#### Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate     # (on Windows: `venv\Scripts\activate`)
pip install -r requirements.txt
```

#### Frontend setup

```bash
cd ../frontend
npm install
# or
yarn install
```

### Configuration

- Create a `.env` file in **backend/** to specify environment variables (e.g. `OPENAI_API_KEY`, `VECTOR_DB_URL`, etc.)  
- In **frontend/**, update any config (e.g. API base URL) if necessary  
- If using an external vector DB, ensure it is running or accessible  

### Running Locally

Start backend:

```bash
cd backend
uvicorn main:app --reload
```

Start frontend:

```bash
cd ../frontend
npm start
# or
yarn start
```

Now open your browser at `http://localhost:3000` (or wherever your frontend is served).

---

## Usage

Once the system is running, you can:

1. **Upload / ingest documents** via API or frontend  
2. **Query** via natural language (e.g. “What is the procedure for X under law Y?”)  
3. **View retrieved docs** with relevance scores and snippets  
4. **Ask follow-up questions / refine**  
5. **Export responses** or summaries  

### Example API Calls (pseudo / sample)

```bash
# Upload a document
POST /api/upload
{
  "title": "Statute ABC",
  "text": "Full legal text ..."
}

# Query
POST /api/query
{
  "question": "What does Section 12 say about appeals?"
}
```

Response structure:

```json
{
  "answer": "Under Section 12, an appeal may be filed within 30 days...",
  "sources": [
    {
      "doc_id": "statute-abc",
      "score": 0.92,
      "snippet": "… appeals within 30 days …"
    }
  ]
}
```

You may refer to **INTEGRATION_README.md** in the repo for more integration details.

---

## Folder Structure

```
/
├── .github/
├── backend/
│   ├── main.py
│   ├── api/
│   ├── models/
│   ├── config.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── rag/
│   ├── embedding.py
│   ├── retrieval.py
│   ├── generation.py
│   └── index_manager.py
├── INTEGRATION_README.md
└── .gitignore
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository  
2. Create a feature branch: `git checkout -b feature/YourFeature`  
3. Commit your changes: `git commit -m "Add feature X"`  
4. Push to your fork: `git push origin feature/YourFeature`  
5. Open a Pull Request  

**Coding style / recommendations:**

- Use consistent formatting (e.g. black / eslint)  
- Write tests for new functionality  
- Document new modules / APIs in docstrings or markdown  

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments & Credits

- The core idea of **RAG** (Retrieval-Augmented Generation)  
- OpenAI / any LLM providers you use  
- Contributors:  
  - Amayuru Amarasinghe  
  - Nisal De Zoysa
  - K.D. Dilshanka Ranaweera  
  - Hiruna De Silva  
- Any open-source libraries used  

---

## Contact / Support

If you have questions or issues, feel free to:

- Open an issue in this repository  
- Contact the maintainers / authors  
