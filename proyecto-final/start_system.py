#!/usr/bin/env python3
"""
Script de inicio rápido para el Sistema de Gestión de Estudiantes
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def check_dependencies():
    """Verificar que las dependencias estén instaladas"""
    print("🔍 Verificando dependencias...")
    
    # Verificar Python
    if sys.version_info < (3, 7):
        print("❌ Se requiere Python 3.7 o superior")
        return False
    
    # Verificar Node.js
    try:
        subprocess.run(['node', '--version'], check=True, capture_output=True)
        print("✅ Node.js encontrado")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js no encontrado. Por favor instálalo desde https://nodejs.org/")
        return False
    
    # Verificar npm
    try:
        subprocess.run(['npm', '--version'], check=True, capture_output=True)
        print("✅ npm encontrado")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ npm no encontrado")
        return False
    
    return True

def check_env_file():
    """Verificar y crear archivo .env si no existe"""
    env_file = Path('.env')
    if not env_file.exists():
        print("📝 Creando archivo .env...")
        env_content = """DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=proyecto
"""
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Archivo .env creado. Por favor edítalo con tus credenciales de MySQL")
        return False
    return True

def install_python_dependencies():
    """Instalar dependencias de Python"""
    print("📦 Instalando dependencias de Python...")
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', 
                       'flask', 'flask-cors', 'mysql-connector-python', 'python-dotenv'], 
                       check=True)
        print("✅ Dependencias de Python instaladas")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias de Python: {e}")
        return False

def install_node_dependencies():
    """Instalar dependencias de Node.js"""
    print("📦 Instalando dependencias de Node.js...")
    try:
        subprocess.run(['npm', 'install'], check=True)
        print("✅ Dependencias de Node.js instaladas")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias de Node.js: {e}")
        return False

def start_backend():
    """Iniciar el servidor backend"""
    print("🚀 Iniciando servidor backend...")
    try:
        # Iniciar Flask en segundo plano
        process = subprocess.Popen([sys.executable, 'app.py'])
        time.sleep(3)  # Esperar a que Flask se inicie
        return process
    except Exception as e:
        print(f"❌ Error iniciando backend: {e}")
        return None

def start_frontend():
    """Iniciar el servidor frontend"""
    print("🚀 Iniciando servidor frontend...")
    try:
        # Iniciar React en segundo plano
        process = subprocess.Popen(['npm', 'start'])
        time.sleep(5)  # Esperar a que React se inicie
        return process
    except Exception as e:
        print(f"❌ Error iniciando frontend: {e}")
        return None

def main():
    """Función principal"""
    print("🎓 Sistema de Gestión de Estudiantes")
    print("=" * 50)
    
    # Verificar dependencias
    if not check_dependencies():
        print("\n❌ Por favor instala las dependencias faltantes y vuelve a intentar")
        return
    
    # Verificar archivo .env
    if not check_env_file():
        print("\n⚠️  Por favor configura el archivo .env con tus credenciales de MySQL")
        print("   Luego ejecuta este script nuevamente")
        return
    
    # Instalar dependencias si es necesario
    print("\n📦 Verificando dependencias instaladas...")
    
    # Intentar importar Flask para verificar si está instalado
    try:
        import flask
        print("✅ Flask ya está instalado")
    except ImportError:
        print("📦 Flask no encontrado, instalando...")
        if not install_python_dependencies():
            return
    
    # Verificar si node_modules existe
    if not Path('node_modules').exists():
        if not install_node_dependencies():
            return
    else:
        print("✅ Dependencias de Node.js ya están instaladas")
    
    print("\n🚀 Iniciando sistema...")
    
    # Iniciar backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ No se pudo iniciar el backend")
        return
    
    # Iniciar frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ No se pudo iniciar el frontend")
        backend_process.terminate()
        return
    
    print("\n✅ Sistema iniciado correctamente!")
    print("\n📱 Servicios disponibles:")
    print("   • Frontend: http://localhost:3000")
    print("   • Backend API: http://localhost:5000")
    print("   • API Health Check: http://localhost:5000/api/ping")
    
    print("\n👤 Datos de prueba:")
    print("   • Estudiante: juan.perez@estudiante.edu / est123")
    print("   • Profesor: maria.gonzalez@universidad.edu / prof123")
    print("   • Admin: admin@universidad.edu / admin123")
    
    print("\n🌐 Abriendo navegador...")
    time.sleep(2)
    webbrowser.open('http://localhost:3000')
    
    print("\n⏹️  Para detener el sistema, presiona Ctrl+C")
    
    try:
        # Mantener el script ejecutándose
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo sistema...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Sistema detenido")

if __name__ == "__main__":
    main() 