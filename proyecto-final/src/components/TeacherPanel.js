import React, { useState } from 'react';
import { FiUser, FiBook, FiUsers, FiFileText, FiBarChart2, FiLogOut, FiBell, FiSettings } from 'react-icons/fi';
import './TeacherPanel.css';
import TeacherTabs from './teacher/TeacherTabs';
import CourseManager from './teacher/CourseManager';
import StudentManager from './teacher/StudentManager';
import EvaluationManager from './teacher/EvaluationManager';
import GradeManager from './teacher/GradeManager';
import AnalyticsPanel from './teacher/AnalyticsPanel';

// Datos simulados para el profesor
const mockTeacherData = {
  id: 1,
  name: 'Dr. María González',
  email: 'maria.gonzalez@universidad.edu',
  department: 'Matemáticas',
  courses: [
    {
      id: 1,
      name: 'Matemáticas Avanzadas',
      students: 25,
      progress: 75,
      active: true
    },
    {
      id: 2,
      name: 'Cálculo Diferencial',
      students: 30,
      progress: 60,
      active: true
    }
  ]
};

function TeacherPanel({ onLogout, userData }) {
  const [activeTab, setActiveTab] = useState('cursos');
  const [teacherData] = useState(mockTeacherData);
  const [notifications] = useState([
    { id: 1, message: 'Nueva evaluación pendiente de revisión', type: 'evaluation' },
    { id: 2, message: 'Reunión de departamento mañana a las 10:00', type: 'meeting' }
  ]);

  return (
    <div className="teacher-panel-container">
      <aside className="teacher-sidebar">
        <div className="sidebar-header">
          <div className="teacher-profile">
            <FiUser size={40} />
            <div className="teacher-info">
              <h3>{teacherData.name}</h3>
              <p>{teacherData.department}</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <TeacherTabs active={activeTab} setActive={setActiveTab} />
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <FiLogOut /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="teacher-main">
        <header className="teacher-header">
          <div className="header-left">
            <h1>Panel de Profesor</h1>
            <p>Bienvenido, {teacherData.name}</p>
          </div>
          <div className="header-right">
            <div className="notifications">
              <FiBell size={20} />
              <span className="notification-badge">{notifications.length}</span>
            </div>
            <button className="settings-btn">
              <FiSettings size={20} />
            </button>
          </div>
        </header>

        <div className="teacher-content">
          {activeTab === 'cursos' && (
            <CourseManager teacherData={teacherData} />
          )}
          {activeTab === 'estudiantes' && (
            <StudentManager teacherData={teacherData} />
          )}
          {activeTab === 'evaluaciones' && (
            <EvaluationManager teacherData={teacherData} />
          )}
          {activeTab === 'calificaciones' && (
            <GradeManager teacherData={teacherData} />
          )}
          {activeTab === 'analiticas' && (
            <AnalyticsPanel teacherData={teacherData} />
          )}
        </div>
      </main>
    </div>
  );
}

export default TeacherPanel; 