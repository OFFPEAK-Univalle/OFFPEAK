import os
import logging
import httpx

logger = logging.getLogger(__name__)

async def obtener_clima_actual(ciudad: str = "Cali") -> str:
    """
    Obtiene el clima actual de la ciudad especificada.
    Para pruebas E2E, se puede inyectar la variable de entorno MOCK_WEATHER.
    Ej: MOCK_WEATHER=lluvia
    """
    mock_weather = os.getenv("MOCK_WEATHER")
    if mock_weather:
        logger.info(f"Usando clima simulado (MOCK_WEATHER): {mock_weather}")
        return mock_weather.lower()
        
    # Aquí iría la integración real con una API como OpenWeatherMap
    # Por ahora devolvemos "despejado" por defecto
    logger.info(f"Clima por defecto para {ciudad}: despejado")
    return "despejado"
