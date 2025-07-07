import React, { useState, useEffect } from 'react';

function StatsPanel() {
  const [stats, setStats] = useState({
    totalCursos: 0,
    totalProfesores: 0,
    totalEstudiantes: 0,
    totalModulos: 0,
    totalLecciones: 0,
    totalEvaluaciones: 0,
    cursosActivos: 0,
    estudiantesActivos: 0,
    promedioEvaluaciones: 0,
    leccionesCompletadas: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Función para cargar estadísticas reales
  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      // Obtener estadísticas generales
      const [cursosRes, profesoresRes, estudiantesRes] = await Promise.all([
        fetch('http://localhost:5000/api/cursos'),
        fetch('http://localhost:5000/api/profesores'),
        fetch('http://localhost:5000/api/estudiantes')
      ]);

      const cursos = await cursosRes.json();
      const profesores = await profesoresRes.json();
      const estudiantes = await estudiantesRes.json();

      // Obtener estadísticas detalladas de módulos, lecciones y evaluaciones
      let totalModulos = 0;
      let totalLecciones = 0;
      let totalEvaluaciones = 0;
      let leccionesCompletadas = 0;
      let sumaEvaluaciones = 0;
      let contadorEvaluaciones = 0;

      // Para cada curso, obtener sus módulos y lecciones
      for (const curso of cursos) {
        try {
          const modulosRes = await fetch(`http://localhost:5000/api/cursos/${curso.ID_Curso}/modulos`);
          if (modulosRes.ok) {
            const modulos = await modulosRes.json();
            totalModulos += modulos.length;
            
            for (const modulo of modulos) {
              if (modulo.lecciones) {
                totalLecciones += modulo.lecciones.length;
                
                for (const leccion of modulo.lecciones) {
                  if (leccion.evaluaciones) {
                    totalEvaluaciones += leccion.evaluaciones.length;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error obteniendo módulos del curso ${curso.ID_Curso}:`, error);
        }
      }

      // Obtener estadísticas de progreso y evaluaciones
      try {
        const progresoRes = await fetch('http://localhost:5000/api/progreso-lecciones');
        if (progresoRes.ok) {
          const progreso = await progresoRes.json();
          leccionesCompletadas = progreso.filter(p => p.Completado === 1).length;
        }
      } catch (error) {
        console.error('Error obteniendo progreso:', error);
      }

      try {
        const evaluacionesRes = await fetch('http://localhost:5000/api/resultados-evaluaciones');
        if (evaluacionesRes.ok) {
          const resultados = await evaluacionesRes.json();
          sumaEvaluaciones = resultados.reduce((sum, r) => sum + (r.Puntaje || 0), 0);
          contadorEvaluaciones = resultados.length;
        }
      } catch (error) {
        console.error('Error obteniendo resultados de evaluaciones:', error);
      }

      const promedioEvaluaciones = contadorEvaluaciones > 0 ? (sumaEvaluaciones / contadorEvaluaciones).toFixed(1) : 0;
      const cursosActivos = cursos.filter(c => c.Estado === 'activo').length;
      const estudiantesActivos = estudiantes.filter(e => e.Estado === 'activo').length;

      setStats({
        totalCursos: cursos.length,
        totalProfesores: profesores.length,
        totalEstudiantes: estudiantes.length,
        totalModulos,
        totalLecciones,
        totalEvaluaciones,
        cursosActivos,
        estudiantesActivos,
        promedioEvaluaciones: parseFloat(promedioEvaluaciones),
        leccionesCompletadas
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(cargarEstadisticas, 300000);
    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      title: '📚 Cursos Totales',
      value: stats.totalCursos,
      subtitle: `${stats.cursosActivos} activos`,
      color: '#f7b731',
      gradient: 'linear-gradient(135deg, #f7b731, #f39c12)',
      icon: '📚'
    },
    {
      title: '👨‍🏫 Profesores',
      value: stats.totalProfesores,
      subtitle: 'Docentes registrados',
      color: '#43d477',
      gradient: 'linear-gradient(135deg, #43d477, #2ecc71)',
      icon: '👨‍🏫'
    },
    {
      title: '👤 Estudiantes',
      value: stats.totalEstudiantes,
      subtitle: `${stats.estudiantesActivos} activos`,
      color: '#1e90ff',
      gradient: 'linear-gradient(135deg, #1e90ff, #3498db)',
      icon: '👤'
    },
    {
      title: '📖 Módulos',
      value: stats.totalModulos,
      subtitle: 'Contenido educativo',
      color: '#8854d0',
      gradient: 'linear-gradient(135deg, #8854d0, #9b59b6)',
      icon: '📖'
    },
    {
      title: '📝 Lecciones',
      value: stats.totalLecciones,
      subtitle: `${stats.leccionesCompletadas} completadas`,
      color: '#fd9644',
      gradient: 'linear-gradient(135deg, #fd9644, #e67e22)',
      icon: '📝'
    },
    {
      title: '📊 Evaluaciones',
      value: stats.totalEvaluaciones,
      subtitle: `Promedio: ${stats.promedioEvaluaciones}%`,
      color: '#e94560',
      gradient: 'linear-gradient(135deg, #e94560, #c0392b)',
      icon: '📊'
    }
  ];

  const getProgressPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="admin-section">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400,
          background: 'linear-gradient(135deg, #23272f, #2b2f38)',
          borderRadius: 16,
          border: '2px solid #353b48'
        }}>
          <div style={{ textAlign: 'center', color: '#bfc9d1' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Cargando estadísticas...</div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>Obteniendo datos en tiempo real</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400,
          background: 'linear-gradient(135deg, #23272f, #2b2f38)',
          borderRadius: 16,
          border: '2px solid #e94560'
        }}>
          <div style={{ textAlign: 'center', color: '#e94560' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Error al cargar estadísticas</div>
            <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>{error}</div>
            <button 
              onClick={cargarEstadisticas}
              style={{
                background: '#e94560',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                marginTop: 16,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-section">
      {/* Header con título y botón de actualización */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#bfc9d1', fontSize: '24px', fontWeight: 700 }}>
            📊 Panel de Estadísticas
          </h3>
          <div style={{ 
            fontSize: '14px', 
            color: '#888', 
            marginTop: 4 
          }}>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        <button 
          onClick={cargarEstadisticas}
          style={{
            background: 'linear-gradient(135deg, #43d477, #2ecc71)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(67, 212, 119, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          🔄 Actualizar Datos
        </button>
      </div>

      {/* Tarjetas de métricas principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 20, 
        marginBottom: 32 
      }}>
        {metricCards.map((card, index) => (
          <div key={index} style={{
            background: card.gradient,
            borderRadius: 16,
            padding: 24,
            color: card.title.includes('Cursos') ? '#23272f' : 'white',
            boxShadow: `0 8px 32px ${card.color}40`,
            border: `2px solid ${card.color}30`,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = `0 12px 40px ${card.color}60`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = `0 8px 32px ${card.color}40`;
          }}
          >
            <div style={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              fontSize: 80, 
              opacity: 0.1,
              transform: 'rotate(15deg)'
            }}>
              {card.icon}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                marginBottom: 8,
                opacity: 0.9
              }}>
                {card.title}
              </div>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 700, 
                marginBottom: 4 
              }}>
                {card.value.toLocaleString()}
              </div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8,
                fontWeight: 500
              }}>
                {card.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de progreso y análisis */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: 24 
      }}>
        {/* Progreso de lecciones */}
        <div style={{
          background: 'linear-gradient(135deg, #23272f, #2b2f38)',
          borderRadius: 16,
          padding: 24,
          border: '2px solid #353b48',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h4 style={{ 
            margin: '0 0 20px 0', 
            color: '#bfc9d1', 
            fontSize: '18px', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📈 Progreso de Lecciones
          </h4>
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: 8 
            }}>
              <span style={{ color: '#bfc9d1', fontSize: '14px' }}>
                Lecciones completadas
              </span>
              <span style={{ color: '#43d477', fontWeight: 600 }}>
                {getProgressPercentage(stats.leccionesCompletadas, stats.totalLecciones)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: 12,
              background: '#353b48',
              borderRadius: 6,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${getProgressPercentage(stats.leccionesCompletadas, stats.totalLecciones)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #43d477, #2ecc71)',
                borderRadius: 6,
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 16 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#43d477' }}>
                {stats.leccionesCompletadas}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Completadas</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fd9644' }}>
                {stats.totalLecciones - stats.leccionesCompletadas}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>Pendientes</div>
            </div>
          </div>
        </div>

        {/* Rendimiento de evaluaciones */}
        <div style={{
          background: 'linear-gradient(135deg, #23272f, #2b2f38)',
          borderRadius: 16,
          padding: 24,
          border: '2px solid #353b48',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h4 style={{ 
            margin: '0 0 20px 0', 
            color: '#bfc9d1', 
            fontSize: '18px', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎯 Rendimiento de Evaluaciones
          </h4>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 700, 
              color: stats.promedioEvaluaciones >= 70 ? '#43d477' : 
                     stats.promedioEvaluaciones >= 50 ? '#fd9644' : '#e94560',
              marginBottom: 8
            }}>
              {stats.promedioEvaluaciones}%
            </div>
            <div style={{ fontSize: '14px', color: '#888' }}>
              Promedio general
            </div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: 12 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#43d477' }}>
                {stats.totalEvaluaciones}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e90ff' }}>
                {stats.totalEstudiantes}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>Estudiantes</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#f7b731' }}>
                {stats.totalProfesores}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>Profesores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div style={{
        marginTop: 24,
        background: 'linear-gradient(135deg, #23272f, #2b2f38)',
        borderRadius: 16,
        padding: 20,
        border: '2px solid #353b48',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '14px', 
          color: '#bfc9d1', 
          marginBottom: 8,
          fontWeight: 600
        }}>
          💡 Información del Sistema
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#888',
          lineHeight: 1.6
        }}>
          <span style={{ color: '#43d477' }}>🔄 Actualización automática</span> cada 5 minutos • 
          <span style={{ color: '#f7b731' }}> 📊 Datos en tiempo real</span> desde la base de datos • 
          <span style={{ color: '#1e90ff' }}> 📈 Métricas dinámicas</span> de rendimiento educativo
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;
