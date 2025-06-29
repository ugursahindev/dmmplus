#!/usr/bin/env python3
"""
DMM HTML Rapor Oluşturucu - Türkçe karakter desteği ile
"""

import os
from datetime import datetime

def generate_html_report():
    """HTML formatında rapor oluştur"""
    
    html_content = """<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DMM - Dezenformasyonla Mücadele Merkezi Proje Raporu</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1a1a1a;
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        h2 {
            color: #2563eb;
            margin-top: 40px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
        }
        h3 {
            color: #374151;
            margin-top: 30px;
        }
        .subtitle {
            text-align: center;
            color: #6b7280;
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .date {
            text-align: center;
            color: #9ca3af;
            margin-bottom: 50px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #e5e7eb;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
        }
        .tech-table th {
            background-color: #6b7280;
            color: white;
        }
        .roles-table th {
            background-color: #2563eb;
            color: white;
        }
        .workflow-table th {
            background-color: #10b981;
            color: white;
        }
        .screenshot {
            margin: 20px 0;
            text-align: center;
        }
        .screenshot img {
            max-width: 100%;
            height: auto;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .screenshot-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #4b5563;
        }
        .feature-list {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .feature-list ul {
            margin: 0;
            padding-left: 20px;
        }
        .feature-list li {
            margin: 8px 0;
        }
        .page-break {
            page-break-after: always;
        }
        .toc {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        .toc li {
            margin: 10px 0;
        }
        .toc a {
            text-decoration: none;
            color: #2563eb;
        }
        .toc a:hover {
            text-decoration: underline;
        }
        @media print {
            body {
                background-color: white;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
            .page-break {
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>DMM - Dezenformasyonla Mücadele Merkezi</h1>
        <p class="subtitle">Proje Tanıtım ve Kullanım Raporu</p>
        <p class="date">Tarih: """ + datetime.now().strftime('%d.%m.%Y') + """</p>
        
        <div class="toc">
            <h2>İçindekiler</h2>
            <ul>
                <li><a href="#ozet">1. Proje Özeti</a></li>
                <li><a href="#mimari">2. Sistem Mimarisi</a></li>
                <li><a href="#roller">3. Kullanıcı Rolleri ve Yetkileri</a></li>
                <li><a href="#akis">4. İş Akışı</a></li>
                <li><a href="#arayuz">5. Kullanıcı Arayüzleri</a></li>
                <li><a href="#ozellikler">6. Özellikler</a></li>
                <li><a href="#guvenlik">7. Güvenlik</a></li>
                <li><a href="#sonuc">8. Sonuç</a></li>
            </ul>
        </div>
        
        <div class="page-break"></div>
        
        <h2 id="ozet">1. Proje Özeti</h2>
        <p>DMM (Dezenformasyonla Mücadele Merkezi), dijital ortamlarda yayılan yanlış bilgi, manipülasyon ve dezenformasyon içeriklerinin tespit edilmesi, incelenmesi ve ilgili kurumlara raporlanması amacıyla geliştirilmiş kapsamlı bir yönetim sistemidir.</p>
        
        <p>Sistem, İletişim Başkanlığı bünyesinde faaliyet göstermek üzere tasarlanmış olup, dezenformasyon vakalarının sistematik bir şekilde takip edilmesini, hukuki değerlendirmeye tabi tutulmasını ve ilgili bakanlıklarla koordineli bir şekilde mücadele edilmesini sağlar.</p>
        
        <h3>Temel Hedefler:</h3>
        <div class="feature-list">
            <ul>
                <li>Dezenformasyon içeriklerinin hızlı tespiti ve kayıt altına alınması</li>
                <li>Vakaların hukuki açıdan değerlendirilmesi</li>
                <li>İlgili bakanlıklarla koordineli çalışma</li>
                <li>Detaylı raporlama ve istatistik üretimi</li>
                <li>Vatandaşların doğru bilgiye erişiminin sağlanması</li>
            </ul>
        </div>
        
        <h2 id="mimari">2. Sistem Mimarisi</h2>
        <table class="tech-table">
            <tr>
                <th>Teknoloji</th>
                <th>Açıklama</th>
            </tr>
            <tr>
                <td>Frontend</td>
                <td>Next.js 15.3.4 (App Router), TypeScript, NextUI, TailwindCSS</td>
            </tr>
            <tr>
                <td>Backend</td>
                <td>Next.js API Routes, Prisma ORM</td>
            </tr>
            <tr>
                <td>Veritabanı</td>
                <td>SQLite (Geliştirme), PostgreSQL (Prodüksiyon)</td>
            </tr>
            <tr>
                <td>Kimlik Doğrulama</td>
                <td>JWT (8 saatlik token süresi)</td>
            </tr>
            <tr>
                <td>Grafik/Rapor</td>
                <td>Recharts</td>
            </tr>
            <tr>
                <td>Güvenlik</td>
                <td>bcryptjs, RBAC (Role Based Access Control)</td>
            </tr>
        </table>
        
        <h2 id="roller">3. Kullanıcı Rolleri ve Yetkileri</h2>
        <table class="roles-table">
            <tr>
                <th>Rol</th>
                <th>Yetkiler</th>
                <th>Sorumluluklar</th>
            </tr>
            <tr>
                <td>Sistem Yöneticisi</td>
                <td>
                    • Tüm modüllere erişim<br>
                    • Kullanıcı yönetimi<br>
                    • Sistem ayarları<br>
                    • Raporlama
                </td>
                <td>Sistem yönetimi, kullanıcı tanımlama, genel koordinasyon</td>
            </tr>
            <tr>
                <td>İDP Personeli</td>
                <td>
                    • Vaka oluşturma<br>
                    • Vaka düzenleme<br>
                    • İlk değerlendirme<br>
                    • Rapor hazırlama
                </td>
                <td>Dezenformasyon tespiti, ilk inceleme, vaka kayıt ve takibi</td>
            </tr>
            <tr>
                <td>Hukuk Personeli</td>
                <td>
                    • Hukuki inceleme<br>
                    • Onay/Red işlemleri<br>
                    • Hukuki görüş
                </td>
                <td>Vakaların hukuki değerlendirmesi, yasal süreç önerileri</td>
            </tr>
            <tr>
                <td>Kurum Kullanıcısı</td>
                <td>
                    • Kendi kurumuna ait vakaları görüntüleme<br>
                    • Kurumsal yanıt verme
                </td>
                <td>Bakanlık adına resmi yanıt ve düzeltici bilgi sağlama</td>
            </tr>
        </table>
        
        <h2 id="akis">4. İş Akışı</h2>
        <h3>Dezenformasyon Mücadele Süreci</h3>
        <table class="workflow-table">
            <tr>
                <th>Aşama</th>
                <th>Sorumlu</th>
                <th>Açıklama</th>
            </tr>
            <tr>
                <td>1. IDP Formu</td>
                <td>İDP Personeli</td>
                <td>Vaka tespiti ve ilk kayıt</td>
            </tr>
            <tr>
                <td>2. Hukuki İnceleme</td>
                <td>Hukuk Personeli</td>
                <td>Hukuki değerlendirme ve görüş</td>
            </tr>
            <tr>
                <td>3. Son Kontrol</td>
                <td>İDP Personeli</td>
                <td>Hukuki görüş sonrası kontrol</td>
            </tr>
            <tr>
                <td>4. Rapor Üretimi</td>
                <td>İDP Personeli</td>
                <td>İç ve dış rapor hazırlama</td>
            </tr>
            <tr>
                <td>5. Kurum Yanıtı</td>
                <td>Kurum Kullanıcısı</td>
                <td>İlgili bakanlık yanıtı</td>
            </tr>
            <tr>
                <td>6. Tamamlandı</td>
                <td>Sistem</td>
                <td>Süreç tamamlanması</td>
            </tr>
        </table>
        
        <div class="page-break"></div>
        
        <h2 id="arayuz">5. Kullanıcı Arayüzleri</h2>
"""
    
    # Kullanıcı ekran görüntüleri
    users = [
        ("Sistem Yöneticisi", [
            ("Giriş Ekranı", "admin_01_login.png"),
            ("Ana Panel", "admin_02_dashboard.png"),
            ("Vaka Yönetimi", "admin_03_cases_list.png"),
            ("İstatistikler", "admin_04_statistics.png"),
            ("Kullanıcı Yönetimi", "admin_05_users.png"),
            ("Sistem Ayarları", "admin_06_settings.png"),
        ]),
        ("İDP Personeli", [
            ("Giriş Ekranı", "idp_01_login.png"),
            ("Ana Panel", "idp_02_dashboard.png"),
            ("Vaka Listesi", "idp_03_cases_list.png"),
            ("Yeni Vaka Formu", "idp_04_new_case_form.png"),
            ("Vaka Detayı", "idp_05_case_detail.png"),
            ("İstatistikler", "idp_06_statistics.png"),
        ]),
        ("Hukuk Personeli", [
            ("Giriş Ekranı", "legal_01_login.png"),
            ("Ana Panel", "legal_02_dashboard.png"),
            ("Hukuki İncelemeler", "legal_03_legal_review_list.png"),
            ("Vaka Detayı", "legal_04_case_detail.png"),
            ("İşlem Sekmesi", "legal_05_case_actions.png"),
        ]),
        ("Kurum Kullanıcısı", [
            ("Giriş Ekranı", "institution_01_login.png"),
            ("Ana Panel", "institution_02_dashboard.png"),
            ("Kurum Vakaları", "institution_03_institution_cases.png"),
            ("Vaka Detayı", "institution_04_case_detail.png"),
            ("Yanıt Formu", "institution_05_response_form.png"),
        ]),
    ]
    
    for user_title, screenshots in users:
        html_content += f'<h3>{user_title}</h3>\n'
        for title, filename in screenshots:
            if os.path.exists(f"screenshots/{filename}"):
                html_content += f'''
        <div class="screenshot">
            <div class="screenshot-title">{title}</div>
            <img src="screenshots/{filename}" alt="{title}">
        </div>
'''
    
    html_content += """
        <h2 id="ozellikler">6. Özellikler</h2>
        <div class="feature-list">
            <ul>
                <li>✓ Gerçek zamanlı vaka takibi ve yönetimi</li>
                <li>✓ Rol bazlı erişim kontrolü (RBAC)</li>
                <li>✓ Kapsamlı iş akışı yönetimi (6 aşamalı)</li>
                <li>✓ Detaylı raporlama ve istatistikler</li>
                <li>✓ Dosya yükleme ve kanıt yönetimi</li>
                <li>✓ Bakanlıklarla entegre çalışma</li>
                <li>✓ Güvenli kimlik doğrulama (JWT)</li>
                <li>✓ Responsive ve modern arayüz</li>
                <li>✓ Vaka geçmişi ve değişiklik takibi</li>
                <li>✓ Otomatik vaka numarası üretimi</li>
            </ul>
        </div>
        
        <h2 id="guvenlik">7. Güvenlik</h2>
        <p>Sistem güvenliği en üst düzeyde tutulmuş olup, aşağıdaki güvenlik önlemleri uygulanmıştır:</p>
        <div class="feature-list">
            <ul>
                <li>• Şifreler bcryptjs ile 12 round hashlenme</li>
                <li>• JWT token tabanlı kimlik doğrulama</li>
                <li>• 8 saatlik token süresi</li>
                <li>• Rol bazlı yetkilendirme sistemi</li>
                <li>• API endpoint koruması</li>
                <li>• SQL injection koruması (Prisma ORM)</li>
                <li>• XSS koruması</li>
                <li>• HTTPS zorunluluğu (production)</li>
            </ul>
        </div>
        
        <h2 id="sonuc">8. Sonuç</h2>
        <p>DMM (Dezenformasyonla Mücadele Merkezi), Türkiye'nin dijital mecralarda artan dezenformasyon tehdidine karşı geliştirilmiş kapsamlı ve modern bir çözümdür. Sistem, İletişim Başkanlığı koordinasyonunda, ilgili tüm bakanlıkların katılımıyla dezenformasyonla etkin mücadele edilmesini sağlayacak altyapıyı sunmaktadır.</p>
        
        <p>Proje, modern web teknolojileri kullanılarak geliştirilmiş olup, ölçeklenebilir, güvenli ve kullanıcı dostu bir yapıya sahiptir. Role dayalı yetkilendirme sistemi sayesinde, her kullanıcı grubu sadece kendi sorumluluk alanındaki işlemleri gerçekleştirebilmekte, bu da hem güvenliği hem de verimliliği artırmaktadır.</p>
        
        <p>Sistemin başarılı bir şekilde uygulanması durumunda, dezenformasyonla mücadelede önemli bir adım atılmış olacak ve vatandaşlarımızın doğru bilgiye erişimi güvence altına alınacaktır.</p>
        
        <div class="page-break"></div>
        
        <h2>Demo Kullanıcı Bilgileri</h2>
        <table>
            <tr>
                <th>Rol</th>
                <th>Kullanıcı Adı</th>
                <th>Şifre</th>
                <th>Açıklama</th>
            </tr>
            <tr>
                <td>Sistem Yöneticisi</td>
                <td>admin</td>
                <td>123456</td>
                <td>Tüm yetkiler</td>
            </tr>
            <tr>
                <td>İDP Personeli</td>
                <td>idp_user</td>
                <td>123456</td>
                <td>Vaka oluşturma ve yönetim</td>
            </tr>
            <tr>
                <td>Hukuk Personeli</td>
                <td>legal_user</td>
                <td>123456</td>
                <td>Hukuki inceleme</td>
            </tr>
            <tr>
                <td>Kurum Kullanıcısı</td>
                <td>kurum_user</td>
                <td>123456</td>
                <td>MEB temsilcisi</td>
            </tr>
        </table>
    </div>
</body>
</html>
"""
    
    # HTML dosyasını kaydet
    with open('DMM_Proje_Raporu.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✅ HTML rapor oluşturuldu: DMM_Proje_Raporu.html")
    print("📌 Tarayıcıda açmak için: open DMM_Proje_Raporu.html")

if __name__ == "__main__":
    generate_html_report()