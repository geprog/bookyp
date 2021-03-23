FROM registry.geprog.com/docker.io/library/nginx:1.19.6-alpine
EXPOSE 80
WORKDIR /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
COPY ./.ci/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./packages/frontend/dist .
RUN ls -la
