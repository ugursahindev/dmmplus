#!/usr/bin/env python3
"""
DMM İş Akışı Raporu - Tam sistem işleyişini gösteren ekran görüntüleri
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

# Selenium driver ayarları
def setup_driver():
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium.webdriver.chrome.service import Service
        
        options = webdriver.ChromeOptions()
        options.add_argument('--window-size=1920,1080')
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
        driver = webdriver.Safari()
        driver.set_window_size(1920, 1080)
        return driver

# Ekran görüntüsü alma fonksiyonu
def take_screenshot(driver, filename, element_selector=None):
    time.sleep(2)
    
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
    time.sleep(3)
    
    try:
        wait = WebDriverWait(driver, 10)
        
        # Find all input elements
        inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"Toplam {len(inputs)} input bulundu")
        
        if len(inputs) >= 2:
            username_input = inputs[0]
            password_input = inputs[1]
        else:
            username_input = wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Kullanıcı adınızı girin']"))
            )
            password_input = wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Şifrenizi girin']"))
            )
        
        # Clear and enter values
        username_input.clear()
        username_input.send_keys(username)
        
        password_input.clear()
        password_input.send_keys(password)
        
        # Submit form
        password_input.send_keys(Keys.RETURN)
        time.sleep(3)
        
        # Check if login successful
        if "dashboard" in driver.current_url.lower():
            print(f"✓ {username} kullanıcısı başarıyla giriş yaptı")
        
    except Exception as e:
        print(f"❌ Login hatası: {e}")

# İş akışı senaryosu
def capture_workflow(driver):
    print("\n" + "="*70)
    print("DMM İŞ AKIŞI SENARYOSU")
    print("="*70)
    
    # Workflow klasörü oluştur
    if not os.path.exists("screenshots/workflow"):
        os.makedirs("screenshots/workflow")
    
    # 1. IDP PERSONELI - Yeni vaka oluşturma
    print("\n1. AŞAMA: IDP Personeli - Yeni Vaka Oluşturma")
    print("-"*50)
    
    login(driver, "idp_user", "123456")
    
    # Vakalar listesi
    driver.get("http://localhost:3000/cases")
    time.sleep(2)
    take_screenshot(driver, "workflow/01_idp_cases_list.png")
    
    # Yeni vaka formuna git
    driver.get("http://localhost:3000/cases/new")
    time.sleep(2)
    take_screenshot(driver, "workflow/02_idp_new_case_empty.png")
    
    # Formu doldur
    try:
        wait = WebDriverWait(driver, 10)
        
        # Başlık
        title_input = driver.find_element(By.XPATH, "//input[@placeholder='Vaka başlığını girin']")
        title_input.send_keys("Sağlık Bakanı Sahte Açıklama Videosu")
        
        # Açıklama
        desc_textarea = driver.find_element(By.XPATH, "//textarea[@placeholder='Detaylı açıklama girin']")
        desc_textarea.send_keys("WhatsApp gruplarında Sağlık Bakanı'na ait olduğu iddia edilen sahte bir video yayılmaktadır. Videoda aşıların zararlı olduğu iddia edilmektedir.")
        
        # Platform seç
        platform_select = driver.find_element(By.XPATH, "//select[contains(@class, 'form-select')]")
        platform_select.send_keys("WHATSAPP")
        
        # Öncelik
        priority_radios = driver.find_elements(By.XPATH, "//input[@type='radio']")
        if len(priority_radios) > 0:
            priority_radios[0].click()  # YÜKSEK
        
        # Kaynak URL
        url_input = driver.find_element(By.XPATH, "//input[@placeholder='https://example.com/haber']")
        url_input.send_keys("https://example.com/sahte-video")
        
        # Formu kaydır
        driver.execute_script("window.scrollTo(0, 500)")
        time.sleep(1)
        
        # Haber başlığı
        headline_input = driver.find_element(By.XPATH, "//input[@placeholder='Haberin başlığını girin']")
        headline_input.send_keys("Sağlık Bakanı: Aşılar Zararlı!")
        
        # Yazar
        author_input = driver.find_element(By.XPATH, "//input[@placeholder='Gazete veya yazar adı']")
        author_input.send_keys("Bilinmeyen Kaynak")
        
        # Özet
        summary_textarea = driver.find_element(By.XPATH, "//textarea[@placeholder='Haberin özetini girin']")
        summary_textarea.send_keys("Sahte videoda Sağlık Bakanı'nın aşıların zararlı olduğunu söylediği iddia ediliyor. Video deepfake teknolojisi ile üretilmiş.")
        
        # Bakanlık bilgileri
        driver.execute_script("window.scrollTo(0, 1000)")
        time.sleep(1)
        
        ministry_info = driver.find_element(By.XPATH, "//textarea[@placeholder='İlgili bakanlık hakkında bilgi']")
        ministry_info.send_keys("Sağlık Bakanlığı'ndan konuyla ilgili resmi açıklama beklenmektedir.")
        
        # İlgili bakanlık
        related_ministry = driver.find_element(By.XPATH, "//input[@placeholder='İlgili bakanlık']")
        related_ministry.send_keys("Sağlık Bakanlığı")
        
        # Dezenformasyon türü
        driver.execute_script("window.scrollTo(0, 1500)")
        time.sleep(1)
        
        disinfo_select = driver.find_element(By.XPATH, "//select[contains(@class, 'form-select') and contains(., 'Dezenformasyon Türü')]")
        disinfo_select.send_keys("SAHTE_ICERIK")
        
        # Uzman değerlendirmesi
        expert_eval = driver.find_element(By.XPATH, "//textarea[@placeholder='Uzman görüşünüzü yazın']")
        expert_eval.send_keys("Video analizi sonucunda deepfake teknolojisi kullanıldığı tespit edilmiştir. Ses ve görüntü manipüle edilmiş.")
        
        # Doldurulmuş formu görüntüle
        driver.execute_script("window.scrollTo(0, 0)")
        time.sleep(1)
        take_screenshot(driver, "workflow/03_idp_new_case_filled.png")
        
        # Formu gönder
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Vaka Oluştur')]")
        submit_button.click()
        time.sleep(3)
        
        print("✓ Yeni vaka başarıyla oluşturuldu")
        
    except Exception as e:
        print(f"⚠️ Form doldurma hatası: {e}")
    
    # En son oluşturulan vakayı bul
    driver.get("http://localhost:3000/cases")
    time.sleep(2)
    
    # İlk vakaya tıkla (en yeni)
    try:
        first_case = driver.find_element(By.XPATH, "//table//tr[2]//a")
        case_url = first_case.get_attribute('href')
        driver.get(case_url)
        time.sleep(2)
        take_screenshot(driver, "workflow/04_idp_case_detail.png")
        
        # Case ID'yi al
        case_id = case_url.split('/')[-1]
        print(f"✓ Vaka ID: {case_id}")
        
    except:
        case_id = "10"  # Fallback to demo case
        driver.get(f"http://localhost:3000/cases/{case_id}")
        time.sleep(2)
        take_screenshot(driver, "workflow/04_idp_case_detail.png")
    
    # Çıkış yap
    driver.get("http://localhost:3000/dashboard")
    
    # 2. HUKUK PERSONELI - Hukuki değerlendirme
    print("\n2. AŞAMA: Hukuk Personeli - Hukuki Değerlendirme")
    print("-"*50)
    
    login(driver, "legal_user", "123456")
    
    # Hukuki incelemeler sayfası
    driver.get("http://localhost:3000/legal")
    time.sleep(2)
    take_screenshot(driver, "workflow/05_legal_review_list.png")
    
    # Vaka detayına git
    driver.get(f"http://localhost:3000/cases/{case_id}")
    time.sleep(2)
    take_screenshot(driver, "workflow/06_legal_case_detail.png")
    
    # İşlemler sekmesine tıkla ve hukuki değerlendirme yap
    try:
        # İşlemler butonunu bul
        actions_tab = driver.find_element(By.XPATH, "//button[contains(., 'İşlemler')]")
        actions_tab.click()
        time.sleep(2)
        
        # Hukuki değerlendirme formu
        legal_assessment = driver.find_element(By.XPATH, "//textarea[@placeholder='Hukuki değerlendirmenizi yazın']")
        legal_assessment.send_keys("Bu içerik TCK madde 217/A kapsamında 'Halkı yanıltıcı bilgiyi alenen yayma' suçunu oluşturmaktadır. Deepfake teknolojisi kullanılarak üretilen sahte video, kamu sağlığını tehdit edici niteliktedir.")
        
        # Onay checkbox
        approve_checkbox = driver.find_element(By.XPATH, "//input[@type='checkbox']")
        approve_checkbox.click()
        
        take_screenshot(driver, "workflow/07_legal_assessment_form.png")
        
        # Gönder
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Hukuki Değerlendirmeyi Kaydet')]")
        submit_button.click()
        time.sleep(3)
        
        print("✓ Hukuki değerlendirme tamamlandı")
        
    except Exception as e:
        print(f"⚠️ Hukuki değerlendirme hatası: {e}")
    
    # 3. IDP PERSONELI - Son kontrol ve rapor üretimi
    print("\n3. AŞAMA: IDP Personeli - Son Kontrol ve Rapor Üretimi")
    print("-"*50)
    
    login(driver, "idp_user", "123456")
    
    # Vaka detayına git
    driver.get(f"http://localhost:3000/cases/{case_id}")
    time.sleep(2)
    
    # İşlemler sekmesi
    try:
        actions_tab = driver.find_element(By.XPATH, "//button[contains(., 'İşlemler')]")
        actions_tab.click()
        time.sleep(2)
        
        # Son kontrol formu
        final_notes = driver.find_element(By.XPATH, "//textarea[@placeholder='Son kontrol notlarınızı yazın']")
        final_notes.send_keys("Hukuki görüş alındı. Vaka Sağlık Bakanlığı'na iletilmeye hazır.")
        
        # Onay
        approve_checkbox = driver.find_element(By.XPATH, "//input[@type='checkbox']")
        approve_checkbox.click()
        
        take_screenshot(driver, "workflow/08_idp_final_control.png")
        
        # Kaydet
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Son Kontrolü Tamamla')]")
        submit_button.click()
        time.sleep(2)
        
        # Rapor üret
        # Tekrar işlemler sekmesine git
        actions_tab = driver.find_element(By.XPATH, "//button[contains(., 'İşlemler')]")
        actions_tab.click()
        time.sleep(2)
        
        # Rapor formları
        internal_report = driver.find_element(By.XPATH, "//textarea[@placeholder='İç rapor içeriğini yazın']")
        internal_report.send_keys("Deepfake video tespit edildi. Acil müdahale gerekiyor.")
        
        external_report = driver.find_element(By.XPATH, "//textarea[@placeholder='Dış rapor içeriğini yazın']")
        external_report.send_keys("Sağlık Bakanı'na ait olduğu iddia edilen video sahte olup, deepfake teknolojisi ile üretilmiştir.")
        
        # Hedef bakanlık
        target_ministry = driver.find_element(By.XPATH, "//select[contains(@class, 'form-select')]")
        target_ministry.send_keys("Sağlık Bakanlığı")
        
        take_screenshot(driver, "workflow/09_idp_report_generation.png")
        
        # Rapor üret
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Rapor Üret')]")
        submit_button.click()
        time.sleep(3)
        
        print("✓ Rapor üretimi tamamlandı")
        
    except Exception as e:
        print(f"⚠️ Rapor üretimi hatası: {e}")
    
    # 4. KURUM KULLANICISI - Kurumsal yanıt
    print("\n4. AŞAMA: Kurum Kullanıcısı - Kurumsal Yanıt")
    print("-"*50)
    
    login(driver, "kurum_user", "123456")
    
    # Kurum vakaları
    driver.get("http://localhost:3000/institution")
    time.sleep(2)
    take_screenshot(driver, "workflow/10_institution_cases.png")
    
    # Vaka detayına git
    driver.get(f"http://localhost:3000/cases/{case_id}")
    time.sleep(2)
    
    # İşlemler sekmesi
    try:
        actions_tab = driver.find_element(By.XPATH, "//button[contains(., 'İşlemler')]")
        actions_tab.click()
        time.sleep(2)
        
        # Kurumsal yanıt formu
        inst_response = driver.find_element(By.XPATH, "//textarea[@placeholder='Kurumsal yanıtınızı yazın']")
        inst_response.send_keys("Sağlık Bakanlığı olarak, sosyal medyada dolaşan videonun sahte olduğunu teyit ediyoruz. Bakanlığımız aşıların güvenli ve etkili olduğunu bir kez daha vurgular.")
        
        corrective_info = driver.find_element(By.XPATH, "//textarea[@placeholder='Düzeltici bilgileri yazın']")
        corrective_info.send_keys("Resmi açıklama: www.saglik.gov.tr/duyuru/sahte-video-uyarisi")
        
        take_screenshot(driver, "workflow/11_institution_response_form.png")
        
        # Yanıt gönder
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Yanıt Gönder')]")
        submit_button.click()
        time.sleep(3)
        
        print("✓ Kurumsal yanıt gönderildi")
        
    except Exception as e:
        print(f"⚠️ Kurumsal yanıt hatası: {e}")
    
    # 5. TAMAMLANAN VAKA
    print("\n5. AŞAMA: Tamamlanan Vaka")
    print("-"*50)
    
    # Admin olarak giriş yap ve tamamlanan vakayı göster
    login(driver, "admin", "123456")
    
    driver.get(f"http://localhost:3000/cases/{case_id}")
    time.sleep(2)
    take_screenshot(driver, "workflow/12_completed_case.png")
    
    # İstatistikler sayfası
    driver.get("http://localhost:3000/stats")
    time.sleep(3)
    take_screenshot(driver, "workflow/13_statistics_overview.png")
    
    print("\n✅ İş akışı senaryosu tamamlandı!")

def create_workflow_pdf():
    """İş akışı PDF raporu oluştur"""
    print("\n📄 İş akışı PDF raporu oluşturuluyor...")
    
    doc = SimpleDocTemplate(
        "DMM_Is_Akisi_Raporu.pdf",
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
    
    story = []
    
    # Başlık
    story.append(Paragraph("DMM İş Akışı Senaryosu", styles['CustomTitle']))
    story.append(Paragraph("Dezenformasyonla Mücadele Süreci", styles['Title']))
    story.append(Spacer(1, 0.5*inch))
    
    # Senaryo açıklaması
    story.append(Paragraph("Senaryo: Sahte Sağlık Bakanı Videosu", styles['SectionTitle']))
    story.append(Paragraph(
        "Bu senaryoda, WhatsApp gruplarında yayılan sahte bir Sağlık Bakanı videosunun "
        "tespit edilmesinden kurumsal yanıt verilmesine kadar olan süreç gösterilmektedir.",
        styles['BodyText']
    ))
    
    # İş akışı aşamaları
    workflow_steps = [
        ("1. IDP Personeli - Vaka Tespiti", [
            ("Vakalar Listesi", "workflow/01_idp_cases_list.png"),
            ("Yeni Vaka Formu (Boş)", "workflow/02_idp_new_case_empty.png"),
            ("Yeni Vaka Formu (Dolu)", "workflow/03_idp_new_case_filled.png"),
            ("Vaka Detayı", "workflow/04_idp_case_detail.png"),
        ]),
        ("2. Hukuk Personeli - Hukuki Değerlendirme", [
            ("Hukuki İncelemeler", "workflow/05_legal_review_list.png"),
            ("Vaka İnceleme", "workflow/06_legal_case_detail.png"),
            ("Hukuki Değerlendirme Formu", "workflow/07_legal_assessment_form.png"),
        ]),
        ("3. IDP Personeli - Son Kontrol ve Rapor", [
            ("Son Kontrol Formu", "workflow/08_idp_final_control.png"),
            ("Rapor Üretimi", "workflow/09_idp_report_generation.png"),
        ]),
        ("4. Kurum Kullanıcısı - Kurumsal Yanıt", [
            ("Kurum Vakaları", "workflow/10_institution_cases.png"),
            ("Kurumsal Yanıt Formu", "workflow/11_institution_response_form.png"),
        ]),
        ("5. Süreç Tamamlanması", [
            ("Tamamlanan Vaka", "workflow/12_completed_case.png"),
            ("İstatistikler", "workflow/13_statistics_overview.png"),
        ]),
    ]
    
    for section_title, screenshots in workflow_steps:
        story.append(PageBreak())
        story.append(Paragraph(section_title, styles['SectionTitle']))
        
        for title, filename in screenshots:
            story.append(Paragraph(title, styles['Normal']))
            if os.path.exists(f"screenshots/{filename}"):
                img = RLImage(f"screenshots/{filename}", width=5*inch, height=3*inch)
                story.append(img)
            story.append(Spacer(1, 0.3*inch))
    
    # PDF oluştur
    doc.build(story)
    print("✅ İş akışı PDF raporu oluşturuldu: DMM_Is_Akisi_Raporu.pdf")

def main():
    # Screenshots klasörünü oluştur
    if not os.path.exists("screenshots"):
        os.makedirs("screenshots")
    
    print("🚀 DMM İş Akışı Raporu Oluşturucu")
    print("="*50)
    
    # Selenium driver'ı başlat
    driver = setup_driver()
    
    try:
        # İş akışı senaryosunu çalıştır
        capture_workflow(driver)
        
    except Exception as e:
        print(f"\n❌ Hata oluştu: {e}")
    
    finally:
        # Driver'ı kapat
        driver.quit()
    
    # PDF rapor oluştur
    create_workflow_pdf()
    
    print("\n🎉 İşlem tamamlandı!")
    print("📁 Oluşturulan dosyalar:")
    print("   - screenshots/workflow/ klasöründe iş akışı görüntüleri")
    print("   - DMM_Is_Akisi_Raporu.pdf")

if __name__ == "__main__":
    main()