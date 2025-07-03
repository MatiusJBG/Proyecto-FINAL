# Sistema de Preguntas y Opciones - Documentación

## Descripción

Este sistema permite a los profesores crear preguntas de selección múltiple para las evaluaciones de sus cursos. Las preguntas se almacenan en las tablas `preguntas` y `opciones` de la base de datos.

## Estructura de la Base de Datos

### Tabla `preguntas`
- `id`: Identificador único de la pregunta
- `id_evaluacion`: ID de la evaluación a la que pertenece
- `texto`: Enunciado de la pregunta
- `tipo`: Tipo de pregunta (seleccion_multiple, verdadero_falso, texto_libre)
- `orden`: Orden de la pregunta en la evaluación
- `fecha_creacion`: Fecha de creación

### Tabla `opciones`
- `id`: Identificador único de la opción
- `id_pregunta`: ID de la pregunta a la que pertenece
- `texto`: Texto de la opción
- `es_correcta`: Booleano que indica si es la respuesta correcta
- `orden`: Orden de la opción

### Tabla `respuestas_estudiantes`
- `id`: Identificador único de la respuesta
- `id_estudiante`: ID del estudiante
- `id_pregunta`: ID de la pregunta
- `id_opcion`: ID de la opción seleccionada
- `fecha_respuesta`: Fecha de la respuesta

## Endpoints del Backend

### 1. Crear Pregunta
```
POST /api/evaluaciones/{evaluacion_id}/preguntas
```

**Datos de entrada:**
```json
{
  "Enunciado": "¿Cuál es la capital de Francia?",
  "Tipo": "seleccion_multiple",
  "Opciones": ["Londres", "París", "Madrid", "Roma"],
  "Respuesta_correcta": "París"
}
```

**Respuesta:**
```json
{
  "message": "Pregunta agregada exitosamente",
  "pregunta_id": 1
}
```

### 2. Obtener Preguntas
```
GET /api/evaluaciones/{evaluacion_id}/preguntas
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "texto": "¿Cuál es la capital de Francia?",
    "tipo": "seleccion_multiple",
    "orden": 1,
    "fecha_creacion": "2024-01-15T10:00:00",
    "opciones": [
      {
        "id": 1,
        "texto": "Londres",
        "es_correcta": false,
        "orden": 1
      },
      {
        "id": 2,
        "texto": "París",
        "es_correcta": true,
        "orden": 2
      }
    ]
  }
]
```

### 3. Eliminar Pregunta
```
DELETE /api/preguntas/{pregunta_id}
```

**Respuesta:**
```json
{
  "message": "Pregunta eliminada exitosamente"
}
```

## Componentes del Frontend

### QuestionForm
Componente para crear nuevas preguntas con opciones múltiples.

**Props:**
- `onSave`: Función que se ejecuta cuando se guarda la pregunta

**Funcionalidades:**
- Formulario para el enunciado de la pregunta
- 4 campos para las opciones
- Radio button para seleccionar la respuesta correcta
- Validación de campos obligatorios

### QuestionList
Componente para mostrar las preguntas existentes de una evaluación.

**Props:**
- `evaluationId`: ID de la evaluación
- `onQuestionAdded`: Función opcional para recargar preguntas

**Funcionalidades:**
- Lista todas las preguntas de la evaluación
- Muestra las opciones de cada pregunta
- Resalta la respuesta correcta
- Botón para eliminar preguntas

## Flujo de Uso

1. **Crear Evaluación**: El profesor crea una evaluación para una lección
2. **Agregar Preguntas**: Hace clic en "Agregar pregunta" para la evaluación
3. **Completar Formulario**: Llena el enunciado y las opciones
4. **Seleccionar Correcta**: Marca cuál es la respuesta correcta
5. **Guardar**: La pregunta se guarda en la base de datos
6. **Ver Lista**: Las preguntas aparecen en la lista de la evaluación

## Instalación y Configuración

### 1. Base de Datos
Asegúrate de que las tablas estén creadas en tu base de datos MySQL:

```sql
-- Verificar que las tablas existen
SHOW TABLES LIKE 'preguntas';
SHOW TABLES LIKE 'opciones';
SHOW TABLES LIKE 'respuestas_estudiantes';
```

### 2. Backend
El backend ya incluye los endpoints necesarios. Asegúrate de que esté ejecutándose:

```bash
cd proyecto-final
python app.py
```

### 3. Frontend
El frontend ya incluye los componentes necesarios. Asegúrate de que esté ejecutándose:

```bash
cd proyecto-final
npm start
```

## Pruebas

Puedes usar el script de prueba para verificar que todo funcione correctamente:

```bash
cd proyecto-final
python test_preguntas.py
```

## Notas Importantes

1. **Relaciones**: Las preguntas están vinculadas a evaluaciones específicas
2. **Cascada**: Al eliminar una pregunta, sus opciones se eliminan automáticamente
3. **Orden**: Las preguntas y opciones mantienen un orden específico
4. **Validación**: El frontend valida que todos los campos estén completos
5. **Actualización**: La lista de preguntas se actualiza automáticamente al agregar/eliminar

## Solución de Problemas

### Error: "No se pudo conectar a la base de datos"
- Verifica que MySQL esté ejecutándose
- Revisa la configuración en `db_connect.py`

### Error: "Pregunta no encontrada"
- Verifica que el ID de la pregunta sea correcto
- Asegúrate de que la pregunta no haya sido eliminada

### Error: "El enunciado de la pregunta es obligatorio"
- Completa todos los campos del formulario
- Verifica que no haya espacios en blanco

### Las preguntas no aparecen
- Verifica que el `evaluacion_id` sea correcto
- Revisa la consola del navegador para errores de JavaScript
- Verifica que el backend esté respondiendo correctamente 