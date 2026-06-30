from shared.llm_client import llm_client

async def summarize_article(title: str, abstract: str, language: str = "fr") -> str:
    """Generate a vulgarized summary of the article."""
    lang_prompt = "French" if language == "fr" else "English"
    prompt = f"""
    Write a short, simplified, easy-to-understand summary of this scientific article in {lang_prompt}.
    The summary is for a general audience (vulgarized).
    Keep it strictly under 3 paragraphs.
    
    Title: {title}
    Abstract: {abstract}
    """
    
    try:
        response_text = await llm_client.chat(
            messages=[{"role": "user", "content": prompt}]
        )
        return response_text
    except Exception as e:
        print(f"Error summarizing article: {e}")
        return ""
