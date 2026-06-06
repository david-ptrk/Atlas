import fitz
from groq import Groq
from django.conf import settings
from sentence_transformers import SentenceTransformer
import json

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_text_from_pdf(file_path):
    """Extract raw text from a PDF file."""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def generate_embedding(text):
    """Generate a vector embedding for the given text."""
    try:
        embedding = embedding_model.encode(text[:1000])
        return embedding.tolist()
    except Exception as e:
        print(f"Embedding generation error: {e}")
        return None

def generate_summary(text):
    """Generate an AI summary using Groq."""
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a research assistant. Write clean, readable summaries. Never add colons after bullet points. Never repeat the format labels in the output."
                },
                {
                    "role": "user",
                    "content": f"""Summarize this document. Use this exact structure, no extra punctuation:

**Main Topic**
One clear sentence about what this document is about.

**Key Points**
- First key point
- Second key point
- Third key point
- Fourth key point (if needed)

**Conclusion**
One or two sentences wrapping up the main takeaway.

Document:
{text[:6000]}"""
                }
            ],
            temperature=0.3,
            max_tokens=800,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Summary generation error: {e}")
        return ""

def ask_question(document_text, highlighted_text, question):
    """Answer a question about a document or highlighted text."""
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        if highlighted_text:
            context = f"The user has highlighted this specific passage:\n\"{highlighted_text}\"\n\nFull document context:\n{document_text[:3000]}"
        else:
            context = f"Document:\n{document_text[:4000]}"
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a research assistant. Answer questions about documents clearly and concisely. Base your answers only on the provided document content."
                },
                {
                    "role": "user",
                    "content": f"{context}\n\nQuestion: {question}"
                }
            ],
            temperature=0.3,
            max_tokens=600,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Ask question error: {e}")
        return "Sorry, I could not process your question. Please try again."

def extract_metadata(text):
    """Extract citation metadata from document text using Groq."""
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a research assistant. Extract metadata from documents. Always respond with valid JSON only, no extra text."
                },
                {
                    "role": "user",
                    "content": f"""Extract the following from this document and return as JSON:
- author (string, full name or names, empty string if not found)
- publication_date (string, year or full date, empty string if not found)
- publisher (string, journal, university or organization, empty string if not found)
- title (string, document title, empty string if not found)

Document:
{text[:3000]}

Return only valid JSON like:
{{ "author": "John Smith", "publication_date": "2023", "publisher": "MIT Press", "title": "Example Title" }}"""
                }
            ],
            temperature=0.1,
            max_tokens=200,
        )
        content = response.choices[0].message.content.strip()
        content = content.replace('```json', '').replace('```', '').strip()
        return json.loads(content)
    except Exception as e:
        print(f"Metadata extraction error: {e}")
        return {}

def generate_citations(title, author, publication_date, publisher, url):
    """Generate APA, MLA, and Chicago citations."""
    author = author or "Unknown Author"
    year = publication_date or "n.d."
    publisher = publisher or ""
    title = title or "Untitled"
    
    # APA
    apa = f"{author} ({year}). {title}."
    if publisher:
        apa += f" {publisher}."
    if url:
        apa += f" Retrieved from {url}"
    
    # MLA
    mla = f'{author} "{title}."'
    if publisher:
        mla += f" {publisher},"
    mla += f" {year}."
    if url:
        mla += f" {url}."
    
    # Chicago
    chicago = f'{author}. "{title}."'
    if publisher:
        chicago += f" {publisher},"
    chicago += f" {year}."
    if url:
        chicago += f" Accessed from {url}."
    
    return {'apa': apa, 'mla': mla, 'chicago': chicago}

def research_chat(question, context):
    """Answer a question based on all relevant documents."""
    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """You are Atlas, an AI research assistant. You have access to the user's uploaded research documents.
Answer questions based on the provided document context. 
- Be specific and cite which document you're referencing
- If information spans multiple documents, connect the ideas
- If the answer isn't in the documents, say so clearly
- Be conversational but precise"""
                },
                {
                    "role": "user",
                    "content": f"""Based on my research documents, answer this question:

{question}

Context from my documents:
{context}"""
                }
            ],
            temperature=0.4,
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Research chat error: {e}")
        return "Sorry, I could not process your question. Please try again."