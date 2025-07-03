#!/usr/bin/env python3
"""
Script para probar la creación y eliminación de módulos
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://localhost:5000/api"

def test_crear_eliminar_modulos():
    """Prueba crear y eliminar módulos"""
    print("🚀 Probando CRUD de módulos: Crear → Verificar → Eliminar")
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
    
    # 2. Verificar módulos existentes
    print(f"\n🔍 Verificando módulos existentes en curso {curso_id}...")
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos_iniciales = response.json()
            print(f"✅ Módulos existentes: {len(modulos_iniciales)}")
            for modulo in modulos_iniciales:
                print(f"   📖 {modulo['Nombre']} (ID: {modulo['ID_Modulo']})")
        else:
            print(f"❌ Error al obtener módulos: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 3. Crear módulo de prueba
    print(f"\n🔧 Creando módulo de prueba...")
    modulo_data = {
        "nombre": "Módulo de Prueba CRUD",
        "descripcion": "Este módulo será eliminado para probar la funcionalidad",
        "duracion_estimada": 30
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
    
    # 4. Verificar que el módulo se creó
    print(f"\n🔍 Verificando que el módulo se creó...")
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos_despues_crear = response.json()
            modulo_encontrado = next((m for m in modulos_despues_crear if m['ID_Modulo'] == modulo_id), None)
            if modulo_encontrado:
                print(f"✅ Módulo verificado: {modulo_encontrado['Nombre']}")
                print(f"   Total módulos ahora: {len(modulos_despues_crear)}")
            else:
                print(f"❌ Módulo no encontrado después de crear")
                return
        else:
            print(f"❌ Error al verificar módulos: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 5. Intentar eliminar el módulo
    print(f"\n🗑️  Eliminando módulo {modulo_id}...")
    try:
        response = requests.delete(f"{BASE_URL}/modulos/{modulo_id}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Módulo eliminado: {result['message']}")
        else:
            print(f"❌ Error al eliminar módulo: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    # 6. Verificar que el módulo se eliminó
    print(f"\n🔍 Verificando que el módulo se eliminó...")
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos_finales = response.json()
            modulo_encontrado = next((m for m in modulos_finales if m['ID_Modulo'] == modulo_id), None)
            if not modulo_encontrado:
                print(f"✅ Módulo eliminado correctamente")
                print(f"   Total módulos final: {len(modulos_finales)}")
            else:
                print(f"❌ Módulo aún existe después de eliminar")
                return
        else:
            print(f"❌ Error al verificar módulos: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    print(f"\n🎉 ¡Prueba CRUD completada exitosamente!")
    print(f"📋 Resumen:")
    print(f"   ✅ Creación de módulo: Funciona")
    print(f"   ✅ Verificación de módulo: Funciona")
    print(f"   ✅ Eliminación de módulo: Funciona")
    print(f"   ✅ Verificación de eliminación: Funciona")

def test_eliminar_modulo_con_lecciones():
    """Prueba eliminar un módulo que tiene lecciones (debe fallar)"""
    print("\n" + "=" * 60)
    print("🧪 Probando eliminar módulo con lecciones (debe fallar)")
    print("=" * 60)
    
    # 1. Obtener un curso con módulos que tengan lecciones
    print("📚 Buscando módulo con lecciones...")
    try:
        response = requests.get(f"{BASE_URL}/cursos")
        if response.status_code == 200:
            cursos = response.json()
            if not cursos:
                print("❌ No hay cursos disponibles")
                return
            
            # Buscar un módulo con lecciones
            for curso in cursos:
                curso_id = curso['ID_Curso']
                response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
                if response.status_code == 200:
                    modulos = response.json()
                    for modulo in modulos:
                        if modulo.get('lecciones') and len(modulo['lecciones']) > 0:
                            print(f"✅ Encontrado módulo con lecciones: {modulo['Nombre']} (ID: {modulo['ID_Modulo']})")
                            print(f"   Lecciones: {len(modulo['lecciones'])}")
                            
                            # Intentar eliminar el módulo
                            print(f"\n🗑️  Intentando eliminar módulo con lecciones...")
                            delete_response = requests.delete(f"{BASE_URL}/modulos/{modulo['ID_Modulo']}")
                            
                            if delete_response.status_code == 400:
                                result = delete_response.json()
                                print(f"✅ Correcto: No se pudo eliminar: {result['error']}")
                                return
                            else:
                                print(f"❌ Error: Se eliminó un módulo con lecciones (no debería)")
                                return
            
            print("❌ No se encontraron módulos con lecciones")
        else:
            print(f"❌ Error al obtener cursos: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return

def main():
    """Función principal"""
    test_crear_eliminar_modulos()
    test_eliminar_modulo_con_lecciones()

if __name__ == "__main__":
    main() 