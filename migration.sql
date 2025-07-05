-- Migración para agregar tabla de propuestas pendientes
-- Ejecutar este script en la base de datos existente

CREATE TABLE IF NOT EXISTS propuestas_pendientes (
    id VARCHAR(255) PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('create', 'update', 'delete') NOT NULL,
    entidad ENUM('task', 'subtask') NOT NULL,
    datos JSON NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_propuestas_usuario ON propuestas_pendientes(usuario_id);
CREATE INDEX idx_propuestas_fecha ON propuestas_pendientes(fecha_creacion); 