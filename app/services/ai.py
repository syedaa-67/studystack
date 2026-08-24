import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

_client = None

def get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        _client = genai.Client(api_key=api_key)
    return _client


def summarize_text(content: str, title: str) -> str:
    client = get_client()
    prompt = (
        f"Summarize the following study note titled '{title}' for a student "
        f"preparing for an exam. Keep it concise (4-6 bullet points), "
        f"focused on the key concepts, and use plain text bullets starting with '- '.\n\n"
        f"{content}"
    )
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )
    return response.text

