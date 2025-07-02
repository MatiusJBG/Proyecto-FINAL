import React from 'react';

export default function DoorIcon({ style = {}, className = '' }) {
  // Colores personalizados para distinguir el icono
  const doorColor = '#1976d2'; // azul
  const borderColor = '#0d47a1'; // azul oscuro
  const knobColor = '#ff9800'; // naranja
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      style={style}
      className={className}
    >
      <rect x="6" y="3" width="12" height="18" rx="2" fill={doorColor} fillOpacity="0.7" />
      <rect x="6" y="3" width="12" height="18" rx="2" stroke={borderColor} strokeWidth="2" />
      <circle cx="16" cy="12" r="1" fill={knobColor} />
    </svg>
  );
}
