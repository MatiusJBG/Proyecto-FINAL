import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiTrendingUp } from 'react-icons/fi';
import './CourseManager.css';

function CourseManager({ teacherData }) {
  const [courses, setCourses] = useState(teacherData.courses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', description: '' });

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (newCourse.name.trim()) {
      const course = {
        id: Date.now(),
        name: newCourse.name,
        description: newCourse.description,
        students: 0,
        progress: 0,
        active: true
      };
      setCourses([...courses, course]);
      setNewCourse({ name: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteCourse = (courseId) => {
    setCourses(courses.filter(course => course.id !== courseId));
  };

  return (
    <div className="course-manager">
      <div className="course-header">
        <h2>Mis Cursos</h2>
        <button 
          className="add-course-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Nuevo Curso
        </button>
      </div>

      {showAddForm && (
        <div className="add-course-form">
          <h3>Agregar Nuevo Curso</h3>
          <form onSubmit={handleAddCourse}>
            <div className="form-group">
              <label>Nombre del Curso</label>
              <input
                type="text"
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                placeholder="Ej: Matemáticas Avanzadas"
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Descripción del curso..."
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Crear Curso</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
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
            
            <div className="course-stats">
              <div className="stat">
                <FiUsers />
                <span>{course.students} estudiantes</span>
              </div>
              <div className="stat">
                <FiTrendingUp />
                <span>{course.progress}% completado</span>
              </div>
            </div>

            <div className="course-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="course-actions-bottom">
              <button className="btn-primary">Ver Detalles</button>
              <button className="btn-secondary">Gestionar</button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <p>No tienes cursos creados aún.</p>
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