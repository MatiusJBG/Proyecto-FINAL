import React from 'react';
import { FiTrendingUp, FiBook, FiAward, FiClock } from 'react-icons/fi';
import './CourseProgress.css';

export default function CourseProgress({ progress, estadisticas = {} }) {
  const safeProgress = Math.min(progress, 100);

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getProgressText = (progress) => {
    if (progress >= 80) return 'Excelente';
    if (progress >= 60) return 'Bueno';
    if (progress >= 40) return 'Regular';
    return 'Necesita mejorar';
  };

  return (
    <div className="course-progress">
      <div className="progress-header">
        <h3>Progreso del Curso</h3>
        <div className="progress-percentage">
          <span className="percentage">{Math.round(safeProgress)}%</span>
          <span className="status">{getProgressText(safeProgress)}</span>
        </div>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${safeProgress}%`,
            backgroundColor: getProgressColor(safeProgress)
          }}
        />
      </div>
      
      <div className="progress-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <FiBook />
          </div>
          <div className="stat-content">
            <span className="stat-value">{estadisticas.lecciones_completadas || 0}</span>
            <span className="stat-label">Lecciones completadas</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FiAward />
          </div>
          <div className="stat-content">
            <span className="stat-value">{estadisticas.evaluaciones_aprobadas || 0}</span>
            <span className="stat-label">Evaluaciones aprobadas</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-value">{Math.round(estadisticas.promedio_puntajes || 0)}%</span>
            <span className="stat-label">Promedio de puntajes</span>
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-value">{estadisticas.total_cursos || 0}</span>
            <span className="stat-label">Cursos matriculados</span>
          </div>
        </div>
      </div>
      
      <div className="progress-details">
        <div className="detail-item">
          <span className="detail-label">Evaluaciones realizadas:</span>
          <span className="detail-value">{estadisticas.evaluaciones_realizadas || 0}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Progreso promedio:</span>
          <span className="detail-value">{Math.round(estadisticas.promedio_progreso || 0)}%</span>
        </div>
      </div>
    </div>
  );
} 