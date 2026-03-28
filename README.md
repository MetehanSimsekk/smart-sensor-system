# 🏭 Akıllı Sensör Takip Sistemi

IoT sensörlerinden MQTT protokolü ile veri toplayan, gerçek zamanlı yayınlayan ve kullanıcı davranışlarını analiz eden bir backend servisi ve UI.

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Node.js + Express + TypeScript |
| Veritabanı | PostgreSQL + InfluxDB |
| Mesajlaşma | MQTT (Mosquitto Broker) |
| Gerçek Zamanlı | WebSocket (Socket.io) |
| Auth | JWT + API Key |
| Frontend | React + Vite + Recharts |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

## Kurulum

### Gereksinimler
- Docker Desktop
- Node.js 22+
- Git

### 1. Repoyu klonla
```bash
git clone https://github.com/MetehanSimsekk/smart-sensor-system.git
cd smart-sensor-system
```

### 2. Environment dosyasını oluştur
```bash
cp .env.example backend/.env
```
> Varsayılan değerler hazırdır, değiştirmenize gerek yok.

### 3. Docker ile başlat
```bash
docker compose up --build
```

### 4. Seed verilerini yükle
```bash
cd backend
npm run seed
```
> Veritabanına test kullanıcıları ve örnek şirket verisi oluşturur. İlk kurulumda bir kez çalıştırmanız yeterlidir.

### 5. Frontend'i başlat
```bash
cd frontend
npm install
npm run dev
```

### 6. Tarayıcıda aç
```
http://localhost:5173
```

## Test Kullanıcıları

| Rol | Email | Şifre |
|-----|-------|-------|
| System Admin | admin@patrion.com | Patrion2026 |
| Company Admin | company@patrion.com | Patrion2026 |
| User | user@patrion.com | Patrion2026 |



### Simülatör ile test 
```bash
npm run simulate:docker
```
> 3 farklı sensörden (temp_sensor_01, temp_sensor_02, temp_sensor_03) her 3 saniyede bir rastgele sıcaklık ve nem verisi üretir. Dashboard'da gerçek zamanlı grafik canlanır.

### Mosquitto CLI ile tek mesaj
```bash
docker exec -it sensor_mosquitto mosquitto_pub \
  -h localhost \
  -t sensors/temp_sensor_01 \
  -m '{"sensor_id":"temp_sensor_01","timestamp":1710772800,"temperature":25.4,"humidity":55.2}'
```

## API Endpoints

### Auth
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | /api/auth/login | Giriş yap | Public |
| GET | /api/auth/me | Profil bilgisi | JWT |
| POST | /api/auth/register | Kullanıcı oluştur | System Admin |
| POST | /api/auth/api-key | API Key oluştur | JWT |

### Sensörler
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | /api/sensors | Sensörleri listele 
| POST | /api/sensors | Sensör ekle | Admin |
| GET | /api/sensors/:id/data | Sensör verisi 
| DELETE | /api/sensors/:id | Sensör sil | System Admin |

### Kullanıcılar
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | /api/users | Kullanıcıları listele | Admin |
| PUT | /api/users/:id | Kullanıcı güncelle | Admin |
| DELETE | /api/users/:id | Kullanıcı sil | System Admin |

### Şirketler
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | /api/companies | Şirketleri listele | Admin |
| POST | /api/companies | Şirket ekle | System Admin |
| POST | /api/companies/:id/users | Kullanıcı ekle | Admin |
| GET | /api/companies/:id/users/:userId/sensors | Kullanıcı sensörleri | Admin |
| POST | /api/companies/:id/users/:userId/sensors | Sensör ata | Admin |

### Loglar
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | /api/logs | Logları listele | 
| POST | /api/logs | Log oluştur 
| GET | /api/logs/analytics | Log analitikleri | Admin |


##  Testleri Çalıştır
```bash
cd backend
npm test
```

## Docker Servisleri

| Servis | Port | Açıklama |
|--------|------|----------|
| Backend | 3000 | Node.js API |
| PostgreSQL | 5432 | Ana veritabanı |
| InfluxDB | 8086 | Zaman serisi DB |
| Mosquitto | 1883 | MQTT Broker |
| Frontend | 5173 | React UI |