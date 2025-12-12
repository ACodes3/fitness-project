FROM node:20-alpine     
WORKDIR /server 

COPY package*.json .   
RUN nmp install      

COPY . .         

EXPOSE 5000

CMD npm start       