import React from 'react';
import { FiTrendingUp, FiUsers, FiBook, FiBarChart2 } from 'react-icons/fi';
import './AnalyticsPanel.css';

function AnalyticsPanel({ teacherData }) {
  // Datos simulados para las analíticas
  const analyticsData = {
    totalStudents: 55,
    totalCourses: teacherData.courses.length,
    averageGrade: 78.5,
    completionRate: 82.3,
    monthlyStats: [
      { month: 'Ene', students: 45, grades: 78 },
      { month: 'Feb', students: 52, grades: 81 },
      { month: 'Mar', students: 48, grades: 79 },
      { month: 'Abr', students: 55, grades: 83 },
      { month: 'May', students: 58, grades: 85 },
      { month: 'Jun', students: 55, grades: 78 }
    ]
  };

  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <h2>Analíticas y Reportes</h2>
        <p>Resumen del rendimiento académico</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.totalStudents}</h3>
            <p>Total Estudiantes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiBook />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.totalCourses}</h3>
            <p>Cursos Activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiBarChart2 />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.averageGrade}%</h3>
            <p>Promedio General</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <h3>{analyticsData.completionRate}%</h3>
            <p>Tasa de Finalización</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h3>Progreso Mensual</h3>
          <div className="chart">
            <div className="chart-bars">
              {analyticsData.monthlyStats.map((stat, index) => (
                <div key={index} className="chart-bar-group">
                  <div className="chart-bar">
                    <div 
                      className="bar-fill students"
                      style={{ height: `${(stat.students / 60) * 100}%` }}
                    ></div>
                  </div>
                  <div className="chart-bar">
                    <div 
                      className="bar-fill grades"
                      style={{ height: `${stat.grades}%` }}
                    ></div>
                  </div>
                  <span className="bar-label">{stat.month}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color students"></div>
                <span>Estudiantes</span>
              </div>
              <div className="legend-item">
                <div className="legend-color grades"></div>
                <span>Calificaciones (%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="course-performance">
          <h3>Rendimiento por Curso</h3>
          <div className="course-stats">
            {teacherData.courses.map(course => (
              <div key={course.id} className="course-stat">
                <div className="course-info">
                  <h4>{course.name}</h4>
                  <p>{course.students} estudiantes</p>
                </div>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>Insights y Recomendaciones</h3>
        <div className="insights-grid">
          <div className="insight-card positive">
            <h4>🎉 Buen Progreso</h4>
            <p>El 85% de los estudiantes han completado más del 70% de sus cursos.</p>
          </div>
          <div className="insight-card warning">
            <h4>⚠️ Atención Requerida</h4>
            <p>3 estudiantes necesitan apoyo adicional en Matemáticas Avanzadas.</p>
          </div>
          <div className="insight-card info">
            <h4>📈 Tendencia Positiva</h4>
            <p>Las calificaciones han mejorado un 12% este semestre.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPanel; 