import React, { useState, useEffect } from 'react';
import { FiBook, FiUser, FiClock, FiPlus } from 'react-icons/fi';
import './CourseEnrollment.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function CourseEnrollment({ userData, onEnrollmentComplete }) {
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userData && userData.ID_Estudiante) {
      cargarCursosDisponibles();
    }
  }, [userData]);

  const cargarCursosDisponibles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cursos/disponibles?estudiante_id=${userData.ID_Estudiante}`);
      if (!response.ok) throw new Error('Error al cargar cursos disponibles');
      
      const cursos = await response.json();
      setCursosDisponibles(cursos);
    } catch (error) {
      console.error('Error cargando cursos disponibles:', error);
      setError('Error al cargar los cursos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const matricularseEnCurso = async (cursoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/matricula`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: userData.ID_Estudiante,
          curso_id: cursoId
        })
      });
      
      if (!response.ok) throw new Error('Error al matricularse en el curso');
      
      // Recargar cursos disponibles
      await cargarCursosDisponibles();
      
      // Notificar al componente padre
      if (onEnrollmentComplete) {
        onEnrollmentComplete();
      }
      
      alert('Matrícula exitosa');
    } catch (error) {
      console.error('Error matriculándose:', error);
      alert('Error al matricularse en el curso');
    }
  };

  if (loading) {
    return (
      <div className="course-enrollment">
        <div className="enrollment-header">
          <h3>Cursos Disponibles</h3>
        </div>
        <div className="loading">Cargando cursos disponibles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-enrollment">
        <div className="enrollment-header">
          <h3>Cursos Disponibles</h3>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="course-enrollment">
      <div className="enrollment-header">
        <h3>Cursos Disponibles</h3>
        <span className="course-count">{cursosDisponibles.length} cursos</span>
      </div>
      
      <div className="courses-grid">
        {cursosDisponibles.length === 0 ? (
          <div className="no-courses">
            <p>No hay cursos disponibles para matrícula en este momento.</p>
          </div>
        ) : (
          cursosDisponibles.map((curso) => (
            <div key={curso.ID_Curso} className="course-card">
              <div className="course-header">
                <div className="course-icon">
                  <FiBook />
                </div>
                <div className="course-info">
                  <h4>{curso.Nombre}</h4>
                  {curso.Profesor_Nombre && (
                    <p className="course-teacher">
                      <FiUser /> {curso.Profesor_Nombre}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="course-description">
                <p>{curso.Descripcion || 'Sin descripción disponible'}</p>
              </div>
              
              <div className="course-details">
                {curso.Duracion_estimada && (
                  <span className="course-duration">
                    <FiClock /> {curso.Duracion_estimada} horas
                  </span>
                )}
                <span className="course-status active">Activo</span>
              </div>
              
              <div className="course-actions">
                <button 
                  className="btn-enroll"
                  onClick={() => matricularseEnCurso(curso.ID_Curso)}
                >
                  <FiPlus /> Matricularse
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 