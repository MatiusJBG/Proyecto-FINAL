import React, { useEffect, useState } from 'react';
import teacherApiService from '../../services/teacherApi';

function QuestionList({ evaluationId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        // Suponiendo endpoint: /evaluaciones/:id/preguntas
        const data = await teacherApiService.makeRequest(`/evaluaciones/${evaluationId}/preguntas`);
        setQuestions(data);
      } catch (err) {
        setError('No se pudieron cargar las preguntas.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [evaluationId]);

  if (loading) return <div>Cargando preguntas...</div>;
  if (error) return <div>{error}</div>;

  const handleDelete = async (questionId) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta pregunta?')) return;
    try {
      await teacherApiService.deleteQuestion(questionId);
      setQuestions(questions.filter(q => q.ID_Pregunta !== questionId));
    } catch (err) {
      alert('Error al eliminar la pregunta.');
    }
  };

  return (
    <ul style={{marginTop:'0.5rem'}}>
      {questions.length === 0 && <li>No hay preguntas.</li>}
      {questions.map(q => (
        <li key={q.ID_Pregunta}>
          <b>{q.Enunciado}</b>
          <button onClick={() => handleDelete(q.ID_Pregunta)} style={{marginLeft:'1rem', color:'#e63946', background:'none', border:'none', cursor:'pointer'}}>Eliminar</button>
          <ul>
            {q.Opciones && JSON.parse(q.Opciones).map((opt, idx) => (
              <li key={idx} style={{color: opt === q.Respuesta_correcta ? '#2a9d8f' : undefined}}>
                {opt} {opt === q.Respuesta_correcta && <b>(Correcta)</b>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default QuestionList;
