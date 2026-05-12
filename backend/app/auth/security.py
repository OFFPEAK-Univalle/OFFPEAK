import os
import bcrypt  # <--- Usaremos este directamente
from datetime import datetime, timedelta, timezone
from typing import Optional
from dotenv import load_dotenv
from jose import jwt

# Cargar las variables de entorno
load_dotenv()

# ─────────────────────────────
# CONFIGURACIÓN DE SEGURIDAD
# ─────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "hUanKuLCWeBSco9Hig4qanGi")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

# ─────────────────────────────
# FUNCIONES DE HASHEO (Nativas con bcrypt)
# ─────────────────────────────

def get_password_hash(password: str) -> str:
    """Transforma la contraseña plana en un hash seguro para la DB."""
    # Convertimos el string a bytes para que bcrypt lo procese
    pwd_bytes = password.encode('utf-8')
    # Generamos el salt y hasheamos
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # Devolvemos como string para guardar en Neon
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara la contraseña ingresada con el hash de la DB."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

# ─────────────────────────────
# TOKENS JWT (Esto se queda igual, jose funciona bien)
# ─────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt