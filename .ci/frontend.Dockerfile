FROM registry.geprog.com/docker.io/library/node:14.16.0-buster AS build
WORKDIR /app
COPY . ./
RUN ls -la
RUN yarn rebuild
RUN yarn lerna run --scope @bookyp/frontend --include-dependencies build

FROM registry.geprog.com/docker.io/library/nginx:1.19.6-alpine
EXPOSE 80
WORKDIR /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
COPY ./.ci/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/frontend/dist .
RUN ls -la
