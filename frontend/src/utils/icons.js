import L from 'leaflet';

const COLORS = {
  optimal: '#00e5a0',
  moderate: '#f59e0b',
  critical: '#ef4444',
  selected: '#22d3ee',
};

export const createCustomIcon = (statusStr) => {
  const color = statusStr === 'critical' ? COLORS.critical
    : statusStr === 'moderate' ? COLORS.moderate
      : statusStr === 'selected' ? COLORS.selected
        : COLORS.optimal;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      width: 16px; height: 16px;
      background-color: ${color};
      border-radius: 50%;
      border: 2px solid #ffffff;
      box-shadow: 0 0 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  });
};

export const createParkingIcon = () => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:4px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,.5)">P</div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
});

export const createMioIcon = () => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:20px;height:20px;background:#f97316;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,.5)">M</div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
});

export const createSecurityIcon = () => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:20px;height:20px;background:#1e3a8a;border-radius:4px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,.5)">S</div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
});

export const createHealthIcon = () => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:20px;height:20px;background:#ef4444;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,.5)">+</div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
});

export const createComfortIcon = () => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:20px;height:20px;background:#10b981;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,.5)">💧</div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
});

export const createIncidentIcon = () => L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:20px;height:20px;background:#000;border-radius:4px;border:2px solid #facc15;display:flex;align-items:center;justify-content:center;color:#facc15;font-size:12px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,.5)">!</div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
});