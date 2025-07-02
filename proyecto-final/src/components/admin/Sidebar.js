import React from 'react';
import './Sidebar.css';

export default function Sidebar({ options = [], onSelect, selected }) {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">Opciones</div>
      <nav className="sidebar-nav">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`sidebar-link${selected === opt.value ? ' active' : ''}`}
            onClick={() => onSelect(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
