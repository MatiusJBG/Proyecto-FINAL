# Sistema de Gestión de Estudiantes - Versión Mejorada con POO

## 🎯 Descripción del Proyecto

Este sistema implementa una plataforma completa de gestión de estudiantes con **programación orientada a objetos**, estructura jerárquica de contenido, CRUD de materiales, búsquedas avanzadas y un árbol binario de decisión para recomendaciones personalizadas.

## 🏗️ Arquitectura del Sistema

### Estructura Jerárquica del Contenido
```
Curso
├── Módulo 1
│   ├── Lección 1
│   │   ├── Recurso 1
│   │   └── Recurso 2
│   └── Lección 2
└── Módulo 2
    └── Lección 3
```

### Clases Principales (POO)

#### 1. **NodoContenido** (Clase Abstracta)
- Clase base para todos los elementos de contenido
- Implementa funcionalidades comunes: agregar/eliminar hijos, búsqueda, rutas
- Métodos abstractos para serialización

#### 2. **Curso** (Hereda de NodoContenido)
- Representa un curso completo
- Gestiona módulos y metadatos del curso
- Mantiene estado y información del profesor

#### 3. **Modulo** (Hereda de NodoContenido)
- Representa un módulo dentro de un curso
- Gestiona lecciones y progreso
- Mantiene orden y duración estimada

#### 4. **Leccion** (Hereda de NodoContenido)
- Representa una lección específica
- Gestiona recursos y contenido
- Controla obligatoriedad y progreso

#### 5. **Recurso**
- Representa materiales de aprendizaje
- Tipos: video, documento, enlace, presentación, imagen
- Metadatos: duración, orden, URL

#### 6. **ArbolDecision**
- Implementa árbol binario de decisión
- Evalúa condiciones y genera recomendaciones
- Nodos con prioridades y tipos

#### 7. **NodoDecision**
- Representa un nodo del árbol de decisión
- Condiciones, acciones y ramificaciones
- Identificación de nodos hoja

#### 8. **GestorContenido**
- Gestiona toda la estructura jerárquica
- Implementa búsquedas y navegación
- Mantiene el árbol de decisión

#### 9. **GestorMateriales**
- CRUD completo de materiales
- Validación y persistencia
- Gestión de metadatos

## 🚀 Funcionalidades Implementadas

### 1. **Estructura Jerárquica del Contenido**
- ✅ Árbol general de cursos, módulos, lecciones y recursos
- ✅ Persistencia en base de datos MySQL
- ✅ Navegación jerárquica completa
- ✅ Métodos de búsqueda y exploración

### 2. **CRUD de Materiales**
- ✅ **Crear**: Subir nuevos materiales con metadatos
- ✅ **Leer**: Obtener materiales por lección/curso
- ✅ **Actualizar**: Modificar nombre, URL, orden
- ✅ **Eliminar**: Remover materiales del sistema
- ✅ Validación de tipos y metadatos

### 3. **Búsquedas en Estructura Jerárquica**
- ✅ Búsqueda global en todos los cursos
- ✅ Búsqueda específica por curso
- ✅ Filtros por tipo de contenido
- ✅ Visualización de rutas y profundidad
- ✅ Resultados con contexto jerárquico

### 4. **Árbol Binario de Decisión**
- ✅ Construcción automática del árbol
- ✅ Evaluación de múltiples criterios:
  - Promedio de puntajes
  - Progreso general
  - Tasa de aprobación
  - Tiempo dedicado
  - Lecciones completadas
- ✅ Generación de recomendaciones personalizadas
- ✅ Visualización del árbol de decisión

## 📊 Endpoints de la API

### Gestión de Materiales (CRUD)
```
POST   /api/materiales/crear
PUT    /api/materiales/{id}
DELETE /api/materiales/{id}
GET    /api/materiales/{id}
GET    /api/lecciones/{id}/materiales
```

### Búsquedas
```
GET    /api/buscar?termino={termino}
GET    /api/cursos/{id}/buscar?termino={termino}
GET    /api/estructura-completa
GET    /api/cursos/{id}/estructura
```

### Árbol de Decisión
```
GET    /api/arbol-decision
POST   /api/estudiante/{id}/recomendacion-avanzada
```

### Gestión de Contenido Jerárquico
```
GET    /api/cursos/{id}/nodo/{nodo_id}
```

## 🎨 Componentes React

### 1. **MaterialManager**
- Interfaz completa para CRUD de materiales
- Selección jerárquica: Curso → Módulo → Lección
- Formularios con validación
- Visualización con iconos por tipo

### 2. **SearchManager**
- Búsqueda en tiempo real
- Filtros por curso específico
- Visualización de estructura completa
- Resultados con contexto y rutas

### 3. **DecisionTreeManager**
- Visualización del árbol de decisión
- Testing con estudiantes reales
- Generación de recomendaciones
- Análisis de datos del estudiante

## 🛠️ Tecnologías Utilizadas

### Backend
- **Python 3.8+**
- **Flask** - Framework web
- **MySQL** - Base de datos
- **Programación Orientada a Objetos** - Arquitectura principal

### Frontend
- **React 18**
- **CSS3** - Estilos modernos y responsivos
- **Fetch API** - Comunicación con backend

### Base de Datos
- **MySQL 8.0+**
- Esquema normalizado
- Relaciones jerárquicas
- Índices optimizados

## 📦 Instalación y Configuración

### 1. **Requisitos Previos**
```bash
# Python 3.8+
python --version

# MySQL 8.0+
mysql --version

# Node.js 16+
node --version
```

### 2. **Configuración de la Base de Datos**
```sql
-- Crear base de datos
CREATE DATABASE sistema_estudiantes;
USE sistema_estudiantes;

-- Ejecutar script de creación
source datos_ejemplo.sql;
```

### 3. **Configuración del Backend**
```bash
cd proyecto-final
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales de MySQL

# Ejecutar backend
python app.py
```

### 4. **Configuración del Frontend**
```bash
cd proyecto-final
npm install

# Ejecutar frontend
npm start
```

## 🎯 Casos de Uso

### Para Administradores
1. **Gestión de Materiales**
   - Crear nuevos recursos de aprendizaje
   - Organizar materiales por lecciones
   - Actualizar metadatos y URLs

2. **Búsqueda y Exploración**
   - Buscar contenido específico
   - Explorar estructura jerárquica
   - Analizar organización del contenido

3. **Árbol de Decisión**
   - Visualizar lógica de recomendaciones
   - Probar con estudiantes reales
   - Analizar efectividad del sistema

### Para Estudiantes
1. **Navegación Jerárquica**
   - Explorar cursos y módulos
   - Acceder a lecciones específicas
   - Descargar recursos de aprendizaje

2. **Recomendaciones Personalizadas**
   - Recibir sugerencias basadas en rendimiento
   - Mejorar progreso académico
   - Optimizar tiempo de estudio

## 🔧 Configuración Avanzada

### Personalización del Árbol de Decisión
```python
# En models.py, método _inicializar_arbol_decision()
# Agregar nuevas condiciones y acciones

nodo_nuevo = NodoDecision(
    id=8,
    condicion='nuevo_criterio < valor',
    accion='Nueva recomendación',
    tipo='nuevo_tipo',
    prioridad='media'
)
```

### Nuevos Tipos de Materiales
```python
# En MaterialManager.js
const tiposMateriales = [
    'documento', 'video', 'enlace', 
    'presentacion', 'imagen', 'nuevo_tipo'
];
```

## 📈 Métricas y Análisis

### Datos Recopilados
- Progreso por estudiante
- Tiempo dedicado por lección
- Puntajes en evaluaciones
- Acceso a recursos
- Efectividad de recomendaciones

### Reportes Disponibles
- Estadísticas generales
- Análisis de rendimiento
- Efectividad del árbol de decisión
- Uso de materiales

## 🔒 Seguridad

### Autenticación
- Login por roles (admin, estudiante, profesor)
- Sesiones seguras
- Validación de permisos

### Validación de Datos
- Sanitización de inputs
- Validación de tipos de archivo
- Control de acceso a recursos

## 🚀 Despliegue

### Producción
```bash
# Configurar servidor web (nginx/apache)
# Configurar WSGI (gunicorn)
# Configurar SSL/TLS
# Configurar backup de base de datos
```

### Docker (Opcional)
```dockerfile
# Dockerfile para containerización
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Desarrollador Principal** - Implementación completa del sistema
- **Contribuidores** - Mejoras y funcionalidades adicionales

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación técnica

---

**¡El sistema está listo para uso en producción con todas las funcionalidades de programación orientada a objetos implementadas!** 🎉 