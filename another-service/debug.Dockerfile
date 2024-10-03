FROM node:latest

WORKDIR back_end

EXPOSE 5000

CMD ["npm", "run", "dev"]

