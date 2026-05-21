import httpx
import logging
from fastapi import UploadFile
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIServiceError(Exception):
    pass

class AIClient:
    def __init__(self):
        self.base_url = settings.model_service_url.rstrip("/")

    async def _send_file_bytes(self, endpoint: str, filename: str, file_bytes: bytes, threshold: float = 0.5) -> dict:
        """Helper to send raw file bytes to the AI model service."""
        try:
            # We need to send it as multipart/form-data
            files = {"file": (filename, file_bytes, "image/jpeg")}
            data = {"threshold": str(threshold)} if "predict" in endpoint else {}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}{endpoint}",
                    files=files,
                    data=data,
                    timeout=30.0 # ML inference might take a moment
                )
                
                if response.status_code != 200:
                    logger.error(f"AI Service error: {response.text}")
                    raise AIServiceError(f"AI Service returned status {response.status_code}")
                    
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to AI Service at {self.base_url}: {str(e)}")
            raise AIServiceError("Could not connect to AI prediction service. Is it running?")
        except Exception as e:
            logger.error(f"Unexpected error in AI Client: {str(e)}")
            raise AIServiceError(f"AI Client error: {str(e)}")

    async def predict(self, filename: str, file_bytes: bytes, threshold: float = 0.5) -> dict:
        """
        Sends the image to the /predict endpoint for fast ONNX classification.
        """
        return await self._send_file_bytes("/predict", filename, file_bytes, threshold)

    async def get_gradcam(self, filename: str, file_bytes: bytes) -> dict:
        """
        Sends the image to the /gradcam endpoint to get the explainability heatmap.
        """
        return await self._send_file_bytes("/gradcam", filename, file_bytes)

ai_client = AIClient()
