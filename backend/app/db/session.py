from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from sqlalchemy.pool import NullPool

from app.core.config import settings

if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(settings.database_url, connect_args=connect_args, poolclass=NullPool)
else:
    engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

