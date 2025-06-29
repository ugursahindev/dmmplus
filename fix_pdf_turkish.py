#!/usr/bin/env python3
"""
PDF Türkçe karakter düzeltme scripti
"""

import os
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

def setup_turkish_fonts():
    """Türkçe font ayarlarını yap"""
    try:
        # Sistem fontlarını kullan
        font_paths = [
            # macOS
            '/System/Library/Fonts/Helvetica.ttc',
            '/Library/Fonts/Arial Unicode.ttf',
            '/System/Library/Fonts/Supplemental/Arial.ttf',
            # Linux
            '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            # Windows
            'C:/Windows/Fonts/arial.ttf',
        ]
        
        font_registered = False
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    pdfmetrics.registerFont(TTFont('CustomFont', font_path))
                    font_registered = True
                    print(f"✓ Font yüklendi: {font_path}")
                    break
                except:
                    continue
        
        if not font_registered:
            print("⚠️ Türkçe destekli font bulunamadı, varsayılan font kullanılacak")
            
    except Exception as e:
        print(f"Font yükleme hatası: {e}")

def create_fixed_pdf_report():
    """Türkçe karakterleri düzeltilmiş PDF rapor oluştur"""
    print("\n📄 Türkçe düzeltilmiş PDF rapor oluşturuluyor...")
    
    setup_turkish_fonts()
    
    # PDF ayarları
    doc = SimpleDocTemplate(
        "DMM_Proje_Raporu_TR.pdf",
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18,
    )
    
    # Stil tanımlamaları
    styles = getSampleStyleSheet()
    
    # Türkçe destekli fontları kullan
    for style in styles.byName.values():
        if hasattr(style, 'fontName'):
            if 'CustomFont' in pdfmetrics.getRegisteredFontNames():
                style.fontName = 'CustomFont'
    
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='CustomFont' if 'CustomFont' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='SectionTitle',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=20,
        spaceBefore=30,
        fontName='CustomFont' if 'CustomFont' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='SubSection',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#374151'),
        spaceAfter=12,
        fontName='CustomFont' if 'CustomFont' in pdfmetrics.getRegisteredFontNames() else 'Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        fontName='CustomFont' if 'CustomFont' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
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
        ["5.", "Kullanıcı Arayüzleri"],
        ["", "5.1. Sistem Yöneticisi"],
        ["", "5.2. İDP Personeli"],
        ["", "5.3. Hukuk Personeli"],
        ["", "5.4. Kurum Kullanıcısı"],
        ["6.", "Özellikler"],
        ["7.", "Güvenlik"],
        ["8.", "Sonuç"],
    ]
    
    # Font ayarı ile tablo oluştur
    toc_table = Table(toc_data, colWidths=[1*inch, 5*inch])
    table_font = 'CustomFont' if 'CustomFont' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
    toc_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), table_font),
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
    
    # 2. Sistem Mimarisi
    story.append(Paragraph("2. Sistem Mimarisi", styles['SectionTitle']))
    
    tech_data = [
        ["Teknoloji", "Açıklama"],
        ["Frontend", "Next.js 15.3.4 (App Router), TypeScript, NextUI, TailwindCSS"],
        ["Backend", "Next.js API Routes, Prisma ORM"],
        ["Veritabanı", "SQLite (Geliştirme), PostgreSQL (Prodüksiyon)"],
        ["Kimlik Doğrulama", "JWT (8 saatlik token süresi)"],
        ["Grafik/Rapor", "Recharts"],
        ["Güvenlik", "bcryptjs, RBAC (Role Based Access Control)"],
    ]
    
    tech_table = Table(tech_data, colWidths=[2*inch, 4*inch])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), table_font),
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
        ["Sistem Yöneticisi", 
         "• Tüm modüllere erişim\n• Kullanıcı yönetimi\n• Sistem ayarları\n• Raporlama",
         "Sistem yönetimi, kullanıcı tanımlama, genel koordinasyon"],
        ["İDP Personeli", 
         "• Vaka oluşturma\n• Vaka düzenleme\n• İlk değerlendirme\n• Rapor hazırlama",
         "Dezenformasyon tespiti, ilk inceleme, vaka kayıt ve takibi"],
        ["Hukuk Personeli", 
         "• Hukuki inceleme\n• Onay/Red işlemleri\n• Hukuki görüş",
         "Vakaların hukuki değerlendirmesi, yasal süreç önerileri"],
        ["Kurum Kullanıcısı", 
         "• Kendi kurumuna ait vakaları görüntüleme\n• Kurumsal yanıt verme",
         "Bakanlık adına resmi yanıt ve düzeltici bilgi sağlama"],
    ]
    
    roles_table = Table(roles_data, colWidths=[1.5*inch, 2.5*inch, 2*inch])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), table_font),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f3f4f6')),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    story.append(roles_table)
    story.append(PageBreak())
    
    # 4. İş Akışı
    story.append(Paragraph("4. İş Akışı", styles['SectionTitle']))
    story.append(Paragraph("Dezenformasyon Mücadele Süreci", styles['SubSection']))
    
    workflow_data = [
        ["Aşama", "Sorumlu", "Açıklama"],
        ["1. IDP Formu", "İDP Personeli", "Vaka tespiti ve ilk kayıt"],
        ["2. Hukuki İnceleme", "Hukuk Personeli", "Hukuki değerlendirme ve görüş"],
        ["3. Son Kontrol", "İDP Personeli", "Hukuki görüş sonrası kontrol"],
        ["4. Rapor Üretimi", "İDP Personeli", "İç ve dış rapor hazırlama"],
        ["5. Kurum Yanıtı", "Kurum Kullanıcısı", "İlgili bakanlık yanıtı"],
        ["6. Tamamlandı", "Sistem", "Süreç tamamlanması"],
    ]
    
    workflow_table = Table(workflow_data, colWidths=[1.5*inch, 1.5*inch, 3*inch])
    workflow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10b981')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), table_font),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdf4')),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(workflow_table)
    story.append(Spacer(1, 0.3*inch))
    
    # 5. Kullanıcı Arayüzleri
    story.append(PageBreak())
    story.append(Paragraph("5. Kullanıcı Arayüzleri", styles['SectionTitle']))
    
    # Her kullanıcı tipi için
    users = [
        ("admin", "Sistem Yöneticisi", [
            ("Giriş Ekranı", "admin_01_login.png"),
            ("Ana Panel", "admin_02_dashboard.png"),
            ("Vaka Yönetimi", "admin_03_cases_list.png"),
            ("İstatistikler", "admin_04_statistics.png"),
            ("Kullanıcı Yönetimi", "admin_05_users.png"),
            ("Sistem Ayarları", "admin_06_settings.png"),
        ]),
        ("idp", "İDP Personeli", [
            ("Giriş Ekranı", "idp_01_login.png"),
            ("Ana Panel", "idp_02_dashboard.png"),
            ("Vaka Listesi", "idp_03_cases_list.png"),
            ("Yeni Vaka Formu", "idp_04_new_case_form.png"),
            ("Vaka Detayı", "idp_05_case_detail.png"),
            ("İstatistikler", "idp_06_statistics.png"),
        ]),
        ("legal", "Hukuk Personeli", [
            ("Giriş Ekranı", "legal_01_login.png"),
            ("Ana Panel", "legal_02_dashboard.png"),
            ("Hukuki İncelemeler", "legal_03_legal_review_list.png"),
            ("Vaka Detayı", "legal_04_case_detail.png"),
            ("İşlem Sekmesi", "legal_05_case_actions.png"),
        ]),
        ("institution", "Kurum Kullanıcısı", [
            ("Giriş Ekranı", "institution_01_login.png"),
            ("Ana Panel", "institution_02_dashboard.png"),
            ("Kurum Vakaları", "institution_03_institution_cases.png"),
            ("Vaka Detayı", "institution_04_case_detail.png"),
            ("Yanıt Formu", "institution_05_response_form.png"),
        ]),
    ]
    
    for user_code, user_title, screenshots in users:
        story.append(Paragraph(f"5.{users.index((user_code, user_title, screenshots))+1}. {user_title}", styles['SubSection']))
        
        for title, filename in screenshots:
            story.append(Paragraph(title, styles['Normal']))
            if os.path.exists(f"screenshots/{filename}"):
                img = RLImage(f"screenshots/{filename}", width=5*inch, height=3*inch)
                story.append(img)
            story.append(Spacer(1, 0.2*inch))
        
        story.append(PageBreak())
    
    # 6. Özellikler
    story.append(Paragraph("6. Özellikler", styles['SectionTitle']))
    
    features = [
        "✓ Gerçek zamanlı vaka takibi ve yönetimi",
        "✓ Rol bazlı erişim kontrolü (RBAC)",
        "✓ Kapsamlı iş akışı yönetimi (6 aşamalı)",
        "✓ Detaylı raporlama ve istatistikler",
        "✓ Dosya yükleme ve kanıt yönetimi",
        "✓ Bakanlıklarla entegre çalışma",
        "✓ Güvenli kimlik doğrulama (JWT)",
        "✓ Responsive ve modern arayüz",
        "✓ Vaka geçmişi ve değişiklik takibi",
        "✓ Otomatik vaka numarası üretimi",
    ]
    
    for feature in features:
        story.append(Paragraph(feature, styles['CustomBody']))
    
    # 7. Güvenlik
    story.append(Paragraph("7. Güvenlik", styles['SectionTitle']))
    story.append(Paragraph(
        "Sistem güvenliği en üst düzeyde tutulmuş olup, aşağıdaki güvenlik önlemleri uygulanmıştır:",
        styles['CustomBody']
    ))
    
    security_features = [
        "• Şifreler bcryptjs ile 12 round hashlenme",
        "• JWT token tabanlı kimlik doğrulama",
        "• 8 saatlik token süresi",
        "• Rol bazlı yetkilendirme sistemi",
        "• API endpoint koruması",
        "• SQL injection koruması (Prisma ORM)",
        "• XSS koruması",
        "• HTTPS zorunluluğu (production)",
    ]
    
    for feature in security_features:
        story.append(Paragraph(feature, styles['CustomBody']))
    
    # 8. Sonuç
    story.append(PageBreak())
    story.append(Paragraph("8. Sonuç", styles['SectionTitle']))
    story.append(Paragraph(
        "DMM (Dezenformasyonla Mücadele Merkezi), Türkiye'nin dijital mecralarda artan "
        "dezenformasyon tehdidine karşı geliştirilmiş kapsamlı ve modern bir çözümdür. "
        "Sistem, İletişim Başkanlığı koordinasyonunda, ilgili tüm bakanlıkların katılımıyla "
        "dezenformasyonla etkin mücadele edilmesini sağlayacak altyapıyı sunmaktadır.",
        styles['CustomBody']
    ))
    
    story.append(Paragraph(
        "Proje, modern web teknolojileri kullanılarak geliştirilmiş olup, ölçeklenebilir, "
        "güvenli ve kullanıcı dostu bir yapıya sahiptir. Role dayalı yetkilendirme sistemi "
        "sayesinde, her kullanıcı grubu sadece kendi sorumluluk alanındaki işlemleri "
        "gerçekleştirebilmekte, bu da hem güvenliği hem de verimliliği artırmaktadır.",
        styles['CustomBody']
    ))
    
    story.append(Paragraph(
        "Sistemin başarılı bir şekilde uygulanması durumunda, dezenformasyonla mücadelede "
        "önemli bir adım atılmış olacak ve vatandaşlarımızın doğru bilgiye erişimi "
        "güvence altına alınacaktır.",
        styles['CustomBody']
    ))
    
    # PDF oluştur
    doc.build(story)
    print("✅ Türkçe düzeltilmiş PDF rapor oluşturuldu: DMM_Proje_Raporu_TR.pdf")

def main():
    create_fixed_pdf_report()

if __name__ == "__main__":
    main()