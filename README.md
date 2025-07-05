# TaskBot - Sistema de Gestión de Tareas con IA

TaskBot es una aplicación web moderna para la gestión de tareas y subtareas, impulsada por inteligencia artificial. Permite a los usuarios crear, organizar y gestionar sus tareas de manera eficiente, con la ayuda de un asistente de IA que puede proponer cambios y mejoras.

## 🚀 Características Principales

### Gestión de Tareas
- ✅ Crear, editar y eliminar tareas
- ✅ Sistema de subtareas jerárquico
- ✅ Prioridades (alta, media, baja)
- ✅ Estados (pendiente, en proceso, terminado)
- ✅ Fechas límite
- ✅ Búsqueda y filtros

### Asistente de IA
- 🤖 Chat integrado con phi3:mini
- 🎯 Propuestas inteligentes de cambios
- ✅ Sistema de aprobación de propuestas
- 🔄 Actualización automática de la tabla
- 💬 Conversación natural en español

### Sistema de Propuestas
- 📝 Detección automática de intenciones de cambio
- ✅ Botones de aprobación/rechazo en el chat
- 💾 Persistencia de propuestas en base de datos
- 🔒 Control total del usuario sobre los cambios
- ⚡ Actualización en tiempo real

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Material-UI (MUI)
- **IA**: Ollama con phi3:mini
- **Base de Datos**: MySQL
- **Autenticación**: JWT
- **Estilos**: CSS Modules, Emotion

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- Ollama con phi3:mini

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd proyecto_direccion
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE taskbot;
USE taskbot;

# Ejecutar schema inicial
mysql -u root -p taskbot < schema.sql

# Ejecutar migración de propuestas
mysql -u root -p taskbot < migration.sql
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
DATABASE_URL=mysql://usuario:password@localhost:3306/taskbot
JWT_SECRET=tu_jwt_secret_aqui
```

5. **Iniciar Ollama**
```bash
# Instalar phi3:mini
ollama pull phi3:mini

# Iniciar servidor
ollama serve
```

6. **Ejecutar la aplicación**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🎯 Uso del Sistema

### Gestión Básica de Tareas
1. **Crear tarea**: Usar el botón "Nueva tarea" o pedirle a la IA
2. **Editar tarea**: Hacer clic en el ícono de editar
3. **Eliminar tarea**: Hacer clic en el ícono de eliminar
4. **Crear subtarea**: Hacer clic en el ícono "+" de una tarea

### Uso del Asistente de IA
1. **Chat**: Escribir en el panel de chat del sidebar
2. **Propuestas**: La IA detectará automáticamente cuando quieras hacer cambios
3. **Aprobar cambios**: Usar los botones "Aprobar" o "Rechazar" que aparecen

### Ejemplos de Comandos para la IA
```
"Crea una tarea llamada 'Revisar documentación' con prioridad alta"
"Cambia la prioridad de la tarea 5 a alta"
"Elimina la tarea número 3"
"Crea una subtarea para la tarea 1 llamada 'Revisar ortografía'"
```

## 📁 Estructura del Proyecto

```
proyecto_direccion/
├── app/                    # App Router de Next.js
│   ├── api/               # Endpoints de API
│   │   ├── auth/          # Autenticación
│   │   ├── ollama/        # Integración con IA
│   │   └── tasks/         # Gestión de tareas
│   ├── dashboard/         # Panel principal
│   ├── login/             # Página de login
│   └── register/          # Página de registro
├── components/            # Componentes React
│   ├── dashboard/         # Componentes del dashboard
│   └── LandingPage/       # Componentes de la landing
├── contexts/              # Contextos de React
├── hooks/                 # Hooks personalizados
├── utils/                 # Utilidades
├── docs/                  # Documentación
└── public/                # Archivos estáticos
```

## 🔧 Configuración Avanzada

### Personalización del Prompt de IA
Editar `app/api/ollama/phi3-chat/route.ts` para modificar las instrucciones que recibe la IA.

### Configuración de Base de Datos
- Modificar `db.ts` para cambiar la configuración de conexión
- Ejecutar scripts SQL adicionales según sea necesario

### Estilos y Temas
- Personalizar el tema en `app/theme.ts`
- Modificar componentes en `components/`

## 📚 Documentación

- [Sistema de Propuestas](./docs/PROPOSALS_SYSTEM.md) - Documentación completa del sistema de propuestas de IA
- [Manejo de Errores](./docs/ERROR_HANDLING.md) - Sistema de manejo de errores del chatbot
- [Schema de Base de Datos](./schema.sql) - Estructura de la base de datos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisar la [documentación](./docs/)
2. Verificar los [issues existentes](../../issues)
3. Crear un nuevo issue con detalles del problema

## 🚀 Roadmap

- [ ] Propuestas en lote
- [ ] Historial de propuestas
- [ ] Notificaciones push
- [ ] Integración con calendario
- [ ] Exportación de tareas
- [ ] Templates de tareas
- [ ] Colaboración en tiempo real
