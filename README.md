# UPS Monitor System

Веб-сервер для моніторингу UPS пристроїв з веб-інтерфейсом та аутентифікацією.

## Особливості

- ✅ Прийом даних від UPS пристроїв через HTTP POST
- ✅ Зберігання даних в SQLite базі даних
- ✅ Веб-інтерфейс з аутентифікацією (логін/пароль)
- ✅ Dashboard з поточним станом пристроїв
- ✅ Детальна сторінка пристрою з графіками
- ✅ Історія вимірювань та помилок
- ✅ Масштабована архітектура (підтримка різних типів пристроїв)
- ✅ Real-time оновлення даних

## Структура проекту

```
ups-monitor-server/
├── backend/          # Node.js + Express backend
├── frontend/         # React frontend
├── API.md            # Документація API для UPS пристроїв
└── ARCHITECTURE.md   # Детальна архітектура системи
```

## Вимоги

### Для запуску без Docker:
- Node.js 18+ 
- npm або yarn

### Для запуску з Docker (рекомендовано):
- Docker 20.10+
- Docker Compose 2.0+

## Запуск з Docker (рекомендовано)

Docker забезпечує ізоляцію, безпеку та простоту розгортання.

### Production режим

1. **Створіть `package-lock.json` файли (опціонально, для детермінованих збірок):**

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

**Примітка:** Якщо `package-lock.json` файли відсутні, Dockerfile використає `npm install` замість `npm ci`. Для production рекомендується мати `package-lock.json` файли.

2. **Створіть `.env` файл в корені проекту:**

```env
SESSION_SECRET=your-very-secure-secret-key-change-this
DEVICE_API_KEY=your-device-api-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
VITE_API_URL=/api
```

3. **Зберіть та запустіть контейнери:**

```bash
docker-compose up -d --build
```

4. **Ініціалізуйте базу даних (перший запуск):**

```bash
docker-compose exec backend npm run init-db
```

5. **Перевірте статус:**

```bash
docker-compose ps
```

Система буде доступна на:
- Frontend: `http://localhost` (порт 80)
- Backend API: `http://localhost/api`

### Development режим

Для розробки з hot reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`

### Корисні команди Docker

```bash
# Переглянути логи
docker-compose logs -f

# Зупинити контейнери
docker-compose down

# Зупинити та видалити volumes (очистити БД)
docker-compose down -v

# Перезапустити контейнери
docker-compose restart

# Виконати команду в контейнері
docker-compose exec backend npm run create-user -- --username user --password pass
```

### Створення користувачів в Docker

```bash
docker-compose exec backend npm run create-user -- --username myuser --password mypass --role viewer
```

### Backup бази даних

```bash
# Створити backup
docker-compose exec backend cp /app/data/ups_monitor.db /app/data/ups_monitor.db.backup

# Або скопіювати з контейнера
docker cp ups-backend:/app/data/ups_monitor.db ./backup/
```

### Оновлення

```bash
# Зупинити контейнери
docker-compose down

# Оновити код (git pull)

# Перебудувати та запустити
docker-compose up -d --build

# Ініціалізувати БД якщо потрібно
docker-compose exec backend npm run init-db
```

## Встановлення (без Docker)

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd UPS_Srv
```

### 2. Backend

```bash
cd backend
npm install
```

Створіть файл `.env` на основі `env.example`:

```bash
cp env.example .env
```

Відредагуйте `.env` файл:

```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
DB_PATH=./data/ups_monitor.db
SESSION_SECRET=your-secret-key-change-this
DEVICE_API_KEY=your-device-api-key-change-this
CORS_ORIGIN=http://localhost:3001
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Ініціалізуйте базу даних:

```bash
npm run init-db
```

Це створить базу даних та адміністратора (якщо вказано в `.env`).

### 3. Frontend

```bash
cd ../frontend
npm install
```

Створіть файл `.env` на основі `env.example`:

```bash
cp env.example .env
```

Відредагуйте `.env` файл:

```env
VITE_API_URL=http://localhost:3000
```

## Запуск

### Development режим

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Backend буде доступний на `http://localhost:3000`
Frontend буде доступний на `http://localhost:3001`

### Production режим

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

Або використовуйте Nginx для обслуговування статичних файлів.

## Використання

### 1. Вхід в систему

Відкрийте `http://localhost:3001` в браузері та увійдіть з обліковими даними адміністратора (за замовчуванням: `admin` / `admin123`).

### 2. Налаштування UPS пристрою

В `src/config.h` вашого UPS пристрою встановіть:

**Для Docker (production):**
```cpp
#define REMOTE_SERVER_URL "http://your-server-ip/api/data"
#define REMOTE_SERVER_API_KEY "your-device-api-key-change-this"
```

**Для локального запуску:**
```cpp
#define REMOTE_SERVER_URL "http://your-server-ip:3000/api/data"
#define REMOTE_SERVER_API_KEY "your-device-api-key-change-this"
```

**Важливо:** `DEVICE_API_KEY` в `.env` файлі (або docker-compose.yml) повинен співпадати з `REMOTE_SERVER_API_KEY` в UPS пристрої.

### 3. Перегляд даних

- **Dashboard** - список всіх пристроїв та загальна статистика
- **Детальна сторінка пристрою** - поточний стан, графіки, історія помилок

## Створення користувачів

```bash
cd backend
npm run create-user -- --username myuser --password mypassword --role viewer
```

Ролі:
- `admin` - повний доступ
- `viewer` - тільки перегляд

## API Endpoints

### Для пристроїв (UPS)

**POST /api/data**
- Прийом даних від UPS
- Headers: `X-API-Key: your-device-api-key`
- Body: JSON згідно з `API.md`

### Для користувачів (потрібна аутентифікація)

**POST /api/auth/login** - Вхід
**POST /api/auth/logout** - Вихід
**GET /api/auth/me** - Поточний користувач
**GET /api/devices** - Список пристроїв
**GET /api/devices/:device_id** - Деталі пристрою
**GET /api/devices/:device_id/current** - Поточний стан
**GET /api/devices/:device_id/history** - Історія
**GET /api/devices/:device_id/errors** - Помилки
**GET /api/stats** - Статистика

## Структура бази даних

- `users` - користувачі системи
- `devices` - зареєстровані пристрої
- `measurements` - вимірювання
- `errors` - помилки
- `warnings` - попередження

Детальніше в `ARCHITECTURE.md`.

## Розгортання на VPS

### Вимоги VPS

- RAM: 4 GB (достатньо для початку)
- CPU: 4 cores
- Disk: 200 GB

### Розгортання з Docker (рекомендовано)

1. **Встановіть Docker та Docker Compose на сервері:**

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Встановити Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Клонуйте проект:**

```bash
git clone <repository-url>
cd UPS_Srv
```

3. **Створіть `.env` файл з production налаштуваннями:**

```env
SESSION_SECRET=your-very-secure-secret-key
DEVICE_API_KEY=your-secure-api-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
VITE_API_URL=/api
```

4. **Запустіть:**

```bash
docker-compose up -d --build
docker-compose exec backend npm run init-db
```

5. **Налаштуйте firewall (якщо потрібно):**

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # Для HTTPS
```

6. **Налаштуйте домен (опціонально):**

Використовуйте Nginx як reverse proxy перед Docker контейнерами для HTTPS:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Розгортання без Docker

1. Встановіть Node.js на сервері
2. Клонуйте проект
3. Встановіть залежності (backend та frontend)
4. Налаштуйте `.env` файли
5. Ініціалізуйте базу даних
6. Запустіть backend (використовуйте PM2 для production)
7. Зберіть frontend та налаштуйте Nginx

### PM2 для backend (без Docker)

```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name ups-backend
pm2 save
pm2 startup
```

## Розширення

Система підготовлена для додавання нових типів пристроїв:

1. Додайте конфігурацію в `backend/config/device-types.js`
2. Створіть handler в `backend/src/handlers/`
3. Додайте UI компонент в `frontend/src/components/devices/`

Детальніше в `ARCHITECTURE.md`.

## Troubleshooting

### Помилка підключення до БД

Перевірте чи існує папка `backend/data` та чи є права на запис.

### Помилка аутентифікації

Перевірте чи правильно налаштований `SESSION_SECRET` в `.env`.

### UPS не відправляє дані

1. Перевірте `REMOTE_SERVER_URL` в UPS
2. Перевірте `DEVICE_API_KEY` (повинен співпадати)
3. Перевірте firewall на сервері

## Ліцензія

MIT

## Підтримка

Для питань та пропозицій створюйте issues в репозиторії.
