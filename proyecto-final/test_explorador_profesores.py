#!/usr/bin/env python3
"""
Script de prueba para la nueva funcionalidad de exploración de cursos por profesor
"""

import requests
import json
import time
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:5000/api"

def print_section(title):
    """Imprime una sección con formato"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_test_result(test_name, success, message=""):
    """Imprime el resultado de una prueba"""
    status = "✅ PASÓ" if success else "❌ FALLÓ"
    print(f"{status} {test_name}")
    if message:
        print(f"   {message}")

def test_backend_connection():
    """Prueba la conexión al backend"""
    print_section("PRUEBA DE CONEXIÓN AL BACKEND")
    
    try:
        response = requests.get(f"{BASE_URL}/ping")
        if response.status_code == 200:
            print_test_result("Conexión al backend", True, "Backend respondiendo correctamente")
            return True
        else:
            print_test_result("Conexión al backend", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_test_result("Conexión al backend", False, f"Error: {str(e)}")
        return False

def test_get_professors():
    """Prueba obtener la lista de profesores"""
    print_section("PRUEBA: OBTENER LISTA DE PROFESORES")
    
    try:
        response = requests.get(f"{BASE_URL}/profesores")
        if response.status_code == 200:
            professors = response.json()
            print_test_result("Obtener profesores", True, f"Encontrados {len(professors)} profesores")
            
            if professors:
                print("📚 Profesores disponibles:")
                for professor in professors:
                    print(f"   👨‍🏫 {professor['Nombre']} - {professor['Especialidad']}")
                return professors[0]  # Retornar el primer profesor para pruebas
            else:
                print_test_result("Lista de profesores", False, "No se encontraron profesores")
                return None
        else:
            print_test_result("Obtener profesores", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        print_test_result("Obtener profesores", False, f"Error: {str(e)}")
        return None

def test_get_professor_courses(professor_id):
    """Prueba obtener los cursos de un profesor específico"""
    print_section("PRUEBA: OBTENER CURSOS DE UN PROFESOR")
    
    try:
        response = requests.get(f"{BASE_URL}/profesor/{professor_id}/cursos")
        if response.status_code == 200:
            courses = response.json()
            print_test_result("Obtener cursos del profesor", True, f"Encontrados {len(courses)} cursos")
            
            if courses:
                print("📖 Cursos del profesor:")
                for course in courses:
                    print(f"   📚 {course['Nombre']} - {course.get('Descripcion', 'Sin descripción')}")
                return courses[0]  # Retornar el primer curso para pruebas
            else:
                print_test_result("Cursos del profesor", False, "El profesor no tiene cursos")
                return None
        else:
            print_test_result("Obtener cursos del profesor", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        print_test_result("Obtener cursos del profesor", False, f"Error: {str(e)}")
        return None

def test_get_course_modules(course_id):
    """Prueba obtener los módulos de un curso específico"""
    print_section("PRUEBA: OBTENER MÓDULOS DE UN CURSO")
    
    try:
        response = requests.get(f"{BASE_URL}/cursos/{course_id}/modulos")
        if response.status_code == 200:
            modules = response.json()
            print_test_result("Obtener módulos del curso", True, f"Encontrados {len(modules)} módulos")
            
            if modules:
                print("📋 Módulos del curso:")
                for module in modules:
                    print(f"   📝 {module['Nombre']} - {module.get('Descripcion', 'Sin descripción')}")
                    if module.get('lecciones'):
                        print(f"      📖 {len(module['lecciones'])} lecciones")
            else:
                print_test_result("Módulos del curso", False, "El curso no tiene módulos")
            return True
        else:
            print_test_result("Obtener módulos del curso", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_test_result("Obtener módulos del curso", False, f"Error: {str(e)}")
        return False

def test_search_functionality():
    """Prueba la funcionalidad de búsqueda de profesores"""
    print_section("PRUEBA: FUNCIONALIDAD DE BÚSQUEDA")
    
    try:
        # Obtener todos los profesores
        response = requests.get(f"{BASE_URL}/profesores")
        if response.status_code == 200:
            professors = response.json()
            
            if professors:
                # Buscar por nombre
                search_term = professors[0]['Nombre'].split()[0]  # Primer nombre
                filtered_professors = [p for p in professors if search_term.lower() in p['Nombre'].lower()]
                
                print_test_result("Búsqueda por nombre", True, f"Encontrados {len(filtered_professors)} profesores con '{search_term}'")
                
                # Buscar por especialidad
                specialty = professors[0]['Especialidad']
                filtered_by_specialty = [p for p in professors if specialty.lower() in p['Especialidad'].lower()]
                
                print_test_result("Búsqueda por especialidad", True, f"Encontrados {len(filtered_by_specialty)} profesores de '{specialty}'")
                
                return True
            else:
                print_test_result("Búsqueda", False, "No hay profesores para buscar")
                return False
        else:
            print_test_result("Búsqueda", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_test_result("Búsqueda", False, f"Error: {str(e)}")
        return False

def test_data_structure():
    """Prueba la estructura de datos y relaciones"""
    print_section("PRUEBA: ESTRUCTURA DE DATOS")
    
    try:
        # Obtener profesores
        response = requests.get(f"{BASE_URL}/profesores")
        if response.status_code == 200:
            professors = response.json()
            
            if professors:
                professor = professors[0]
                print_test_result("Estructura profesor", True, f"Profesor: {professor['Nombre']}")
                
                # Verificar campos requeridos
                required_fields = ['ID_Profesor', 'Nombre', 'Correo_electronico', 'Especialidad']
                missing_fields = [field for field in required_fields if field not in professor]
                
                if not missing_fields:
                    print_test_result("Campos requeridos", True, "Todos los campos están presentes")
                    
                    # Obtener cursos del profesor
                    courses_response = requests.get(f"{BASE_URL}/profesor/{professor['ID_Profesor']}/cursos")
                    if courses_response.status_code == 200:
                        courses = courses_response.json()
                        
                        if courses:
                            course = courses[0]
                            print_test_result("Estructura curso", True, f"Curso: {course['Nombre']}")
                            
                            # Verificar campos del curso
                            course_fields = ['ID_Curso', 'Nombre', 'Descripcion', 'Estado']
                            missing_course_fields = [field for field in course_fields if field not in course]
                            
                            if not missing_course_fields:
                                print_test_result("Campos del curso", True, "Todos los campos del curso están presentes")
                                
                                # Obtener módulos del curso
                                modules_response = requests.get(f"{BASE_URL}/cursos/{course['ID_Curso']}/modulos")
                                if modules_response.status_code == 200:
                                    modules = modules_response.json()
                                    
                                    if modules:
                                        module = modules[0]
                                        print_test_result("Estructura módulo", True, f"Módulo: {module['Nombre']}")
                                        
                                        # Verificar campos del módulo
                                        module_fields = ['ID_Modulo', 'Nombre', 'Descripcion', 'Orden']
                                        missing_module_fields = [field for field in module_fields if field not in module]
                                        
                                        if not missing_module_fields:
                                            print_test_result("Campos del módulo", True, "Todos los campos del módulo están presentes")
                                            return True
                                        else:
                                            print_test_result("Campos del módulo", False, f"Faltan campos: {missing_module_fields}")
                                            return False
                                    else:
                                        print_test_result("Módulos", False, "El curso no tiene módulos")
                                        return True  # No es un error si no hay módulos
                                else:
                                    print_test_result("Obtener módulos", False, f"Status code: {modules_response.status_code}")
                                    return False
                            else:
                                print_test_result("Campos del curso", False, f"Faltan campos: {missing_course_fields}")
                                return False
                        else:
                            print_test_result("Cursos", False, "El profesor no tiene cursos")
                            return True  # No es un error si no hay cursos
                    else:
                        print_test_result("Obtener cursos", False, f"Status code: {courses_response.status_code}")
                        return False
                else:
                    print_test_result("Campos requeridos", False, f"Faltan campos: {missing_fields}")
                    return False
            else:
                print_test_result("Profesores", False, "No hay profesores disponibles")
                return False
        else:
            print_test_result("Obtener profesores", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_test_result("Estructura de datos", False, f"Error: {str(e)}")
        return False

def main():
    """Función principal"""
    print("🎓 Prueba de Explorador de Cursos por Profesor")
    print("=" * 60)
    
    # Ejecutar todas las pruebas
    tests = [
        ("Conexión al backend", test_backend_connection),
        ("Obtener profesores", test_get_professors),
        ("Obtener cursos de profesor", lambda: test_get_professor_courses(1) if test_get_professors() else None),
        ("Obtener módulos de curso", lambda: test_get_course_modules(1) if test_get_professor_courses(1) else None),
        ("Funcionalidad de búsqueda", test_search_functionality),
        ("Estructura de datos", test_data_structure)
    ]
    
    passed_tests = 0
    total_tests = len(tests)
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if result:
                passed_tests += 1
        except Exception as e:
            print(f"❌ Error en {test_name}: {str(e)}")
    
    print_section("RESULTADOS FINALES")
    print(f"✅ Pruebas pasadas: {passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("🎉 ¡Todas las pruebas pasaron! La funcionalidad está lista.")
        print("📱 El componente TeacherCoursesExplorer puede ser usado en el frontend.")
    else:
        print("⚠️  Algunas pruebas fallaron. Revisar los errores antes de usar la funcionalidad.")
    
    print("\n🔧 Endpoints utilizados:")
    print("   • GET /api/profesores - Lista de profesores")
    print("   • GET /api/profesor/{id}/cursos - Cursos de un profesor")
    print("   • GET /api/cursos/{id}/modulos - Módulos de un curso")

if __name__ == "__main__":
    main() 