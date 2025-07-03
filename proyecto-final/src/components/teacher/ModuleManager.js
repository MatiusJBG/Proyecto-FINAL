import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiBook, FiFileText, FiCheckSquare, FiChevronDown, FiChevronRight, FiEdit3 } from 'react-icons/fi';
import teacherApiService from '../../services/teacherApi';
import './ModuleManager.css';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';

function ModuleManager({ courseId, courseName }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateLessonForm, setShowCreateLessonForm] = useState(false);
  const [showEditLessonForm, setShowEditLessonForm] = useState(false);
  const [showCreateEvaluationForm, setShowCreateEvaluationForm] = useState(false);
  const [showEditEvaluationForm, setShowEditEvaluationForm] = useState(false);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [newModule, setNewModule] = useState({
    nombre: '',
    descripcion: '',
    duracion_estimada: 0
  });
  const [newLesson, setNewLesson] = useState({
    nombre: '',
    descripcion: '',
    contenido: '',
    duracion_estimada: 0,
    es_obligatoria: true
  });
  const [newEvaluation, setNewEvaluation] = useState({
    nombre: '',
    descripcion: '',
    puntaje_aprobacion: 70.0,
    max_intentos: 3
  });
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [activeEvaluationId, setActiveEvaluationId] = useState(null);

  // Cargar módulos del curso con lecciones y evaluaciones
  useEffect(() => {
    loadModulesWithDetails();
  }, [courseId]);

  const loadModulesWithDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener módulos con lecciones y evaluaciones
      const modulesData = await teacherApiService.getCourseModules(courseId);
      setModules(modulesData);
    } catch (err) {
      console.error('Error cargando módulos:', err);
      setError('Error al cargar los módulos del curso.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle expandir/contraer módulo
  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  // Toggle expandir/contraer lección
  const toggleLesson = (lessonId) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  // Crear módulo
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModule.nombre.trim()) {
      alert('El nombre del módulo es obligatorio');
      return;
    }

    try {
      await teacherApiService.createModule(courseId, {
        nombre: newModule.nombre.trim(),
        descripcion: newModule.descripcion.trim(),
        duracion_estimada: parseInt(newModule.duracion_estimada) || 0
      });

      // Limpiar formulario y recargar
      setNewModule({ nombre: '', descripcion: '', duracion_estimada: 0 });
      setShowCreateForm(false);
      await loadModulesWithDetails();
      alert('Módulo creado exitosamente');
    } catch (err) {
      console.error('Error creando módulo:', err);
      alert('Error al crear el módulo: ' + err.message);
    }
  };

  // Eliminar módulo
  const handleDeleteModule = async (moduleId, moduleName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el módulo "${moduleName}"?`)) {
      return;
    }

    try {
      await teacherApiService.deleteModule(moduleId);
      await loadModulesWithDetails();
      alert(`Módulo "${moduleName}" eliminado exitosamente`);
    } catch (err) {
      console.error('Error eliminando módulo:', err);
      alert('Error al eliminar el módulo: ' + err.message);
    }
  };

  // Abrir formulario para crear lección
  const handleCreateLessonClick = (moduleId) => {
    setSelectedModuleId(moduleId);
    setNewLesson({
      nombre: '',
      descripcion: '',
      contenido: '',
      duracion_estimada: 0,
      es_obligatoria: true
    });
    setShowCreateLessonForm(true);
  };

  // Crear lección
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.nombre.trim()) {
      alert('El nombre de la lección es obligatorio');
      return;
    }

    try {
      await teacherApiService.createLesson(selectedModuleId, {
        nombre: newLesson.nombre.trim(),
        descripcion: newLesson.descripcion.trim(),
        contenido: newLesson.contenido.trim(),
        duracion_estimada: parseInt(newLesson.duracion_estimada) || 0,
        es_obligatoria: newLesson.es_obligatoria
      });

      // Limpiar formulario y recargar
      setNewLesson({
        nombre: '',
        descripcion: '',
        contenido: '',
        duracion_estimada: 0,
        es_obligatoria: true
      });
      setShowCreateLessonForm(false);
      setSelectedModuleId(null);
      await loadModulesWithDetails();
      alert('Lección creada exitosamente');
    } catch (err) {
      console.error('Error creando lección:', err);
      alert('Error al crear la lección: ' + err.message);
    }
  };

  // Abrir formulario para editar lección
  const handleEditLessonClick = (lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      nombre: lesson.Nombre,
      descripcion: lesson.Descripcion || '',
      contenido: lesson.Contenido || '',
      duracion_estimada: lesson.Duracion_estimada || 0,
      es_obligatoria: lesson.Es_obligatoria
    });
    setShowEditLessonForm(true);
  };

  // Editar lección
  const handleEditLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.nombre.trim()) {
      alert('El nombre de la lección es obligatorio');
      return;
    }

    try {
      await teacherApiService.updateLesson(editingLesson.ID_Leccion, {
        nombre: newLesson.nombre.trim(),
        descripcion: newLesson.descripcion.trim(),
        contenido: newLesson.contenido.trim(),
        duracion_estimada: parseInt(newLesson.duracion_estimada) || 0,
        es_obligatoria: newLesson.es_obligatoria
      });

      // Limpiar formulario y recargar
      setNewLesson({
        nombre: '',
        descripcion: '',
        contenido: '',
        duracion_estimada: 0,
        es_obligatoria: true
      });
      setShowEditLessonForm(false);
      setEditingLesson(null);
      await loadModulesWithDetails();
      alert('Lección actualizada exitosamente');
    } catch (err) {
      console.error('Error actualizando lección:', err);
      alert('Error al actualizar la lección: ' + err.message);
    }
  };

  // Eliminar lección
  const handleDeleteLesson = async (lessonId, lessonName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la lección "${lessonName}"?`)) {
      return;
    }

    try {
      await teacherApiService.deleteLesson(lessonId);
      await loadModulesWithDetails();
      alert(`Lección "${lessonName}" eliminada exitosamente`);
    } catch (err) {
      console.error('Error eliminando lección:', err);
      alert('Error al eliminar la lección: ' + err.message);
    }
  };

  // Abrir formulario para crear evaluación
  const handleCreateEvaluationClick = (lessonId) => {
    setSelectedLessonId(lessonId);
    setNewEvaluation({
      nombre: '',
      descripcion: '',
      puntaje_aprobacion: 70.0,
      max_intentos: 3
    });
    setShowCreateEvaluationForm(true);
  };

  // Crear evaluación
  const handleCreateEvaluation = async (e) => {
    e.preventDefault();
    if (!newEvaluation.nombre.trim()) {
      alert('El nombre de la evaluación es obligatorio');
      return;
    }

    try {
      await teacherApiService.createLessonEvaluation(selectedLessonId, {
        nombre: newEvaluation.nombre.trim(),
        descripcion: newEvaluation.descripcion.trim(),
        puntaje_aprobacion: parseFloat(newEvaluation.puntaje_aprobacion) || 70.0,
        max_intentos: parseInt(newEvaluation.max_intentos) || 3
      });

      // Limpiar formulario y recargar
      setNewEvaluation({
        nombre: '',
        descripcion: '',
        puntaje_aprobacion: 70.0,
        max_intentos: 3
      });
      setShowCreateEvaluationForm(false);
      setSelectedLessonId(null);
      await loadModulesWithDetails();
      alert('Evaluación creada exitosamente');
    } catch (err) {
      console.error('Error creando evaluación:', err);
      alert('Error al crear la evaluación: ' + err.message);
    }
  };

  // Abrir formulario para editar evaluación
  const handleEditEvaluationClick = (evaluation) => {
    setEditingEvaluation(evaluation);
    setNewEvaluation({
      nombre: evaluation.Nombre,
      descripcion: evaluation.Descripcion || '',
      puntaje_aprobacion: evaluation.Puntaje_aprobacion || 70.0,
      max_intentos: evaluation.Max_intentos || 3
    });
    setShowEditEvaluationForm(true);
  };

  // Editar evaluación
  const handleEditEvaluation = async (e) => {
    e.preventDefault();
    if (!newEvaluation.nombre.trim()) {
      alert('El nombre de la evaluación es obligatorio');
      return;
    }

    try {
      await teacherApiService.updateEvaluation(editingEvaluation.ID_Evaluacion, {
        nombre: newEvaluation.nombre.trim(),
        descripcion: newEvaluation.descripcion.trim(),
        puntaje_aprobacion: parseFloat(newEvaluation.puntaje_aprobacion) || 70.0,
        max_intentos: parseInt(newEvaluation.max_intentos) || 3
      });

      // Limpiar formulario y recargar
      setNewEvaluation({
        nombre: '',
        descripcion: '',
        puntaje_aprobacion: 70.0,
        max_intentos: 3
      });
      setShowEditEvaluationForm(false);
      setEditingEvaluation(null);
      await loadModulesWithDetails();
      alert('Evaluación actualizada exitosamente');
    } catch (err) {
      console.error('Error actualizando evaluación:', err);
      alert('Error al actualizar la evaluación: ' + err.message);
    }
  };

  // Eliminar evaluación
  const handleDeleteEvaluation = async (evaluationId, evaluationName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la evaluación "${evaluationName}"?`)) {
      return;
    }

    try {
      await teacherApiService.deleteEvaluation(evaluationId);
      await loadModulesWithDetails();
      alert(`Evaluación "${evaluationName}" eliminada exitosamente`);
    } catch (err) {
      console.error('Error eliminando evaluación:', err);
      alert('Error al eliminar la evaluación: ' + err.message);
    }
  };

  const handleOpenQuestionsModal = (evaluationId) => {
    setActiveEvaluationId(evaluationId);
    setShowQuestionsModal(true);
  };

  const handleCloseQuestionsModal = () => {
    setShowQuestionsModal(false);
    setActiveEvaluationId(null);
  };

  if (loading) {
    return (
      <div className="module-manager">
        <div className="loading">Cargando módulos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-manager">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="module-manager">
      <div className="module-header">
        <h2>Módulos del Curso: {courseName}</h2>
        <button 
          className="btn-create-module"
          onClick={() => setShowCreateForm(true)}
        >
          <FiPlus /> Crear Módulo
        </button>
      </div>

      {/* Lista de módulos con lecciones y evaluaciones */}
      <div className="modules-list">
        {modules.length === 0 ? (
          <div className="empty-state">
            <FiBook className="empty-icon" />
            <h3>No hay módulos en este curso</h3>
            <p>Comienza creando el primer módulo</p>
            <button 
              className="btn-create-module"
              onClick={() => setShowCreateForm(true)}
            >
              <FiPlus /> Crear Primer Módulo
            </button>
          </div>
        ) : (
          modules.map(module => (
            <div key={module.ID_Modulo} className="module-item">
              <div className="module-header-item">
                <div className="module-info">
                  <button 
                    className="expand-btn"
                    onClick={() => toggleModule(module.ID_Modulo)}
                  >
                    {expandedModules.has(module.ID_Modulo) ? 
                      <FiChevronDown /> : <FiChevronRight />
                    }
                  </button>
                  <FiBook className="module-icon" />
                  <div className="module-details">
                    <h3>{module.Nombre}</h3>
                    <p>{module.Descripcion || 'Sin descripción'}</p>
                    {module.Duracion_estimada > 0 && (
                      <span className="duration">Duración: {module.Duracion_estimada} min</span>
                    )}
                  </div>
                </div>
                <div className="module-actions">
                  <button 
                    className="btn-delete-module"
                    onClick={() => handleDeleteModule(module.ID_Modulo, module.Nombre)}
                    title="Eliminar módulo"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              {/* Lecciones del módulo */}
              {expandedModules.has(module.ID_Modulo) && (
                <div className="lessons-container">
                  <div className="lessons-header">
                    <h4>Lecciones del Módulo</h4>
                    <button 
                      className="btn-create-lesson"
                      onClick={() => handleCreateLessonClick(module.ID_Modulo)}
                    >
                      <FiPlus /> Agregar Lección
                    </button>
                  </div>
                  
                  {module.lecciones && module.lecciones.length > 0 ? (
                    module.lecciones.map(lesson => (
                      <div key={lesson.ID_Leccion} className="lesson-item">
                        <div 
                          className={`lesson-header clickable${expandedLessons.has(lesson.ID_Leccion) ? ' expanded' : ''}`}
                          onClick={() => toggleLesson(lesson.ID_Leccion)}
                          style={{ cursor: 'pointer' }}
                        >
                          <FiFileText className="lesson-icon" />
                          <div className="lesson-details">
                            <h4>{lesson.Nombre}</h4>
                            <p>{lesson.Descripcion || 'Sin descripción'}</p>
                            {lesson.Duracion_estimada > 0 && (
                              <span className="duration">Duración: {lesson.Duracion_estimada} min</span>
                            )}
                            {lesson.Es_obligatoria && (
                              <span className="obligatory">Obligatoria</span>
                            )}
                          </div>
                          <div className="lesson-actions" onClick={e => e.stopPropagation()}>
                            <button 
                              className="btn-edit-lesson"
                              onClick={() => handleEditLessonClick(lesson)}
                              title="Editar lección"
                            >
                              <FiEdit3 />
                            </button>
                            <button 
                              className="btn-delete-lesson"
                              onClick={() => handleDeleteLesson(lesson.ID_Leccion, lesson.Nombre)}
                              title="Eliminar lección"
                            >
                              <FiTrash2 />
                            </button>
                            <button 
                              className="btn-create-evaluation"
                              onClick={() => handleCreateEvaluationClick(lesson.ID_Leccion)}
                              title="Agregar evaluación"
                            >
                              <FiPlus /> Evaluación
                            </button>
                          </div>
                        </div>
                        {/* Evaluaciones de la lección */}
                        {expandedLessons.has(lesson.ID_Leccion) && (
                          <div className="evaluations-container">
                            <div className="evaluations-header">
                              <h5>Evaluaciones de la Lección</h5>
                            </div>
                            {lesson.evaluaciones && lesson.evaluaciones.length > 0 ? (
                              lesson.evaluaciones.map(evaluation => (
                                <div key={evaluation.ID_Evaluacion} className="evaluation-item">
                                  <FiCheckSquare className="evaluation-icon" />
                                  <div className="evaluation-details">
                                    <h5>{evaluation.Nombre}</h5>
                                    <p>{evaluation.Descripcion || 'Sin descripción'}</p>
                                    <span className="evaluation-info">
                                      Puntaje aprobación: {evaluation.Puntaje_aprobacion}% | 
                                      Máx. intentos: {evaluation.Max_intentos}
                                    </span>
                                  </div>
                                  <div className="evaluation-actions">
                                    <button 
                                      className="btn-edit-evaluation"
                                      onClick={() => handleEditEvaluationClick(evaluation)}
                                      title="Editar evaluación"
                                    >
                                      <FiEdit3 />
                                    </button>
                                    <button 
                                      className="btn-delete-evaluation"
                                      onClick={() => handleDeleteEvaluation(evaluation.ID_Evaluacion, evaluation.Nombre)}
                                      title="Eliminar evaluación"
                                    >
                                      <FiTrash2 />
                                    </button>
                                    <button
                                      className="btn-manage-questions"
                                      onClick={() => handleOpenQuestionsModal(evaluation.ID_Evaluacion)}
                                      title="Gestionar preguntas"
                                    >
                                      <FiPlus /> Gestionar Preguntas
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="empty-evaluations">
                                <p>No hay evaluaciones en esta lección</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-lessons">
                      <p>No hay lecciones en este módulo</p>
                      <button 
                        className="btn-create-lesson"
                        onClick={() => handleCreateLessonClick(module.ID_Modulo)}
                      >
                        <FiPlus /> Crear Primera Lección
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal para crear módulo */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Módulo</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateModule} className="create-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Módulo *</label>
                <input
                  id="nombre"
                  type="text"
                  value={newModule.nombre}
                  onChange={(e) => setNewModule({...newModule, nombre: e.target.value})}
                  placeholder="Ej: Introducción a las Matemáticas"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={newModule.descripcion}
                  onChange={(e) => setNewModule({...newModule, descripcion: e.target.value})}
                  placeholder="Descripción del módulo..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="duracion">Duración Estimada (minutos)</label>
                <input
                  id="duracion"
                  type="number"
                  value={newModule.duracion_estimada}
                  onChange={(e) => setNewModule({...newModule, duracion_estimada: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FiPlus /> Crear Módulo
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear lección */}
      {showCreateLessonForm && (
        <div className="modal-overlay" onClick={() => setShowCreateLessonForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nueva Lección</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateLessonForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateLesson} className="create-form">
              <div className="form-group">
                <label htmlFor="lesson-nombre">Nombre de la Lección *</label>
                <input
                  id="lesson-nombre"
                  type="text"
                  value={newLesson.nombre}
                  onChange={(e) => setNewLesson({...newLesson, nombre: e.target.value})}
                  placeholder="Ej: Conceptos Básicos"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lesson-descripcion">Descripción</label>
                <textarea
                  id="lesson-descripcion"
                  value={newLesson.descripcion}
                  onChange={(e) => setNewLesson({...newLesson, descripcion: e.target.value})}
                  placeholder="Descripción de la lección..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lesson-contenido">Contenido</label>
                <textarea
                  id="lesson-contenido"
                  value={newLesson.contenido}
                  onChange={(e) => setNewLesson({...newLesson, contenido: e.target.value})}
                  placeholder="Contenido de la lección..."
                  rows="5"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lesson-duracion">Duración Estimada (minutos)</label>
                <input
                  id="lesson-duracion"
                  type="number"
                  value={newLesson.duracion_estimada}
                  onChange={(e) => setNewLesson({...newLesson, duracion_estimada: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newLesson.es_obligatoria}
                    onChange={(e) => setNewLesson({...newLesson, es_obligatoria: e.target.checked})}
                  />
                  Lección obligatoria
                </label>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FiPlus /> Crear Lección
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateLessonForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar lección */}
      {showEditLessonForm && editingLesson && (
        <div className="modal-overlay" onClick={() => setShowEditLessonForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Lección</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditLessonForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditLesson} className="create-form">
              <div className="form-group">
                <label htmlFor="edit-lesson-nombre">Nombre de la Lección *</label>
                <input
                  id="edit-lesson-nombre"
                  type="text"
                  value={newLesson.nombre}
                  onChange={(e) => setNewLesson({...newLesson, nombre: e.target.value})}
                  placeholder="Ej: Conceptos Básicos"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-lesson-descripcion">Descripción</label>
                <textarea
                  id="edit-lesson-descripcion"
                  value={newLesson.descripcion}
                  onChange={(e) => setNewLesson({...newLesson, descripcion: e.target.value})}
                  placeholder="Descripción de la lección..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-lesson-contenido">Contenido</label>
                <textarea
                  id="edit-lesson-contenido"
                  value={newLesson.contenido}
                  onChange={(e) => setNewLesson({...newLesson, contenido: e.target.value})}
                  placeholder="Contenido de la lección..."
                  rows="5"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-lesson-duracion">Duración Estimada (minutos)</label>
                <input
                  id="edit-lesson-duracion"
                  type="number"
                  value={newLesson.duracion_estimada}
                  onChange={(e) => setNewLesson({...newLesson, duracion_estimada: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newLesson.es_obligatoria}
                    onChange={(e) => setNewLesson({...newLesson, es_obligatoria: e.target.checked})}
                  />
                  Lección obligatoria
                </label>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FiEdit3 /> Actualizar Lección
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowEditLessonForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear evaluación */}
      {showCreateEvaluationForm && (
        <div className="modal-overlay" onClick={() => setShowCreateEvaluationForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nueva Evaluación</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateEvaluationForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateEvaluation} className="create-form">
              <div className="form-group">
                <label htmlFor="evaluation-nombre">Nombre de la Evaluación *</label>
                <input
                  id="evaluation-nombre"
                  type="text"
                  value={newEvaluation.nombre}
                  onChange={(e) => setNewEvaluation({...newEvaluation, nombre: e.target.value})}
                  placeholder="Ej: Examen Final"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="evaluation-descripcion">Descripción</label>
                <textarea
                  id="evaluation-descripcion"
                  value={newEvaluation.descripcion}
                  onChange={(e) => setNewEvaluation({...newEvaluation, descripcion: e.target.value})}
                  placeholder="Descripción de la evaluación..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="evaluation-puntaje">Puntaje de Aprobación (%)</label>
                <input
                  id="evaluation-puntaje"
                  type="number"
                  value={newEvaluation.puntaje_aprobacion}
                  onChange={(e) => setNewEvaluation({...newEvaluation, puntaje_aprobacion: e.target.value})}
                  placeholder="70"
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="evaluation-intentos">Máx. Intentos</label>
                <input
                  id="evaluation-intentos"
                  type="number"
                  value={newEvaluation.max_intentos}
                  onChange={(e) => setNewEvaluation({...newEvaluation, max_intentos: e.target.value})}
                  placeholder="3"
                  min="1"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FiPlus /> Crear Evaluación
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowCreateEvaluationForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar evaluación */}
      {showEditEvaluationForm && editingEvaluation && (
        <div className="modal-overlay" onClick={() => setShowEditEvaluationForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Evaluación</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditEvaluationForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditEvaluation} className="create-form">
              <div className="form-group">
                <label htmlFor="edit-evaluation-nombre">Nombre de la Evaluación *</label>
                <input
                  id="edit-evaluation-nombre"
                  type="text"
                  value={newEvaluation.nombre}
                  onChange={(e) => setNewEvaluation({...newEvaluation, nombre: e.target.value})}
                  placeholder="Ej: Examen Final"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-evaluation-descripcion">Descripción</label>
                <textarea
                  id="edit-evaluation-descripcion"
                  value={newEvaluation.descripcion}
                  onChange={(e) => setNewEvaluation({...newEvaluation, descripcion: e.target.value})}
                  placeholder="Descripción de la evaluación..."
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-evaluation-puntaje">Puntaje de Aprobación (%)</label>
                <input
                  id="edit-evaluation-puntaje"
                  type="number"
                  value={newEvaluation.puntaje_aprobacion}
                  onChange={(e) => setNewEvaluation({...newEvaluation, puntaje_aprobacion: e.target.value})}
                  placeholder="70"
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-evaluation-intentos">Máx. Intentos</label>
                <input
                  id="edit-evaluation-intentos"
                  type="number"
                  value={newEvaluation.max_intentos}
                  onChange={(e) => setNewEvaluation({...newEvaluation, max_intentos: e.target.value})}
                  placeholder="3"
                  min="1"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FiEdit3 /> Actualizar Evaluación
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowEditEvaluationForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuestionsModal && (
        <div className="modal-overlay" onClick={handleCloseQuestionsModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Preguntas de la Evaluación</h3>
              <button className="modal-close" onClick={handleCloseQuestionsModal}>×</button>
            </div>
            <QuestionForm onSave={async (q) => {
              await teacherApiService.createQuestion(activeEvaluationId, q);
              if (window.refreshQuestions) window.refreshQuestions();
            }} />
            <QuestionList evaluationId={activeEvaluationId} onQuestionAdded={refreshFn => { window.refreshQuestions = refreshFn; }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ModuleManager; 