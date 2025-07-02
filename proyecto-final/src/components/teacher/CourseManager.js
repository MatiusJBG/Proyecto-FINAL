import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiTrendingUp, FiBook, FiClock } from 'react-icons/fi';
import './CourseManager.css';
import teacherApiService from '../../services/teacherApi';
import CourseManagementPage from './CourseManagementPage';

function CourseManager({ teacherData, teacherStats }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showCourseManagement, setShowCourseManagement] = useState(false);

  // Cargar cursos del profesor
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const coursesData = await teacherApiService.getTeacherCourses(teacherData.id);
        const formattedCourses = coursesData.map(course => 
          teacherApiService.formatCourseData(course)
        );
        
        setCourses(formattedCourses);
      } catch (err) {
        console.error('Error cargando cursos:', err);
        setError('Error al cargar los cursos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (teacherData?.id) {
      loadCourses();
    }
  }, [teacherData?.id]);

  const handleViewCourseDetails = (course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
    setShowCourseManagement(false);
  };

  const handleManageCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseManagement(true);
    setShowCourseDetails(false);
  };

  const handleCloseModals = () => {
    setShowCourseDetails(false);
    setShowCourseManagement(false);
    setSelectedCourse(null);
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="course-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  // Mostrar la página de gestión si está seleccionada
  if (showCourseManagement && selectedCourse) {
    return (
      <CourseManagementPage 
        course={selectedCourse} 
        onBack={() => {
          setShowCourseManagement(false);
          setSelectedCourse(null);
        }}
      />
    );
  }

  // Mostrar error si ocurrió
  if (error) {
    return (
      <div className="course-manager">
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

  return (
    <div className="course-manager">
      <div className="course-header">
        <div className="header-left">
          <h2>Mis Cursos</h2>
          {teacherStats && (
            <div className="stats-summary">
              <span className="stat-item">
                <FiBook /> {teacherStats.courses.total} cursos total
              </span>
              <span className="stat-item">
                <FiUsers /> {teacherStats.students.total} estudiantes
              </span>
            </div>
          )}
        </div>
      </div>



      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header-card">
              <h3>{course.name}</h3>
            </div>
            
            <div className="course-description">
              <p>{course.description || 'Sin descripción'}</p>
            </div>
            
            <div className="course-stats">
              <div className="stat">
                <FiUsers />
                <span>{course.totalStudents} estudiantes</span>
              </div>
              <div className="stat">
                <FiBook />
                <span>{course.totalModules} módulos</span>
              </div>
              <div className="stat">
                <FiClock />
                <span>{course.duration}h estimadas</span>
              </div>
            </div>

            <div className="course-status">
              <span className={`status-badge ${course.status}`}>
                {course.status === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="course-actions-bottom">
              <button 
                className="btn-primary"
                onClick={() => handleViewCourseDetails(course)}
              >
                Ver Detalles
              </button>
              <button 
                className="btn-secondary"
                onClick={() => handleManageCourse(course)}
              >
                Gestionar
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No tienes cursos disponibles</h3>
          <p>Los cursos se cargan automáticamente desde la base de datos</p>
        </div>
      )}

      {/* Modal de Detalles del Curso */}
      {showCourseDetails && selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Curso</h3>
              <button className="modal-close" onClick={handleCloseModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="course-details">
                <h4>{selectedCourse.name}</h4>
                <p className="course-description-text">{selectedCourse.description || 'Sin descripción'}</p>
                
                <div className="course-stats-details">
                  <div className="stat-detail">
                    <FiUsers />
                    <span>{selectedCourse.totalStudents} estudiantes matriculados</span>
                  </div>
                  <div className="stat-detail">
                    <FiBook />
                    <span>{selectedCourse.totalModules} módulos</span>
                  </div>
                  <div className="stat-detail">
                    <FiClock />
                    <span>{selectedCourse.duration} horas estimadas</span>
                  </div>
                  <div className="stat-detail">
                    <span className={`status-badge ${selectedCourse.status}`}>
                      {selectedCourse.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {selectedCourse.createdAt && (
                  <div className="course-date">
                    <strong>Fecha de creación:</strong> {new Date(selectedCourse.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default CourseManager; 