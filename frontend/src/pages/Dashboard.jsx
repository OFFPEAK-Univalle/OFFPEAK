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
  // Estado para la Simulación de Aforo
  const [currentAfluencia, setCurrentAfluencia] = useState(65);
  const [alertStatus, setAlertStatus] = useState('normal'); // 'normal', 'critical', 'managing'
  const [isMuted, setIsMuted] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

      <StatCards />

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