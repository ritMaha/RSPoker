FROM node:14
RUN mkdir /server
WORKDIR /server
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
