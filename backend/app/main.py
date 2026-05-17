from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from contextlib import asynccontextmanager

from .database import get_db, engine
from .models import Base
from .routers import venues, rerouting, admin, auth, heatmap, alerts
from .services.tasks import start_cleaner_task, stop_cleaner_task

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear automáticamente las tablas si no existen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Iniciar la tarea de limpieza en segundo plano (cada 10 min = 600s)
    start_cleaner_task(600)
    
    yield
    
    # Detener la tarea al cerrar la aplicación
    stop_cleaner_task()

app = FastAPI(
    title="OffPeak API", 
    description="Sistema de gestión de afluencia para Smart City - Cali",
    version="2.0.0",
    lifespan=lifespan,
)

# Configuración de CORS optimizada
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://offpeak-seven.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers con etiquetas para Swagger (SCRUM-62: Documentación)
app.include_router(venues.router, prefix="/api/v1/venues", tags=["Venues"])
app.include_router(rerouting.router, prefix="/api/v1/rerouting", tags=["Inteligencia de Rutas"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Administración"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(heatmap.router, prefix="/api/v1/heatmap", tags=["Heatmap"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])

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

from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Error global detectado: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Ha ocurrido un error interno en el servidor", "error": str(exc)},
    )