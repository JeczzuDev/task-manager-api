# Parte 1 – Respuestas Teóricas

1. Explique la diferencia entre Middleware, Guard, Interceptor y Pipe en NestJS.
  - Todos esos conceptos forman parte del ciclo de una petición antes de llegar al controlador en NestJS, se diferencian por su función y el momento en el que se ejecutan:
    - Middleware: Se ejecuta antes de los guards, se encarga de la lógica o evaluaciones como logging, autenticación o modificación de la petición.
    En comparación a los demás conceptos es el más similar al ciclo de una petición en Express, opera directamente sobre `req` y `res`. Además, no tiene acceso al ExecutionContext de NestJS.
    - Guard: Después del middleware, valida la autorización o autenticación para controlar el acceso a rutas específicas según roles o permisos.
    - Interceptor: Después del guard, se utiliza para transformar la respuesta o manejar errores de manera centralizada. Esta presente en el ciclo de la petición
    tanto antes como después de que llegue al controlador.
    - Pipe: Se ejecuta justo antes de que los datos lleguen al controlador, se encarga de validar y transformar los datos a un formato adecuado.
2. ¿Cómo implementaría autorización basada en roles?
  - Primero se deben definir los roles y permisos en la aplicación, en la base de datos o en un archivo de configuración. Luego, se crea un guard custom que verifica el rol del usuario antes de permitir el acceso a ciertas rutas o controladores. Este guard se encarga de extraer el rol del usuario desde el token de autenticación o la sesión y lo compara con los roles permitidos para esa ruta. Si el usuario tiene el rol adecuado, se permite el acceso o de lo contrario, se retorna error 403 de autorización. Para asignar roles a las rutas o controladores especificos, se pueden utilizar decoradores personalizados que indiquen qué roles son necesarios para acceder.
3. ¿Qué problemas aparecen cuando un backend crece mucho y cómo NestJS ayuda a
resolverlos?
  - Cuando un backend crece mucho, pueden aparecer problemas como:
    - Dificultad para mantener el código debido a la falta de organización y modularidad.
    - Problemas de rendimiento debido a la falta de optimización en las consultas a la base de datos o en la gestión de recursos.
    - Dificultad para escalar la aplicación debido a la falta de una arquitectura clara y bien definida.
  NestJS ayuda a resolver estos problemas al proporcionar una estructura modular y organizada basada en módulos, controladores y servicios. Además, NestJS utiliza TypeScript, lo que facilita la detección de errores en tiempo de compilación y mejora la mantenibilidad del código. También ofrece herramientas integradas para manejar la configuración, la validación de datos y la gestión de dependencias, lo que contribuye a mejorar el rendimiento y la escalabilidad de la aplicación.
4. ¿Cómo manejaría configuración por ambiente (development, staging, production)?
  - NestJS permite manejar la configuración por ambiente utilizando el módulo `ConfigModule`. Se pueden definir archivos de configuración específicos para cada ambiente (por ejemplo, `.env.development`, `.env.staging`, `.env.production`) y cargar el archivo correspondiente según el entorno en el que se esté ejecutando la aplicación. Esto permite tener configuraciones diferentes para cada ambiente sin modificar el código. Además, se pueden utilizar variables de entorno para almacenar información sensible como claves de API o credenciales de base de datos, lo que mejora la seguridad y facilita la gestión de la configuración en diferentes entornos.
5. ¿Cómo evitaría que dos usuarios compren el último producto disponible al mismo tiempo?
 - Para evitar que dos usuarios compren el último producto disponible al mismo tiempo, se pueden implementar mecanismos de concurrencia y bloqueo en la base de datos. Una opción es utilizar transacciones para asegurar que la operación de compra se realice de manera atómica. Esto implica bloquear el registro del producto mientras se verifica su disponibilidad y se realiza la compra, evitando que otro usuario pueda acceder a ese registro hasta que la transacción se complete. Otra opción es utilizar un sistema de colas para procesar las compras de manera secuencial, asegurando que solo una compra se procese a la vez para ese producto específico. Además, se pueden implementar validaciones adicionales en el backend para verificar la disponibilidad del producto antes de completar la compra y retornar un error si el producto ya no está disponible.
