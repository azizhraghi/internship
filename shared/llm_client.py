import os
from mistralai.client import Mistral
from shared.config import settings
from typing import List, Optional

class LLMClient:
    def __init__(self):
        api_key = settings.MISTRAL_API_KEY or os.environ.get("MISTRAL_API_KEY", "")
        self.client = Mistral(api_key=api_key)
        
    async def chat(self, messages: List[dict], model: str = "mistral-small-latest", temperature: float = 0.7) -> str:
        """
        Send a chat completion request to Mistral AI.
        messages format: [{"role": "user", "content": "Hello"}]
        """
        response = await self.client.chat.complete_async(
            model=model,
            messages=messages,
            temperature=temperature
        )
        return response.choices[0].message.content

    async def generate_embeddings(self, texts: List[str], model: str = "mistral-embed") -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        response = await self.client.embeddings.create_async(
            model=model,
            inputs=texts
        )
        return [data.embedding for data in response.data]

llm_client = LLMClient()
