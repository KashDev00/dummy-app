FROM node:20-alpine

WORKDIR /usr/app

COPY . .

RUN npm install

RUN npm run clean

RUN npm run build

EXPOSE 5000

CMD npm start