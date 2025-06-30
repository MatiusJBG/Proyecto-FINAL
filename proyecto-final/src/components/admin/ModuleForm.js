import React, { useState } from 'react';

function ModuleForm({ onAdd, onCancel, initialName = '' }) {
  const [nombre, setNombre] = useState(initialName);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    onAdd({ nombre: nombre.trim() });
    setNombre('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label>
        Nombre del módulo:
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          autoFocus
        />
      </label>
      {error && <span style={{ color: '#e94560', fontSize: '0.95em' }}>{error}</span>}
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button type="submit" className="admin-btn">Guardar</button>
        <button type="button" className="admin-btn" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default ModuleForm;
