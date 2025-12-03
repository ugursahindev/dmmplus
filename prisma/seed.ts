import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create institutions first - based on existing usernames
  const institutions = await Promise.all([
    prisma.institution.upsert({
      where: { name: 'Adalet Bakanlığı' },
      update: {},
      create: {
        name: 'Adalet Bakanlığı',
        type: 'MINISTRY',
        description: 'Adalet Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Aile ve Sosyal Hizmetler Bakanlığı' },
      update: {},
      create: {
        name: 'Aile ve Sosyal Hizmetler Bakanlığı',
        type: 'MINISTRY',
        description: 'Aile ve Sosyal Hizmetler Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Çalışma ve Sosyal Güvenlik Bakanlığı' },
      update: {},
      create: {
        name: 'Çalışma ve Sosyal Güvenlik Bakanlığı',
        type: 'MINISTRY',
        description: 'Çalışma ve Sosyal Güvenlik Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı' },
      update: {},
      create: {
        name: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı',
        type: 'MINISTRY',
        description: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Dışişleri Bakanlığı' },
      update: {},
      create: {
        name: 'Dışişleri Bakanlığı',
        type: 'MINISTRY',
        description: 'Dışişleri Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Enerji ve Tabii Kaynaklar Bakanlığı' },
      update: {},
      create: {
        name: 'Enerji ve Tabii Kaynaklar Bakanlığı',
        type: 'MINISTRY',
        description: 'Enerji ve Tabii Kaynaklar Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Gençlik ve Spor Bakanlığı' },
      update: {},
      create: {
        name: 'Gençlik ve Spor Bakanlığı',
        type: 'MINISTRY',
        description: 'Gençlik ve Spor Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Hazine ve Maliye Bakanlığı' },
      update: {},
      create: {
        name: 'Hazine ve Maliye Bakanlığı',
        type: 'MINISTRY',
        description: 'Hazine ve Maliye Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'İçişleri Bakanlığı' },
      update: {},
      create: {
        name: 'İçişleri Bakanlığı',
        type: 'MINISTRY',
        description: 'İçişleri Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Kültür ve Turizm Bakanlığı' },
      update: {},
      create: {
        name: 'Kültür ve Turizm Bakanlığı',
        type: 'MINISTRY',
        description: 'Kültür ve Turizm Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Milli Eğitim Bakanlığı' },
      update: {},
      create: {
        name: 'Milli Eğitim Bakanlığı',
        type: 'MINISTRY',
        description: 'Milli Eğitim Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Milli Savunma Bakanlığı' },
      update: {},
      create: {
        name: 'Milli Savunma Bakanlığı',
        type: 'MINISTRY',
        description: 'Milli Savunma Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Sağlık Bakanlığı' },
      update: {},
      create: {
        name: 'Sağlık Bakanlığı',
        type: 'MINISTRY',
        description: 'Sağlık Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Sanayi ve Teknoloji Bakanlığı' },
      update: {},
      create: {
        name: 'Sanayi ve Teknoloji Bakanlığı',
        type: 'MINISTRY',
        description: 'Sanayi ve Teknoloji Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Tarım ve Orman Bakanlığı' },
      update: {},
      create: {
        name: 'Tarım ve Orman Bakanlığı',
        type: 'MINISTRY',
        description: 'Tarım ve Orman Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Ticaret Bakanlığı' },
      update: {},
      create: {
        name: 'Ticaret Bakanlığı',
        type: 'MINISTRY',
        description: 'Ticaret Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Ulaştırma ve Altyapı Bakanlığı' },
      update: {},
      create: {
        name: 'Ulaştırma ve Altyapı Bakanlığı',
        type: 'MINISTRY',
        description: 'Ulaştırma ve Altyapı Bakanlığı',
        active: true,
      },
    }),
    prisma.institution.upsert({
      where: { name: 'Yüksek Seçim Kurulu' },
      update: {},
      create: {
        name: 'Yüksek Seçim Kurulu',
        type: 'OTHER',
        description: 'Yüksek Seçim Kurulu',
        active: true,
      },
    }),
  ]);

  console.log(`✅ Created ${institutions.length} institutions`);

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

  // Helper function to find institution by name
  const findInstitution = (name: string) => institutions.find(inst => inst.name === name);

  // Update existing institution users with their institutions based on username
  const institutionUserMappings: { username: string; institutionName: string }[] = [
    { username: 'kurum_user', institutionName: 'Milli Eğitim Bakanlığı' },
    { username: 'adalet_bakanlik', institutionName: 'Adalet Bakanlığı' },
    { username: 'aile_sosyal_bakanlik', institutionName: 'Aile ve Sosyal Hizmetler Bakanlığı' },
    { username: 'calisma_sosyal_bakanlik', institutionName: 'Çalışma ve Sosyal Güvenlik Bakanlığı' },
    { username: 'cevre_sehir_bakanlik', institutionName: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı' },
    { username: 'disisleri_bakanlik', institutionName: 'Dışişleri Bakanlığı' },
    { username: 'enerji_tabii_bakanlik', institutionName: 'Enerji ve Tabii Kaynaklar Bakanlığı' },
    { username: 'genclik_spor_bakanlik', institutionName: 'Gençlik ve Spor Bakanlığı' },
    { username: 'hazine_maliye_bakanlik', institutionName: 'Hazine ve Maliye Bakanlığı' },
    { username: 'icisleri_bakanlik', institutionName: 'İçişleri Bakanlığı' },
    { username: 'kultur_turizm_bakanlik', institutionName: 'Kültür ve Turizm Bakanlığı' },
    { username: 'milli_egitim_bakanlik', institutionName: 'Milli Eğitim Bakanlığı' },
    { username: 'milli_savunma_bakanlik', institutionName: 'Milli Savunma Bakanlığı' },
    { username: 'saglik_bakanlik', institutionName: 'Sağlık Bakanlığı' },
    { username: 'sanayi_teknoloji_bakanlik', institutionName: 'Sanayi ve Teknoloji Bakanlığı' },
    { username: 'tarim_orman_bakanlik', institutionName: 'Tarım ve Orman Bakanlığı' },
    { username: 'ticaret_bakanlik', institutionName: 'Ticaret Bakanlığı' },
    { username: 'ulastirma_altyapi_bakanlik', institutionName: 'Ulaştırma ve Altyapı Bakanlığı' },
  ];

  // Update or create institution users
  for (const mapping of institutionUserMappings) {
    const institution = findInstitution(mapping.institutionName);
    if (institution) {
      await prisma.user.updateMany({
        where: { username: mapping.username },
        data: {
          institutionId: institution.id,
          institution: mapping.institutionName, // Backward compatibility
        },
      });
    }
  }

  // Create kurum_user if it doesn't exist
  const mebInstitution = findInstitution('Milli Eğitim Bakanlığı')!;
  const institutionUser = await prisma.user.upsert({
    where: { username: 'kurum_user' },
    update: {
      institutionId: mebInstitution.id,
      institution: 'Milli Eğitim Bakanlığı',
    },
    create: {
      username: 'kurum_user',
      password: await bcryptjs.hash('123456', 12),
      email: 'kurum@meb.gov.tr',
      fullName: 'MEB Temsilcisi',
      role: 'INSTITUTION_USER',
      institution: 'Milli Eğitim Bakanlığı', // Backward compatibility
      institutionId: mebInstitution.id,
      active: true,
    },
  });

  console.log('✅ Users created and assigned to institutions');

  // Check if cases already exist
  const existingCasesCount = await prisma.case.count();
  if (existingCasesCount > 0) {
    console.log(`⚠️  ${existingCasesCount} cases already exist, skipping case creation`);
  } else {
    console.log('📝 Creating sample cases...');
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
      targetMinistry: 'Yüksek Seçim Kurulu', // Backward compatibility
      targetInstitutionId: institutions.find(inst => inst.name === 'Yüksek Seçim Kurulu')?.id,
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
        targetMinistry: 'Milli Eğitim Bakanlığı', // Backward compatibility
        targetInstitutionId: mebInstitution.id,
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
        targetMinistry: 'İçişleri Bakanlığı', // Backward compatibility
        targetInstitutionId: institutions.find(inst => inst.name === 'İçişleri Bakanlığı')?.id,
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
  }
  
  console.log('\n📝 Demo users:');
  console.log('  - Admin: admin / 123456');
  console.log('  - IDP Personnel: idp_user / 123456');
  console.log('  - Legal Personnel: legal_user / 123456');
  console.log('  - Institution User: kurum_user / 123456');
  console.log(`\n✅ Total institutions: ${institutions.length}`);
  console.log(`✅ Institution users assigned to their institutions`);
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