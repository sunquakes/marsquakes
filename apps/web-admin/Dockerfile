# Marsquakes Web Admin - default image, no build stage.
# Prerequisite: dist must already exist (built by the pipeline or locally):
#   cd apps/web-admin && pnpm install --frozen-lockfile && pnpm build:docker
# Build context is the repository root:
#   docker build -f apps/web-admin/Dockerfile -t marsquakes/web-admin:latest .
#
# The other two variants in this directory:
#   Dockerfile.build  self-contained multi-stage build; works on a clean
#                     checkout, host needs no Node/pnpm
#   Dockerfile.dev    Vite dev server inside the container, with a volume mount
ARG NGINX_IMAGE=nginx:stable
FROM ${NGINX_IMAGE}
ENV LANG=en_US.UTF-8

COPY apps/web-admin/nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /var/www/html

# The output directory can be overridden from the pipeline: --build-arg DIST_DIR=...
ARG DIST_DIR=apps/web-admin/dist
COPY ${DIST_DIR} /var/www/html/

EXPOSE 80
