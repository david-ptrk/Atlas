import fitz
from groq import Groq
from django.conf import settings

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

# def generate_summary(text):
#     """Placeholder — AI summary disabled until quota resets."""
#     word_count = len(text.split())
#     char_count = len(text)
#     return f"Document contains approximately {word_count} words. AI summary will be generated when quota is available."

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