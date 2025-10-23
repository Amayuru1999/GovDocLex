def retrieve_docs(question, collections_dict, k=5):
    """Retrieve top-k relevant documents from all Chroma collections."""
    all_docs = []
    for name, chroma in collections_dict.items():
        retriever = chroma.as_retriever(search_type="similarity", search_kwargs={"k": k})

        # Compatible with newer LangChain versions
        try:
            docs = retriever.get_relevant_documents(question)
        except AttributeError:
            docs = retriever.invoke(question)

        all_docs.extend(docs)

    # Deduplicate documents by content
    seen = set()
    unique_docs = []
    for doc in all_docs:
        if doc.page_content not in seen:
            seen.add(doc.page_content)
            unique_docs.append(doc)

    return unique_docs
