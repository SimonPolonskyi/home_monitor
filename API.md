# UPS Monitor System - API Documentation

## Remote Server API

Система відправляє дані на віддалений сервер через HTTP POST запити.

### Endpoint

```
POST {REMOTE_SERVER_URL}
```

### Headers

```
Content-Type: application/json
X-API-Key: {REMOTE_SERVER_API_KEY}
```

---

## Формат даних

### 1. Звичайний запит (регулярні дані)

Відправляється кожні `DATA_SEND_INTERVAL_MS` (30 секунд за замовчуванням).

```json
{
  "device_id": "AA:BB:CC:DD:EE:FF" | "UPS-001",
  "timestamp": 1234567890,
  "status": "ok" | "warning" | "error" | "critical",
  "data_valid": true | false,
  
  "battery": {
    "voltage": 12.5,
    "current": 2.3,
    "power": 28.75,
    "valid": true
  },
  
  "output": {
    "voltage": 12.4,
    "current": 2.2,
    "power": 27.28,
    "valid": true
  },
  
  "temperature": 25.5,
  "temperature_valid": true,
  
  "efficiency": 94.9,
  "energy_consumed": 123.45,
  "energy_supplied": 117.12,
  
  "errors": {
    "total": 5,
    "critical": 0,
    "sensor": 2,
    "storage": 1,
    "network": 1,
    "system": 1,
    "display": 0,
    "healthy": true,
    "status": "Healthy"
  },
  
  "warnings": [
    "Battery sensor data invalid",
    "Output sensor data invalid"
  ]
}
```

**Поля:**
- `device_id` - Унікальний ідентифікатор пристрою (MAC адреса або кастомний ID)
- `timestamp` - Unix timestamp (мілісекунди)
- `status` - Статус системи: "ok", "warning", "error", "critical"
- `data_valid` - Чи валідні дані датчиків
- `battery` / `output` - Дані батареї та виходу (напруга, струм, потужність, валідність)
- `temperature` - Температура (°C)
- `efficiency` - Ефективність UPS (%)
- `energy_consumed` / `energy_supplied` - Енергія (Wh)
- `errors` - Статистика помилок (опціонально, якщо є помилки)
- `warnings` - Масив попереджень (опціонально, якщо є проблеми)

---

### 2. Запит помилки/попередження

Відправляється негайно при критичних помилках або нездоровому стані системи.

```json
{
  "type": "error",
  "device_id": "AA:BB:CC:DD:EE:FF" | "UPS-001",
  "timestamp": 1234567890,
  "severity": "critical" | "error" | "warning" | "info",
  "category": "sensor" | "storage" | "network" | "system" | "display",
  "message": "Too many critical errors - system restarting",
  
  "error_stats": {
    "total": 25,
    "critical": 5,
    "healthy": false,
    "status": "Critical: Too many critical errors"
  },
  
  "sensor_data": {
    "battery_valid": false,
    "output_valid": true,
    "temperature_valid": true,
    "data_valid": false
  }
}
```

**Поля:**
- `type` - Завжди "error" для запитів помилок
- `device_id` - Унікальний ідентифікатор пристрою (MAC адреса або кастомний ID)
- `severity` - Рівень серйозності: "critical", "error", "warning", "info"
- `category` - Категорія помилки
- `message` - Текст помилки
- `error_stats` - Поточна статистика помилок
- `sensor_data` - Опціональні дані датчиків на момент помилки

---

## Статуси системи

- **"ok"** - Все працює нормально
- **"warning"** - Є попередження (невалідні дані датчиків)
- **"error"** - Система нездорова (багато помилок)
- **"critical"** - Критичні помилки (можливий рестарт)

---

## Приклади відповідей сервера

Сервер повинен повертати HTTP статус коди:
- `200-299` - Успішно прийнято
- `400-499` - Помилка клієнта (буде повторна спроба)
- `500-599` - Помилка сервера (буде повторна спроба)

---

## Буферизація

Якщо WiFi недоступний або відправка не вдалася:
- Дані буферизуються локально (до `DATA_BUFFER_SIZE` записів)
- При відновленні з'єднання буферизовані дані відправляються автоматично
- Помилки не буферизуються (відправляються тільки при наявності з'єднання)

---

## Налаштування

В `src/config.h`:
```cpp
#define REMOTE_SERVER_URL "https://your-server.com/api/data"
#define REMOTE_SERVER_API_KEY "your_api_key"
#define DEVICE_ID ""  // Порожньо = використовувати MAC адресу, або встановити кастомний ID (напр. "UPS-001")
#define DATA_SEND_INTERVAL_MS 30000  // Інтервал відправки (мс)
#define DATA_SEND_RETRY_COUNT 3      // Кількість спроб
#define DATA_BUFFER_SIZE 100         // Розмір буфера
```

### Device ID

Ідентифікатор пристрою використовується для розрізнення даних від різних пристроїв на сервері.

**Варіанти:**
- **Порожньо (`""`)** - автоматично використовується MAC адреса ESP32 (формат: `AA:BB:CC:DD:EE:FF`)
- **Кастомний ID** - встановіть власний ідентифікатор, наприклад: `"UPS-001"`, `"UPS-Office"`, `"UPS-Basement"`

**Приклад:**
```cpp
#define DEVICE_ID "UPS-001"  // Кастомний ID
// або
#define DEVICE_ID ""  // Використати MAC адресу автоматично
```
