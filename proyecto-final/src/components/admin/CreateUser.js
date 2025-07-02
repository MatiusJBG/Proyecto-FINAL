import React, { useState } from 'react';
import Modal from './Modal';


function CreateUser() { // Componente para crear alumno
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    semestre: 1,
    fecha_nacimiento: '',
    activo: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.password || !form.semestre || !form.fecha_nacimiento) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError('El email no es válido');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setError('');
    setSuccess('');
    // Solo permite crear alumnos
    const endpoint = 'http://localhost:5000/api/estudiantes';
    const payload = {
      nombre: form.nombre,
      correo_electronico: form.email,
      contrasena: form.password,
      semestre: form.semestre,
      fecha_nacimiento: form.fecha_nacimiento,
      activo: form.activo
    };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al crear usuario');
        return;
      }
      setSuccess('Usuario creado correctamente');
      setForm({ nombre: '', email: '', password: '', semestre: 1, fecha_nacimiento: '', activo: true });
      setTimeout(() => { setShow(false); setSuccess(''); }, 1200);
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{ margin: '24px 0' }}>
      <button className="admin-btn" onClick={() => setShow(true)}>
        Nuevo Alumno
      </button>
      <Modal open={show} onClose={() => { setShow(false); setError(''); setSuccess(''); }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 340 }}>
          <label>Nombre completo:
            <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="admin-input" autoFocus />
          </label>
          <label>Email:
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="admin-input" />
          </label>
          <label>Contraseña:
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="admin-input" style={{ flex: 1 }} />
              <button type="button" style={{ marginLeft: 8, padding: '4px 10px', fontSize: 13 }} onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Ocultar' : 'Ver'}</button>
            </div>
          </label>
          <label>Semestre:
            <input type="number" min="1" value={form.semestre} onChange={e => setForm({ ...form, semestre: e.target.value })} className="admin-input" />
          </label>
          <label>Fecha de nacimiento:
            <input type="date" value={form.fecha_nacimiento} onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} className="admin-input" />
          </label>
          {/* <label>Tipo de usuario:
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="admin-input">
              <option value="Alumno">Alumno</option>
              <option value="Docente">Docente</option>
            </select>
          </label> */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
            Usuario activo
          </label>
          {error && <div style={{ color: '#e94560', textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: '#43d477', textAlign: 'center' }}>{success}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            <button className="admin-btn" type="submit" style={{ minWidth: 100 }}>Crear Alumno</button>
            <button className="admin-btn" type="button" style={{ background: '#353b48', color: '#fff', minWidth: 100 }} onClick={() => setShow(false)}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CreateUser;
