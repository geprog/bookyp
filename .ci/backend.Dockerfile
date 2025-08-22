FROM node:22.17.1-alpine
ENV NODE_ENV=production
RUN apk --no-cache add ca-certificates
WORKDIR /app
CMD ["node", "--enable-source-maps", "index.js"]
COPY ./packages/backend/dist .
RUN chown -R node:node /app
RUN ls -la
