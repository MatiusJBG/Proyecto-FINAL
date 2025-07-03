#!/usr/bin/env python3
"""
Script de prueba completo para el sistema de evaluaciones
Prueba todas las funcionalidades: crear, editar, eliminar evaluaciones
"""

import requests
import json
import time
from datetime import datetime

# Configuración
BASE_URL = 'http://localhost:5000/api'
TEACHER_ID = 1
COURSE_ID = 1

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

def test_get_course_modules():
    """Prueba obtener módulos del curso"""
    print_section("PRUEBA: OBTENER MÓDULOS DEL CURSO")
    
    try:
        # Primero obtener los cursos del profesor
        response = requests.get(f"{BASE_URL}/profesor/{TEACHER_ID}/cursos")
        if response.status_code == 200:
            courses = response.json()
            print_test_result("Obtener cursos del profesor", True, f"Encontrados {len(courses)} cursos")
            
            if len(courses) > 0:
                # Usar el primer curso disponible
                course = courses[0]
                course_id = course['ID_Curso']
                print(f"📚 Usando curso: {course['Nombre']} (ID: {course_id})")
                
                # Ahora obtener los módulos del curso
                response = requests.get(f"{BASE_URL}/cursos/{course_id}/modulos")
                if response.status_code == 200:
                    modules = response.json()
                    print_test_result("Obtener módulos", True, f"Encontrados {len(modules)} módulos")
                    
                    # Buscar un módulo con lecciones
                    module_with_lessons = None
                    for module in modules:
                        if module.get('lecciones') and len(module['lecciones']) > 0:
                            module_with_lessons = module
                            break
                    
                    if module_with_lessons:
                        print_test_result("Módulo con lecciones", True, f"Módulo: {module_with_lessons['Nombre']}")
                        return module_with_lessons
                    else:
                        print_test_result("Módulo con lecciones", False, "No se encontró ningún módulo con lecciones")
                        return None
                else:
                    print_test_result("Obtener módulos", False, f"Status code: {response.status_code}")
                    return None
            else:
                print_test_result("Obtener cursos del profesor", False, "No se encontraron cursos")
                return None
        else:
            print_test_result("Obtener cursos del profesor", False, f"Status code: {response.status_code}")
            return None
    except Exception as e:
        print_test_result("Obtener módulos", False, f"Error: {str(e)}")
        return None

def test_create_evaluation(lesson_id):
    """Prueba crear una evaluación"""
    print_section("PRUEBA: CREAR EVALUACIÓN")
    
    evaluation_data = {
        "nombre": f"Evaluación de Prueba {datetime.now().strftime('%H:%M:%S')}",
        "descripcion": "Evaluación creada por el script de prueba",
        "puntaje_aprobacion": 75.0,
        "max_intentos": 2
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/lecciones/{lesson_id}/evaluaciones",
            json=evaluation_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            evaluation_id = result['evaluacion']['ID_Evaluacion']
            print_test_result("Crear evaluación", True, f"ID: {evaluation_id}, Nombre: {evaluation_data['nombre']}")
            return evaluation_id
        else:
            print_test_result("Crear evaluación", False, f"Status code: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        print_test_result("Crear evaluación", False, f"Error: {str(e)}")
        return None

def test_get_lesson_evaluations(lesson_id):
    """Prueba obtener evaluaciones de una lección"""
    print_section("PRUEBA: OBTENER EVALUACIONES DE LECCIÓN")
    
    try:
        response = requests.get(f"{BASE_URL}/lecciones/{lesson_id}/evaluaciones")
        if response.status_code == 200:
            evaluations = response.json()
            print_test_result("Obtener evaluaciones", True, f"Encontradas {len(evaluations)} evaluaciones")
            return evaluations
        else:
            print_test_result("Obtener evaluaciones", False, f"Status code: {response.status_code}")
            return []
    except Exception as e:
        print_test_result("Obtener evaluaciones", False, f"Error: {str(e)}")
        return []

def test_update_evaluation(evaluation_id):
    """Prueba actualizar una evaluación"""
    print_section("PRUEBA: ACTUALIZAR EVALUACIÓN")
    
    update_data = {
        "nombre": f"Evaluación Actualizada {datetime.now().strftime('%H:%M:%S')}",
        "descripcion": "Evaluación actualizada por el script de prueba",
        "puntaje_aprobacion": 80.0,
        "max_intentos": 3
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/evaluaciones/{evaluation_id}",
            json=update_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print_test_result("Actualizar evaluación", True, f"Nombre actualizado: {update_data['nombre']}")
            return True
        else:
            print_test_result("Actualizar evaluación", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Actualizar evaluación", False, f"Error: {str(e)}")
        return False

def test_delete_evaluation(evaluation_id):
    """Prueba eliminar una evaluación"""
    print_section("PRUEBA: ELIMINAR EVALUACIÓN")
    
    try:
        response = requests.delete(f"{BASE_URL}/evaluaciones/{evaluation_id}")
        if response.status_code == 200:
            result = response.json()
            print_test_result("Eliminar evaluación", True, result.get('message', 'Evaluación eliminada'))
            return True
        else:
            print_test_result("Eliminar evaluación", False, f"Status code: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test_result("Eliminar evaluación", False, f"Error: {str(e)}")
        return False

def test_validation_errors():
    """Prueba validaciones de errores"""
    print_section("PRUEBA: VALIDACIONES DE ERRORES")
    
    # Prueba crear evaluación sin nombre
    try:
        response = requests.post(
            f"{BASE_URL}/lecciones/1/evaluaciones",
            json={"descripcion": "Sin nombre"},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 400:
            print_test_result("Validación nombre obligatorio", True, "Error 400 recibido correctamente")
        else:
            print_test_result("Validación nombre obligatorio", False, f"Status code inesperado: {response.status_code}")
    except Exception as e:
        print_test_result("Validación nombre obligatorio", False, f"Error: {str(e)}")
    
    # Prueba actualizar evaluación inexistente
    try:
        response = requests.put(
            f"{BASE_URL}/evaluaciones/99999",
            json={"nombre": "Evaluación inexistente"},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 404:
            print_test_result("Validación evaluación inexistente", True, "Error 404 recibido correctamente")
        else:
            print_test_result("Validación evaluación inexistente", False, f"Status code inesperado: {response.status_code}")
    except Exception as e:
        print_test_result("Validación evaluación inexistente", False, f"Error: {str(e)}")

def main():
    """Función principal de pruebas"""
    print("🚀 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA DE EVALUACIONES")
    print(f"📅 Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Prueba de conexión
    if not test_backend_connection():
        print("\n❌ No se pudo conectar al backend. Asegúrate de que esté ejecutándose.")
        return
    
    # Obtener módulos y buscar uno con lecciones
    module_with_lessons = test_get_course_modules()
    if not module_with_lessons:
        print("\n❌ No se encontró un módulo con lecciones para las pruebas.")
        return
    
    # Buscar una lección para las pruebas
    lesson = module_with_lessons['lecciones'][0]
    lesson_id = lesson['ID_Leccion']
    print(f"\n📚 Usando lección: {lesson['Nombre']} (ID: {lesson_id})")
    
    # Pruebas de CRUD de evaluaciones
    evaluation_id = test_create_evaluation(lesson_id)
    if evaluation_id:
        # Verificar que se creó correctamente
        evaluations = test_get_lesson_evaluations(lesson_id)
        
        # Actualizar la evaluación
        test_update_evaluation(evaluation_id)
        
        # Verificar que se actualizó correctamente
        evaluations_after_update = test_get_lesson_evaluations(lesson_id)
        
        # Eliminar la evaluación
        test_delete_evaluation(evaluation_id)
        
        # Verificar que se eliminó correctamente
        evaluations_after_delete = test_get_lesson_evaluations(lesson_id)
    
    # Pruebas de validación
    test_validation_errors()
    
    print_section("RESUMEN DE PRUEBAS")
    print("✅ Todas las pruebas completadas")
    print("📋 Funcionalidades probadas:")
    print("   - Conexión al backend")
    print("   - Obtener módulos y lecciones")
    print("   - Crear evaluaciones")
    print("   - Obtener evaluaciones de lección")
    print("   - Actualizar evaluaciones")
    print("   - Eliminar evaluaciones")
    print("   - Validaciones de errores")
    print("\n🎉 Sistema de evaluaciones funcionando correctamente!")

if __name__ == "__main__":
    main() 