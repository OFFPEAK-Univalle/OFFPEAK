/**
 * Archivo: Dashboard.jsx
 * Propósito: Página principal refactorizada.
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

// Datos Mock
import { mainChartData, trendData } from '../components/dashboard/mockData';

export default function DashboardPage() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api/v1';
  
  // Estado para la Simulación de Aforo
  const [currentAfluencia, setCurrentAfluencia] = useState(65);
  const [alertStatus, setAlertStatus] = useState('normal'); // 'normal', 'critical', 'managing'
  const [isMuted, setIsMuted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar Venues Reales
  useEffect(() => {
    fetch(`${API_URL}/venues/`)
      .then(res => res.json())
      .then(data => {
        setVenues(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando venues:", err);
        setLoading(false);
      });
  }, []);

  // Acciones operativas
  const [protocolActions, setProtocolActions] = useState({
    trafficLights: true,
    agents: true,
    rerouting: false,
    mio: false
  });

  // Lógica de alerta
  useEffect(() => {
    if (currentAfluencia > 85 && alertStatus === 'normal') {
      setAlertStatus('critical');
    } else if (currentAfluencia <= 75 && alertStatus === 'managing') {
      setAlertStatus('normal');
      setProtocolActions({ trafficLights: true, agents: true, rerouting: false, mio: false });
    }
  }, [currentAfluencia, alertStatus]);

  // Simulación de descenso gradual
  useEffect(() => {
    let interval;
    if (alertStatus === 'managing' && currentAfluencia > 65) {
      interval = setInterval(() => {
        setCurrentAfluencia(prev => Math.max(65, prev - 1));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [alertStatus, currentAfluencia]);

  // Lógica de sonido (Web Audio API)
  useEffect(() => {
    let audioCtx;
    let oscillator;
    let intervalId;

    if (alertStatus === 'critical' && !isMuted) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      const playBeep = () => {
        oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      };

      intervalId = setInterval(playBeep, 800);
      playBeep();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    };
  }, [alertStatus, isMuted]);

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

      {/* Sección de Venues Reales */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px' }}>
        <h3 className="kpi-section-title">LUGARES MONITOREADOS (REAL-TIME DB)</h3>
        {loading ? (
          <p>Cargando datos de la base de datos...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {venues.map(v => (
              <div key={v.id} style={{ padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{v.nombre}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.ciudad}</div>
                <div style={{ marginTop: '8px' }}>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    backgroundColor: v.es_techado ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255, 165, 0, 0.1)',
                    color: v.es_techado ? 'var(--accent-cyan)' : 'orange'
                  }}>
                    {v.es_techado ? 'TECHADO' : 'AIRE LIBRE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MainChart data={mainChartData} />

      <BottomPanels 
        currentAfluencia={currentAfluencia}
        alertStatus={alertStatus}
        setAlertStatus={setAlertStatus}
        setCurrentAfluencia={setCurrentAfluencia}
        setProtocolActions={setProtocolActions}
        trendData={trendData}
      />

      <DashboardFooter />

    </div>
  );
}