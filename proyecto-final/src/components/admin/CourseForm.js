import React, { useState } from 'react';

function CourseForm({ onAdd, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del curso es obligatorio.');
      return;
    }
    onAdd({ nombre: nombre.trim(), descripcion: descripcion.trim() });
    setNombre('');
    setDescripcion('');
    setError('');
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#e94560' }}>Agregar nuevo curso</h3>
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontWeight: 600 }}>Nombre del curso <span style={{ color: '#e94560' }}>*</span></label>
        <input
          className="admin-input"
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #444', fontSize: '1em' }}
        />
      </div>
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontWeight: 600 }}>Descripción</label>
        <textarea
          className="admin-input"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={2}
          style={{ padding: '8px', borderRadius: 6, border: '1px solid #444', fontSize: '1em', resize: 'vertical' }}
        />
      </div>
      {error && <div style={{ color: '#e94560', marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        <button className="admin-btn" type="submit" style={{ minWidth: 100 }}>Agregar</button>
        <button className="admin-btn" type="button" style={{ background: '#353b48', color: '#fff', minWidth: 100 }} onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default CourseForm;
