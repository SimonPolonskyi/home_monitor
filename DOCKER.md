# Docker Deployment Guide

Детальний посібник по розгортанню UPS Monitor System з використанням Docker.

## Переваги Docker

- ✅ **Ізоляція** - додаток працює в ізольованому середовищі
- ✅ **Безпека** - обмежений доступ до системи
- ✅ **Простота** - один команда для запуску
- ✅ **Портативність** - працює на будь-якій системі з Docker
- ✅ **Масштабованість** - легко додавати нові сервіси

## Швидкий старт

### 1. Клонування та налаштування

```bash
git clone <repository-url>
cd UPS_Srv
```

### 2. Створення .env файлу

Створіть `.env` файл в корені проекту:

```env
# Безпечні ключі (обов'язково змініть!)
SESSION_SECRET=your-very-secure-random-secret-key-min-32-chars
DEVICE_API_KEY=your-secure-device-api-key

# Адміністратор
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# API URL для frontend (зазвичай /api для nginx proxy)
VITE_API_URL=/api
```

**Генерація безпечних ключів:**

```bash
# Linux/Mac
openssl rand -base64 32  # Для SESSION_SECRET
openssl rand -hex 16     # Для DEVICE_API_KEY

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Запуск

```bash
# Збудувати та запустити
docker-compose up -d --build

# Перевірити статус
docker-compose ps

# Переглянути логи
docker-compose logs -f
```

### 4. Ініціалізація бази даних

```bash
docker-compose exec backend npm run init-db
```

### 5. Доступ

- Frontend: `http://localhost`
- Backend API: `http://localhost/api`
- Health check: `http://localhost/health`

## Структура Docker

### Backend контейнер

- **Image:** `node:18-alpine`
- **Port:** 3000 (внутрішній)
- **Volume:** `backend-data` для збереження БД
- **Health check:** автоматична перевірка кожні 30 секунд

### Frontend контейнер

- **Image:** `nginx:alpine`
- **Port:** 80
- **Build:** multi-stage build (Node.js → Nginx)
- **Proxy:** автоматичний proxy `/api` → backend

## Керування контейнерами

### Перегляд логів

```bash
# Всі сервіси
docker-compose logs -f

# Тільки backend
docker-compose logs -f backend

# Тільки frontend
docker-compose logs -f frontend
```

### Перезапуск

```bash
# Всі контейнери
docker-compose restart

# Конкретний контейнер
docker-compose restart backend
```

### Зупинка

```bash
# Зупинити (зберегти дані)
docker-compose stop

# Зупинити та видалити контейнери
docker-compose down

# Зупинити та видалити все (включаючи volumes - видалить БД!)
docker-compose down -v
```

### Оновлення

```bash
# Зупинити
docker-compose down

# Оновити код
git pull

# Перебудувати та запустити
docker-compose up -d --build
```

## Створення користувачів

```bash
docker-compose exec backend npm run create-user -- \
  --username myuser \
  --password mypassword \
  --role viewer
```

## Backup та Restore

### Backup бази даних

```bash
# Створити backup
docker-compose exec backend cp /app/data/ups_monitor.db /app/data/ups_monitor.db.backup

# Скопіювати з контейнера
docker cp ups-backend:/app/data/ups_monitor.db ./backup/ups_monitor_$(date +%Y%m%d).db
```

### Restore бази даних

```bash
# Скопіювати backup в контейнер
docker cp ./backup/ups_monitor.db ups-backend:/app/data/ups_monitor.db

# Перезапустити backend
docker-compose restart backend
```

## Development режим

Для розробки з hot reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Особливості:
- Hot reload для backend (nodemon)
- Hot reload для frontend (Vite)
- Volumes для синхронізації коду
- Окремі volumes для dev даних

## Production налаштування

### 1. Безпека

- ✅ Змініть всі секрети в `.env`
- ✅ Використовуйте сильні паролі
- ✅ Налаштуйте firewall
- ✅ Використовуйте HTTPS (через Nginx reverse proxy)

### 2. Ресурси

Обмеження ресурсів в `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 3. Логування

```bash
# Налаштувати ротацію логів
docker-compose exec backend sh -c "echo 'logrotate config' > /etc/logrotate.d/ups"
```

### 4. Моніторинг

```bash
# Статистика використання ресурсів
docker stats

# Health check статус
docker-compose ps
```

## Troubleshooting

### Контейнер не запускається

```bash
# Перевірити логи
docker-compose logs backend

# Перевірити конфігурацію
docker-compose config

# Перебудувати з нуля
docker-compose build --no-cache
```

### Помилка підключення до БД

```bash
# Перевірити права на volume
docker-compose exec backend ls -la /app/data

# Перевірити чи існує БД
docker-compose exec backend ls -la /app/data/*.db
```

### Frontend не підключається до backend

```bash
# Перевірити nginx конфігурацію
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Перевірити мережеве з'єднання
docker-compose exec frontend ping backend
```

### Проблеми з правами

```bash
# Виправити права на data volume
docker-compose exec backend chown -R node:node /app/data
```

## Розгортання на VPS

### 1. Підготовка сервера

```bash
# Оновити систему
sudo apt update && sudo apt upgrade -y

# Встановити Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Встановити Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Клонування та налаштування

```bash
git clone <repository-url>
cd UPS_Srv

# Створити .env
nano .env  # Відредагувати з безпечними значеннями
```

### 3. Запуск

```bash
docker-compose up -d --build
docker-compose exec backend npm run init-db
```

### 4. Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 5. Автозапуск при перезавантаженні

Docker Compose автоматично запускає контейнери при старті системи, якщо використовується `restart: unless-stopped`.

## Додаткові налаштування

### Зміна портів

В `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Змінити зовнішній порт
```

### Додавання SSL

Використовуйте Nginx reverse proxy перед Docker контейнерами:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:80;
    }
}
```

### Моніторинг з Prometheus (опціонально)

Додайте в `docker-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

## Підтримка

Для питань та проблем створюйте issues в репозиторії.
