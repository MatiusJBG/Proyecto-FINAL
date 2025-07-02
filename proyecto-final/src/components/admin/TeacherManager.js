
import React, { useEffect, useState } from 'react';

function TeacherManager() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profesores');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener docentes');
        setTeachers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="admin-section">
      <h3>Gestión de Docentes</h3>
      {loading && <div>Cargando...</div>}
      {error && <div style={{color:'#e94560'}}>{error}</div>}
      {!loading && !error && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Especialidad</th>
              <th>Fecha de registro</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(doc => (
              <tr key={doc.ID_Profesor || doc.id}>
                <td>{doc.ID_Profesor || doc.id}</td>
                <td>{doc.Nombre || doc.nombre}</td>
                <td>{doc.Correo_electronico || doc.correo_electronico}</td>
                <td>{doc.Especialidad || doc.especialidad}</td>
                <td>{doc.Fecha_registro || doc.fecha_registro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeacherManager;
