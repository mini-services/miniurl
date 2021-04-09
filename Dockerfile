# --------------> The build image
FROM node:latest AS build
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --only=production



# --------------> The production image
#FROM node:lts-alpine@sha256:a75f7cc536062f9266f602d49047bc249826581406f8bc5a6605c76f9ed18e984
FROM node:lts-alpine
RUN apk add dumb-init
ENV NODE_ENV production
# Creating dir as root before changing to USER. 
#RUN mkdir -p /usr/src/app


#USER node
WORKDIR /usr/src/app

COPY --chown=node:node package.json .
COPY --chown=node:node package-lock.json .
COPY --chown=node:node . .
#RUN npm ci --only=production
#RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc && \
 #  npm ci --only=production && \
  # rm -f .npmrc
RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --only=production
#ENTRYPOINT ["npm", "start"]
CMD ["dumb-init", "node", "server.js"]