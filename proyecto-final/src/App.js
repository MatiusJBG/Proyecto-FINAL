import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import TeacherPanel from './components/TeacherPanel';
import StudentDashboard from './components/StudentDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('teacher'); // Cambiado a teacher para probar
  const [userData, setUserData] = useState(null);

  // Función para manejar el login exitoso
  const handleLogin = (userRole, user) => {
    setIsAuthenticated(true);
    setRole(userRole);
    setUserData(user);
  };

  // Función para manejar el logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUserData(null);
  };

  const renderPanel = () => {
    switch (role) {
      case 'admin':
        return <AdminPanel onLogout={handleLogout} />;
      case 'teacher':
        return <TeacherPanel onLogout={handleLogout} userData={userData} />;
      case 'student':
        return <StudentDashboard onLogout={handleLogout} userData={userData} />;
      default:
        return <div>Panel de usuario</div>;
    }
  };

  return (
    isAuthenticated ? (
      renderPanel()
    ) : (
      <Login onLogin={handleLogin} />
    )
  );
}

export default App;
