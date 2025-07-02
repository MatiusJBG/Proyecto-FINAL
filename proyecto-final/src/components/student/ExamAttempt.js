import React, { useState, useEffect } from 'react';
import './ExamAttempt.css';

export default function ExamAttempt({ evaluacionId, estudianteId, onFinish }) {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPreguntas() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/evaluaciones/${evaluacionId}/preguntas`);
        if (!res.ok) throw new Error('No se pudieron cargar las preguntas');
        const data = await res.json();
        setPreguntas(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (evaluacionId) fetchPreguntas();
  }, [evaluacionId]);

  const handleChange = (id, value) => {
    setRespuestas({ ...respuestas, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        estudiante_id: estudianteId,
        respuestas: preguntas.map(p => ({ id_pregunta: p.ID_Pregunta, respuesta: respuestas[p.ID_Pregunta] || '' }))
      };
      const res = await fetch(`/api/evaluaciones/${evaluacionId}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al enviar respuestas');
      const data = await res.json();
      setComprobante(data.comprobante);
      if (onFinish) onFinish();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="exam-attempt">Cargando...</div>;
  if (error) return <div className="exam-attempt error">{error}</div>;

  if (comprobante) {
    return (
      <div className="exam-attempt comprobante">
        <h3>Comprobante de Calificación</h3>
        <p>Puntaje obtenido: {comprobante.puntaje_obtenido} / {comprobante.puntaje_maximo}</p>
        <ul>
          {comprobante.detalles.map((d, idx) => (
            <li key={idx}>
              <b>Pregunta:</b> {d.id_pregunta}<br/>
              <b>Tu respuesta:</b> {d.respuesta_estudiante}<br/>
              <b>Respuesta correcta:</b> {d.respuesta_correcta}<br/>
              <b>Puntaje:</b> {d.puntaje} {d.es_correcta ? '✅' : '❌'}
            </li>
          ))}
        </ul>
        <button onClick={onFinish}>Cerrar</button>
      </div>
    );
  }

  return (
    <form className="exam-attempt" onSubmit={handleSubmit}>
      <h3>Responde las preguntas</h3>
      {preguntas.map(p => (
        <div key={p.ID_Pregunta} className="pregunta-item">
          <label>{p.Texto}</label>
          <input
            type="text"
            value={respuestas[p.ID_Pregunta] || ''}
            onChange={e => handleChange(p.ID_Pregunta, e.target.value)}
            required
          />
        </div>
      ))}
      <button type="submit">Enviar respuestas</button>
    </form>
  );
}
