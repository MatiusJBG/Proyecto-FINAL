from flask import Flask, jsonify, request
from db_connect import get_connection
from flask_cors import CORS
from datetime import datetime
import hashlib
from models import GestorContenido, GestorMateriales, Curso, Modulo, Leccion, Recurso

app = Flask(__name__)
CORS(app)

# Inicializar gestores orientados a objetos
gestor_contenido = GestorContenido()
gestor_materiales = GestorMateriales(gestor_contenido)

# Función para cargar datos desde la base de datos al gestor de contenido
def cargar_datos_gestor():
    """Carga los datos de la base de datos al gestor de contenido"""
    conn = get_connection()
    if not conn:
        return
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Cargar cursos
        cursor.execute('SELECT * FROM Cursos WHERE Estado = "activo"')
        cursos_data = cursor.fetchall()
        
        for curso_data in cursos_data:
            curso = Curso(
                id=curso_data['ID_Curso'],
                nombre=curso_data['Nombre'],
                descripcion=curso_data.get('Descripcion', ''),
                duracion_estimada=curso_data.get('Duracion_estimada', 0),
                id_profesor=curso_data.get('ID_Profesor')
            )
            gestor_contenido.agregar_curso(curso)
            
            # Cargar módulos del curso
            cursor.execute('SELECT * FROM Modulos WHERE ID_Curso = %s ORDER BY Orden', (curso.id,))
            modulos_data = cursor.fetchall()
            
            for modulo_data in modulos_data:
                modulo = Modulo(
                    id=modulo_data['ID_Modulo'],
                    nombre=modulo_data['Nombre'],
                    descripcion=modulo_data.get('Descripcion', ''),
                    duracion_estimada=modulo_data.get('Duracion_estimada', 0),
                    id_curso=modulo_data['ID_Curso']
                )
                curso.agregar_modulo(modulo)
                
                # Cargar lecciones del módulo
                cursor.execute('SELECT * FROM Lecciones WHERE ID_Modulo = %s ORDER BY Orden', (modulo.id,))
                lecciones_data = cursor.fetchall()
                
                for leccion_data in lecciones_data:
                    leccion = Leccion(
                        id=leccion_data['ID_Leccion'],
                        nombre=leccion_data['Nombre'],
                        contenido=leccion_data.get('Contenido', ''),
                        duracion_estimada=leccion_data.get('Duracion_estimada', 0),
                        id_modulo=leccion_data['ID_Modulo'],
                        es_obligatoria=leccion_data.get('Es_obligatoria', True)
                    )
                    modulo.agregar_leccion(leccion)
                    
                    # Cargar recursos de la lección
                    cursor.execute('SELECT * FROM Recursos WHERE ID_Leccion = %s ORDER BY Orden', (leccion.id,))
                    recursos_data = cursor.fetchall()
                    
                    for recurso_data in recursos_data:
                        recurso = Recurso(
                            id=recurso_data['ID_Recurso'],
                            nombre=recurso_data['Nombre'],
                            tipo=recurso_data['Tipo'],
                            url=recurso_data['URL'],
                            orden=recurso_data['Orden'],
                            duracion=recurso_data.get('Duracion')
                        )
                        leccion.agregar_recurso(recurso)
        
        print(f"✅ Cargados {len(cursos_data)} cursos con su estructura jerárquica")
        
    except Exception as e:
        print(f"❌ Error cargando datos al gestor: {e}")
    finally:
        conn.close()

# Cargar datos al iniciar la aplicación
cargar_datos_gestor()

# Función para hashear contraseñas
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Endpoint para obtener todos los cursos
@app.route('/api/cursos', methods=['GET'])
def get_cursos():
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.*, p.Nombre as Profesor_Nombre 
            FROM Cursos c 
            LEFT JOIN Profesores p ON c.ID_Profesor = p.ID_Profesor 
            WHERE c.Estado = 'activo'
        ''')
        cursos = cursor.fetchall()
        return jsonify(cursos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener cursos disponibles para matrícula
@app.route('/api/cursos/disponibles', methods=['GET'])
def get_cursos_disponibles():
    estudiante_id = request.args.get('estudiante_id')
    if not estudiante_id:
        return jsonify({'error': 'ID de estudiante requerido'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.*, p.Nombre as Profesor_Nombre 
            FROM Cursos c 
            LEFT JOIN Profesores p ON c.ID_Profesor = p.ID_Profesor 
            WHERE c.Estado = 'activo' 
            AND c.ID_Curso NOT IN (
                SELECT ID_Curso FROM Matriculas WHERE ID_Estudiante = %s
            )
        ''', (estudiante_id,))
        cursos = cursor.fetchall()
        return jsonify(cursos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener cursos matriculados del estudiante
@app.route('/api/estudiante/<int:estudiante_id>/cursos', methods=['GET'])
def get_cursos_estudiante(estudiante_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.*, m.Progreso_total, m.Estado as Estado_Matricula, m.Fecha_matricula,
                   p.Nombre as Profesor_Nombre
            FROM Matriculas m
            JOIN Cursos c ON m.ID_Curso = c.ID_Curso
            LEFT JOIN Profesores p ON c.ID_Profesor = p.ID_Profesor
            WHERE m.ID_Estudiante = %s
            ORDER BY m.Fecha_matricula DESC
        ''', (estudiante_id,))
        cursos = cursor.fetchall()
        return jsonify(cursos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para matricular estudiante en un curso
@app.route('/api/matricula', methods=['POST'])
def matricular_estudiante():
    data = request.json
    estudiante_id = data.get('estudiante_id')
    curso_id = data.get('curso_id')
    
    if not estudiante_id or not curso_id:
        return jsonify({'error': 'ID de estudiante y curso son obligatorios'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Matriculas (ID_Estudiante, ID_Curso, Estado, Progreso_total)
            VALUES (%s, %s, 'activo', 0.00)
        ''', (estudiante_id, curso_id))
        conn.commit()
        return jsonify({'message': 'Matrícula exitosa'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener módulos de un curso
@app.route('/api/cursos/<int:curso_id>/modulos', methods=['GET'])
def get_modulos_curso(curso_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT * FROM Modulos 
            WHERE ID_Curso = %s 
            ORDER BY Orden
        ''', (curso_id,))
        modulos = cursor.fetchall()
        return jsonify(modulos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener lecciones de un módulo
@app.route('/api/modulos/<int:modulo_id>/lecciones', methods=['GET'])
def get_lecciones_modulo(modulo_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT * FROM Lecciones 
            WHERE ID_Modulo = %s 
            ORDER BY Orden
        ''', (modulo_id,))
        lecciones = cursor.fetchall()
        return jsonify(lecciones)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener progreso del estudiante en lecciones
@app.route('/api/estudiante/<int:estudiante_id>/progreso-lecciones', methods=['GET'])
def get_progreso_lecciones(estudiante_id):
    curso_id = request.args.get('curso_id')
    if not curso_id:
        return jsonify({'error': 'ID de curso requerido'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT pl.*, l.Nombre as Leccion_Nombre, l.Orden as Leccion_Orden,
                   m.Nombre as Modulo_Nombre, m.Orden as Modulo_Orden
            FROM Progreso_Lecciones pl
            JOIN Lecciones l ON pl.ID_Leccion = l.ID_Leccion
            JOIN Modulos m ON l.ID_Modulo = m.ID_Modulo
            WHERE pl.ID_Estudiante = %s AND m.ID_Curso = %s
            ORDER BY m.Orden, l.Orden
        ''', (estudiante_id, curso_id))
        progreso = cursor.fetchall()
        return jsonify(progreso)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para actualizar progreso de lección
@app.route('/api/progreso-leccion', methods=['POST'])
def actualizar_progreso_leccion():
    data = request.json
    estudiante_id = data.get('estudiante_id')
    leccion_id = data.get('leccion_id')
    completado = data.get('completado', False)
    tiempo_dedicado = data.get('tiempo_dedicado', 0)
    
    if not estudiante_id or not leccion_id:
        return jsonify({'error': 'ID de estudiante y lección son obligatorios'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        
        # Verificar si ya existe progreso
        cursor.execute('''
            SELECT * FROM Progreso_Lecciones 
            WHERE ID_Estudiante = %s AND ID_Leccion = %s
        ''', (estudiante_id, leccion_id))
        progreso_existente = cursor.fetchone()
        
        if progreso_existente:
            # Actualizar progreso existente
            cursor.execute('''
                UPDATE Progreso_Lecciones 
                SET Completado = %s, Tiempo_dedicado = Tiempo_dedicado + %s,
                    Fecha_ultimo_acceso = NOW(), Veces_accedido = Veces_accedido + 1
                WHERE ID_Estudiante = %s AND ID_Leccion = %s
            ''', (completado, tiempo_dedicado, estudiante_id, leccion_id))
        else:
            # Crear nuevo progreso
            cursor.execute('''
                INSERT INTO Progreso_Lecciones 
                (ID_Estudiante, ID_Leccion, Completado, Tiempo_dedicado, 
                 Fecha_inicio, Fecha_ultimo_acceso, Veces_accedido)
                VALUES (%s, %s, %s, %s, NOW(), NOW(), 1)
            ''', (estudiante_id, leccion_id, completado, tiempo_dedicado))
        
        conn.commit()
        
        # Actualizar progreso total del curso
        actualizar_progreso_curso(estudiante_id, leccion_id)
        
        return jsonify({'message': 'Progreso actualizado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

def actualizar_progreso_curso(estudiante_id, leccion_id):
    """Función auxiliar para actualizar el progreso total del curso"""
    conn = get_connection()
    if not conn:
        return
    
    try:
        cursor = conn.cursor()
        
        # Obtener el curso de la lección
        cursor.execute('''
            SELECT m.ID_Curso FROM Lecciones l
            JOIN Modulos m ON l.ID_Modulo = m.ID_Modulo
            WHERE l.ID_Leccion = %s
        ''', (leccion_id,))
        curso_result = cursor.fetchone()
        if not curso_result:
            return
        
        curso_id = curso_result[0]
        
        # Calcular progreso total
        cursor.execute('''
            SELECT 
                COUNT(*) as total_lecciones,
                SUM(CASE WHEN pl.Completado = 1 THEN 1 ELSE 0 END) as lecciones_completadas
            FROM Lecciones l
            JOIN Modulos m ON l.ID_Modulo = m.ID_Modulo
            LEFT JOIN Progreso_Lecciones pl ON l.ID_Leccion = pl.ID_Leccion 
                AND pl.ID_Estudiante = %s
            WHERE m.ID_Curso = %s
        ''', (estudiante_id, curso_id))
        
        result = cursor.fetchone()
        if result and result[0] > 0:
            progreso_total = (result[1] / result[0]) * 100
            
            # Actualizar progreso en matrícula
            cursor.execute('''
                UPDATE Matriculas 
                SET Progreso_total = %s 
                WHERE ID_Estudiante = %s AND ID_Curso = %s
            ''', (progreso_total, estudiante_id, curso_id))
            
            conn.commit()
    except Exception as e:
        print(f"Error actualizando progreso del curso: {e}")
    finally:
        conn.close()

# Endpoint para obtener evaluaciones de un curso
@app.route('/api/cursos/<int:curso_id>/evaluaciones', methods=['GET'])
def get_evaluaciones_curso(curso_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT e.*, 
                   CASE 
                       WHEN e.ID_Leccion IS NOT NULL THEN l.Nombre
                       WHEN e.ID_Modulo IS NOT NULL THEN m.Nombre
                   END as Contexto_Nombre
            FROM Evaluaciones e
            LEFT JOIN Lecciones l ON e.ID_Leccion = l.ID_Leccion
            LEFT JOIN Modulos m ON e.ID_Modulo = m.ID_Modulo
            WHERE (l.ID_Modulo IN (SELECT ID_Modulo FROM Modulos WHERE ID_Curso = %s))
               OR (e.ID_Modulo IN (SELECT ID_Modulo FROM Modulos WHERE ID_Curso = %s))
            ORDER BY e.ID_Evaluacion
        ''', (curso_id, curso_id))
        evaluaciones = cursor.fetchall()
        return jsonify(evaluaciones)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener resultados de evaluaciones del estudiante
@app.route('/api/estudiante/<int:estudiante_id>/resultados-evaluaciones', methods=['GET'])
def get_resultados_evaluaciones(estudiante_id):
    curso_id = request.args.get('curso_id')
    if not curso_id:
        return jsonify({'error': 'ID de curso requerido'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT re.*, e.Nombre as Evaluacion_Nombre, e.Puntaje_aprobacion,
                   CASE 
                       WHEN e.ID_Leccion IS NOT NULL THEN l.Nombre
                       WHEN e.ID_Modulo IS NOT NULL THEN m.Nombre
                   END as Contexto_Nombre
            FROM Resultados_Evaluaciones re
            JOIN Evaluaciones e ON re.ID_Evaluacion = e.ID_Evaluacion
            LEFT JOIN Lecciones l ON e.ID_Leccion = l.ID_Leccion
            LEFT JOIN Modulos m ON e.ID_Modulo = m.ID_Modulo
            WHERE re.ID_Estudiante = %s 
            AND (l.ID_Modulo IN (SELECT ID_Modulo FROM Modulos WHERE ID_Curso = %s))
               OR (e.ID_Modulo IN (SELECT ID_Modulo FROM Modulos WHERE ID_Curso = %s))
            ORDER BY re.Fecha_intento DESC
        ''', (estudiante_id, curso_id, curso_id))
        resultados = cursor.fetchall()
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para registrar resultado de evaluación
@app.route('/api/resultado-evaluacion', methods=['POST'])
def registrar_resultado_evaluacion():
    data = request.json
    estudiante_id = data.get('estudiante_id')
    evaluacion_id = data.get('evaluacion_id')
    puntaje = data.get('puntaje')
    tiempo_utilizado = data.get('tiempo_utilizado', 0)
    
    if not estudiante_id or not evaluacion_id or puntaje is None:
        return jsonify({'error': 'Datos incompletos'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Resultados_Evaluaciones 
            (ID_Estudiante, ID_Evaluacion, Puntaje, Tiempo_utilizado)
            VALUES (%s, %s, %s, %s)
        ''', (estudiante_id, evaluacion_id, puntaje, tiempo_utilizado))
        conn.commit()
        return jsonify({'message': 'Resultado registrado correctamente'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener recursos de una lección
@app.route('/api/lecciones/<int:leccion_id>/recursos', methods=['GET'])
def get_recursos_leccion(leccion_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT * FROM Recursos 
            WHERE ID_Leccion = %s 
            ORDER BY Orden
        ''', (leccion_id,))
        recursos = cursor.fetchall()
        return jsonify(recursos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para registrar acceso a recurso
@app.route('/api/acceso-recurso', methods=['POST'])
def registrar_acceso_recurso():
    data = request.json
    estudiante_id = data.get('estudiante_id')
    recurso_id = data.get('recurso_id')
    tiempo_acceso = data.get('tiempo_acceso', 0)
    
    if not estudiante_id or not recurso_id:
        return jsonify({'error': 'ID de estudiante y recurso son obligatorios'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        
        # Verificar si ya existe acceso
        cursor.execute('''
            SELECT * FROM Accesos_Recursos 
            WHERE ID_Estudiante = %s AND ID_Recurso = %s
        ''', (estudiante_id, recurso_id))
        acceso_existente = cursor.fetchone()
        
        if acceso_existente:
            # Actualizar acceso existente
            cursor.execute('''
                UPDATE Accesos_Recursos 
                SET Veces_accedido = Veces_accedido + 1,
                    Tiempo_total = Tiempo_total + %s,
                    Fecha_ultimo_acceso = NOW()
                WHERE ID_Estudiante = %s AND ID_Recurso = %s
            ''', (tiempo_acceso, estudiante_id, recurso_id))
        else:
            # Crear nuevo acceso
            cursor.execute('''
                INSERT INTO Accesos_Recursos 
                (ID_Estudiante, ID_Recurso, Veces_accedido, Tiempo_total, 
                 Fecha_primer_acceso, Fecha_ultimo_acceso)
                VALUES (%s, %s, 1, %s, NOW(), NOW())
            ''', (estudiante_id, recurso_id, tiempo_acceso))
        
        conn.commit()
        return jsonify({'message': 'Acceso registrado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener recomendaciones del estudiante
@app.route('/api/estudiante/<int:estudiante_id>/recomendaciones', methods=['GET'])
def get_recomendaciones_estudiante(estudiante_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT hr.*, rr.Nombre as Regla_Nombre, rr.Accion_recomendada
            FROM Historial_Recomendaciones hr
            JOIN Reglas_Recomendacion rr ON hr.ID_Regla = rr.ID_Regla
            WHERE hr.ID_Estudiante = %s
            ORDER BY hr.Fecha_recomendacion DESC
            LIMIT 10
        ''', (estudiante_id,))
        recomendaciones = cursor.fetchall()
        return jsonify(recomendaciones)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para generar recomendación basada en árbol de decisión
@app.route('/api/estudiante/<int:estudiante_id>/generar-recomendacion', methods=['POST'])
def generar_recomendacion(estudiante_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Obtener datos del estudiante para el árbol de decisión
        cursor.execute('''
            SELECT 
                AVG(re.Puntaje) as promedio_puntajes,
                COUNT(CASE WHEN re.Aprobado = 1 THEN 1 END) as evaluaciones_aprobadas,
                COUNT(re.ID_Resultado) as total_evaluaciones,
                AVG(m.Progreso_total) as promedio_progreso
            FROM Estudiantes e
            LEFT JOIN Resultados_Evaluaciones re ON e.ID_Estudiante = re.ID_Estudiante
            LEFT JOIN Matriculas m ON e.ID_Estudiante = m.ID_Estudiante
            WHERE e.ID_Estudiante = %s
        ''', (estudiante_id,))
        
        datos_estudiante = cursor.fetchone()
        
        # Lógica simplificada del árbol de decisión
        recomendacion = generar_arbol_decision(datos_estudiante)
        
        # Registrar la recomendación
        cursor.execute('''
            INSERT INTO Historial_Recomendaciones 
            (ID_Estudiante, ID_Regla, Accion_tomada, Fue_seguida)
            VALUES (%s, %s, %s, NULL)
        ''', (estudiante_id, recomendacion['regla_id'], recomendacion['accion']))
        
        conn.commit()
        return jsonify(recomendacion)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

def generar_arbol_decision(datos_estudiante):
    """Función para generar recomendación basada en árbol de decisión"""
    promedio_puntajes = datos_estudiante['promedio_puntajes'] or 0
    promedio_progreso = datos_estudiante['promedio_progreso'] or 0
    evaluaciones_aprobadas = datos_estudiante['evaluaciones_aprobadas'] or 0
    total_evaluaciones = datos_estudiante['total_evaluaciones'] or 0
    
    # Lógica del árbol de decisión
    if promedio_puntajes < 70:
        return {
            'regla_id': 1,
            'accion': 'Repasar módulos anteriores y practicar más ejercicios',
            'tipo': 'refuerzo',
            'prioridad': 'alta'
        }
    elif promedio_progreso < 50:
        return {
            'regla_id': 2,
            'accion': 'Dedicar más tiempo al estudio y completar lecciones pendientes',
            'tipo': 'progreso',
            'prioridad': 'media'
        }
    elif evaluaciones_aprobadas / max(total_evaluaciones, 1) < 0.8:
        return {
            'regla_id': 3,
            'accion': 'Revisar conceptos clave antes de las evaluaciones',
            'tipo': 'evaluacion',
            'prioridad': 'media'
        }
    else:
        return {
            'regla_id': 4,
            'accion': '¡Excelente progreso! Continúa con el siguiente módulo',
            'tipo': 'motivacion',
            'prioridad': 'baja'
        }

# Endpoint para obtener estadísticas del estudiante
@app.route('/api/estudiante/<int:estudiante_id>/estadisticas', methods=['GET'])
def get_estadisticas_estudiante(estudiante_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT 
                COUNT(DISTINCT m.ID_Curso) as total_cursos,
                AVG(m.Progreso_total) as promedio_progreso,
                COUNT(DISTINCT pl.ID_Leccion) as lecciones_completadas,
                COUNT(DISTINCT re.ID_Evaluacion) as evaluaciones_realizadas,
                AVG(re.Puntaje) as promedio_puntajes,
                COUNT(CASE WHEN re.Aprobado = 1 THEN 1 END) as evaluaciones_aprobadas
            FROM Estudiantes e
            LEFT JOIN Matriculas m ON e.ID_Estudiante = m.ID_Estudiante
            LEFT JOIN Progreso_Lecciones pl ON e.ID_Estudiante = pl.ID_Estudiante AND pl.Completado = 1
            LEFT JOIN Resultados_Evaluaciones re ON e.ID_Estudiante = re.ID_Estudiante
            WHERE e.ID_Estudiante = %s
        ''', (estudiante_id,))
        
        estadisticas = cursor.fetchone()
        return jsonify(estadisticas)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener todos los estudiantes
@app.route('/api/estudiantes', methods=['GET'])
def get_estudiantes():
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM Estudiantes')
        estudiantes = cursor.fetchall()
        return jsonify(estudiantes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener todos los profesores
@app.route('/api/profesores', methods=['GET'])
def get_profesores():
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM Profesores')
        profesores = cursor.fetchall()
        return jsonify(profesores)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/estudiantes', methods=['POST'])
def crear_estudiante():
    data = request.json
    nombre = data.get('nombre')
    correo = data.get('correo_electronico')
    contrasena = data.get('contrasena')
    semestre = data.get('semestre', 1)
    fecha_nacimiento = data.get('fecha_nacimiento', '2000-01-01')
    if not nombre or not correo or not contrasena:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO Estudiantes (Nombre, Correo_electronico, Contrasena, Semestre, Fecha_nacimiento) VALUES (%s, %s, %s, %s, %s)',
                       (nombre, correo, contrasena, semestre, fecha_nacimiento))
        conn.commit()
        return jsonify({'message': 'Estudiante creado'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/profesores', methods=['POST'])
def crear_profesor():
    data = request.json
    nombre = data.get('nombre')
    correo = data.get('correo_electronico')
    contrasena = data.get('contrasena')
    especialidad = data.get('especialidad', 'General')
    if not nombre or not correo or not contrasena:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO Profesores (Nombre, Correo_electronico, Contrasena, Especialidad) VALUES (%s, %s, %s, %s)',
                       (nombre, correo, contrasena, especialidad))
        conn.commit()
        return jsonify({'message': 'Profesor creado'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

def login_user(table, email, password):
    conn = get_connection()
    if not conn:
        return None, 'No se pudo conectar a la base de datos'
    try:
        cursor = conn.cursor(dictionary=True)
        # Mapear campos según la tabla
        email_field = 'Correo_electronico'
        password_field = 'Contrasena'
        query = f"SELECT * FROM {table} WHERE {email_field}=%s AND {password_field}=%s"
        cursor.execute(query, (email, password))
        user = cursor.fetchone()
        return user, None
    except Exception as e:
        return None, str(e)
    finally:
        conn.close()

# Endpoint de login general
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    table_map = {
        'admin': 'Administradores',
        'student': 'Estudiantes',
        'teacher': 'Profesores'
    }
    table = table_map.get(role)
    if not table:
        return jsonify({'error': 'Rol inválido'}), 400
    user, error = login_user(table, email, password)
    if error:
        return jsonify({'error': error}), 500
    if not user:
        return jsonify({'error': 'Credenciales incorrectas'}), 401
    user['role'] = role
    return jsonify(user)

@app.route('/api/ping')
def ping():
    return jsonify({'message': 'pong'})

@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM usuarios')
        usuarios = cursor.fetchall()
        return jsonify(usuarios)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/usuarios', methods=['POST'])
def add_usuario():
    data = request.json
    nombre = data.get('nombre')
    email = data.get('email')
    if not nombre or not email:
        return jsonify({'error': 'Faltan datos'}), 400
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO usuarios (nombre, email) VALUES (%s, %s)', (nombre, email))
        conn.commit()
        return jsonify({'message': 'Usuario agregado'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# ============================================================================
# ENDPOINTS PARA GESTIÓN DE MATERIALES (CRUD) - PROGRAMACIÓN ORIENTADA A OBJETOS
# ============================================================================

@app.route('/api/materiales/crear', methods=['POST'])
def crear_material():
    """Crea un nuevo material/recurso usando el gestor orientado a objetos"""
    data = request.json
    leccion_id = data.get('leccion_id')
    nombre = data.get('nombre')
    tipo = data.get('tipo')
    url = data.get('url')
    orden = data.get('orden', 0)
    duracion = data.get('duracion')
    
    if not all([leccion_id, nombre, tipo, url]):
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    
    # Crear recurso usando el gestor de materiales
    recurso = gestor_materiales.crear_recurso(leccion_id, nombre, tipo, url, orden, duracion)
    
    if not recurso:
        return jsonify({'error': 'No se pudo crear el material'}), 400
    
    # Persistir en base de datos
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Recursos (ID_Leccion, Nombre, Tipo, URL, Orden, Duracion)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (leccion_id, nombre, tipo, url, orden, duracion))
        conn.commit()
        
        return jsonify({
            'message': 'Material creado exitosamente',
            'material': recurso.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/materiales/<int:recurso_id>', methods=['PUT'])
def actualizar_material(recurso_id):
    """Actualiza un material existente"""
    data = request.json
    nombre = data.get('nombre')
    url = data.get('url')
    orden = data.get('orden')
    
    if not any([nombre, url, orden is not None]):
        return jsonify({'error': 'Debe proporcionar al menos un campo para actualizar'}), 400
    
    # Actualizar usando el gestor de materiales
    actualizado = gestor_materiales.actualizar_recurso(recurso_id, nombre, url, orden)
    
    if not actualizado:
        return jsonify({'error': 'Material no encontrado'}), 404
    
    # Persistir cambios en base de datos
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        updates = []
        params = []
        
        if nombre:
            updates.append('Nombre = %s')
            params.append(nombre)
        if url:
            updates.append('URL = %s')
            params.append(url)
        if orden is not None:
            updates.append('Orden = %s')
            params.append(orden)
        
        params.append(recurso_id)
        query = f'UPDATE Recursos SET {", ".join(updates)} WHERE ID_Recurso = %s'
        cursor.execute(query, params)
        conn.commit()
        
        return jsonify({'message': 'Material actualizado exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/materiales/<int:recurso_id>', methods=['DELETE'])
def eliminar_material(recurso_id):
    """Elimina un material"""
    # Eliminar usando el gestor de materiales
    eliminado = gestor_materiales.eliminar_recurso(recurso_id)
    
    if not eliminado:
        return jsonify({'error': 'Material no encontrado'}), 404
    
    # Persistir eliminación en base de datos
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM Recursos WHERE ID_Recurso = %s', (recurso_id,))
        conn.commit()
        
        return jsonify({'message': 'Material eliminado exitosamente'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/materiales/<int:recurso_id>', methods=['GET'])
def obtener_material(recurso_id):
    """Obtiene un material específico"""
    recurso = gestor_materiales.obtener_recurso(recurso_id)
    
    if not recurso:
        return jsonify({'error': 'Material no encontrado'}), 404
    
    return jsonify(recurso.to_dict())

@app.route('/api/lecciones/<int:leccion_id>/materiales', methods=['GET'])
def listar_materiales_leccion(leccion_id):
    """Lista todos los materiales de una lección"""
    recursos = gestor_materiales.listar_recursos_leccion(leccion_id)
    
    return jsonify([recurso.to_dict() for recurso in recursos])

# ============================================================================
# ENDPOINTS PARA BÚSQUEDAS EN ESTRUCTURA JERÁRQUICA
# ============================================================================

@app.route('/api/buscar', methods=['GET'])
def buscar_contenido():
    """Busca contenido en la estructura jerárquica de todos los cursos"""
    termino = request.args.get('termino', '')
    
    if not termino:
        return jsonify({'error': 'Término de búsqueda requerido'}), 400
    
    resultados = gestor_contenido.buscar_contenido(termino)
    
    return jsonify({
        'termino': termino,
        'total_resultados': len(resultados),
        'resultados': resultados
    })

@app.route('/api/estructura-completa', methods=['GET'])
def obtener_estructura_completa():
    """Obtiene la estructura jerárquica completa de todos los cursos"""
    estructura = gestor_contenido.obtener_estructura_completa()
    
    return jsonify(estructura)

@app.route('/api/cursos/<int:curso_id>/estructura', methods=['GET'])
def obtener_estructura_curso(curso_id):
    """Obtiene la estructura jerárquica de un curso específico"""
    curso = gestor_contenido.obtener_curso(curso_id)
    
    if not curso:
        return jsonify({'error': 'Curso no encontrado'}), 404
    
    return jsonify(curso.to_dict())

# ============================================================================
# ENDPOINTS PARA ÁRBOL DE DECISIÓN MEJORADO
# ============================================================================

@app.route('/api/arbol-decision', methods=['GET'])
def obtener_arbol_decision():
    """Obtiene la estructura del árbol de decisión"""
    return jsonify(gestor_contenido.arbol_decision.to_dict())

@app.route('/api/estudiante/<int:estudiante_id>/recomendacion-avanzada', methods=['POST'])
def generar_recomendacion_avanzada(estudiante_id):
    """Genera una recomendación avanzada usando el árbol de decisión orientado a objetos"""
    # Obtener datos del estudiante
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT 
                AVG(m.Progreso_total) as promedio_progreso,
                COUNT(DISTINCT pl.ID_Leccion) as lecciones_completadas,
                AVG(re.Puntaje) as promedio_puntajes,
                COUNT(DISTINCT re.ID_Evaluacion) as total_evaluaciones,
                COUNT(CASE WHEN re.Aprobado = 1 THEN 1 END) as evaluaciones_aprobadas,
                AVG(pl.Tiempo_dedicado) as tiempo_promedio
            FROM Estudiantes e
            LEFT JOIN Matriculas m ON e.ID_Estudiante = m.ID_Estudiante
            LEFT JOIN Progreso_Lecciones pl ON e.ID_Estudiante = pl.ID_Estudiante
            LEFT JOIN Resultados_Evaluaciones re ON e.ID_Estudiante = re.ID_Estudiante
            WHERE e.ID_Estudiante = %s
        ''', (estudiante_id,))
        
        datos = cursor.fetchone()
        
        if not datos:
            return jsonify({'error': 'Estudiante no encontrado'}), 404
        
        # Preparar datos para el árbol de decisión
        datos_estudiante = {
            'promedio_progreso': float(datos['promedio_progreso'] or 0),
            'lecciones_completadas': int(datos['lecciones_completadas'] or 0),
            'promedio_puntajes': float(datos['promedio_puntajes'] or 0),
            'total_evaluaciones': int(datos['total_evaluaciones'] or 0),
            'evaluaciones_aprobadas': int(datos['evaluaciones_aprobadas'] or 0),
            'tiempo_promedio': float(datos['tiempo_promedio'] or 0)
        }
        
        # Generar recomendación usando el gestor de contenido
        recomendacion = gestor_contenido.generar_recomendacion(datos_estudiante)
        
        return jsonify({
            'estudiante_id': estudiante_id,
            'datos_estudiante': datos_estudiante,
            'recomendacion': recomendacion
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# ============================================================================
# ENDPOINTS PARA GESTIÓN DE CONTENIDO JERÁRQUICO
# ============================================================================

@app.route('/api/cursos/<int:curso_id>/nodo/<int:nodo_id>', methods=['GET'])
def obtener_nodo_contenido(curso_id, nodo_id):
    """Obtiene un nodo específico de la estructura jerárquica"""
    curso = gestor_contenido.obtener_curso(curso_id)
    
    if not curso:
        return jsonify({'error': 'Curso no encontrado'}), 404
    
    nodo = curso.buscar_por_id(nodo_id)
    
    if not nodo:
        return jsonify({'error': 'Nodo no encontrado'}), 404
    
    return jsonify({
        'nodo': nodo.to_dict(),
        'ruta': nodo.obtener_ruta(),
        'profundidad': nodo.obtener_profundidad(),
        'total_hijos': nodo.contar_hijos()
    })

@app.route('/api/cursos/<int:curso_id>/buscar', methods=['GET'])
def buscar_en_curso(curso_id, termino):
    """Busca contenido dentro de un curso específico"""
    curso = gestor_contenido.obtener_curso(curso_id)
    
    if not curso:
        return jsonify({'error': 'Curso no encontrado'}), 404
    
    termino = request.args.get('termino', '')
    
    if not termino:
        return jsonify({'error': 'Término de búsqueda requerido'}), 400
    
    resultados = curso.buscar_por_nombre(termino)
    
    return jsonify({
        'curso_id': curso_id,
        'termino': termino,
        'total_resultados': len(resultados),
        'resultados': [nodo.to_dict() for nodo in resultados]
    })

@app.route('/')
def home():
    return '<h2>API Flask corriendo correctamente</h2>'

if __name__ == '__main__':
    app.run(debug=True)
