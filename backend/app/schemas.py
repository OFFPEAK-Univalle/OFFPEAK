from pydantic import BaseModel, UUID4, Field
from typing import Optional, List
from datetime import datetime

# ─────────────────────────────
# VENUE SCHEMAS
# ─────────────────────────────
class VenueBase(BaseModel):
    nombre: Optional[str] = Field(None, example="Centro Comercial Chipichape")
    direccion: Optional[str] = Field(None, example="Calle 38 N # 6N-35")
    categoria: Optional[str] = Field(None, example="Shopping Mall")
    latitud: Optional[float] = Field(None, example=3.4735)
    longitud: Optional[float] = Field(None, example=-76.5262)
    ciudad: str = Field("Cali", example="Cali")
    activo: bool = Field(True, example=True)

class VenueCreate(VenueBase):
    besttime_venue_id: Optional[str] = Field(None, description="ID del venue en BestTime")

class VenueUpdate(BaseModel):
    """Schema para PATCH — todos los campos son opcionales."""
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    categoria: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    ciudad: Optional[str] = None
    activo: Optional[bool] = None
    besttime_venue_id: Optional[str] = Field(None, description="ID del venue en BestTime")

class VenueResponse(VenueBase):
    id: UUID4
    besttime_venue_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────
# FORECAST SCHEMAS
# ─────────────────────────────
class ForecastBase(BaseModel):
    dia_semana: int = Field(..., description="0=Lunes, 6=Domingo")
    hora: int = Field(..., description="Hora del día (0-23)")
    indice_afluencia: int = Field(..., description="Nivel de ocupación 0-100")
    nivel: str = Field(..., description="bajo, medio, o alto")
    periodo_inicio: datetime
    obtenido_en: datetime

class ForecastResponse(ForecastBase):
    id: UUID4
    venue_id: UUID4

    class Config:
        from_attributes = True

class BestTimeForecastData(BaseModel):
    """Estructura de la respuesta enriquecida de BestTime."""
    venue_info: VenueResponse
    forecasts: List[ForecastResponse]

# ─────────────────────────────
# CACHE SCHEMAS
# ─────────────────────────────
class CacheEntryBase(BaseModel):
    venue_id: UUID4
    endpoint_key: str = Field(..., description="Clave del endpoint cacheado ej: 'forecast_week'")
    respuesta_raw: dict = Field(..., description="JSON crudo original")
    expira_en: datetime

class CacheEntryResponse(CacheEntryBase):
    id: UUID4
    creado_en: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    rol: Optional[str] = None

class UserBase(BaseModel):
    nombre: str = Field(..., example="Agente Pérez")
    email: str = Field(..., example="agente@offpeak.com")
    rol: str = Field("ciudadano", example="autoridad")

class UserCreate(UserBase):
    password: str = Field(..., example="Secreta123!")

class UserResponse(UserBase):
    id: UUID4
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ─────────────────────────────
# ALERT SCHEMAS
# ─────────────────────────────
class AlertBase(BaseModel):
    venue_id: UUID4
    tipo: str = Field(..., description="congestion_alta, congestion_media, o normalizado")
    mensaje: str = Field(..., description="Mensaje de la alerta")

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: UUID4
    usuario_id: Optional[UUID4] = None
    leida: bool
    generada_en: datetime

    class Config:
        from_attributes = True
