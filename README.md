# Codesa Shop — Carrito de compras

Bienvenido a **Codesa Shop**, una aplicación de comercio electrónico de tecnología desarrollada como prueba técnica. Este proyecto implementa una arquitectura limpia, tipado estricto y una experiencia de usuario enfocada en el carrito de compras.

---

## 1. ¿Qué es y capturas de pantalla

**Codesa Shop** es una tienda en línea que permite a los usuarios explorar un catálogo de productos, ver sus detalles, agregarlos a un carrito de compras persistente, aplicar cupones de descuento, proceder a un checkout con validaciones y recibir una confirmación de pedido.

### Capturas de Pantalla (Escritorio y Móvil)
   
  Catálogo (Escritorio)
<img width="1357" height="600" alt="image" src="https://github.com/user-attachments/assets/baa2e0d1-246f-4e1c-81ea-26d3daa51d61" />  <img width="1348" height="681" alt="image" src="https://github.com/user-attachments/assets/6db0dadc-e65e-43cd-b454-45c543b2fba3" />
 
 Carrito Lateral (Escritorio)  <img width="1348" height="671" alt="image" src="https://github.com/user-attachments/assets/f89938bd-f07b-4917-ba64-68f021799ca8" /> <img width="1341" height="675" alt="image" src="https://github.com/user-attachments/assets/c2810f84-d1b2-4993-bd8c-4842b15daeda" />

 Checkout (Escritorio)  <img width="1304" height="630" alt="image" src="https://github.com/user-attachments/assets/eb38be65-5cea-46f3-b4e5-73a182e7f384" /> <img width="1288" height="611" alt="image" src="https://github.com/user-attachments/assets/235ccd2d-bccb-4319-a8b2-8f7fbdd8875b" />

 <img width="220" height="473" alt="image" src="https://github.com/user-attachments/assets/0c8d5ad5-081a-4c8a-959e-1b6c0e1aff27" />
 <img width="219" height="474" alt="image" src="https://github.com/user-attachments/assets/574726ff-eff5-471d-80f1-d83fadf79b80" />
 <img width="220" height="474" alt="image" src="https://github.com/user-attachments/assets/457c8b22-bdf1-41d4-957f-7a60f5f6d885" />
 <img width="216" height="467" alt="image" src="https://github.com/user-attachments/assets/c32ceae0-1827-40f8-b5bd-65fe51c105c0" />
 <img width="217" height="468" alt="image" src="https://github.com/user-attachments/assets/383f91f8-c089-46d1-8967-7c967f63d747" />

 ---

## 2. Guía Paso a Paso para Ejecutar la Aplicación

### Requisitos previos:
- Tener **Docker Desktop** instalado y corriendo.
- Tener **Git** instalado.
- (Opcional) Tener **Node.js 20+** y **Java 21** si quieres correr en local.

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/codesa-shop.git
cd codesa-shop
```
### Paso 2: Ejecutar con Docker (comando único)
```bash
docker compose up --build
```
Este comando descargará las imágenes, construirá el backend y el frontend, y levantará los 3 servicios (PostgreSQL, Spring Boot y Nginx).

### Paso 3: Abrir la aplicación
Una vez que los contenedores estén corriendo (docker compose ps muestra los 3 servicios como Up), abre tu navegador en:
```url
http://localhost:4200
```
### Paso 4: Detener la aplicación
```bash
docker compose down
```

## 3. Decisiones de Arquitectura

### 3.1. ¿Dónde vive el estado del carrito y por qué ahí?
El estado del carrito vive en un único lugar: el CartStore (frontend/src/app/features/cart/cart.store.ts).

- ¿Por qué ahí? El PDF es tajante: "el carrito vive en un solo lugar". Si los componentes calcularan totales por su cuenta, caeríamos en una penalización. Todos los componentes (sidebar, página del carrito, mini-carrito) consumen la misma fuente de verdad.

- Tecnología: Usamos Angular Signals. Los computed derivan automáticamente el subtotal, descuento, envío y total. Los componentes solo leen el estado, no lo modifican.

- Persistencia: Un effect() escucha cualquier cambio en las líneas y lo guarda en localStorage. Al recargar (F5), el estado se reconstruye y se valida que los datos no estén corruptos.

### 3.2. ¿Qué se calcula en el navegador y qué le pides al backend?
- En el navegador (UX): El frontend calcula los totales en tiempo real para mostrar los precios al usuario. También valida el stock localmente.
  
- En el backend (Verdad absoluta): Al hacer POST /api/orders, el servidor ignora los totales enviados por el cliente. Recalcula todo leyendo los precios reales desde PostgreSQL, valida el stock y el cupón, y guarda la orden en una transacción @Transactional. Si el total del cliente no cuadra (±$1), responde 422 TOTAL_INCORRECTO.

## 4. El Acabado Visual (PrimeNG 20)
- Uso de PrimeNG: Se usaron componentes de la librería para toda la interfaz: p-drawer (carrito lateral), p-toast (avisos), p-button, p-inputtext, p-rating, p-select (filtros), p-skeleton (cargas), p-radiobutton, etc. No se reconstruyó ningún widget a mano.

- Qué hice yo: Diseñé un "Banner Hero" con gradiente oscuro, un header limpio con mini-carrito hover, un footer detallado, y una identidad visual coherente (colores, tipografía, separaciones). Usé CSS Grid y Flexbox para garantizar que todo sea responsive, diseñé la arquitectura del proyecto paso por paso registre cada commits, le di detalles , cambie colores cambie estilos, buscando un acabado visual mas llamativo y mas funcional

## 5. Cómo cubrí los Estados de la Interfaz y cómo provocarlos

- Cargando: Se muestran p-skeleton con la forma de las tarjetas de producto, tanto al cargar el catálogo como al usar el buscador.

- Vacío: El carrito tiene un mensaje claro y un botón para ir al catálogo. La búsqueda sin resultados muestra un botón para limpiar filtros.

- Error: El interceptor traduce los errores del backend a mensajes legibles. Si el backend está caído, se muestra un mensaje controlado.

- Con datos: La interfaz definitiva, sin saltos, con el mismo diseño en todas las pantallas.

---

## 6. Librerías Elegidas y su Propósito

| Tecnología | Versión | Propósito |
| :--- | :--- | :--- |
| **Angular** | 20.3.34 | Framework frontend (Standalone Components, Signals). |
| **PrimeNG** | 20.4.0 | Librería de componentes UI. |
| **PrimeIcons** | 8.0.2 | Iconografía. |
| **@primeng/themes** | 20.4.0 | Tema Aura. |
| **@angular/cdk** | 20.2.14 | Dependencia de PrimeNG para overlays. |
| **TypeScript** | 5.9.2 | Tipado estricto. |
| **RxJS** | 7.8.0 | Manejo de asincronía. |
| **Spring Boot** | 3.4.2 | Framework backend. |
| **Java** | 21 (Temurin) | Lenguaje del backend. |
| **Spring Data JPA** | 3.4.2 | ORM para PostgreSQL. |
| **PostgreSQL** | 16 | Base de datos relacional. |
| **Docker** | 24+ | Contenedores. |
| **Docker Compose** | 2.x | Orquestación de servicios. |
| **Nginx** | Alpine | Servidor para el frontend. |
| **Maven** | 3.10.0 | Build del backend. |

---

## 7. Tabla de Tamaños del Build de Producción
El build se mantiene liviano gracias al Lazy Loading y el tree-shaking de PrimeNG.

| Archivo	| Tamaño Raw	| Tamaño Transfer (aprox.) | 
| :--- | :--- | :--- |
| Initial | Total	124 kB	|30 kB |
|Lazy Chunks (por pantalla)	| ~60 kB c/u	| ~15 kB c/u |

---

## 8. ¿Qué mejoraría con una semana más?
- Autenticación y Perfiles: Implementaría login para guardar el historial de pedidos del usuario.

- Tests unitarios: Añadiría pruebas con Jasmine/Karma para el CartStore y los servicios, y tests de integración con Spring Boot.

- Pasarela de pago real: Integraría Stripe o MercadoPago para el checkout.

- Imprimir comporbante o revisar orden de compra

- Migraciones de BD: Cambiaría ddl-auto: update por Flyway para un control de versiones de la base de datos más seguro.

- Paginación infinita: Mejoraría el catálogo con scroll infinito en lugar de paginación tradicional.

- CI/CD: Configuraría GitHub Actions para correr los tests y el lint en cada push.

---

## 9. Tiempo Real Invertido
- Backend: ~7 horas (configuración de Docker, entidades JPA, controladores, validación de cupones y solución de conflictos de puertos).

- Frontend: ~3 dias (diseño de las 5 pantallas, lógica del carrito con Signals, integración con PrimeNG, accesibilidad y pruebas).

Total: ~7 horas y  3 días.








 


 



