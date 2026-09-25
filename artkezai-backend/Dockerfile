# ── Stage 1: Build ────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B -q
COPY src ./src
# Unit tests need no database or secrets, so they run on every image build.
RUN mvn clean package -B

# ── Stage 2: Run ──────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/artkezai-backend-*.jar app.jar
USER app
EXPOSE 8080
# Tuned for small containers (Render free: 512 MB, 0.1 CPU). The whole JVM
# (heap + metaspace + code cache + thread stacks) must stay under the
# container limit, or the platform kills it without a Java error:
#   heap capped at 50% of the limit, metaspace and code cache bounded,
#   smaller thread stacks, SerialGC (no GC threads to feed on 0.1 CPU) and
#   C1-only JIT, which also roughly halves startup time on a slow CPU.
# Measured under 512 MB / 0.1 CPU: ~307 MB resident, startup ~250 s.
ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=50", "-XX:MaxMetaspaceSize=192m", "-XX:ReservedCodeCacheSize=64m", \
  "-Xss512k", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", \
  "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]
