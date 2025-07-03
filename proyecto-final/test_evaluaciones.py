#!/usr/bin/env python3
"""
Script para verificar que las evaluaciones se cargan correctamente
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"

def test_obtener_evaluaciones():
    """Prueba obtener evaluaciones de una lección"""
    print("🔍 Verificando evaluaciones...")
    
    # Primero obtener lecciones
    try:
        response = requests.get(f"{BASE_URL}/cursos/1/modulos")
        if response.status_code == 200:
            modulos = response.json()
            print(f"✅ Se encontraron {len(modulos)} módulos")
            
            for modulo in modulos:
                print(f"\n📚 Módulo: {modulo.get('Nombre', 'Sin nombre')} (ID: {modulo.get('ID_Modulo')})")
                
                # Obtener lecciones del módulo
                lecciones_response = requests.get(f"{BASE_URL}/modulos/{modulo['ID_Modulo']}/lecciones")
                if lecciones_response.status_code == 200:
                    lecciones = lecciones_response.json()
                    print(f"  📖 Lecciones encontradas: {len(lecciones)}")
                    
                    for leccion in lecciones:
                        print(f"    📝 Lección: {leccion.get('Nombre', 'Sin nombre')} (ID: {leccion.get('ID_Leccion')})")
                        
                        # Obtener evaluaciones de la lección
                        eval_response = requests.get(f"{BASE_URL}/lecciones/{leccion['ID_Leccion']}/evaluaciones")
                        if eval_response.status_code == 200:
                            evaluaciones = eval_response.json()
                            print(f"      🎯 Evaluaciones: {len(evaluaciones)}")
                            
                            for eval in evaluaciones:
                                print(f"        ✅ {eval.get('Nombre', 'Sin nombre')} (ID: {eval.get('ID_Evaluacion')})")
                                
                                # Probar crear una pregunta en esta evaluación
                                test_crear_pregunta(eval['ID_Evaluacion'])
                        else:
                            print(f"      ❌ Error al obtener evaluaciones: {eval_response.status_code}")
                else:
                    print(f"  ❌ Error al obtener lecciones: {lecciones_response.status_code}")
        else:
            print(f"❌ Error al obtener módulos: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

def test_crear_pregunta(evaluacion_id):
    """Prueba crear una pregunta en una evaluación específica"""
    print(f"    🧪 Probando crear pregunta en evaluación {evaluacion_id}...")
    
    pregunta_data = {
        "Enunciado": f"Pregunta de prueba para evaluación {evaluacion_id}",
        "Tipo": "seleccion_multiple",
        "Opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
        "Respuesta_correcta": "Opción B"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/evaluaciones/{evaluacion_id}/preguntas",
            json=pregunta_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"      ✅ Pregunta creada exitosamente (ID: {result.get('pregunta_id')})")
            
            # Verificar que la pregunta se guardó
            preguntas_response = requests.get(f"{BASE_URL}/evaluaciones/{evaluacion_id}/preguntas")
            if preguntas_response.status_code == 200:
                preguntas = preguntas_response.json()
                print(f"      📋 Preguntas en evaluación: {len(preguntas)}")
            return True
        else:
            print(f"      ❌ Error al crear pregunta: {response.status_code}")
            print(f"      📄 Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"      ❌ Error de conexión: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Verificando evaluaciones y creando preguntas de prueba...")
    print("=" * 60)
    
    test_obtener_evaluaciones()
    
    print("\n" + "=" * 60)
    print("🏁 Verificación completada")

if __name__ == "__main__":
    main() 