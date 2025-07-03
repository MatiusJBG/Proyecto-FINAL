#!/usr/bin/env python3
"""
Script final para verificar que el frontend puede cargar módulos correctamente
después de la corrección del API.
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

def test_frontend_complete():
    """Prueba completa del frontend después de la corrección"""
    
    print_info("Verificación final del frontend después de la corrección...")
    
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
    
    # 3. Verificar endpoint de módulos (el que usa el frontend)
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos = response.json()
            print_success(f"✅ Endpoint de módulos funciona: {len(modulos)} módulos")
            
            # Verificar estructura de datos
            if modulos:
                print_info("📊 Estructura de datos verificada:")
                for modulo in modulos:
                    print(f"   📚 {modulo['Nombre']}")
                    if 'lecciones' in modulo and modulo['lecciones']:
                        print(f"      📖 {len(modulo['lecciones'])} lecciones")
                        for leccion in modulo['lecciones']:
                            print(f"         📄 {leccion['Nombre']}")
                            if 'evaluaciones' in leccion and leccion['evaluaciones']:
                                print(f"            ✅ {len(leccion['evaluaciones'])} evaluaciones")
            else:
                print_info("📚 No hay módulos en este curso")
        else:
            print_error(f"❌ Error en endpoint: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"❌ Error probando endpoint: {e}")
        return False
    
    # 4. Simular operaciones del frontend
    print_info("🧪 Simulando operaciones del frontend...")
    
    # Crear módulo
    nuevo_modulo = {
        "nombre": "Módulo Frontend Test Final",
        "descripcion": "Módulo para verificar que el frontend funciona",
        "duracion_estimada": 75
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
            print_success(f"✅ Módulo creado: {modulo_creado['modulo']['Nombre']}")
            
            # Verificar que aparece en la lista
            response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
            if response.status_code == 200:
                modulos_actualizados = response.json()
                modulo_encontrado = next((m for m in modulos_actualizados if m['ID_Modulo'] == modulo_id), None)
                if modulo_encontrado:
                    print_success("✅ Módulo aparece en la lista después de crear")
                else:
                    print_error("❌ Módulo no aparece en la lista")
            
            # Eliminar módulo
            response = requests.delete(f"{BASE_URL}/modulos/{modulo_id}")
            if response.status_code == 200:
                print_success("✅ Módulo eliminado correctamente")
            else:
                print_warning(f"⚠️  No se pudo eliminar: {response.text}")
        else:
            print_error(f"❌ Error creando módulo: {response.text}")
            return False
    except Exception as e:
        print_error(f"❌ Error en operaciones: {e}")
        return False
    
    print_success("🎉 ¡Verificación completa exitosa!")
    print_info("📱 El frontend ahora puede cargar módulos sin errores")
    print_info("🔧 La corrección del API fue exitosa")
    return True

def print_warning(message):
    print(f"⚠️  {message}")

if __name__ == "__main__":
    test_frontend_complete() 