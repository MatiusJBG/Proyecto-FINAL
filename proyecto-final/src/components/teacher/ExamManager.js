// Archivo eliminado. Reemplazado por TeacherEvaluations.js
// Archivo obsoleto. Reemplazado por TeacherEvaluations.js
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiCheckCircle } from 'react-icons/fi';
import teacherApiService from '../../services/teacherApi';
import './ExamManager.css';

function ExamManager({ teacherData }) {
  const [exams, setExams] = useState([]);
  const [showExamForm, setShowExamForm] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    courseId: '',
    moduleId: '',
    lessonId: '',
    ponderacion: 1.0,
    preguntas: []
  });
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionScore, setQuestionScore] = useState(1);
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [examQuestions, setExamQuestions] = useState([]);

  // Cargar cursos al montar
  useEffect(() => {
    async function loadCourses() {
      const data = await teacherApiService.getTeacherCourses(teacherData.id);
      setCourses(data);
    }
    if (teacherData?.id) loadCourses();
  }, [teacherData]);

  // Cargar módulos y lecciones según curso seleccionado
  useEffect(() => {
    async function loadModules() {
      if (!newExam.courseId) return;
      const mods = await teacherApiService.getCourseModules(newExam.courseId);
      setModules(mods);
    }
    loadModules();
  }, [newExam.courseId]);

  useEffect(() => {
    async function loadLessons() {
      if (!newExam.moduleId) return;
      const less = await teacherApiService.getModuleLessons(newExam.moduleId);
      setLessons(less);
    }
    loadLessons();
  }, [newExam.moduleId]);

  // Crear examen
  const handleCreateExam = async (e) => {
    e.preventDefault();
    // Lógica para crear examen en backend
    // ...
    setShowExamForm(false);
  };

  // Agregar pregunta localmente
  const handleAddQuestion = (e) => {
    e.preventDefault();
    setExamQuestions([
      ...examQuestions,
      { texto: questionText, puntaje: questionScore, respuesta_correcta: questionAnswer }
    ]);
    setQuestionText('');
    setQuestionScore(1);
    setQuestionAnswer('');
  };

  return (
    <div className="exam-manager">
      <div className="exam-header">
        <h2>Gestión de Exámenes</h2>
        <button className="add-exam-btn" onClick={() => setShowExamForm(true)}>
          <FiPlus /> Nuevo Examen
        </button>
      </div>

      {showExamForm && (
        <div className="add-exam-form">
          <h3>Crear Nuevo Examen</h3>
          <form onSubmit={handleCreateExam}>
            <div className="form-row">
              <div className="form-group">
                <label>Curso</label>
                <select
                  value={newExam.courseId}
                  onChange={e => setNewExam({ ...newExam, courseId: e.target.value })}
                  required
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Módulo</label>
                <select
                  value={newExam.moduleId}
                  onChange={e => setNewExam({ ...newExam, moduleId: e.target.value })}
                >
                  <option value="">Seleccionar módulo</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Lección</label>
                <select
                  value={newExam.lessonId}
                  onChange={e => setNewExam({ ...newExam, lessonId: e.target.value })}
                >
                  <option value="">Seleccionar lección</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Título del Examen</label>
                <input
                  type="text"
                  value={newExam.title}
                  onChange={e => setNewExam({ ...newExam, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ponderación</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newExam.ponderacion}
                  onChange={e => setNewExam({ ...newExam, ponderacion: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="questions-section">
              <h4>Preguntas</h4>
              <form onSubmit={handleAddQuestion} className="add-question-form">
                <input
                  type="text"
                  placeholder="Texto de la pregunta"
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  required
                />
                <input
                  type="number"
                  min="1"
                  value={questionScore}
                  onChange={e => setQuestionScore(Number(e.target.value))}
                  required
                />
                <input
                  type="text"
                  placeholder="Respuesta correcta"
                  value={questionAnswer}
                  onChange={e => setQuestionAnswer(e.target.value)}
                  required
                />
                <button type="submit">Agregar Pregunta</button>
              </form>
              <ul className="questions-list">
                {examQuestions.map((q, idx) => (
                  <li key={idx}>
                    <b>{q.texto}</b> (Puntaje: {q.puntaje})<br/>
                    <span>Respuesta correcta: {q.respuesta_correcta}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Crear Examen</button>
              <button type="button" className="btn-secondary" onClick={() => setShowExamForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Aquí se mostrarán los exámenes existentes y comprobantes de respuestas */}
      {/* ... */}
    </div>
  );
}

export default ExamManager;
