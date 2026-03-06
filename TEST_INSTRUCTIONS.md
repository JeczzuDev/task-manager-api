# Test Técnico Backend Senior – NestJS

Este test técnico tiene como objetivo evaluar conocimientos avanzados en desarrollo backend
utilizando NestJS. El candidato deberá responder preguntas conceptuales, analizar código,
desarrollar una API práctica y explicar decisiones de arquitectura.
Duración estimada: 3 a 4 horas.

## Instrucciones Generales
1. Crear un repositorio en GitHub para entregar la solución.
2. El repositorio debe contener código fuente, documentación y tests.
3. Incluir archivo README con instrucciones claras para ejecutar el proyecto.
4. Incluir archivo .env.example con variables necesarias.
5. Subir las respuestas teóricas en un archivo llamado [ANSWERS.md](./ANSWERS.md).
6. Subir el análisis de arquitectura en un archivo llamado [ARCHITECTURE.md](./ARCHITECTURE.md).
7. El proyecto debe poder ejecutarse siguiendo las instrucciones del README.

## Estructura esperada del repositorio
1. README.md
2. [ANSWERS.md](./ANSWERS.md) (respuestas teóricas)
3. [ARCHITECTURE.md](./ARCHITECTURE.md) (decisiones técnicas)
4. .env.example
5. Código fuente del proyecto
6. Tests automatizados

## Parte 1 – Preguntas (respuestas en [ANSWERS.md](./ANSWERS.md#parte-1---respuestas-teóricas))
1. Explique la diferencia entre Middleware, Guard, Interceptor y Pipe en NestJS.
2. ¿Cómo implementaría autorización basada en roles?
3. ¿Qué problemas aparecen cuando un backend crece mucho y cómo NestJS ayuda a resolverlos?
4. ¿Cómo manejaría configuración por ambiente (development, staging, production)?
5. ¿Cómo evitaría que dos usuarios compren el último producto disponible al mismo tiempo?

## Parte 2 – Análisis y Debugging (respuestas en [ANSWERS.md](./ANSWERS.md#parte-2---análisis-y-debugging))
1. Identifique al menos 5 problemas de arquitectura o diseño.
2. Explique cómo refactorizaría esta implementación en un proyecto real de NestJS.

### Código a analizar:
```typescript
@Injectable()
export class OrdersService {

  private orders = [];
  create(order) {
    this.orders.push(order);
    return order;
  }
  findAll() {
    return this.orders;
  }
  updateStatus(id, status) {
    const order = this.orders.find(o => o.id === id);
    order.status = status;
    return order;
  }
}
```

## Parte 3 – Ejercicio Práctico
Desarrollar una API de gestión de tareas utilizando NestJS y PostgreSQL. La entidad Task debe
contener los siguientes campos: id, title, description, status (pending | in_progress | done), priority
(low | medium | high), createdAt, updatedAt.
### Endpoints requeridos
1. POST /tasks – Crear tarea
2. GET /tasks – Listar tareas con filtros por status y priority
3. GET /tasks/:id – Obtener tarea por ID
4. PATCH /tasks/:id – Actualizar tarea
5. PATCH /tasks/:id/status – Cambiar estado
6. DELETE /tasks/:id – Eliminar tarea
### Requisitos Técnicos
1. Arquitectura modular de NestJS
2. Controllers y Services separados
3. DTOs con validación usando class-validator
4. Manejo adecuado de errores HTTP
5. Base de datos PostgreSQL usando Prisma o TypeORM
6. Tests utilizando Jest

## Parte 4 – Diseño de Arquitectura
1. ¿Cómo escalaría esta API para soportar 1000 requests por segundo?
2. ¿Qué cambios haría si el sistema creciera a millones de tareas?
3. ¿Cómo implementaría autenticación JWT en este sistema?
4. ¿Cómo manejaría procesamiento asincrónico para tareas pesadas?

## Criterios de Evaluación

| Área | Puntaje |
|------|---------|
| Arquitectura | 20 |
| Dominio de NestJS | 20 |
| Calidad de Código | 15 |
| Testing | 15 |
| Buenas prácticas | 10 |
| Respuestas teóricas | 10 |
| Criterio de arquitectura | 10 |