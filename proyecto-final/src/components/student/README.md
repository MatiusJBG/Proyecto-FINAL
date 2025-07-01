# Componentes del Estudiante

Esta carpeta contiene todos los componentes modulares del frontend del estudiante, organizados de manera que cada componente tenga su propio archivo `.js` y `.css`.

## Estructura de Archivos

```
student/
├── index.js                    # Exportaciones centralizadas
├── StudentDashboard.js         # Componente principal del dashboard
├── StudentDashboard.css        # Estilos del dashboard principal
├── Sidebar.js                  # Componente de la barra lateral
├── Sidebar.css                 # Estilos de la barra lateral
├── UserHeader.js               # Header con información del usuario
├── UserHeader.css              # Estilos del header
├── CourseProgress.js           # Componente de progreso del curso
├── CourseProgress.css          # Estilos del progreso
├── CurrentCoursePanel.js       # Panel del curso actual
├── CurrentCoursePanel.css      # Estilos del panel del curso
├── RecommendationCard.js       # Tarjeta de recomendaciones
├── RecommendationCard.css      # Estilos de recomendaciones
├── PendingEvaluations.js       # Lista de evaluaciones pendientes
├── PendingEvaluations.css      # Estilos de evaluaciones
├── NotificationPanel.js        # Panel de notificaciones
├── NotificationPanel.css       # Estilos de notificaciones
└── README.md                   # Este archivo
```

## Componentes

### StudentDashboard
Componente principal que orquesta todos los demás componentes del dashboard del estudiante.

### Sidebar
Barra lateral con navegación y botón de cerrar sesión.

### UserHeader
Header que muestra información del usuario y saludo personalizado.

### CourseProgress
Muestra el progreso general del estudiante en el curso actual.

### CurrentCoursePanel
Panel que muestra información del curso actual y permite continuar donde se quedó.

### RecommendationCard
Tarjeta que muestra recomendaciones personalizadas basadas en el rendimiento.

### PendingEvaluations
Lista de evaluaciones pendientes con acciones para presentarlas o ver retroalimentación.

### NotificationPanel
Panel que muestra notificaciones importantes para el estudiante.

## Uso

Para importar componentes individuales:
```javascript
import { StudentDashboard, CourseProgress } from './components/student';
```

Para importar el dashboard completo:
```javascript
import { StudentDashboard } from './components/student';
```

## Características

- **Modular**: Cada componente es independiente y reutilizable
- **Responsive**: Todos los componentes son responsivos
- **Mantenible**: Estructura clara y separación de responsabilidades
- **Escalable**: Fácil agregar nuevos componentes o modificar existentes 