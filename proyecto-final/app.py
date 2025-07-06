from flask import Flask, jsonify, request, make_response
from db_connect import get_connection
from flask_cors import CORS
from datetime import datetime
import hashlib
from models import (GestorContenido, GestorMateriales, Curso, Modulo, Leccion, Recurso,
                   GestorProfesor, GestorCursosProfesor, GestorEvaluacionesProfesor, 
                   GestorEstudiantesProfesor, Profesor, Evaluacion, ResultadoEvaluacion, Matricula)

app = Flask(__name__)
CORS(app)  # Habilita CORS globalmente para todas las rutas y orígenes

gestor_contenido = GestorContenido()

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# ...existing code...

# Endpoint para agregar preguntas a una evaluación
@app.route('/api/evaluaciones/<int:evaluacion_id>/preguntas', methods=['POST'])
def agregar_pregunta_evaluacion(evaluacion_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No se recibieron datos JSON'}), 400
            
        enunciado = data.get('Enunciado')
        tipo = data.get('Tipo', 'seleccion_multiple')
        opciones = data.get('Opciones', [])
        respuesta_correcta = data.get('Respuesta_correcta', '')
        
        print(f"DEBUG: Recibidos datos - Enunciado: {enunciado}, Tipo: {tipo}, Opciones: {opciones}")
        
        if not enunciado:
            return jsonify({'error': 'El enunciado de la pregunta es obligatorio'}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
        
        try:
            cursor = conn.cursor()
            
            # Verificar que la evaluación existe
            cursor.execute('SELECT ID_Evaluacion FROM Evaluaciones WHERE ID_Evaluacion = %s', (evaluacion_id,))
            if not cursor.fetchone():
                return jsonify({'error': f'La evaluación {evaluacion_id} no existe'}), 404
            
            # Obtener el siguiente orden para la pregunta
            cursor.execute('''
                SELECT COALESCE(MAX(orden), 0) + 1 as siguiente_orden
                FROM preguntas 
                WHERE id_evaluacion = %s
            ''', (evaluacion_id,))
            siguiente_orden = cursor.fetchone()[0]
            
            print(f"DEBUG: Siguiente orden: {siguiente_orden}")
            
            # Insertar la pregunta
            cursor.execute('''
                INSERT INTO preguntas (id_evaluacion, texto, tipo, orden)
                VALUES (%s, %s, %s, %s)
            ''', (evaluacion_id, enunciado, tipo, siguiente_orden))
            
            pregunta_id = cursor.lastrowid
            print(f"DEBUG: Pregunta creada con ID: {pregunta_id}")
            
            # Si es pregunta de selección múltiple, insertar las opciones
            if tipo == 'seleccion_multiple' and opciones:
                for i, opcion in enumerate(opciones):
                    es_correcta = (opcion == respuesta_correcta)
                    cursor.execute('''
                        INSERT INTO opciones (id_pregunta, texto, es_correcta, orden)
                        VALUES (%s, %s, %s, %s)
                    ''', (pregunta_id, opcion, es_correcta, i + 1))
                    print(f"DEBUG: Opción {i+1} creada: {opcion} (correcta: {es_correcta})")
            
            conn.commit()
            print(f"DEBUG: Transacción completada exitosamente")
            
            return jsonify({
                'message': 'Pregunta agregada exitosamente', 
                'pregunta_id': pregunta_id
            }), 201
            
        except Exception as e:
            conn.rollback()
            print(f"ERROR en base de datos: {str(e)}")
            return jsonify({'error': f'Error en base de datos: {str(e)}'}), 500
        finally:
            conn.close()
            
    except Exception as e:
        print(f"ERROR general: {str(e)}")
        return jsonify({'error': f'Error general: {str(e)}'}), 500

# Endpoint para obtener preguntas de una evaluación
@app.route('/api/evaluaciones/<int:evaluacion_id>/preguntas', methods=['GET'])
def obtener_preguntas_evaluacion(evaluacion_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Obtener preguntas
        cursor.execute('''
            SELECT id, texto, tipo, orden, fecha_creacion
            FROM preguntas 
            WHERE id_evaluacion = %s 
            ORDER BY orden
        ''', (evaluacion_id,))
        preguntas = cursor.fetchall()
        
        # Para cada pregunta, obtener sus opciones
        for pregunta in preguntas:
            cursor.execute('''
                SELECT id, texto, es_correcta, orden
                FROM opciones 
                WHERE id_pregunta = %s 
                ORDER BY orden
            ''', (pregunta['id'],))
            pregunta['opciones'] = cursor.fetchall()
        
        return jsonify(preguntas), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para eliminar una pregunta
@app.route('/api/preguntas/<int:pregunta_id>', methods=['DELETE'])
def eliminar_pregunta(pregunta_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Eliminar la pregunta (las opciones se eliminan automáticamente por CASCADE)
        cursor.execute('DELETE FROM preguntas WHERE id = %s', (pregunta_id,))
        
        if cursor.rowcount == 0:
            return jsonify({'error': 'Pregunta no encontrada'}), 404
        
        conn.commit()
        return jsonify({'message': 'Pregunta eliminada exitosamente'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint de diagnóstico para verificar las tablas
@app.route('/api/diagnostico/tablas', methods=['GET'])
def diagnosticar_tablas():
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si las tablas existen
        cursor.execute("SHOW TABLES LIKE 'preguntas'")
        tabla_preguntas = cursor.fetchone()
        
        cursor.execute("SHOW TABLES LIKE 'opciones'")
        tabla_opciones = cursor.fetchone()
        
        cursor.execute("SHOW TABLES LIKE 'evaluaciones'")
        tabla_evaluaciones = cursor.fetchone()
        
        # Si las tablas existen, mostrar su estructura
        estructura_preguntas = None
        estructura_opciones = None
        
        if tabla_preguntas:
            cursor.execute("DESCRIBE preguntas")
            estructura_preguntas = cursor.fetchall()
            
        if tabla_opciones:
            cursor.execute("DESCRIBE opciones")
            estructura_opciones = cursor.fetchall()
        
        # Contar registros
        count_preguntas = 0
        count_opciones = 0
        count_evaluaciones = 0
        
        if tabla_preguntas:
            cursor.execute("SELECT COUNT(*) as count FROM preguntas")
            count_preguntas = cursor.fetchone()['count']
            
        if tabla_opciones:
            cursor.execute("SELECT COUNT(*) as count FROM opciones")
            count_opciones = cursor.fetchone()['count']
            
        if tabla_evaluaciones:
            cursor.execute("SELECT COUNT(*) as count FROM Evaluaciones")
            count_evaluaciones = cursor.fetchone()['count']
        
        return jsonify({
            'tablas_existen': {
                'preguntas': bool(tabla_preguntas),
                'opciones': bool(tabla_opciones),
                'evaluaciones': bool(tabla_evaluaciones)
            },
            'estructura': {
                'preguntas': estructura_preguntas,
                'opciones': estructura_opciones
            },
            'conteo': {
                'preguntas': count_preguntas,
                'opciones': count_opciones,
                'evaluaciones': count_evaluaciones
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener evaluaciones de una lección
@app.route('/api/lecciones/<int:leccion_id>/evaluaciones', methods=['GET'])
def obtener_evaluaciones_leccion(leccion_id):
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Obtener evaluaciones de la lección
        cursor.execute('''
            SELECT ID_Evaluacion, Nombre, Descripcion, Puntaje_aprobacion, Max_intentos
            FROM Evaluaciones 
            WHERE ID_Leccion = %s
            ORDER BY ID_Evaluacion
        ''', (leccion_id,))
        
        evaluaciones = cursor.fetchall()
        return jsonify(evaluaciones), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para que el estudiante envíe respuestas y reciba comprobante/calificación
@app.route('/api/evaluaciones/<int:evaluacion_id>/responder', methods=['POST'])
def responder_evaluacion(evaluacion_id):
    data = request.json
    estudiante_id = data.get('estudiante_id')
    respuestas = data.get('respuestas')  # Lista de {id_pregunta, id_opcion}
    if not estudiante_id or not respuestas:
        return jsonify({'error': 'Datos incompletos'}), 400

    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500

    try:
        cursor = conn.cursor()
        for r in respuestas:
            id_pregunta = r.get('id_pregunta')
            id_opcion = r.get('id_opcion')
            if not id_pregunta or not id_opcion:
                continue  # O puedes retornar error si prefieres
            cursor.execute('''
                INSERT INTO respuestas_estudiantes (id_estudiante, id_pregunta, id_opcion, fecha_respuesta)
                VALUES (%s, %s, %s, NOW())
            ''', (estudiante_id, id_pregunta, id_opcion))
        conn.commit()
        return jsonify({'message': 'Respuestas registradas correctamente'}), 201
    except Exception as e:
        conn.rollback()
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
        if not datos_estudiante or all(v is None for v in datos_estudiante.values()):
            return jsonify({'error': 'No hay datos suficientes para generar recomendación'}), 400
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
        # Si no hay datos, devolver ceros por defecto
        if not estadisticas or estadisticas is None:
            estadisticas = {
                'total_cursos': 0,
                'promedio_progreso': 0,
                'lecciones_completadas': 0,
                'evaluaciones_realizadas': 0,
                'promedio_puntajes': 0,
                'evaluaciones_aprobadas': 0
            }
        # Reemplazar None por 0 en los campos numéricos
        for k in estadisticas:
            if estadisticas[k] is None:
                estadisticas[k] = 0
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
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.Nombre as Curso_Nombre, m.ID_Modulo, m.Nombre as Modulo_Nombre, 
                   l.ID_Leccion, l.Nombre as Leccion_Nombre
            FROM Cursos c
            LEFT JOIN Modulos m ON c.ID_Curso = m.ID_Curso
            LEFT JOIN Lecciones l ON m.ID_Modulo = l.ID_Modulo
            WHERE c.ID_Curso = %s
            ORDER BY m.Orden, l.Orden
        ''', (curso_id,))
        estructura = cursor.fetchall()
        return jsonify(estructura)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener módulos de un curso con lecciones y evaluaciones
@app.route('/api/cursos/<int:curso_id>/modulos', methods=['GET', 'POST', 'OPTIONS'])
def modulos_curso(curso_id):
    if request.method == 'OPTIONS':
        return make_response('', 200)
    if request.method == 'GET':
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT * FROM Modulos WHERE ID_Curso = %s ORDER BY Orden', (curso_id,))
            modulos = cursor.fetchall()
            for modulo in modulos:
                cursor.execute('SELECT * FROM Lecciones WHERE ID_Modulo = %s ORDER BY Orden', (modulo['ID_Modulo'],))
                lecciones = cursor.fetchall()
                for leccion in lecciones:
                    cursor.execute('SELECT * FROM Evaluaciones WHERE ID_Leccion = %s', (leccion['ID_Leccion'],))
                    evaluaciones = cursor.fetchall()
                    leccion['evaluaciones'] = evaluaciones
                modulo['lecciones'] = lecciones
                cursor.execute('SELECT * FROM Evaluaciones WHERE ID_Modulo = %s AND ID_Leccion IS NULL', (modulo['ID_Modulo'],))
                modulo['evaluaciones_modulo'] = cursor.fetchall()
            return jsonify(modulos)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            conn.close()
    if request.method == 'POST':
        data = request.json
        nombre = data.get('nombre')
        descripcion = data.get('descripcion', '')
        duracion_estimada = data.get('duracion_estimada', 0)
        if not nombre:
            return jsonify({'error': 'El nombre del módulo es obligatorio'}), 400
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT COALESCE(MAX(Orden), 0) + 1 FROM Modulos WHERE ID_Curso = %s', (curso_id,))
            row = cursor.fetchone()
            siguiente_orden = row[0] if row and len(row) > 0 else 1
            cursor.execute('INSERT INTO Modulos (ID_Curso, Nombre, Descripcion, Orden, Duracion_estimada) VALUES (%s, %s, %s, %s, %s)', (curso_id, nombre, descripcion, siguiente_orden, duracion_estimada))
            modulo_id = cursor.lastrowid
            conn.commit()
            cursor.execute('SELECT * FROM Modulos WHERE ID_Modulo = %s', (modulo_id,))
            modulo_creado = cursor.fetchone()
            if not modulo_creado:
                return jsonify({'error': 'No se pudo crear el módulo'}), 500
            return jsonify({'message': 'Módulo creado exitosamente', 'modulo': {
                'ID_Modulo': modulo_creado[0],
                'ID_Curso': modulo_creado[1],
                'Nombre': modulo_creado[2],
                'Descripcion': modulo_creado[3],
                'Orden': modulo_creado[4],
                'Duracion_estimada': modulo_creado[5]
            }}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            conn.close()

@app.route('/api/modulos/<int:modulo_id>', methods=['DELETE', 'OPTIONS'])
def eliminar_modulo(modulo_id):
    if request.method == 'OPTIONS':
        return make_response('', 200)
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT ID_Modulo, Nombre FROM Modulos WHERE ID_Modulo = %s', (modulo_id,))
        modulo = cursor.fetchone()
        if not modulo:
            return jsonify({'error': 'El módulo especificado no existe'}), 404
        cursor.execute('SELECT COUNT(*) FROM Lecciones WHERE ID_Modulo = %s', (modulo_id,))
        row = cursor.fetchone()
        lecciones_count = row[0] if row and len(row) > 0 else 0
        if lecciones_count > 0:
            return jsonify({'error': 'No se puede eliminar el módulo porque tiene lecciones asociadas.'}), 400
        cursor.execute('DELETE FROM Modulos WHERE ID_Modulo = %s', (modulo_id,))
        conn.commit()
        return jsonify({'message': 'Módulo eliminado exitosamente'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para crear una lección
@app.route('/api/modulos/<int:modulo_id>/lecciones', methods=['POST', 'OPTIONS'])
def crear_leccion(modulo_id):
    if request.method == 'OPTIONS':
        return make_response('', 200)
    data = request.json
    nombre = data.get('nombre')
    descripcion = data.get('descripcion', '')
    contenido = data.get('contenido', '')
    duracion_estimada = data.get('duracion_estimada', 0)
    es_obligatoria = data.get('es_obligatoria', True)
    if not nombre:
        return jsonify({'error': 'El nombre de la lección es obligatorio'}), 400
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT ID_Modulo FROM Modulos WHERE ID_Modulo = %s', (modulo_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'El módulo especificado no existe'}), 404
        cursor.execute('SELECT COALESCE(MAX(Orden), 0) + 1 FROM Lecciones WHERE ID_Modulo = %s', (modulo_id,))
        row = cursor.fetchone()
        siguiente_orden = row[0] if row and len(row) > 0 else 1
        es_obligatoria_int = 1 if es_obligatoria else 0
        cursor.execute('INSERT INTO Lecciones (ID_Modulo, Nombre, Descripcion, Contenido, Orden, Duracion_estimada, Es_obligatoria) VALUES (%s, %s, %s, %s, %s, %s, %s)', (modulo_id, nombre, descripcion, contenido, siguiente_orden, duracion_estimada, es_obligatoria_int))
        leccion_id = cursor.lastrowid
        conn.commit()
        cursor.execute('SELECT * FROM Lecciones WHERE ID_Leccion = %s', (leccion_id,))
        leccion_creada = cursor.fetchone()
        if not leccion_creada:
            return jsonify({'error': 'No se pudo crear la lección'}), 500
        return jsonify({'message': 'Lección creada exitosamente', 'leccion': {
            'ID_Leccion': leccion_creada[0],
            'ID_Modulo': leccion_creada[1],
            'Nombre': leccion_creada[2],
            'Descripcion': leccion_creada[3],
            'Contenido': leccion_creada[4],
            'Orden': leccion_creada[5],
            'Duracion_estimada': leccion_creada[6],
            'Es_obligatoria': bool(leccion_creada[7])
        }}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/lecciones/<int:leccion_id>', methods=['DELETE', 'OPTIONS'])
def eliminar_leccion(leccion_id):
    if request.method == 'OPTIONS':
        return make_response('', 200)
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT ID_Leccion, Nombre FROM Lecciones WHERE ID_Leccion = %s', (leccion_id,))
        leccion = cursor.fetchone()
        if not leccion:
            return jsonify({'error': 'La lección especificada no existe'}), 404
        cursor.execute('SELECT COUNT(*) FROM Evaluaciones WHERE ID_Leccion = %s', (leccion_id,))
        row = cursor.fetchone()
        evaluaciones_count = row[0] if row and len(row) > 0 else 0
        if evaluaciones_count > 0:
            return jsonify({'error': 'No se puede eliminar la lección porque tiene evaluaciones asociadas.'}), 400
        cursor.execute('DELETE FROM Lecciones WHERE ID_Leccion = %s', (leccion_id,))
        conn.commit()
        return jsonify({'message': 'Lección eliminada exitosamente'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener evaluaciones de una lección
@app.route('/api/lecciones/<int:leccion_id>/evaluaciones', methods=['GET', 'POST', 'OPTIONS'])
def evaluaciones_leccion(leccion_id):
    if request.method == 'OPTIONS':
        return make_response('', 200)
    if request.method == 'GET':
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT ID_Evaluacion, Nombre, Descripcion, Puntaje_aprobacion, Max_intentos FROM Evaluaciones WHERE ID_Leccion = %s ORDER BY ID_Evaluacion', (leccion_id,))
            evaluaciones = cursor.fetchall()
            return jsonify(evaluaciones), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            conn.close()
    if request.method == 'POST':
        data = request.json
        nombre = data.get('nombre')
        descripcion = data.get('descripcion', '')
        puntaje_aprobacion = data.get('puntaje_aprobacion', 70.0)
        max_intentos = data.get('max_intentos', 3)
        if not nombre:
            return jsonify({'error': 'El nombre de la evaluación es obligatorio'}), 400
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
        try:
            cursor = conn.cursor()
            cursor.execute('SELECT ID_Leccion FROM Lecciones WHERE ID_Leccion = %s', (leccion_id,))
            if not cursor.fetchone():
                return jsonify({'error': 'La lección especificada no existe'}), 404
            cursor.execute('INSERT INTO Evaluaciones (ID_Leccion, ID_Modulo, Nombre, Descripcion, Puntaje_aprobacion, Max_intentos) VALUES (%s, NULL, %s, %s, %s, %s)', (leccion_id, nombre, descripcion, puntaje_aprobacion, max_intentos))
            evaluacion_id = cursor.lastrowid
            conn.commit()
            cursor.execute('SELECT * FROM Evaluaciones WHERE ID_Evaluacion = %s', (evaluacion_id,))
            evaluacion_creada = cursor.fetchone()
            return jsonify({'message': 'Evaluación creada exitosamente', 'evaluacion': {
                'ID_Evaluacion': evaluacion_creada[0],
                'ID_Leccion': evaluacion_creada[1],
                'ID_Modulo': evaluacion_creada[2],
                'Nombre': evaluacion_creada[3],
                'Descripcion': evaluacion_creada[4],
                'Puntaje_aprobacion': float(evaluacion_creada[5]),
                'Max_intentos': evaluacion_creada[6]
            }}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500
        finally:
            conn.close()

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

# ============================================================================
# ENDPOINTS ESPECÍFICOS PARA EL PROFESOR
# ============================================================================

# Endpoint para obtener información del profesor
@app.route('/api/profesor/<int:profesor_id>', methods=['GET'])
def get_profesor_info(profesor_id):
    """Obtiene la información completa de un profesor"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM Profesores WHERE ID_Profesor = %s', (profesor_id,))
        profesor_data = cursor.fetchone()
        
        if not profesor_data:
            return jsonify({'error': 'Profesor no encontrado'}), 404
        
        return jsonify(profesor_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener cursos de un profesor
@app.route('/api/profesor/<int:profesor_id>/cursos', methods=['GET'])
def get_cursos_profesor(profesor_id):
    """Obtiene todos los cursos de un profesor"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.*, 
                   COUNT(DISTINCT m.ID_Modulo) as total_modulos,
                   COUNT(DISTINCT l.ID_Leccion) as total_lecciones,
                   COUNT(DISTINCT mat.ID_Matricula) as total_estudiantes
            FROM Cursos c
            LEFT JOIN Modulos m ON c.ID_Curso = m.ID_Curso
            LEFT JOIN Lecciones l ON m.ID_Modulo = l.ID_Modulo
            LEFT JOIN Matriculas mat ON c.ID_Curso = mat.ID_Curso
            WHERE c.ID_Profesor = %s AND c.Estado = 'activo'
            GROUP BY c.ID_Curso
            ORDER BY c.Fecha_creacion DESC
        ''', (profesor_id,))
        cursos = cursor.fetchall()
        
        return jsonify(cursos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para crear un nuevo curso
@app.route('/api/profesor/<int:profesor_id>/cursos', methods=['POST'])
def crear_curso_profesor(profesor_id):
    """Crea un nuevo curso para el profesor"""
    data = request.json
    nombre = data.get('nombre')
    descripcion = data.get('descripcion', '')
    duracion_estimada = data.get('duracion_estimada', 0)
    
    if not nombre:
        return jsonify({'error': 'El nombre del curso es obligatorio'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Cursos (Nombre, Descripcion, Duracion_estimada, ID_Profesor, Estado)
            VALUES (%s, %s, %s, %s, 'activo')
        ''', (nombre, descripcion, duracion_estimada, profesor_id))
        conn.commit()
        
        curso_id = cursor.lastrowid
        return jsonify({
            'message': 'Curso creado exitosamente',
            'curso_id': curso_id,
            'nombre': nombre
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para actualizar un curso
@app.route('/api/profesor/<int:profesor_id>/cursos/<int:curso_id>', methods=['PUT'])
def actualizar_curso_profesor(profesor_id, curso_id):
    """Actualiza un curso del profesor"""
    data = request.json
    nombre = data.get('nombre')
    descripcion = data.get('descripcion')
    duracion_estimada = data.get('duracion_estimada')
    estado = data.get('estado')
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Verificar que el curso pertenece al profesor
        cursor.execute('SELECT ID_Curso FROM Cursos WHERE ID_Curso = %s AND ID_Profesor = %s', 
                      (curso_id, profesor_id))
        if not cursor.fetchone():
            return jsonify({'error': 'Curso no encontrado o no autorizado'}), 404
        
        # Construir query de actualización
        update_fields = []
        params = []
        
        if nombre is not None:
            update_fields.append('Nombre = %s')
            params.append(nombre)
        if descripcion is not None:
            update_fields.append('Descripcion = %s')
            params.append(descripcion)
        if duracion_estimada is not None:
            update_fields.append('Duracion_estimada = %s')
            params.append(duracion_estimada)
        if estado is not None:
            update_fields.append('Estado = %s')
            params.append(estado)
        
        if update_fields:
            params.append(curso_id)
            params.append(profesor_id)
            query = f'''
                UPDATE Cursos 
                SET {', '.join(update_fields)}
                WHERE ID_Curso = %s AND ID_Profesor = %s
            '''
            cursor.execute(query, params)
            conn.commit()
            
            return jsonify({'message': 'Curso actualizado exitosamente'})
        else:
            return jsonify({'error': 'No se proporcionaron campos para actualizar'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener estudiantes de un curso
@app.route('/api/profesor/<int:profesor_id>/cursos/<int:curso_id>/estudiantes', methods=['GET'])
def get_estudiantes_curso_profesor(profesor_id, curso_id):
    """Obtiene todos los estudiantes matriculados en un curso del profesor"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT e.ID_Estudiante, e.Nombre, e.Correo_electronico, e.Semestre,
                   m.ID_Matricula, m.Estado, m.Progreso_total, m.Fecha_matricula,
                   COUNT(pl.ID_Progreso) as lecciones_completadas,
                   COUNT(re.ID_Resultado) as evaluaciones_realizadas,
                   AVG(re.Puntaje) as promedio_evaluaciones
            FROM Matriculas m
            JOIN Estudiantes e ON m.ID_Estudiante = e.ID_Estudiante
            LEFT JOIN Progreso_Lecciones pl ON e.ID_Estudiante = pl.ID_Estudiante AND pl.Completado = 1
            LEFT JOIN Resultados_Evaluaciones re ON e.ID_Estudiante = re.ID_Estudiante
            WHERE m.ID_Curso = %s
            GROUP BY e.ID_Estudiante, m.ID_Matricula
            ORDER BY m.Fecha_matricula DESC
        ''', (curso_id,))
        estudiantes = cursor.fetchall()
        
        return jsonify(estudiantes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener evaluaciones de un curso
@app.route('/api/profesor/<int:profesor_id>/cursos/<int:curso_id>/evaluaciones', methods=['GET'])
def get_evaluaciones_curso_profesor(profesor_id, curso_id):
    """Obtiene todas las evaluaciones de un curso del profesor"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT e.*, 
                   COUNT(re.ID_Resultado) as total_intentos,
                   AVG(re.Puntaje) as promedio_puntaje,
                   COUNT(CASE WHEN re.Aprobado = 1 THEN 1 END) as aprobados,
                   COUNT(CASE WHEN re.Aprobado = 0 THEN 1 END) as reprobados
            FROM Evaluaciones e
            LEFT JOIN Resultados_Evaluaciones re ON e.ID_Evaluacion = re.ID_Evaluacion
            WHERE (e.ID_Leccion IN (
                SELECT l.ID_Leccion 
                FROM Lecciones l 
                JOIN Modulos m ON l.ID_Modulo = m.ID_Modulo 
                WHERE m.ID_Curso = %s
            ) OR e.ID_Modulo IN (
                SELECT m.ID_Modulo 
                FROM Modulos m 
                WHERE m.ID_Curso = %s
            ))
            GROUP BY e.ID_Evaluacion
            ORDER BY e.ID_Evaluacion
        ''', (curso_id, curso_id))
        evaluaciones = cursor.fetchall()
        
        return jsonify(evaluaciones)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para crear una nueva evaluación
@app.route('/api/profesor/<int:profesor_id>/evaluaciones', methods=['POST'])
def crear_evaluacion_profesor(profesor_id):
    """Crea una nueva evaluación"""
    data = request.json
    nombre = data.get('nombre')
    descripcion = data.get('descripcion', '')
    puntaje_aprobacion = data.get('puntaje_aprobacion', 70.0)
    max_intentos = data.get('max_intentos', 3)
    id_leccion = data.get('id_leccion')
    id_modulo = data.get('id_modulo')
    
    if not nombre:
        return jsonify({'error': 'El nombre de la evaluación es obligatorio'}), 400
    
    if not id_leccion and not id_modulo:
        return jsonify({'error': 'Debe especificar una lección o módulo'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO Evaluaciones (Nombre, Descripcion, Puntaje_aprobacion, Max_intentos, ID_Leccion, ID_Modulo)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (nombre, descripcion, puntaje_aprobacion, max_intentos, id_leccion, id_modulo))
        conn.commit()
        
        evaluacion_id = cursor.lastrowid
        return jsonify({
            'message': 'Evaluación creada exitosamente',
            'evaluacion_id': evaluacion_id,
            'nombre': nombre
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para eliminar una evaluación
@app.route('/api/evaluaciones/<int:evaluacion_id>', methods=['DELETE'])
def eliminar_evaluacion(evaluacion_id):
    """Elimina una evaluación"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Verificar que la evaluación existe
        cursor.execute('SELECT ID_Evaluacion, Nombre FROM Evaluaciones WHERE ID_Evaluacion = %s', (evaluacion_id,))
        evaluacion = cursor.fetchone()
        if not evaluacion:
            return jsonify({'error': 'La evaluación especificada no existe'}), 404
        
        # Eliminar la evaluación
        cursor.execute('DELETE FROM Evaluaciones WHERE ID_Evaluacion = %s', (evaluacion_id,))
        conn.commit()
        
        return jsonify({
            'message': f'Evaluación "{evaluacion[1]}" eliminada exitosamente'
        }), 200
        
    except Exception as e:
        conn.rollback()
        print(f"Error eliminando evaluación: {e}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500
    finally:
        conn.close()

# Endpoint para actualizar una evaluación
@app.route('/api/evaluaciones/<int:evaluacion_id>', methods=['PUT'])
def actualizar_evaluacion(evaluacion_id):
    """Actualiza una evaluación"""
    data = request.json
    nombre = data.get('nombre')
    descripcion = data.get('descripcion', '')
    puntaje_aprobacion = data.get('puntaje_aprobacion', 70.0)
    max_intentos = data.get('max_intentos', 3)
    
    if not nombre:
        return jsonify({'error': 'El nombre de la evaluación es obligatorio'}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor()
        
        # Verificar que la evaluación existe
        cursor.execute('SELECT ID_Evaluacion, Nombre FROM Evaluaciones WHERE ID_Evaluacion = %s', (evaluacion_id,))
        evaluacion = cursor.fetchone()
        if not evaluacion:
            return jsonify({'error': 'La evaluación especificada no existe'}), 404
        
        # Actualizar la evaluación
        cursor.execute('''
            UPDATE Evaluaciones 
            SET Nombre = %s, Descripcion = %s, Puntaje_aprobacion = %s, Max_intentos = %s
            WHERE ID_Evaluacion = %s
        ''', (nombre, descripcion, puntaje_aprobacion, max_intentos, evaluacion_id))
        
        conn.commit()
        
        # Retornar la evaluación actualizada
        cursor.execute('SELECT * FROM Evaluaciones WHERE ID_Evaluacion = %s', (evaluacion_id,))
        evaluacion_actualizada = cursor.fetchone()
        
        return jsonify({
            'message': 'Evaluación actualizada exitosamente',
            'evaluacion': {
                'ID_Evaluacion': evaluacion_actualizada[0],
                'ID_Leccion': evaluacion_actualizada[1],
                'ID_Modulo': evaluacion_actualizada[2],
                'Nombre': evaluacion_actualizada[3],
                'Descripcion': evaluacion_actualizada[4],
                'Puntaje_aprobacion': float(evaluacion_actualizada[5]),
                'Max_intentos': evaluacion_actualizada[6]
            }
        }), 200
        
    except Exception as e:
        conn.rollback()
        print(f"Error actualizando evaluación: {e}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500
    finally:
        conn.close()

# Endpoint para obtener resultados de evaluaciones
@app.route('/api/profesor/<int:profesor_id>/evaluaciones/<int:evaluacion_id>/resultados', methods=['GET'])
def get_resultados_evaluacion_profesor(profesor_id, evaluacion_id):
    """Obtiene todos los resultados de una evaluación"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT re.*, e.Nombre as Nombre_Estudiante, e.Correo_electronico
            FROM Resultados_Evaluaciones re
            JOIN Estudiantes e ON re.ID_Estudiante = e.ID_Estudiante
            WHERE re.ID_Evaluacion = %s
            ORDER BY re.Fecha_intento DESC
        ''', (evaluacion_id,))
        resultados = cursor.fetchall()
        
        return jsonify(resultados)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener estadísticas del profesor
@app.route('/api/profesor/<int:profesor_id>/estadisticas', methods=['GET'])
def get_estadisticas_profesor(profesor_id):
    """Obtiene estadísticas generales del profesor"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Estadísticas de cursos
        cursor.execute('''
            SELECT COUNT(*) as total_cursos,
                   COUNT(CASE WHEN Estado = 'activo' THEN 1 END) as cursos_activos,
                   COUNT(CASE WHEN Estado = 'inactivo' THEN 1 END) as cursos_inactivos
            FROM Cursos 
            WHERE ID_Profesor = %s
        ''', (profesor_id,))
        stats_cursos = cursor.fetchone()
        
        # Estadísticas de estudiantes
        cursor.execute('''
            SELECT COUNT(DISTINCT m.ID_Estudiante) as total_estudiantes,
                   COUNT(DISTINCT m.ID_Curso) as cursos_con_estudiantes,
                   AVG(m.Progreso_total) as promedio_progreso
            FROM Matriculas m
            JOIN Cursos c ON m.ID_Curso = c.ID_Curso
            WHERE c.ID_Profesor = %s
        ''', (profesor_id,))
        stats_estudiantes = cursor.fetchone()
        
        # Estadísticas de evaluaciones
        cursor.execute('''
            SELECT COUNT(*) as total_evaluaciones,
                   AVG(re.Puntaje) as promedio_puntaje_general,
                   COUNT(re.ID_Resultado) as total_intentos
            FROM Evaluaciones e
            LEFT JOIN Resultados_Evaluaciones re ON e.ID_Evaluacion = re.ID_Evaluacion
            WHERE e.ID_Leccion IN (
                SELECT l.ID_Leccion 
                FROM Lecciones l 
                JOIN Modulos m ON l.ID_Modulo = m.ID_Modulo 
                JOIN Cursos c ON m.ID_Curso = c.ID_Curso
                WHERE c.ID_Profesor = %s
            ) OR e.ID_Modulo IN (
                SELECT m.ID_Modulo 
                FROM Modulos m 
                JOIN Cursos c ON m.ID_Curso = c.ID_Curso
                WHERE c.ID_Profesor = %s
            )
        ''', (profesor_id, profesor_id))
        stats_evaluaciones = cursor.fetchone()
        
        estadisticas = {
            'cursos': stats_cursos,
            'estudiantes': stats_estudiantes,
            'evaluaciones': stats_evaluaciones
        }
        
        return jsonify(estadisticas)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Endpoint para obtener progreso detallado de un estudiante
@app.route('/api/profesor/<int:profesor_id>/estudiantes/<int:estudiante_id>/progreso', methods=['GET'])
def get_progreso_estudiante_profesor(profesor_id, estudiante_id):
    """Obtiene el progreso detallado de un estudiante en los cursos del profesor"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.ID_Curso, c.Nombre as Nombre_Curso, m.ID_Modulo, m.Nombre as Nombre_Modulo,
                   l.ID_Leccion, l.Nombre as Nombre_Leccion,
                   pl.Completado, pl.Tiempo_dedicado, pl.Fecha_ultimo_acceso,
                   re.Puntaje, re.Aprobado, re.Fecha_intento
            FROM Cursos c
            JOIN Modulos m ON c.ID_Curso = m.ID_Curso
            JOIN Lecciones l ON m.ID_Modulo = l.ID_Modulo
            LEFT JOIN Progreso_Lecciones pl ON l.ID_Leccion = pl.ID_Leccion AND pl.ID_Estudiante = %s
            LEFT JOIN Evaluaciones ev ON (l.ID_Leccion = ev.ID_Leccion OR m.ID_Modulo = ev.ID_Modulo)
            LEFT JOIN Resultados_Evaluaciones re ON ev.ID_Evaluacion = re.ID_Evaluacion AND re.ID_Estudiante = %s
            WHERE c.ID_Profesor = %s
            ORDER BY c.ID_Curso, m.Orden, l.Orden
        ''', (estudiante_id, estudiante_id, profesor_id))
        progreso = cursor.fetchall()
        
        return jsonify(progreso)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/')
def home():
    return '<h2>API Flask corriendo correctamente</h2>'

@app.route('/api/cursos', methods=['GET'])
def get_cursos():
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.ID_Curso, c.Nombre, c.Descripcion, c.Duracion_estimada, c.Estado, 
                   p.Nombre as Profesor_Nombre, c.ID_Profesor
            FROM Cursos c
            LEFT JOIN Profesores p ON c.ID_Profesor = p.ID_Profesor
            ORDER BY c.ID_Curso
        ''')
        cursos = cursor.fetchall()
        return jsonify(cursos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

def cargar_estructura_desde_bd():
    conn = get_connection()
    if not conn:
        print('No se pudo conectar a la base de datos para cargar la estructura.')
        return
    try:
        cursor = conn.cursor(dictionary=True)
        # Obtener todos los cursos
        cursor.execute('SELECT * FROM Cursos')
        cursos = cursor.fetchall()
        for c in cursos:
            curso = Curso(
                id=c['ID_Curso'],
                nombre=c['Nombre'],
                descripcion=c.get('Descripcion', ''),
                duracion_estimada=c.get('Duracion_estimada', 0),
                id_profesor=c.get('ID_Profesor')
            )
            # Obtener módulos de este curso
            cursor.execute('SELECT * FROM Modulos WHERE ID_Curso = %s', (c['ID_Curso'],))
            modulos = cursor.fetchall()
            for m in modulos:
                modulo = Modulo(
                    id=m['ID_Modulo'],
                    nombre=m['Nombre'],
                    descripcion=m.get('Descripcion', ''),
                    duracion_estimada=m.get('Duracion_estimada', 0),
                    id_curso=m['ID_Curso']
                )
                # Obtener lecciones de este módulo
                cursor.execute('SELECT * FROM Lecciones WHERE ID_Modulo = %s', (m['ID_Modulo'],))
                lecciones = cursor.fetchall()
                for l in lecciones:
                    leccion = Leccion(
                        id=l['ID_Leccion'],
                        nombre=l['Nombre'],
                        descripcion=l.get('Descripcion', ''),
                        contenido=l.get('Contenido', ''),
                        duracion_estimada=l.get('Duracion_estimada', 0),
                        id_modulo=l['ID_Modulo'],
                        es_obligatoria=bool(l.get('Es_obligatoria', 1))
                    )
                    # Obtener evaluaciones de esta lección
                    cursor.execute('SELECT * FROM Evaluaciones WHERE ID_Leccion = %s', (l['ID_Leccion'],))
                    evaluaciones = cursor.fetchall()
                    leccion.evaluaciones = [
                        {
                            'id': ev['ID_Evaluacion'],
                            'nombre': ev['Nombre'],
                            'descripcion': ev.get('Descripcion', ''),
                            'puntaje_aprobacion': ev.get('Puntaje_aprobacion', 0),
                            'max_intentos': ev.get('Max_intentos', 0)
                        }
                        for ev in evaluaciones
                    ]
                    modulo.agregar_leccion(leccion)
                curso.agregar_modulo(modulo)
            gestor_contenido.agregar_curso(curso)
    except Exception as e:
        print(f'Error cargando estructura desde la base de datos: {e}')
    finally:
        conn.close()

# Llamar a la función al iniciar el backend
cargar_estructura_desde_bd()

# Endpoint para obtener los cursos en los que está matriculado un estudiante
@app.route('/api/estudiante/<int:estudiante_id>/cursos', methods=['GET'])
def get_cursos_estudiante(estudiante_id):
    """Obtiene todos los cursos en los que está matriculado un estudiante"""
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.ID_Curso, c.Nombre, c.Descripcion, c.Duracion_estimada, c.Estado, 
                   p.Nombre as Profesor_Nombre, c.ID_Profesor, m.Fecha_matricula, m.Progreso_total
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

@app.route('/api/cursos/disponibles', methods=['GET'])
def get_cursos_disponibles():
    estudiante_id = request.args.get('estudiante_id')
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute('''
            SELECT c.ID_Curso, c.Nombre, c.Descripcion, c.Estado, c.Duracion_estimada, p.Nombre as Profesor_Nombre
            FROM Cursos c
            LEFT JOIN Profesores p ON c.ID_Profesor = p.ID_Profesor
            WHERE c.ID_Curso NOT IN (
                SELECT ID_Curso FROM Matriculas WHERE ID_Estudiante = %s
            )
        ''', (estudiante_id,))
        cursos = cursor.fetchall()
        return jsonify(cursos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/matricula', methods=['POST', 'OPTIONS'])
def matricular_estudiante():
    if request.method == 'OPTIONS':
        # Responder OK al preflight CORS
        return '', 200
    data = request.json
    estudiante_id = data.get('estudiante_id')
    curso_id = data.get('curso_id')
    if not estudiante_id or not curso_id:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        # Verificar si ya está matriculado
        cursor.execute('SELECT * FROM Matriculas WHERE ID_Estudiante = %s AND ID_Curso = %s', (estudiante_id, curso_id))
        if cursor.fetchone():
            return jsonify({'error': 'Ya está matriculado en este curso'}), 400
        # Insertar matrícula
        cursor.execute('INSERT INTO Matriculas (ID_Estudiante, ID_Curso, Estado, Progreso_total) VALUES (%s, %s, %s, %s)',
                       (estudiante_id, curso_id, 'activo', 0.0))
        conn.commit()
        return jsonify({'message': 'Matrícula exitosa'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
