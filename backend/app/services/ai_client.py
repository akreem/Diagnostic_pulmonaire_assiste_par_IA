import httpx
import logging
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
                    logger.error("AI Service error: %s", response.text)
                    raise AIServiceError(
                        "Le service d'analyse IA est indisponible pour le moment. "
                        "L'image a ete importee, mais l'analyse automatique doit etre relancee."
                    )
                    
                return response.json()
        except AIServiceError:
            raise
        except (httpx.RequestError, httpx.TimeoutException) as e:
            logger.error("Failed to connect to AI Service at %s: %s", self.base_url, str(e))
            raise AIServiceError(
                "Connexion au modele IA impossible. L'image est conservee, "
                "mais aucun diagnostic automatique n'a ete produit."
            ) from e
        except Exception as e:
            logger.exception("Unexpected error in AI Client")
            raise AIServiceError(
                "Erreur inattendue pendant l'analyse IA. L'image est conservee "
                "et peut etre reanalysee plus tard."
            ) from e

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
