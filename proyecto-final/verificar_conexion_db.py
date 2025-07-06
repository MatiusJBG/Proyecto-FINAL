#!/usr/bin/env python3
"""
Script para verificar la conexión a la base de datos
"""

import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

def print_section(title):
    """Imprime una sección con formato"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def check_env_file():
    """Verifica si existe el archivo .env"""
    print_section("VERIFICACIÓN DE ARCHIVO .ENV")
    
    env_file = '.env'
    if os.path.exists(env_file):
        print(f"✅ Archivo .env encontrado")
        
        # Leer y mostrar configuración (sin mostrar contraseñas completas)
        with open(env_file, 'r') as f:
            lines = f.readlines()
            for line in lines:
                if line.strip() and not line.startswith('#'):
                    if 'PASSWORD' in line.upper():
                        # Ocultar contraseña
                        parts = line.split('=')
                        if len(parts) >= 2:
                            print(f"   {parts[0]}=***")
                    else:
                        print(f"   {line.strip()}")
    else:
        print(f"❌ Archivo .env no encontrado")
        print("   Creando archivo .env con configuración por defecto...")
        
        # Crear archivo .env con configuración por defecto
        env_content = """# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=proyecto

# Configuración del Servidor
FLASK_ENV=development
FLASK_DEBUG=True
"""
        
        with open(env_file, 'w') as f:
            f.write(env_content)
        
        print("   ✅ Archivo .env creado con configuración por defecto")

def test_database_connection():
    """Prueba la conexión a la base de datos"""
    print_section("PRUEBA DE CONEXIÓN A BASE DE DATOS")
    
    # Cargar variables de entorno
    load_dotenv()
    
    # Obtener configuración
    host = os.getenv('DB_HOST', 'localhost')
    port = int(os.getenv('DB_PORT', 3306))
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'proyecto')
    
    print(f"🔧 Configuración actual:")
    print(f"   Host: {host}")
    print(f"   Port: {port}")
    print(f"   User: {user}")
    print(f"   Password: {'*' * len(password) if password else '(vacía)'}")
    print(f"   Database: {database}")
    
    try:
        # Intentar conexión sin especificar base de datos primero
        print(f"\n🔍 Probando conexión a MySQL...")
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password
        )
        
        if connection.is_connected():
            print("✅ Conexión a MySQL exitosa")
            
            # Verificar si la base de datos existe
            cursor = connection.cursor()
            cursor.execute("SHOW DATABASES")
            databases = [db[0] for db in cursor.fetchall()]
            
            if database in databases:
                print(f"✅ Base de datos '{database}' existe")
                
                # Conectar a la base de datos específica
                connection.close()
                connection = mysql.connector.connect(
                    host=host,
                    port=port,
                    user=user,
                    password=password,
                    database=database
                )
                
                if connection.is_connected():
                    print(f"✅ Conexión a '{database}' exitosa")
                    
                    # Verificar tablas
                    cursor = connection.cursor()
                    cursor.execute("SHOW TABLES")
                    tables = [table[0] for table in cursor.fetchall()]
                    
                    print(f"📋 Tablas encontradas ({len(tables)}):")
                    for table in tables:
                        cursor.execute(f"SELECT COUNT(*) FROM {table}")
                        count = cursor.fetchone()[0]
                        print(f"   - {table}: {count} registros")
                    
                    # Verificar usuarios específicos
                    print(f"\n👥 Verificando usuarios:")
                    
                    # Verificar estudiantes
                    cursor.execute("SELECT COUNT(*) FROM Estudiantes")
                    student_count = cursor.fetchone()[0]
                    print(f"   - Estudiantes: {student_count}")
                    
                    if student_count > 0:
                        cursor.execute("SELECT ID_Estudiante, Nombre, Correo_electronico FROM Estudiantes LIMIT 3")
                        students = cursor.fetchall()
                        for student in students:
                            print(f"     * ID: {student[0]}, Nombre: {student[1]}, Email: {student[2]}")
                    
                    # Verificar profesores
                    cursor.execute("SELECT COUNT(*) FROM Profesores")
                    teacher_count = cursor.fetchone()[0]
                    print(f"   - Profesores: {teacher_count}")
                    
                    if teacher_count > 0:
                        cursor.execute("SELECT ID_Profesor, Nombre, Correo_electronico FROM Profesores LIMIT 3")
                        teachers = cursor.fetchall()
                        for teacher in teachers:
                            print(f"     * ID: {teacher[0]}, Nombre: {teacher[1]}, Email: {teacher[2]}")
                    
                    connection.close()
                    return True
                else:
                    print(f"❌ No se pudo conectar a la base de datos '{database}'")
                    return False
            else:
                print(f"❌ Base de datos '{database}' no existe")
                print(f"   Bases de datos disponibles: {', '.join(databases)}")
                return False
                
        else:
            print("❌ No se pudo conectar a MySQL")
            return False
            
    except Error as e:
        print(f"❌ Error al conectar a MySQL: {e}")
        return False

def create_database_and_tables():
    """Crea la base de datos y tablas si no existen"""
    print_section("CREACIÓN DE BASE DE DATOS Y TABLAS")
    
    load_dotenv()
    
    host = os.getenv('DB_HOST', 'localhost')
    port = int(os.getenv('DB_PORT', 3306))
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'proyecto')
    
    try:
        # Conectar sin especificar base de datos
        connection = mysql.connector.connect(
            host=host,
            port=port,
            user=user,
            password=password
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Crear base de datos si no existe
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database}")
            print(f"✅ Base de datos '{database}' creada/verificada")
            
            # Usar la base de datos
            cursor.execute(f"USE {database}")
            
            # Crear tablas básicas si no existen
            tables_sql = [
                """
                CREATE TABLE IF NOT EXISTS Estudiantes (
                    ID_Estudiante INT AUTO_INCREMENT PRIMARY KEY,
                    Nombre VARCHAR(100) NOT NULL,
                    Correo_electronico VARCHAR(100) UNIQUE NOT NULL,
                    Contrasena VARCHAR(255) NOT NULL,
                    Semestre INT DEFAULT 1,
                    Fecha_nacimiento DATE DEFAULT '2000-01-01'
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS Profesores (
                    ID_Profesor INT AUTO_INCREMENT PRIMARY KEY,
                    Nombre VARCHAR(100) NOT NULL,
                    Correo_electronico VARCHAR(100) UNIQUE NOT NULL,
                    Contrasena VARCHAR(255) NOT NULL,
                    Especialidad VARCHAR(100) DEFAULT 'General'
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS Administradores (
                    ID_Administrador INT AUTO_INCREMENT PRIMARY KEY,
                    Nombre VARCHAR(100) NOT NULL,
                    Correo_electronico VARCHAR(100) UNIQUE NOT NULL,
                    Contrasena VARCHAR(255) NOT NULL
                )
                """
            ]
            
            for sql in tables_sql:
                cursor.execute(sql)
            
            print("✅ Tablas básicas creadas/verificadas")
            
            # Insertar datos de ejemplo si las tablas están vacías
            cursor.execute("SELECT COUNT(*) FROM Estudiantes")
            if cursor.fetchone()[0] == 0:
                print("📝 Insertando datos de ejemplo...")
                
                # Insertar estudiantes de ejemplo
                students_data = [
                    ('Juan Pérez', 'juan.perez@estudiante.edu', 'est123'),
                    ('María López', 'maria.lopez@estudiante.edu', 'est456'),
                    ('Carlos García', 'carlos.garcia@estudiante.edu', 'est789')
                ]
                
                for student in students_data:
                    cursor.execute('''
                        INSERT INTO Estudiantes (Nombre, Correo_electronico, Contrasena, Semestre)
                        VALUES (%s, %s, %s, %s)
                    ''', (student[0], student[1], student[2], 1))
                
                # Insertar profesores de ejemplo
                teachers_data = [
                    ('Dr. María González', 'maria.gonzalez@universidad.edu', 'prof123'),
                    ('Dr. Carlos Rodríguez', 'carlos.rodriguez@universidad.edu', 'prof456'),
                    ('Dra. Ana Martínez', 'ana.martinez@universidad.edu', 'prof789')
                ]
                
                for teacher in teachers_data:
                    cursor.execute('''
                        INSERT INTO Profesores (Nombre, Correo_electronico, Contrasena, Especialidad)
                        VALUES (%s, %s, %s, %s)
                    ''', (teacher[0], teacher[1], teacher[2], 'General'))
                
                # Insertar administradores de ejemplo
                admins_data = [
                    ('Admin Principal', 'admin@universidad.edu', 'admin123'),
                    ('Admin Secundario', 'admin2@universidad.edu', 'admin456')
                ]
                
                for admin in admins_data:
                    cursor.execute('''
                        INSERT INTO Administradores (Nombre, Correo_electronico, Contrasena)
                        VALUES (%s, %s, %s)
                    ''', (admin[0], admin[1], admin[2]))
                
                connection.commit()
                print("✅ Datos de ejemplo insertados")
            
            connection.close()
            return True
            
    except Error as e:
        print(f"❌ Error al crear base de datos: {e}")
        return False

def main():
    """Función principal"""
    print("🔍 Verificación de Conexión a Base de Datos")
    print("=" * 60)
    
    # Verificar archivo .env
    check_env_file()
    
    # Probar conexión
    if test_database_connection():
        print("\n✅ La base de datos está configurada correctamente")
    else:
        print("\n❌ Problemas con la base de datos")
        print("\n🔧 Intentando crear base de datos y tablas...")
        
        if create_database_and_tables():
            print("\n✅ Base de datos creada y configurada correctamente")
            print("\n🔄 Probando conexión nuevamente...")
            test_database_connection()
        else:
            print("\n❌ No se pudo crear la base de datos")
    
    print_section("INSTRUCCIONES")
    print("📋 Si hay problemas:")
    print("   1. Verificar que MySQL esté ejecutándose")
    print("   2. Verificar credenciales en el archivo .env")
    print("   3. Verificar que el puerto sea correcto (3306 por defecto)")
    print("   4. Ejecutar: mysql -u root -p")
    print("")
    print("🔧 Credenciales de prueba creadas:")
    print("   Estudiante: juan.perez@estudiante.edu / est123")
    print("   Profesor: maria.gonzalez@universidad.edu / prof123")
    print("   Admin: admin@universidad.edu / admin123")

if __name__ == "__main__":
    main() 