FROM node:14-alpine
WORKDIR /app
COPY package*.json /app/
RUN npm ci
RUN npm ci --only=production && npm cache clean --force
COPY . /app
CMD ["npm", "start"]
EXPOSE 8888