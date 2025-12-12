FROM node:20-alpine AS builder
WORKDIR /client

COPY package*.json .
RUN npm install      

COPY . .         

RUN npm run build   # nastane client/dist

FROM nginx:alpine   #vzamemo mejhn image k zna servirat stat. fajle
WORKDIR /client
COPY --from=builder /client/dist /usr/share/nginx/html # kopiramo zbuildane fajle v nginx folder
EXPOSE 80 