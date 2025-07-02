import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiTrendingUp, FiBook, FiClock } from 'react-icons/fi';
import './CourseManager.css';
import teacherApiService from '../../services/teacherApi';

function CourseManager({ teacherData, teacherStats }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ 
    nombre: '', 
    descripcion: '', 
    duracion_estimada: 0 
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (newCourse.nombre.trim()) {
      try {
        setSubmitting(true);
        
        const courseData = {
          nombre: newCourse.nombre,
          descripcion: newCourse.descripcion,
          duracion_estimada: parseInt(newCourse.duracion_estimada) || 0
        };
        
        const result = await teacherApiService.createCourse(teacherData.id, courseData);
        
        // Recargar la lista de cursos
        const coursesData = await teacherApiService.getTeacherCourses(teacherData.id);
        const formattedCourses = coursesData.map(course => 
          teacherApiService.formatCourseData(course)
        );
        setCourses(formattedCourses);
        
        // Limpiar formulario
        setNewCourse({ nombre: '', descripcion: '', duracion_estimada: 0 });
        setShowAddForm(false);
        
        alert('Curso creado exitosamente');
      } catch (err) {
        console.error('Error creando curso:', err);
        alert('Error al crear el curso: ' + err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      try {
        await teacherApiService.deleteCourse(courseId);
        
        // Actualizar lista local
        setCourses(courses.filter(course => course.id !== courseId));
        
        alert('Curso eliminado exitosamente');
      } catch (err) {
        console.error('Error eliminando curso:', err);
        alert('Error al eliminar el curso: ' + err.message);
      }
    }
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
        <button 
          className="add-course-btn"
          onClick={() => setShowAddForm(true)}
          disabled={submitting}
        >
          <FiPlus /> Nuevo Curso
        </button>
      </div>

      {showAddForm && (
        <div className="add-course-form">
          <h3>Agregar Nuevo Curso</h3>
          <form onSubmit={handleAddCourse}>
            <div className="form-group">
              <label>Nombre del Curso *</label>
              <input
                type="text"
                value={newCourse.nombre}
                onChange={(e) => setNewCourse({...newCourse, nombre: e.target.value})}
                placeholder="Ej: Matemáticas Avanzadas"
                required
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={newCourse.descripcion}
                onChange={(e) => setNewCourse({...newCourse, descripcion: e.target.value})}
                placeholder="Descripción del curso..."
                rows="3"
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label>Duración Estimada (horas)</label>
              <input
                type="number"
                value={newCourse.duracion_estimada}
                onChange={(e) => setNewCourse({...newCourse, duracion_estimada: e.target.value})}
                placeholder="0"
                min="0"
                disabled={submitting}
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creando...' : 'Crear Curso'}
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
                disabled={submitting}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="courses-grid">
        {courses.map(course => (
          <div key={course.id} className="course-card">
            <div className="course-header-card">
              <h3>{course.name}</h3>
              <div className="course-actions">
                <button className="action-btn">
                  <FiEdit />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
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
              <button className="btn-primary">Ver Detalles</button>
              <button className="btn-secondary">Gestionar</button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No tienes cursos creados aún</h3>
          <p>Crea tu primer curso para comenzar a enseñar</p>
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Crear tu primer curso
          </button>
        </div>
      )}
    </div>
  );
}

export default CourseManager; 