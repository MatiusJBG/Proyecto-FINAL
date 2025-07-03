import React, { useState } from 'react';
import './QuestionForm.css';

function QuestionForm({ onSave }) {
  const [enunciado, setEnunciado] = useState('');
  const [opciones, setOpciones] = useState(['', '', '', '']);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(0);
  const [error, setError] = useState(null);

  const handleOptionChange = (idx, value) => {
    const newOpciones = [...opciones];
    newOpciones[idx] = value;
    setOpciones(newOpciones);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!enunciado.trim() || opciones.some(opt => !opt.trim())) {
      setError('Completa el enunciado y todas las opciones.');
      return;
    }
    setError(null);
    onSave({
      Enunciado: enunciado,
      Tipo: 'opcion_multiple',
      Opciones: JSON.stringify(opciones),
      Respuesta_correcta: opciones[respuestaCorrecta],
    });
    setEnunciado('');
    setOpciones(['', '', '', '']);
    setRespuestaCorrecta(0);
  };

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <label>Enunciado de la pregunta:</label>
      <input type="text" value={enunciado} onChange={e => setEnunciado(e.target.value)} required />
      <label>Opciones:</label>
      {opciones.map((opt, idx) => (
        <div key={idx} className="option-row">
          <input
            type="text"
            value={opt}
            onChange={e => handleOptionChange(idx, e.target.value)}
            required
            placeholder={`Opción ${idx + 1}`}
          />
          <input
            type="radio"
            name="correcta"
            checked={respuestaCorrecta === idx}
            onChange={() => setRespuestaCorrecta(idx)}
            title="Marcar como correcta"
          />
          <span>Correcta</span>
        </div>
      ))}
      {error && <div className="error">{error}</div>}
      <button type="submit">Agregar pregunta</button>
    </form>
  );
}

export default QuestionForm;
