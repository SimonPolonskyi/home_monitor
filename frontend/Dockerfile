# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Аргументи для збірки
ARG VITE_API_URL=http://localhost:3000

# Копіювати package files
COPY package*.json ./

# Встановити залежності
RUN npm ci

# Копіювати код
COPY . .

# Встановити змінні середовища для збірки
ENV VITE_API_URL=$VITE_API_URL

# Збудувати додаток
RUN npm run build

# Production stage
FROM nginx:alpine

# Копіювати збілджені файли
COPY --from=builder /app/dist /usr/share/nginx/html

# Копіювати nginx конфігурацію
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
