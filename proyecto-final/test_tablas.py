#!/usr/bin/env python3
"""
Script para verificar las tablas y probar la funcionalidad básica
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"

def test_diagnostico_tablas():
    """Prueba el endpoint de diagnóstico de tablas"""
    print("🔍 Verificando estado de las tablas...")
    
    try:
        response = requests.get(f"{BASE_URL}/diagnostico/tablas")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Diagnóstico completado:")
            print(f"  - Tabla preguntas existe: {data['tablas_existen']['preguntas']}")
            print(f"  - Tabla opciones existe: {data['tablas_existen']['opciones']}")
            print(f"  - Tabla evaluaciones existe: {data['tablas_existen']['evaluaciones']}")
            print(f"  - Conteo evaluaciones: {data['conteo']['evaluaciones']}")
            print(f"  - Conteo preguntas: {data['conteo']['preguntas']}")
            print(f"  - Conteo opciones: {data['conteo']['opciones']}")
            
            if data['estructura']['preguntas']:
                print("\n📋 Estructura tabla preguntas:")
                for campo in data['estructura']['preguntas']:
                    print(f"    - {campo['Field']}: {campo['Type']}")
                    
            if data['estructura']['opciones']:
                print("\n📋 Estructura tabla opciones:")
                for campo in data['estructura']['opciones']:
                    print(f"    - {campo['Field']}: {campo['Type']}")
            
            return data
        else:
            print(f"❌ Error en diagnóstico: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_crear_pregunta_simple():
    """Prueba crear una pregunta simple"""
    print("\n🧪 Probando creación de pregunta...")
    
    # Datos de la pregunta
    pregunta_data = {
        "Enunciado": "¿Cuál es la capital de Francia?",
        "Tipo": "seleccion_multiple",
        "Opciones": ["Londres", "París", "Madrid", "Roma"],
        "Respuesta_correcta": "París"
    }
    
    # ID de evaluación de prueba
    evaluacion_id = 1
    
    try:
        print(f"Enviando datos: {json.dumps(pregunta_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/evaluaciones/{evaluacion_id}/preguntas",
            json=pregunta_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Respuesta: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Pregunta creada exitosamente. ID: {result.get('pregunta_id')}")
            return result.get('pregunta_id')
        else:
            print(f"❌ Error al crear pregunta: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def main():
    """Función principal"""
    print("🚀 Iniciando verificación de tablas y funcionalidad...")
    print("=" * 60)
    
    # Paso 1: Verificar tablas
    diagnostico = test_diagnostico_tablas()
    
    if not diagnostico:
        print("❌ No se pudo obtener el diagnóstico")
        return
    
    # Paso 2: Verificar que las tablas existen
    if not diagnostico['tablas_existen']['preguntas']:
        print("❌ La tabla 'preguntas' no existe")
        print("💡 Necesitas crear la tabla preguntas primero")
        return
        
    if not diagnostico['tablas_existen']['opciones']:
        print("❌ La tabla 'opciones' no existe")
        print("💡 Necesitas crear la tabla opciones primero")
        return
        
    if not diagnostico['tablas_existen']['evaluaciones']:
        print("❌ La tabla 'evaluaciones' no existe")
        print("💡 Necesitas crear la tabla evaluaciones primero")
        return
    
    # Paso 3: Verificar que hay evaluaciones
    if diagnostico['conteo']['evaluaciones'] == 0:
        print("❌ No hay evaluaciones en la base de datos")
        print("💡 Necesitas crear al menos una evaluación primero")
        return
    
    print(f"✅ Hay {diagnostico['conteo']['evaluaciones']} evaluaciones disponibles")
    
    # Paso 4: Probar creación de pregunta
    pregunta_id = test_crear_pregunta_simple()
    
    if pregunta_id:
        print(f"\n✅ ¡Éxito! La pregunta {pregunta_id} se creó correctamente")
    else:
        print("\n❌ No se pudo crear la pregunta")
    
    print("\n" + "=" * 60)
    print("🏁 Verificación completada")

if __name__ == "__main__":
    main() 