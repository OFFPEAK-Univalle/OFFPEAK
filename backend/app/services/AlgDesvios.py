import math
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import Venue
from app.services.besttime import obtener_forecast_venue

logger = logging.getLogger(__name__)

def calcular_distancia(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula la distancia en metros entre dos coordenadas geográficas (lat/lon)
    utilizando la fórmula de Haversine.
    """
    R = 6371000  # Radio de la Tierra en metros
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


async def obtener_alternativas_desvio(
    db: AsyncSession,
    lat_origen: float,
    lon_origen: float,
    categoria_objetivo: Optional[str] = None,
    radio_metros: float = 3000.0,
    limite: int = 3
) -> List[dict]:
    """
    Smart Rerouting Algorithm:
    Dado un punto de origen (lat, lon) del ciudadano, busca lugares alternativos
    cercanos (mismo tipo/categoría) que presenten un nivel de afluencia BAJO o MEDIO.
    
    Retorna una lista ordenada de alternativas viables.
    """
    logger.info(f"Calculando desvíos para lat:{lat_origen}, lon:{lon_origen}, cat:{categoria_objetivo}")
    
    # 1. Obtener todos los venues activos de la base de datos
    query = select(Venue).where(Venue.activo == True)
    if categoria_objetivo:
        # Si el usuario va a un banco, buscar otros bancos, etc.
        query = query.where(Venue.categoria == categoria_objetivo)
        
    result = await db.execute(query)
    venues = result.scalars().all()
    
    alternativas = []
    
    # Configurar zona horaria de Colombia (UTC-5)
    colombia_tz = timezone(timedelta(hours=-5))
    ahora = datetime.now(colombia_tz)
    dia_semana_actual = ahora.weekday()  # 0=Lunes, 6=Domingo
    hora_actual = ahora.hour

    # 2. Filtrar por distancia y nivel de congestión
    for venue in venues:
        distancia = calcular_distancia(lat_origen, lon_origen, venue.latitud, venue.longitud)
        
        # Descartamos los que estén demasiado lejos
        if distancia > radio_metros:
            continue
            
        try:
            # Consultamos el pronóstico y afluencia usando el servicio existente
            # que implementa caché para evitar saturar la API de BestTime
            data = await obtener_forecast_venue(db, str(venue.id))
            
            nivel_actual = "desconocido"
            indice_afluencia = -1
            
            # Buscar el pronóstico correspondiente a la hora actual
            forecasts = data.get("forecasts", [])
            for f in forecasts:
                if f["dia_semana"] == dia_semana_actual and f["hora"] == hora_actual:
                    nivel_actual = f["nivel"]
                    indice_afluencia = f["indice_afluencia"]
                    break
            
            # Solo recomendamos si la afluencia es favorable (evitamos "alto")
            # Si es desconocido, podríamos decidir incluirlo o no. Lo incluimos con penalidad.
            if nivel_actual in ["bajo", "medio", "desconocido"]:
                alternativas.append({
                    "venue_id": str(venue.id),
                    "nombre": venue.nombre,
                    "direccion": venue.direccion,
                    "latitud": venue.latitud,
                    "longitud": venue.longitud,
                    "distancia_metros": round(distancia, 2),
                    "nivel_afluencia": nivel_actual,
                    "indice_afluencia": indice_afluencia,
                    "categoria": venue.categoria,
                    "razon_desvio": f"Afluencia {nivel_actual.upper()} a {round(distancia, 0)}m de tu ubicación."
                })
                
        except Exception as e:
            logger.warning(f"No se pudo obtener forecast para {venue.nombre}: {str(e)}")
            continue
            
    # 3. Función heurística para ordenar las mejores alternativas
    # Priorizamos: 1. Afluencia Baja, 2. Menor Distancia.
    def score_alternativa(alt):
        # Base es la distancia
        score = alt["distancia_metros"]
        
        # Penalizamos fuertemente niveles más altos
        if alt["nivel_afluencia"] == "medio":
            score += 1500  # Equivalente a preferir uno 'bajo' aunque esté 1.5km más lejos
        elif alt["nivel_afluencia"] == "desconocido":
            score += 3000
            
        return score
        
    alternativas.sort(key=score_alternativa)
    
    # Retornamos el top N de recomendaciones
    return alternativas[:limite]
