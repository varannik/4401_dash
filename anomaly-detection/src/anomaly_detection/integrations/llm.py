from typing import Dict, Any, Optional
import json
from openai import OpenAI
from ..config.settings import settings
from openai import AzureOpenAI, OpenAI

"""
LLM is a utility class to interact with OpenAI's language models for summarization.
"""

class LLM:
    #def __init__(self, *, enabled: bool = True):
        #self.model = settings.openai_model
        #self.enabled = enabled
        #if self.enabled:
        #    self.client = OpenAI(api_key=settings.openai_api_key)

    def __init__(self, *, enabled: bool = True):
        self.enabled = enabled
        if not self.enabled:
            self.model = None
            self.client = None
            return

        if not (settings.azure_openai_api_key and settings.azure_openai_endpoint and settings.azure_openai_deployment):
            raise ValueError("Azure OpenAI requires AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT.")

        self.client = AzureOpenAI(
            api_version=settings.azure_openai_api_version,
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
        )

        self.model = settings.azure_openai_deployment or settings.azure_openai_model




    def summarize(self, var: str, alarm_type: str, context: Dict[str, Any]) -> Optional[str]:
        if not self.enabled or not context:
            return None

        system_msg = (
                "You are a monitoring assistant. Convert the following alarm JSON into a clear, "
                "concise summary using plain text only. Write in simple sentences without any "
                "markdown formatting, bullet points, bold text, or special characters. "
        )
        payload = {"variable": var, "alarm_type": alarm_type, "context": context}

        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": f"Alarm JSON:\n{json.dumps(payload, ensure_ascii=False)}"}
                ],
                temperature=0.2,
                max_tokens=200,
            )
            text = (resp.choices[0].message.content or "").strip()
            return text or None
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return None