FROM node:16.13.0-slim

WORKDIR /usr/local/server
COPY . .
RUN yarn 
EXPOSE 8000

CMD [ "yarn", "dev" ]
