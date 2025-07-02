import React from 'react';
import { FiUser } from 'react-icons/fi';
import './UserHeader.css';

export default function UserHeader({ userData }) {
  // Soportar distintos nombres de campo (Nombre, name, nombre)
  const userName = userData?.Nombre || userData?.name || userData?.nombre || 'Estudiante';
  
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <h1>¡Hola, {userName}!</h1>
        <div className="user-info">
          <FiUser size={20} />
          <span>{userName}</span>
        </div>
      </div>
    </header>
  );
} 