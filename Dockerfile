# ========== Build ==========
FROM node:latest AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm ci --only=production

# ========== Production ==========
FROM node:lts-alpine@sha256:e48a99d69f430761d99682ffcb17b06a513cdc65d7130cc02ce0f6a1ef492357
RUN apk add dumb-init
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app
CMD ["dumb-init", "npm", "start"]