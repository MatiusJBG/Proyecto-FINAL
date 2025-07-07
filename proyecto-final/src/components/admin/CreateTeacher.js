import React, { useState } from 'react';
import Modal from './Modal';

function CreateTeacher() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    correo_electronico: '',
    contrasena: '',
    confirmPassword: '',
    especialidad: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const especialidades = [
    'General', 'Matemáticas', 'Física', 'Química', 'Biología', 'Historia', 'Geografía',
    'Literatura', 'Inglés', 'Informática', 'Programación', 'Base de Datos',
    'Redes', 'Inteligencia Artificial', 'Machine Learning', 'Desarrollo Web',
    'Desarrollo Móvil', 'Ciberseguridad', 'Cloud Computing', 'DevOps',
    'Análisis de Datos', 'Estadística', 'Economía', 'Administración',
    'Marketing', 'Finanzas', 'Recursos Humanos', 'Derecho', 'Medicina',
    'Ingeniería Civil', 'Ingeniería Mecánica', 'Ingeniería Eléctrica',
    'Arquitectura', 'Diseño Gráfico', 'Arte', 'Música', 'Deportes',
    'Psicología', 'Filosofía', 'Sociología', 'Antropología', 'Otro'
  ];

  const validateForm = () => {
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    if (!form.correo_electronico.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.correo_electronico)) {
      setError('El email no es válido');
      return false;
    }
    if (!form.contrasena) {
      setError('La contraseña es obligatoria');
      return false;
    }
    if (form.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (form.contrasena !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (!form.especialidad.trim()) {
      setError('La especialidad es obligatoria');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const endpoint = 'http://localhost:5000/api/profesores';
    const payload = {
      nombre: form.nombre.trim(),
      correo_electronico: form.correo_electronico.trim(),
      contrasena: form.contrasena,
      especialidad: form.especialidad
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Error al crear docente');
        return;
      }
      
      setSuccess('✅ Docente creado correctamente');
      setForm({
        nombre: '', correo_electronico: '', contrasena: '', confirmPassword: '', especialidad: ''
      });
      setTimeout(() => { setShow(false); setSuccess(''); }, 2000);
    } catch (err) {
      setError('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      nombre: '', correo_electronico: '', contrasena: '', confirmPassword: '', especialidad: ''
    });
    setError('');
    setSuccess('');
  };

  return (
    <div style={{ margin: '24px 0' }}>
      <button 
        className="admin-btn" 
        onClick={() => setShow(true)}
        style={{
          background: 'linear-gradient(135deg, #43d477, #2ecc71)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(67, 212, 119, 0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        👨‍🏫 Crear Docente
      </button>
      
      <Modal open={show} onClose={() => { setShow(false); resetForm(); }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #23272f, #2b2f38)', 
          borderRadius: 16, 
          padding: 32, 
          minWidth: 450,
          maxWidth: 500,
          border: '2px solid #353b48',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🏫</div>
            <h2 style={{ 
              color: '#bfc9d1', 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: 700 
            }}>
              Crear Nuevo Docente
            </h2>
            <p style={{ 
              color: '#888', 
              margin: '8px 0 0 0', 
              fontSize: '14px' 
            }}>
              Complete la información del nuevo docente
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Información Personal */}
            <div style={{ 
              background: '#1a1d23', 
              padding: 20, 
              borderRadius: 12, 
              border: '1px solid #353b48'
            }}>
              <h3 style={{ 
                color: '#43d477', 
                margin: '0 0 16 0', 
                fontSize: '16px', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📋 Información Personal
              </h3>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ 
                  display: 'block', 
                  color: '#bfc9d1', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  marginBottom: 6 
                }}>
                  Nombre Completo *
                </label>
                <input 
                  type="text" 
                  value={form.nombre} 
                  onChange={e => setForm({ ...form, nombre: e.target.value })} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #353b48',
                    background: '#23272f',
                    color: '#bfc9d1',
                    fontSize: '14px'
                  }}
                  placeholder="Dr. Juan Pérez González"
                  autoFocus
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#bfc9d1', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  marginBottom: 6 
                }}>
                  Email *
                </label>
                <input 
                  type="email" 
                  value={form.correo_electronico} 
                  onChange={e => setForm({ ...form, correo_electronico: e.target.value })} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #353b48',
                    background: '#23272f',
                    color: '#bfc9d1',
                    fontSize: '14px'
                  }}
                  placeholder="juan.perez@universidad.edu"
                />
              </div>
            </div>

            {/* Información Académica */}
            <div style={{ 
              background: '#1a1d23', 
              padding: 20, 
              borderRadius: 12, 
              border: '1px solid #353b48'
            }}>
              <h3 style={{ 
                color: '#f7b731', 
                margin: '0 0 16 0', 
                fontSize: '16px', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🎓 Información Académica
              </h3>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#bfc9d1', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  marginBottom: 6 
                }}>
                  Especialidad *
                </label>
                <select 
                  value={form.especialidad} 
                  onChange={e => setForm({ ...form, especialidad: e.target.value })} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #353b48',
                    background: '#23272f',
                    color: '#bfc9d1',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Seleccionar especialidad</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seguridad */}
            <div style={{ 
              background: '#1a1d23', 
              padding: 20, 
              borderRadius: 12, 
              border: '1px solid #353b48'
            }}>
              <h3 style={{ 
                color: '#e94560', 
                margin: '0 0 16 0', 
                fontSize: '16px', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔐 Seguridad
              </h3>
              
              <div style={{ marginBottom: 12 }}>
                <label style={{ 
                  display: 'block', 
                  color: '#bfc9d1', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  marginBottom: 6 
                }}>
                  Contraseña *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={form.contrasena} 
                    onChange={e => setForm({ ...form, contrasena: e.target.value })} 
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      fontSize: '14px'
                    }}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#888', 
                  marginTop: 4 
                }}>
                  Debe contener al menos 6 caracteres
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#bfc9d1', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  marginBottom: 6 
                }}>
                  Confirmar Contraseña *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={form.confirmPassword} 
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })} 
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      fontSize: '14px'
                    }}
                    placeholder="Repetir contraseña"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(v => !v)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            {/* Mensajes de error y éxito */}
            {error && (
              <div style={{ 
                background: 'linear-gradient(135deg, #e94560, #c0392b)', 
                color: 'white', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 600
              }}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{ 
                background: 'linear-gradient(135deg, #43d477, #2ecc71)', 
                color: 'white', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 600
              }}>
                {success}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  background: loading ? '#666' : 'linear-gradient(135deg, #43d477, #2ecc71)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  minWidth: 120,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? (
                  <>
                    <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
                    Creando...
                  </>
                ) : (
                  <>
                    ✅ Crear Docente
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => { setShow(false); resetForm(); }}
                style={{ 
                  background: '#353b48',
                  color: '#bfc9d1',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: 120,
                  transition: 'all 0.3s ease'
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>

          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </Modal>
    </div>
  );
}

export default CreateTeacher;
