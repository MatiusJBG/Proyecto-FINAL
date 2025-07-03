#!/usr/bin/env python3
"""
Script para probar que el frontend ahora puede crear módulos, lecciones y evaluaciones
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"

def test_crear_modulo_leccion_evaluacion():
    """Prueba crear un módulo, lección y evaluación en secuencia"""
    print("🚀 Probando creación completa: Módulo → Lección → Evaluación")
    print("=" * 60)
    
    # 1. Obtener un curso existente
    print("📚 Obteniendo curso existente...")
    try:
        response = requests.get(f"{BASE_URL}/cursos")
        if response.status_code == 200:
            cursos = response.json()
            if cursos:
                curso = cursos[0]  # Usar el primer curso
                curso_id = curso['ID_Curso']
                print(f"✅ Usando curso: {curso['Nombre']} (ID: {curso_id})")
            else:
                print("❌ No hay cursos disponibles")
                return
        else:
            print(f"❌ Error al obtener cursos: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 2. Crear módulo
    print(f"\n🔧 Creando módulo en curso {curso_id}...")
    modulo_data = {
        "nombre": "Módulo Frontend Test",
        "descripcion": "Módulo para probar el frontend",
        "duracion_estimada": 45
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/cursos/{curso_id}/modulos",
            json=modulo_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            result = response.json()
            modulo_id = result['modulo']['ID_Modulo']
            print(f"✅ Módulo creado: {result['modulo']['Nombre']} (ID: {modulo_id})")
        else:
            print(f"❌ Error al crear módulo: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 3. Crear lección
    print(f"\n📖 Creando lección en módulo {modulo_id}...")
    leccion_data = {
        "nombre": "Lección Frontend Test",
        "descripcion": "Lección para probar el frontend",
        "contenido": "Contenido de la lección de prueba",
        "duracion_estimada": 30,
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
            print(f"✅ Lección creada: {result['leccion']['Nombre']} (ID: {leccion_id})")
        else:
            print(f"❌ Error al crear lección: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 4. Crear evaluación
    print(f"\n🎯 Creando evaluación en lección {leccion_id}...")
    evaluacion_data = {
        "nombre": "Evaluación Frontend Test",
        "descripcion": "Evaluación para probar el frontend",
        "puntaje_aprobacion": 70,
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
            print(f"✅ Evaluación creada: {result['evaluacion']['Nombre']} (ID: {evaluacion_id})")
        else:
            print(f"❌ Error al crear evaluación: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 5. Verificar que todo se creó correctamente
    print(f"\n🔍 Verificando que todo se creó correctamente...")
    try:
        # Verificar módulos del curso
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos = response.json()
            modulo_encontrado = next((m for m in modulos if m['ID_Modulo'] == modulo_id), None)
            if modulo_encontrado:
                print(f"✅ Módulo verificado: {modulo_encontrado['Nombre']}")
                
                # Verificar lecciones del módulo
                lecciones = modulo_encontrado.get('lecciones', [])
                leccion_encontrada = next((l for l in lecciones if l['ID_Leccion'] == leccion_id), None)
                if leccion_encontrada:
                    print(f"✅ Lección verificada: {leccion_encontrada['Nombre']}")
                    
                    # Verificar evaluaciones de la lección
                    evaluaciones = leccion_encontrada.get('evaluaciones', [])
                    evaluacion_encontrada = next((e for e in evaluaciones if e['ID_Evaluacion'] == evaluacion_id), None)
                    if evaluacion_encontrada:
                        print(f"✅ Evaluación verificada: {evaluacion_encontrada['Nombre']}")
                    else:
                        print(f"❌ Evaluación no encontrada")
                else:
                    print(f"❌ Lección no encontrada")
            else:
                print(f"❌ Módulo no encontrado")
        else:
            print(f"❌ Error al verificar módulos: {response.status_code}")
    except Exception as e:
        print(f"❌ Error al verificar: {e}")
    
    print(f"\n🎉 ¡Prueba completada!")
    print(f"📋 Resumen:")
    print(f"   Curso: {curso['Nombre']} (ID: {curso_id})")
    print(f"   Módulo: {modulo_data['nombre']} (ID: {modulo_id})")
    print(f"   Lección: {leccion_data['nombre']} (ID: {leccion_id})")
    print(f"   Evaluación: {evaluacion_data['nombre']} (ID: {evaluacion_id})")
    print(f"\n💡 Ahora puedes probar crear preguntas en la evaluación {evaluacion_id}")

def main():
    """Función principal"""
    test_crear_modulo_leccion_evaluacion()

if __name__ == "__main__":
    main() 