#!/usr/bin/env python3
"""
DMM (Dezenformasyonla Mücadele Merkezi) Proje Raporu Oluşturucu
Bu script, projenin ekran görüntülerini alır ve detaylı bir PDF rapor oluşturur.
"""

import os
import time
import json
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Selenium driver ayarları
def setup_driver():
    try:
        # Chrome'u dene
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium.webdriver.chrome.service import Service
        
        options = webdriver.ChromeOptions()
        options.add_argument('--window-size=1920,1080')
        # options.add_argument('--headless')  # Başsız mod kapalı
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        
        # Chrome binary yolunu belirt
        chrome_paths = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chrome.app/Contents/MacOS/Chrome',
            '/usr/bin/google-chrome',
            '/usr/local/bin/google-chrome'
        ]
        
        for path in chrome_paths:
            if os.path.exists(path):
                options.binary_location = path
                break
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        return driver
    except Exception as e:
        print(f"Chrome kullanılamadı, Safari deneniyor... Hata: {e}")
        # Safari'yi dene
        driver = webdriver.Safari()
        driver.set_window_size(1920, 1080)
        return driver

# Ekran görüntüsü alma fonksiyonu
def take_screenshot(driver, filename, element_selector=None):
    time.sleep(2)  # Sayfanın yüklenmesi için bekle
    
    if element_selector:
        element = driver.find_element(By.CSS_SELECTOR, element_selector)
        element.screenshot(f"screenshots/{filename}")
    else:
        driver.save_screenshot(f"screenshots/{filename}")
    
    # Görüntüyü optimize et
    img = Image.open(f"screenshots/{filename}")
    img.thumbnail((1200, 800), Image.Resampling.LANCZOS)
    img.save(f"screenshots/{filename}", "PNG", optimize=True)
    
    print(f"✓ {filename} kaydedildi")

# Login fonksiyonu
def login(driver, username, password):
    driver.get("http://localhost:3000/login")
    time.sleep(3)  # Sayfanın tam yüklenmesi için daha fazla bekle
    
    try:
        # NextUI Input components render with specific structure
        # Wait for elements to be present
        wait = WebDriverWait(driver, 10)
        
        # Find all input elements on the page
        inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"Toplam {len(inputs)} input bulundu")
        
        # First input should be username, second should be password
        if len(inputs) >= 2:
            username_input = inputs[0]
            password_input = inputs[1]
        else:
            # Fallback to placeholder search
            username_input = wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Kullanıcı adınızı girin']"))
            )
            password_input = wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Şifrenizi girin']"))
            )
        
        # Alanları temizle ve değerleri gir
        username_input.clear()
        username_input.send_keys(username)
        
        password_input.clear()
        password_input.send_keys(password)
        
        # Giriş yap butonuna tıkla - farklı yöntemler dene
        try:
            login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Giriş Yap')]")
        except:
            try:
                login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
            except:
                # Form submit et
                password_input.send_keys(Keys.RETURN)
                time.sleep(3)
                return
        
        login_button.click()
        time.sleep(3)
        
        # Login başarılı mı kontrol et
        if "dashboard" in driver.current_url.lower():
            print(f"✓ {username} kullanıcısı başarıyla giriş yaptı")
        
    except Exception as e:
        print(f"❌ Login hatası: {e}")
        # Sayfanın HTML'ini debug için yazdır
        print("Sayfa HTML'i (ilk 500 karakter):")
        print(driver.page_source[:500])

# Her kullanıcı için ekran görüntüleri al
def capture_user_flow(driver, user_type, username, password):
    print(f"\n{'='*50}")
    print(f"{user_type} kullanıcısı için ekran görüntüleri alınıyor...")
    print(f"{'='*50}")
    
    # Login sayfası
    driver.get("http://localhost:3000/login")
    time.sleep(2)
    take_screenshot(driver, f"{user_type}_01_login.png")
    
    # Giriş yap
    login(driver, username, password)
    
    # Login başarılı mı kontrol et
    if "login" in driver.current_url:
        print(f"⚠️  {user_type} kullanıcısı giriş yapamadı, devam ediliyor...")
        return
    
    # Dashboard
    take_screenshot(driver, f"{user_type}_02_dashboard.png")
    
    if user_type == "admin":
        # Admin akışı
        # Vakalar sayfası
        driver.get("http://localhost:3000/cases")
        take_screenshot(driver, f"{user_type}_03_cases_list.png")
        
        # İstatistikler
        driver.get("http://localhost:3000/stats")
        time.sleep(3)  # Grafiklerin yüklenmesi için bekle
        take_screenshot(driver, f"{user_type}_04_statistics.png")
        
        # Kullanıcı yönetimi
        driver.get("http://localhost:3000/users")
        take_screenshot(driver, f"{user_type}_05_users.png")
        
        # Ayarlar
        driver.get("http://localhost:3000/settings")
        take_screenshot(driver, f"{user_type}_06_settings.png")
        
    elif user_type == "idp":
        # IDP Personeli akışı
        # Vakalar listesi
        driver.get("http://localhost:3000/cases")
        take_screenshot(driver, f"{user_type}_03_cases_list.png")
        
        # Yeni vaka oluştur
        driver.get("http://localhost:3000/cases/new")
        time.sleep(2)
        # Formu biraz kaydır
        driver.execute_script("window.scrollTo(0, 500)")
        take_screenshot(driver, f"{user_type}_04_new_case_form.png")
        
        # Vaka detayı
        driver.get("http://localhost:3000/cases/5")
        take_screenshot(driver, f"{user_type}_05_case_detail.png")
        
        # İstatistikler
        driver.get("http://localhost:3000/stats")
        time.sleep(3)
        take_screenshot(driver, f"{user_type}_06_statistics.png")
        
    elif user_type == "legal":
        # Hukuk Personeli akışı
        # Hukuki incelemeler
        driver.get("http://localhost:3000/legal")
        take_screenshot(driver, f"{user_type}_03_legal_review_list.png")
        
        # Vaka detayı - Hukuki değerlendirme
        driver.get("http://localhost:3000/cases/5")
        take_screenshot(driver, f"{user_type}_04_case_detail.png")
        
        # İşlemler sekmesi
        try:
            # Try different ways to find the actions button
            actions_button = None
            try:
                actions_button = driver.find_element(By.XPATH, "//button[contains(text(), 'İşlemler')]")
            except:
                try:
                    # Try with partial text
                    actions_button = driver.find_element(By.XPATH, "//button[contains(., 'İşlem')]")
                except:
                    # Skip if actions button not found
                    print("İşlemler butonu bulunamadı, atlanıyor...")
            
            if actions_button:
                actions_button.click()
                time.sleep(1)
                take_screenshot(driver, f"{user_type}_05_case_actions.png")
        except Exception as e:
            print(f"İşlemler sekmesi hatası: {e}")
        
    elif user_type == "institution":
        # Kurum Kullanıcısı akışı
        # Kurum yanıtları
        driver.get("http://localhost:3000/institution")
        take_screenshot(driver, f"{user_type}_03_institution_cases.png")
        
        # Vaka detayı
        driver.get("http://localhost:3000/cases/3")
        take_screenshot(driver, f"{user_type}_04_case_detail.png")
        
        # Yanıt ver
        try:
            actions_button = None
            try:
                actions_button = driver.find_element(By.XPATH, "//button[contains(text(), 'İşlemler')]")
            except:
                try:
                    actions_button = driver.find_element(By.XPATH, "//button[contains(., 'İşlem')]")
                except:
                    print("İşlemler butonu bulunamadı, atlanıyor...")
            
            if actions_button:
                actions_button.click()
                time.sleep(1)
                take_screenshot(driver, f"{user_type}_05_response_form.png")
        except Exception as e:
            print(f"Yanıt formu hatası: {e}")
    
    # Çıkış yap
    driver.get("http://localhost:3000/dashboard")
    time.sleep(1)

def create_pdf_report():
    """PDF rapor oluştur"""
    print("\n📄 PDF rapor oluşturuluyor...")
    
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
        ["5.", "Kullanıcı Arayüzleri"],
        ["", "5.1. Sistem Yöneticisi"],
        ["", "5.2. İDP Personeli"],
        ["", "5.3. Hukuk Personeli"],
        ["", "5.4. Kurum Kullanıcısı"],
        ["6.", "Özellikler"],
        ["7.", "Güvenlik"],
        ["8.", "Sonuç"],
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
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
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
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
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
    print("✅ PDF rapor başarıyla oluşturuldu: DMM_Proje_Raporu.pdf")

def main():
    # Screenshots klasörünü oluştur
    if not os.path.exists("screenshots"):
        os.makedirs("screenshots")
    
    # Kullanıcı bilgileri
    users = [
        ("admin", "admin", "123456"),
        ("idp", "idp_user", "123456"),
        ("legal", "legal_user", "123456"),
        ("institution", "kurum_user", "123456"),
    ]
    
    print("🚀 DMM Proje Raporu Oluşturucu")
    print("="*50)
    
    # Selenium driver'ı başlat
    driver = setup_driver()
    
    try:
        # Her kullanıcı için ekran görüntüleri al
        for user_type, username, password in users:
            capture_user_flow(driver, user_type, username, password)
        
        print("\n✅ Tüm ekran görüntüleri başarıyla alındı!")
        
    except Exception as e:
        print(f"\n❌ Hata oluştu: {e}")
    
    finally:
        # Driver'ı kapat
        driver.quit()
    
    # PDF rapor oluştur
    create_pdf_report()
    
    print("\n🎉 İşlem tamamlandı!")
    print("📁 Oluşturulan dosyalar:")
    print("   - screenshots/ klasöründe ekran görüntüleri")
    print("   - DMM_Proje_Raporu.pdf")

if __name__ == "__main__":
    main()