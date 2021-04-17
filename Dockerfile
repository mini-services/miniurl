FROM node:14
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN npm install --production

COPY . /usr/src/app
ENTRYPOINT ["npm", "start"]