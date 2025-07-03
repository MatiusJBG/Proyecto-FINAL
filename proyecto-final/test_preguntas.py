#!/usr/bin/env python3
"""
Script de prueba para verificar la funcionalidad de preguntas y opciones
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"

def test_crear_pregunta():
    """Prueba crear una pregunta con opciones"""
    print("🧪 Probando creación de pregunta...")
    
    # Datos de la pregunta
    pregunta_data = {
        "Enunciado": "¿Cuál es la capital de Francia?",
        "Tipo": "seleccion_multiple",
        "Opciones": ["Londres", "París", "Madrid", "Roma"],
        "Respuesta_correcta": "París"
    }
    
    # ID de evaluación de prueba (debes tener una evaluación creada)
    evaluacion_id = 1
    
    try:
        response = requests.post(
            f"{BASE_URL}/evaluaciones/{evaluacion_id}/preguntas",
            json=pregunta_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Pregunta creada exitosamente. ID: {result.get('pregunta_id')}")
            return result.get('pregunta_id')
        else:
            print(f"❌ Error al crear pregunta: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_obtener_preguntas(evaluacion_id):
    """Prueba obtener preguntas de una evaluación"""
    print(f"🧪 Probando obtener preguntas de evaluación {evaluacion_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/evaluaciones/{evaluacion_id}/preguntas")
        
        if response.status_code == 200:
            preguntas = response.json()
            print(f"✅ Se obtuvieron {len(preguntas)} preguntas")
            for pregunta in preguntas:
                print(f"  - Pregunta: {pregunta['texto']}")
                print(f"    Opciones: {len(pregunta.get('opciones', []))}")
                for opcion in pregunta.get('opciones', []):
                    correcta = "✓" if opcion['es_correcta'] else " "
                    print(f"      {correcta} {opcion['texto']}")
            return preguntas
        else:
            print(f"❌ Error al obtener preguntas: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_eliminar_pregunta(pregunta_id):
    """Prueba eliminar una pregunta"""
    print(f"🧪 Probando eliminar pregunta {pregunta_id}...")
    
    try:
        response = requests.delete(f"{BASE_URL}/preguntas/{pregunta_id}")
        
        if response.status_code == 200:
            print(f"✅ Pregunta {pregunta_id} eliminada exitosamente")
            return True
        else:
            print(f"❌ Error al eliminar pregunta: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def main():
    """Función principal de pruebas"""
    print("🚀 Iniciando pruebas de preguntas y opciones...")
    print("=" * 50)
    
    # Prueba 1: Crear pregunta
    pregunta_id = test_crear_pregunta()
    
    if pregunta_id:
        print("\n" + "=" * 50)
        
        # Prueba 2: Obtener preguntas
        preguntas = test_obtener_preguntas(1)  # Evaluación ID 1
        
        if preguntas:
            print("\n" + "=" * 50)
            
            # Prueba 3: Eliminar pregunta
            test_eliminar_pregunta(pregunta_id)
    
    print("\n" + "=" * 50)
    print("🏁 Pruebas completadas")

if __name__ == "__main__":
    main() 