from flask import Flask, jsonify, request
from db_connect import get_connection
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/estudiantes', methods=['POST'])
def crear_estudiante():
    data = request.json
    nombre = data.get('nombre')
    correo = data.get('correo_electronico')
    contrasena = data.get('contrasena')
    carrera = data.get('carrera', 'Por definir')
    semestre = data.get('semestre', 1)
    fecha_nacimiento = data.get('fecha_nacimiento', '2000-01-01')
    if not nombre or not correo or not contrasena:
        return jsonify({'error': 'Faltan datos obligatorios'}), 400
    conn = get_connection()
    if not conn:
        return jsonify({'error': 'No se pudo conectar a la base de datos'}), 500
    try:
        cursor = conn.cursor()
        cursor.execute('INSERT INTO Estudiantes (Nombre, Correo_electronico, Contrasena, Carrera, Semestre, Fecha_nacimiento) VALUES (%s, %s, %s, %s, %s, %s)',
                       (nombre, correo, contrasena, carrera, semestre, fecha_nacimiento))
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

@app.route('/')
def home():
    return '<h2>API Flask corriendo correctamente</h2>'

if __name__ == '__main__':
    app.run(debug=True)
