import logging

logger = logging.getLogger(__name__)


def send_registration_confirmation(email: str) -> None:
    logger.info("Registration confirmation email queued", extra={"email": email})

