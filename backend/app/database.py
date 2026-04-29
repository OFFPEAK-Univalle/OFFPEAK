import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./offpeak.db")

# Ajuste para SQLite: quitar pool_size y max_overflow si es sqlite
engine_kwargs = {
    "echo": True,
    "pool_pre_ping": True
}

if not DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 10,
    })

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

# Dependencia para obtener la DB en los endpoints
async def get_db():
    async with SessionLocal() as session:
        yield session