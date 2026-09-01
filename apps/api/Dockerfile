# Marsquakes API - default image, no compile stage.
# Prerequisite: the jar must already exist (built by the pipeline or locally):
#   cd apps/api && mvn -B -P docker clean package -DskipTests
# Build context is the repository root:
#   docker build -f apps/api/Dockerfile -t marsquakes/api:latest .
#
# The other two variants in this directory:
#   Dockerfile.build  self-contained multi-stage compile; works on a clean
#                     checkout, host needs no JDK/Maven
#   Dockerfile.dev    spring-boot:run inside the container, with a volume mount
#
# The tag is pinned to focal (glibc 2.31): Docker 20.10.8 on this machine has no
# clone3 in its seccomp whitelist, so on glibc 2.34+ jre images the JVM fails to
# start with pthread_create EPERM.
ARG JRE_IMAGE=eclipse-temurin:17-jre-focal
FROM ${JRE_IMAGE}

RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# The focal base image already ships en_US.utf8, so no locale package is needed
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"

WORKDIR /jeecg-boot
RUN mkdir -p /jeecg-boot/config

# The version can be overridden from the pipeline: --build-arg JAR_FILE=...
ARG JAR_FILE=apps/api/jeecg-module-system/jeecg-system-start/target/jeecg-system-start-3.9.3.jar
COPY ${JAR_FILE} ./app.jar

EXPOSE 8080
CMD ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
