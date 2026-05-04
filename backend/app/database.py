import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()

raw_url = os.getenv("DATABASE_URL")

# 1. Limpiamos TODOS los parámetros extra de Neon cortando desde el '?'
if raw_url and "?" in raw_url:
    raw_url = raw_url.split("?")[0]

# 2. Aseguramos el prefijo correcto para el driver asíncrono
if raw_url and raw_url.startswith("postgresql://"):
    DATABASE_URL = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    DATABASE_URL = raw_url

# 3. Creamos el engine con el SSL activado de forma nativa para asyncpg
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    poolclass=NullPool,
    connect_args={
        "ssl": True
    }
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()