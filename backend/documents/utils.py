import fitz
from groq import Groq
from django.conf import settings
from sentence_transformers import SentenceTransformer

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
            model="llama-3.1-8b-instant",
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
{text[:4000]}"""
                }
            ],
            temperature=0.3,
            max_tokens=500,
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