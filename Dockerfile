FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN chmod 644 package*.json

RUN npm install

COPY . .

RUN npm run build

RUN chmod -R 777 .

CMD [ "npm", "run", "start:dev" ]

