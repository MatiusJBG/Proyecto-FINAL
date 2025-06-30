import React from 'react';


import { useState } from 'react';

const initialUsers = [
  { id: 1, nombre: 'Admin', email: 'admin@plataforma.com', rol: 'Administrador' },
  { id: 2, nombre: 'Profesor', email: 'profesor@plataforma.com', rol: 'Profesor' },
  { id: 3, nombre: 'Estudiante', email: 'alumno@plataforma.com', rol: 'Estudiante' },
];

function UserManager() {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', rol: 'Estudiante' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) {
      setError('Nombre y email son obligatorios');
      return;
    }
    if (editing) {
      setUsers(users.map(u => u.id === editing ? { ...u, ...form } : u));
    } else {
      setUsers([...users, { ...form, id: Date.now() }]);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ nombre: '', email: '', rol: 'Estudiante' });
    setError('');
  };

  const handleEdit = (user) => {
    setEditing(user.id);
    setForm({ nombre: user.nombre, email: user.email, rol: user.rol });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="admin-section">
      <h3>Gestión de Usuarios</h3>
      <div style={{ marginBottom: 16, textAlign: 'left' }}>
        <button className="admin-btn" onClick={() => { setShowForm(true); setEditing(null); setForm({ nombre: '', email: '', rol: 'Estudiante' }); }}>+ Agregar Usuario</button>
      </div>
      <div style={{ width: '100%', overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#23272f', borderRadius: 10, boxShadow: '0 2px 12px #0002' }}>
          <thead>
            <tr style={{ background: '#1a1d23', color: '#e94560' }}>
              <th style={{ padding: '12px 8px', minWidth: 120 }}>Nombre</th>
              <th style={{ padding: '12px 8px', minWidth: 180 }}>Email</th>
              <th style={{ padding: '12px 8px', minWidth: 120 }}>Rol</th>
              <th style={{ padding: '12px 8px', minWidth: 120, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#bfc9d1', padding: 24 }}>No hay usuarios registrados.</td></tr>
            )}
            {users.map(user => (
              <tr key={user.id} style={{ background: '#262a33', borderBottom: '1px solid #353b48' }}>
                <td style={{ color: '#fff' }}>{user.nombre}</td>
                <td style={{ color: '#f1f1f1' }}>{user.email}</td>
                <td style={{ color: '#f1f1f1' }}>{user.rol}</td>
                <td style={{ textAlign: 'center' }}>
                  <button className="admin-btn" style={{ marginRight: 6 }} onClick={() => handleEdit(user)}>Editar</button>
                  <button className="admin-btn" onClick={() => handleDelete(user.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div style={{ background: '#23272f', borderRadius: 10, padding: 24, maxWidth: 400, margin: '0 auto 24px auto', boxShadow: '0 2px 12px #0002' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label>Nombre:
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="admin-input" />
            </label>
            <label>Email:
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="admin-input" />
            </label>
            <label>Rol:
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })} className="admin-input">
                <option>Estudiante</option>
                <option>Profesor</option>
                <option>Administrador</option>
              </select>
            </label>
            {error && <div style={{ color: '#e94560', marginBottom: 4, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button className="admin-btn" type="submit" style={{ minWidth: 100 }}>{editing ? 'Guardar' : 'Agregar'}</button>
              <button className="admin-btn" type="button" style={{ background: '#353b48', color: '#fff', minWidth: 100 }} onClick={() => { setShowForm(false); setEditing(null); setError(''); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserManager;
