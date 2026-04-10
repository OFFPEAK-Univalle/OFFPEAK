from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from contextlib import asynccontextmanager
from .database import get_db, engine
from .models import Base
from .routers import venues

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear automáticamente las tablas en Supabase si no existen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="OffPeak API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(venues.router, prefix="/api/v1/venues")

@app.get("/")
async def root():
    return {"message": "OffPeak API funcionando en Cali"}

@app.get("/test-db")
async def test_db(db: AsyncSession = Depends(get_db)):
    try:
        # Ejecutamos una consulta simple para verificar conexión
        await db.execute(text("SELECT 1"))
        return {"status": "Conexión a Supabase exitosa 🚀"}
    except Exception as e:
        return {"status": "Error de conexión", "details": str(e)}