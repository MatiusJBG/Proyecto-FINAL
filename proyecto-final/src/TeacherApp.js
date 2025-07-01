import React, { useState } from 'react';
import TeacherPanel from './components/TeacherPanel';
import Login from './components/Login';

function TeacherApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (role, user) => {
    if (role === 'teacher') {
      setIsAuthenticated(true);
      setUserData(user);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
  };

  return isAuthenticated
    ? <TeacherPanel onLogout={handleLogout} userData={userData} />
    : <Login onLogin={handleLogin} onlyTeacher />;
}

export default TeacherApp; 