FROM nginx:1.30.6-alpine@sha256:0e52bd054126cdc040b1276c0af347aeb02a41b9cfe305d6094767ac30e97949
EXPOSE 80
WORKDIR /usr/share/nginx/html
COPY ./.ci/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./packages/frontend/dist .
# When the container starts, replace the app-config.js with values from environment variables
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/env-config.template.js > /usr/share/nginx/html/env-config.js && exec nginx -g 'daemon off;'"]
