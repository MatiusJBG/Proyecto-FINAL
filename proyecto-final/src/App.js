import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('admin'); // Simulación de rol

  // Función para manejar el login exitoso
  const handleLogin = () => setIsAuthenticated(true);

  return (
    isAuthenticated ? (
      role === 'admin' ? <AdminPanel /> : <div>Panel de usuario</div>
    ) : (
      <Login onLogin={handleLogin} />
    )
  );
}

export default App;
