import React from 'react';
import { FiBook, FiUsers, FiBarChart2, FiLogOut } from 'react-icons/fi';
import './TeacherSidebar.css';

function TeacherSidebar({ active, setActive, onLogout }) {
  const sections = [
    { key: 'courses', label: 'Cursos', icon: <FiBook /> },
    { key: 'students', label: 'Estudiantes', icon: <FiUsers /> },
    { key: 'analytics', label: 'Analíticas', icon: <FiBarChart2 /> },
  ];
  return (
    <aside className="teacher-sidebar">
      <nav>
        {sections.map(section => (
          <button
            key={section.key}
            className={`sidebar-btn${active === section.key ? ' active' : ''}`}
            onClick={() => setActive(section.key)}
          >
            {section.icon}
            <span>{section.label}</span>
          </button>
        ))}
      </nav>
      <button className="sidebar-logout" onClick={onLogout}>
        <FiLogOut /> Salir
      </button>
    </aside>
  );
}

export default TeacherSidebar;
