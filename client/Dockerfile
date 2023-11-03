# Stage 1
FROM node:16.16.0 as build-stage

WORKDIR /client
COPY package.json .
RUN npm install
COPY . .


RUN npm run build
