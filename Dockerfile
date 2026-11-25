FROM docker.io/node:26.13.0-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072

WORKDIR /app
EXPOSE 3000

COPY .output .

USER node
ENV PORT=3000

CMD ["node", \
    "--enable-source-maps", \
    "--permission", \
    "--allow-fs-read=/app", \
    "--allow-addons", \
    "--allow-net", \
    "./server/index.mjs"]
