import React, { useState, useEffect } from 'react';
import { FiUser, FiBook, FiUsers, FiFileText, FiBarChart2, FiLogOut, FiBell, FiSettings } from 'react-icons/fi';
import './TeacherPanel.css';
import TeacherTabs from './teacher/TeacherTabs';
import CourseManager from './teacher/CourseManager';
import StudentManager from './teacher/StudentManager';
import EvaluationManager from './teacher/EvaluationManager';
import GradeManager from './teacher/GradeManager';
import AnalyticsPanel from './teacher/AnalyticsPanel';
import teacherApiService from '../services/teacherApi';

function TeacherPanel({ onLogout, userData }) {
  const [activeTab, setActiveTab] = useState('cursos');
  const [teacherData, setTeacherData] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del profesor al montar el componente
  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener ID del profesor desde userData o usar un ID por defecto
        const teacherId = userData?.id || 1;
        
        // Cargar información del profesor
        const teacherInfo = await teacherApiService.getTeacherInfo(teacherId);
        
        // Cargar estadísticas del profesor
        const stats = await teacherApiService.getTeacherStats(teacherId);
        
        // Formatear datos del profesor
        const formattedTeacherData = {
          id: teacherInfo.ID_Profesor,
          name: teacherInfo.Nombre,
          email: teacherInfo.Correo_electronico,
          department: teacherInfo.Especialidad,
          registrationDate: teacherInfo.Fecha_registro,
        };
        
        setTeacherData(formattedTeacherData);
        setTeacherStats(teacherApiService.formatTeacherStats(stats));
        
      } catch (err) {
        console.error('Error cargando datos del profesor:', err);
        setError('Error al cargar los datos del profesor. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadTeacherData();
  }, [userData]);

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="teacher-panel-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos del profesor...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurrió
  if (error) {
    return (
      <div className="teacher-panel-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Mostrar panel principal si los datos están cargados
  if (!teacherData) {
    return (
      <div className="teacher-panel-container">
        <div className="error-container">
          <p>No se pudieron cargar los datos del profesor.</p>
        </div>
      </div>
    );
  }

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
            <button className="settings-btn">
              <FiSettings size={20} />
            </button>
          </div>
        </header>

        <div className="teacher-content">
          {activeTab === 'cursos' && (
            <CourseManager 
              teacherData={teacherData} 
              teacherStats={teacherStats}
            />
          )}
          {activeTab === 'estudiantes' && (
            <StudentManager 
              teacherData={teacherData}
              teacherStats={teacherStats}
            />
          )}
          {activeTab === 'evaluaciones' && (
            <EvaluationManager 
              teacherData={teacherData}
              teacherStats={teacherStats}
            />
          )}
          {activeTab === 'calificaciones' && (
            <GradeManager 
              teacherData={teacherData}
              teacherStats={teacherStats}
            />
          )}
          {activeTab === 'analiticas' && (
            <AnalyticsPanel 
              teacherData={teacherData}
              teacherStats={teacherStats}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default TeacherPanel; 