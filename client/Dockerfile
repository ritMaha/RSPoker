FROM node:14
RUN mkdir /client
WORKDIR /client
COPY package*.json .
RUN npm install
COPY . .
CMD ["npm", "start"]
