# Parte 1 - Respuestas Teóricas

## 1. Explique la diferencia entre Middleware, Guard, Interceptor y Pipe en NestJS.
  - Todos esos conceptos forman parte del ciclo de una petición antes de llegar al controlador en NestJS, se diferencian por su función y el momento en el que se ejecutan:
    - Middleware: Se ejecuta antes de los guards, se encarga de la lógica o evaluaciones como logging, autenticación o modificación de la petición.
    En comparación a los demás conceptos es el más similar al ciclo de una petición en ExpressJS, opera directamente sobre `req` y `res`. Además, no tiene acceso al `ExecutionContext` de NestJS.
    - Guard: Después del middleware, valida la autorización o autenticación para controlar el acceso a rutas específicas según roles o permisos. Debe retornar directamente un booleano o un Observable/Promise que resuelva a un booleano. En NestJS se implementa la interfaz `CanActivate`, si se retorna `false` se bloquea el acceso a la ruta o controlador y NestJS lanza automaticamente un `ForbiddenException`.
    - Interceptor: Después del guard, se utiliza para transformar la respuesta o manejar errores de manera centralizada. Esta presente en el ciclo de la petición tanto antes como después de que llegue al controlador. En NestJS implmenta la interfaz `NestInterceptor` y usa RxJS Observables, lo que permite medir tiempos de respuesta, manejar excepciones o transformar la respuesta antes de que llegue al cliente.
    - Pipe: Se ejecuta justo antes de que los datos lleguen al controlador, se encarga de validar y transformar los datos a un formato adecuado. En el contexto de NestJS se implementan usando la interfaz `PipeTransform` junto con `ValidationPipe` o pipes personalizados.
    - Diagrama de request lifecyle en NestJS:
    ```
    Request -> Middleware -> Guard -> Interceptor (pre-controller) -> Pipe -> Controller -> Interceptor (post-controller) -> Response
    ```

## 2. ¿Cómo implementaría autorización basada en roles?
  - Primero se deben definir los roles y permisos en la aplicación, generalmente en un Enum. Luego, se crea un decorador personalizado, como puede ser `@Roles()`, que usa `SetMetadata` para asociar los roles requeridos a cada endpoint o controlador. Es importante crear un `RolesGuard` que implemente la interfaz `CanActivate` y use el servicio `Reflector` para leer la metadata durante la ejecución, el guard extrae el usuario del request, el cual fue adjuntado por el `AuthGuard` previamente, y lo compara con los roles permitidos para esa ruta. Si el usuario no esta autenticado se retorna el error 401 `UnauthorizedException`, y si no tiene el rol adecuado se retorna error 403 `ForbiddenException`. Ambos guards pueden registrarse globalmente usando `APP_GUARD` para evitar repetir `@UseGuards` en cada controlador. También es posible utilizar `@Public` para marcar rutas que no requieran autenticación o autorización.

## 3. ¿Qué problemas aparecen cuando un backend crece mucho y cómo NestJS ayuda a
resolverlos?
  - Cuando el código del backend crece mucho, pueden aparecer problemas como:
    - Dificultad para mantener el código debido a la falta de organización y modularidad.
    - Acoplamiento entre módulos cuando los servicios dependen directamente unos de otros, lo que dificulta la reutilización y el mantenimiento.
    - Duplicación de lógica al no tener una estructura clara que permita compartir código entre diferentes partes de la aplicación.
    - Dificultad para escalar la aplicación y hacer tests de forma aislada.
  NestJS ayuda a resolver estos problemas con un sistema de inyección de dependencias, que permite desacoplar servicios y facilitar el testing con mocks. Su arquitectura de `feature modules` organiza el código por dominio, donde cada módulo controla lo que expone y consume mediante `èxports` e `ìmports`, y cuando el monolito no es suficiente, facilita la transición a microservicios utilizando `@nextjs/microservices`. Además, NestJS utiliza TypeScript, lo que facilita la detección de errores en tiempo de compilación y mejora la mantenibilidad del código.

## 4. ¿Cómo manejaría configuración por ambiente (development, staging, production)?
  - NestJS permite manejar la configuración por ambiente utilizando el módulo `ConfigModule` de `@nestjs/config`. Se pueden definir archivos de configuración específicos para cada ambiente (por ejemplo, `.env.development`, `.env.staging`, `.env.production`) y cargar el archivo correspondiente según la variable `NODE_ENV` que indica el entorno en el que se esté ejecutando la aplicación. Para acceder a estas variables de forma centralizada se usa `ConfigService`, evitando acceder a `process.env`directamente en los servicios. Es útil validar la configuración usando un schema de Joi o class-validator, de modo que la aplicación falle rapidamente en vez de fallar en tiempo de ejecución si es que falta alguna variable. Además, se pueden utilizar variables de entorno para almacenar información sensible como claves de API o credenciales de base de datos, lo que mejora la seguridad y facilita la gestión de la configuración en diferentes entornos.

## 5. ¿Cómo evitaría que dos usuarios compren el último producto disponible al mismo tiempo?
 - Para evitar que dos usuarios compren el último producto disponible al mismo tiempo, se pueden implementar mecanismos de concurrencia y bloqueo en la base de datos. Una opción es el `bloqueo pesimista`, usando `SELECT ... FOR UPDATE` dentro de una transacción, esto implica bloquear el registro del producto mientras se verifica el stock y se realiza la compra. En TypeORM se puede lograr usando `Datasource.transaction()` o un `QueryRunner`.Otra opción es el `bloqueo optimista`, donde se utiliza un campo `version` en la entidad, entonces al momento de actualizar el stock se verifica que la versión no haya cambiado, y si otro usuario ya la modificó la operación falla y se puede reintentar. También se puede utilizar de forma complementaria un sistema de colas como `@nestjs/bullmq` para procesar las compras de manera secuencial, asegurando que solo una compra se procese a la vez para ese producto específico. Además, se pueden implementar validaciones adicionales en el backend para verificar la disponibilidad del producto antes de completar la compra y retornar un error si el producto ya no está disponible.

---

# Parte 2 - Análisis y Debugging
## 1. Identifique al menos 5 problemas de arquitectura o diseño.
  - No hay persistencia de datos, el servicio `OrderService` almacena las órdenes en un array en memoria, lo que significa que se perderán al reiniciar la aplicación, los datos no son compartidos si se corren múltiples instancias, y no se puede implementar una búsqueda eficiente con paginación o relaciones entre entidades.
  - Ningún parametro tiene tipo definido, no hay tipado. TypeSctipt infiere como `any`, por lo que no hay autocompletado ni detección de errores en el IDE. Tampoco hay validación, por lo que un usuario podría enviar cualquier tipo de dato y el servicio no lo detectaría.
  - No hay manejo de errores. Si el `id`no existe, `find()` retorna `undefined` y al asignar `status` saltaría un `TypeError` en tiempo de ejecución y un error 500 genérico al cliente.
  - No hay Controller. En un proyecto real de NestJS debe haber separación de capas, el servicio no debería manejar directamente las rutas ni la lógica de negocio relacionada con la petición.
  - Status sin restricción, no hay un enum o validación que limite los posibles valores de `status`, lo que puede llevar a inconsistencias en los datos.
  - Mutación directa del array y del objeto, lo que puede generar efectos secundarios dificiles de rastrear e imposibilidad de auditar cambios.

## 2. Explique cómo refactorizaría esta implementación en un proyecto real de NestJS.
  - Implementaría patrón Repository para acceder a una base de datos a través de un ORM como TypeORM o Prisma. Crearía una entidad `Order` con campos como `id`, `status`, `createdAt`, etc. y un repositorio que encapsule las queries. En el servicio inyectaría el repositorio en lugar de manejar los datos directamente.
  - Definiría DTOs para las operaciones de creación y actualización de órdenes, con validación usando decoradores de `class-validator` para definir exactamente qué datos se esperan y sus restricciones. Un DTO podría ser `CreateOrderDto` con `@IsString()`, `@IsNotEmpty()`, `@IsEnum()`, etc.
  - Implementaría validaciones para manejar errores de forma adecuada, por ejemplo, lanzando un `NotFoundException` si el `id` no existe en `updateStatus`, o un `BadRequestException` si el `status` no es válido.
  - Crearía un `OrdersController` usando decoradores (`@Controller('orders')`, `@Post()`, `@Get()`, etc.) que recibe DTOs validados y delega la lógica al servicio. Crearía también un `OrdersModule` que declara el controlador en `controllers` y el servicio en `providers`, apegandome a la arquitectura de feature modules de NestJS.
  - Definiría un enum `OrderStatus` con los valores permitidos. El DTO de actualización utilizaría `@IsEnum(OrderStatus)` para validar el valor recibido. Quizas también implementaría la lógica de `maquina de estados` en el servicio para validar que las transiciones sean coherentes.

## Código a analizar:
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

## Código refactorizado:
```typescript
// order-status.enum.ts
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// order.entity.ts
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  product: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// dto/create-order.dto.ts
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

// dto/update-order-status.dto.ts
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

// orders.service.ts
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create(dto);
    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    return this.ordersRepository.save(order);
  }
}

// orders.controller.ts
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }

  @Get()
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, dto);
  }
}

// orders.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```