import React from 'react';
import { FiUser, FiBook, FiBell, FiLogOut, FiPlusSquare } from 'react-icons/fi';
import './Sidebar.css';

export default function Sidebar({ onLogout, userData, onSelectSection, activeSection }) {
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
          <li className={activeSection === 'matriculas' ? 'active' : ''} onClick={() => onSelectSection && onSelectSection('matriculas')}><FiPlusSquare /> Matrículas</li>
          <li className={activeSection === 'cursos' ? 'active' : ''} onClick={() => onSelectSection && onSelectSection('cursos')}><FiBook /> Cursos</li>
          <li className={activeSection === 'notificaciones' ? 'active' : ''} onClick={() => onSelectSection && onSelectSection('notificaciones')}><FiBell /> Notificaciones</li>
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