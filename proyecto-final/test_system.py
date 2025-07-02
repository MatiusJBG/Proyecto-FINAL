#!/usr/bin/env python3
"""
Script de prueba para verificar el funcionamiento del sistema
con programación orientada a objetos
"""

import requests
import json
import time
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:5000/api"
TEST_DATA = {
    "material": {
        "leccion_id": 1,
        "nombre": "Material de Prueba POO",
        "tipo": "documento",
        "url": "https://ejemplo.com/material.pdf",
        "orden": 1,
        "duracion": None
    },
    "busqueda": "programación",
    "estudiante_id": 1
}

def print_test_header(test_name):
    """Imprime un encabezado para el test"""
    print(f"\n{'='*60}")
    print(f"🧪 TEST: {test_name}")
    print(f"{'='*60}")

def print_success(message):
    """Imprime un mensaje de éxito"""
    print(f"✅ {message}")

def print_error(message):
    """Imprime un mensaje de error"""
    print(f"❌ {message}")

def print_info(message):
    """Imprime un mensaje informativo"""
    print(f"ℹ️  {message}")

def test_connection():
    """Prueba la conexión al servidor"""
    print_test_header("CONEXIÓN AL SERVIDOR")
    
    try:
        response = requests.get(f"{BASE_URL}/ping", timeout=5)
        if response.status_code == 200:
            print_success("Servidor respondiendo correctamente")
            return True
        else:
            print_error(f"Servidor respondió con código {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"No se pudo conectar al servidor: {e}")
        return False

def test_estructura_jerarquica():
    """Prueba la estructura jerárquica del contenido"""
    print_test_header("ESTRUCTURA JERÁRQUICA")
    
    # Obtener estructura completa
    try:
        response = requests.get(f"{BASE_URL}/estructura-completa")
        if response.status_code == 200:
            data = response.json()
            print_success("Estructura jerárquica obtenida")
            print_info(f"Total de cursos: {data.get('total_cursos', 0)}")
            
            if data.get('cursos'):
                curso = data['cursos'][0]
                print_info(f"Primer curso: {curso.get('nombre', 'N/A')}")
                print_info(f"Módulos: {len(curso.get('hijos', []))}")
            return True
        else:
            print_error(f"Error obteniendo estructura: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error en estructura jerárquica: {e}")
        return False

def test_crud_materiales():
    """Prueba el CRUD de materiales"""
    print_test_header("CRUD DE MATERIALES")
    
    # Crear material
    try:
        response = requests.post(
            f"{BASE_URL}/materiales/crear",
            json=TEST_DATA["material"],
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            data = response.json()
            material_id = data.get('material', {}).get('id')
            print_success("Material creado exitosamente")
            print_info(f"ID del material: {material_id}")
            
            # Leer material
            response = requests.get(f"{BASE_URL}/materiales/{material_id}")
            if response.status_code == 200:
                print_success("Material leído correctamente")
                
                # Actualizar material
                update_data = {"nombre": "Material Actualizado POO"}
                response = requests.put(
                    f"{BASE_URL}/materiales/{material_id}",
                    json=update_data,
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    print_success("Material actualizado correctamente")
                    
                    # Eliminar material
                    response = requests.delete(f"{BASE_URL}/materiales/{material_id}")
                    if response.status_code == 200:
                        print_success("Material eliminado correctamente")
                        return True
                    else:
                        print_error("Error eliminando material")
                        return False
                else:
                    print_error("Error actualizando material")
                    return False
            else:
                print_error("Error leyendo material")
                return False
        else:
            print_error(f"Error creando material: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error en CRUD de materiales: {e}")
        return False

def test_busquedas():
    """Prueba las búsquedas en la estructura jerárquica"""
    print_test_header("BÚSQUEDAS JERÁRQUICAS")
    
    try:
        # Búsqueda global
        response = requests.get(f"{BASE_URL}/buscar?termino={TEST_DATA['busqueda']}")
        if response.status_code == 200:
            data = response.json()
            print_success("Búsqueda global ejecutada")
            print_info(f"Resultados encontrados: {data.get('total_resultados', 0)}")
            
            # Búsqueda en curso específico
            response = requests.get(f"{BASE_URL}/cursos/1/buscar?termino={TEST_DATA['busqueda']}")
            if response.status_code == 200:
                data = response.json()
                print_success("Búsqueda en curso específico ejecutada")
                print_info(f"Resultados en curso: {data.get('total_resultados', 0)}")
                return True
            else:
                print_error("Error en búsqueda específica")
                return False
        else:
            print_error(f"Error en búsqueda global: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error en búsquedas: {e}")
        return False

def test_arbol_decision():
    """Prueba el árbol de decisión"""
    print_test_header("ÁRBOL DE DECISIÓN")
    
    try:
        # Obtener estructura del árbol
        response = requests.get(f"{BASE_URL}/arbol-decision")
        if response.status_code == 200:
            data = response.json()
            print_success("Estructura del árbol obtenida")
            
            if data.get('raiz'):
                print_info("Árbol de decisión inicializado correctamente")
                
                # Generar recomendación
                response = requests.post(
                    f"{BASE_URL}/estudiante/{TEST_DATA['estudiante_id']}/recomendacion-avanzada",
                    headers={'Content-Type': 'application/json'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print_success("Recomendación generada")
                    print_info(f"Tipo: {data.get('recomendacion', {}).get('tipo', 'N/A')}")
                    print_info(f"Prioridad: {data.get('recomendacion', {}).get('prioridad', 'N/A')}")
                    return True
                else:
                    print_error("Error generando recomendación")
                    return False
            else:
                print_error("Árbol de decisión no inicializado")
                return False
        else:
            print_error(f"Error obteniendo árbol: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error en árbol de decisión: {e}")
        return False

def test_gestores_poo():
    """Prueba los gestores orientados a objetos"""
    print_test_header("GESTORES ORIENTADOS A OBJETOS")
    
    try:
        # Importar las clases POO
        from models import GestorContenido, GestorMateriales, Curso, Modulo, Leccion, Recurso
        
        # Crear instancias
        gestor_contenido = GestorContenido()
        gestor_materiales = GestorMateriales(gestor_contenido)
        
        # Crear estructura de prueba
        curso = Curso(1, "Curso de Prueba POO", "Descripción de prueba")
        modulo = Modulo(1, "Módulo de Prueba", "Descripción del módulo", 60, 1)
        leccion = Leccion(1, "Lección de Prueba", "Contenido de prueba", 30, 1)
        recurso = Recurso(1, "Recurso de Prueba", "documento", "https://ejemplo.com", 1)
        
        # Construir jerarquía
        curso.agregar_modulo(modulo)
        modulo.agregar_leccion(leccion)
        leccion.agregar_recurso(recurso)
        
        # Agregar al gestor
        gestor_contenido.agregar_curso(curso)
        
        print_success("Estructura POO creada correctamente")
        print_info(f"Curso: {curso.nombre}")
        print_info(f"Módulos: {len(curso.obtener_modulos())}")
        print_info(f"Lecciones: {len(modulo.obtener_lecciones())}")
        print_info(f"Recursos: {len(leccion.recursos)}")
        
        # Probar búsqueda
        resultados = gestor_contenido.buscar_contenido("prueba")
        print_success(f"Búsqueda POO: {len(resultados)} resultados encontrados")
        
        # Probar recomendación
        datos_estudiante = {
            'promedio_puntajes': 75,
            'promedio_progreso': 60,
            'lecciones_completadas': 3,
            'total_evaluaciones': 5,
            'evaluaciones_aprobadas': 4,
            'tiempo_promedio': 45
        }
        
        recomendacion = gestor_contenido.generar_recomendacion(datos_estudiante)
        print_success("Recomendación POO generada")
        print_info(f"Tipo: {recomendacion.get('tipo')}")
        print_info(f"Prioridad: {recomendacion.get('prioridad')}")
        
        return True
        
    except Exception as e:
        print_error(f"Error en gestores POO: {e}")
        return False

def run_all_tests():
    """Ejecuta todas las pruebas"""
    print("🚀 INICIANDO PRUEBAS DEL SISTEMA CON PROGRAMACIÓN ORIENTADA A OBJETOS")
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Conexión al Servidor", test_connection),
        ("Estructura Jerárquica", test_estructura_jerarquica),
        ("CRUD de Materiales", test_crud_materiales),
        ("Búsquedas Jerárquicas", test_busquedas),
        ("Árbol de Decisión", test_arbol_decision),
        ("Gestores POO", test_gestores_poo)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"Error ejecutando {test_name}: {e}")
            results.append((test_name, False))
    
    # Resumen final
    print_test_header("RESUMEN DE PRUEBAS")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{status} - {test_name}")
    
    print(f"\n📊 RESULTADO FINAL: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print_success("🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está funcionando correctamente.")
        return True
    else:
        print_error(f"⚠️  {total - passed} pruebas fallaron. Revisar configuración.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1) 