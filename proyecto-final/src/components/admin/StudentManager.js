
import React, { useEffect, useState } from 'react';

function StudentManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/estudiantes');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener estudiantes');
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="admin-section">
      <h3>Gestión de Alumnos</h3>
      {loading && <div>Cargando...</div>}
      {error && <div style={{color:'#e94560'}}>{error}</div>}
      {!loading && !error && (
        <table className="admin-table" style={{width:'100%', borderCollapse:'collapse', background:'#23272f', borderRadius:10, boxShadow:'0 2px 12px #0002'}}>
          <thead>
            <tr style={{background:'#1a1d23', color:'#e94560'}}>
              <th style={{padding:'12px 8px'}}>ID</th>
              <th style={{padding:'12px 8px'}}>Nombre</th>
              <th style={{padding:'12px 8px'}}>Email</th>
              <th style={{padding:'12px 8px'}}>Semestre</th>
              <th style={{padding:'12px 8px'}}>Fecha de nacimiento</th>
            </tr>
          </thead>
          <tbody>
            {students.map(est => (
              <tr key={est.ID_Estudiante || est.id}>
                <td style={{padding:'10px 8px'}}>{est.ID_Estudiante || est.id}</td>
                <td style={{padding:'10px 8px'}}>{est.Nombre || est.nombre}</td>
                <td style={{padding:'10px 8px'}}>{est.Correo_electronico || est.correo_electronico}</td>
                <td style={{padding:'10px 8px'}}>{est.Semestre || est.semestre}</td>
                <td style={{padding:'10px 8px'}}>{est.Fecha_nacimiento || est.fecha_nacimiento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentManager;
