FROM node:18-alpine

WORKDIR /front_end

ENV NODE_OPTIONS="--max-old-space-size=8192"

COPY package*.json ./

RUN npm install

CMD ["npm", "run", "dev"]