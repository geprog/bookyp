FROM registry.geprog.com/docker.io/library/nginx:1.19.6-alpine
EXPOSE 80
WORKDIR /usr/share/nginx/html
COPY ./.ci/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./packages/frontend/dist .
RUN ls -la
# When the container starts, replace the app-config.js with values from environment variables
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/assets/env-config.template.js > /usr/share/nginx/html/assets/env-config.js && exec nginx -g 'daemon off;'"]
