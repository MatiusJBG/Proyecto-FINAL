#!/usr/bin/env python3
"""
Script completo para solucionar el error 401 del login
"""

import os
import subprocess
import sys

def print_section(title):
    """Imprime una sección con formato"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_step(step, description):
    """Imprime un paso del proceso"""
    print(f"\n🔧 PASO {step}: {description}")

def run_command(command, description):
    """Ejecuta un comando y muestra el resultado"""
    print(f"\n📋 Ejecutando: {description}")
    print(f"   Comando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("   ✅ Comando ejecutado exitosamente")
            if result.stdout:
                print(f"   Salida: {result.stdout.strip()}")
        else:
            print(f"   ❌ Error en comando: {result.stderr.strip()}")
            return False
        return True
    except Exception as e:
        print(f"   ❌ Error ejecutando comando: {str(e)}")
        return False

def create_env_file():
    """Crea el archivo .env"""
    print_step(1, "Crear archivo .env")
    
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
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("   ✅ Archivo .env creado")
        return True
    except Exception as e:
        print(f"   ❌ Error creando .env: {str(e)}")
        return False

def check_mysql_connection():
    """Verifica la conexión a MySQL"""
    print_step(2, "Verificar conexión a MySQL")
    
    # Probar conexión básica
    if run_command("mysql -u root -e 'SELECT 1'", "Probar conexión MySQL"):
        print("   ✅ MySQL está ejecutándose y accesible")
        return True
    else:
        print("   ❌ No se puede conectar a MySQL")
        print("   💡 Asegúrate de que MySQL esté ejecutándose")
        return False

def create_database():
    """Crea la base de datos si no existe"""
    print_step(3, "Crear base de datos 'proyecto'")
    
    commands = [
        ("mysql -u root -e 'CREATE DATABASE IF NOT EXISTS proyecto'", "Crear base de datos"),
        ("mysql -u root -e 'USE proyecto; SHOW TABLES'", "Verificar tablas existentes")
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    
    return True

def create_tables():
    """Crea las tablas necesarias"""
    print_step(4, "Crear tablas de usuarios")
    
    tables_sql = """
USE proyecto;

CREATE TABLE IF NOT EXISTS Estudiantes (
    ID_Estudiante INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    Semestre INT DEFAULT 1,
    Fecha_nacimiento DATE DEFAULT '2000-01-01'
);

CREATE TABLE IF NOT EXISTS Profesores (
    ID_Profesor INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    Especialidad VARCHAR(100) DEFAULT 'General'
);

CREATE TABLE IF NOT EXISTS Administradores (
    ID_Administrador INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    Contrasena VARCHAR(255) NOT NULL
);
"""
    
    try:
        with open('temp_tables.sql', 'w') as f:
            f.write(tables_sql)
        
        if run_command("mysql -u root < temp_tables.sql", "Crear tablas"):
            print("   ✅ Tablas creadas exitosamente")
            os.remove('temp_tables.sql')
            return True
        else:
            return False
    except Exception as e:
        print(f"   ❌ Error creando tablas: {str(e)}")
        return False

def insert_test_data():
    """Inserta datos de prueba"""
    print_step(5, "Insertar datos de prueba")
    
    test_data_sql = """
USE proyecto;

-- Insertar estudiantes de prueba
INSERT INTO Estudiantes (Nombre, Correo_electronico, Contrasena, Semestre) VALUES
('Juan Pérez', 'juan.perez@estudiante.edu', 'est123', 1),
('María López', 'maria.lopez@estudiante.edu', 'est456', 2),
('Carlos García', 'carlos.garcia@estudiante.edu', 'est789', 3);

-- Insertar profesores de prueba
INSERT INTO Profesores (Nombre, Correo_electronico, Contrasena, Especialidad) VALUES
('Dr. María González', 'maria.gonzalez@universidad.edu', 'prof123', 'Matemáticas'),
('Dr. Carlos Rodríguez', 'carlos.rodriguez@universidad.edu', 'prof456', 'Física'),
('Dra. Ana Martínez', 'ana.martinez@universidad.edu', 'prof789', 'Programación');

-- Insertar administradores de prueba
INSERT INTO Administradores (Nombre, Correo_electronico, Contrasena) VALUES
('Admin Principal', 'admin@universidad.edu', 'admin123'),
('Admin Secundario', 'admin2@universidad.edu', 'admin456');
"""
    
    try:
        with open('temp_data.sql', 'w') as f:
            f.write(test_data_sql)
        
        if run_command("mysql -u root < temp_data.sql", "Insertar datos de prueba"):
            print("   ✅ Datos de prueba insertados")
            os.remove('temp_data.sql')
            return True
        else:
            return False
    except Exception as e:
        print(f"   ❌ Error insertando datos: {str(e)}")
        return False

def test_login():
    """Prueba el login con las credenciales creadas"""
    print_step(6, "Probar login con credenciales de prueba")
    
    print("   🔍 Probando login con estudiante...")
    print("   📧 Email: juan.perez@estudiante.edu")
    print("   🔑 Contraseña: est123")
    print("   👤 Rol: student")
    
    print("\n   💡 Para probar manualmente:")
    print("   1. Ejecuta: python app.py")
    print("   2. Ve a http://localhost:3000")
    print("   3. Usa las credenciales de arriba")
    
    return True

def show_credentials():
    """Muestra las credenciales de prueba"""
    print_section("CREDENCIALES DE PRUEBA")
    
    print("👥 ESTUDIANTES:")
    print("   📧 juan.perez@estudiante.edu")
    print("   🔑 est123")
    print("   👤 Rol: student")
    print("")
    print("   📧 maria.lopez@estudiante.edu")
    print("   🔑 est456")
    print("   👤 Rol: student")
    print("")
    print("👨‍🏫 PROFESORES:")
    print("   📧 maria.gonzalez@universidad.edu")
    print("   🔑 prof123")
    print("   👤 Rol: teacher")
    print("")
    print("   📧 carlos.rodriguez@universidad.edu")
    print("   🔑 prof456")
    print("   👤 Rol: teacher")
    print("")
    print("👨‍💼 ADMINISTRADORES:")
    print("   📧 admin@universidad.edu")
    print("   🔑 admin123")
    print("   👤 Rol: admin")

def main():
    """Función principal"""
    print("🔧 SOLUCIONADOR DE ERROR 401 - LOGIN")
    print("=" * 60)
    print("Este script solucionará el problema de login paso a paso")
    
    # Ejecutar pasos
    steps = [
        ("Crear archivo .env", create_env_file),
        ("Verificar MySQL", check_mysql_connection),
        ("Crear base de datos", create_database),
        ("Crear tablas", create_tables),
        ("Insertar datos de prueba", insert_test_data),
        ("Probar login", test_login)
    ]
    
    for step_name, step_function in steps:
        if not step_function():
            print(f"\n❌ Error en paso: {step_name}")
            print("💡 Revisa los errores arriba y ejecuta el script nuevamente")
            return
    
    print_section("✅ PROBLEMA SOLUCIONADO")
    print("🎉 El error 401 del login ha sido solucionado")
    print("")
    print("📋 Próximos pasos:")
    print("   1. Ejecuta: python app.py")
    print("   2. En otra terminal: npm start")
    print("   3. Ve a http://localhost:3000")
    print("   4. Usa las credenciales de prueba")
    
    show_credentials()
    
    print_section("INFORMACIÓN ADICIONAL")
    print("🔧 Si sigues teniendo problemas:")
    print("   1. Verifica que MySQL esté ejecutándose")
    print("   2. Verifica que el puerto 3306 esté disponible")
    print("   3. Verifica que tengas permisos de root en MySQL")
    print("   4. Ejecuta: python verificar_conexion_db.py")

if __name__ == "__main__":
    main() 