#!/usr/bin/env python3
"""
Script para probar la creación de módulos y diagnosticar problemas
"""

import requests
import json

# Configuración
BASE_URL = "http://localhost:5000/api"

def test_verificar_cursos():
    """Verifica que existan cursos en la base de datos"""
    print("🔍 Verificando cursos existentes...")
    
    try:
        response = requests.get(f"{BASE_URL}/cursos")
        if response.status_code == 200:
            cursos = response.json()
            print(f"✅ Se encontraron {len(cursos)} cursos")
            
            for curso in cursos:
                print(f"  📚 Curso: {curso.get('Nombre', 'Sin nombre')} (ID: {curso.get('ID_Curso')})")
                print(f"     Profesor: {curso.get('Profesor_Nombre', 'Sin profesor')}")
                print(f"     Estado: {curso.get('Estado', 'Desconocido')}")
            
            return cursos
        else:
            print(f"❌ Error al obtener cursos: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return []

def test_crear_curso():
    """Crea un curso de prueba si no existe ninguno"""
    print("\n🔧 Creando curso de prueba...")
    
    curso_data = {
        "nombre": "Curso de Prueba para Módulos",
        "descripcion": "Curso para probar la creación de módulos",
        "duracion_estimada": 60,
        "id_profesor": 1  # Ajusta este ID según tu base de datos
    }
    
    try:
        response = requests.post(f"{BASE_URL}/cursos", json=curso_data)
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Curso creado exitosamente:")
            print(f"   ID: {result.get('curso_id')}")
            print(f"   Nombre: {curso_data['nombre']}")
            return result.get('curso_id')
        else:
            print(f"❌ Error al crear curso: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_crear_modulo(curso_id):
    """Prueba crear un módulo en un curso específico"""
    print(f"\n🔧 Creando módulo en curso {curso_id}...")
    
    modulo_data = {
        "nombre": "Módulo de Prueba",
        "descripcion": "Este es un módulo de prueba para verificar que funciona",
        "duracion_estimada": 30
    }
    
    try:
        print(f"📤 Enviando datos: {json.dumps(modulo_data, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/cursos/{curso_id}/modulos",
            json=modulo_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📥 Respuesta del servidor: {response.status_code}")
        print(f"📥 Contenido: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Módulo creado exitosamente:")
            print(f"   ID: {result['modulo']['ID_Modulo']}")
            print(f"   Nombre: {result['modulo']['Nombre']}")
            return result['modulo']['ID_Modulo']
        else:
            print(f"❌ Error al crear módulo: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_verificar_modulos(curso_id):
    """Verifica que el módulo se creó correctamente"""
    print(f"\n🔍 Verificando módulos del curso {curso_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/cursos/{curso_id}/modulos")
        if response.status_code == 200:
            modulos = response.json()
            print(f"✅ Se encontraron {len(modulos)} módulos")
            
            for modulo in modulos:
                print(f"  📖 Módulo: {modulo.get('Nombre', 'Sin nombre')} (ID: {modulo.get('ID_Modulo')})")
                print(f"     Descripción: {modulo.get('Descripcion', 'Sin descripción')}")
                print(f"     Lecciones: {len(modulo.get('lecciones', []))}")
            
            return modulos
        else:
            print(f"❌ Error al obtener módulos: {response.status_code}")
            print(f"📄 Respuesta: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return []

def main():
    """Función principal"""
    print("🚀 Diagnóstico de creación de módulos")
    print("=" * 50)
    
    # 1. Verificar cursos existentes
    cursos = test_verificar_cursos()
    
    if not cursos:
        print("\n⚠️  No se encontraron cursos. Creando uno de prueba...")
        curso_id = test_crear_curso()
        if not curso_id:
            print("❌ No se pudo crear un curso. Verifica la base de datos.")
            return
    else:
        # Usar el primer curso disponible
        curso_id = cursos[0]['ID_Curso']
        print(f"\n✅ Usando curso existente: {cursos[0]['Nombre']} (ID: {curso_id})")
    
    # 2. Crear módulo
    modulo_id = test_crear_modulo(curso_id)
    
    if modulo_id:
        # 3. Verificar que se creó
        test_verificar_modulos(curso_id)
        
        print(f"\n🎉 ¡Éxito! Módulo creado con ID: {modulo_id}")
        print("Ahora puedes crear lecciones y evaluaciones.")
    else:
        print("\n❌ No se pudo crear el módulo. Revisa los errores arriba.")
    
    print("\n" + "=" * 50)
    print("🏁 Diagnóstico completado")

if __name__ == "__main__":
    main() 