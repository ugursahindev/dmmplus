# Kullanıcı Yönetimi API Dokümantasyonu

Bu dokümantasyon, DMM+ sistemindeki kullanıcı yönetimi API endpoint'lerini açıklamaktadır.

## Genel Bilgiler

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## Endpoint'ler

### 1. Tüm Kullanıcıları Listele

**GET** `/api/users`

Sadece ADMIN rolündeki kullanıcılar tüm kullanıcıları listeleyebilir.

#### Query Parametreleri

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `page` | number | Hayır | Sayfa numarası (varsayılan: 1) |
| `limit` | number | Hayır | Sayfa başına kayıt sayısı (varsayılan: 10) |
| `role` | string | Hayır | Rol filtresi (ADMIN, IDP_PERSONNEL, LEGAL_PERSONNEL, INSTITUTION_USER) |
| `active` | boolean | Hayır | Aktiflik durumu filtresi |
| `search` | string | Hayır | Arama terimi (kullanıcı adı, email, tam ad, kurum) |

#### Örnek İstek

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&role=ADMIN&active=true&search=admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Örnek Yanıt

```json
{
  "users": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "fullName": "Admin User",
      "role": "ADMIN",
      "institution": "DMM",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalUsers": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

### 2. Yeni Kullanıcı Oluştur

**POST** `/api/users`

Sadece ADMIN rolündeki kullanıcılar yeni kullanıcı oluşturabilir.

#### Request Body

```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "fullName": "string",
  "role": "ADMIN|IDP_PERSONNEL|LEGAL_PERSONNEL|INSTITUTION_USER",
  "institution": "string (opsiyonel)"
}
```

#### Örnek İstek

```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "email": "newuser@example.com",
    "fullName": "New User",
    "role": "IDP_PERSONNEL",
    "institution": "DMM"
  }'
```

#### Örnek Yanıt

```json
{
  "message": "Kullanıcı başarıyla oluşturuldu",
  "user": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "fullName": "New User",
    "role": "IDP_PERSONNEL",
    "institution": "DMM",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Belirli Kullanıcıyı Getir

**GET** `/api/users/{id}`

ADMIN rolündeki kullanıcılar herhangi bir kullanıcıyı, diğer kullanıcılar sadece kendi profilini görüntüleyebilir.

#### Örnek İstek

```bash
curl -X GET "http://localhost:3000/api/users/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Örnek Yanıt

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN",
    "institution": "DMM",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Kullanıcı Güncelle

**PUT** `/api/users/{id}`

ADMIN rolündeki kullanıcılar herhangi bir kullanıcıyı, diğer kullanıcılar sadece kendi profilini güncelleyebilir.

#### Request Body

```json
{
  "username": "string (opsiyonel)",
  "email": "string (opsiyonel)",
  "fullName": "string (opsiyonel)",
  "role": "string (opsiyonel, sadece ADMIN)",
  "institution": "string (opsiyonel)",
  "active": "boolean (opsiyonel)",
  "password": "string (opsiyonel)"
}
```

#### Örnek İstek

```bash
curl -X PUT "http://localhost:3000/api/users/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Admin User",
    "institution": "Updated DMM"
  }'
```

#### Örnek Yanıt

```json
{
  "message": "Kullanıcı başarıyla güncellendi",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Updated Admin User",
    "role": "ADMIN",
    "institution": "Updated DMM",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Kullanıcı Sil

**DELETE** `/api/users/{id}`

Sadece ADMIN rolündeki kullanıcılar kullanıcı silebilir. Kendini silmeye çalışırsa hata döner.

#### Örnek İstek

```bash
curl -X DELETE "http://localhost:3000/api/users/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Örnek Yanıt

```json
{
  "message": "Kullanıcı başarıyla silindi"
}
```

## Hata Kodları

| HTTP Kodu | Açıklama |
|-----------|----------|
| 200 | Başarılı |
| 201 | Oluşturuldu |
| 400 | Geçersiz istek |
| 401 | Yetkilendirme hatası |
| 403 | Yetki yetersiz |
| 404 | Bulunamadı |
| 500 | Sunucu hatası |

## Güvenlik Notları

1. **Token Doğrulama**: Tüm endpoint'ler JWT token doğrulaması gerektirir
2. **Rol Bazlı Erişim**: Sadece ADMIN rolündeki kullanıcılar tüm işlemleri yapabilir
3. **Şifre Güvenliği**: Şifreler bcrypt ile hash'lenir ve API yanıtlarında gönderilmez
4. **Benzersizlik Kontrolü**: Kullanıcı adı ve email benzersizliği kontrol edilir
5. **Kendi Hesabını Silme**: Kullanıcılar kendi hesaplarını silemez

## Kullanım Örnekleri

### JavaScript/TypeScript

```typescript
// Tüm kullanıcıları getir
const response = await fetch('/api/users?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Yeni kullanıcı oluştur
const newUser = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'newuser',
    password: 'password123',
    email: 'newuser@example.com',
    fullName: 'New User',
    role: 'IDP_PERSONNEL'
  })
});

// Kullanıcı güncelle
const updateUser = await fetch('/api/users/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'Updated Name'
  })
});
```

### cURL

```bash
# Login ve token al
TOKEN=$(curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Kullanıcıları listele
curl -X GET "http://localhost:3000/api/users" \
  -H "Authorization: Bearer $TOKEN"
``` 