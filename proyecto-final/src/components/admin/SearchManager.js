import React from 'react';

import { useState } from 'react';

function SearchManager({ data }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);

  const buscar = (e) => {
    const texto = e.target.value;
    setQuery(texto);
    if (!texto) {
      setResultados([]);
      return;
    }
    // Búsqueda en cursos, módulos, lecciones y materiales
    const res = [];
    data.cursos.forEach(curso => {
      if (curso.nombre.toLowerCase().includes(texto.toLowerCase())) {
        res.push({ tipo: 'Curso', nombre: curso.nombre });
      }
      curso.modulos.forEach(modulo => {
        if (modulo.nombre.toLowerCase().includes(texto.toLowerCase())) {
          res.push({ tipo: 'Módulo', nombre: modulo.nombre, curso: curso.nombre });
        }
        modulo.lecciones.forEach(leccion => {
          if (leccion.nombre.toLowerCase().includes(texto.toLowerCase())) {
            res.push({ tipo: 'Lección', nombre: leccion.nombre, modulo: modulo.nombre, curso: curso.nombre });
          }
          (leccion.materiales || []).forEach(mat => {
            if (mat.nombre.toLowerCase().includes(texto.toLowerCase())) {
              res.push({ tipo: 'Material', nombre: mat.nombre, leccion: leccion.nombre, modulo: modulo.nombre, curso: curso.nombre });
            }
          });
        });
      });
    });
    setResultados(res);
  };

  return (
    <div className="admin-section">
      <h3>Gestión de Búsqueda</h3>
      <input
        className="admin-input"
        type="text"
        placeholder="Buscar en toda la plataforma..."
        value={query}
        onChange={buscar}
      />
      <ul className="admin-list">
        {resultados.map((item, idx) => (
          <li key={idx}>
            <b>{item.tipo}:</b> {item.nombre}
            {item.curso && <> | <b>Curso:</b> {item.curso}</>}
            {item.modulo && <> | <b>Módulo:</b> {item.modulo}</>}
            {item.leccion && <> | <b>Lección:</b> {item.leccion}</>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchManager;
