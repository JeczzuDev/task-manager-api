# Task Manager API

API REST para gestión de tareas construida con NestJS y PostgreSQL. Incluye filtros dinámicos,
paginación, soft delete, validación estricta de datos y manejo centralizado de errores.

## Demo en video

https://github.com/user-attachments/assets/4578bd68-7d2e-4e27-bb49-b3895c622666
> Video con walkthrough completo del proyecto:
> - 0:00 - Instalación y configuración
> - 1:26 - Verificación de endpoints con Postman
> - 3:26 - Ejecución de tests unitarios y end-to-end
> - 4:04 - Explicación de decisiones técnicas y aprendizajes
> - 10:33 - Análisis de arquitectura y conclusión

## Tecnologías

- **NestJS 11** - Framework de Node.js con TypeScript
- **TypeORM 0.3** - ORM con migraciones manuales
- **PostgreSQL 16** - Base de datos relacional (via Docker)
- **class-validator / class-transformer** - Validación y transformación de DTOs
- **Joi** - Validación de variables de entorno al iniciar

## Requisitos previos

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://www.docker.com/) y Docker Compose
- npm (incluido con Node.js)

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/JeczzuDev/task-manager-api.git
   cd task-manager-api
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   cp .env.example .env.test
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

7. **Ejecutar tests**:
   ```bash
   npm test
   npm run test:e2e
   ```
   Asegúrate de que la base de datos de test esté configurada correctamente en `.env.test`.

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

> Importar la colección de Postman incluida en el repositorio para probar todos
> los endpoints de forma interactiva.
> [Postman Collection](./tasks_manager_api.postman_collection.json)

**Crear tarea:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi primera tarea", "description": "Descripción opcional"}'
```
```json
// Respuesta (201 Created)
{
  "id": "a1b2c3d4-...",
  "title": "Mi primera tarea",
  "description": "Descripción opcional",
  "status": "PENDING",
  "priority": "MEDIUM",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Listar con filtros y paginación:**
```bash
curl "http://localhost:3000/tasks?status=PENDING&priority=HIGH&page=1&limit=5"
```
```json
// Respuesta (200 OK)
{
  "data": [
    {
      "id": "a1b2c3d4-...",
      "title": "Mi primera tarea",
      "status": "PENDING",
      "priority": "HIGH",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 5, "total": 1, "totalPages": 1 }
}
```

**Actualizar estado:**
```bash
curl -X PATCH http://localhost:3000/tasks/<uuid>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'
```
```json
// Respuesta (200 OK)
{
  "id": "a1b2c3d4-...",
  "title": "Mi primera tarea",
  "status": "DONE",
  "priority": "MEDIUM",
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

**Parámetros de filtrado disponibles:**

| Parámetro  | Tipo    | Valores posibles                      | Default |
|------------|---------|---------------------------------------|---------|
| `status`   | string  | `PENDING`, `IN_PROGRESS`, `DONE`      | -       |
| `priority` | string  | `LOW`, `MEDIUM`, `HIGH`               | -       |
| `search`   | string  | Texto libre (busca en título)         | -       |
| `page`     | number  | >= 1                                  | 1       |
| `limit`    | number  | 1-100                                 | 10      |

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
- **Exception filters**: Dos filtros globales separados, uno para `HttpException` y otro
  catch-all para errores inesperados con un formato de respuesta estandarizado.

### Aprendizajes durante el desarrollo

Durante la resolución de este test técnico profundicé en varios temas que considero valiosos:

- **Procesamiento asíncrono: colas vs eventos en memoria** Analicé las diferencias entre
  BullMQ (persistencia en Redis, reintentos, progreso) y `@nestjs/event-emitter` (ligero, sin
  garantías de entrega). Refiné mi criterio sobre cuándo usar cada patrón según los requisitos
  de resiliencia.

- **Indexación en PostgreSQL para búsqueda de texto** `ILIKE '%term%'` no puede usar índices
  B-tree. Investigué cómo los índices GIN con `pg_trgm` resuelven esto a escala, una distinción
  clave al diseñar APIs que van a crecer a millones de registros.

- **Testing con PostgreSQL real vs alternativas in-memory** En Node.js/PostgreSQL no existe un
  equivalente a H2 (Java/SpringBoot). Evalué SQLite en memoria, testcontainers y base de datos dedicada;
  opté por PostgreSQL real con `synchronize: true` y DB de test separada para garantizar paridad
  con producción.

- **Diagramas Mermaid en documentación técnica** Integré diagramas de secuencia y flujo
  directamente en Markdown por primera vez. Permite versionar la documentación de arquitectura
  junto al código sin depender de herramientas externas.

## Licencia

MIT

---

<div align="center">

Hecho con ❤️ por [@JecczuDev](https://github.com/JeczzuDev)

[⬆ Volver arriba](#task-manager-api)

</div>
