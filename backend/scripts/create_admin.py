import asyncio
import sys
import os

# Añadir el directorio actual al path para poder importar 'app'
sys.path.append(os.getcwd())

from app.database import engine, SessionLocal
from app.models import User
from app.auth.security import get_password_hash

async def create_admin():
    print("Creando usuario administrador de prueba...")
    async with SessionLocal() as db:
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            nombre="Administrador OffPeak",
            email="admin@offpeak.com",
            password_hash=hashed_password,
            rol="admin"
        )
        db.add(admin_user)
        try:
            await db.commit()
            print("Usuario 'admin@offpeak.com' creado con contraseña 'admin123'")
        except Exception as e:
            print(f"Error al crear el usuario (posiblemente ya existe): {e}")
            await db.rollback()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_admin())
