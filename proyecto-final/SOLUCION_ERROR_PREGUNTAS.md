# Solución al Error "No se pudo guardar la pregunta"

## 🔍 Diagnóstico del Problema

El error "No se pudo guardar la pregunta" puede ocurrir por varias razones. Sigue estos pasos para identificar y solucionar el problema:

## 📋 Pasos para Solucionar

### 1. Verificar que las Tablas Existen

Primero, ejecuta el script de diagnóstico para verificar el estado de las tablas:

```bash
cd proyecto-final
python test_tablas.py
```

### 2. Si las Tablas No Existen

Si el diagnóstico muestra que las tablas no existen, ejecuta el script SQL:

```bash
# Conectar a MySQL
mysql -u tu_usuario -p proyecto < crear_tablas_preguntas.sql
```

O ejecuta manualmente en MySQL:

```sql
USE proyecto;

-- Crear tabla preguntas
CREATE TABLE IF NOT EXISTS preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_evaluacion INT NOT NULL,
    texto VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'seleccion_multiple',
    orden INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_evaluacion) REFERENCES evaluaciones(ID_Evaluacion) ON DELETE CASCADE
);

-- Crear tabla opciones
CREATE TABLE IF NOT EXISTS opciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pregunta INT NOT NULL,
    texto VARCHAR(300) NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT 0,
    orden INT DEFAULT 1,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas(id) ON DELETE CASCADE
);
```

### 3. Verificar que Hay Evaluaciones

Asegúrate de que existe al menos una evaluación en la base de datos:

```sql
SELECT * FROM evaluaciones LIMIT 5;
```

Si no hay evaluaciones, crea una:

```sql
INSERT INTO evaluaciones (ID_Leccion, Nombre, Descripcion, Puntaje_aprobacion, Max_intentos) 
VALUES (1, 'Evaluación de Prueba', 'Evaluación para probar preguntas', 70.0, 3);
```

### 4. Reiniciar el Backend

Después de crear las tablas, reinicia el servidor backend:

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar
python app.py
```

### 5. Probar la Funcionalidad

Ejecuta el script de prueba para verificar que todo funciona:

```bash
python test_tablas.py
```

## 🐛 Posibles Errores y Soluciones

### Error: "Table 'preguntas' doesn't exist"
**Solución**: Ejecuta el script `crear_tablas_preguntas.sql`

### Error: "Foreign key constraint fails"
**Solución**: Verifica que la evaluación existe en la tabla `evaluaciones`

### Error: "Connection refused"
**Solución**: Asegúrate de que el backend esté ejecutándose en `http://localhost:5000`

### Error: "MySQL server has gone away"
**Solución**: Reinicia el servidor MySQL y el backend

## 🔧 Verificación Manual

### 1. Verificar Conexión a la Base de Datos
```bash
mysql -u tu_usuario -p proyecto
```

### 2. Verificar Estructura de Tablas
```sql
DESCRIBE preguntas;
DESCRIBE opciones;
DESCRIBE evaluaciones;
```

### 3. Verificar Datos
```sql
SELECT COUNT(*) FROM evaluaciones;
SELECT COUNT(*) FROM preguntas;
SELECT COUNT(*) FROM opciones;
```

## 📝 Logs de Debug

El backend ahora incluye logs de debug. Revisa la consola del servidor para ver mensajes como:

```
DEBUG: Recibidos datos - Enunciado: ¿Cuál es la capital de Francia?, Tipo: seleccion_multiple, Opciones: ['Londres', 'París', 'Madrid', 'Roma']
DEBUG: Siguiente orden: 1
DEBUG: Pregunta creada con ID: 1
DEBUG: Opción 1 creada: Londres (correcta: False)
DEBUG: Opción 2 creada: París (correcta: True)
DEBUG: Transacción completada exitosamente
```

Si ves errores, compártelos para diagnóstico adicional.

## ✅ Verificación Final

Una vez solucionado, deberías poder:

1. ✅ Crear evaluaciones en lecciones
2. ✅ Hacer clic en "Agregar pregunta"
3. ✅ Completar el formulario de pregunta
4. ✅ Guardar la pregunta exitosamente
5. ✅ Ver la pregunta en la lista

## 🆘 Si el Problema Persiste

Si después de seguir estos pasos el problema persiste:

1. **Revisa los logs del backend** para errores específicos
2. **Verifica la consola del navegador** (F12) para errores de JavaScript
3. **Comprueba la conexión a la base de datos** en `db_connect.py`
4. **Verifica que las credenciales de MySQL** sean correctas

## 📞 Contacto

Si necesitas ayuda adicional, proporciona:
- El resultado del script `test_tablas.py`
- Los logs de error del backend
- Los errores de la consola del navegador 