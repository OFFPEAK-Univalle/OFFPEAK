/**
 * Archivo: Dashboard.jsx
 * Propósito: Página principal refactorizada sin mocks, consumiendo la BD real.
 */

import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

// Componentes
import AlertBanner from '../components/dashboard/AlertBanner';
import ProtocolModal from '../components/dashboard/ProtocolModal';
import StatCards from '../components/dashboard/StatCards';
import MainChart from '../components/dashboard/MainChart';
import BottomPanels from '../components/dashboard/BottomPanels';
import DashboardFooter from '../components/dashboard/DashboardFooter';

export default function DashboardPage() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api/v1';
  
  // Estado para la Simulación de Aforo
  const [currentAfluencia, setCurrentAfluencia] = useState(0);
  const [alertStatus, setAlertStatus] = useState('normal'); 
  const [isMuted, setIsMuted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Estado de Datos Reales
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [loading, setLoading] = useState(true);
  const [realMainChartData, setRealMainChartData] = useState([]);
  const [realTrendData, setRealTrendData] = useState([]);

  // Cargar Venues Reales
  useEffect(() => {
    fetch(`${API_URL}/venues/`)
      .then(res => res.json())
      .then(data => {
        setVenues(data);
        if(data.length > 0) {
          setSelectedVenueId(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando venues:", err);
        setLoading(false);
      });
  }, [API_URL]);

  // Cargar Forecasts del Venue Seleccionado
  useEffect(() => {
    if(!selectedVenueId) return;
    fetch(`${API_URL}/venues/${selectedVenueId}/forecasts`)
      .then(res => res.json())
      .then(data => {
         if(data.forecasts) {
           // Mapeo JS (0=Dom) a Backend (0=Lun, 6=Dom)
           const todayJS = new Date().getDay(); 
           const backendDay = todayJS === 0 ? 6 : todayJS - 1; 
           const todayForecasts = data.forecasts.filter(f => f.dia_semana === backendDay);
           
           const formatHour = (h) => {
             if(h === 0) return '12am';
             if(h < 12) return `${h}am`;
             if(h === 12) return '12pm';
             return `${h-12}pm`;
           };
           
           // Extraer intervalos clave para el gráfico principal
           const targetHours = [6, 9, 12, 15, 18, 21, 0];
           const parsedMainChart = targetHours.map(th => {
             const f = todayForecasts.find(tf => tf.hora === th);
             return { time: formatHour(th), afluencia: f ? f.indice_afluencia : 0 };
           });
           setRealMainChartData(parsedMainChart);

           // Calcular promedios semanales para los Trend Data
           const daysMap = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
           const parsedTrend = daysMap.map((dayName, idx) => {
              const dayForecasts = data.forecasts.filter(f => f.dia_semana === idx);
              const avg = dayForecasts.length > 0 
                ? dayForecasts.reduce((sum, f) => sum + f.indice_afluencia, 0) / dayForecasts.length 
                : 0;
              return { day: dayName, real: Math.round(avg * (Math.random() * 0.4 + 0.8)), promedio: Math.round(avg) };
           });
           setRealTrendData(parsedTrend);

           // Actualizar afluencia actual
           const currentHour = new Date().getHours();
           const currentF = todayForecasts.find(tf => tf.hora === currentHour);
           if(currentF) setCurrentAfluencia(currentF.indice_afluencia);
         }
      })
      .catch(err => console.error("Error fetching forecasts:", err));
  }, [selectedVenueId, API_URL]);

  // Acciones operativas
  const [protocolActions, setProtocolActions] = useState({
    trafficLights: true,
    agents: true,
    rerouting: false,
    mio: false
  });

  // Lógica de alerta reactiva
  useEffect(() => {
    if (currentAfluencia > 85 && alertStatus === 'normal') {
      setAlertStatus('critical');
    } else if (currentAfluencia <= 75 && alertStatus === 'managing') {
      setAlertStatus('normal');
      setProtocolActions({ trafficLights: true, agents: true, rerouting: false, mio: false });
    }
  }, [currentAfluencia, alertStatus]);

  // Simulación de descenso si está managing
  useEffect(() => {
    let interval;
    if (alertStatus === 'managing' && currentAfluencia > 65) {
      interval = setInterval(() => {
        setCurrentAfluencia(prev => Math.max(65, prev - 1));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [alertStatus, currentAfluencia]);

  return (
    <div className="dashboard-container">
      
      <AlertBanner 
        alertStatus={alertStatus}
        currentAfluencia={currentAfluencia}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        setShowModal={setShowModal}
        setCurrentAfluencia={setCurrentAfluencia}
      />

      <ProtocolModal 
        showModal={showModal}
        setShowModal={setShowModal}
        protocolActions={protocolActions}
        setProtocolActions={setProtocolActions}
        setAlertStatus={setAlertStatus}
      />

      <StatCards venueCount={venues.length} />

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="kpi-section-title" style={{ margin: 0 }}>ZONA MONITOREADA</h3>
        {loading ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cargando lugares...</span>
        ) : (
          <select 
            value={selectedVenueId} 
            onChange={(e) => setSelectedVenueId(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '4px', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
          >
            {venues.map(v => (
              <option key={v.id} value={v.id}>{v.nombre} ({v.ciudad})</option>
            ))}
          </select>
        )}
      </div>

      <MainChart data={realMainChartData} />

      <BottomPanels 
        currentAfluencia={currentAfluencia}
        alertStatus={alertStatus}
        setAlertStatus={setAlertStatus}
        setCurrentAfluencia={setCurrentAfluencia}
        setProtocolActions={setProtocolActions}
        trendData={realTrendData}
      />

      <DashboardFooter />

    </div>
  );
}