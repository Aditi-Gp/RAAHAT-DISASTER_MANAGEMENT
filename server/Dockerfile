FROM node:18

WORKDIR /app
COPY . .
RUN npm install --production

EXPOSE 5000
CMD ["npm", "run", "start"]
