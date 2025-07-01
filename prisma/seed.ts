import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo users (only if they don't exist)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcryptjs.hash('123456', 12),
      email: 'admin@dmm.gov.tr',
      fullName: 'Sistem Yöneticisi',
      role: 'ADMIN',
      active: true,
    },
  });

  const idpUser = await prisma.user.upsert({
    where: { username: 'idp_user' },
    update: {},
    create: {
      username: 'idp_user',
      password: await bcryptjs.hash('123456', 12),
      email: 'idp@dmm.gov.tr',
      fullName: 'İnceleme Değerlendirme Personeli',
      role: 'IDP_PERSONNEL',
      active: true,
    },
  });

  const legalUser = await prisma.user.upsert({
    where: { username: 'legal_user' },
    update: {},
    create: {
      username: 'legal_user',
      password: await bcryptjs.hash('123456', 12),
      email: 'hukuk@dmm.gov.tr',
      fullName: 'Hukuk Müşaviri',
      role: 'LEGAL_PERSONNEL',
      active: true,
    },
  });

  const institutionUser = await prisma.user.upsert({
    where: { username: 'kurum_user' },
    update: {},
    create: {
      username: 'kurum_user',
      password: await bcryptjs.hash('123456', 12),
      email: 'kurum@meb.gov.tr',
      fullName: 'MEB Temsilcisi',
      role: 'INSTITUTION_USER',
      institution: 'Milli Eğitim Bakanlığı',
      active: true,
    },
  });

  console.log('✅ Users created');

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      caseNumber: `DMM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
      title: 'Sahte Deprem Yardım Kampanyası',
      description: 'Sosyal medyada dolaşan sahte deprem yardım kampanyası linki tespit edildi. AFAD adı kullanılarak oluşturulan sahte web sitesi üzerinden bağış toplandığı görülmektedir.',
      platform: 'TWITTER',
      priority: 'HIGH',
      status: 'IDP_FORM',
      tags: JSON.stringify(['deprem', 'dolandırıcılık', 'sahte kampanya']),
      geographicScope: 'NATIONAL',
      sourceType: 'SOCIAL_MEDIA',
      sourceUrl: 'https://twitter.com/example/status/123456',
      createdById: idpUser.id,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      caseNumber: `DMM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-002`,
      title: 'Yanlış Sağlık Bilgisi Yayılması',
      description: 'WhatsApp gruplarında yayılan ve bilimsel dayanağı olmayan tedavi yöntemleri içeren mesajlar tespit edildi.',
      platform: 'WHATSAPP',
      priority: 'MEDIUM',
      status: 'HUKUK_INCELEMESI',
      tags: JSON.stringify(['sağlık', 'yanlış bilgi', 'whatsapp']),
      geographicScope: 'REGIONAL',
      sourceType: 'MESSAGING_APP',
      idpAssessment: 'Mesajın içeriği incelendi ve Sağlık Bakanlığı açıklamalarıyla çeliştiği tespit edildi.',
      idpNotes: 'Konunun Sağlık Bakanlığına bildirilmesi önerilir.',
      createdById: idpUser.id,
    },
  });

  const case3 = await prisma.case.create({
    data: {
      caseNumber: `DMM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-003`,
      title: 'Manipüle Edilmiş Seçim Anketi',
      description: 'Gerçek dışı seçim anketi sonuçları içeren ve kamuoyunu yanıltmaya yönelik paylaşımlar tespit edildi.',
      platform: 'FACEBOOK',
      priority: 'CRITICAL',
      status: 'KURUM_BEKLENIYOR',
      tags: JSON.stringify(['seçim', 'anket', 'manipülasyon']),
      geographicScope: 'NATIONAL',
      sourceType: 'SOCIAL_MEDIA',
      sourceUrl: 'https://facebook.com/example/post/789',
      idpAssessment: 'Paylaşılan anket sonuçlarının gerçek anket şirketlerine ait olmadığı tespit edildi.',
      idpNotes: 'YSK ile koordinasyon sağlanmalı.',
      legalAssessment: 'Seçim yasası kapsamında suç teşkil edebilir.',
      legalNotes: 'Cumhuriyet Savcılığına suç duyurusunda bulunulması önerilir.',
      legalApproved: true,
      legalReviewerId: legalUser.id,
      legalReviewDate: new Date(),
      finalNotes: 'Vaka onaylandı, ilgili kurumlara bildirim yapılacak.',
      finalApproval: true,
      finalReviewerId: idpUser.id,
      finalReviewDate: new Date(),
      internalReport: 'Manipüle edilmiş seçim anketi vakası tespit edilmiştir...',
      externalReport: 'Sayın Yetkili, sosyal medyada dolaşan sahte anket sonuçları hakkında...',
      targetMinistry: 'Yüksek Seçim Kurulu',
      reportGeneratedDate: new Date(),
      createdById: idpUser.id,
    },
  });

  // Add case history for case3
  await prisma.caseHistory.createMany({
    data: [
      {
        caseId: case3.id,
        userId: idpUser.id,
        action: 'Vaka oluşturuldu',
        oldStatus: 'IDP_FORM',
        newStatus: 'IDP_FORM',
        notes: 'İlk kayıt',
      },
      {
        caseId: case3.id,
        userId: idpUser.id,
        action: 'Hukuki incelemeye gönderildi',
        oldStatus: 'IDP_FORM',
        newStatus: 'HUKUK_INCELEMESI',
      },
      {
        caseId: case3.id,
        userId: legalUser.id,
        action: 'Hukuki inceleme tamamlandı',
        oldStatus: 'HUKUK_INCELEMESI',
        newStatus: 'SON_KONTROL',
      },
      {
        caseId: case3.id,
        userId: idpUser.id,
        action: 'Rapor üretimine geçildi',
        oldStatus: 'SON_KONTROL',
        newStatus: 'RAPOR_URETIMI',
      },
      {
        caseId: case3.id,
        userId: idpUser.id,
        action: 'Kurum yanıtı bekleniyor',
        oldStatus: 'RAPOR_URETIMI',
        newStatus: 'KURUM_BEKLENIYOR',
      },
    ],
  });

  // Create more sample cases for different statuses
  const additionalCases = await prisma.case.createMany({
    data: [
      {
        caseNumber: `DMM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-004`,
        title: 'Yanlış Eğitim İstatistikleri Paylaşımı',
        description: 'Milli Eğitim Bakanlığı verilerini çarpıtarak sunan paylaşımlar tespit edildi.',
        platform: 'TWITTER',
        priority: 'HIGH',
        status: 'KURUM_BEKLENIYOR',
        tags: JSON.stringify(['eğitim', 'istatistik', 'MEB']),
        geographicScope: 'NATIONAL',
        sourceType: 'SOCIAL_MEDIA',
        sourceUrl: 'https://twitter.com/example/status/456789',
        idpAssessment: 'Paylaşılan istatistiklerin resmi MEB verileriyle uyuşmadığı tespit edildi.',
        idpNotes: 'MEB ile acil koordinasyon gerekli.',
        legalAssessment: 'Kamu kurumunu itibarsızlaştırma suçu kapsamında değerlendirilebilir.',
        legalNotes: 'Yasal işlem başlatılması önerilir.',
        legalApproved: true,
        legalReviewerId: legalUser.id,
        legalReviewDate: new Date(),
        finalNotes: 'Rapor hazırlandı, MEB\'e gönderildi.',
        finalApproval: true,
        finalReviewerId: idpUser.id,
        finalReviewDate: new Date(),
        internalReport: 'Eğitim istatistikleri manipülasyonu tespit edilmiştir...',
        externalReport: 'Sayın Yetkili, sosyal medyada MEB verilerinin çarpıtıldığı tespit edilmiştir...',
        targetMinistry: 'Milli Eğitim Bakanlığı',
        reportGeneratedDate: new Date(),
        createdById: idpUser.id,
      },
      {
        caseNumber: `DMM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-005`,
        title: 'Sahte Aşı Yan Etki Haberleri',
        description: 'COVID-19 aşıları hakkında bilimsel dayanağı olmayan yan etki iddiaları yayılmaktadır.',
        platform: 'FACEBOOK',
        priority: 'CRITICAL',
        status: 'HUKUK_INCELEMESI',
        tags: JSON.stringify(['sağlık', 'aşı', 'COVID-19', 'dezenformasyon']),
        geographicScope: 'NATIONAL',
        sourceType: 'SOCIAL_MEDIA',
        idpAssessment: 'Paylaşılan bilgilerin Sağlık Bakanlığı ve DSÖ verileriyle çeliştiği görülmüştür.',
        idpNotes: 'Halk sağlığını tehdit eden içerik.',
        createdById: idpUser.id,
      },
      {
        caseNumber: `DMM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-006`,
        title: 'Manipüle Edilmiş Ekonomi Haberi',
        description: 'Resmi ekonomik verileri çarpıtarak panik yaratmaya yönelik haberler.',
        platform: 'OTHER',
        priority: 'HIGH',
        status: 'SON_KONTROL',
        tags: JSON.stringify(['ekonomi', 'manipülasyon', 'haber']),
        geographicScope: 'NATIONAL',
        sourceType: 'NEWS_SITE',
        sourceUrl: 'https://example-news.com/fake-economy-news',
        idpAssessment: 'Haberde kullanılan verilerin TÜİK verileriyle uyuşmadığı tespit edildi.',
        idpNotes: 'Ekonomik istikrarı bozucu nitelikte.',
        legalAssessment: 'Piyasa manipülasyonu ve halkı paniğe sevk suçları kapsamında değerlendirilebilir.',
        legalNotes: 'SPK ve BDDK ile koordinasyon önerilir.',
        legalApproved: true,
        legalReviewerId: legalUser.id,
        legalReviewDate: new Date(Date.now() - 86400000),
        createdById: idpUser.id,
      },
      {
        caseNumber: `DMM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-007`,
        title: 'Sahte Belediye Duyurusu',
        description: 'İstanbul Büyükşehir Belediyesi adına sahte su kesintisi duyurusu yayılıyor.',
        platform: 'WHATSAPP',
        priority: 'MEDIUM',
        status: 'RAPOR_URETIMI',
        tags: JSON.stringify(['belediye', 'sahte duyuru', 'İBB']),
        geographicScope: 'LOCAL',
        sourceType: 'MESSAGING_APP',
        idpAssessment: 'İBB resmi kanallarında böyle bir duyuru bulunmamaktadır.',
        idpNotes: 'Vatandaşları mağdur edebilecek içerik.',
        legalAssessment: 'Kamu kurumu adına sahte belge düzenleme suçu.',
        legalNotes: 'İBB Hukuk Müşavirliği ile koordinasyon sağlanmalı.',
        legalApproved: true,
        legalReviewerId: legalUser.id,
        legalReviewDate: new Date(Date.now() - 172800000),
        finalNotes: 'İBB ile görüşüldü, resmi açıklama yapılacak.',
        finalApproval: true,
        finalReviewerId: idpUser.id,
        finalReviewDate: new Date(Date.now() - 86400000),
        createdById: idpUser.id,
      },
      {
        caseNumber: `DMM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-008`,
        title: 'Terör Örgütü Propagandası İçeren Video',
        description: 'YouTube\'da terör örgütü propagandası içeren video tespit edildi.',
        platform: 'YOUTUBE',
        priority: 'CRITICAL',
        status: 'TAMAMLANDI',
        tags: JSON.stringify(['terör', 'propaganda', 'güvenlik']),
        geographicScope: 'INTERNATIONAL',
        sourceType: 'SOCIAL_MEDIA',
        sourceUrl: 'https://youtube.com/watch?v=example',
        idpAssessment: 'Video içeriği terör örgütü propagandası içermektedir.',
        idpNotes: 'Acil müdahale gerekli.',
        legalAssessment: 'TCK 7/2 ve TMK kapsamında suç teşkil etmektedir.',
        legalNotes: 'Cumhuriyet Başsavcılığına suç duyurusu yapıldı.',
        legalApproved: true,
        legalReviewerId: legalUser.id,
        legalReviewDate: new Date(Date.now() - 259200000),
        finalNotes: 'Video kaldırıldı, yasal süreç başlatıldı.',
        finalApproval: true,
        finalReviewerId: idpUser.id,
        finalReviewDate: new Date(Date.now() - 172800000),
        internalReport: 'Terör propagandası içeren video tespit edilmiş ve gereği yapılmıştır.',
        externalReport: 'İçişleri Bakanlığına bildirilmiştir.',
        targetMinistry: 'İçişleri Bakanlığı',
        reportGeneratedDate: new Date(Date.now() - 172800000),
        institutionResponse: 'Video platformdan kaldırılmış, şüpheliler hakkında soruşturma başlatılmıştır.',
        institutionResponderId: institutionUser.id,
        institutionResponseDate: new Date(Date.now() - 86400000),
        correctiveInfo: 'Emniyet Genel Müdürlüğü Siber Suçlarla Mücadele Dairesi tarafından takibe alınmıştır.',
        createdById: idpUser.id,
      },
    ],
  });

  console.log(`✅ Created ${additionalCases.count} additional cases`);
  console.log('✅ Sample cases created');
  console.log('\n📝 Demo users:');
  console.log('  - Admin: admin / 123456');
  console.log('  - IDP Personnel: idp_user / 123456');
  console.log('  - Legal Personnel: legal_user / 123456');
  console.log('  - Institution User: kurum_user / 123456');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });