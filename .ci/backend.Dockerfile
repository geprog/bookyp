FROM registry.geprog.com/docker.io/library/node:14.16.0-buster AS build
WORKDIR /app
COPY . ./
RUN ls -la
RUN yarn rebuild
RUN yarn lerna run --scope @bookyp/backend --include-dependencies build

FROM registry.geprog.com/docker.io/library/node:14.16.0-alpine
ENV NODE_ENV=production
RUN apk --no-cache add ca-certificates
WORKDIR /app
CMD ["node", "index.js"]
COPY --from=build /app/packages/backend/dist .
RUN chown -R node:node /app
RUN ls -la
