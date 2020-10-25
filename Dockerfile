FROM node:alpine
WORKDIR /authorization-service
COPY ./package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "start"]