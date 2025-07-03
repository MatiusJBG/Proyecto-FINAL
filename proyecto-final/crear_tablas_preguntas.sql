-- Script para crear las tablas de preguntas y opciones
-- Ejecutar en MySQL si las tablas no existen

USE proyecto;

-- Crear tabla preguntas si no existe
CREATE TABLE IF NOT EXISTS preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evaluacion INT NOT NULL,
    texto VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'seleccion_multiple',
    orden INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evaluacion) REFERENCES evaluaciones(ID_Evaluacion) ON DELETE CASCADE
);

-- Crear tabla opciones si no existe
CREATE TABLE IF NOT EXISTS opciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pregunta INT NOT NULL,
    texto VARCHAR(300) NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT 0,
    orden INT DEFAULT 1,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas(id) ON DELETE CASCADE
);

-- Crear tabla respuestas_estudiantes si no existe
CREATE TABLE IF NOT EXISTS respuestas_estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_pregunta INT NOT NULL,
    id_opcion INT NOT NULL,
    fecha_respuesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_opcion) REFERENCES opciones(id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_preguntas_evaluacion ON preguntas(id_evaluacion);
CREATE INDEX IF NOT EXISTS idx_opciones_pregunta ON opciones(id_pregunta);
CREATE INDEX IF NOT EXISTS idx_opciones_orden ON opciones(id_pregunta, orden);

-- Verificar que las tablas se crearon correctamente
SELECT 'Tabla preguntas:' as Tabla, COUNT(*) as Registros FROM preguntas
UNION ALL
SELECT 'Tabla opciones:' as Tabla, COUNT(*) as Registros FROM opciones
UNION ALL
SELECT 'Tabla respuestas_estudiantes:' as Tabla, COUNT(*) as Registros FROM respuestas_estudiantes;

-- Mostrar estructura de las tablas
DESCRIBE preguntas;
DESCRIBE opciones;
DESCRIBE respuestas_estudiantes;

SELECT 'Tablas de preguntas y opciones creadas/verificadas correctamente' as Mensaje; 