FROM registry.geprog.com/docker.io/node:alpine AS build
WORKDIR /app
COPY . ./
RUN ls -la
RUN yarn install
RUN yarn workspace @bookyp/backend run build

FROM registry.geprog.com/docker.io/node:alpine
ENV NODE_ENV=production
RUN apk --no-cache add ca-certificates
WORKDIR /app
CMD ["node", "index.js"]
COPY --from=build /app/packages/backend/dist .
RUN chown -R node:node /app
RUN ls -la
