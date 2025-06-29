#!/usr/bin/env python3
"""
DMM (Dezenformasyonla Mücadele Merkezi) Proje Raporu - Basitleştirilmiş Versiyon
"""

import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT

def create_pdf_report():
    """PDF rapor oluştur"""
    print("\n📄 DMM Proje Raporu oluşturuluyor...")
    
    # PDF ayarları
    doc = SimpleDocTemplate(
        "DMM_Proje_Raporu.pdf",
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18,
    )
    
    # Stil tanımlamaları
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER
    ))
    
    styles.add(ParagraphStyle(
        name='SectionTitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=20,
        spaceBefore=30
    ))
    
    styles.add(ParagraphStyle(
        name='SubSection',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#374151'),
        spaceAfter=12
    ))
    
    styles.add(ParagraphStyle(
        name='CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        alignment=TA_JUSTIFY,
        spaceAfter=12
    ))
    
    # İçerik
    story = []
    
    # Başlık sayfası
    story.append(Paragraph("DMM - Dezenformasyonla Mücadele Merkezi", styles['CustomTitle']))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("Proje Tanıtım ve Kullanım Raporu", styles['Title']))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(f"Tarih: {datetime.now().strftime('%d.%m.%Y')}", styles['Normal']))
    story.append(PageBreak())
    
    # İçindekiler
    story.append(Paragraph("İçindekiler", styles['SectionTitle']))
    toc_data = [
        ["1.", "Proje Özeti"],
        ["2.", "Sistem Mimarisi"],
        ["3.", "Kullanıcı Rolleri ve Yetkileri"],
        ["4.", "İş Akışı"],
        ["5.", "Modüller ve Özellikler"],
        ["6.", "Kullanıcı Arayüzleri"],
        ["7.", "Güvenlik"],
        ["8.", "Teknik Özellikler"],
        ["9.", "Sonuç ve Öneriler"],
    ]
    
    toc_table = Table(toc_data, colWidths=[1*inch, 5*inch])
    toc_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('LEADING', (0, 0), (-1, -1), 14),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(toc_table)
    story.append(PageBreak())
    
    # 1. Proje Özeti
    story.append(Paragraph("1. Proje Özeti", styles['SectionTitle']))
    story.append(Paragraph(
        "DMM (Dezenformasyonla Mücadele Merkezi), dijital ortamlarda yayılan yanlış bilgi, "
        "manipülasyon ve dezenformasyon içeriklerinin tespit edilmesi, incelenmesi ve ilgili "
        "kurumlara raporlanması amacıyla geliştirilmiş kapsamlı bir yönetim sistemidir.",
        styles['CustomBody']
    ))
    
    story.append(Paragraph(
        "Sistem, İletişim Başkanlığı bünyesinde faaliyet göstermek üzere tasarlanmış olup, "
        "dezenformasyon vakalarının sistematik bir şekilde takip edilmesini, hukuki değerlendirmeye "
        "tabi tutulmasını ve ilgili bakanlıklarla koordineli bir şekilde mücadele edilmesini sağlar.",
        styles['CustomBody']
    ))
    
    story.append(Paragraph("Temel Hedefler:", styles['SubSection']))
    objectives = [
        "• Dezenformasyon içeriklerinin hızlı tespiti ve kayıt altına alınması",
        "• Vakaların hukuki açıdan değerlendirilmesi",
        "• İlgili bakanlıklarla koordineli çalışma",
        "• Detaylı raporlama ve istatistik üretimi",
        "• Vatandaşların doğru bilgiye erişiminin sağlanması",
    ]
    for obj in objectives:
        story.append(Paragraph(obj, styles['CustomBody']))
    
    # 2. Sistem Mimarisi
    story.append(PageBreak())
    story.append(Paragraph("2. Sistem Mimarisi", styles['SectionTitle']))
    
    tech_data = [
        ["Teknoloji", "Açıklama"],
        ["Frontend", "Next.js 15.3.4 (App Router), TypeScript, NextUI, TailwindCSS"],
        ["Backend", "Next.js API Routes, Prisma ORM"],
        ["Veritabanı", "SQLite (Geliştirme), PostgreSQL (Prodüksiyon)"],
        ["Kimlik Doğrulama", "JWT (8 saatlik token süresi)"],
        ["Grafik/Rapor", "Recharts"],
        ["Güvenlik", "bcryptjs, RBAC (Role Based Access Control)"],
        ["Dosya Yönetimi", "Multer (dosya yükleme)"],
    ]
    
    tech_table = Table(tech_data, colWidths=[2*inch, 4*inch])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 0.3*inch))
    
    # 3. Kullanıcı Rolleri
    story.append(Paragraph("3. Kullanıcı Rolleri ve Yetkileri", styles['SectionTitle']))
    
    roles_data = [
        ["Rol", "Yetkiler", "Sorumluluklar"],
        ["Sistem Yöneticisi\n(Admin)", 
         "• Tüm modüllere erişim\n• Kullanıcı yönetimi\n• Sistem ayarları\n• Raporlama\n• Vaka yönetimi",
         "Sistem yönetimi, kullanıcı tanımlama, genel koordinasyon, sistem bakımı"],
        ["İDP Personeli", 
         "• Vaka oluşturma\n• Vaka düzenleme\n• İlk değerlendirme\n• Rapor hazırlama\n• İstatistik görüntüleme",
         "Dezenformasyon tespiti, ilk inceleme, vaka kayıt ve takibi, rapor üretimi"],
        ["Hukuk Personeli", 
         "• Hukuki inceleme\n• Onay/Red işlemleri\n• Hukuki görüş\n• Vaka görüntüleme",
         "Vakaların hukuki değerlendirmesi, yasal süreç önerileri, risk analizi"],
        ["Kurum Kullanıcısı", 
         "• Kendi kurumuna ait vakaları görüntüleme\n• Kurumsal yanıt verme\n• Düzeltici bilgi sağlama",
         "Bakanlık adına resmi yanıt, doğru bilgi paylaşımı, düzeltici aksiyonlar"],
    ]
    
    roles_table = Table(roles_data, colWidths=[1.5*inch, 2.5*inch, 2*inch])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f3f4f6')),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    story.append(roles_table)
    
    # 4. İş Akışı
    story.append(PageBreak())
    story.append(Paragraph("4. İş Akışı", styles['SectionTitle']))
    story.append(Paragraph("Dezenformasyon Mücadele Süreci", styles['SubSection']))
    
    workflow_data = [
        ["Aşama", "Sorumlu", "Açıklama", "Süre"],
        ["1. IDP Formu", "İDP Personeli", "Vaka tespiti ve ilk kayıt, dezenformasyon türü belirleme", "0-2 saat"],
        ["2. Hukuki İnceleme", "Hukuk Personeli", "Hukuki değerlendirme, risk analizi, yasal görüş", "2-4 saat"],
        ["3. Son Kontrol", "İDP Personeli", "Hukuki görüş sonrası kontrol ve onay", "1-2 saat"],
        ["4. Rapor Üretimi", "İDP Personeli", "İç ve dış rapor hazırlama, bakanlık belirleme", "2-3 saat"],
        ["5. Kurum Yanıtı", "Kurum Kullanıcısı", "İlgili bakanlığın resmi yanıtı ve düzeltici bilgi", "24-48 saat"],
        ["6. Tamamlandı", "Sistem", "Süreç tamamlanması ve arşivleme", "Otomatik"],
    ]
    
    workflow_table = Table(workflow_data, colWidths=[1.2*inch, 1.3*inch, 2.5*inch, 1*inch])
    workflow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdf4')),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    story.append(workflow_table)
    
    # 5. Modüller ve Özellikler
    story.append(PageBreak())
    story.append(Paragraph("5. Modüller ve Özellikler", styles['SectionTitle']))
    
    # Ana Panel (Dashboard)
    story.append(Paragraph("5.1. Ana Panel (Dashboard)", styles['SubSection']))
    story.append(Paragraph(
        "Kullanıcının rolüne göre özelleştirilmiş özet bilgileri gösterir:",
        styles['CustomBody']
    ))
    dashboard_features = [
        "• Toplam vaka sayısı ve durumları",
        "• Bekleyen işlemler",
        "• Son aktiviteler",
        "• Hızlı erişim butonları",
        "• Rol bazlı istatistikler",
    ]
    for feature in dashboard_features:
        story.append(Paragraph(feature, styles['CustomBody']))
    
    # Vaka Yönetimi
    story.append(Paragraph("5.2. Vaka Yönetimi", styles['SubSection']))
    story.append(Paragraph(
        "Dezenformasyon vakalarının yönetildiği ana modül:",
        styles['CustomBody']
    ))
    case_features = [
        "• Detaylı vaka formu (haber başlığı, kaynak, platform vb.)",
        "• Gelişmiş filtreleme (durum, öncelik, platform)",
        "• Vaka detay sayfası (tüm bilgiler, geçmiş, dosyalar)",
        "• Dosya yükleme (ekran görüntüsü, kanıt belgeleri)",
        "• Etiketleme sistemi",
        "• Otomatik vaka numarası üretimi (DMM-YYYYMMDD-XXX)",
    ]
    for feature in case_features:
        story.append(Paragraph(feature, styles['CustomBody']))
    
    # İstatistikler
    story.append(Paragraph("5.3. İstatistikler", styles['SubSection']))
    story.append(Paragraph(
        "Kapsamlı analiz ve raporlama modülü:",
        styles['CustomBody']
    ))
    stats_features = [
        "• Durum bazlı vaka dağılımı (pasta grafik)",
        "• Platform analizi (bar grafik)",
        "• Öncelik dağılımı",
        "• Günlük vaka trendi (alan grafiği)",
        "• Coğrafi kapsam analizi",
        "• En çok kullanılan etiketler",
        "• Bakanlık bazlı dağılım",
        "• Kullanıcı aktivite raporu",
    ]
    for feature in stats_features:
        story.append(Paragraph(feature, styles['CustomBody']))
    
    # 6. Kullanıcı Arayüzleri
    story.append(PageBreak())
    story.append(Paragraph("6. Kullanıcı Arayüzleri", styles['SectionTitle']))
    
    story.append(Paragraph("6.1. Giriş Ekranı", styles['SubSection']))
    story.append(Paragraph(
        "Modern ve güvenli giriş ekranı. Kullanıcı adı ve şifre ile giriş yapılır. "
        "JWT token ile 8 saatlik oturum süresi sağlanır.",
        styles['CustomBody']
    ))
    
    story.append(Paragraph("6.2. Yeni Vaka Formu", styles['SubSection']))
    story.append(Paragraph(
        "Detaylı vaka kayıt formu aşağıdaki alanları içerir:",
        styles['CustomBody']
    ))
    form_fields = [
        "• Rapor Başlığı Bilgileri (Konu, Sunulan Makam, Sunan Birim, Hazırlayan)",
        "• Haber Bilgileri (Başlık, Gazete/Yazar, Haber Linki)",
        "• Haber Özeti",
        "• Platform ve Öncelik Seçimi",
        "• Coğrafi Kapsam ve Kaynak Tipi",
        "• Bakanlık Bilgilendirme Metni",
        "• Dezenformasyon Türü Seçimi",
        "• Uzman Değerlendirme Notu",
        "• Hukuki Değerlendirme",
        "• DMM ve DMK için Öneriler",
        "• Dosya Yükleme (Çoklu dosya desteği)",
    ]
    for field in form_fields:
        story.append(Paragraph(field, styles['CustomBody']))
    
    story.append(Paragraph("6.3. Hukuki İnceleme Ekranı", styles['SubSection']))
    story.append(Paragraph(
        "Hukuk personelinin vakaları incelediği özel ekran. Bekleyen, onaylanan ve "
        "reddedilen vakaların istatistikleri gösterilir. Hukuki değerlendirme formu ile "
        "detaylı görüş yazılabilir.",
        styles['CustomBody']
    ))
    
    story.append(Paragraph("6.4. Kurum Yanıt Ekranı", styles['SubSection']))
    story.append(Paragraph(
        "Bakanlık kullanıcılarının kendi kurumlarına yönlendirilen vakaları görüntülediği "
        "ve yanıt verdiği ekran. Bekleyen vakalar için uyarı gösterilir.",
        styles['CustomBody']
    ))
    
    # 7. Güvenlik
    story.append(PageBreak())
    story.append(Paragraph("7. Güvenlik", styles['SectionTitle']))
    story.append(Paragraph(
        "Sistem güvenliği en üst düzeyde tutulmuş olup, aşağıdaki güvenlik önlemleri uygulanmıştır:",
        styles['CustomBody']
    ))
    
    security_features = [
        "• Şifreler bcryptjs ile 12 round hashlenme",
        "• JWT token tabanlı kimlik doğrulama",
        "• 8 saatlik token süresi ve otomatik yenileme",
        "• Rol bazlı yetkilendirme sistemi (RBAC)",
        "• API endpoint koruması",
        "• SQL injection koruması (Prisma ORM)",
        "• XSS koruması",
        "• CORS politikaları",
        "• Rate limiting (brute force koruması)",
        "• Güvenli dosya yükleme kontrolü",
        "• HTTPS zorunluluğu (production)",
        "• Hassas bilgilerin loglanmaması",
    ]
    
    for feature in security_features:
        story.append(Paragraph(feature, styles['CustomBody']))
    
    # 8. Teknik Özellikler
    story.append(Paragraph("8. Teknik Özellikler", styles['SectionTitle']))
    
    story.append(Paragraph("Veritabanı Şeması:", styles['SubSection']))
    db_info = [
        "• User: Kullanıcı bilgileri ve yetkileri",
        "• Case: Vaka detayları ve tüm alanlar",
        "• CaseFile: Yüklenen dosyalar",
        "• CaseHistory: Vaka değişiklik geçmişi",
    ]
    for info in db_info:
        story.append(Paragraph(info, styles['CustomBody']))
    
    story.append(Paragraph("API Endpoints:", styles['SubSection']))
    api_info = [
        "• /api/auth/* - Kimlik doğrulama işlemleri",
        "• /api/cases/* - Vaka CRUD işlemleri",
        "• /api/users/* - Kullanıcı yönetimi",
        "• /api/stats/* - İstatistik verileri",
    ]
    for info in api_info:
        story.append(Paragraph(info, styles['CustomBody']))
    
    # 9. Sonuç
    story.append(PageBreak())
    story.append(Paragraph("9. Sonuç ve Öneriler", styles['SectionTitle']))
    story.append(Paragraph(
        "DMM (Dezenformasyonla Mücadele Merkezi), Türkiye'nin dijital mecralarda artan "
        "dezenformasyon tehdidine karşı geliştirilmiş kapsamlı ve modern bir çözümdür. "
        "Sistem, İletişim Başkanlığı koordinasyonunda, ilgili tüm bakanlıkların katılımıyla "
        "dezenformasyonla etkin mücadele edilmesini sağlayacak altyapıyı sunmaktadır.",
        styles['CustomBody']
    ))
    
    story.append(Paragraph("Sistemin Avantajları:", styles['SubSection']))
    advantages = [
        "✓ Hızlı vaka tespiti ve kayıt",
        "✓ Sistematik takip ve yönetim",
        "✓ Bakanlıklar arası koordinasyon",
        "✓ Detaylı raporlama imkanı",
        "✓ Güvenli ve ölçeklenebilir altyapı",
        "✓ Kullanıcı dostu arayüz",
        "✓ Mobil uyumlu tasarım",
    ]
    for adv in advantages:
        story.append(Paragraph(adv, styles['CustomBody']))
    
    story.append(Paragraph("Gelecek Geliştirmeler:", styles['SubSection']))
    future = [
        "• Yapay zeka destekli otomatik dezenformasyon tespiti",
        "• Sosyal medya API entegrasyonları",
        "• Mobil uygulama geliştirme",
        "• Gelişmiş analitik ve tahmin modelleri",
        "• Vatandaş ihbar sistemi entegrasyonu",
        "• Uluslararası işbirliği modülü",
    ]
    for f in future:
        story.append(Paragraph(f, styles['CustomBody']))
    
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "Sistemin başarılı bir şekilde uygulanması durumunda, dezenformasyonla mücadelede "
        "önemli bir adım atılmış olacak ve vatandaşlarımızın doğru bilgiye erişimi "
        "güvence altına alınacaktır.",
        styles['CustomBody']
    ))
    
    # Demo Kullanıcılar
    story.append(PageBreak())
    story.append(Paragraph("Demo Kullanıcı Bilgileri", styles['SectionTitle']))
    
    demo_users_data = [
        ["Rol", "Kullanıcı Adı", "Şifre", "Açıklama"],
        ["Sistem Yöneticisi", "admin", "123456", "Tüm yetkiler"],
        ["İDP Personeli", "idp_user", "123456", "Vaka oluşturma ve yönetim"],
        ["Hukuk Personeli", "legal_user", "123456", "Hukuki inceleme"],
        ["Kurum Kullanıcısı", "kurum_user", "123456", "MEB temsilcisi"],
    ]
    
    demo_table = Table(demo_users_data, colWidths=[1.5*inch, 1.5*inch, 1*inch, 2*inch])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f9fafb')),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(demo_table)
    
    # PDF oluştur
    doc.build(story)
    print("✅ PDF rapor başarıyla oluşturuldu: DMM_Proje_Raporu.pdf")

def main():
    print("🚀 DMM Proje Raporu Oluşturucu (Basitleştirilmiş)")
    print("="*50)
    
    create_pdf_report()
    
    print("\n🎉 İşlem tamamlandı!")
    print("📄 DMM_Proje_Raporu.pdf dosyası oluşturuldu.")
    print("\n📌 Not: Bu rapor ekran görüntüleri içermemektedir.")
    print("   Detaylı ekran görüntüleri için sistemde demo yapılması önerilir.")

if __name__ == "__main__":
    main()