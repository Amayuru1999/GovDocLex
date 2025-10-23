import json
import os
from pathlib import Path
import torch
from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()

PERSIST_ROOT = "chroma_storage"
PROCESSED_LOG = "processed_collections.json"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="nlpaueb/legal-bert-base-uncased",
        model_kwargs={"device": DEVICE}
    )

def load_collections():
    log_path = Path(PERSIST_ROOT) / PROCESSED_LOG
    if not log_path.exists():
        raise FileNotFoundError(f"{PROCESSED_LOG} not found in {PERSIST_ROOT}")
    with open(log_path, "r") as f:
        processed = json.load(f)
    embeddings = get_embeddings()
    collections = {}
    for collection_name in processed.keys():
        collections[collection_name] = Chroma(
            persist_directory=PERSIST_ROOT,
            collection_name=collection_name,
            embedding_function=embeddings
        )
    return collections