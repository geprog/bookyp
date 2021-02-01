FROM registry.geprog.com/docker.io/library/node:12.19.1-alpine AS build
WORKDIR /app
COPY . ./
RUN ls -la
RUN yarn install
RUN yarn workspace @bookyp/backend run build

FROM registry.geprog.com/docker.io/library/nginx:1.19.6-alpine
EXPOSE 80
WORKDIR /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
COPY ./.ci/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/frontend/dist .
RUN ls -la
