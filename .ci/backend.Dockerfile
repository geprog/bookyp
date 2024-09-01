FROM registry.geprog.com/docker.io/library/node:22-alpine
ENV NODE_ENV=production
RUN apk --no-cache add ca-certificates
WORKDIR /app
CMD ["node", "--enable-source-maps", "index.js"]
COPY ./packages/backend/dist .
RUN chown -R node:node /app
RUN ls -la
