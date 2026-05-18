import math
import asyncio
import httpx
import random
import os
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import logging
import time

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import Venue
from app.services.besttime import obtener_forecast_venue

logger = logging.getLogger(__name__)

# Caché en memoria para agrupamiento geoespacial (Sector Caching)
# Mitiga picos de solicitudes en eventos masivos (ej. salida del estadio)
_sector_cache = {}
CACHE_TTL_SECONDS = 300  # 5 minutos

def _get_from_sector_cache(key: str) -> Optional[List[dict]]:
    if key in _sector_cache:
        item, timestamp = _sector_cache[key]
        if time.time() - timestamp < CACHE_TTL_SECONDS:
            return item
        else:
            del _sector_cache[key]
    return None

def _set_to_sector_cache(key: str, value: List[dict]):
    _sector_cache[key] = (value, time.time())

async def obtener_ruta_osrm(lat1: float, lon1: float, lat2: float, lon2: float) -> Optional[Dict[str, Any]]:
    """
    Consulta la API gratuita de OSRM para obtener la distancia de conducción y el tiempo estimado.
    """
    # OSRM espera longitud,latitud
    url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            if response.status_code == 200:
                data = response.json()
                if data.get("routes") and len(data["routes"]) > 0:
                    route = data["routes"][0]
                    return {
                        "distancia_metros": route["distance"],
                        "duracion_segundos": route["duration"],
                        "geometria": route["geometry"] # Útil para que Leaflet dibuje la ruta
                    }
    except Exception as e:
        logger.warning(f"Error consultando OSRM: {e}")
    return None

async def obtener_clima(lat: float, lon: float) -> str:
    """Simulación de Clima (Reemplazable por OpenWeatherMap)"""
    # Usar clima simulado para pruebas locales hasta tener API Key
    climas = ["Despejado", "Nublado", "Lluvia Ligera", "Lluvia Fuerte"]
    pesos = [0.6, 0.25, 0.1, 0.05]
    return random.choices(climas, weights=pesos, k=1)[0]

async def obtener_incidencias(lat: float, lon: float) -> str:
    """Simulación de Incidencias de Tráfico (Reemplazable por TomTom API)"""
    incidencias = ["Ninguna", "Tráfico Pesado", "Vía Cerrada Parcialmente", "Accidente Menor"]
    pesos = [0.75, 0.15, 0.05, 0.05]
    return random.choices(incidencias, weights=pesos, k=1)[0]

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
    Smart Rerouting Algorithm con Caché Geoespacial por Sectores:
    Dado un punto de origen (lat, lon) del ciudadano, busca lugares alternativos
    cercanos (mismo tipo/categoría) que presenten un nivel de afluencia BAJO o MEDIO.
    
    Retorna una lista ordenada de alternativas viables enriquecidas (OSRM, clima, tráfico).
    """
    logger.info(f"Calculando desvíos para lat:{lat_origen}, lon:{lon_origen}, cat:{categoria_objetivo}")
    
    # Redondear coordenadas a 2 decimales para crear una "Celda/Sector" (aprox 1.1km)
    sector_key = f"{round(lat_origen, 2)}_{round(lon_origen, 2)}_{categoria_objetivo}_{radio_metros}_{limite}"
    cached_alternativas = _get_from_sector_cache(sector_key)
    
    if cached_alternativas is not None:
        logger.info(f"[Sector Cache HIT] Retornando alternativas precalculadas para el sector {sector_key}")
        return cached_alternativas

    # 1. Obtener todos los venues activos de la base de datos
    query = select(Venue).where(Venue.activo == True)
    if categoria_objetivo:
        # Si el usuario va a un banco, buscar otros bancos, etc.
        query = query.where(Venue.categoria == categoria_objetivo)
        
    result = await db.execute(query)
    venues = result.scalars().all()
    
    # Configurar zona horaria de Colombia (UTC-5)
    colombia_tz = timezone(timedelta(hours=-5))
    ahora = datetime.now(colombia_tz)
    dia_semana_actual = ahora.weekday()  # 0=Lunes, 6=Domingo
    hora_actual = ahora.hour

    # 2. Filtrar por distancia lineal primero (para no saturar OSRM)
    candidatos = []
    for venue in venues:
        distancia_lineal = calcular_distancia(lat_origen, lon_origen, venue.latitud, venue.longitud)
        if distancia_lineal <= radio_metros:
            candidatos.append((venue, distancia_lineal))
            
    # Ordenar por cercanía lineal y tomar solo los mejores N para hacer peticiones API (ej. top 5)
    candidatos.sort(key=lambda x: x[1])
    candidatos = candidatos[:5]
    
    # 3. Evaluar todos los candidatos en paralelo (OSRM, BestTime, Clima, Incidencias)
    # Primero: Obtener los forecasts secuencialmente para evitar conflictos de SQLAlchemy (AsyncSession)
    forecasts_dict = {}
    for venue, dist_lineal in candidatos:
        try:
            forecasts_dict[venue.id] = await obtener_forecast_venue(db, str(venue.id))
        except Exception:
            forecasts_dict[venue.id] = {}

    async def evaluar_candidato(venue, dist_lineal):
        try:
            # Peticiones concurrentes externas (HTTP)
            ruta_osrm, clima, incidencia = await asyncio.gather(
                obtener_ruta_osrm(lat_origen, lon_origen, venue.latitud, venue.longitud),
                obtener_clima(venue.latitud, venue.longitud),
                obtener_incidencias(venue.latitud, venue.longitud),
                return_exceptions=True
            )
            
            data_besttime = forecasts_dict.get(venue.id, {})
            
            # Verificar si hubo excepciones en gather
            if isinstance(ruta_osrm, Exception): ruta_osrm = None
            if isinstance(clima, Exception): clima = "Despejado"
            if isinstance(incidencia, Exception): incidencia = "Ninguna"

            # Parsear Afluencia
            nivel_actual = "desconocido"
            indice_afluencia = -1
            forecasts = data_besttime.get("forecasts", []) if isinstance(data_besttime, dict) else []
            for f in forecasts:
                if f["dia_semana"] == dia_semana_actual and f["hora"] == hora_actual:
                    nivel_actual = f["nivel"]
                    indice_afluencia = f["indice_afluencia"]
                    break
            
            # Determinar Distancia y Tiempo Final
            if ruta_osrm:
                dist_final = ruta_osrm["distancia_metros"]
                tiempo_segundos = ruta_osrm["duracion_segundos"]
                geometria_ruta = ruta_osrm["geometria"]
            else:
                # Fallback a Haversine si OSRM falla
                dist_final = dist_lineal
                tiempo_segundos = (dist_final / 5.0) # asume 5m/s velocidad promedio
                geometria_ruta = None

            # Calculo de Heurística (Smart Routing Score)
            # Menor score es mejor.
            # Peso base: tiempo de viaje (1 punto por segundo)
            score = tiempo_segundos
            
            # Penalidad por Afluencia en destino
            if nivel_actual == "medio":
                score += 300 # Equivalente a 5 minutos extra
            elif nivel_actual == "alto":
                score += 900 # Equivalente a 15 minutos extra
            elif nivel_actual == "desconocido":
                score += 400
                
            # Penalidad por Clima
            if clima == "Lluvia Ligera":
                score *= 1.2 # Aumenta 20%
            elif clima == "Lluvia Fuerte":
                score *= 1.5 # Aumenta 50%
                
            # Penalidad por Incidencias
            if incidencia == "Tráfico Pesado":
                score *= 1.3
            elif incidencia == "Vía Cerrada Parcialmente" or incidencia == "Accidente Menor":
                score *= 1.6
            
            minutos_viaje = round(tiempo_segundos / 60)
            
            # Armar la justificación
            razon = f"Afluencia {nivel_actual.upper()}, {minutos_viaje} min de viaje."
            if clima != "Despejado": razon += f" Clima: {clima}."
            if incidencia != "Ninguna": razon += f" Tráfico: {incidencia}."

            return {
                "venue_id": str(venue.id),
                "nombre": venue.nombre,
                "direccion": venue.direccion,
                "latitud": venue.latitud,
                "longitud": venue.longitud,
                "distancia_metros": round(dist_final, 2),
                "tiempo_viaje_minutos": minutos_viaje,
                "nivel_afluencia": nivel_actual,
                "indice_afluencia": indice_afluencia,
                "categoria": venue.categoria,
                "razon_desvio": razon,
                "clima_actual": clima,
                "incidencias_viales": incidencia,
                "score": score,
                "geometria_ruta": geometria_ruta
            }
                
        except Exception as e:
            logger.warning(f"Error procesando alternativa {venue.nombre}: {str(e)}")
            return None

    # Procesar todos los candidatos en paralelo para máxima velocidad
    tareas = [evaluar_candidato(venue, dist_lineal) for venue, dist_lineal in candidatos]
    resultados = await asyncio.gather(*tareas)
    
    # Filtrar resultados válidos
    alternativas = [r for r in resultados if r is not None]
            
    # Ordenar por el mejor score de movilidad integral
    alternativas.sort(key=lambda x: x["score"])
    
    resultado = alternativas[:limite]
    
    # Guardar en caché del sector
    _set_to_sector_cache(sector_key, resultado)
    
    # Retornamos el top N de recomendaciones
    return resultado
