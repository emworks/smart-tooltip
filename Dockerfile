FROM node:12-alpine as smart-tooltip
WORKDIR /app
COPY package*.json /app/
RUN npm install --no-optional
COPY ./ /app/
RUN npm run build
EXPOSE 9000
CMD npm start
