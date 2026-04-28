// Datos Simulados Para Mapa (Marcadores de Venues)
export const venuesMapMock = [
  { id: 1, name: 'Bulevar del Rio', coords: [3.4516, -76.5320], status: 'critical' },
  { id: 2, name: 'Terminal de Transportes', coords: [3.4682, -76.5255], status: 'critical' },
  { id: 3, name: 'Jardín Plaza', coords: [3.3768, -76.5284], status: 'moderate' },
  { id: 4, name: 'Estación Universidades', coords: [3.3735, -76.5305], status: 'optimal' },
];

export const parkingMock = [
  { id: 101, name: 'Parqueadero Bulevar', coords: [3.4520, -76.5315], status: 'optimal' },
  { id: 102, name: 'Parqueadero Terminal', coords: [3.4685, -76.5260], status: 'moderate' },
  { id: 103, name: 'Parqueadero Jardín Sur', coords: [3.3770, -76.5290], status: 'optimal' },
];

export const mioMock = [
  { id: 201, name: 'Estación Ermita', coords: [3.4510, -76.5330] },
  { id: 202, name: 'Estación Terminal', coords: [3.4675, -76.5250] },
  { id: 203, name: 'Estación Universidades Sur', coords: [3.3750, -76.5295] },
];

export const dailyChartData = [
  { time: '06 AM', value: 15 },
  { time: '09 AM', value: 25 },
  { time: '12 PM', value: 45 },
  { time: '03 PM', value: 60 },
  { time: '06 PM', value: 92 },
  { time: '09 PM', value: 80 },
  { time: '11 PM', value: 40 },
];

export const zoneData = {
  nombre: "Bulevar del Rio",
  comuna: "Comuna 3 - Centro Histórico",
  estado: "CRÍTICO",
  afluenciaActual: 78,
  afluenciaPico: 92,
  horaRiesgo: "5:00 PM"
};
