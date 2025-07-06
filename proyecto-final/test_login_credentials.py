#!/usr/bin/env python3
"""
Script para probar el login con las credenciales de ejemplo
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"

def print_section(title):
    """Imprime una sección con formato"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_test_result(test_name, success, message="", response=None):
    """Imprime el resultado de una prueba"""
    status = "✅ PASÓ" if success else "❌ FALLÓ"
    print(f"{status} {test_name}")
    if message:
        print(f"   {message}")
    if response:
        print(f"   Status Code: {response.status_code}")
        if response.status_code != 200:
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Response: {response.text}")

def test_student_credentials():
    """Prueba las credenciales de estudiantes del archivo datos_ejemplo.sql"""
    print_section("PRUEBA: CREDENCIALES DE ESTUDIANTES")
    
    # Credenciales de estudiantes del archivo datos_ejemplo.sql
    students = [
        {'email': 'juan.perez@estudiante.edu', 'password': 'est123', 'name': 'Juan Pérez'},
        {'email': 'maria.lopez@estudiante.edu', 'password': 'est456', 'name': 'María López'},
        {'email': 'carlos.garcia@estudiante.edu', 'password': 'est789', 'name': 'Carlos García'},
        {'email': 'ana.torres@estudiante.edu', 'password': 'est101', 'name': 'Ana Torres'},
        {'email': 'luis.morales@estudiante.edu', 'password': 'est202', 'name': 'Luis Morales'}
    ]
    
    for student in students:
        try:
            response = requests.post(f"{BASE_URL}/login", 
                                   json={
                                       'email': student['email'], 
                                       'password': student['password'], 
                                       'role': 'student'
                                   },
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                user_data = response.json()
                print_test_result(f"Login {student['name']}", True, 
                                f"Login exitoso - ID: {user_data.get('ID_Estudiante')}")
            else:
                print_test_result(f"Login {student['name']}", False, 
                                f"Error en login", response)
        except Exception as e:
            print_test_result(f"Login {student['name']}", False, f"Error: {str(e)}")

def test_teacher_credentials():
    """Prueba las credenciales de profesores del archivo datos_ejemplo.sql"""
    print_section("PRUEBA: CREDENCIALES DE PROFESORES")
    
    # Credenciales de profesores del archivo datos_ejemplo.sql
    teachers = [
        {'email': 'maria.gonzalez@universidad.edu', 'password': 'prof123', 'name': 'Dr. María González'},
        {'email': 'carlos.rodriguez@universidad.edu', 'password': 'prof456', 'name': 'Dr. Carlos Rodríguez'},
        {'email': 'ana.martinez@universidad.edu', 'password': 'prof789', 'name': 'Dra. Ana Martínez'},
        {'email': 'luis.perez@universidad.edu', 'password': 'prof101', 'name': 'Dr. Luis Pérez'}
    ]
    
    for teacher in teachers:
        try:
            response = requests.post(f"{BASE_URL}/login", 
                                   json={
                                       'email': teacher['email'], 
                                       'password': teacher['password'], 
                                       'role': 'teacher'
                                   },
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                user_data = response.json()
                print_test_result(f"Login {teacher['name']}", True, 
                                f"Login exitoso - ID: {user_data.get('ID_Profesor')}")
            else:
                print_test_result(f"Login {teacher['name']}", False, 
                                f"Error en login", response)
        except Exception as e:
            print_test_result(f"Login {teacher['name']}", False, f"Error: {str(e)}")

def test_admin_credentials():
    """Prueba las credenciales de administradores del archivo datos_ejemplo.sql"""
    print_section("PRUEBA: CREDENCIALES DE ADMINISTRADORES")
    
    # Credenciales de administradores del archivo datos_ejemplo.sql
    admins = [
        {'email': 'admin@universidad.edu', 'password': 'admin123', 'name': 'Admin Principal'},
        {'email': 'admin2@universidad.edu', 'password': 'admin456', 'name': 'Admin Secundario'}
    ]
    
    for admin in admins:
        try:
            response = requests.post(f"{BASE_URL}/login", 
                                   json={
                                       'email': admin['email'], 
                                       'password': admin['password'], 
                                       'role': 'admin'
                                   },
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                user_data = response.json()
                print_test_result(f"Login {admin['name']}", True, 
                                f"Login exitoso - ID: {user_data.get('ID_Administrador')}")
            else:
                print_test_result(f"Login {admin['name']}", False, 
                                f"Error en login", response)
        except Exception as e:
            print_test_result(f"Login {admin['name']}", False, f"Error: {str(e)}")

def test_backend_connection():
    """Prueba la conexión básica al backend"""
    print_section("PRUEBA DE CONEXIÓN BÁSICA")
    
    try:
        response = requests.get(f"{BASE_URL}/ping")
        if response.status_code == 200:
            print_test_result("Conexión al backend", True, "Backend respondiendo correctamente")
            return True
        else:
            print_test_result("Conexión al backend", False, f"Status code: {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result("Conexión al backend", False, f"Error: {str(e)}")
        return False

def main():
    """Función principal"""
    print("🔍 Prueba de Login con Credenciales de Ejemplo")
    print("=" * 60)
    
    # Ejecutar pruebas
    if not test_backend_connection():
        print("\n❌ No se puede conectar al backend. Verificar que esté ejecutándose.")
        return
    
    # Probar credenciales
    test_student_credentials()
    test_teacher_credentials()
    test_admin_credentials()
    
    print_section("INSTRUCCIONES PARA EL USUARIO")
    print("📋 Si todas las pruebas fallan con error 401:")
    print("   1. Verificar que la base de datos esté ejecutándose")
    print("   2. Verificar que las tablas existan y tengan datos")
    print("   3. Ejecutar el script datos_ejemplo.sql en la base de datos")
    print("   4. Verificar la conexión a la base de datos en db_connect.py")
    print("")
    print("🔧 Comandos para verificar:")
    print("   mysql -u root -p proyecto < datos_ejemplo.sql")
    print("   python app.py")
    print("")
    print("📧 Credenciales de prueba:")
    print("   Estudiante: juan.perez@estudiante.edu / est123")
    print("   Profesor: maria.gonzalez@universidad.edu / prof123")
    print("   Admin: admin@universidad.edu / admin123")

if __name__ == "__main__":
    main() 