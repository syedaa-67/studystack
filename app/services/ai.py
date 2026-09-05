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



def ask_assistant(question: str, page_context: str, page_data: str) -> str:
    client = get_client()
    prompt = (
        "You are the built-in AI assistant for StudyStack, a study-group productivity app. "
        "You help users understand what they're looking at and navigate the app. "
        "The app has 4 tabs per study group: Overview (deadlines, members, group pomodoro timer), "
        "Live Dashboard (real-time presence, stats, focus trends, badges), "
        "Analytics (completion charts, member contribution charts), "
        "and Calendar (month-by-month deadline view). "
        "There's also a main Dashboard listing all the user's study groups.\n\n"
        f"The user is currently on the '{page_context}' tab.\n"
        f"Here is the relevant data currently visible on their screen:\n{page_data}\n\n"
        f"User's question: {question}\n\n"
        "Answer concisely and helpfully. If they ask about navigation, tell them exactly which tab or button to use. "
        "If they ask to explain what they're looking at, use the page data above."
    )
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )
    return response.text
