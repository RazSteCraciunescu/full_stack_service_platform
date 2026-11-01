FROM node:26-alpine
WORKDIR /app
COPY dist ./dist
COPY public ./public
COPY data ./data
COPY api ./api
ENV HOST=0.0.0.0 PORT=4174
EXPOSE 4174
USER node
CMD ["node", "dist/server/src/server.js"]
