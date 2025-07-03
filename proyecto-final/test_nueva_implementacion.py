#!/usr/bin/env python3
"""
Script para probar la nueva implementación limpia de módulos
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"

def test_nueva_implementacion():
    """Prueba la nueva implementación limpia"""
    print("🚀 Probando nueva implementación limpia de módulos")
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
    print(f"\n🔍 Verificando módulos existentes...")
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
        "nombre": "Módulo Nueva Implementación",
        "descripcion": "Módulo creado con la nueva implementación limpia",
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
    
    # 5. Eliminar el módulo
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
    
    print(f"\n🎉 ¡Nueva implementación funcionando correctamente!")
    print(f"📋 Resumen:")
    print(f"   ✅ Creación de módulo: Funciona")
    print(f"   ✅ Verificación de módulo: Funciona")
    print(f"   ✅ Eliminación de módulo: Funciona")
    print(f"   ✅ Verificación de eliminación: Funciona")
    print(f"\n💡 La nueva interfaz está lista para usar")

def main():
    """Función principal"""
    test_nueva_implementacion()

if __name__ == "__main__":
    main() 