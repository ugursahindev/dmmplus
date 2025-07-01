# DMM Demo - Dezinformasyonla Mücadele Merkezi Demo Uygulaması

Bu proje, Dezinformasyonla Mücadele Merkezi (DMM) sisteminin demo versiyonudur. Tüm veriler local storage'da saklanır ve herhangi bir backend sunucusu gerektirmez.

## 🚀 Özellikler

- **Tamamen Frontend**: Backend API'si olmadan çalışır
- **Local Storage**: Tüm veriler tarayıcıda saklanır
- **Demo Veriler**: Gerçekçi demo vakalar ve kullanıcılar
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Modern UI**: NextUI ve Tailwind CSS ile modern arayüz

## 🛠️ Teknolojiler

- **Next.js 15** - React framework
- **TypeScript** - Tip güvenliği
- **NextUI** - Modern UI bileşenleri
- **Tailwind CSS** - Styling
- **Framer Motion** - Animasyonlar
- **React Hot Toast** - Bildirimler
- **Date-fns** - Tarih işlemleri

## 📦 Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd dmm-demo
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 👥 Demo Kullanıcılar

Sisteme giriş yapmak için aşağıdaki demo kullanıcıları kullanabilirsiniz:

| Kullanıcı Adı | Şifre | Rol | Erişim |
|---------------|-------|-----|--------|
| `admin` | `admin123` | Sistem Yöneticisi | Tüm modüller |
| `idp_user` | `idp123` | IDP Personeli | Vaka yönetimi, Dashboard |
| `legal_user` | `legal123` | Hukuk Personeli | Hukuk incelemesi |
| `institution_user` | `inst123` | Kurum Kullanıcısı | Kurum yanıtları |

## 🏗️ Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── cases/             # Vaka yönetimi sayfaları
│   ├── dashboard/         # Dashboard sayfası
│   ├── login/             # Giriş sayfası
│   ├── legal/             # Hukuk modülü
│   ├── institution/       # Kurum modülü
│   └── layout.tsx         # Ana layout
├── components/            # React bileşenleri
│   ├── layout/           # Layout bileşenleri
│   └── cases/            # Vaka bileşenleri
├── hooks/                # Custom React hooks
├── lib/                  # Yardımcı kütüphaneler
│   └── demo-data.ts      # Demo veri yönetimi
└── types/                # TypeScript tip tanımları
```

## 🔧 Demo Veri Yönetimi

Tüm veriler `src/lib/demo-data.ts` dosyasında yönetilir:

- **Demo Kullanıcılar**: Sistem kullanıcıları
- **Demo Vakalar**: Örnek dezenformasyon vakaları
- **Local Storage**: Verilerin tarayıcıda saklanması
- **Demo API**: Backend API'sini simüle eden fonksiyonlar

## 📊 Vaka Durumları

Sistemde vakalar aşağıdaki durumlardan geçer:

1. **IDP Formu** - İlk değerlendirme
2. **Hukuk İncelemesi** - Yasal değerlendirme
3. **Son Kontrol** - Final kontrol
4. **Rapor Üretimi** - Rapor hazırlama
5. **Kurum Bekleniyor** - Kurum yanıtı bekleniyor
6. **Tamamlandı** - Vaka tamamlandı

## 🎨 Özelleştirme

### Demo Verileri Değiştirme

`src/lib/demo-data.ts` dosyasında demo kullanıcıları ve vakaları değiştirebilirsiniz.

### Stil Değişiklikleri

- **Tailwind CSS**: `tailwind.config.js` dosyasında tema ayarları
- **NextUI**: `src/app/providers.tsx` dosyasında tema konfigürasyonu

## 🚀 Production Build

Production için build almak:

```bash
npm run build
npm start
```

## 📝 Notlar

- Bu bir demo uygulamasıdır, production kullanımı için backend entegrasyonu gerekir
- Tüm veriler local storage'da saklanır, tarayıcı verilerini temizlediğinizde sıfırlanır
- Demo verilerini sıfırlamak için Dashboard'daki "Demo Verilerini Sıfırla" butonunu kullanın

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.