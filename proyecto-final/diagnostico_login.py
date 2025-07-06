#!/usr/bin/env python3
"""
Script de diagnóstico para el problema de login (error 401)
"""

import requests
import json
import mysql.connector
from db_connect import get_connection

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

def check_database_tables():
    """Verifica que las tablas de usuarios existan"""
    print_section("VERIFICACIÓN DE TABLAS DE BASE DE DATOS")
    
    conn = get_connection()
    if not conn:
        print_test_result("Conexión a base de datos", False, "No se pudo conectar a la base de datos")
        return False
    
    try:
        cursor = conn.cursor()
        
        # Verificar tabla Estudiantes
        cursor.execute("SHOW TABLES LIKE 'Estudiantes'")
        if cursor.fetchone():
            print_test_result("Tabla Estudiantes", True, "Existe")
            
            # Contar estudiantes
            cursor.execute("SELECT COUNT(*) FROM Estudiantes")
            count = cursor.fetchone()[0]
            print(f"   📊 Total de estudiantes: {count}")
            
            # Mostrar algunos estudiantes
            cursor.execute("SELECT ID_Estudiante, Nombre, Correo_electronico FROM Estudiantes LIMIT 3")
            students = cursor.fetchall()
            for student in students:
                print(f"   👤 ID: {student[0]}, Nombre: {student[1]}, Email: {student[2]}")
        else:
            print_test_result("Tabla Estudiantes", False, "No existe")
        
        # Verificar tabla Profesores
        cursor.execute("SHOW TABLES LIKE 'Profesores'")
        if cursor.fetchone():
            print_test_result("Tabla Profesores", True, "Existe")
            
            # Contar profesores
            cursor.execute("SELECT COUNT(*) FROM Profesores")
            count = cursor.fetchone()[0]
            print(f"   📊 Total de profesores: {count}")
            
            # Mostrar algunos profesores
            cursor.execute("SELECT ID_Profesor, Nombre, Correo_electronico FROM Profesores LIMIT 3")
            teachers = cursor.fetchall()
            for teacher in teachers:
                print(f"   👨‍🏫 ID: {teacher[0]}, Nombre: {teacher[1]}, Email: {teacher[2]}")
        else:
            print_test_result("Tabla Profesores", False, "No existe")
        
        # Verificar tabla Administradores
        cursor.execute("SHOW TABLES LIKE 'Administradores'")
        if cursor.fetchone():
            print_test_result("Tabla Administradores", True, "Existe")
            
            # Contar administradores
            cursor.execute("SELECT COUNT(*) FROM Administradores")
            count = cursor.fetchone()[0]
            print(f"   📊 Total de administradores: {count}")
        else:
            print_test_result("Tabla Administradores", False, "No existe")
        
        return True
        
    except Exception as e:
        print_test_result("Verificación de tablas", False, f"Error: {str(e)}")
        return False
    finally:
        conn.close()

def test_login_endpoint():
    """Prueba el endpoint de login con diferentes credenciales"""
    print_section("PRUEBA DEL ENDPOINT DE LOGIN")
    
    # Probar con datos vacíos
    try:
        response = requests.post(f"{BASE_URL}/login", 
                               json={}, 
                               headers={'Content-Type': 'application/json'})
        if response.status_code == 400:
            print_test_result("Login sin datos", True, "Correctamente rechazado")
        else:
            print_test_result("Login sin datos", False, f"Status inesperado: {response.status_code}", response)
    except Exception as e:
        print_test_result("Login sin datos", False, f"Error: {str(e)}")
    
    # Probar con rol inválido
    try:
        response = requests.post(f"{BASE_URL}/login", 
                               json={'email': 'test@test.com', 'password': 'test', 'role': 'invalid'},
                               headers={'Content-Type': 'application/json'})
        if response.status_code == 400:
            print_test_result("Login con rol inválido", True, "Correctamente rechazado")
        else:
            print_test_result("Login con rol inválido", False, f"Status inesperado: {response.status_code}", response)
    except Exception as e:
        print_test_result("Login con rol inválido", False, f"Error: {str(e)}")
    
    # Probar con credenciales inexistentes
    try:
        response = requests.post(f"{BASE_URL}/login", 
                               json={'email': 'nonexistent@test.com', 'password': 'wrongpass', 'role': 'student'},
                               headers={'Content-Type': 'application/json'})
        if response.status_code == 401:
            print_test_result("Login con credenciales inexistentes", True, "Correctamente rechazado")
        else:
            print_test_result("Login con credenciales inexistentes", False, f"Status inesperado: {response.status_code}", response)
    except Exception as e:
        print_test_result("Login con credenciales inexistentes", False, f"Error: {str(e)}")

def test_with_real_credentials():
    """Prueba con credenciales reales de la base de datos"""
    print_section("PRUEBA CON CREDENCIALES REALES")
    
    conn = get_connection()
    if not conn:
        print_test_result("Conexión para credenciales", False, "No se pudo conectar a la base de datos")
        return
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Probar con un estudiante
        cursor.execute("SELECT ID_Estudiante, Nombre, Correo_electronico, Contrasena FROM Estudiantes LIMIT 1")
        student = cursor.fetchone()
        
        if student:
            print(f"🔍 Probando login con estudiante: {student['Nombre']} ({student['Correo_electronico']})")
            
            try:
                response = requests.post(f"{BASE_URL}/login", 
                                       json={
                                           'email': student['Correo_electronico'], 
                                           'password': student['Contrasena'], 
                                           'role': 'student'
                                       },
                                       headers={'Content-Type': 'application/json'})
                
                if response.status_code == 200:
                    user_data = response.json()
                    print_test_result("Login estudiante", True, f"Login exitoso - ID: {user_data.get('ID_Estudiante')}")
                else:
                    print_test_result("Login estudiante", False, f"Error en login", response)
            except Exception as e:
                print_test_result("Login estudiante", False, f"Error: {str(e)}")
        else:
            print_test_result("Login estudiante", False, "No hay estudiantes en la base de datos")
        
        # Probar con un profesor
        cursor.execute("SELECT ID_Profesor, Nombre, Correo_electronico, Contrasena FROM Profesores LIMIT 1")
        teacher = cursor.fetchone()
        
        if teacher:
            print(f"🔍 Probando login con profesor: {teacher['Nombre']} ({teacher['Correo_electronico']})")
            
            try:
                response = requests.post(f"{BASE_URL}/login", 
                                       json={
                                           'email': teacher['Correo_electronico'], 
                                           'password': teacher['Contrasena'], 
                                           'role': 'teacher'
                                       },
                                       headers={'Content-Type': 'application/json'})
                
                if response.status_code == 200:
                    user_data = response.json()
                    print_test_result("Login profesor", True, f"Login exitoso - ID: {user_data.get('ID_Profesor')}")
                else:
                    print_test_result("Login profesor", False, f"Error en login", response)
            except Exception as e:
                print_test_result("Login profesor", False, f"Error: {str(e)}")
        else:
            print_test_result("Login profesor", False, "No hay profesores en la base de datos")
        
    except Exception as e:
        print_test_result("Prueba con credenciales reales", False, f"Error: {str(e)}")
    finally:
        conn.close()

def check_password_encryption():
    """Verifica si las contraseñas están encriptadas"""
    print_section("VERIFICACIÓN DE ENCRIPTACIÓN DE CONTRASEÑAS")
    
    conn = get_connection()
    if not conn:
        print_test_result("Conexión para verificación", False, "No se pudo conectar a la base de datos")
        return
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Verificar contraseñas de estudiantes
        cursor.execute("SELECT Contrasena FROM Estudiantes LIMIT 3")
        passwords = cursor.fetchall()
        
        for i, pwd in enumerate(passwords):
            password = pwd['Contrasena']
            if len(password) == 64:  # SHA-256 hash
                print_test_result(f"Contraseña estudiante {i+1}", True, "Está encriptada (SHA-256)")
            elif len(password) == 40:  # SHA-1 hash
                print_test_result(f"Contraseña estudiante {i+1}", True, "Está encriptada (SHA-1)")
            else:
                print_test_result(f"Contraseña estudiante {i+1}", False, f"No parece estar encriptada (longitud: {len(password)})")
        
        # Verificar contraseñas de profesores
        cursor.execute("SELECT Contrasena FROM Profesores LIMIT 3")
        passwords = cursor.fetchall()
        
        for i, pwd in enumerate(passwords):
            password = pwd['Contrasena']
            if len(password) == 64:  # SHA-256 hash
                print_test_result(f"Contraseña profesor {i+1}", True, "Está encriptada (SHA-256)")
            elif len(password) == 40:  # SHA-1 hash
                print_test_result(f"Contraseña profesor {i+1}", True, "Está encriptada (SHA-1)")
            else:
                print_test_result(f"Contraseña profesor {i+1}", False, f"No parece estar encriptada (longitud: {len(password)})")
        
    except Exception as e:
        print_test_result("Verificación de encriptación", False, f"Error: {str(e)}")
    finally:
        conn.close()

def create_test_user():
    """Crea un usuario de prueba para testing"""
    print_section("CREACIÓN DE USUARIO DE PRUEBA")
    
    conn = get_connection()
    if not conn:
        print_test_result("Conexión para crear usuario", False, "No se pudo conectar a la base de datos")
        return
    
    try:
        cursor = conn.cursor()
        
        # Crear estudiante de prueba
        test_email = "test_student@test.com"
        test_password = "test123"
        test_name = "Estudiante de Prueba"
        
        # Verificar si ya existe
        cursor.execute("SELECT ID_Estudiante FROM Estudiantes WHERE Correo_electronico = %s", (test_email,))
        if cursor.fetchone():
            print_test_result("Usuario de prueba", True, "Ya existe un estudiante de prueba")
        else:
            cursor.execute('''
                INSERT INTO Estudiantes (Nombre, Correo_electronico, Contrasena, Semestre, Fecha_nacimiento) 
                VALUES (%s, %s, %s, %s, %s)
            ''', (test_name, test_email, test_password, 1, '2000-01-01'))
            conn.commit()
            print_test_result("Usuario de prueba", True, "Estudiante de prueba creado exitosamente")
        
        # Probar login con el usuario de prueba
        try:
            response = requests.post(f"{BASE_URL}/login", 
                                   json={
                                       'email': test_email, 
                                       'password': test_password, 
                                       'role': 'student'
                                   },
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                user_data = response.json()
                print_test_result("Login usuario de prueba", True, f"Login exitoso - ID: {user_data.get('ID_Estudiante')}")
            else:
                print_test_result("Login usuario de prueba", False, f"Error en login", response)
        except Exception as e:
            print_test_result("Login usuario de prueba", False, f"Error: {str(e)}")
        
    except Exception as e:
        print_test_result("Creación de usuario de prueba", False, f"Error: {str(e)}")
    finally:
        conn.close()

def main():
    """Función principal"""
    print("🔍 Diagnóstico de Error 401 - Problema de Login")
    print("=" * 60)
    
    # Ejecutar pruebas
    if not test_backend_connection():
        print("\n❌ No se puede conectar al backend. Verificar que esté ejecutándose.")
        return
    
    # Verificar base de datos
    if not check_database_tables():
        print("\n❌ Problemas con la base de datos.")
        return
    
    # Probar endpoint de login
    test_login_endpoint()
    
    # Verificar encriptación
    check_password_encryption()
    
    # Probar con credenciales reales
    test_with_real_credentials()
    
    # Crear y probar usuario de prueba
    create_test_user()
    
    print_section("RESUMEN Y SOLUCIONES")
    print("📋 Posibles causas del error 401 en login:")
    print("   • Contraseñas encriptadas en BD pero comparación con texto plano")
    print("   • Campos de email/contraseña con nombres diferentes")
    print("   • Tablas de usuarios no existen o están vacías")
    print("   • Problemas de codificación de caracteres")
    print("   • Middleware de autenticación adicional")
    print("")
    print("🔧 Soluciones sugeridas:")
    print("   1. Verificar que las tablas Estudiantes/Profesores existan")
    print("   2. Verificar que haya usuarios en las tablas")
    print("   3. Verificar el formato de las contraseñas (encriptadas vs texto plano)")
    print("   4. Verificar los nombres de los campos en la BD")
    print("   5. Usar el usuario de prueba creado: test_student@test.com / test123")

if __name__ == "__main__":
    main() 