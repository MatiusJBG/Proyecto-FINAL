#!/usr/bin/env python3
"""
Script de prueba para verificar la funcionalidad de módulos en tiempo real
con lecciones y evaluaciones anidadas.
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def print_info(message):
    print(f"ℹ️  {message}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_warning(message):
    print(f"⚠️  {message}")

def test_modulos_tiempo_real():
    """Prueba completa de la funcionalidad de módulos en tiempo real"""
    
    print_info("Iniciando prueba de módulos en tiempo real...")
    
    # 1. Verificar que el servidor esté funcionando
    try:
        response = requests.get(f"{BASE_URL}/ping")
        if response.status_code == 200:
            print_success("Servidor funcionando correctamente")
        else:
            print_error("Servidor no responde correctamente")
            return
    except Exception as e:
        print_error(f"No se pudo conectar al servidor: {e}")
        return
    
    # 2. Obtener un curso existente
    try:
        response = requests.get(f"{BASE_URL}/cursos")
        if response.status_code == 200:
            cursos = response.json()
            if not cursos:
                print_error("No hay cursos disponibles para la prueba")
                return
            
            curso = cursos[0]  # Usar el primer curso
            curso_id = curso['ID_Curso']
            print_success(f"Usando curso: {curso['Nombre']} (ID: {curso_id})")
        else:
            print_error("No se pudieron obtener los cursos")
            return
    except Exception as e:
        print_error(f"Error obteniendo cursos: {e}")
        return
    
    # 3. Verificar módulos existentes
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos_iniciales = response.json()
            print_success(f"Módulos existentes: {len(modulos_iniciales)}")
            
            # Mostrar estructura de módulos existentes
            for modulo in modulos_iniciales:
                print(f"   📚 Módulo: {modulo['Nombre']}")
                if 'lecciones' in modulo and modulo['lecciones']:
                    print(f"      📖 Lecciones: {len(modulo['lecciones'])}")
                    for leccion in modulo['lecciones']:
                        print(f"         📄 {leccion['Nombre']}")
                        if 'evaluaciones' in leccion and leccion['evaluaciones']:
                            print(f"            ✅ Evaluaciones: {len(leccion['evaluaciones'])}")
                            for eval in leccion['evaluaciones']:
                                print(f"               📝 {eval['Nombre']}")
                else:
                    print(f"      📖 Sin lecciones")
        else:
            print_error("No se pudieron obtener los módulos")
            return
    except Exception as e:
        print_error(f"Error obteniendo módulos: {e}")
        return
    
    # 4. Crear un nuevo módulo
    nuevo_modulo = {
        "nombre": "Módulo de Prueba - Tiempo Real",
        "descripcion": "Este es un módulo creado para probar la funcionalidad en tiempo real",
        "duracion_estimada": 120
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/cursos/{curso_id}/modulos",
            json=nuevo_modulo,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            modulo_creado = response.json()
            modulo_id = modulo_creado['modulo']['ID_Modulo']
            print_success(f"Módulo creado: {modulo_creado['modulo']['Nombre']} (ID: {modulo_id})")
        else:
            print_error(f"Error creando módulo: {response.text}")
            return
    except Exception as e:
        print_error(f"Error en la creación del módulo: {e}")
        return
    
    # 5. Verificar que el módulo se creó correctamente
    time.sleep(1)  # Pequeña pausa para asegurar que se guardó en la BD
    
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos_despues_crear = response.json()
            modulo_encontrado = next((m for m in modulos_despues_crear if m['ID_Modulo'] == modulo_id), None)
            
            if modulo_encontrado:
                print_success(f"Módulo verificado en la base de datos: {modulo_encontrado['Nombre']}")
                print(f"   Total módulos ahora: {len(modulos_despues_crear)}")
            else:
                print_error("El módulo creado no se encontró en la base de datos")
                return
        else:
            print_error("No se pudieron obtener los módulos después de crear")
            return
    except Exception as e:
        print_error(f"Error verificando módulo creado: {e}")
        return
    
    # 6. Crear una lección en el módulo
    nueva_leccion = {
        "nombre": "Lección de Prueba - Tiempo Real",
        "descripcion": "Esta es una lección creada para probar la funcionalidad en tiempo real",
        "contenido": "Contenido de la lección de prueba",
        "duracion_estimada": 45,
        "es_obligatoria": True
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/modulos/{modulo_id}/lecciones",
            json=nueva_leccion,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            leccion_creada = response.json()
            leccion_id = leccion_creada['leccion']['ID_Leccion']
            print_success(f"Lección creada: {leccion_creada['leccion']['Nombre']} (ID: {leccion_id})")
        else:
            print_error(f"Error creando lección: {response.text}")
            return
    except Exception as e:
        print_error(f"Error en la creación de la lección: {e}")
        return
    
    # 7. Crear una evaluación en la lección
    nueva_evaluacion = {
        "nombre": "Evaluación de Prueba - Tiempo Real",
        "descripcion": "Esta es una evaluación creada para probar la funcionalidad en tiempo real",
        "puntaje_aprobacion": 70,
        "max_intentos": 3,
        "tiempo_limite": 30
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/lecciones/{leccion_id}/evaluaciones",
            json=nueva_evaluacion,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            evaluacion_creada = response.json()
            evaluacion_id = evaluacion_creada['evaluacion']['ID_Evaluacion']
            print_success(f"Evaluación creada: {evaluacion_creada['evaluacion']['Nombre']} (ID: {evaluacion_id})")
        else:
            print_error(f"Error creando evaluación: {response.text}")
            return
    except Exception as e:
        print_error(f"Error en la creación de la evaluación: {e}")
        return
    
    # 8. Verificar la estructura completa
    time.sleep(1)  # Pequeña pausa para asegurar que se guardó en la BD
    
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos_finales = response.json()
            modulo_final = next((m for m in modulos_finales if m['ID_Modulo'] == modulo_id), None)
            
            if modulo_final:
                print_success("Estructura completa verificada:")
                print(f"   📚 Módulo: {modulo_final['Nombre']}")
                
                if 'lecciones' in modulo_final and modulo_final['lecciones']:
                    print(f"      📖 Lecciones: {len(modulo_final['lecciones'])}")
                    for leccion in modulo_final['lecciones']:
                        print(f"         📄 {leccion['Nombre']}")
                        if 'evaluaciones' in leccion and leccion['evaluaciones']:
                            print(f"            ✅ Evaluaciones: {len(leccion['evaluaciones'])}")
                            for eval in leccion['evaluaciones']:
                                print(f"               📝 {eval['Nombre']} (Aprobación: {eval['Puntaje_aprobacion']}%)")
                        else:
                            print(f"            ✅ Sin evaluaciones")
                else:
                    print(f"      📖 Sin lecciones")
            else:
                print_error("No se pudo verificar la estructura completa")
                return
        else:
            print_error("No se pudieron obtener los módulos finales")
            return
    except Exception as e:
        print_error(f"Error verificando estructura completa: {e}")
        return
    
    # 9. Eliminar el módulo de prueba
    try:
        response = requests.delete(f"{BASE_URL}/modulos/{modulo_id}")
        if response.status_code == 200:
            print_success(f"Módulo eliminado: {response.json()['message']}")
        else:
            print_warning(f"Error eliminando módulo: {response.text}")
            return
    except Exception as e:
        print_warning(f"Error en la eliminación del módulo: {e}")
        return
    
    # 10. Verificar que se eliminó correctamente
    time.sleep(1)  # Pequeña pausa para asegurar que se eliminó de la BD
    
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos_finales = response.json()
            modulo_encontrado = next((m for m in modulos_finales if m['ID_Modulo'] == modulo_id), None)
            
            if not modulo_encontrado:
                print_success("Módulo eliminado correctamente de la base de datos")
                print(f"   Total módulos final: {len(modulos_finales)}")
            else:
                print_error("El módulo no se eliminó correctamente")
                return
        else:
            print_error("No se pudieron obtener los módulos después de eliminar")
            return
    except Exception as e:
        print_error(f"Error verificando eliminación: {e}")
        return
    
    print_success("¡Prueba de módulos en tiempo real completada exitosamente!")
    print_info("La funcionalidad está funcionando correctamente con la base de datos")

if __name__ == "__main__":
    test_modulos_tiempo_real() 