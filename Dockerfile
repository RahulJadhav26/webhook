FROM node:14-alpine
WORKDIR /app
COPY package*.json /app/
RUN npm ci
RUN npm ci --only=production && npm cache clean --force
RUN npm install pm2 -g
COPY . /app
CMD ["pm2-runtime", "index.js"]
EXPOSE 8888