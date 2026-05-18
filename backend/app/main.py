from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from contextlib import asynccontextmanager
import os
import logging
import sentry_sdk # <--- 1. Importar Sentry

from .database import get_db, engine
from .models import Base
from .routers import venues, rerouting, admin, auth, heatmap, alerts, multimodal
from .services.tasks import start_cleaner_task, stop_cleaner_task

SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        send_default_pii=True, 
        traces_sample_rate=1.0, 
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    start_cleaner_task(600)
    yield
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
    allow_origins=["https://offpeak-seven.vercel.app", "http://localhost:5173", "http://localhost:5174"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers
app.include_router(venues.router, prefix="/api/v1/venues", tags=["Venues"])
app.include_router(rerouting.router, prefix="/api/v1/rerouting", tags=["Inteligencia de Rutas"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Administración"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Autenticación"])
app.include_router(heatmap.router, prefix="/api/v1/heatmap", tags=["Heatmap"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(multimodal.router, prefix="/api/v1/multimodal", tags=["Multimodal"])

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"message": "OffPeak API funcionando en Cali 🇨🇴", "status": "online"}

@app.get("/test-db", tags=["Diagnóstico"])
async def test_db(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "Conexión a base de datos Neon exitosa 🚀"}
    except Exception as e:
        return {"status": "Error de conexión", "details": str(e)}

from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    sentry_sdk.capture_exception(exc)
    logger.error(f"Error global detectado: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Ha ocurrido un error interno en el servidor", "error": str(exc)},
    )

