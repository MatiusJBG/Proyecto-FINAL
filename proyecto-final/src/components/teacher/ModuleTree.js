import React, { useEffect, useState } from 'react';
import teacherApiService from '../../services/teacherApi';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';
import './ModuleTree.css';

function ModuleTree({ courseId }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [newLesson, setNewLesson] = useState({ Nombre: '', Descripcion: '', Contenido: '', Duracion_estimada: 0, Orden: 1, Es_obligatoria: 1 });
  const [showEvalForm, setShowEvalForm] = useState({});
  const [newEval, setNewEval] = useState({ Nombre: '', Descripcion: '', Puntaje_aprobacion: 60, Max_intentos: 1 });
  const [showQuestionForm, setShowQuestionForm] = useState({});

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const mods = await teacherApiService.getCourseModules(courseId);
        // Para cada módulo, obtener lecciones
        const modsWithLessons = await Promise.all(mods.map(async (mod) => {
          const lessons = await teacherApiService.getModuleLessons(mod.ID_Modulo);
          // Para cada lección, obtener evaluaciones
          const lessonsWithEvals = await Promise.all(lessons.map(async (lesson) => {
            const evals = await teacherApiService.getModuleLessons ? await teacherApiService.getModuleLessons(lesson.ID_Leccion) : [];
            return { ...lesson, evaluaciones: evals };
          }));
          return { ...mod, lecciones: lessonsWithEvals };
        }));
        setModules(modsWithLessons);
      } catch (err) {
        setError('No se pudo cargar la jerarquía.');
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [courseId]);

  // Crear lección
  const handleCreateLesson = async (e, moduleId) => {
    e.preventDefault();
    try {
      await teacherApiService.createLesson(moduleId, newLesson);
      setShowLessonForm(null);
      setNewLesson({ Nombre: '', Descripcion: '', Contenido: '', Duracion_estimada: 0, Orden: 1, Es_obligatoria: 1 });
      // Refrescar módulos
      const mods = await teacherApiService.getCourseModules(courseId);
      setModules(mods);
    } catch (err) {
      setError('No se pudo crear la lección.');
    }
  };

  // Crear evaluación (solo para lección)
  const handleCreateEval = async (e, lessonId) => {
    e.preventDefault();
    try {
      const evalRes = await teacherApiService.createLessonEvaluation(lessonId, newEval);
      setShowEvalForm({});
      setNewEval({ Nombre: '', Descripcion: '', Puntaje_aprobacion: 60, Max_intentos: 1 });
      // Refrescar módulos
      const mods = await teacherApiService.getCourseModules(courseId);
      setModules(mods);
      // Mostrar formulario de preguntas para la nueva evaluación
      if (evalRes && evalRes.ID_Evaluacion) {
        setShowQuestionForm({ [evalRes.ID_Evaluacion]: true });
      }
    } catch (err) {
      setError('No se pudo crear la evaluación.');
    }
  };

  // Guardar pregunta en la BD
  const handleSaveQuestion = async (evaluationId, questionData) => {
    try {
      await teacherApiService.createQuestion(evaluationId, questionData);
      // Puedes recargar preguntas si lo deseas
      setShowQuestionForm({});
    } catch (err) {
      setError('No se pudo guardar la pregunta.');
    }
  };

  if (loading) return <div>Cargando jerarquía...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="module-tree">
      {modules.map(mod => (
        <div key={mod.ID_Modulo} className="module-block">
          <div className="module-header" onClick={() => setExpandedModule(expandedModule === mod.ID_Modulo ? null : mod.ID_Modulo)}>
            <b>{mod.Nombre}</b> <span style={{color:'#888'}}>({mod.Descripcion || 'Sin descripción'})</span>
          </div>
          {expandedModule === mod.ID_Modulo && (
            <div className="module-content">
              <h4>Lecciones</h4>
              <ul>
                {mod.lecciones && mod.lecciones.length > 0 ? mod.lecciones.map(lesson => (
                  <li key={lesson.ID_Leccion}>
                    <b>{lesson.Nombre}</b> <span style={{color:'#888'}}>({lesson.Descripcion || 'Sin descripción'})</span>
                    <div>
                      <button onClick={() => setShowEvalForm({ [lesson.ID_Leccion]: true })}>Crear evaluación</button>
                      {showEvalForm[lesson.ID_Leccion] && (
                        <form onSubmit={e => handleCreateEval(e, lesson.ID_Leccion)} className="eval-form">
                          <input type="text" value={newEval.Nombre} onChange={e => setNewEval({ ...newEval, Nombre: e.target.value })} placeholder="Nombre evaluación" required />
                          <input type="text" value={newEval.Descripcion} onChange={e => setNewEval({ ...newEval, Descripcion: e.target.value })} placeholder="Descripción" />
                          <input type="number" value={newEval.Puntaje_aprobacion} onChange={e => setNewEval({ ...newEval, Puntaje_aprobacion: e.target.value })} placeholder="Puntaje aprobación" required />
                          <input type="number" value={newEval.Max_intentos} onChange={e => setNewEval({ ...newEval, Max_intentos: e.target.value })} placeholder="Máx. intentos" required />
                          <button type="submit">Crear</button>
                        </form>
                      )}
                    </div>
                    <ul>
                      {lesson.evaluaciones && lesson.evaluaciones.length > 0 ? lesson.evaluaciones.map(ev => (
                        <li key={ev.ID_Evaluacion}>
                          {ev.Nombre} <span style={{color:'#888'}}>({ev.Descripcion || 'Sin descripción'})</span>
                          <button style={{marginLeft:'1rem'}} onClick={() => setShowQuestionForm({ [ev.ID_Evaluacion]: true })}>Agregar pregunta</button>
                          {showQuestionForm[ev.ID_Evaluacion] && (
                            <QuestionForm onSave={q => handleSaveQuestion(ev.ID_Evaluacion, q)} />
                          )}
                          <QuestionList evaluationId={ev.ID_Evaluacion} />
                        </li>
                      )) : <li>No hay evaluaciones</li>}
                    </ul>
                  </li>
                )) : <li>No hay lecciones</li>}
              </ul>
              <button onClick={() => setShowLessonForm(mod.ID_Modulo)}>Crear lección</button>
              {showLessonForm === mod.ID_Modulo && (
                <form onSubmit={e => handleCreateLesson(e, mod.ID_Modulo)} className="lesson-form">
                  <input type="text" value={newLesson.Nombre} onChange={e => setNewLesson({ ...newLesson, Nombre: e.target.value })} placeholder="Nombre lección" required />
                  <input type="text" value={newLesson.Descripcion} onChange={e => setNewLesson({ ...newLesson, Descripcion: e.target.value })} placeholder="Descripción" />
                  <input type="text" value={newLesson.Contenido} onChange={e => setNewLesson({ ...newLesson, Contenido: e.target.value })} placeholder="Contenido" />
                  <input type="number" value={newLesson.Duracion_estimada} onChange={e => setNewLesson({ ...newLesson, Duracion_estimada: e.target.value })} placeholder="Duración (min)" />
                  <input type="number" value={newLesson.Orden} onChange={e => setNewLesson({ ...newLesson, Orden: e.target.value })} placeholder="Orden" />
                  <label>
                    <input type="checkbox" checked={!!newLesson.Es_obligatoria} onChange={e => setNewLesson({ ...newLesson, Es_obligatoria: e.target.checked ? 1 : 0 })} /> Obligatoria
                  </label>
                  <button type="submit">Crear</button>
                </form>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ModuleTree;
