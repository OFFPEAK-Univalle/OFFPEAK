from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.AlgDesvios import obtener_alternativas_desvio

router = APIRouter(tags=["Rerouting"])

class ReroutingRequest(BaseModel):
    latitud: float = Field(..., description="Latitud actual del usuario")
    longitud: float = Field(..., description="Longitud actual del usuario")
    categoria_objetivo: Optional[str] = Field(None, description="Categoría del lugar destino (ej. 'Centro Comercial')")
    radio_metros: float = Field(3000.0, description="Radio de búsqueda en metros")
    limite: int = Field(3, description="Número máximo de alternativas a devolver")

class AlternativaResponse(BaseModel):
    venue_id: str
    nombre: str
    direccion: Optional[str] = None
    latitud: float
    longitud: float
    distancia_metros: float
    nivel_afluencia: str
    indice_afluencia: int
    categoria: Optional[str] = None
    razon_desvio: str

@router.post("/recommend", response_model=List[AlternativaResponse])
async def recommend_detours(req: ReroutingRequest, db: AsyncSession = Depends(get_db)):
    """
    Calcula y devuelve alternativas de desvío basadas en la ubicación actual, 
    buscando establecimientos con afluencia baja o media.
    """
    try:
        alternativas = await obtener_alternativas_desvio(
            db=db,
            lat_origen=req.latitud,
            lon_origen=req.longitud,
            categoria_objetivo=req.categoria_objetivo,
            radio_metros=req.radio_metros,
            limite=req.limite
        )
        return alternativas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
