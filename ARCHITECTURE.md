# UPS Monitor System - Архітектура веб-сервера

## Загальна інформація

Веб-сервер для прийому та відображення даних від UPS пристроїв з підтримкою аутентифікації та масштабованості.

**VPS характеристики:**
- RAM: 4 GB
- CPU: 4 cores
- Disk: 200 GB

**Підхід:** Від простого до складного - початок з одного пристрою, підготовка до майбутнього розширення.

---

## Технологічний стек

### Backend
- **Node.js + Express.js** - веб-сервер
- **SQLite** (початок) / **PostgreSQL** (майбутнє) - база даних
- **express-session** - управління сесіями
- **bcrypt** - хешування паролів
- **jsonwebtoken** (опціонально) - JWT токени

### Frontend
- **React** - SPA інтерфейс
- **Chart.js / Recharts** - графіки
- **React Router** - маршрутизація
- **Axios** - HTTP клієнт

### Інфраструктура
- **Docker** (опціонально) - контейнеризація
- **Nginx** (опціонально) - reverse proxy

---

## Архітектура системи

```
┌─────────────┐
│  UPS Device │──POST──┐
└─────────────┘        │
                       ▼
              ┌─────────────────┐
              │  API Endpoint   │ (POST /api/data)
              │  - Auth (API Key)│
              │  - Validation   │
              │  - Type Detect  │
              └────────┬─────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Device Handler  │
              │  - UPS Handler  │
              │  - Type Router  │
              └────────┬─────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   Database      │
              │  - Devices      │
              │  - Measurements │
              │  - Errors       │
              │  - Users        │
              └────────┬─────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐        ┌─────────────────┐
│  REST API       │        │  WebSocket      │
│  (Protected)    │        │  Real-time      │
│  /api/devices   │        │  Updates        │
│  /api/history   │        └─────────────────┘
│  /api/stats     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │
│  Dashboard      │
│  (Login req.)   │
└─────────────────┘
```

---

## Структура бази даних

### Таблиця `users`
- `id` (PK, INTEGER)
- `username` (UNIQUE, TEXT)
- `password_hash` (TEXT) - bcrypt hash
- `email` (TEXT, опціонально)
- `role` (TEXT) - 'admin' / 'viewer'
- `created_at` (DATETIME)
- `last_login` (DATETIME)

### Таблиця `devices`
- `id` (PK, INTEGER)
- `device_id` (UNIQUE, TEXT) - MAC або кастомний ID
- `device_type` (TEXT) - 'UPS', 'UPS_V2', 'GENERATOR', тощо
- `name` (TEXT) - назва пристрою
- `location` (TEXT) - місцезнаходження
- `model` (TEXT, опціонально)
- `firmware_version` (TEXT, опціонально)
- `config` (JSON, опціонально) - додаткові налаштування
- `last_seen` (DATETIME)
- `created_at` (DATETIME)

### Таблиця `measurements`
- `id` (PK, INTEGER)
- `device_id` (FK, TEXT, INDEXED)
- `timestamp` (INTEGER, INDEXED) - Unix timestamp (мілісекунди)
- `status` (TEXT) - 'ok', 'warning', 'error', 'critical'
- `data_valid` (BOOLEAN)
- `data` (JSON) - гнучке зберігання даних
  - Для UPS: `{battery, output, temperature, efficiency, energy_consumed, energy_supplied}`
  - Для інших типів: свої поля
- `created_at` (DATETIME)

### Таблиця `errors`
- `id` (PK, INTEGER)
- `device_id` (FK, TEXT, INDEXED)
- `timestamp` (INTEGER, INDEXED)
- `severity` (TEXT) - 'critical', 'error', 'warning', 'info'
- `category` (TEXT) - 'sensor', 'storage', 'network', 'system', 'display'
- `message` (TEXT)
- `error_stats` (JSON) - статистика помилок
- `sensor_data` (JSON) - дані датчиків на момент помилки
- `created_at` (DATETIME)

### Таблиця `warnings`
- `id` (PK, INTEGER)
- `device_id` (FK, TEXT, INDEXED)
- `timestamp` (INTEGER)
- `message` (TEXT)
- `resolved` (BOOLEAN, default: false)
- `created_at` (DATETIME)

---

## API Endpoints

### Публічні (без аутентифікації користувача)

**POST /api/data**
- Прийом даних від UPS пристроїв
- Headers: `X-API-Key`, `Content-Type: application/json`
- Валідація та збереження даних
- Відповідь: `200` (успіх), `400` (помилка клієнта), `500` (помилка сервера)

**POST /api/auth/login**
- Вхід користувача
- Body: `{username, password}`
- Відповідь: `{success: true, user: {...}}` або помилка

**POST /api/auth/logout**
- Вихід користувача
- Видалення сесії

### Захищені (потрібна аутентифікація)

**GET /api/auth/me**
- Поточна інформація про користувача

**GET /api/devices**
- Список всіх пристроїв
- Query params: `?type=UPS` (фільтр за типом)

**GET /api/devices/:device_id**
- Детальна інформація про пристрій

**GET /api/devices/:device_id/current**
- Поточний стан пристрою (останні дані)

**GET /api/devices/:device_id/history**
- Історія вимірювань
- Query params: `?from=timestamp&to=timestamp&limit=100`

**GET /api/devices/:device_id/errors**
- Список помилок пристрою
- Query params: `?severity=critical&limit=50`

**GET /api/stats**
- Загальна статистика по всіх пристроях

**WebSocket /ws**
- Real-time оновлення даних
- Аутентифікація через сесію

---

## Обробка даних

### Device Handler Pattern

```javascript
// Базовий клас для обробки пристроїв
class BaseHandler {
  static validate(data) { }
  static normalize(data) { }
  static process(data) { }
}

// Специфічний handler для UPS
class UPSHandler extends BaseHandler {
  static validate(data) {
    // Валідація UPS даних
  }
  static normalize(data) {
    // Нормалізація в уніфікований формат
  }
}
```

### Автоматичне визначення типу пристрою

1. Якщо в запиті є `device_type` - використовувати його
2. Якщо є поле `battery` та `output` - тип `UPS`
3. Інші патерни для майбутніх типів
4. За замовчуванням - `UNKNOWN`

---

## Frontend Dashboard

### Сторінки

1. **/login** - Сторінка входу
   - Форма: username + password
   - Валідація
   - Обробка помилок

2. **/dashboard** - Головна сторінка
   - Картки з поточним станом пристроїв
   - Індикатори статусу
   - Останні помилки/попередження
   - Фільтр за типом пристрою

3. **/devices/:device_id** - Детальна сторінка пристрою
   - Поточні значення
   - Графіки в часі
   - Статистика помилок
   - Історія попереджень
   - Адаптивний UI залежно від типу пристрою

4. **/history** - Історія та аналітика
   - Фільтри за датою/часом
   - Експорт даних (CSV/JSON)
   - Статистика за період

5. **/settings** - Налаштування
   - Список пристроїв
   - Налаштування назв/локацій
   - Керування користувачами (для адмінів)

### Компоненти

- `ProtectedRoute` - захищені маршрути
- `DeviceCard` - картка пристрою (універсальна)
- `UPSView` - детальний вигляд UPS
- `Charts` - графіки (напруга, струм, температура)
- `ErrorList` - список помилок
- `Header` - навігація з кнопкою виходу
- `LoginForm` - форма входу

---

## Безпека

### Аутентифікація

- **Для пристроїв:** X-API-Key в заголовках
- **Для користувачів:** Сесії (express-session) з HTTP-only cookies

### Паролі

- Хешування: bcrypt (salt rounds: 10)
- Мінімальна довжина: 8 символів

### Сесії

- HTTP-only cookies (захист від XSS)
- Secure flag (HTTPS only)
- SameSite protection
- Таймаут: 24 години

### API

- Rate limiting для `/api/auth/login` (захист від brute-force)
- CORS налаштування
- Валідація вхідних даних (JSON schema)
- Логування спроб входу

---

## Структура проекту

```
ups-monitor-server/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── data.js           # POST /api/data
│   │   │   ├── auth.js           # POST /api/auth/*
│   │   │   ├── devices.js        # GET /api/devices/*
│   │   │   └── stats.js          # GET /api/stats
│   │   ├── handlers/             # Обробка різних типів пристроїв
│   │   │   ├── BaseHandler.js
│   │   │   ├── UPSHandler.js
│   │   │   ├── GeneratorHandler.js (майбутнє)
│   │   │   └── DefaultHandler.js
│   │   ├── middleware/
│   │   │   ├── auth.js           # requireAuth middleware
│   │   │   ├── apiKey.js         # X-API-Key validation
│   │   │   ├── validation.js    # JSON validation
│   │   │   └── rateLimit.js      # Rate limiting
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Device.js
│   │   │   ├── Measurement.js
│   │   │   └── Error.js
│   │   ├── database/
│   │   │   ├── db.js             # Абстракція БД
│   │   │   ├── sqlite.js         # SQLite реалізація
│   │   │   ├── postgres.js       # PostgreSQL (майбутнє)
│   │   │   └── migrations/      # Міграції БД
│   │   ├── auth/
│   │   │   ├── password.js       # Хешування паролів
│   │   │   └── session.js        # Управління сесіями
│   │   ├── websocket/
│   │   │   └── ws.js             # WebSocket server
│   │   └── server.js             # Точка входу
│   ├── config/
│   │   ├── config.js             # Environment variables
│   │   └── device-types.js       # Конфігурація типів пристроїв
│   ├── scripts/
│   │   ├── init-db.js            # Ініціалізація БД
│   │   └── create-user.js        # Створення користувача
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── DeviceDetail.js
│   │   │   ├── History.js
│   │   │   └── Settings.js
│   │   ├── components/
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── Header.js
│   │   │   ├── DeviceCard.js
│   │   │   ├── devices/
│   │   │   │   ├── UPSView.js
│   │   │   │   ├── GeneratorView.js (майбутнє)
│   │   │   │   └── DefaultView.js
│   │   │   ├── Charts/
│   │   │   │   ├── VoltageChart.js
│   │   │   │   ├── CurrentChart.js
│   │   │   │   └── TemperatureChart.js
│   │   │   └── ErrorList.js
│   │   ├── services/
│   │   │   ├── api.js            # API client
│   │   │   └── auth.js           # Auth service
│   │   ├── context/
│   │   │   └── AuthContext.js    # Auth state
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── .env.example
├── docker-compose.yml (опціонально)
├── .gitignore
├── README.md
└── ARCHITECTURE.md (цей файл)
```

---

## Конфігурація типів пристроїв

### config/device-types.js

```javascript
export const deviceTypes = {
  UPS: {
    name: 'UPS System',
    fields: ['battery', 'output', 'temperature', 'efficiency'],
    statusLevels: ['ok', 'warning', 'error', 'critical'],
    defaultInterval: 30000,
    handler: 'UPSHandler'
  },
  GENERATOR: {
    name: 'Generator',
    fields: ['fuel_level', 'runtime', 'load'],
    statusLevels: ['ok', 'warning', 'error'],
    defaultInterval: 60000,
    handler: 'GeneratorHandler'
  }
  // Легко додавати нові типи
};
```

---

## Оптимізація та масштабованість

### Початок (1 пристрій)

- SQLite для простоти
- Мінімальна конфігурація
- Базові функції

### Розширення (10+ пристроїв)

- Міграція на PostgreSQL (за потреби)
- Кешування поточних станів
- Архівація старих даних
- Оптимізація запитів

### Архівація даних

- Детальні дані: останні 30-90 днів
- Годинні середні: останній рік
- Денні середні: 5+ років
- Автоматичне очищення (cron job)

---

## Моніторинг ресурсів

### Відстеження

- RAM використання (не більше 80%)
- Disk space (налаштувати алерти)
- CPU навантаження
- Розмір БД (щомісяця)

### Очікуване споживання

**Початок (1 пристрій):**
- RAM: 1-1.5 GB
- CPU: <10%
- Disk: <5 GB на рік

**Середній проект (10-20 пристроїв):**
- RAM: 2-3 GB
- CPU: 20-30%
- Disk: 10-20 GB на рік

---

## План розробки

### Фаза 1: Backend (базова функціональність)
1. Структура проекту
2. База даних (SQLite + міграції)
3. API endpoints (data, auth, devices)
4. Device handlers (UPS)
5. Аутентифікація

### Фаза 2: Frontend (базова функціональність)
1. Структура проекту
2. Аутентифікація (login/logout)
3. Dashboard (список пристроїв)
4. Детальна сторінка пристрою
5. Графіки

### Фаза 3: Покращення
1. Real-time оновлення (WebSocket)
2. Історія та фільтри
3. Експорт даних
4. Налаштування

### Фаза 4: Масштабування (майбутнє)
1. Підтримка нових типів пристроїв
2. Міграція на PostgreSQL (за потреби)
3. Оптимізація та архівація

---

## Environment Variables

### Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_TYPE=sqlite
DB_PATH=./data/ups_monitor.db
# Для PostgreSQL:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=ups_monitor
# DB_USER=ups_user
# DB_PASSWORD=ups_password

# Session
SESSION_SECRET=your-secret-key-change-this
SESSION_MAX_AGE=86400000

# API Key для пристроїв
DEVICE_API_KEY=your-device-api-key-change-this

# CORS
CORS_ORIGIN=http://localhost:3001
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
```

---

## Початкове налаштування

### Створення першого користувача

```bash
# Через скрипт
npm run create-user -- --username admin --password yourpassword

# Або через environment variables при ініціалізації
ADMIN_USERNAME=admin
ADMIN_PASSWORD=yourpassword
npm run init-db
```

---

## Ліцензія та підтримка

Ця архітектура розроблена для масштабованого моніторингу пристроїв з можливістю розширення на різні типи обладнання.
