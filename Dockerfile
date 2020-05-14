FROM node:12

ENV NODE_ENV development
WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

CMD [ "yarn", "start" ]