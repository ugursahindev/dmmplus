// Demo vaka oluşturma scripti
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createDemoCase() {
  try {
    // IDP kullanıcısını bul
    const idpUser = await prisma.user.findUnique({
      where: { username: 'idp_user' }
    });

    if (!idpUser) {
      console.error('IDP kullanıcısı bulunamadı!');
      return;
    }

    // Yeni demo vaka oluştur
    const demoCase = await prisma.case.create({
      data: {
        caseNumber: `DMM-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-999`,
        title: 'Eğitim Sisteminde Yanlış Bilgilendirme Vakası',
        description: 'Sosyal medya platformlarında yeni eğitim müfredatı hakkında yanlış bilgiler yayılmaktadır.',
        platform: 'TWITTER',
        priority: 'HIGH',
        status: 'IDP_FORM',
        tags: JSON.stringify(['eğitim', 'müfredat', 'yanlış bilgi', 'sosyal medya']),
        sourceUrl: 'https://twitter.com/example/status/123456789',
        sourceType: 'SOCIAL_MEDIA',
        geographicScope: 'NATIONAL',
        createdById: idpUser.id,
        
        // Detaylı form alanları (schema'da olan alanlar)
        preparedBy: 'Ahmet Yılmaz',
        
        newsHeadline: 'Yeni Müfredatta Zorunlu Dersler Kaldırılıyor İddiası',
        newspaperAuthor: '@yanlis_haber_kaynak',
        newsSummary: 'Sosyal medyada hızla yayılan paylaşımlarda, MEB\'in yeni müfredatta matematik ve fen derslerini tamamen kaldıracağı, bunun yerine sadece din dersi verileceği iddia edilmektedir. Bu iddialar ebeveynler arasında büyük endişe yaratmıştır.',
        
        ministryInfo: 'Milli Eğitim Bakanlığı\'nın açıklaması beklenmektedir. Konu ile ilgili resmi bir duyuru yapılmamıştır.',
        relatedMinistry: 'MEB',
        submittedTo: 'Milli Eğitim Bakanlığı',
        submittingUnit: 'DMM - İDP Birimi',
        
        disinformationType: 'YALAN_HABER',
        expertEvaluation: 'İncelenen paylaşımlarda yer alan iddialar tamamen asılsızdır. MEB\'in yayınladığı resmi müfredat taslağında matematik ve fen derslerinin kaldırılması söz konusu değildir. Aksine, bu derslerin içeriği güncellenmekte ve zenginleştirilmektedir.',
        
        // IDP değerlendirme
        idpAssessment: 'Bu paylaşım açık bir şekilde yanlış bilgi içermektedir ve toplumda panik yaratma potansiyeli taşımaktadır.',
        idpNotes: 'Sosyal medyada hızla yayılıyor, acil müdahale gerekiyor.'
      }
    });

    console.log('✅ Demo vaka oluşturuldu:', demoCase.caseNumber);

    // Vaka geçmişi ekle
    await prisma.caseHistory.create({
      data: {
        caseId: demoCase.id,
        action: 'CREATE',
        description: 'Vaka oluşturuldu',
        userId: idpUser.id,
        oldStatus: 'IDP_FORM',
        newStatus: 'IDP_FORM'
      }
    });

    // Örnek dosya ekle
    await prisma.caseFile.create({
      data: {
        caseId: demoCase.id,
        filename: 'yanlis_haber_ekran_goruntusu.png',
        path: '/uploads/yanlis_haber_ekran_goruntusu.png',
        size: 245678,
        mimeType: 'image/png'
      }
    });

    console.log('✅ Demo vaka ID:', demoCase.id);
    console.log('✅ Demo vaka başarıyla oluşturuldu!');
    
    return demoCase.id;

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoCase();