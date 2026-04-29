import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt

# Cargar las variables de entorno
load_dotenv()

# ─────────────────────────────
# CONFIGURACIÓN DE SEGURIDAD
# ─────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "hUanKuLCWeBSco9Hig4qanGi")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt