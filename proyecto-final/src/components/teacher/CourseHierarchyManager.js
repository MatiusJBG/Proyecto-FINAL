import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronRight, FiBook, FiFileText, FiCheckSquare } from 'react-icons/fi';
import './CourseHierarchyManager.css';
import teacherApiService from '../../services/teacherApi';

function CourseHierarchyManager({ course }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [formData, setFormData] = useState({});

  // Cargar módulos del curso
  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const modulesData = await teacherApiService.getCourseModules(course.id);
        setModules(modulesData);
      } catch (err) {
        console.error('Error cargando módulos:', err);
        setError('Error al cargar los módulos del curso.');
      } finally {
        setLoading(false);
      }
    };

    if (course?.id) {
      loadModules();
    }
  }, [course?.id]);

  // Toggle expandir/contraer elementos
  const toggleExpanded = (itemId, type) => {
    const key = `${type}-${itemId}`;
    const newExpanded = new Set(expandedItems);
    
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    
    setExpandedItems(newExpanded);
  };

  // Manejar formularios
  const handleShowModuleForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setShowModuleForm(true);
    setShowLessonForm(false);
    setShowEvaluationForm(false);
  };

  const handleShowLessonForm = (module) => {
    setSelectedModule(module);
    setFormData({ nombre: '', descripcion: '', contenido: '' });
    setShowLessonForm(true);
    setShowModuleForm(false);
    setShowEvaluationForm(false);
  };

  const handleShowEvaluationForm = (lesson) => {
    setSelectedLesson(lesson);
    setFormData({ 
      nombre: '', 
      descripcion: '', 
      puntaje_aprobacion: 70, 
      max_intentos: 3 
    });
    setShowEvaluationForm(true);
    setShowModuleForm(false);
    setShowLessonForm(false);
  };

  const handleCloseForms = () => {
    setShowModuleForm(false);
    setShowLessonForm(false);
    setShowEvaluationForm(false);
    setSelectedModule(null);
    setSelectedLesson(null);
    setFormData({});
  };

  // Crear módulo
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (formData.nombre.trim()) {
      try {
        const moduleData = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          id_curso: course.id
        };
        
        // Aquí iría la llamada al API para crear módulo
        console.log('Creando módulo:', moduleData);
        
        // Recargar módulos
        const modulesData = await teacherApiService.getCourseModules(course.id);
        setModules(modulesData);
        
        handleCloseForms();
        alert('Módulo creado exitosamente');
      } catch (err) {
        console.error('Error creando módulo:', err);
        alert('Error al crear el módulo: ' + err.message);
      }
    }
  };

  // Crear lección
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (formData.nombre.trim()) {
      try {
        const lessonData = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          contenido: formData.contenido,
          id_modulo: selectedModule.ID_Modulo
        };
        
        // Aquí iría la llamada al API para crear lección
        console.log('Creando lección:', lessonData);
        
        // Recargar módulos
        const modulesData = await teacherApiService.getCourseModules(course.id);
        setModules(modulesData);
        
        handleCloseForms();
        alert('Lección creada exitosamente');
      } catch (err) {
        console.error('Error creando lección:', err);
        alert('Error al crear la lección: ' + err.message);
      }
    }
  };

  // Crear evaluación
  const handleCreateEvaluation = async (e) => {
    e.preventDefault();
    if (formData.nombre.trim()) {
      try {
        const evaluationData = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          puntaje_aprobacion: parseInt(formData.puntaje_aprobacion),
          max_intentos: parseInt(formData.max_intentos),
          id_leccion: selectedLesson.ID_Leccion
        };
        
        // Aquí iría la llamada al API para crear evaluación
        console.log('Creando evaluación:', evaluationData);
        
        // Recargar módulos
        const modulesData = await teacherApiService.getCourseModules(course.id);
        setModules(modulesData);
        
        handleCloseForms();
        alert('Evaluación creada exitosamente');
      } catch (err) {
        console.error('Error creando evaluación:', err);
        alert('Error al crear la evaluación: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="hierarchy-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estructura del curso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hierarchy-error">
        <div className="error-icon">⚠️</div>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="course-hierarchy-manager">
      <div className="hierarchy-header">
        <h4>Estructura del Curso: {course.name}</h4>
        <button 
          className="btn-primary"
          onClick={handleShowModuleForm}
        >
          <FiPlus /> Agregar Módulo
        </button>
      </div>

      <div className="hierarchy-tree">
        {modules.length === 0 ? (
          <div className="empty-hierarchy">
            <div className="empty-icon">📚</div>
            <h3>No hay módulos en este curso</h3>
            <p>Comienza agregando el primer módulo</p>
            <button 
              className="btn-primary"
              onClick={handleShowModuleForm}
            >
              Agregar Primer Módulo
            </button>
          </div>
        ) : (
          modules.map(module => (
            <div key={module.ID_Modulo} className="hierarchy-item module-item">
              <div className="item-header">
                <button 
                  className="expand-btn"
                  onClick={() => toggleExpanded(module.ID_Modulo, 'module')}
                >
                  {expandedItems.has(`module-${module.ID_Modulo}`) ? 
                    <FiChevronDown /> : <FiChevronRight />
                  }
                </button>
                <FiBook className="item-icon" />
                <span className="item-title">{module.Nombre}</span>
                <div className="item-actions">
                  <button 
                    className="action-btn"
                    onClick={() => handleShowLessonForm(module)}
                    title="Agregar Lección"
                  >
                    <FiPlus />
                  </button>
                  <button className="action-btn" title="Editar">
                    <FiEdit />
                  </button>
                  <button className="action-btn delete" title="Eliminar">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              {expandedItems.has(`module-${module.ID_Modulo}`) && (
                <div className="item-children">
                  {module.lecciones && module.lecciones.length > 0 ? (
                    module.lecciones.map(lesson => (
                      <div key={lesson.ID_Leccion} className="hierarchy-item lesson-item">
                        <div className="item-header">
                          <button 
                            className="expand-btn"
                            onClick={() => toggleExpanded(lesson.ID_Leccion, 'lesson')}
                          >
                            {expandedItems.has(`lesson-${lesson.ID_Leccion}`) ? 
                              <FiChevronDown /> : <FiChevronRight />
                            }
                          </button>
                          <FiFileText className="item-icon" />
                          <span className="item-title">{lesson.Nombre}</span>
                          <div className="item-actions">
                            <button 
                              className="action-btn"
                              onClick={() => handleShowEvaluationForm(lesson)}
                              title="Agregar Evaluación"
                            >
                              <FiPlus />
                            </button>
                            <button className="action-btn" title="Editar">
                              <FiEdit />
                            </button>
                            <button className="action-btn delete" title="Eliminar">
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                        
                        {expandedItems.has(`lesson-${lesson.ID_Leccion}`) && (
                          <div className="item-children">
                            {lesson.evaluaciones && lesson.evaluaciones.length > 0 ? (
                              lesson.evaluaciones.map(evaluation => (
                                <div key={evaluation.ID_Evaluacion} className="hierarchy-item evaluation-item">
                                  <div className="item-header">
                                    <FiCheckSquare className="item-icon" />
                                    <span className="item-title">{evaluation.Nombre}</span>
                                    <div className="item-actions">
                                      <button className="action-btn" title="Editar">
                                        <FiEdit />
                                      </button>
                                      <button className="action-btn delete" title="Eliminar">
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="empty-children">
                                <p>No hay evaluaciones en esta lección</p>
                                <button 
                                  className="btn-secondary small"
                                  onClick={() => handleShowEvaluationForm(lesson)}
                                >
                                  <FiPlus /> Agregar Evaluación
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-children">
                      <p>No hay lecciones en este módulo</p>
                      <button 
                        className="btn-secondary small"
                        onClick={() => handleShowLessonForm(module)}
                      >
                        <FiPlus /> Agregar Lección
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Formulario para crear módulo */}
      {showModuleForm && (
        <div className="form-modal-overlay" onClick={handleCloseForms}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>Agregar Nuevo Módulo</h3>
              <button className="modal-close" onClick={handleCloseForms}>×</button>
            </div>
            <form onSubmit={handleCreateModule}>
              <div className="form-group">
                <label>Nombre del Módulo *</label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Introducción a las Matemáticas"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción del módulo..."
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Crear Módulo</button>
                <button type="button" className="btn-secondary" onClick={handleCloseForms}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulario para crear lección */}
      {showLessonForm && (
        <div className="form-modal-overlay" onClick={handleCloseForms}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>Agregar Nueva Lección</h3>
              <button className="modal-close" onClick={handleCloseForms}>×</button>
            </div>
            <form onSubmit={handleCreateLesson}>
              <div className="form-group">
                <label>Nombre de la Lección *</label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Conceptos Básicos"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción de la lección..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Contenido</label>
                <textarea
                  value={formData.contenido || ''}
                  onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                  placeholder="Contenido de la lección..."
                  rows="5"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Crear Lección</button>
                <button type="button" className="btn-secondary" onClick={handleCloseForms}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formulario para crear evaluación */}
      {showEvaluationForm && (
        <div className="form-modal-overlay" onClick={handleCloseForms}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>Agregar Nueva Evaluación</h3>
              <button className="modal-close" onClick={handleCloseForms}>×</button>
            </div>
            <form onSubmit={handleCreateEvaluation}>
              <div className="form-group">
                <label>Nombre de la Evaluación *</label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Quiz de Conceptos Básicos"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción de la evaluación..."
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Puntaje de Aprobación (%)</label>
                  <input
                    type="number"
                    value={formData.puntaje_aprobacion || 70}
                    onChange={(e) => setFormData({...formData, puntaje_aprobacion: e.target.value})}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Máximo de Intentos</label>
                  <input
                    type="number"
                    value={formData.max_intentos || 3}
                    onChange={(e) => setFormData({...formData, max_intentos: e.target.value})}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Crear Evaluación</button>
                <button type="button" className="btn-secondary" onClick={handleCloseForms}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseHierarchyManager; 