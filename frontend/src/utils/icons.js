import L from 'leaflet';

export const createCustomIcon = (statusStr) => {
  let colorVar = 'var(--status-optimal)';
  if (statusStr === 'critical') colorVar = 'var(--status-critical)';
  if (statusStr === 'moderate') colorVar = 'var(--status-moderate)';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width: 16px; height: 16px; background-color: ${colorVar}; border-radius: 50%; border: 2px solid var(--surface-primary); box-shadow: 0 0 10px ${colorVar};"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

export const createParkingIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width: 20px; height: 20px; background-color: #3b82f6; border-radius: 4px; border: 2px solid var(--surface-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">P</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

export const createMioIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width: 20px; height: 20px; background-color: #f97316; border-radius: 50%; border: 2px solid var(--surface-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">M</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};
