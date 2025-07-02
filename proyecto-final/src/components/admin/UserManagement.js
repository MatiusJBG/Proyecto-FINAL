import React, { useState } from 'react';
import StudentManager from './StudentManager';
import TeacherManager from './TeacherManager';
import './UserManagement.css';

function UserManagement() {
  const [active, setActive] = useState('alumnos');
  return (
    <div className="admin-section">
      <h3>Gestión de Usuarios</h3>
      <div className="admin-user-btns">
        <button className={`admin-btn${active === 'alumnos' ? ' active' : ''}`} onClick={() => setActive('alumnos')}>
          Alumnos
        </button>
        <button className={`admin-btn${active === 'docentes' ? ' active' : ''}`} onClick={() => setActive('docentes')}>
          Docentes
        </button>
      </div>
      {active === 'alumnos' && <StudentManager />}
      {active === 'docentes' && <TeacherManager />}
    </div>
  );
}

export default UserManagement;
