#!/usr/bin/env python3
"""
Script para crear el archivo .env con la configuración correcta
"""

import os

def create_env_file():
    """Crea el archivo .env con configuración por defecto"""
    
    env_content = """# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=proyecto

# Configuración del Servidor
FLASK_ENV=development
FLASK_DEBUG=True
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Archivo .env creado con configuración por defecto")
    print("📋 Configuración:")
    print("   - Host: localhost")
    print("   - Puerto: 3306")
    print("   - Usuario: root")
    print("   - Contraseña: (vacía)")
    print("   - Base de datos: proyecto")
    print("")
    print("🔧 Si necesitas cambiar la configuración:")
    print("   1. Edita el archivo .env manualmente")
    print("   2. O ejecuta este script nuevamente")

if __name__ == "__main__":
    create_env_file() 