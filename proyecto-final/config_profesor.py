"""
Configuración del Backend del Profesor
=====================================

Este archivo contiene la configuración específica para el backend del profesor,
incluyendo constantes, configuraciones de base de datos y parámetros del sistema.
"""

import os
from datetime import timedelta

# ============================================================================
# CONFIGURACIÓN DE LA BASE DE DATOS
# ============================================================================

# Configuración de conexión a la base de datos
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'proyecto'),
    'charset': 'utf8mb4',
    'autocommit': True,
    'pool_size': 10,
    'pool_recycle': 3600
}

# ============================================================================
# CONFIGURACIÓN DE LA API
# ============================================================================

# Configuración del servidor Flask
FLASK_CONFIG = {
    'host': os.getenv('FLASK_HOST', '0.0.0.0'),
    'port': int(os.getenv('FLASK_PORT', 5000)),
    'debug': os.getenv('FLASK_DEBUG', 'False').lower() == 'true',
    'threaded': True
}

# Configuración CORS
CORS_CONFIG = {
    'origins': ['http://localhost:3000', 'http://127.0.0.1:3000'],
    'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allow_headers': ['Content-Type', 'Authorization']
}

# ============================================================================
# CONFIGURACIÓN ESPECÍFICA DEL PROFESOR
# ============================================================================

# Límites y restricciones
PROFESOR_LIMITS = {
    'max_cursos_por_profesor': 20,
    'max_estudiantes_por_curso': 100,
    'max_evaluaciones_por_curso': 50,
    'max_intentos_evaluacion': 5,
    'min_puntaje_aprobacion': 50.0,
    'max_puntaje_aprobacion': 100.0
}

# Configuración de evaluaciones
EVALUACION_CONFIG = {
    'puntaje_aprobacion_default': 70.0,
    'max_intentos_default': 3,
    'tiempo_limite_default': 60,  # minutos
    'mostrar_resultados_inmediatamente': True
}

# Configuración de progreso
PROGRESO_CONFIG = {
    'tiempo_minimo_leccion': 1,  # minutos
    'tiempo_maximo_leccion': 180,  # minutos
    'porcentaje_completado_por_leccion': 100.0
}

# ============================================================================
# CONFIGURACIÓN DE ESTADÍSTICAS
# ============================================================================

# Parámetros para cálculo de estadísticas
STATS_CONFIG = {
    'periodo_analisis_dias': 30,
    'min_estudiantes_para_estadisticas': 3,
    'intervalo_actualizacion_stats': 300,  # segundos
    'cache_estadisticas': True,
    'tiempo_cache_estadisticas': 600  # segundos
}

# Umbrales para alertas
ALERTAS_CONFIG = {
    'bajo_progreso_umbral': 30.0,  # porcentaje
    'bajo_rendimiento_umbral': 60.0,  # puntaje
    'alta_desercion_umbral': 20.0,  # porcentaje de estudiantes inactivos
    'tiempo_inactividad_alertas': 7  # días
}

# ============================================================================
# CONFIGURACIÓN DE SEGURIDAD
# ============================================================================

# Configuración de autenticación
AUTH_CONFIG = {
    'jwt_secret_key': os.getenv('JWT_SECRET_KEY', 'tu_clave_secreta_aqui'),
    'jwt_expiration': timedelta(hours=24),
    'password_min_length': 8,
    'password_require_special_chars': True,
    'max_login_attempts': 5,
    'lockout_duration': timedelta(minutes=30)
}

# Configuración de validación
VALIDATION_CONFIG = {
    'max_nombre_length': 100,
    'max_descripcion_length': 1000,
    'max_correo_length': 100,
    'allowed_file_types': ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mov'],
    'max_file_size_mb': 50
}

# ============================================================================
# CONFIGURACIÓN DE LOGGING
# ============================================================================

# Configuración de logs
LOGGING_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': 'logs/profesor_backend.log',
    'max_file_size_mb': 10,
    'backup_count': 5
}

# Eventos importantes para logging
LOG_EVENTS = {
    'curso_creado': True,
    'curso_actualizado': True,
    'evaluacion_creada': True,
    'estudiante_matriculado': True,
    'progreso_actualizado': False,  # Muy frecuente, solo en debug
    'error_database': True,
    'error_validation': True
}

# ============================================================================
# CONFIGURACIÓN DE CACHE
# ============================================================================

# Configuración de caché
CACHE_CONFIG = {
    'enabled': True,
    'type': 'memory',  # 'memory', 'redis', 'file'
    'default_timeout': 300,  # segundos
    'key_prefix': 'profesor_'
}

# Configuración específica de caché por tipo de dato
CACHE_TIMEOUTS = {
    'cursos_profesor': 600,  # 10 minutos
    'estudiantes_curso': 300,  # 5 minutos
    'evaluaciones_curso': 600,  # 10 minutos
    'estadisticas_profesor': 900,  # 15 minutos
    'progreso_estudiante': 180,  # 3 minutos
    'resultados_evaluacion': 300  # 5 minutos
}

# ============================================================================
# CONFIGURACIÓN DE NOTIFICACIONES
# ============================================================================

# Configuración de notificaciones
NOTIFICATION_CONFIG = {
    'enabled': True,
    'email_enabled': False,  # Requiere configuración de SMTP
    'in_app_enabled': True,
    'push_enabled': False  # Requiere configuración de push notifications
}

# Tipos de notificaciones
NOTIFICATION_TYPES = {
    'nuevo_estudiante': True,
    'evaluacion_completada': True,
    'bajo_progreso': True,
    'curso_actualizado': False,
    'sistema_maintenance': True
}

# ============================================================================
# CONFIGURACIÓN DE DESARROLLO
# ============================================================================

# Configuración para desarrollo
DEV_CONFIG = {
    'auto_reload': True,
    'detailed_errors': True,
    'profiling_enabled': False,
    'mock_data_enabled': False,
    'test_mode': False
}

# Datos de prueba (solo para desarrollo)
MOCK_DATA = {
    'profesores_ejemplo': [
        {
            'id': 1,
            'nombre': 'Dr. Juan Pérez',
            'correo': 'juan.perez@universidad.edu',
            'especialidad': 'Matemáticas'
        },
        {
            'id': 2,
            'nombre': 'Dra. María García',
            'correo': 'maria.garcia@universidad.edu',
            'especialidad': 'Física'
        }
    ],
    'cursos_ejemplo': [
        {
            'id': 1,
            'nombre': 'Cálculo I',
            'descripcion': 'Introducción al cálculo diferencial',
            'duracion_estimada': 60
        },
        {
            'id': 2,
            'nombre': 'Programación Básica',
            'descripcion': 'Fundamentos de programación',
            'duracion_estimada': 80
        }
    ]
}

# ============================================================================
# FUNCIONES DE CONFIGURACIÓN
# ============================================================================

def get_database_url():
    """Obtiene la URL de conexión a la base de datos"""
    return f"mysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}/{DB_CONFIG['database']}"

def is_development():
    """Verifica si estamos en modo desarrollo"""
    return DEV_CONFIG['test_mode'] or os.getenv('FLASK_ENV') == 'development'

def is_production():
    """Verifica si estamos en modo producción"""
    return os.getenv('FLASK_ENV') == 'production'

def get_cache_timeout(cache_type):
    """Obtiene el tiempo de expiración para un tipo de caché específico"""
    return CACHE_TIMEOUTS.get(cache_type, CACHE_CONFIG['default_timeout'])

def validate_profesor_limits(limit_type, value):
    """Valida si un valor está dentro de los límites permitidos"""
    limits = PROFESOR_LIMITS.get(limit_type)
    if limits is None:
        return True
    
    if isinstance(limits, (int, float)):
        return value <= limits
    elif isinstance(limits, dict):
        min_val = limits.get('min', float('-inf'))
        max_val = limits.get('max', float('inf'))
        return min_val <= value <= max_val
    
    return True

# ============================================================================
# CONFIGURACIÓN DE ENDPOINTS
# ============================================================================

# Endpoints disponibles para el profesor
PROFESOR_ENDPOINTS = {
    'info_profesor': '/api/profesor/{profesor_id}',
    'cursos_profesor': '/api/profesor/{profesor_id}/cursos',
    'crear_curso': '/api/profesor/{profesor_id}/cursos',
    'actualizar_curso': '/api/profesor/{profesor_id}/cursos/{curso_id}',
    'estudiantes_curso': '/api/profesor/{profesor_id}/cursos/{curso_id}/estudiantes',
    'evaluaciones_curso': '/api/profesor/{profesor_id}/cursos/{curso_id}/evaluaciones',
    'crear_evaluacion': '/api/profesor/{profesor_id}/evaluaciones',
    'resultados_evaluacion': '/api/profesor/{profesor_id}/evaluaciones/{evaluacion_id}/resultados',
    'estadisticas_profesor': '/api/profesor/{profesor_id}/estadisticas',
    'progreso_estudiante': '/api/profesor/{profesor_id}/estudiantes/{estudiante_id}/progreso'
}

# Métodos HTTP permitidos por endpoint
ENDPOINT_METHODS = {
    'info_profesor': ['GET'],
    'cursos_profesor': ['GET'],
    'crear_curso': ['POST'],
    'actualizar_curso': ['PUT'],
    'estudiantes_curso': ['GET'],
    'evaluaciones_curso': ['GET'],
    'crear_evaluacion': ['POST'],
    'resultados_evaluacion': ['GET'],
    'estadisticas_profesor': ['GET'],
    'progreso_estudiante': ['GET']
} 