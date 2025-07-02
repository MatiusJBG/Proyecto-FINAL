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

  // Función para mostrar los cursos asignados correctamente
  // Ahora Cursos siempre es un array de objetos {ID_Curso, Nombre}
  const getCursosAsignados = (doc) => {
    if (Array.isArray(doc.Cursos) && doc.Cursos.length > 0) {
      // Si el curso viene como objeto con Nombre o nombre
      return doc.Cursos.map(c => c.Nombre || c.nombre || c.nombre_curso || c.Nombre_curso).join(', ');
    }
    return 'Sin asignar';
  };

  return (
    <div className="admin-section">
      <h3>Gestión de Docentes</h3>
      {loading && <div>Cargando...</div>}
      {error && <div style={{color:'#e94560'}}>{error}</div>}
      {!loading && !error && (
        <table className="admin-table" style={{width:'100%', borderCollapse:'collapse', background:'#23272f', borderRadius:10, boxShadow:'0 2px 12px #0002'}}>
          <thead>
            <tr style={{background:'#1a1d23', color:'#e94560'}}>
              <th style={{padding:'12px 8px'}}>ID</th>
              <th style={{padding:'12px 8px'}}>Nombre</th>
              <th style={{padding:'12px 8px'}}>Email</th>
              <th style={{padding:'12px 8px'}}>Especialidad</th>
              <th style={{padding:'12px 8px'}}>Curso</th>
              <th style={{padding:'12px 8px'}}>Fecha de registro</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(doc => (
              <tr key={doc.ID_Profesor || doc.id}>
                <td style={{padding:'10px 8px'}}>{doc.ID_Profesor || doc.id}</td>
                <td style={{padding:'10px 8px'}}>{doc.Nombre || doc.nombre}</td>
                <td style={{padding:'10px 8px'}}>{doc.Correo_electronico || doc.correo_electronico}</td>
                <td style={{padding:'10px 8px'}}>{doc.Especialidad || doc.especialidad}</td>
                <td style={{padding:'10px 8px'}}>{getCursosAsignados(doc)}</td>
                <td style={{padding:'10px 8px'}}>{doc.Fecha_registro || doc.fecha_registro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeacherManager;
