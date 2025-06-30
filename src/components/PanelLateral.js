import React from 'react';
import './dashboard.css';

const items = [
  { nombre: 'Inicio', icono: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12L12 3l9 9"/><path d="M9 21V9h6v12"/></svg>
  ) },
  { nombre: 'Cursos', icono: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
  ) },
  { nombre: 'Recomendaciones', icono: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
  ) },
  { nombre: 'Evaluaciones', icono: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6"/><path d="M9 13h6"/></svg>
  ) },
  { nombre: 'Perfil', icono: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/></svg>
  ) },
];

export default function PanelLateral({ activo = 'Inicio', onNavegar }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">EduPlataforma</div>
      <ul className="sidebar-list">
        {items.map((item) => (
          <li
            key={item.nombre}
            className={activo === item.nombre ? 'activo' : ''}
            onClick={() => onNavegar && onNavegar(item.nombre)}
          >
            <span className="sidebar-icon">{item.icono}</span>
            <span>{item.nombre}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
} 