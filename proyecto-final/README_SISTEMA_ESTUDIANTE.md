# Sistema de Gestión de Estudiantes - Documentación Completa

## Descripción General

Este sistema implementa un LMS (Learning Management System) completo para estudiantes, con funcionalidades de matrícula, progreso de lecciones, evaluaciones, recursos y recomendaciones basadas en árbol de decisión.

## Estructura de la Base de Datos

### Tablas Principales del Estudiante:

1. **Estudiantes** - Información personal del estudiante
2. **Matriculas** - Conexión entre estudiantes y cursos
3. **Progreso_Lecciones** - Seguimiento del progreso en cada lección
4. **Resultados_Evaluaciones** - Resultados de evaluaciones realizadas
5. **Accesos_Recursos** - Registro de acceso a recursos
6. **Historial_Recomendaciones** - Recomendaciones generadas por el sistema

### Tablas Secundarias:
- **Cursos** - Información de cursos disponibles
- **Modulos** - Módulos de cada curso
- **Lecciones** - Lecciones específicas de cada módulo
- **Evaluaciones** - Evaluaciones asociadas a lecciones o módulos
- **Recursos** - Recursos multimedia de cada lección
- **Reglas_Recomendacion** - Árbol de decisión para recomendaciones

## Instalación y Configuración

### 1. Configuración de la Base de Datos

1. **Crear la base de datos:**
   ```sql
   CREATE DATABASE IF NOT EXISTS proyecto;
   USE proyecto;
   ```

2. **Ejecutar el script de creación de tablas** (proporcionado en el mensaje inicial)

3. **Insertar datos de ejemplo:**
   ```bash
   mysql -u tu_usuario -p proyecto < datos_ejemplo.sql
   ```

### 2. Configuración del Backend

1. **Instalar dependencias de Python:**
   ```bash
   cd proyecto-final
   pip install flask flask-cors mysql-connector-python python-dotenv
   ```

2. **Configurar variables de entorno:**
   Crear archivo `.env` en la carpeta `proyecto-final`:
   ```
   DB_HOST=localhost
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_password_mysql
   DB_NAME=proyecto
   ```

3. **Ejecutar el servidor Flask:**
   ```bash
   python app.py
   ```
   El servidor se ejecutará en `http://localhost:5000`

### 3. Configuración del Frontend

1. **Instalar dependencias de Node.js:**
   ```bash
   cd proyecto-final
   npm install
   ```

2. **Ejecutar la aplicación React:**
   ```bash
   npm start
   ```
   La aplicación se ejecutará en `http://localhost:3000`

## Funcionalidades Implementadas

### 1. Dashboard del Estudiante

- **Vista general del progreso** con estadísticas detalladas
- **Cursos matriculados** con progreso individual
- **Recomendaciones personalizadas** basadas en rendimiento
- **Evaluaciones pendientes** con sistema de completado
- **Notificaciones** sobre el estado del aprendizaje

### 2. Sistema de Matrícula

- **Cursos disponibles** para matrícula
- **Proceso de matrícula** simplificado
- **Información detallada** de cada curso (profesor, duración, descripción)

### 3. Gestión de Progreso

- **Seguimiento automático** del progreso en lecciones
- **Actualización en tiempo real** del progreso total del curso
- **Sistema de lecciones secuenciales** (bloqueo hasta completar la anterior)
- **Registro de tiempo dedicado** a cada lección

### 4. Sistema de Evaluaciones

- **Evaluaciones por lección y módulo**
- **Registro de resultados** con puntaje y tiempo
- **Cálculo automático** de aprobación/reprobación
- **Historial de evaluaciones** realizadas

### 5. Recursos de Aprendizaje

- **Múltiples tipos de recursos** (video, documento, enlace, presentación, imagen)
- **Registro de acceso** a recursos
- **Tiempo de visualización** para videos
- **Ordenamiento** de recursos por importancia

### 6. Sistema de Recomendaciones

- **Árbol de decisión** para generar recomendaciones
- **Análisis de rendimiento** del estudiante
- **Recomendaciones personalizadas** basadas en:
  - Puntaje promedio en evaluaciones
  - Progreso general en cursos
  - Tasa de aprobación de evaluaciones
- **Historial de recomendaciones** con seguimiento

## Endpoints del API

### Cursos
- `GET /api/cursos` - Obtener todos los cursos activos
- `GET /api/cursos/disponibles?estudiante_id=X` - Cursos disponibles para matrícula
- `GET /api/estudiante/{id}/cursos` - Cursos matriculados del estudiante
- `POST /api/matricula` - Matricular estudiante en curso

### Módulos y Lecciones
- `GET /api/cursos/{id}/modulos` - Módulos de un curso
- `GET /api/modulos/{id}/lecciones` - Lecciones de un módulo
- `GET /api/estudiante/{id}/progreso-lecciones?curso_id=X` - Progreso en lecciones
- `POST /api/progreso-leccion` - Actualizar progreso de lección

### Evaluaciones
- `GET /api/cursos/{id}/evaluaciones` - Evaluaciones de un curso
- `GET /api/estudiante/{id}/resultados-evaluaciones?curso_id=X` - Resultados del estudiante
- `POST /api/resultado-evaluacion` - Registrar resultado de evaluación

### Recursos
- `GET /api/lecciones/{id}/recursos` - Recursos de una lección
- `POST /api/acceso-recurso` - Registrar acceso a recurso

### Recomendaciones
- `GET /api/estudiante/{id}/recomendaciones` - Historial de recomendaciones
- `POST /api/estudiante/{id}/generar-recomendacion` - Generar nueva recomendación

### Estadísticas
- `GET /api/estudiante/{id}/estadisticas` - Estadísticas generales del estudiante

## Datos de Prueba

### Estudiantes de Ejemplo:
- **Juan Pérez** (ID: 1) - `juan.perez@estudiante.edu` / `est123`
- **María López** (ID: 2) - `maria.lopez@estudiante.edu` / `est456`
- **Carlos García** (ID: 3) - `carlos.garcia@estudiante.edu` / `est789`
- **Ana Torres** (ID: 4) - `ana.torres@estudiante.edu` / `est101`
- **Luis Morales** (ID: 5) - `luis.morales@estudiante.edu` / `est202`

### Cursos de Ejemplo:
1. **Matemáticas Avanzadas** - Dr. María González
2. **Física Cuántica** - Dr. Carlos Rodríguez
3. **Programación Web** - Dra. Ana Martínez
4. **Estructuras de Datos** - Dra. Ana Martínez
5. **Cálculo Diferencial** - Dr. María González
6. **Mecánica Clásica** - Dr. Carlos Rodríguez

## Flujo de Uso Típico

1. **Login del estudiante** con credenciales
2. **Visualización del dashboard** con cursos matriculados
3. **Matrícula en nuevos cursos** si no tiene ninguno
4. **Navegación por módulos y lecciones** del curso seleccionado
5. **Completar lecciones** marcándolas como terminadas
6. **Realizar evaluaciones** y registrar resultados
7. **Recibir recomendaciones** basadas en el rendimiento
8. **Acceder a recursos** de cada lección

## Características Técnicas

### Backend (Flask)
- **API RESTful** con endpoints bien definidos
- **Conexión MySQL** con manejo de errores
- **Triggers automáticos** para cálculos de progreso
- **Sistema de recomendaciones** con árbol de decisión

### Frontend (React)
- **Componentes modulares** y reutilizables
- **Estado global** con React hooks
- **Interfaz responsive** para diferentes dispositivos
- **Actualizaciones en tiempo real** del progreso

### Base de Datos (MySQL)
- **Relaciones complejas** entre tablas
- **Triggers automáticos** para cálculos
- **Índices optimizados** para consultas frecuentes
- **Integridad referencial** con claves foráneas

## Mantenimiento y Escalabilidad

### Consideraciones de Rendimiento:
- **Índices en consultas frecuentes**
- **Paginación en listas grandes**
- **Caché de datos estáticos**
- **Optimización de consultas complejas**

### Seguridad:
- **Validación de datos** en frontend y backend
- **Sanitización de inputs** SQL
- **Manejo de errores** sin exponer información sensible
- **Autenticación** de usuarios

### Escalabilidad:
- **Arquitectura modular** para fácil extensión
- **Separación de responsabilidades** entre componentes
- **API versionada** para futuras actualizaciones
- **Base de datos normalizada** para eficiencia

## Solución de Problemas

### Problemas Comunes:

1. **Error de conexión a la base de datos:**
   - Verificar credenciales en `.env`
   - Asegurar que MySQL esté ejecutándose
   - Verificar que la base de datos `proyecto` exista

2. **CORS errors en el frontend:**
   - Verificar que el servidor Flask esté ejecutándose en puerto 5000
   - Confirmar que CORS esté habilitado en el backend

3. **Datos no se cargan:**
   - Verificar que los datos de ejemplo estén insertados
   - Revisar la consola del navegador para errores
   - Verificar los logs del servidor Flask

### Logs y Debugging:
- **Backend:** Los logs aparecen en la consola donde se ejecuta Flask
- **Frontend:** Usar las herramientas de desarrollador del navegador
- **Base de datos:** Usar `SHOW PROCESSLIST;` para ver consultas activas

## Próximas Mejoras Sugeridas

1. **Sistema de notificaciones push**
2. **Chat en tiempo real** con profesores
3. **Gamificación** con badges y puntos
4. **Analytics avanzados** de aprendizaje
5. **Integración con herramientas externas** (Google Drive, YouTube)
6. **Sistema de foros** para discusiones
7. **Calendario de eventos** y fechas importantes
8. **Exportación de certificados** de finalización

---

**Nota:** Este sistema está diseñado para ser educativo y demostrativo. Para uso en producción, se recomienda implementar medidas de seguridad adicionales, optimizaciones de rendimiento y pruebas exhaustivas. 