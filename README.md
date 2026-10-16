# Codesa Shop — Carrito de compras

Tienda de tecnología con carrito de compras.

- **Frontend**: Angular 20 + PrimeNG 20 + TypeScript estricto
- **Backend**: Spring Boot 3 + Java 21 + PostgreSQL
- **Ejecución**: `docker compose up --build` → http://localhost:4200


### Decisiones de arquitectura
Puerto de PostgreSQL: Se usa el puerto 5433 en el host en lugar del estándar 5432 para evitar conflictos con instalaciones locales de PostgreSQL en Windows. El contenedor expone internamente 5432. Mapeo en docker-compose.yml: "5433:5432".

Motivo: En entornos Windows con PostgreSQL ya instalado, el servicio local escucha en 5432 e intercepta las conexiones del contenedor Docker.
> 🚧 Proyecto en desarrollo. El README completo se documentará al final.