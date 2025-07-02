-- Agrega la columna Descripcion a la tabla Lecciones si no existe
ALTER TABLE Lecciones ADD COLUMN Descripcion TEXT AFTER Nombre;
