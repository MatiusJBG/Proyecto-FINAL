#!/usr/bin/env python3
"""
Script de debug para probar los endpoints de lecciones y evaluaciones
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
            "nombre": "Módulo de Debug",
            "descripcion": "Este es un módulo de debug creado automáticamente",
            "duracion_estimada": 90
        }
        
        print(f"📤 Enviando datos del módulo: {json.dumps(module_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/cursos/{course_id}/modulos",
            json=module_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📥 Respuesta del servidor: {response.status_code}")
        print(f"📥 Contenido de la respuesta: {response.text}")
        
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
            "nombre": "Lección de Debug",
            "descripcion": "Esta es una lección de debug",
            "contenido": "Contenido de la lección de debug para pruebas",
            "duracion_estimada": 30,
            "es_obligatoria": True
        }
        
        print(f"📤 Enviando datos de la lección: {json.dumps(lesson_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/modulos/{module_id}/lecciones",
            json=lesson_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📥 Respuesta del servidor: {response.status_code}")
        print(f"📥 Contenido de la respuesta: {response.text}")
        
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
            "nombre": "Evaluación de Debug",
            "descripcion": "Esta es una evaluación de debug",
            "puntaje_aprobacion": 75.0,
            "max_intentos": 2
        }
        
        print(f"📤 Enviando datos de la evaluación: {json.dumps(evaluation_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/lecciones/{lesson_id}/evaluaciones",
            json=evaluation_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📥 Respuesta del servidor: {response.status_code}")
        print(f"📥 Contenido de la respuesta: {response.text}")
        
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

def test_verify_database(course_id):
    """Verifica que los datos se guardaron en la base de datos"""
    try:
        # Verificar módulos
        response = requests.get(f"{BASE_URL}/cursos/{course_id}/modulos")
        if response.status_code == 200:
            modules = response.json()
            print(f"\n📊 Verificación en base de datos:")
            print(f"   - Módulos en el curso: {len(modules)}")
            
            for module in modules:
                print(f"   - Módulo: {module['Nombre']} (ID: {module['ID_Modulo']})")
                if 'lecciones' in module:
                    print(f"     - Lecciones: {len(module['lecciones'])}")
                    for lesson in module['lecciones']:
                        print(f"       - Lección: {lesson['Nombre']} (ID: {lesson['ID_Leccion']})")
                        if 'evaluaciones' in lesson:
                            print(f"         - Evaluaciones: {len(lesson['evaluaciones'])}")
                            for eval in lesson['evaluaciones']:
                                print(f"           - Evaluación: {eval['Nombre']} (ID: {eval['ID_Evaluacion']})")
        
        return True
    except Exception as e:
        print(f"❌ Error verificando base de datos: {e}")
        return False

def main():
    """Función principal de debug"""
    print("🔍 Iniciando debug de endpoints...")
    print("=" * 60)
    
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
    
    # Prueba 3: Obtener módulos existentes
    modules = test_get_modules(course_id)
    print()
    
    # Prueba 4: Crear módulo de debug
    print("🔄 Creando módulo de debug...")
    new_module_id = test_create_module(course_id)
    if new_module_id:
        print()
        
        # Prueba 5: Crear lección de debug
        print("🔄 Creando lección de debug...")
        new_lesson_id = test_create_lesson(new_module_id)
        if new_lesson_id:
            print()
            
            # Prueba 6: Crear evaluación de debug
            print("🔄 Creando evaluación de debug...")
            test_create_evaluation(new_lesson_id)
    
    print()
    
    # Prueba 7: Verificar que todo se guardó en la base de datos
    print("🔄 Verificando datos en la base de datos...")
    test_verify_database(course_id)
    
    print()
    print("=" * 60)
    print("✅ Debug completado")

if __name__ == "__main__":
    main() 