import os
from mistralai.async_client import MistralAsyncClient
from mistralai.models.chat_completion import ChatMessage
from shared.config import settings
from typing import List, Optional

class LLMClient:
    def __init__(self):
        api_key = settings.MISTRAL_API_KEY or os.environ.get("MISTRAL_API_KEY", "")
        self.client = MistralAsyncClient(api_key=api_key)
        
    async def chat(self, messages: List[dict], model: str = "mistral-small-latest", temperature: float = 0.7) -> str:
        """
        Send a chat completion request to Mistral AI.
        messages format: [{"role": "user", "content": "Hello"}]
        """
        formatted_messages = [
            ChatMessage(role=msg["role"], content=msg["content"])
            for msg in messages
        ]
        
        response = await self.client.chat(
            model=model,
            messages=formatted_messages,
            temperature=temperature
        )
        return response.choices[0].message.content

llm_client = LLMClient()
