# DMM - AI Entegrasyonu Kullanım Kılavuzu

## 🤖 Eklenen AI Özellikleri

### 1. **Otomatik Özet Oluşturma**
- **Nerede:** Yeni vaka oluşturma formunda
- **Nasıl Kullanılır:** 
  - Haber metnini girdikten sonra "Otomatik Özet Oluştur" butonuna tıklayın
  - AI, metni analiz edip 2-3 cümlelik özet oluşturur
  - OpenAI API key yoksa basit algoritma ile özet oluşturur

### 2. **Akıllı Etiket Önerisi**
- **Nerede:** Yeni vaka oluşturma formunda
- **Nasıl Kullanılır:**
  - Başlık ve açıklama girdikten sonra "Etiket Öner" butonuna tıklayın
  - AI, içeriğe uygun 5-6 etiket önerir
  - Önerilen etiketler otomatik olarak eklenir

### 3. **Risk Skoru Hesaplama**
- **Nerede:** Yeni vaka oluşturma formunda
- **Nasıl Kullanılır:**
  - Form bilgilerini doldurduktan sonra "Risk Skoru Hesapla" butonuna tıklayın
  - Sistem 5 faktörü değerlendirir:
    - Platform riski
    - İçerik tipi riski
    - Coğrafi kapsam riski
    - Yayılma riski
    - Hukuki risk
  - 1-10 arası skor ve öneri sunar

### 4. **Karanlık Mod**
- **Nerede:** Sol menünün altında
- **Nasıl Kullanılır:**
  - Güneş/Ay ikonuna tıklayarak tema değiştirin
  - Tercih otomatik olarak kaydedilir

## 🔧 Kurulum ve Yapılandırma

### OpenAI API Entegrasyonu (Opsiyonel)

1. `.env.local` dosyasına API anahtarınızı ekleyin:
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

2. API anahtarı yoksa sistem otomatik olarak basit algoritmaları kullanır

### API Endpoints

- **POST /api/ai/summarize** - Metin özetleme
- **POST /api/ai/suggest-tags** - Etiket önerisi
- **POST /api/ai/risk-score** - Risk skoru hesaplama

## 💰 Maliyet Bilgisi

OpenAI API kullanıyorsanız:
- GPT-3.5-turbo modeli kullanılıyor (ekonomik)
- Ortalama maliyet: ~$0.001 per istek
- Aylık 1000 istek ≈ $1-2

## 🚀 Kullanım Örnekleri

### Örnek 1: Sahte Video Vakası
```javascript
// Form verisi
{
  title: "Sağlık Bakanı Sahte Açıklama Videosu",
  description: "Deepfake video tespit edildi...",
  platform: "YOUTUBE"
}

// AI Yanıtları:
// Özet: "Sağlık Bakanı'na ait olduğu iddia edilen sahte video sosyal medyada yayılıyor."
// Etiketler: ["deepfake", "sahte-video", "sağlık", "yanıltıcı", "sosyal-medya"]
// Risk Skoru: 9/10 (CRITICAL)
```

### Örnek 2: Yanlış İstatistik
```javascript
// Form verisi
{
  title: "Enflasyon Rakamları Manipülasyonu",
  description: "Resmi olmayan kaynaklardan yanlış veriler...",
  platform: "TWITTER"
}

// AI Yanıtları:
// Özet: "Twitter'da yanlış enflasyon rakamları paylaşılıyor."
// Etiketler: ["ekonomi", "enflasyon", "yanlış-bilgi", "istatistik"]
// Risk Skoru: 7/10 (HIGH)
```

## 🛠️ Sorun Giderme

### "Özet oluşturulamadı" hatası
- OpenAI API key'i kontrol edin
- İnternet bağlantınızı kontrol edin
- Metin en az 50 karakter olmalı

### Etiketler görünmüyor
- Başlık ve açıklama alanları dolu olmalı
- Türkçe karakter sorunu olabilir, sayfayı yenileyin

### Risk skoru hesaplanamıyor
- Tüm zorunlu alanlar dolu olmalı (platform, öncelik, coğrafi kapsam)

## 📈 Gelecek Geliştirmeler

1. **Benzer Vaka Tespiti** - Mükerrer kayıtları önleme
2. **Otomatik Kategorizasyon** - Vaka tipini otomatik belirleme
3. **Trend Analizi** - Benzer vakaların artış trendini tespit
4. **Çoklu Dil Desteği** - İngilizce içerikler için de analiz

## 📞 Destek

Sorunlar için:
- GitHub Issues: [github.com/yourrepo/dmm/issues]
- Email: destek@dmm.gov.tr

---

**Not:** AI özellikleri tamamen opsiyoneldir. Sistem, AI olmadan da tam fonksiyonel çalışmaya devam eder.