import React from 'react';
import './AdminTabs.css';

function AdminTabs({ active, setActive }) {
  const tabs = [
    { key: 'contenido', label: 'Contenido' },
    { key: 'materiales', label: 'Materiales' },
    { key: 'evaluaciones', label: 'Evaluaciones' },
    { key: 'crearusuario', label: 'Crear Alumno' },
    { key: 'creardocente', label: 'Crear Docente' },
    { key: 'recomendaciones', label: 'Recomendaciones' },
    { key: 'gestionusuarios', label: 'Gestión de Usuarios' },
    { key: 'grafos', label: 'Grafos' },
    { key: 'estadisticas', label: 'Estadísticas' },
  ];
  return (
    <nav className="admin-tabs">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={active === tab.key ? 'active' : ''}
          onClick={() => setActive(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default AdminTabs;
