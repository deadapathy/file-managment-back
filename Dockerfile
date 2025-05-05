FROM node:18-alpine

WORKDIR /src

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
