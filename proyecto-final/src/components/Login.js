import React, { useState } from 'react';
import './Login.css';


function Login({ onLogin, onlyTeacher }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Error de autenticación');
        return;
      }
      if (onLogin) onLogin(role, data);
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="brand-title">NewGenEdu</h1>
        <h2 className="login-title">Iniciar Sesión</h2>
        {error && (
          <div className="custom-error">
            <span className="custom-error-icon">!&#x1F6A8;</span>
            <span>{error}</span>
          </div>
        )}
        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {!onlyTeacher && (
          <div className="input-group">
            <label htmlFor="role">Tipo de Usuario</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="teacher">Profesor</option>
              <option value="student">Estudiante</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        )}
        {onlyTeacher && (
          <input type="hidden" value="teacher" />
        )}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;

