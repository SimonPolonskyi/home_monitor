FROM node:18-alpine

WORKDIR /app

# Встановити wget для health check
RUN apk add --no-cache wget

# Копіювати package files
COPY package*.json ./

# Встановити залежності (включаючи dev для скриптів)
RUN npm install

# Копіювати код
COPY . .

# Створити папку для даних з правильними правами
RUN mkdir -p /app/data && chown -R node:node /app/data

# Використовувати non-root користувача
USER node

# Відкрити порт
EXPOSE 3000

# Запустити сервер
CMD ["node", "src/server.js"]
