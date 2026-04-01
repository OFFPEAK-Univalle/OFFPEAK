from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from .database import get_db
from .routers import venues

app = FastAPI(title="OffPeak API")

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