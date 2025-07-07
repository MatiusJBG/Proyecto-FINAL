import React, { useState } from 'react';
import Modal from './Modal';

function CreateUser() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    semestre: 1,
    fecha_nacimiento: '',
    telefono: '',
    direccion: '',
    programa: '',
    genero: '',
    estado: 'activo'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const programas = [
    'Ingeniería de Sistemas', 'Ingeniería Informática', 'Ingeniería de Software',
    'Tecnología en Sistemas', 'Tecnología en Informática', 'Tecnología en Software',
    'Ingeniería Civil', 'Ingeniería Mecánica', 'Ingeniería Eléctrica',
    'Ingeniería Industrial', 'Ingeniería Química', 'Ingeniería Ambiental',
    'Administración de Empresas', 'Contaduría Pública', 'Economía',
    'Finanzas', 'Marketing', 'Recursos Humanos', 'Comercio Internacional',
    'Medicina', 'Enfermería', 'Odontología', 'Fisioterapia', 'Psicología',
    'Derecho', 'Ciencias Políticas', 'Sociología', 'Antropología',
    'Historia', 'Geografía', 'Literatura', 'Lingüística', 'Filosofía',
    'Matemáticas', 'Física', 'Química', 'Biología', 'Estadística',
    'Arquitectura', 'Diseño Gráfico', 'Diseño Industrial', 'Arte',
    'Música', 'Deportes', 'Educación', 'Otro'
  ];

  const generos = [
    'Masculino', 'Femenino', 'No binario', 'Prefiero no decir'
  ];

  const validateForm = () => {
    if (!form.nombre.trim() || !form.apellidos.trim()) {
      setError('El nombre y apellidos son obligatorios');
      return false;
    }
    if (!form.email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError('El email no es válido');
      return false;
    }
    if (!form.password) {
      setError('La contraseña es obligatoria');
      return false;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (!form.fecha_nacimiento) {
      setError('La fecha de nacimiento es obligatoria');
      return false;
    }
    
    // Validar edad mínima (16 años)
    const fechaNac = new Date(form.fecha_nacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    if (edad < 16) {
      setError('El estudiante debe tener al menos 16 años');
      return false;
    }
    
    if (form.semestre < 1 || form.semestre > 12) {
      setError('El semestre debe estar entre 1 y 12');
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

    const endpoint = 'http://localhost:5000/api/estudiantes';
    const payload = {
      nombre: `${form.nombre} ${form.apellidos}`.trim(),
      correo_electronico: form.email.trim(),
      contrasena: form.password,
      semestre: parseInt(form.semestre),
      fecha_nacimiento: form.fecha_nacimiento,
      telefono: form.telefono || null,
      direccion: form.direccion || null,
      programa: form.programa || null,
      genero: form.genero || null,
      activo: form.estado === 'activo'
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Error al crear estudiante');
        return;
      }
      
      setSuccess('✅ Estudiante creado correctamente');
      setForm({
        nombre: '', apellidos: '', email: '', password: '', confirmPassword: '',
        semestre: 1, fecha_nacimiento: '', telefono: '', direccion: '',
        programa: '', genero: '', estado: 'activo'
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
      nombre: '', apellidos: '', email: '', password: '', confirmPassword: '',
      semestre: 1, fecha_nacimiento: '', telefono: '', direccion: '',
      programa: '', genero: '', estado: 'activo'
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
          background: 'linear-gradient(135deg, #1e90ff, #3498db)',
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
          boxShadow: '0 4px 12px rgba(30, 144, 255, 0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        👤 Crear Estudiante
      </button>
      
      <Modal open={show} onClose={() => { setShow(false); resetForm(); }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #23272f, #2b2f38)', 
          borderRadius: 16, 
          padding: 32, 
          minWidth: 500,
          maxWidth: 600,
          border: '2px solid #353b48',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
            <h2 style={{ 
              color: '#bfc9d1', 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: 700 
            }}>
              Crear Nuevo Estudiante
            </h2>
            <p style={{ 
              color: '#888', 
              margin: '8px 0 0 0', 
              fontSize: '14px' 
            }}>
              Complete la información del nuevo estudiante
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
                color: '#1e90ff', 
                margin: '0 0 16 0', 
                fontSize: '16px', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📋 Información Personal
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#bfc9d1', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    marginBottom: 6 
                  }}>
                    Nombre *
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
                    placeholder="Primer nombre"
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
                    Apellidos *
                  </label>
                  <input 
                    type="text" 
                    value={form.apellidos} 
                    onChange={e => setForm({ ...form, apellidos: e.target.value })} 
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      fontSize: '14px'
                    }}
                    placeholder="Apellidos"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
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
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      fontSize: '14px'
                    }}
                    placeholder="correo@estudiante.edu"
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
                    Teléfono
                  </label>
                  <input 
                    type="tel" 
                    value={form.telefono} 
                    onChange={e => setForm({ ...form, telefono: e.target.value })} 
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      fontSize: '14px'
                    }}
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={{ 
                  display: 'block', 
                  color: '#bfc9d1', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  marginBottom: 6 
                }}>
                  Dirección
                </label>
                <input 
                  type="text" 
                  value={form.direccion} 
                  onChange={e => setForm({ ...form, direccion: e.target.value })} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #353b48',
                    background: '#23272f',
                    color: '#bfc9d1',
                    fontSize: '14px'
                  }}
                  placeholder="Dirección de residencia"
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#bfc9d1', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    marginBottom: 6 
                  }}>
                    Programa
                  </label>
                  <select 
                    value={form.programa} 
                    onChange={e => setForm({ ...form, programa: e.target.value })} 
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
                    <option value="">Seleccionar programa</option>
                    {programas.map(prog => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#bfc9d1', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    marginBottom: 6 
                  }}>
                    Semestre *
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max="12"
                    value={form.semestre} 
                    onChange={e => setForm({ ...form, semestre: e.target.value })} 
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      fontSize: '14px'
                    }}
                    placeholder="1-12"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    color: '#bfc9d1', 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    marginBottom: 6 
                  }}>
                    Fecha de Nacimiento *
                  </label>
                  <input 
                    type="date" 
                    value={form.fecha_nacimiento} 
                    onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} 
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      fontSize: '14px'
                    }}
                    max={new Date().toISOString().split('T')[0]}
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
                    Género
                  </label>
                  <select 
                    value={form.genero} 
                    onChange={e => setForm({ ...form, genero: e.target.value })} 
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
                    <option value="">Seleccionar género</option>
                    {generos.map(gen => (
                      <option key={gen} value={gen}>{gen}</option>
                    ))}
                  </select>
                </div>
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
                    value={form.password} 
                    onChange={e => setForm({ ...form, password: e.target.value })} 
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #353b48',
                      background: '#23272f',
                      color: '#bfc9d1',
                      fontSize: '14px'
                    }}
                    placeholder="Mínimo 8 caracteres"
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
                  Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número
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

            {/* Estado */}
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
                ⚙️ Estado
              </h3>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox" 
                  checked={form.estado === 'activo'} 
                  onChange={e => setForm({ ...form, estado: e.target.checked ? 'activo' : 'inactivo' })} 
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#43d477'
                  }}
                />
                <span style={{ color: '#bfc9d1', fontSize: '14px' }}>
                  Estudiante activo (puede acceder al sistema)
                </span>
              </label>
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
                  background: loading ? '#666' : 'linear-gradient(135deg, #1e90ff, #3498db)',
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
                    ✅ Crear Estudiante
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

export default CreateUser;
