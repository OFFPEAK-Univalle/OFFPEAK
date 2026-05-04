from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from contextlib import asynccontextmanager

from .database import get_db, engine
from .models import Base
from .routers import venues, rerouting, admin, auth
from .services.tasks import start_cleaner_task, stop_cleaner_task

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear automáticamente las tablas en Neon (PostgreSQL) si no existen
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Iniciar la tarea de limpieza de caché en segundo plano (cada 10 min = 600s)
    start_cleaner_task(600)
    
    yield
    
    # Detener la tarea al cerrar la aplicación de forma segura
    stop_cleaner_task()

app = FastAPI(title="OffPeak API", lifespan=lifespan)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    # Cuando pases a producción, cambia el "*" por la URL de tu frontend en Vercel
    # Ejemplo: allow_origins=["https://offpeak-cali.vercel.app"]
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de los Routers
app.include_router(venues.router, prefix="/api/v1/venues")
app.include_router(rerouting.router, prefix="/api/v1/rerouting")
app.include_router(admin.router, prefix="/api/v1/admin")
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "OffPeak API funcionando en Cali 🇨🇴"}

@app.get("/test-db")
async def test_db(db: AsyncSession = Depends(get_db)):
    try:
        # Ejecutamos una consulta simple para verificar conexión con Neon
        await db.execute(text("SELECT 1"))
        return {"status": "Conexión a base de datos Neon exitosa"}
    except Exception as e:
        return {"status": "Error de conexión", "details": str(e)}