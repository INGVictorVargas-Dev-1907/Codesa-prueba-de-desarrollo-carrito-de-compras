FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copiar el wrapper y el pom primero (mejor caché de capas)
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src src
RUN ./mvnw clean package -DskipTests -B


FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear usuario no-root (buena práctica de seguridad)
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar solo el JAR compilado
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Configuración de memoria para contenedores
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "app.jar"]