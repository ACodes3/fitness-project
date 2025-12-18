# node alpine da je manjsi image
FROM node:20-alpine AS builder
WORKDIR /client

# Kopiramo package.json in package-lock.json 
COPY package*.json .
RUN npm install      

# Kopiramo ostale fajle
COPY . .         

# Buildamo aplikacijo
RUN npm run build  

# 2nd stage - Nginx server za serviranje statičnih fajlov
FROM nginx:alpine   

# Kopiramo buildane fajle iz prejšnjega stage-a v Nginx folder 
COPY --from=builder /client/dist /usr/share/nginx/html 
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 