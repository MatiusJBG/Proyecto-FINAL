import React, { useState, useEffect } from 'react';
import './ExamAttempt.css';

export default function ExamAttempt({ evaluacionId, estudianteId, onFinish }) {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({}); // { [id_pregunta]: id_opcion }
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

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

  const handleChange = (idPregunta, idOpcion) => {
    setRespuestas({ ...respuestas, [idPregunta]: idOpcion });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        estudiante_id: estudianteId,
        respuestas: preguntas.map(p => ({
          id_pregunta: p.id || p.ID_Pregunta,
          id_opcion: respuestas[p.id || p.ID_Pregunta]
        }))
      };
      const res = await fetch(`/api/evaluaciones/${evaluacionId}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al enviar respuestas');
      setEnviado(true);
      if (onFinish) onFinish();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="exam-attempt">Cargando...</div>;
  if (error) return <div className="exam-attempt error">{error}</div>;
  if (enviado) {
    return (
      <div className="exam-attempt comprobante">
        <h3>Respuestas enviadas correctamente</h3>
        <button onClick={onFinish}>Cerrar</button>
      </div>
    );
  }

  return (
    <form className="exam-attempt" onSubmit={handleSubmit}>
      <h3>Responde las preguntas</h3>
      {preguntas.map(p => (
        <div key={p.id || p.ID_Pregunta} className="pregunta-item">
          <label>{p.texto || p.Texto}</label>
          {p.opciones && p.opciones.length > 0 ? (
            <div className="opciones-list">
              {p.opciones.map(op => (
                <label key={op.id || op.ID_Opcion} className="opcion-item">
                  <input
                    type="radio"
                    name={`pregunta_${p.id || p.ID_Pregunta}`}
                    value={op.id || op.ID_Opcion}
                    checked={respuestas[p.id || p.ID_Pregunta] === (op.id || op.ID_Opcion)}
                    onChange={() => handleChange(p.id || p.ID_Pregunta, op.id || op.ID_Opcion)}
                    required
                  />
                  {op.texto || op.Texto}
                </label>
              ))}
            </div>
          ) : (
            <div className="no-opciones">Sin opciones disponibles</div>
          )}
        </div>
      ))}
      <button type="submit">Enviar respuestas</button>
    </form>
  );
}
