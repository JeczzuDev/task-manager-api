# Task Manager API

API REST para gestión de tareas construida con NestJS y PostgreSQL. Incluye filtros dinámicos,
paginación, soft delete, validación estricta de datos y manejo centralizado de errores.

## Tecnologías

- **NestJS 11** — Framework de Node.js con TypeScript
- **TypeORM 0.3** — ORM con migraciones manuales
- **PostgreSQL 16** — Base de datos relacional (via Docker)
- **class-validator / class-transformer** — Validación y transformación de DTOs
- **Joi** — Validación de variables de entorno al iniciar

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) y Docker Compose
- npm (incluido con Node.js)

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd task-manager-api
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` si se necesitan valores diferentes. Los valores por defecto funcionan
   directamente con el `docker-compose.yml` incluido:
   ```
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5433
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=task_manager
   ```

4. **Levantar PostgreSQL con Docker**:
   ```bash
   docker compose up -d
   ```
   Esto crea un contenedor con PostgreSQL 16 Alpine y un volumen persistente `pgdata`.

5. **Ejecutar migraciones**:
   ```bash
   npm run migration:run
   ```
   Crea las tablas necesarias en la base de datos.

6. **Iniciar la aplicación**:
   ```bash
   npm run start:dev
   ```
   El servidor estará disponible en `http://localhost:3000`.

## Endpoints de la API

| Método   | Ruta                | Descripción                       |
|----------|---------------------|-----------------------------------|
| `POST`   | `/tasks`            | Crear una tarea                   |
| `GET`    | `/tasks`            | Listar tareas (filtros + paginación) |
| `GET`    | `/tasks/:id`        | Obtener una tarea por ID          |
| `PATCH`  | `/tasks/:id`        | Actualizar datos de una tarea     |
| `PATCH`  | `/tasks/:id/status` | Actualizar solo el estado         |
| `DELETE` | `/tasks/:id`        | Eliminar una tarea (soft delete)  |

### Ejemplos de uso

**Crear tarea:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi primera tarea", "description": "Descripción opcional"}'
```

**Listar con filtros y paginación:**
```bash
curl "http://localhost:3000/tasks?status=PENDING&priority=HIGH&search=deploy&page=1&limit=10"
```

**Parámetros de filtrado disponibles:**

| Parámetro  | Tipo    | Valores posibles                      | Default |
|------------|---------|---------------------------------------|---------|
| `status`   | string  | `PENDING`, `IN_PROGRESS`, `DONE`      | —       |
| `priority` | string  | `LOW`, `MEDIUM`, `HIGH`               | —       |
| `search`   | string  | Texto libre (busca en título)         | —       |
| `page`     | number  | >= 1                                  | 1       |
| `limit`    | number  | 1-100                                 | 10      |

**Actualizar estado:**
```bash
curl -X PATCH http://localhost:3000/tasks/<uuid>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'
```

## Scripts disponibles

| Script                   | Descripción                                     |
|--------------------------|-------------------------------------------------|
| `npm run start:dev`      | Inicia en modo desarrollo con hot-reload         |
| `npm run start:prod`     | Inicia en modo producción (requiere `npm run build`) |
| `npm run build`          | Compila el proyecto TypeScript                   |
| `npm run migration:generate` | Genera una migración a partir de cambios en entidades |
| `npm run migration:run`  | Ejecuta las migraciones pendientes               |
| `npm run migration:revert` | Revierte la última migración                   |
| `npm test`               | Ejecuta los tests unitarios                      |
| `npm run test:e2e`       | Ejecuta los tests end-to-end                     |
| `npm run test:cov`       | Ejecuta tests con reporte de cobertura           |
| `npm run lint`           | Ejecuta ESLint                                   |
| `npm run format`         | Formatea el código con Prettier                  |

## Estructura del proyecto

```
src/
├── common/
│   └── filters/
│       ├── http-exception.filter.ts    # Filtro para HttpExceptions
│       └── all-exceptions.filter.ts    # Filtro catch-all para errores inesperados
├── config/
│   └── data-source.ts                  # Configuración de TypeORM para migraciones CLI
├── tasks/
│   ├── dto/
│   │   ├── create-task.dto.ts
│   │   ├── update-task.dto.ts
│   │   ├── update-task-status.dto.ts
│   │   ├── filter-tasks.dto.ts
│   │   └── response-tasks.dto.ts
│   ├── enums/
│   │   ├── task-status.enum.ts
│   │   └── task-priority.enum.ts
│   ├── entities/
│   │   └── task.entity.ts              # Entidad con soft delete e índices
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   ├── tasks.repository.ts             # Queries con QueryBuilder
│   └── tasks.module.ts
├── app.module.ts
└── main.ts                             # Bootstrap con ValidationPipe y filtros globales
```

## Decisiones técnicas

- **Soft delete**: Las tareas no se eliminan físicamente, sino que se marca `deletedAt`. Esto
  permite recuperar datos y mantener historial.
- **Repository pattern**: Las queries de base de datos están encapsuladas en `TasksRepository`,
  manteniendo el servicio enfocado en lógica de negocio.
- **Migraciones manuales**: `synchronize: false` en producción. Los cambios de esquema se
  gestionan exclusivamente por migraciones.
- **Validación en capas**: `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted` para
  rechazar propiedades desconocidas. `Joi` para validar variables de entorno al arrancar.
- **Exception filters**: Dos filtros globales separados — uno para `HttpException` y otro
  catch-all para errores inesperados — con un formato de respuesta estandarizado.

## Licencia

MIT

Hecho con ❤️ por [@JecczuDev](https://github.com/JeczzuDev)
