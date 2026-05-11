from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from contextlib import asynccontextmanager

from .database import get_db, engine
from .models import Base
from .routers import venues, rerouting, admin, auth
from .services.tasks import start_cleaner_task, stop_cleaner_task

app = FastAPI(
    title="OffPeak API", 
    description="Sistema de gestión de afluencia para Smart City - Cali",
    version="2.0.0",
)

# Configuración de CORS optimizada
app.add_middleware(
    CORSMiddleware,
    # Reemplaza el "*" por la URL de tu frontend cuando la tengas
    # allow_origins=["https://offpeak-frontend.onrender.com"],
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers con etiquetas para Swagger (SCRUM-62: Documentación)
app.include_router(venues.router, prefix="/api/v1/venues", tags=["Venues"])
app.include_router(rerouting.router, prefix="/api/v1/rerouting", tags=["Inteligencia de Rutas"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Administración"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])

# Root endpoint con soporte para HEAD (Para el Health Check de Render)
@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"message": "OffPeak API funcionando en Cali 🇨🇴", "status": "online"}

@app.get("/test-db", tags=["Diagnóstico"])
async def test_db(db: AsyncSession = Depends(get_db)):
    """Verifica si la instancia de Neon está respondiendo."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "Conexión a base de datos Neon exitosa 🚀"}
    except Exception as e:
        return {"status": "Error de conexión", "details": str(e)}