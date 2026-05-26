import fitz
from google import genai
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

def generate_summary(text):
    """Placeholder — AI summary disabled until quota resets."""
    word_count = len(text.split())
    char_count = len(text)
    return f"Document contains approximately {word_count} words. AI summary will be generated when quota is available."

# def generate_summary(text):
#     """Generate an AI summary using Google Gemini."""
#     try:
#         client = genai.Client(api_key=settings.GOOGLE_API_KEY)
#         prompt = f"""Summarize the following document clearly and concisely.
# Structure your summary as:
# 1. Main Topic (1 sentence)
# 2. Key Points (3-5 bullet points)
# 3. Conclusion (1-2 sentences)
# Document:
# {text[:8000]}"""
        
#         response = client.models.generate_content(
#             model='gemini-2.0-flash-lite',
#             contents=prompt
#         )
#         return response.text
#     except Exception as e:
#         print(f"Summary generation error: {e}")
#         return ""