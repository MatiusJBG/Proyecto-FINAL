#!/usr/bin/env python3
"""
Script de diagnóstico para identificar la causa del error 401
en los endpoints de cursos y módulos
"""

import requests
import json
import time

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

def test_professors_endpoint():
    """Prueba el endpoint de profesores"""
    print_section("PRUEBA: ENDPOINT DE PROFESORES")
    
    try:
        response = requests.get(f"{BASE_URL}/profesores")
        if response.status_code == 200:
            professors = response.json()
            print_test_result("GET /api/profesores", True, f"Encontrados {len(professors)} profesores")
            return professors[0] if professors else None
        else:
            print_test_result("GET /api/profesores", False, "Error en endpoint de profesores", response)
            return None
    except Exception as e:
        print_test_result("GET /api/profesores", False, f"Error: {str(e)}")
        return None

def test_courses_endpoint():
    """Prueba el endpoint de cursos"""
    print_section("PRUEBA: ENDPOINT DE CURSOS")
    
    try:
        response = requests.get(f"{BASE_URL}/cursos")
        if response.status_code == 200:
            courses = response.json()
            print_test_result("GET /api/cursos", True, f"Encontrados {len(courses)} cursos")
            return courses[0] if courses else None
        else:
            print_test_result("GET /api/cursos", False, "Error en endpoint de cursos", response)
            return None
    except Exception as e:
        print_test_result("GET /api/cursos", False, f"Error: {str(e)}")
        return None

def test_professor_courses_endpoint(professor_id):
    """Prueba el endpoint de cursos de un profesor"""
    print_section("PRUEBA: CURSOS DE UN PROFESOR")
    
    try:
        response = requests.get(f"{BASE_URL}/profesor/{professor_id}/cursos")
        if response.status_code == 200:
            courses = response.json()
            print_test_result("GET /api/profesor/{id}/cursos", True, f"Encontrados {len(courses)} cursos del profesor")
            return courses[0] if courses else None
        else:
            print_test_result("GET /api/profesor/{id}/cursos", False, "Error en endpoint de cursos del profesor", response)
            return None
    except Exception as e:
        print_test_result("GET /api/profesor/{id}/cursos", False, f"Error: {str(e)}")
        return None

def test_course_modules_endpoint(course_id):
    """Prueba el endpoint de módulos de un curso"""
    print_section("PRUEBA: MÓDULOS DE UN CURSO")
    
    try:
        response = requests.get(f"{BASE_URL}/cursos/{course_id}/modulos")
        if response.status_code == 200:
            modules = response.json()
            print_test_result("GET /api/cursos/{id}/modulos", True, f"Encontrados {len(modules)} módulos del curso")
            return modules[0] if modules else None
        else:
            print_test_result("GET /api/cursos/{id}/modulos", False, "Error en endpoint de módulos del curso", response)
            return None
    except Exception as e:
        print_test_result("GET /api/cursos/{id}/modulos", False, f"Error: {str(e)}")
        return None

def test_with_headers():
    """Prueba con diferentes headers para identificar problemas de CORS o autenticación"""
    print_section("PRUEBA: HEADERS Y CORS")
    
    # Headers básicos
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/profesores", headers=headers)
        if response.status_code == 200:
            print_test_result("Con headers básicos", True, "Funciona con headers básicos")
        else:
            print_test_result("Con headers básicos", False, "Error con headers básicos", response)
    except Exception as e:
        print_test_result("Con headers básicos", False, f"Error: {str(e)}")
    
    # Headers con Origin
    headers_with_origin = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'http://localhost:3000'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/profesores", headers=headers_with_origin)
        if response.status_code == 200:
            print_test_result("Con Origin header", True, "Funciona con Origin header")
        else:
            print_test_result("Con Origin header", False, "Error con Origin header", response)
    except Exception as e:
        print_test_result("Con Origin header", False, f"Error: {str(e)}")

def test_authentication_requirements():
    """Prueba si los endpoints requieren autenticación"""
    print_section("PRUEBA: REQUISITOS DE AUTENTICACIÓN")
    
    # Probar sin autenticación
    try:
        response = requests.get(f"{BASE_URL}/profesores")
        if response.status_code == 401:
            print_test_result("Sin autenticación", False, "Endpoint requiere autenticación", response)
        elif response.status_code == 200:
            print_test_result("Sin autenticación", True, "Endpoint no requiere autenticación")
        else:
            print_test_result("Sin autenticación", False, f"Status code inesperado: {response.status_code}", response)
    except Exception as e:
        print_test_result("Sin autenticación", False, f"Error: {str(e)}")

def test_specific_error_401():
    """Prueba específicamente el error 401"""
    print_section("PRUEBA ESPECÍFICA: ERROR 401")
    
    endpoints_to_test = [
        "/profesores",
        "/cursos", 
        "/cursos/1/modulos",
        "/profesor/1/cursos"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            if response.status_code == 401:
                print_test_result(f"GET {endpoint}", False, "ERROR 401 - No autorizado", response)
            elif response.status_code == 200:
                print_test_result(f"GET {endpoint}", True, "Funciona correctamente")
            else:
                print_test_result(f"GET {endpoint}", False, f"Status code: {response.status_code}", response)
        except Exception as e:
            print_test_result(f"GET {endpoint}", False, f"Error: {str(e)}")

def check_server_logs():
    """Sugerencias para revisar logs del servidor"""
    print_section("SUGERENCIAS DE DIAGNÓSTICO")
    
    print("🔍 Para identificar la causa del error 401:")
    print("   1. Revisar logs del servidor Flask:")
    print("      - Ejecutar: python app.py")
    print("      - Observar mensajes de error en la consola")
    print("")
    print("   2. Verificar configuración de CORS:")
    print("      - Revisar @app.after_request en app.py")
    print("      - Verificar headers de respuesta")
    print("")
    print("   3. Verificar middleware de autenticación:")
    print("      - Buscar decoradores @login_required")
    print("      - Verificar funciones de autenticación")
    print("")
    print("   4. Probar con curl:")
    print("      curl -X GET http://localhost:5000/api/profesores")
    print("      curl -X GET http://localhost:5000/api/cursos")
    print("")
    print("   5. Verificar base de datos:")
    print("      - Conexión a MySQL")
    print("      - Tablas y datos existentes")

def main():
    """Función principal"""
    print("🔍 Diagnóstico de Error 401 - Endpoints de Cursos y Módulos")
    print("=" * 60)
    
    # Ejecutar pruebas
    if not test_backend_connection():
        print("\n❌ No se puede conectar al backend. Verificar que esté ejecutándose.")
        return
    
    # Probar endpoints básicos
    professor = test_professors_endpoint()
    course = test_courses_endpoint()
    
    # Probar endpoints específicos si tenemos datos
    if professor:
        professor_course = test_professor_courses_endpoint(professor['ID_Profesor'])
        if professor_course:
            test_course_modules_endpoint(professor_course['ID_Curso'])
    
    if course:
        test_course_modules_endpoint(course['ID_Curso'])
    
    # Probar headers y autenticación
    test_with_headers()
    test_authentication_requirements()
    test_specific_error_401()
    
    # Sugerencias
    check_server_logs()
    
    print_section("RESUMEN")
    print("📋 Si obtienes error 401, las posibles causas son:")
    print("   • Middleware de autenticación no configurado correctamente")
    print("   • Headers de autorización faltantes")
    print("   • Configuración CORS incorrecta")
    print("   • Problemas de permisos en la base de datos")
    print("   • Sesión expirada o inválida")

if __name__ == "__main__":
    main() 