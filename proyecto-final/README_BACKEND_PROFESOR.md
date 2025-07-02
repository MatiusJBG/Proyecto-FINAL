# Backend del Profesor - Sistema de Gestión de Estudiantes

## Descripción

Este documento describe la implementación del backend específico para el profesor en el sistema de gestión de estudiantes. El backend está construido usando programación orientada a objetos y es completamente modular.

## Arquitectura

### Clases Principales

#### 1. **Profesor**
- Representa un profesor en el sistema
- Contiene información básica: ID, nombre, correo, especialidad
- Mantiene una lista de cursos asociados

#### 2. **Evaluacion**
- Representa una evaluación en el sistema
- Puede estar asociada a una lección o módulo
- Incluye estadísticas automáticas de resultados

#### 3. **ResultadoEvaluacion**
- Representa el resultado de un estudiante en una evaluación
- Incluye puntaje, aprobación, tiempo utilizado

#### 4. **Matricula**
- Representa la matrícula de un estudiante en un curso
- Incluye estado, progreso total y fecha de matrícula

### Gestores (Managers)

#### 1. **GestorProfesor**
- Gestor principal que coordina todas las operaciones del profesor
- Mantiene referencias a profesores, evaluaciones y matrículas

#### 2. **GestorCursosProfesor**
- Maneja la creación, actualización y eliminación de cursos
- Gestiona la relación entre profesores y cursos

#### 3. **GestorEvaluacionesProfesor**
- Maneja la creación y gestión de evaluaciones
- Proporciona estadísticas de evaluaciones

#### 4. **GestorEstudiantesProfesor**
- Gestiona la información de estudiantes matriculados
- Proporciona datos de progreso de estudiantes

## Endpoints del API

### Información del Profesor

#### GET `/api/profesor/{profesor_id}`
Obtiene la información completa de un profesor.

**Respuesta:**
```json
{
  "ID_Profesor": 1,
  "Nombre": "Dr. Juan Pérez",
  "Correo_electronico": "juan.perez@universidad.edu",
  "Especialidad": "Matemáticas",
  "Fecha_registro": "2024-01-15T10:30:00"
}
```

### Gestión de Cursos

#### GET `/api/profesor/{profesor_id}/cursos`
Obtiene todos los cursos de un profesor con estadísticas.

**Respuesta:**
```json
[
  {
    "ID_Curso": 1,
    "Nombre": "Cálculo I",
    "Descripcion": "Introducción al cálculo diferencial",
    "total_modulos": 5,
    "total_lecciones": 20,
    "total_estudiantes": 45
  }
]
```

#### POST `/api/profesor/{profesor_id}/cursos`
Crea un nuevo curso para el profesor.

**Body:**
```json
{
  "nombre": "Nuevo Curso",
  "descripcion": "Descripción del curso",
  "duracion_estimada": 60
}
```

#### PUT `/api/profesor/{profesor_id}/cursos/{curso_id}`
Actualiza un curso existente.

**Body:**
```json
{
  "nombre": "Nombre Actualizado",
  "descripcion": "Nueva descripción",
  "estado": "inactivo"
}
```

### Gestión de Estudiantes

#### GET `/api/profesor/{profesor_id}/cursos/{curso_id}/estudiantes`
Obtiene todos los estudiantes matriculados en un curso.

**Respuesta:**
```json
[
  {
    "ID_Estudiante": 1,
    "Nombre": "María García",
    "Correo_electronico": "maria.garcia@estudiante.edu",
    "Semestre": 3,
    "Estado": "activo",
    "Progreso_total": 75.5,
    "lecciones_completadas": 15,
    "evaluaciones_realizadas": 8,
    "promedio_evaluaciones": 85.2
  }
]
```

#### GET `/api/profesor/{profesor_id}/estudiantes/{estudiante_id}/progreso`
Obtiene el progreso detallado de un estudiante en los cursos del profesor.

### Gestión de Evaluaciones

#### GET `/api/profesor/{profesor_id}/cursos/{curso_id}/evaluaciones`
Obtiene todas las evaluaciones de un curso con estadísticas.

#### POST `/api/profesor/{profesor_id}/evaluaciones`
Crea una nueva evaluación.

**Body:**
```json
{
  "nombre": "Examen Final",
  "descripcion": "Evaluación final del curso",
  "puntaje_aprobacion": 70.0,
  "max_intentos": 3,
  "id_leccion": 10
}
```

#### GET `/api/profesor/{profesor_id}/evaluaciones/{evaluacion_id}/resultados`
Obtiene todos los resultados de una evaluación específica.

### Estadísticas

#### GET `/api/profesor/{profesor_id}/estadisticas`
Obtiene estadísticas generales del profesor.

**Respuesta:**
```json
{
  "cursos": {
    "total_cursos": 5,
    "cursos_activos": 4,
    "cursos_inactivos": 1
  },
  "estudiantes": {
    "total_estudiantes": 120,
    "cursos_con_estudiantes": 4,
    "promedio_progreso": 68.5
  },
  "evaluaciones": {
    "total_evaluaciones": 25,
    "promedio_puntaje_general": 72.3,
    "total_intentos": 450
  }
}
```

## Conexión con la Base de Datos

El backend utiliza las siguientes tablas de la base de datos:

### Tablas Principales
- **Profesores**: Información básica de profesores
- **Cursos**: Cursos creados por profesores
- **Modulos**: Módulos dentro de los cursos
- **Lecciones**: Lecciones dentro de los módulos
- **Evaluaciones**: Evaluaciones asociadas a lecciones o módulos
- **Resultados_Evaluaciones**: Resultados de estudiantes en evaluaciones
- **Matriculas**: Matrículas de estudiantes en cursos
- **Progreso_Lecciones**: Progreso de estudiantes en lecciones

### Relaciones Clave
- Un profesor puede tener múltiples cursos (1:N)
- Un curso puede tener múltiples módulos (1:N)
- Un módulo puede tener múltiples lecciones (1:N)
- Una lección puede tener múltiples evaluaciones (1:N)
- Un estudiante puede estar matriculado en múltiples cursos (N:M)

## Características del Sistema

### 1. **Programación Orientada a Objetos**
- Todas las entidades están representadas como clases
- Encapsulación de datos y comportamiento
- Herencia y polimorfismo donde es apropiado

### 2. **Arquitectura Modular**
- Gestores especializados para cada área funcional
- Separación clara de responsabilidades
- Fácil mantenimiento y extensión

### 3. **Persistencia de Datos**
- Conexión directa con MySQL
- Carga automática de datos al iniciar la aplicación
- Sincronización entre objetos y base de datos

### 4. **Validaciones y Seguridad**
- Verificación de autorización (profesor solo puede acceder a sus cursos)
- Validación de datos de entrada
- Manejo de errores robusto

### 5. **Estadísticas Automáticas**
- Cálculo automático de estadísticas de evaluaciones
- Progreso de estudiantes en tiempo real
- Métricas de rendimiento del curso

## Uso del Sistema

### 1. **Inicialización**
```python
# Los gestores se inicializan automáticamente al cargar la aplicación
gestor_profesor = GestorProfesor()
gestor_cursos_profesor = GestorCursosProfesor(gestor_profesor)
```

### 2. **Crear un Curso**
```python
# Usando el gestor
curso = gestor_cursos_profesor.crear_curso(
    profesor_id=1,
    nombre="Nuevo Curso",
    descripcion="Descripción del curso",
    duracion_estimada=60
)
```

### 3. **Obtener Estadísticas**
```python
# Obtener estadísticas del profesor
stats = gestor_profesor.obtener_estadisticas_profesor(profesor_id=1)
```

## Consideraciones de Implementación

### 1. **Seguridad**
- Todos los endpoints verifican que el profesor tenga autorización
- Validación de datos de entrada en todos los endpoints
- Manejo seguro de conexiones a la base de datos

### 2. **Rendimiento**
- Consultas optimizadas con JOINs apropiados
- Índices en la base de datos para consultas frecuentes
- Carga lazy de datos cuando es necesario

### 3. **Escalabilidad**
- Arquitectura modular permite fácil extensión
- Separación de responsabilidades facilita el mantenimiento
- Patrones de diseño reutilizables

### 4. **Mantenibilidad**
- Código bien documentado
- Estructura clara y consistente
- Manejo de errores centralizado

## Próximos Pasos

1. **Implementar autenticación JWT** para mayor seguridad
2. **Agregar logging** para auditoría de acciones
3. **Implementar caché** para mejorar rendimiento
4. **Agregar tests unitarios** para validar funcionalidad
5. **Implementar notificaciones** para profesores sobre eventos importantes 