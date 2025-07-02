
import React, { useState, useEffect } from 'react';

function CourseForm({ onAdd, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('activo');
  const [imagenUrl, setImagenUrl] = useState('');
  const [duracion, setDuracion] = useState('');
  const [idProfesor, setIdProfesor] = useState('');
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Obtener lista de profesores para el select
    const fetchProfesores = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profesores');
        const data = await res.json();
        if (Array.isArray(data)) setProfesores(data);
      } catch (e) {}
    };
    fetchProfesores();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del curso es obligatorio.');
      return;
    }
    if (!idProfesor) {
      setError('Selecciona un profesor responsable.');
      return;
    }
    setError('');
    setSuccess('');
    // Guardar en la base de datos
    try {
      const res = await fetch('http://localhost:5000/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          estado,
          imagen_url: imagenUrl.trim() || null,
          duracion_estimada: duracion ? parseInt(duracion) : null,
          id_profesor: idProfesor
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al crear el curso');
        return;
      }
      setSuccess('Curso creado correctamente');
      setNombre('');
      setDescripcion('');
      setEstado('activo');
      setImagenUrl('');
      setDuracion('');
      setIdProfesor('');
      if (onAdd) onAdd();
      setTimeout(() => { setSuccess(''); onCancel(); }, 1200);
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{
      margin: 0,
      background: '#23272f',
      borderRadius: 16,
      padding: 32,
      boxShadow: '0 4px 24px #0004',
      maxWidth: 540,
      minWidth: 320,
      marginLeft: 'auto',
      marginRight: 'auto',
      border: '1.5px solid #353b48',
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }}>
      <h3 style={{ margin: '0 0 24px 0', textAlign: 'center', color: '#e94560', letterSpacing: 1, fontWeight: 800, fontSize: 26 }}>Agregar nuevo curso</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={{ fontWeight: 600 }}>Nombre del curso <span style={{ color: '#e94560' }}>*</span></label>
          <input
            className="admin-input"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #444', fontSize: '1em', marginTop: 4 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ fontWeight: 600 }}>Estado</label>
          <select className="admin-input" value={estado} onChange={e => setEstado(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #444', marginTop: 4 }}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="en_desarrollo">En desarrollo</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label style={{ fontWeight: 600 }}>Imagen (URL)</label>
          <input
            className="admin-input"
            type="text"
            value={imagenUrl}
            onChange={e => setImagenUrl(e.target.value)}
            placeholder="https://..."
            style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #444', fontSize: '1em', marginTop: 4 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ fontWeight: 600 }}>Duración estimada (horas)</label>
          <input
            className="admin-input"
            type="number"
            min="1"
            value={duracion}
            onChange={e => setDuracion(e.target.value)}
            style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #444', fontSize: '1em', marginTop: 4 }}
          />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontWeight: 600 }}>Descripción</label>
        <textarea
          className="admin-input"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={3}
          style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #444', fontSize: '1em', resize: 'vertical', marginTop: 4 }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontWeight: 600 }}>Profesor responsable <span style={{ color: '#e94560' }}>*</span></label>
        <select className="admin-input" value={idProfesor} onChange={e => setIdProfesor(e.target.value)} required style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #444', marginTop: 4 }}>
          <option value="">Selecciona un profesor</option>
          {profesores.map(p => (
            <option key={p.ID_Profesor} value={p.ID_Profesor}>{p.Nombre}</option>
          ))}
        </select>
      </div>
      {error && <div style={{ color: '#e94560', marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
      {success && <div style={{ color: '#43d477', marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{success}</div>}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
        <button className="admin-btn" type="submit" style={{ minWidth: 120, fontWeight: 600, fontSize: 16 }}>Agregar</button>
        <button className="admin-btn" type="button" style={{ background: '#353b48', color: '#fff', minWidth: 120, fontWeight: 600, fontSize: 16 }} onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

export default CourseForm;
