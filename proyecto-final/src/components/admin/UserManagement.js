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
      <div style={{background:'#23272f', borderRadius:10, boxShadow:'0 2px 12px #0002', padding:24}}>
        {active === 'alumnos' && <StudentManager key="alumnos" />}
        {active === 'docentes' && <TeacherManager key="docentes" />}
      </div>
    </div>
  );
}

export default UserManagement;
