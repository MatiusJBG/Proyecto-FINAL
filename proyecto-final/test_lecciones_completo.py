#!/usr/bin/env python3
"""
Script completo para probar todas las funcionalidades de lecciones:
- Crear lecciones
- Editar lecciones
- Eliminar lecciones
- Validaciones de dependencias
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def print_info(message):
    print(f"ℹ️  {message}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_warning(message):
    print(f"⚠️  {message}")

def test_lecciones_completo():
    """Prueba completa de todas las funcionalidades de lecciones"""
    
    print_info("Iniciando prueba completa de funcionalidades de lecciones...")
    
    # 1. Verificar servidor
    try:
        response = requests.get(f"{BASE_URL}/ping")
        if response.status_code == 200:
            print_success("Servidor funcionando")
        else:
            print_error("Servidor no responde")
            return False
    except Exception as e:
        print_error(f"Error de conexión: {e}")
        return False
    
    # 2. Obtener curso para pruebas
    try:
        response = requests.get(f"{BASE_URL}/cursos")
        if response.status_code == 200:
            cursos = response.json()
            if not cursos:
                print_error("No hay cursos disponibles")
                return False
            
            curso = cursos[0]
            curso_id = curso['ID_Curso']
            print_success(f"Curso de prueba: {curso['Nombre']} (ID: {curso_id})")
        else:
            print_error("No se pudieron obtener cursos")
            return False
    except Exception as e:
        print_error(f"Error obteniendo cursos: {e}")
        return False
    
    # 3. Crear un módulo de prueba
    nuevo_modulo = {
        "nombre": "Módulo Test Lecciones",
        "descripcion": "Módulo para probar funcionalidades de lecciones",
        "duracion_estimada": 60
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
            return False
    except Exception as e:
        print_error(f"Error en creación de módulo: {e}")
        return False
    
    # 4. Crear lección de prueba
    nueva_leccion = {
        "nombre": "Lección Test Inicial",
        "descripcion": "Lección inicial para pruebas",
        "contenido": "Contenido de la lección de prueba",
        "duracion_estimada": 30,
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
            return False
    except Exception as e:
        print_error(f"Error en creación de lección: {e}")
        return False
    
    # 5. Verificar que la lección aparece en la estructura
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos = response.json()
            modulo_encontrado = next((m for m in modulos if m['ID_Modulo'] == modulo_id), None)
            
            if modulo_encontrado and 'lecciones' in modulo_encontrado:
                lecciones = modulo_encontrado['lecciones']
                leccion_encontrada = next((l for l in lecciones if l['ID_Leccion'] == leccion_id), None)
                
                if leccion_encontrada:
                    print_success("Lección verificada en la estructura de módulos")
                    print(f"   📄 {leccion_encontrada['Nombre']}")
                    print(f"   📝 Descripción: {leccion_encontrada.get('Descripcion', 'Sin descripción')}")
                    print(f"   ⏱️  Duración: {leccion_encontrada.get('Duracion_estimada', 0)} min")
                    print(f"   📋 Obligatoria: {'Sí' if leccion_encontrada.get('Es_obligatoria') else 'No'}")
                else:
                    print_error("Lección no encontrada en la estructura")
                    return False
            else:
                print_error("Módulo no encontrado o sin lecciones")
                return False
        else:
            print_error("Error obteniendo estructura de módulos")
            return False
    except Exception as e:
        print_error(f"Error verificando estructura: {e}")
        return False
    
    # 6. Editar la lección
    leccion_editada = {
        "nombre": "Lección Test Editada",
        "descripcion": "Lección editada para pruebas",
        "contenido": "Contenido actualizado de la lección",
        "duracion_estimada": 45,
        "es_obligatoria": False
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/lecciones/{leccion_id}",
            json=leccion_editada,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print_success(f"Lección editada: {response.json()['message']}")
        else:
            print_error(f"Error editando lección: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error en edición de lección: {e}")
        return False
    
    # 7. Verificar que los cambios se aplicaron
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos = response.json()
            modulo_encontrado = next((m for m in modulos if m['ID_Modulo'] == modulo_id), None)
            
            if modulo_encontrado and 'lecciones' in modulo_encontrado:
                lecciones = modulo_encontrado['lecciones']
                leccion_encontrada = next((l for l in lecciones if l['ID_Leccion'] == leccion_id), None)
                
                if leccion_encontrada:
                    print_success("Cambios verificados en la lección:")
                    print(f"   📄 Nombre: {leccion_encontrada['Nombre']}")
                    print(f"   📝 Descripción: {leccion_encontrada.get('Descripcion', 'Sin descripción')}")
                    print(f"   ⏱️  Duración: {leccion_encontrada.get('Duracion_estimada', 0)} min")
                    print(f"   📋 Obligatoria: {'Sí' if leccion_encontrada.get('Es_obligatoria') else 'No'}")
                else:
                    print_error("Lección no encontrada después de editar")
                    return False
            else:
                print_error("Módulo no encontrado después de editar")
                return False
        else:
            print_error("Error obteniendo estructura después de editar")
            return False
    except Exception as e:
        print_error(f"Error verificando cambios: {e}")
        return False
    
    # 8. Crear una evaluación para probar validación de eliminación
    nueva_evaluacion = {
        "nombre": "Evaluación Test",
        "descripcion": "Evaluación para probar validación",
        "puntaje_aprobacion": 70,
        "max_intentos": 3
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
            return False
    except Exception as e:
        print_error(f"Error en creación de evaluación: {e}")
        return False
    
    # 9. Intentar eliminar lección con evaluación (debe fallar)
    try:
        response = requests.delete(f"{BASE_URL}/lecciones/{leccion_id}")
        if response.status_code == 400:
            error_msg = response.json()['error']
            print_warning(f"Validación funcionando: {error_msg}")
        else:
            print_error("La validación no funcionó como esperado")
            return False
    except Exception as e:
        print_error(f"Error probando validación: {e}")
        return False
    
    # 10. Eliminar la evaluación primero
    try:
        response = requests.delete(f"{BASE_URL}/evaluaciones/{evaluacion_id}")
        if response.status_code == 200:
            print_success("Evaluación eliminada correctamente")
        else:
            print_warning(f"No se pudo eliminar evaluación: {response.text}")
    except Exception as e:
        print_warning(f"Error eliminando evaluación: {e}")
    
    # 11. Ahora eliminar la lección
    try:
        response = requests.delete(f"{BASE_URL}/lecciones/{leccion_id}")
        if response.status_code == 200:
            print_success(f"Lección eliminada: {response.json()['message']}")
        else:
            print_error(f"Error eliminando lección: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error en eliminación de lección: {e}")
        return False
    
    # 12. Verificar que la lección fue eliminada
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos = response.json()
            modulo_encontrado = next((m for m in modulos if m['ID_Modulo'] == modulo_id), None)
            
            if modulo_encontrado and 'lecciones' in modulo_encontrado:
                lecciones = modulo_encontrado['lecciones']
                leccion_encontrada = next((l for l in lecciones if l['ID_Leccion'] == leccion_id), None)
                
                if not leccion_encontrada:
                    print_success("Lección eliminada correctamente de la estructura")
                else:
                    print_error("Lección aún aparece en la estructura")
                    return False
            else:
                print_error("Módulo no encontrado después de eliminar lección")
                return False
        else:
            print_error("Error obteniendo estructura después de eliminar")
            return False
    except Exception as e:
        print_error(f"Error verificando eliminación: {e}")
        return False
    
    # 13. Limpiar - eliminar el módulo de prueba
    try:
        response = requests.delete(f"{BASE_URL}/modulos/{modulo_id}")
        if response.status_code == 200:
            print_success(f"Módulo eliminado: {response.json()['message']}")
        else:
            print_warning(f"No se pudo eliminar módulo: {response.text}")
    except Exception as e:
        print_warning(f"Error eliminando módulo: {e}")
    
    print_success("🎉 ¡Prueba completa de lecciones exitosa!")
    print_info("📋 Todas las funcionalidades funcionan correctamente:")
    print_info("   ✅ Crear lecciones")
    print_info("   ✅ Editar lecciones")
    print_info("   ✅ Eliminar lecciones")
    print_info("   ✅ Validaciones de dependencias")
    print_info("   ✅ Estructura anidada")
    
    return True

if __name__ == "__main__":
    test_lecciones_completo() 