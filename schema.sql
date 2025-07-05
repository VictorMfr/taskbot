-- Esquema de base de datos para TaskBot
CREATE DATABASE IF NOT EXISTS taskbot;
USE taskbot;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    prioridad ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
    fecha_limite DATE,
    estado ENUM('pendiente', 'en proceso', 'terminado') NOT NULL DEFAULT 'pendiente',
    tarea_padre_id INT DEFAULT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tarea_padre_id) REFERENCES tareas(id) ON DELETE CASCADE
); 