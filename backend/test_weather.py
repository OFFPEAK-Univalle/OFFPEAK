import asyncio
import os
from dotenv import load_dotenv

# Cargar variables de entorno antes de importar servicios de la aplicación
load_dotenv()

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.services.AlgDesvios import obtener_alternativas_desvio
from app.database import DATABASE_URL

async def run_test():
    engine = create_async_engine(DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with SessionLocal() as db:
        print("--- PRUEBA 1: VERIFICACIÓN DE RUTA (Smart Routing Base) ---")
        # Lat/Lon aproximadas del Parque San Antonio (usar algo genérico si no hay)
        # 3.4473, -76.5401
        res_primera = await obtener_alternativas_desvio(
            db, lat_origen=3.45, lon_origen=-76.53, limite=5, radio_metros=15000.0
        )
        for r in res_primera:
            print(f"- {r['nombre']} | Razón: {r['razon_desvio']}")
        
        print("\n--- PRUEBA 2: VERIFICACIÓN DE CACHÉ (Sector Caching HIT) ---")
        # Misma ubicación para probar que el Sector Caching funciona
        res_segunda = await obtener_alternativas_desvio(
            db, lat_origen=3.45, lon_origen=-76.53, limite=5, radio_metros=15000.0
        )
        for r in res_segunda:
            print(f"- {r['nombre']} | Razón: {r['razon_desvio']}")

if __name__ == "__main__":
    asyncio.run(run_test())
