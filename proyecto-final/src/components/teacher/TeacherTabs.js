import React from 'react';
import { FiBook, FiUsers, FiFileText, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import './TeacherTabs.css';

function TeacherTabs({ active, setActive }) {
  const tabs = [
    { key: 'cursos', label: 'Mis Cursos', icon: <FiBook /> },
    { key: 'estudiantes', label: 'Estudiantes', icon: <FiUsers /> },
    { key: 'examenes', label: 'Exámenes', icon: <FiFileText /> },
    { key: 'calificaciones', label: 'Calificaciones', icon: <FiBarChart2 /> },
    { key: 'analiticas', label: 'Analíticas', icon: <FiTrendingUp /> },
  ];

  return (
    <nav className="teacher-tabs">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`teacher-tab ${active === tab.key ? 'active' : ''}`}
          onClick={() => setActive(tab.key)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default TeacherTabs; 