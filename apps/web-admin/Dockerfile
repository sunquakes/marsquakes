FROM node:24-bullseye-slim AS builder
RUN npm config set registry https://registry.npmmirror.com && npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com
WORKDIR /app
COPY . .
RUN cd apps/web && pnpm i
ENV PATH=/app/apps/web/node_modules/.bin:$PATH
RUN cd apps/web && pnpm build

FROM registry.cn-hangzhou.aliyuncs.com/dockerhub_mirror/nginx
MAINTAINER jeecgos@163.com
VOLUME /tmp
ENV LANG en_US.UTF-8
RUN echo "server {  \
                      listen       80; \
                      resolver 127.0.0.11 valid=10s ipv6=off; \
                      location   /jeecgboot/ { \
                      set \$jeecg_system jeecg-boot-system; \
                      rewrite ^/jeecgboot/?(.*)\$ /jeecg-boot/\$1 break; \
                      proxy_pass              http://\$jeecg_system:8080; \
                      proxy_redirect          off; \
                      proxy_set_header        Host jeecg-boot-system; \
                      proxy_set_header        X-Real-IP \$remote_addr; \
                      proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for; \
                  } \
                  location / { \
                     root   /var/www/html/; \
                      index  index.html index.htm; \
                      if (!-e \$request_filename) { \
                          rewrite ^(.*)\$ /index.html?s=\$1 last; \
                          break; \
                      } \
                  } \
                  access_log  /var/log/nginx/access.log ; \
              } " > /etc/nginx/conf.d/default.conf \
    &&  mkdir  -p  /var/www \
    &&  mkdir -p /var/www/html

COPY --from=builder /app/apps/web/dist /var/www/html/
EXPOSE 80
EXPOSE 443