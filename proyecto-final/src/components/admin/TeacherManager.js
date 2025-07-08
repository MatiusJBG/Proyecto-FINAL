import React, { useEffect, useState } from 'react';
import Modal from './Modal';

function TeacherManager() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editTeacher, setEditTeacher] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/profesores');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener docentes');
      setTeachers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (teacher) => {
    setEditTeacher(teacher);
    setEditForm({
      nombre: teacher.Nombre || teacher.nombre || '',
      correo_electronico: teacher.Correo_electronico || teacher.correo_electronico || '',
      especialidad: teacher.Especialidad || teacher.especialidad || '',
      nueva_contrasena: ''
    });
    setEditError('');
  };

  const closeEdit = () => {
    setEditTeacher(null);
    setEditForm({});
    setEditError('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async e => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    // Validaciones básicas
    if (!editForm.nombre.trim() || !editForm.correo_electronico.trim() || !editForm.especialidad.trim()) {
      setEditError('Nombre, correo electrónico y especialidad son obligatorios');
      setSaving(false);
      return;
    }
    if (editForm.nueva_contrasena && editForm.nueva_contrasena.length < 6) {
      setEditError('La nueva contraseña debe tener al menos 6 caracteres');
      setSaving(false);
      return;
    }
    // PUT al backend
    const payload = {
      nombre: editForm.nombre.trim(),
      correo_electronico: editForm.correo_electronico.trim(),
      especialidad: editForm.especialidad.trim(),
    };
    if (editForm.nueva_contrasena) payload.contrasena = editForm.nueva_contrasena;
    try {
      const res = await fetch(`http://localhost:5000/api/profesores/${editTeacher.ID_Profesor || editTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar docente');
      closeEdit();
      fetchTeachers();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Función para mostrar los cursos asignados correctamente
  // Ahora Cursos siempre es un array de objetos {ID_Curso, Nombre}
  const getCursosAsignados = (doc) => {
    if (Array.isArray(doc.Cursos) && doc.Cursos.length > 0) {
      // Si el curso viene como objeto con Nombre o nombre
      const nombres = doc.Cursos.map(c => {
        if (typeof c === 'string') return c;
        return c.Nombre || c.nombre || c.nombre_curso || c.Nombre_curso || c.ID_Curso || 'Curso sin nombre';
      });
      return nombres.join(', ');
    }
    return 'Sin asignar';
  };

  return (
    <div className="admin-section">
      <h3>Gestión de Docentes</h3>
      {loading && <div>Cargando...</div>}
      {error && <div style={{color:'#e94560'}}>{error}</div>}
      {!loading && !error && (
        <table className="admin-table" style={{width:'100%', borderCollapse:'collapse', background:'#23272f', borderRadius:10, boxShadow:'0 2px 12px #0002'}}>
          <thead>
            <tr style={{background:'#1a1d23', color:'#e94560'}}>
              <th style={{padding:'12px 8px'}}>ID</th>
              <th style={{padding:'12px 8px'}}>Nombre</th>
              <th style={{padding:'12px 8px'}}>Email</th>
              <th style={{padding:'12px 8px'}}>Especialidad</th>
              {/* <th style={{padding:'12px 8px'}}>Curso</th> */}
              <th style={{padding:'12px 8px'}}>Fecha de registro</th>
              <th style={{padding:'12px 8px'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(doc => (
              <tr key={doc.ID_Profesor || doc.id}>
                <td style={{padding:'10px 8px'}}>{doc.ID_Profesor || doc.id}</td>
                <td style={{padding:'10px 8px'}}>{doc.Nombre || doc.nombre}</td>
                <td style={{padding:'10px 8px'}}>{doc.Correo_electronico || doc.correo_electronico}</td>
                <td style={{padding:'10px 8px'}}>{doc.Especialidad || doc.especialidad}</td>
                {/* <td style={{padding:'10px 8px'}}>{getCursosAsignados(doc)}</td> */}
                <td style={{padding:'10px 8px'}}>{doc.Fecha_registro || doc.fecha_registro}</td>
                <td style={{padding:'10px 8px'}}>
                  <button className="admin-btn" style={{padding:'4px 12px', fontSize:14}} onClick={() => openEdit(doc)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal open={!!editTeacher} onClose={closeEdit}>
        <form onSubmit={handleEditSave} style={{display:'flex', flexDirection:'column', gap:16, minWidth:320}}>
          <h3 style={{marginBottom:0}}>Editar Docente</h3>
          <label>Nombre
            <input name="nombre" value={editForm.nombre||''} onChange={handleEditChange} required />
          </label>
          <label>Email
            <input name="correo_electronico" value={editForm.correo_electronico||''} onChange={handleEditChange} required type="email" />
          </label>
          <label>Especialidad
            <input name="especialidad" value={editForm.especialidad||''} onChange={handleEditChange} required />
          </label>
          <label>Nueva contraseña (opcional)
            <input name="nueva_contrasena" value={editForm.nueva_contrasena||''} onChange={handleEditChange} type="password" minLength={6} />
          </label>
          {editError && <div style={{color:'#e94560'}}>{editError}</div>}
          <div style={{display:'flex', gap:12, marginTop:8}}>
            <button type="button" className="admin-btn" style={{background:'#888'}} onClick={closeEdit}>Cancelar</button>
            <button type="submit" className="admin-btn" style={{background:'#43d477'}} disabled={saving}>{saving?'Guardando...':'Guardar cambios'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TeacherManager;
