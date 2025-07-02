#!/usr/bin/env python3
"""
Ejemplo de uso del Backend del Profesor
=======================================

Este archivo muestra cómo usar las clases y endpoints del backend del profesor
para realizar operaciones comunes en el sistema de gestión de estudiantes.
"""

import requests
import json
from datetime import datetime

# Configuración de la API
BASE_URL = "http://localhost:5000/api"
PROFESOR_ID = 1  # ID del profesor de ejemplo

def ejemplo_obtener_info_profesor():
    """Ejemplo: Obtener información del profesor"""
    print("=== OBTENER INFORMACIÓN DEL PROFESOR ===")
    
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}"
    response = requests.get(url)
    
    if response.status_code == 200:
        profesor = response.json()
        print(f"✅ Profesor encontrado:")
        print(f"   Nombre: {profesor['Nombre']}")
        print(f"   Correo: {profesor['Correo_electronico']}")
        print(f"   Especialidad: {profesor['Especialidad']}")
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def ejemplo_obtener_cursos_profesor():
    """Ejemplo: Obtener cursos del profesor"""
    print("=== OBTENER CURSOS DEL PROFESOR ===")
    
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}/cursos"
    response = requests.get(url)
    
    if response.status_code == 200:
        cursos = response.json()
        print(f"✅ Se encontraron {len(cursos)} cursos:")
        
        for curso in cursos:
            print(f"   📚 {curso['Nombre']}")
            print(f"      Módulos: {curso['total_modulos']}")
            print(f"      Lecciones: {curso['total_lecciones']}")
            print(f"      Estudiantes: {curso['total_estudiantes']}")
            print()
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def ejemplo_crear_curso():
    """Ejemplo: Crear un nuevo curso"""
    print("=== CREAR NUEVO CURSO ===")
    
    nuevo_curso = {
        "nombre": "Programación Avanzada",
        "descripcion": "Curso de programación orientada a objetos y patrones de diseño",
        "duracion_estimada": 80
    }
    
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}/cursos"
    response = requests.post(url, json=nuevo_curso)
    
    if response.status_code == 201:
        resultado = response.json()
        print(f"✅ Curso creado exitosamente:")
        print(f"   ID: {resultado['curso_id']}")
        print(f"   Nombre: {resultado['nombre']}")
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def ejemplo_obtener_estudiantes_curso():
    """Ejemplo: Obtener estudiantes de un curso"""
    print("=== OBTENER ESTUDIANTES DE UN CURSO ===")
    
    curso_id = 1  # ID del curso de ejemplo
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}/cursos/{curso_id}/estudiantes"
    response = requests.get(url)
    
    if response.status_code == 200:
        estudiantes = response.json()
        print(f"✅ Se encontraron {len(estudiantes)} estudiantes:")
        
        for estudiante in estudiantes:
            print(f"   👤 {estudiante['Nombre']}")
            print(f"      Correo: {estudiante['Correo_electronico']}")
            print(f"      Semestre: {estudiante['Semestre']}")
            print(f"      Progreso: {estudiante['Progreso_total']}%")
            print(f"      Lecciones completadas: {estudiante['lecciones_completadas']}")
            print()
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def ejemplo_crear_evaluacion():
    """Ejemplo: Crear una nueva evaluación"""
    print("=== CREAR NUEVA EVALUACIÓN ===")
    
    nueva_evaluacion = {
        "nombre": "Examen Final - Módulo 1",
        "descripcion": "Evaluación final del primer módulo del curso",
        "puntaje_aprobacion": 75.0,
        "max_intentos": 2,
        "id_leccion": 5  # ID de la lección asociada
    }
    
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}/evaluaciones"
    response = requests.post(url, json=nueva_evaluacion)
    
    if response.status_code == 201:
        resultado = response.json()
        print(f"✅ Evaluación creada exitosamente:")
        print(f"   ID: {resultado['evaluacion_id']}")
        print(f"   Nombre: {resultado['nombre']}")
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def ejemplo_obtener_evaluaciones_curso():
    """Ejemplo: Obtener evaluaciones de un curso"""
    print("=== OBTENER EVALUACIONES DE UN CURSO ===")
    
    curso_id = 1  # ID del curso de ejemplo
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}/cursos/{curso_id}/evaluaciones"
    response = requests.get(url)
    
    if response.status_code == 200:
        evaluaciones = response.json()
        print(f"✅ Se encontraron {len(evaluaciones)} evaluaciones:")
        
        for evaluacion in evaluaciones:
            print(f"   📝 {evaluacion['Nombre']}")
            print(f"      Puntaje aprobación: {evaluacion['Puntaje_aprobacion']}")
            print(f"      Total intentos: {evaluacion['total_intentos']}")
            print(f"      Promedio: {evaluacion['promedio_puntaje']:.2f}")
            print(f"      Aprobados: {evaluacion['aprobados']}")
            print(f"      Reprobados: {evaluacion['reprobados']}")
            print()
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def ejemplo_obtener_estadisticas_profesor():
    """Ejemplo: Obtener estadísticas del profesor"""
    print("=== OBTENER ESTADÍSTICAS DEL PROFESOR ===")
    
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}/estadisticas"
    response = requests.get(url)
    
    if response.status_code == 200:
        stats = response.json()
        
        print("📊 ESTADÍSTICAS GENERALES:")
        print()
        
        # Estadísticas de cursos
        cursos = stats['cursos']
        print("🎓 CURSOS:")
        print(f"   Total: {cursos['total_cursos']}")
        print(f"   Activos: {cursos['cursos_activos']}")
        print(f"   Inactivos: {cursos['cursos_inactivos']}")
        print()
        
        # Estadísticas de estudiantes
        estudiantes = stats['estudiantes']
        print("👥 ESTUDIANTES:")
        print(f"   Total: {estudiantes['total_estudiantes']}")
        print(f"   Cursos con estudiantes: {estudiantes['cursos_con_estudiantes']}")
        print(f"   Promedio progreso: {estudiantes['promedio_progreso']:.2f}%")
        print()
        
        # Estadísticas de evaluaciones
        evaluaciones = stats['evaluaciones']
        print("📝 EVALUACIONES:")
        print(f"   Total: {evaluaciones['total_evaluaciones']}")
        print(f"   Promedio puntaje: {evaluaciones['promedio_puntaje_general']:.2f}")
        print(f"   Total intentos: {evaluaciones['total_intentos']}")
        print()
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def ejemplo_obtener_progreso_estudiante():
    """Ejemplo: Obtener progreso detallado de un estudiante"""
    print("=== OBTENER PROGRESO DE UN ESTUDIANTE ===")
    
    estudiante_id = 1  # ID del estudiante de ejemplo
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}/estudiantes/{estudiante_id}/progreso"
    response = requests.get(url)
    
    if response.status_code == 200:
        progreso = response.json()
        print(f"✅ Progreso del estudiante {estudiante_id}:")
        
        # Agrupar por curso
        cursos_progreso = {}
        for item in progreso:
            curso_id = item['ID_Curso']
            if curso_id not in cursos_progreso:
                cursos_progreso[curso_id] = {
                    'nombre': item['Nombre_Curso'],
                    'lecciones': []
                }
            cursos_progreso[curso_id]['lecciones'].append(item)
        
        for curso_id, curso_data in cursos_progreso.items():
            print(f"   📚 {curso_data['nombre']}:")
            
            lecciones_completadas = sum(1 for l in curso_data['lecciones'] if l['Completado'])
            total_lecciones = len(curso_data['lecciones'])
            
            print(f"      Progreso: {lecciones_completadas}/{total_lecciones} lecciones")
            
            # Mostrar algunas lecciones específicas
            for leccion in curso_data['lecciones'][:3]:  # Solo las primeras 3
                estado = "✅" if leccion['Completado'] else "⏳"
                print(f"      {estado} {leccion['Nombre_Leccion']}")
            
            if len(curso_data['lecciones']) > 3:
                print(f"      ... y {len(curso_data['lecciones']) - 3} lecciones más")
            print()
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def ejemplo_actualizar_curso():
    """Ejemplo: Actualizar un curso existente"""
    print("=== ACTUALIZAR CURSO ===")
    
    curso_id = 1  # ID del curso a actualizar
    actualizaciones = {
        "descripcion": "Descripción actualizada del curso",
        "duracion_estimada": 90
    }
    
    url = f"{BASE_URL}/profesor/{PROFESOR_ID}/cursos/{curso_id}"
    response = requests.put(url, json=actualizaciones)
    
    if response.status_code == 200:
        print("✅ Curso actualizado exitosamente")
    else:
        print(f"❌ Error: {response.json()['error']}")
    
    print()

def main():
    """Función principal que ejecuta todos los ejemplos"""
    print("🚀 EJEMPLOS DE USO DEL BACKEND DEL PROFESOR")
    print("=" * 50)
    print()
    
    try:
        # Ejecutar ejemplos
        ejemplo_obtener_info_profesor()
        ejemplo_obtener_cursos_profesor()
        ejemplo_crear_curso()
        ejemplo_obtener_estudiantes_curso()
        ejemplo_crear_evaluacion()
        ejemplo_obtener_evaluaciones_curso()
        ejemplo_obtener_estadisticas_profesor()
        ejemplo_obtener_progreso_estudiante()
        ejemplo_actualizar_curso()
        
        print("✅ Todos los ejemplos se ejecutaron correctamente")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se pudo conectar al servidor")
        print("   Asegúrate de que el servidor Flask esté ejecutándose en http://localhost:5000")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    main() 