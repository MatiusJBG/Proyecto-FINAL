#!/usr/bin/env python3
"""
Script para probar que la corrección del API funciona correctamente.
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

def test_api_correction():
    """Prueba que la corrección del API funciona"""
    
    print_info("Probando corrección del API...")
    
    # 1. Verificar que el servidor esté funcionando
    try:
        response = requests.get(f"{BASE_URL}/ping")
        if response.status_code == 200:
            print_success("Servidor funcionando correctamente")
        else:
            print_error("Servidor no responde correctamente")
            return False
    except Exception as e:
        print_error(f"No se pudo conectar al servidor: {e}")
        return False
    
    # 2. Obtener un curso existente
    try:
        response = requests.get(f"{BASE_URL}/cursos")
        if response.status_code == 200:
            cursos = response.json()
            if not cursos:
                print_error("No hay cursos disponibles para la prueba")
                return False
            
            curso = cursos[0]  # Usar el primer curso
            curso_id = curso['ID_Curso']
            print_success(f"Curso encontrado: {curso['Nombre']} (ID: {curso_id})")
        else:
            print_error("No se pudieron obtener los cursos")
            return False
    except Exception as e:
        print_error(f"Error obteniendo cursos: {e}")
        return False
    
    # 3. Probar el endpoint de módulos (el que usa el frontend)
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos = response.json()
            print_success(f"Endpoint de módulos funciona: {len(modulos)} módulos encontrados")
            
            # Mostrar estructura de datos
            if modulos:
                print_info("Estructura de datos recibida:")
                for i, modulo in enumerate(modulos[:2]):  # Mostrar solo los primeros 2
                    print(f"   📚 Módulo {i+1}: {modulo['Nombre']}")
                    print(f"      📝 ID: {modulo['ID_Modulo']}")
                    print(f"      📄 Descripción: {modulo.get('Descripcion', 'Sin descripción')}")
                    
                    if 'lecciones' in modulo and modulo['lecciones']:
                        print(f"      📖 Lecciones: {len(modulo['lecciones'])}")
                        for j, leccion in enumerate(modulo['lecciones'][:2]):  # Solo primeras 2
                            print(f"         📄 Lección {j+1}: {leccion['Nombre']}")
                            if 'evaluaciones' in leccion and leccion['evaluaciones']:
                                print(f"            ✅ Evaluaciones: {len(leccion['evaluaciones'])}")
                    else:
                        print(f"      📖 Sin lecciones")
            else:
                print_info("No hay módulos en este curso")
        else:
            print_error(f"Error en endpoint de módulos: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error probando endpoint de módulos: {e}")
        return False
    
    # 4. Probar creación de módulo
    nuevo_modulo = {
        "nombre": "Módulo Test API Corregido",
        "descripcion": "Módulo para probar que la corrección funciona",
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
            print_success(f"Módulo creado exitosamente: {modulo_creado['modulo']['Nombre']} (ID: {modulo_id})")
            
            # Verificar que se puede obtener inmediatamente
            response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
            if response.status_code == 200:
                modulos_actualizados = response.json()
                modulo_encontrado = next((m for m in modulos_actualizados if m['ID_Modulo'] == modulo_id), None)
                if modulo_encontrado:
                    print_success("Módulo verificado inmediatamente después de crear")
                else:
                    print_warning("Módulo no encontrado inmediatamente después de crear")
            
            # Limpiar - eliminar el módulo de prueba
            response = requests.delete(f"{BASE_URL}/modulos/{modulo_id}")
            if response.status_code == 200:
                print_success("Módulo de prueba eliminado correctamente")
            else:
                print_warning(f"No se pudo eliminar el módulo de prueba: {response.text}")
                
        else:
            print_error(f"Error creando módulo: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error en creación de módulo: {e}")
        return False
    
    print_success("¡Corrección del API verificada correctamente!")
    print_info("El frontend ahora puede conectarse sin errores")
    return True

def print_warning(message):
    print(f"⚠️  {message}")

if __name__ == "__main__":
    test_api_correction() 