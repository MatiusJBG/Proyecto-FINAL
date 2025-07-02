import React from 'react';
import { FiUser, FiBook, FiBell, FiLogOut } from 'react-icons/fi';
import './Sidebar.css';

export default function Sidebar({ onLogout, userData }) {
  // Soportar distintos nombres de campo (Nombre, name, nombre)
  const userName = userData?.Nombre || userData?.name || userData?.nombre || 'Estudiante';
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <FiUser size={32} />
        <span>{userName}</span>
      </div>
      <nav>
        <ul>
          <li><FiBook /> Cursos</li>
          <li><FiBell /> Notificaciones</li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <FiLogOut />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
} 