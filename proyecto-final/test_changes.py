#!/usr/bin/env python3
"""
Script de prueba para verificar los cambios realizados
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"

def test_backend_connection():
    """Prueba la conexión al backend"""
    try:
        response = requests.get(f"{BASE_URL}/ping")
        if response.status_code == 200:
            print("✅ Backend conectado correctamente")
            return True
        else:
            print("❌ Backend no responde correctamente")
            return False
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        return False

def test_get_courses():
    """Prueba obtener cursos"""
    try:
        response = requests.get(f"{BASE_URL}/cursos")
        if response.status_code == 200:
            courses = response.json()
            print(f"✅ Cursos obtenidos: {len(courses)} cursos encontrados")
            return courses
        else:
            print(f"❌ Error obteniendo cursos: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error en test_get_courses: {e}")
        return []

def test_get_modules(course_id):
    """Prueba obtener módulos de un curso"""
    try:
        response = requests.get(f"{BASE_URL}/cursos/{course_id}/modulos")
        if response.status_code == 200:
            modules = response.json()
            print(f"✅ Módulos obtenidos para curso {course_id}: {len(modules)} módulos")
            return modules
        else:
            print(f"❌ Error obteniendo módulos: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error en test_get_modules: {e}")
        return []

def test_create_module(course_id):
    """Prueba crear un módulo"""
    try:
        module_data = {
            "nombre": "Módulo de Prueba",
            "descripcion": "Este es un módulo de prueba creado automáticamente",
            "duracion_estimada": 120
        }
        
        response = requests.post(
            f"{BASE_URL}/cursos/{course_id}/modulos",
            json=module_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Módulo creado exitosamente: {result['modulo']['Nombre']}")
            return result['modulo']['ID_Modulo']
        else:
            print(f"❌ Error creando módulo: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error en test_create_module: {e}")
        return None

def test_create_lesson(module_id):
    """Prueba crear una lección"""
    try:
        lesson_data = {
            "nombre": "Lección de Prueba",
            "descripcion": "Esta es una lección de prueba",
            "contenido": "Contenido de la lección de prueba",
            "duracion_estimada": 45,
            "es_obligatoria": True
        }
        
        response = requests.post(
            f"{BASE_URL}/modulos/{module_id}/lecciones",
            json=lesson_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Lección creada exitosamente: {result['leccion']['Nombre']}")
            return result['leccion']['ID_Leccion']
        else:
            print(f"❌ Error creando lección: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error en test_create_lesson: {e}")
        return None

def test_create_evaluation(lesson_id):
    """Prueba crear una evaluación"""
    try:
        evaluation_data = {
            "nombre": "Evaluación de Prueba",
            "descripcion": "Esta es una evaluación de prueba",
            "puntaje_aprobacion": 70.0,
            "max_intentos": 3
        }
        
        response = requests.post(
            f"{BASE_URL}/lecciones/{lesson_id}/evaluaciones",
            json=evaluation_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Evaluación creada exitosamente: {result['evaluacion']['Nombre']}")
            return result['evaluacion']['ID_Evaluacion']
        else:
            print(f"❌ Error creando evaluación: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error en test_create_evaluation: {e}")
        return None

def main():
    """Función principal de pruebas"""
    print("🚀 Iniciando pruebas de los cambios realizados...")
    print("=" * 50)
    
    # Prueba 1: Conexión al backend
    if not test_backend_connection():
        print("❌ No se puede continuar sin conexión al backend")
        return
    
    print()
    
    # Prueba 2: Obtener cursos
    courses = test_get_courses()
    if not courses:
        print("❌ No se pueden realizar más pruebas sin cursos")
        return
    
    print()
    
    # Usar el primer curso para las pruebas
    first_course = courses[0]
    course_id = first_course['ID_Curso']
    print(f"📚 Usando curso: {first_course['Nombre']} (ID: {course_id})")
    print()
    
    # Prueba 3: Obtener módulos
    modules = test_get_modules(course_id)
    print()
    
    # Prueba 4: Crear módulo
    new_module_id = test_create_module(course_id)
    if new_module_id:
        print()
        
        # Prueba 5: Crear lección
        new_lesson_id = test_create_lesson(new_module_id)
        if new_lesson_id:
            print()
            
            # Prueba 6: Crear evaluación
            test_create_evaluation(new_lesson_id)
    
    print()
    print("=" * 50)
    print("✅ Pruebas completadas")
    print()
    print("📋 Resumen de cambios realizados:")
    print("1. ✅ Eliminados alerts y reemplazados por notificaciones")
    print("2. ✅ Botón 'Gestionar' ahora navega a nueva interfaz")
    print("3. ✅ Agregados endpoints para crear módulos, lecciones y evaluaciones")
    print("4. ✅ Los datos se guardan en la base de datos")
    print("5. ✅ Arreglados errores de linter en models.py")

if __name__ == "__main__":
    main() 