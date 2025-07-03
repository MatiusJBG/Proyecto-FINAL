import React, { useEffect, useState } from 'react';
import teacherApiService from '../../services/teacherApi';

function QuestionList({ evaluationId, onQuestionAdded }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherApiService.makeRequest(`/evaluaciones/${evaluationId}/preguntas`);
      setQuestions(data);
    } catch (err) {
      setError('No se pudieron cargar las preguntas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [evaluationId]);

  // Si se pasa la función onQuestionAdded, la llamamos cuando se agrega una pregunta
  useEffect(() => {
    if (onQuestionAdded) {
      onQuestionAdded(fetchQuestions);
    }
  }, [onQuestionAdded]);

  if (loading) return <div>Cargando preguntas...</div>;
  if (error) return <div>{error}</div>;

  const handleDelete = async (questionId) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta pregunta?')) return;
    try {
      await teacherApiService.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      alert('Error al eliminar la pregunta.');
    }
  };

  return (
    <ul style={{marginTop:'0.5rem'}}>
      {questions.length === 0 && <li>No hay preguntas.</li>}
      {questions.map(q => (
        <li key={q.id}>
          <b>{q.texto}</b>
          <button onClick={() => handleDelete(q.id)} style={{marginLeft:'1rem', color:'#e63946', background:'none', border:'none', cursor:'pointer'}}>Eliminar</button>
          <ul>
            {q.opciones && q.opciones.map((opt, idx) => (
              <li key={opt.id} style={{color: (opt.es_correcta === true || opt.es_correcta === 1 || opt.es_correcta === '1') ? '#2a9d8f' : undefined}}>
                {opt.texto} {(opt.es_correcta === true || opt.es_correcta === 1 || opt.es_correcta === '1') && <b>(Correcta)</b>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default QuestionList;
