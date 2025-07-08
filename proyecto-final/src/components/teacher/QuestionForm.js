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
      Tipo: 'seleccion_multiple',
      Opciones: opciones, // Enviar como array, no como JSON string
      Respuesta_correcta: opciones[respuestaCorrecta],
    });
    setEnunciado('');
    setOpciones(['', '', '', '']);
    setRespuestaCorrecta(0);
  };

  return (
    <form className="question-form modern-card" onSubmit={handleSubmit}>
      <label className="form-label">Enunciado de la pregunta:<span className="required">*</span></label>
      <input className={error && !enunciado.trim() ? 'input-error' : ''} type="text" value={enunciado} onChange={e => setEnunciado(e.target.value)} required placeholder="Escribe el enunciado aquí..." autoFocus />
      <label className="form-label">Opciones:<span className="required">*</span></label>
      <div className="options-list">
        {opciones.map((opt, idx) => (
          <div key={idx} className={`option-row option-card${error && !opt.trim() ? ' input-error' : ''}`}> 
            <input
              type="text"
              value={opt}
              onChange={e => handleOptionChange(idx, e.target.value)}
              required
              placeholder={`Opción ${idx + 1}`}
            />
            <label className="radio-label" title="Marcar como correcta">
              <input
                type="radio"
                name="correcta"
                checked={respuestaCorrecta === idx}
                onChange={() => setRespuestaCorrecta(idx)}
              />
              <span className={respuestaCorrecta === idx ? 'radio-custom checked' : 'radio-custom'}></span>
              <span className="correct-label">Correcta</span>
            </label>
          </div>
        ))}
      </div>
      {error && <div className="error-message">{error}</div>}
      <button type="submit" className="btn-main">Agregar pregunta</button>
    </form>
  );
}

export default QuestionForm;
