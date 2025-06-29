# DMM - Dezinformasyonla Mücadele Merkezi

DMM, dezenformasyon vakalarının sistematik olarak takip edildiği, 4 farklı kullanıcı tipinin belirli roller ve sorumluluklar çerçevesinde çalıştığı tam otomatik bir iş akışı sistemidir.

## 🚀 Hızlı Başlangıç

1. **Projeyi başlatın:**
```bash
npm run dev
```

2. **Veritabanını başlatın (yeni terminal):**
```bash
npm run init-db
```

3. **Sisteme giriş yapın:**
   - URL: http://localhost:3000
   - Demo kullanıcılardan birini kullanın

## 👥 Demo Kullanıcılar

| Rol | Kullanıcı Adı | Şifre | Yetkiler |
|-----|---------------|-------|----------|
| Admin | admin | 123456 | Tüm sistem yönetimi |
| IDP Personeli | idp_user | 123456 | Vaka oluşturma, düzenleme, rapor üretimi |
| Hukuk Personeli | legal_user | 123456 | Hukuki inceleme ve değerlendirme |
| Kurum Sorumlusu | kurum_user | 123456 | Kurum yanıtları ve düzeltici bilgi |

## 🔄 İş Akışı Aşamaları

1. **IDP Formu** → Vaka oluşturma ve ilk değerlendirme
2. **Hukuk İncelemesi** → Hukuki açıdan değerlendirme
3. **Son Kontrol** → Final değişiklikleri ve onay
4. **Rapor Üretimi** → İç ve dış rapor hazırlama
5. **Kurum Bekleniyor** → Bakanlık/kurum yanıtı
6. **Tamamlandı** → Vaka kapatma

## 🛠 Teknoloji Stack

- **Frontend:** Next.js 14, TypeScript, NextUI, TailwindCSS
- **Backend:** Next.js API Routes, Sequelize ORM
- **Database:** SQLite
- **Authentication:** JWT
- **File Upload:** Multer

## 📊 Özellikler

- ✅ Role-based access control (RBAC)
- ✅ Gerçek zamanlı istatistikler
- ✅ Gelişmiş filtreleme ve arama
- ✅ Dosya yükleme sistemi
- ✅ Vaka geçmişi takibi
- ✅ Otomatik vaka numarası üretimi
- ✅ Responsive tasarım

## 📁 Proje Yapısı

```
dmm+/
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── lib/          # Database and auth utilities
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Helper functions
├── public/           # Static files
└── dmm.db           # SQLite database
```

## 🔐 Güvenlik

- JWT token authentication (8 saat geçerlilik)
- Bcrypt password hashing
- Role-based route protection
- SQL injection koruması

## 💡 Kullanım İpuçları

1. Veritabanını sıfırlamak için Dashboard'da sağ üstteki "Veritabanını Sıfırla" linkine tıklayın
2. Her kullanıcı tipi sadece yetkili olduğu sayfaları görebilir
3. Vaka durumları otomatik olarak iş akışına göre ilerler

## 🚦 Durum Renkleri

- **Gri:** IDP Formu (Başlangıç)
- **Mavi:** Hukuk İncelemesi
- **Mor:** Son Kontrol
- **Sarı:** Rapor Üretimi / Kurum Bekleniyor
- **Yeşil:** Tamamlandı

## 📝 Lisans

Bu proje DMM tarafından geliştirilmiştir.