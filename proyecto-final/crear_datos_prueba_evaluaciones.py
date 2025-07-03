#!/usr/bin/env python3
"""
Script para crear datos de prueba necesarios para las evaluaciones
"""

import requests
import json
from datetime import datetime

# Configuración
BASE_URL = 'http://localhost:5000/api'
TEACHER_ID = 1
COURSE_ID = 8  # ID del curso "Visual"

def print_section(title):
    """Imprime una sección con formato"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_result(success, message):
    """Imprime el resultado de una operación"""
    status = "✅" if success else "❌"
    print(f"{status} {message}")

def crear_modulo_prueba():
    """Crea un módulo de prueba"""
    print_section("CREANDO MÓDULO DE PRUEBA")
    
    modulo_data = {
        "nombre": "Módulo de Prueba para Evaluaciones",
        "descripcion": "Módulo creado para probar el sistema de evaluaciones",
        "duracion_estimada": 120
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/cursos/{COURSE_ID}/modulos",
            json=modulo_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            modulo_id = result['modulo']['ID_Modulo']
            print_result(True, f"Módulo creado: {modulo_data['nombre']} (ID: {modulo_id})")
            return modulo_id
        else:
            print_result(False, f"Error creando módulo: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return None

def crear_leccion_prueba(modulo_id):
    """Crea una lección de prueba"""
    print_section("CREANDO LECCIÓN DE PRUEBA")
    
    leccion_data = {
        "nombre": "Lección de Prueba para Evaluaciones",
        "descripcion": "Lección creada para probar el sistema de evaluaciones",
        "contenido": "Este es el contenido de la lección de prueba.",
        "duracion_estimada": 45,
        "es_obligatoria": True
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/modulos/{modulo_id}/lecciones",
            json=leccion_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            leccion_id = result['leccion']['ID_Leccion']
            print_result(True, f"Lección creada: {leccion_data['nombre']} (ID: {leccion_id})")
            return leccion_id
        else:
            print_result(False, f"Error creando lección: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return None

def crear_evaluacion_prueba(leccion_id):
    """Crea una evaluación de prueba"""
    print_section("CREANDO EVALUACIÓN DE PRUEBA")
    
    evaluacion_data = {
        "nombre": "Evaluación de Prueba",
        "descripcion": "Evaluación creada para probar el sistema",
        "puntaje_aprobacion": 70.0,
        "max_intentos": 3
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/lecciones/{leccion_id}/evaluaciones",
            json=evaluacion_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            evaluacion_id = result['evaluacion']['ID_Evaluacion']
            print_result(True, f"Evaluación creada: {evaluacion_data['nombre']} (ID: {evaluacion_id})")
            return evaluacion_id
        else:
            print_result(False, f"Error creando evaluación: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return None

def verificar_datos_creados():
    """Verifica que los datos se crearon correctamente"""
    print_section("VERIFICANDO DATOS CREADOS")
    
    try:
        # Verificar módulos
        response = requests.get(f"{BASE_URL}/cursos/{COURSE_ID}/modulos")
        if response.status_code == 200:
            modulos = response.json()
            print_result(True, f"Encontrados {len(modulos)} módulos")
            
            if modulos:
                modulo = modulos[0]
                print(f"   📚 Módulo: {modulo['Nombre']}")
                
                if modulo.get('lecciones'):
                    leccion = modulo['lecciones'][0]
                    print(f"   📖 Lección: {leccion['Nombre']}")
                    
                    if leccion.get('evaluaciones'):
                        evaluacion = leccion['evaluaciones'][0]
                        print(f"   📝 Evaluación: {evaluacion['Nombre']}")
                        print_result(True, "Todos los datos creados correctamente")
                        return True
                    else:
                        print_result(False, "No se encontraron evaluaciones")
                        return False
                else:
                    print_result(False, "No se encontraron lecciones")
                    return False
            else:
                print_result(False, "No se encontraron módulos")
                return False
        else:
            print_result(False, f"Error verificando datos: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def main():
    """Función principal"""
    print("🚀 CREANDO DATOS DE PRUEBA PARA EVALUACIONES")
    print(f"📅 Fecha y hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Crear módulo
    modulo_id = crear_modulo_prueba()
    if not modulo_id:
        print("\n❌ No se pudo crear el módulo. Abortando.")
        return
    
    # Crear lección
    leccion_id = crear_leccion_prueba(modulo_id)
    if not leccion_id:
        print("\n❌ No se pudo crear la lección. Abortando.")
        return
    
    # Crear evaluación
    evaluacion_id = crear_evaluacion_prueba(leccion_id)
    if not evaluacion_id:
        print("\n❌ No se pudo crear la evaluación. Abortando.")
        return
    
    # Verificar que todo se creó correctamente
    verificar_datos_creados()
    
    print_section("RESUMEN")
    print("✅ Datos de prueba creados exitosamente")
    print(f"📋 Datos creados:")
    print(f"   - Módulo ID: {modulo_id}")
    print(f"   - Lección ID: {leccion_id}")
    print(f"   - Evaluación ID: {evaluacion_id}")
    print("\n🎉 Ahora puedes ejecutar las pruebas de evaluaciones!")

if __name__ == "__main__":
    main() 