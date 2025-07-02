
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
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Semestre</th>
              <th>Fecha de nacimiento</th>
            </tr>
          </thead>
          <tbody>
            {students.map(est => (
              <tr key={est.ID_Estudiante || est.id}>
                <td>{est.ID_Estudiante || est.id}</td>
                <td>{est.Nombre || est.nombre}</td>
                <td>{est.Correo_electronico || est.correo_electronico}</td>
                <td>{est.Semestre || est.semestre}</td>
                <td>{est.Fecha_nacimiento || est.fecha_nacimiento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentManager;
