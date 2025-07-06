import React, { useState, useEffect } from 'react';
import { FiSearch, FiBook, FiUser, FiClock, FiChevronDown, FiChevronRight, FiEye } from 'react-icons/fi';
import './TeacherCoursesExplorer.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function TeacherCoursesExplorer({ userData }) {
  const [profesores, setProfesores] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [cursosProfesor, setCursosProfesor] = useState([]);
  const [modulosCurso, setModulosCurso] = useState({});
  const [cursosExpandidos, setCursosExpandidos] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busquedaProfesor, setBusquedaProfesor] = useState('');

  useEffect(() => {
    cargarProfesores();
  }, []);

  const cargarProfesores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/profesores`);
      if (!response.ok) throw new Error('Error al cargar profesores');
      
      const profesoresData = await response.json();
      setProfesores(profesoresData);
    } catch (error) {
      console.error('Error cargando profesores:', error);
      setError('Error al cargar la lista de profesores');
    } finally {
      setLoading(false);
    }
  };

  const cargarCursosProfesor = async (profesorId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/profesor/${profesorId}/cursos`);
      if (!response.ok) throw new Error('Error al cargar cursos del profesor');
      
      const cursosData = await response.json();
      setCursosProfesor(cursosData);
      setCursosExpandidos(new Set());
      setModulosCurso({});
    } catch (error) {
      console.error('Error cargando cursos:', error);
      setError('Error al cargar los cursos del profesor');
    } finally {
      setLoading(false);
    }
  };

  const cargarModulosCurso = async (cursoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cursos/${cursoId}/modulos`);
      if (!response.ok) throw new Error('Error al cargar módulos');
      
      const modulosData = await response.json();
      setModulosCurso(prev => ({
        ...prev,
        [cursoId]: modulosData
      }));
    } catch (error) {
      console.error('Error cargando módulos:', error);
      setError('Error al cargar los módulos del curso');
    }
  };

  const handleProfesorSelect = (profesor) => {
    setProfesorSeleccionado(profesor);
    cargarCursosProfesor(profesor.ID_Profesor);
  };

  const toggleCurso = (cursoId) => {
    const nuevosExpandidos = new Set(cursosExpandidos);
    
    if (nuevosExpandidos.has(cursoId)) {
      nuevosExpandidos.delete(cursoId);
    } else {
      nuevosExpandidos.add(cursoId);
      // Cargar módulos si no están cargados
      if (!modulosCurso[cursoId]) {
        cargarModulosCurso(cursoId);
      }
    }
    
    setCursosExpandidos(nuevosExpandidos);
  };

  const filtrarProfesores = () => {
    if (!busquedaProfesor.trim()) return profesores;
    
    return profesores.filter(profesor =>
      profesor.Nombre.toLowerCase().includes(busquedaProfesor.toLowerCase()) ||
      profesor.Especialidad.toLowerCase().includes(busquedaProfesor.toLowerCase())
    );
  };

  const profesoresFiltrados = filtrarProfesores();

  if (loading && !profesores.length) {
    return (
      <div className="teacher-courses-explorer">
        <div className="explorer-header">
          <h3>Explorar Cursos por Profesor</h3>
        </div>
        <div className="loading">Cargando profesores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-courses-explorer">
        <div className="explorer-header">
          <h3>Explorar Cursos por Profesor</h3>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="teacher-courses-explorer">
      <div className="explorer-header">
        <h3>Explorar Cursos por Profesor</h3>
        <p>Descubre los cursos disponibles organizados por profesor</p>
      </div>

      {/* Búsqueda de profesores */}
      <div className="professor-search">
        <div className="search-input">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar profesor por nombre o especialidad..."
            value={busquedaProfesor}
            onChange={(e) => setBusquedaProfesor(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de profesores */}
      <div className="professors-section">
        <h4>Profesores Disponibles</h4>
        <div className="professors-grid">
          {profesoresFiltrados.length === 0 ? (
            <div className="no-professors">
              <p>No se encontraron profesores que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            profesoresFiltrados.map((profesor) => (
              <div
                key={profesor.ID_Profesor}
                className={`professor-card ${profesorSeleccionado?.ID_Profesor === profesor.ID_Profesor ? 'selected' : ''}`}
                onClick={() => handleProfesorSelect(profesor)}
              >
                <div className="professor-avatar">
                  <FiUser />
                </div>
                <div className="professor-info">
                  <h5>{profesor.Nombre}</h5>
                  <p className="professor-specialty">{profesor.Especialidad}</p>
                  <p className="professor-email">{profesor.Correo_electronico}</p>
                </div>
                <div className="professor-action">
                  <FiEye />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cursos del profesor seleccionado */}
      {profesorSeleccionado && (
        <div className="courses-section">
          <div className="section-header">
            <h4>Cursos de {profesorSeleccionado.Nombre}</h4>
            {loading && <span className="loading-indicator">Cargando...</span>}
          </div>
          
          {cursosProfesor.length === 0 ? (
            <div className="no-courses">
              <p>Este profesor no tiene cursos disponibles en este momento.</p>
            </div>
          ) : (
            <div className="courses-list">
              {cursosProfesor.map((curso) => (
                <div key={curso.ID_Curso} className="course-item">
                  <div 
                    className="course-header"
                    onClick={() => toggleCurso(curso.ID_Curso)}
                  >
                    <div className="course-info">
                      <div className="course-icon">
                        <FiBook />
                      </div>
                      <div className="course-details">
                        <h5>{curso.Nombre}</h5>
                        <p className="course-description">
                          {curso.Descripcion || 'Sin descripción disponible'}
                        </p>
                        <div className="course-meta">
                          {curso.Duracion_estimada && (
                            <span className="course-duration">
                              <FiClock /> {curso.Duracion_estimada} horas
                            </span>
                          )}
                          <span className={`course-status ${curso.Estado || 'activo'}`}>
                            {curso.Estado || 'Activo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="course-toggle">
                      {cursosExpandidos.has(curso.ID_Curso) ? <FiChevronDown /> : <FiChevronRight />}
                    </div>
                  </div>
                  
                  {/* Módulos del curso */}
                  {cursosExpandidos.has(curso.ID_Curso) && (
                    <div className="modules-container">
                      {modulosCurso[curso.ID_Curso] ? (
                        modulosCurso[curso.ID_Curso].length > 0 ? (
                          <div className="modules-list">
                            {modulosCurso[curso.ID_Curso].map((modulo) => (
                              <div key={modulo.ID_Modulo} className="module-item">
                                <div className="module-info">
                                  <h6>Módulo {modulo.Orden}: {modulo.Nombre}</h6>
                                  <p className="module-description">
                                    {modulo.Descripcion || 'Sin descripción'}
                                  </p>
                                  <div className="module-meta">
                                    {modulo.Duracion_estimada && (
                                      <span className="module-duration">
                                        <FiClock /> {modulo.Duracion_estimada} min
                                      </span>
                                    )}
                                    {modulo.lecciones && (
                                      <span className="module-lessons">
                                        {modulo.lecciones.length} lecciones
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-modules">
                            <p>Este curso no tiene módulos disponibles.</p>
                          </div>
                        )
                      ) : (
                        <div className="loading-modules">
                          <p>Cargando módulos...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 