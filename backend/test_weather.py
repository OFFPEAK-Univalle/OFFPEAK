import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.services.AlgDesvios import obtener_alternativas_desvio
from app.database import DATABASE_URL

async def run_test():
    engine = create_async_engine(DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with SessionLocal() as db:
        print("--- PRUEBA: CLIMA DESPEJADO (Mock) ---")
        os.environ["MOCK_WEATHER"] = "despejado"
        # Lat/Lon aproximadas del Parque San Antonio (usar algo genérico si no hay)
        # 3.4473, -76.5401
        res_despejado = await obtener_alternativas_desvio(
            db, lat_origen=3.45, lon_origen=-76.53, limite=5, radio_metros=15000.0
        )
        for r in res_despejado:
            print(f"- {r['nombre']} | Techado? N/A | Razón: {r['razon_desvio']}")
        
        print("\n--- PRUEBA: CLIMA CON LLUVIA (Mock) ---")
        os.environ["MOCK_WEATHER"] = "lluvia"
        res_lluvia = await obtener_alternativas_desvio(
            db, lat_origen=3.45, lon_origen=-76.53, limite=5, radio_metros=15000.0
        )
        for r in res_lluvia:
            print(f"- {r['nombre']} | Razón: {r['razon_desvio']}")

if __name__ == "__main__":
    asyncio.run(run_test())
