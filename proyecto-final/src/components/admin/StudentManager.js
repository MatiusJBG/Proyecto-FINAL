import React, { useEffect, useState } from 'react';
import Modal from './Modal';

function StudentManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/estudiantes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al obtener estudiantes');
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (student) => {
    setEditStudent(student);
    setEditForm({
      nombre: student.Nombre || student.nombre || '',
      correo_electronico: student.Correo_electronico || student.correo_electronico || '',
      semestre: student.Semestre || student.semestre || 1,
      fecha_nacimiento: student.Fecha_nacimiento || student.fecha_nacimiento || '',
      nueva_contrasena: ''
    });
    setEditError('');
  };

  const closeEdit = () => {
    setEditStudent(null);
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
    if (!editForm.nombre.trim() || !editForm.correo_electronico.trim()) {
      setEditError('Nombre y correo electrónico son obligatorios');
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
      semestre: Number(editForm.semestre),
      fecha_nacimiento: editForm.fecha_nacimiento,
    };
    if (editForm.nueva_contrasena) payload.contrasena = editForm.nueva_contrasena;
    try {
      const res = await fetch(`http://localhost:5000/api/estudiantes/${editStudent.ID_Estudiante || editStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar estudiante');
      closeEdit();
      fetchStudents();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section">
      <h3>Gestión de Alumnos</h3>
      {loading && <div>Cargando...</div>}
      {error && <div style={{color:'#e94560'}}>{error}</div>}
      {!loading && !error && (
        <table className="admin-table" style={{width:'100%', borderCollapse:'collapse', background:'#23272f', borderRadius:10, boxShadow:'0 2px 12px #0002'}}>
          <thead>
            <tr style={{background:'#1a1d23', color:'#e94560'}}>
              <th style={{padding:'12px 8px'}}>ID</th>
              <th style={{padding:'12px 8px'}}>Nombre</th>
              <th style={{padding:'12px 8px'}}>Email</th>
              <th style={{padding:'12px 8px'}}>Semestre</th>
              <th style={{padding:'12px 8px'}}>Fecha de nacimiento</th>
              <th style={{padding:'12px 8px'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map(est => (
              <tr key={est.ID_Estudiante || est.id}>
                <td style={{padding:'10px 8px'}}>{est.ID_Estudiante || est.id}</td>
                <td style={{padding:'10px 8px'}}>{est.Nombre || est.nombre}</td>
                <td style={{padding:'10px 8px'}}>{est.Correo_electronico || est.correo_electronico}</td>
                <td style={{padding:'10px 8px'}}>{est.Semestre || est.semestre}</td>
                <td style={{padding:'10px 8px'}}>{est.Fecha_nacimiento || est.fecha_nacimiento}</td>
                <td style={{padding:'10px 8px'}}>
                  <button className="admin-btn" style={{padding:'4px 12px', fontSize:14}} onClick={() => openEdit(est)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Modal open={!!editStudent} onClose={closeEdit}>
        <form onSubmit={handleEditSave} style={{display:'flex', flexDirection:'column', gap:16, minWidth:320}}>
          <h3 style={{marginBottom:0}}>Editar Alumno</h3>
          <label>Nombre
            <input name="nombre" value={editForm.nombre||''} onChange={handleEditChange} required />
          </label>
          <label>Email
            <input name="correo_electronico" value={editForm.correo_electronico||''} onChange={handleEditChange} required type="email" />
          </label>
          <label>Semestre
            <input name="semestre" value={editForm.semestre||1} onChange={handleEditChange} type="number" min={1} required />
          </label>
          <label>Fecha de nacimiento
            <input name="fecha_nacimiento" value={editForm.fecha_nacimiento||''} onChange={handleEditChange} type="date" required />
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

export default StudentManager;
