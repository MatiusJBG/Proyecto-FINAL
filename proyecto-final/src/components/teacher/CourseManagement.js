import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiChevronDown, FiChevronRight, FiBook, FiFileText, FiCheckSquare, FiArrowLeft, FiSave } from 'react-icons/fi';
import './CourseManagement.css';
import teacherApiService from '../../services/teacherApi';
import Notification from '../Notification';

function CourseManagement({ course, onBack }) {
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
  const [notification, setNotification] = useState(null);

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

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
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
        
        // Llamada al API para crear módulo
        await teacherApiService.createModule(moduleData);
        
        // Recargar módulos
        const modulesData = await teacherApiService.getCourseModules(course.id);
        setModules(modulesData);
        
        handleCloseForms();
        showNotification('Módulo creado exitosamente');
      } catch (err) {
        console.error('Error creando módulo:', err);
        showNotification('Error al crear el módulo: ' + err.message, 'error');
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
        
        // Llamada al API para crear lección
        await teacherApiService.createLesson(lessonData);
        
        // Recargar módulos
        const modulesData = await teacherApiService.getCourseModules(course.id);
        setModules(modulesData);
        
        handleCloseForms();
        showNotification('Lección creada exitosamente');
      } catch (err) {
        console.error('Error creando lección:', err);
        showNotification('Error al crear la lección: ' + err.message, 'error');
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
        
        // Llamada al API para crear evaluación
        await teacherApiService.createEvaluation(evaluationData);
        
        // Recargar módulos
        const modulesData = await teacherApiService.getCourseModules(course.id);
        setModules(modulesData);
        
        handleCloseForms();
        showNotification('Evaluación creada exitosamente');
      } catch (err) {
        console.error('Error creando evaluación:', err);
        showNotification('Error al crear la evaluación: ' + err.message, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="course-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando estructura del curso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-management">
      {/* Header */}
      <div className="management-header">
        <button className="back-btn" onClick={onBack}>
          <FiArrowLeft /> Volver a Cursos
        </button>
        <div className="header-info">
          <h2>Gestión del Curso: {course.name}</h2>
          <p>Organiza la estructura de módulos, lecciones y evaluaciones</p>
        </div>
        <button 
          className="btn-primary"
          onClick={handleShowModuleForm}
        >
          <FiPlus /> Agregar Módulo
        </button>
      </div>

      {/* Estructura jerárquica */}
      <div className="hierarchy-container">
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
          <div className="hierarchy-tree">
            {modules.map(module => (
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
            ))}
          </div>
        )}
      </div>

      {/* Formularios */}
      {showModuleForm && (
        <div className="form-overlay" onClick={handleCloseForms}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
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
                <button type="submit" className="btn-primary">
                  <FiSave /> Crear Módulo
                </button>
                <button type="button" className="btn-secondary" onClick={handleCloseForms}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLessonForm && (
        <div className="form-overlay" onClick={handleCloseForms}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
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
                <button type="submit" className="btn-primary">
                  <FiSave /> Crear Lección
                </button>
                <button type="button" className="btn-secondary" onClick={handleCloseForms}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEvaluationForm && (
        <div className="form-overlay" onClick={handleCloseForms}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
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
                <button type="submit" className="btn-primary">
                  <FiSave /> Crear Evaluación
                </button>
                <button type="button" className="btn-secondary" onClick={handleCloseForms}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default CourseManagement; 