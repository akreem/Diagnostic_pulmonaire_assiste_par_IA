import os

import pytest

os.environ["DATABASE_URL"] = os.environ.get("PYTEST_DATABASE_URL", "sqlite:///./.pytest.db")

from app.db.base import Base
from app.db.session import engine


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
