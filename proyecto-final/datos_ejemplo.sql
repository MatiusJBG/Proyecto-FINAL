-- Script para insertar datos de ejemplo en la base de datos
-- Ejecutar después de crear las tablas

USE proyecto;

-- Insertar administradores de ejemplo
INSERT INTO Administradores (Nombre, Correo_electronico, Contrasena) VALUES
('Admin Principal', 'admin@universidad.edu', 'admin123'),
('Admin Secundario', 'admin2@universidad.edu', 'admin456');

-- Insertar profesores de ejemplo
INSERT INTO Profesores (Nombre, Correo_electronico, Contrasena, Especialidad) VALUES
('Dr. María González', 'maria.gonzalez@universidad.edu', 'prof123', 'Matemáticas'),
('Dr. Carlos Rodríguez', 'carlos.rodriguez@universidad.edu', 'prof456', 'Física'),
('Dra. Ana Martínez', 'ana.martinez@universidad.edu', 'prof789', 'Programación'),
('Dr. Luis Pérez', 'luis.perez@universidad.edu', 'prof101', 'Ingeniería');

-- Insertar estudiantes de ejemplo
INSERT INTO Estudiantes (Nombre, Correo_electronico, Contrasena, Semestre, Fecha_nacimiento) VALUES
('Juan Pérez', 'juan.perez@estudiante.edu', 'est123', 3, '2000-05-15'),
('María López', 'maria.lopez@estudiante.edu', 'est456', 2, '2001-08-22'),
('Carlos García', 'carlos.garcia@estudiante.edu', 'est789', 4, '1999-12-10'),
('Ana Torres', 'ana.torres@estudiante.edu', 'est101', 1, '2002-03-28'),
('Luis Morales', 'luis.morales@estudiante.edu', 'est202', 5, '1998-11-05');

-- Insertar cursos de ejemplo
INSERT INTO Cursos (Nombre, Descripcion, Estado, Duracion_estimada, ID_Profesor) VALUES
('Matemáticas Avanzadas', 'Curso avanzado de matemáticas para ingeniería', 'activo', 60, 1),
('Física Cuántica', 'Introducción a la física cuántica moderna', 'activo', 45, 2),
('Programación Web', 'Desarrollo de aplicaciones web modernas', 'activo', 80, 3),
('Estructuras de Datos', 'Algoritmos y estructuras de datos fundamentales', 'activo', 50, 3),
('Cálculo Diferencial', 'Fundamentos del cálculo diferencial', 'activo', 40, 1),
('Mecánica Clásica', 'Principios de la mecánica newtoniana', 'activo', 55, 2);

-- Insertar módulos para el curso "Matemáticas Avanzadas"
INSERT INTO Modulos (ID_Curso, Nombre, Descripcion, Orden, Duracion_estimada) VALUES
(1, 'Álgebra Lineal', 'Fundamentos del álgebra lineal', 1, 120),
(1, 'Cálculo Vectorial', 'Cálculo en múltiples variables', 2, 150),
(1, 'Ecuaciones Diferenciales', 'Solución de ecuaciones diferenciales', 3, 180);

-- Insertar módulos para el curso "Programación Web"
INSERT INTO Modulos (ID_Curso, Nombre, Descripcion, Orden, Duracion_estimada) VALUES
(3, 'HTML y CSS', 'Fundamentos de marcado y estilos', 1, 90),
(3, 'JavaScript Básico', 'Programación del lado del cliente', 2, 120),
(3, 'React.js', 'Desarrollo de interfaces modernas', 3, 150),
(3, 'Backend con Node.js', 'Desarrollo del lado del servidor', 4, 180);

-- Insertar lecciones para el módulo "Álgebra Lineal"
INSERT INTO Lecciones (ID_Modulo, Nombre, Contenido, Duracion_estimada, Orden, Es_obligatoria) VALUES
(1, 'Vectores y Matrices', 'Introducción a vectores y matrices básicas', 30, 1, TRUE),
(1, 'Operaciones con Matrices', 'Suma, resta y multiplicación de matrices', 45, 2, TRUE),
(1, 'Determinantes', 'Cálculo y propiedades de determinantes', 40, 3, TRUE),
(1, 'Sistemas de Ecuaciones', 'Resolución de sistemas lineales', 50, 4, TRUE);

-- Insertar lecciones para el módulo "HTML y CSS"
INSERT INTO Lecciones (ID_Modulo, Nombre, Contenido, Duracion_estimada, Orden, Es_obligatoria) VALUES
(4, 'Estructura HTML', 'Elementos básicos de HTML5', 25, 1, TRUE),
(4, 'Estilos CSS', 'Fundamentos de CSS y selectores', 35, 2, TRUE),
(4, 'Layout y Flexbox', 'Diseño responsive con flexbox', 40, 3, TRUE),
(4, 'Grid CSS', 'Sistemas de grid modernos', 30, 4, TRUE);

-- Insertar evaluaciones
INSERT INTO Evaluaciones (ID_Leccion, ID_Modulo, Nombre, Descripcion, Puntaje_aprobacion, Max_intentos) VALUES
(1, NULL, 'Quiz Vectores', 'Evaluación sobre conceptos básicos de vectores', 70.00, 3),
(2, NULL, 'Examen Matrices', 'Evaluación completa sobre operaciones matriciales', 75.00, 2),
(NULL, 1, 'Examen Final Álgebra', 'Evaluación final del módulo de álgebra lineal', 80.00, 1),
(5, NULL, 'Quiz HTML', 'Evaluación sobre estructura HTML', 70.00, 3),
(6, NULL, 'Proyecto CSS', 'Proyecto práctico de estilos CSS', 75.00, 2),
(NULL, 4, 'Examen Final Web', 'Evaluación final del módulo de HTML y CSS', 80.00, 1);

-- Insertar recursos
INSERT INTO Recursos (ID_Leccion, Tipo, URL, Nombre, Duracion, Orden) VALUES
(1, 'video', 'https://example.com/video-vectores.mp4', 'Video: Introducción a Vectores', 15, 1),
(1, 'documento', 'https://example.com/pdf-vectores.pdf', 'PDF: Teoría de Vectores', NULL, 2),
(1, 'enlace', 'https://www.khanacademy.org/vectors', 'Khan Academy: Vectores', NULL, 3),
(2, 'video', 'https://example.com/video-matrices.mp4', 'Video: Operaciones Matriciales', 20, 1),
(2, 'presentacion', 'https://example.com/slides-matrices.pptx', 'Presentación: Matrices', NULL, 2),
(5, 'video', 'https://example.com/video-html.mp4', 'Video: HTML Básico', 12, 1),
(5, 'documento', 'https://example.com/guia-html.pdf', 'Guía HTML Completa', NULL, 2),
(6, 'video', 'https://example.com/video-css.mp4', 'Video: CSS Fundamentos', 18, 1),
(6, 'enlace', 'https://developer.mozilla.org/css', 'MDN: CSS Reference', NULL, 2);

-- Insertar matrículas de ejemplo
INSERT INTO Matriculas (ID_Estudiante, ID_Curso, Estado, Progreso_total) VALUES
(1, 1, 'activo', 25.00),
(1, 3, 'activo', 60.00),
(2, 1, 'activo', 45.00),
(2, 4, 'activo', 30.00),
(3, 2, 'activo', 15.00),
(3, 3, 'activo', 80.00),
(4, 1, 'activo', 10.00),
(5, 3, 'activo', 90.00);

-- Insertar progreso en lecciones
INSERT INTO Progreso_Lecciones (ID_Estudiante, ID_Leccion, Completado, Tiempo_dedicado, Fecha_inicio, Fecha_ultimo_acceso, Veces_accedido) VALUES
(1, 1, TRUE, 35, '2024-01-15 10:00:00', '2024-01-15 10:35:00', 2),
(1, 2, TRUE, 50, '2024-01-16 14:00:00', '2024-01-16 14:50:00', 1),
(1, 3, FALSE, 20, '2024-01-17 09:00:00', '2024-01-17 09:20:00', 1),
(1, 5, TRUE, 30, '2024-01-10 11:00:00', '2024-01-10 11:30:00', 1),
(1, 6, TRUE, 45, '2024-01-11 15:00:00', '2024-01-11 15:45:00', 2),
(1, 7, TRUE, 40, '2024-01-12 13:00:00', '2024-01-12 13:40:00', 1),
(2, 1, TRUE, 40, '2024-01-14 10:00:00', '2024-01-14 10:40:00', 1),
(2, 2, TRUE, 55, '2024-01-15 14:00:00', '2024-01-15 14:55:00', 1),
(2, 3, TRUE, 45, '2024-01-16 09:00:00', '2024-01-16 09:45:00', 1),
(3, 5, TRUE, 25, '2024-01-08 11:00:00', '2024-01-08 11:25:00', 1),
(3, 6, TRUE, 35, '2024-01-09 15:00:00', '2024-01-09 15:35:00', 1),
(3, 7, TRUE, 30, '2024-01-10 13:00:00', '2024-01-10 13:30:00', 1),
(3, 8, TRUE, 50, '2024-01-11 16:00:00', '2024-01-11 16:50:00', 2);

-- Insertar resultados de evaluaciones
INSERT INTO Resultados_Evaluaciones (ID_Estudiante, ID_Evaluacion, Puntaje, Tiempo_utilizado) VALUES
(1, 1, 85.50, 25),
(1, 2, 78.00, 45),
(1, 4, 92.00, 20),
(1, 5, 88.50, 35),
(2, 1, 72.00, 30),
(2, 2, 81.50, 50),
(3, 4, 95.00, 15),
(3, 5, 90.00, 30),
(3, 6, 85.00, 40);

-- Insertar accesos a recursos
INSERT INTO Accesos_Recursos (ID_Estudiante, ID_Recurso, Veces_accedido, Tiempo_total, Fecha_primer_acceso, Fecha_ultimo_acceso) VALUES
(1, 1, 2, 1800, '2024-01-15 10:00:00', '2024-01-15 10:30:00'),
(1, 2, 1, 1200, '2024-01-15 10:35:00', '2024-01-15 10:55:00'),
(1, 4, 1, 2400, '2024-01-16 14:00:00', '2024-01-16 14:40:00'),
(1, 6, 1, 1440, '2024-01-10 11:00:00', '2024-01-10 11:24:00'),
(1, 7, 1, 1800, '2024-01-10 11:30:00', '2024-01-10 12:00:00'),
(2, 1, 1, 1800, '2024-01-14 10:00:00', '2024-01-14 10:30:00'),
(2, 2, 1, 1500, '2024-01-14 10:40:00', '2024-01-14 11:05:00'),
(3, 6, 1, 1440, '2024-01-08 11:00:00', '2024-01-08 11:24:00'),
(3, 7, 1, 1800, '2024-01-08 11:30:00', '2024-01-08 12:00:00'),
(3, 8, 2, 3600, '2024-01-09 15:00:00', '2024-01-09 16:00:00');

-- Insertar reglas de recomendación (árbol de decisión)
INSERT INTO Reglas_Recomendacion (Nombre, Condicion, Nodo_padre_id, Nodo_verdadero_id, Nodo_falso_id, Accion_recomendada, Es_nodo_final, Prioridad) VALUES
('Evaluar Puntaje Promedio', 'promedio_puntajes < 70', NULL, 2, 3, NULL, FALSE, 1),
('Recomendar Refuerzo', NULL, 1, NULL, NULL, 'Repasar módulos anteriores y practicar más ejercicios', TRUE, 2),
('Evaluar Progreso', 'promedio_progreso < 50', 1, 4, 5, NULL, FALSE, 3),
('Recomendar Más Tiempo', NULL, 3, NULL, NULL, 'Dedicar más tiempo al estudio y completar lecciones pendientes', TRUE, 4),
('Evaluar Aprobación', 'evaluaciones_aprobadas/total_evaluaciones < 0.8', 3, 6, 7, NULL, FALSE, 5),
('Recomendar Revisión', NULL, 5, NULL, NULL, 'Revisar conceptos clave antes de las evaluaciones', TRUE, 6),
('Recomendar Continuar', NULL, 5, NULL, NULL, '¡Excelente progreso! Continúa con el siguiente módulo', TRUE, 7);

-- Insertar historial de recomendaciones
INSERT INTO Historial_Recomendaciones (ID_Estudiante, ID_Regla, Accion_tomada, Fue_seguida) VALUES
(1, 2, 'Repasar módulos anteriores y practicar más ejercicios', TRUE),
(1, 4, 'Dedicar más tiempo al estudio y completar lecciones pendientes', FALSE),
(2, 2, 'Repasar módulos anteriores y practicar más ejercicios', TRUE),
(3, 7, '¡Excelente progreso! Continúa con el siguiente módulo', TRUE),
(4, 2, 'Repasar módulos anteriores y practicar más ejercicios', NULL),
(5, 7, '¡Excelente progreso! Continúa con el siguiente módulo', TRUE);

-- Actualizar progreso total de cursos basado en lecciones completadas
UPDATE Matriculas SET Progreso_total = 25.00 WHERE ID_Estudiante = 1 AND ID_Curso = 1;
UPDATE Matriculas SET Progreso_total = 60.00 WHERE ID_Estudiante = 1 AND ID_Curso = 3;
UPDATE Matriculas SET Progreso_total = 45.00 WHERE ID_Estudiante = 2 AND ID_Curso = 1;
UPDATE Matriculas SET Progreso_total = 30.00 WHERE ID_Estudiante = 2 AND ID_Curso = 4;
UPDATE Matriculas SET Progreso_total = 15.00 WHERE ID_Estudiante = 3 AND ID_Curso = 2;
UPDATE Matriculas SET Progreso_total = 80.00 WHERE ID_Estudiante = 3 AND ID_Curso = 3;
UPDATE Matriculas SET Progreso_total = 10.00 WHERE ID_Estudiante = 4 AND ID_Curso = 1;
UPDATE Matriculas SET Progreso_total = 90.00 WHERE ID_Estudiante = 5 AND ID_Curso = 3;

SELECT 'Datos de ejemplo insertados correctamente' as Mensaje; 