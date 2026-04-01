from pydantic import BaseModel, UUID4, Field
from typing import Optional, List
from datetime import datetime

# ─────────────────────────────
# VENUE SCHEMAS
# ─────────────────────────────
class VenueBase(BaseModel):
    nombre: str = Field(..., example="Centro Comercial Chipichape")
    direccion: Optional[str] = Field(None, example="Calle 38 N # 6N-35")
    categoria: Optional[str] = Field(None, example="Shopping Mall")
    latitud: float = Field(..., example=3.4735)
    longitud: float = Field(..., example=-76.5262)
    ciudad: str = Field("Cali", example="Cali")
    activo: bool = Field(True, example=True)

class VenueCreate(VenueBase):
    pass

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
