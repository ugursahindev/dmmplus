# Production Deployment Checklist

Bu doküman, DMM+ uygulamasının `https://testdmmplus.iletisim.gov.tr/` adresine deploy edilmesi için gerekli adımları içerir.

## 📋 Ön Hazırlık

### 1. Environment Variables Kontrolü

`.env` dosyasında aşağıdaki değişkenlerin doğru ayarlandığından emin olun:

```env
# Production Database Connection
DATABASE_URL="sqlserver://172.17.4.91:1433;database=TESTDMMPLUS;user=testDmmUser;password=9r5*oQiCHa;trustServerCertificate=true;encrypt=DANGER_PLAINTEXT"

# NextAuth Configuration - ÖNEMLİ: Production URL
NEXTAUTH_URL="https://testdmmplus.iletisim.gov.tr"
NEXTAUTH_SECRET="U7MYQLlh8Bb69NDx06dqUXkjEMgB288CExGkRELFpSs="

# Environment
NODE_ENV="production"

# API Base URL (boş = relative path kullanılır)
NEXT_PUBLIC_API_URL=""
```

**⚠️ ÖNEMLİ:** 
- `NEXTAUTH_URL` mutlaka production domain adresi olmalıdır
- `NEXTAUTH_SECRET` güçlü ve güvenli bir değer olmalıdır
- `.env` dosyası asla git'e commit edilmemelidir

### 2. Database Bağlantısı

- SQL Server bağlantısının çalıştığından emin olun
- Database migration'larının uygulandığından emin olun
- Seed data'nın yüklendiğinden emin olun (gerekirse)

### 3. Node.js Versiyonu

Production sunucusunda Node.js 18+ kurulu olmalıdır:

```bash
node --version  # v18.x.x veya üzeri olmalı
```

## 🏗️ Build Adımları

### 1. Bağımlılıkları Yükleyin

```bash
npm ci  # veya npm install
```

### 2. Prisma Client'ı Generate Edin

```bash
npm run db:generate
# veya
npx prisma generate
```

### 3. Production Build Oluşturun

```bash
npm run build
```

Build başarılı olduğunda `.next` klasörü oluşacaktır.

### 4. Build Çıktısını Kontrol Edin

Build sonrası şu klasörlerin oluştuğunu kontrol edin:
- `.next/` - Next.js build çıktısı
- `node_modules/` - Production dependencies

## 🚀 Deployment Adımları

### Sunucuya Dosyaları Yükleme

Production sunucusuna şu dosyaları/klasörleri yükleyin:

**Gerekli Dosyalar:**
- `.next/` (build çıktısı)
- `node_modules/` (production dependencies)
- `public/` (static dosyalar)
- `prisma/` (schema ve seed dosyaları)
- `src/` (kaynak kodlar - gerekirse)
- `package.json` ve `package-lock.json`
- `.env` (sunucuda oluşturulmalı, git'e commit edilmemeli)

**Opsiyonel Dosyalar:**
- `next.config.js`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`

### Sunucuda Environment Variables Ayarlama

Sunucuda `.env` dosyasını oluşturun ve production değerlerini girin:

```bash
# Sunucuda .env dosyası oluştur
nano .env
```

İçeriği yukarıdaki "Environment Variables Kontrolü" bölümündeki gibi doldurun.

### Sunucuda Uygulamayı Başlatma

#### PM2 ile (Önerilen)

```bash
# PM2 kurulumu (eğer yoksa)
npm install -g pm2

# Uygulamayı başlat
pm2 start npm --name "dmmplus" -- start

# PM2'yi sistem başlangıcında otomatik başlatmak için
pm2 startup
pm2 save
```

#### Node.js ile Doğrudan

```bash
npm start
```

#### Systemd Service ile (Linux)

`/etc/systemd/system/dmmplus.service` dosyası oluşturun:

```ini
[Unit]
Description=DMM+ Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/dmmplus
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Sonra:
```bash
sudo systemctl daemon-reload
sudo systemctl enable dmmplus
sudo systemctl start dmmplus
```

## 🔧 Nginx Reverse Proxy Yapılandırması

Eğer Nginx kullanıyorsanız, örnek yapılandırma:

```nginx
server {
    listen 80;
    server_name testdmmplus.iletisim.gov.tr;

    # HTTPS'e yönlendirme (SSL sertifikası kuruluysa)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name testdmmplus.iletisim.gov.tr;

    # SSL Sertifikaları
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # SSL Ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Proxy ayarları
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static dosyalar için cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

## ✅ Post-Deployment Kontrolleri

### 1. Uygulama Erişilebilirliği

```bash
# Tarayıcıdan kontrol edin
https://testdmmplus.iletisim.gov.tr/
```

### 2. API Endpoint'leri Test Edin

```bash
# Health check (eğer varsa)
curl https://testdmmplus.iletisim.gov.tr/api/health

# Login endpoint testi
curl -X POST https://testdmmplus.iletisim.gov.tr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### 3. Database Bağlantısı

- Login sayfasından giriş yapmayı deneyin
- Dashboard'un yüklendiğini kontrol edin
- Veritabanı sorgularının çalıştığını doğrulayın

### 4. Log Kontrolü

```bash
# PM2 logları
pm2 logs dmmplus

# Systemd logları
sudo journalctl -u dmmplus -f

# Node.js logları
tail -f /path/to/logs/app.log
```

## 🔒 Güvenlik Kontrolleri

- [ ] `.env` dosyası git'e commit edilmemiş
- [ ] `NEXTAUTH_SECRET` güçlü ve benzersiz
- [ ] HTTPS aktif ve çalışıyor
- [ ] SSL sertifikası geçerli
- [ ] Database şifreleri güvenli
- [ ] Firewall kuralları doğru yapılandırılmış
- [ ] Gereksiz portlar kapatılmış

## 📊 Monitoring ve Maintenance

### Log Monitoring

```bash
# PM2 ile
pm2 monit

# Log dosyalarını takip et
tail -f logs/*.log
```

### Performance Monitoring

- Sunucu kaynak kullanımını izleyin (CPU, RAM, Disk)
- Database connection pool'u kontrol edin
- API response time'ları izleyin

### Backup Stratejisi

- Database backup'ları düzenli alın
- `.env` dosyasının güvenli bir yerde backup'ı olsun
- Kod değişikliklerinden önce backup alın

## 🐛 Sorun Giderme

### Uygulama Başlamıyor

1. Logları kontrol edin: `pm2 logs` veya `journalctl -u dmmplus`
2. Port'un kullanılabilir olduğundan emin olun: `netstat -tulpn | grep 3000`
3. Environment variables'ları kontrol edin
4. Node.js versiyonunu kontrol edin

### Database Bağlantı Hatası

1. Database sunucusunun erişilebilir olduğundan emin olun
2. Firewall kurallarını kontrol edin
3. `DATABASE_URL` formatını kontrol edin
4. Database kullanıcı yetkilerini kontrol edin

### 500 Internal Server Error

1. Server loglarını kontrol edin
2. Environment variables'ları doğrulayın
3. Database migration'larının uygulandığından emin olun
4. Prisma client'ın generate edildiğinden emin olun

### NextAuth Hatası

1. `NEXTAUTH_URL` doğru mu kontrol edin
2. `NEXTAUTH_SECRET` ayarlı mı kontrol edin
3. Cookie ayarlarını kontrol edin (domain, secure, sameSite)

## 📝 Notlar

- Production'da `NODE_ENV=production` olmalıdır
- Development modunda çalıştırmayın (`npm run dev` yerine `npm start`)
- Build sonrası `.next` klasörünün oluştuğundan emin olun
- Static dosyalar `public/` klasöründen servis edilir
- Image optimization için `next.config.js`'de `unoptimized: true` ayarı var

## 🔄 Update/Deploy Süreci

Yeni bir deploy yaparken:

1. Kod değişikliklerini pull edin
2. `npm ci` ile dependencies güncelleyin
3. `npm run db:generate` ile Prisma client güncelleyin
4. `npm run build` ile yeni build oluşturun
5. PM2'yi restart edin: `pm2 restart dmmplus`
6. Logları kontrol edin: `pm2 logs dmmplus`

---

**Son Güncelleme:** 2025-01-XX
**Deploy URL:** https://testdmmplus.iletisim.gov.tr/

