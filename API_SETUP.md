# DMM+ API Kurulum Talimatları

Bu dokümanda Prisma veritabanı kullanarak oluşturulan login API'sinin nasıl kurulacağı ve kullanılacağı açıklanmaktadır.

## Gereksinimler

- Node.js 18+ 
- SQLite (varsayılan) veya PostgreSQL/MySQL
- npm veya yarn

## Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Veritabanını Hazırlayın

```bash
# Prisma client'ı generate edin
npx prisma generate

# Veritabanını oluşturun ve migration'ları çalıştırın
npx prisma db push

# Demo verileri yükleyin
npx prisma db seed
```

### 3. Environment Variables

`.env.local` dosyası oluşturun:

```env
# Veritabanı URL'i
DATABASE_URL="file:./dev.db"

# JWT Secret (production'da güçlü bir secret kullanın)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# API URL (opsiyonel)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4. Uygulamayı Başlatın

```bash
npm run dev
```

## API Endpoints

### POST /api/auth/login
Kullanıcı girişi yapar.

**Request Body:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@dmm.gov.tr",
    "fullName": "Sistem Yöneticisi",
    "role": "ADMIN",
    "active": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Giriş başarılı"
}
```

### POST /api/auth/logout
Kullanıcı çıkışı yapar.

**Headers:**
```
Authorization: Bearer <token>
```

### GET /api/auth/me
Mevcut kullanıcı bilgilerini getirir.

**Headers:**
```
Authorization: Bearer <token>
```

## Demo Kullanıcılar

Seed script'i ile oluşturulan demo kullanıcılar:

| Kullanıcı Adı | Şifre | Rol | Açıklama |
|---------------|-------|-----|----------|
| admin | 123456 | ADMIN | Sistem Yöneticisi |
| idp_user | 123456 | IDP_PERSONNEL | İnceleme Değerlendirme Personeli |
| legal_user | 123456 | LEGAL_PERSONNEL | Hukuk Müşaviri |
| kurum_user | 123456 | INSTITUTION_USER | MEB Temsilcisi |

## Güvenlik Özellikleri

- Şifreler bcrypt ile hash'lenir
- JWT token'lar 24 saat geçerlidir
- Session tablosu ile token takibi (opsiyonel)
- Role-based access control
- Input validation

## Veritabanı Şeması

Ana tablolar:
- `User`: Kullanıcı bilgileri
- `Session`: Aktif oturumlar (opsiyonel)
- `Case`: Vaka kayıtları
- `Task`: Görev kayıtları
- `Message`: Mesajlaşma sistemi

## Sorun Giderme

### Prisma Client Hatası
```bash
npx prisma generate
```

### Veritabanı Sıfırlama
```bash
npx prisma db push --force-reset
npx prisma db seed
```

### JWT Token Hatası
Environment variable'da JWT_SECRET'ın doğru ayarlandığından emin olun.

## Production Deployment

1. Güçlü bir JWT_SECRET kullanın
2. HTTPS kullanın
3. Rate limiting ekleyin
4. CORS ayarlarını yapılandırın
5. Logging ekleyin
6. Error handling'i geliştirin 