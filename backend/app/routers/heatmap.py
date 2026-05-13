from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.database import get_db
from app.models import Venue, Forecast

router = APIRouter(tags=["Heatmap"])

class HeatmapPoint(BaseModel):
    name: str
    lat: float
    lng: float
    intensity: float

@router.get("", response_model=List[HeatmapPoint])
async def get_heatmap(db: AsyncSession = Depends(get_db)):
    """
    Retorna los datos del mapa de calor para la app móvil.
    Calcula la intensidad basándose en el forecast actual si existe, 
    o devuelve un valor por defecto para que el mapa funcione.
    """
    result = await db.execute(select(Venue))
    venues = result.scalars().all()
    
    # Obtener hora y día actual para buscar el forecast
    now = datetime.now()
    current_hour = now.hour
    current_day = now.weekday() # 0 = Lunes, 6 = Domingo
    
    heatmap_data = []
    
    for venue in venues:
        # Buscar el forecast de la hora actual
        forecast_result = await db.execute(
            select(Forecast)
            .where(Forecast.venue_id == venue.id)
            .where(Forecast.dia_semana == current_day)
            .where(Forecast.hora == current_hour)
        )
        current_forecast = forecast_result.scalar_one_or_none()
        
        # Calcular intensidad: si hay forecast usar el índice (0-100) convertido a (0.0-1.0)
        # Si no hay, usar un valor simulado o por defecto (ej. 0.3)
        intensity = 0.3
        if current_forecast:
            intensity = current_forecast.indice_afluencia / 100.0
            
        heatmap_data.append({
            "name": venue.nombre,
            "lat": venue.latitud,
            "lng": venue.longitud,
            "intensity": intensity
        })
        
    return heatmap_data
