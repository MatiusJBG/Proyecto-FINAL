import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para manejar el login exitoso
  const handleLogin = () => setIsAuthenticated(true);

  return (
    isAuthenticated ? (
      <StudentDashboard />
    ) : (
      <Login onLogin={handleLogin} />
    )
  );
}

export default App;
