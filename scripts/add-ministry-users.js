const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addMinistryUsers() {
  const ministries = [
    { username: 'adalet_bakanlik', password: 'Ad@let#2025!Tr&Secure*9', fullName: 'Adalet Bakanlığı', institution: 'Adalet Bakanlığı' },
    { username: 'aile_sosyal_bakanlik', password: 'A!le&Sos2025#Hzmt@SecPw8', fullName: 'Aile ve Sosyal Hizmetler Bakanlığı', institution: 'Aile ve Sosyal Hizmetler Bakanlığı' },
    { username: 'calisma_sosyal_bakanlik', password: 'C@lsm#2025!SosGv&Tr*Sec7', fullName: 'Çalışma ve Sosyal Güvenlik Bakanlığı', institution: 'Çalışma ve Sosyal Güvenlik Bakanlığı' },
    { username: 'cevre_sehir_bakanlik', password: 'Cev#Shr2025!Iklm@Dgsk&9', fullName: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı', institution: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı' },
    { username: 'disisleri_bakanlik', password: 'Dis!slr#2025@TrDplm&Sec8', fullName: 'Dışişleri Bakanlığı', institution: 'Dışişleri Bakanlığı' },
    { username: 'enerji_tabii_bakanlik', password: 'En@rj!Tab2025#Kynk&SecPw7', fullName: 'Enerji ve Tabii Kaynaklar Bakanlığı', institution: 'Enerji ve Tabii Kaynaklar Bakanlığı' },
    { username: 'genclik_spor_bakanlik', password: 'Gnc#Spr2025!Bknlk@Tr&Sec9', fullName: 'Gençlik ve Spor Bakanlığı', institution: 'Gençlik ve Spor Bakanlığı' },
    { username: 'hazine_maliye_bakanlik', password: 'Hz!ne&Mly2025#TrSec@Pw8', fullName: 'Hazine ve Maliye Bakanlığı', institution: 'Hazine ve Maliye Bakanlığı' },
    { username: 'icisleri_bakanlik', password: 'Ic#slr2025!Bknlk@SecTr&7', fullName: 'İçişleri Bakanlığı', institution: 'İçişleri Bakanlığı' },
    { username: 'kultur_turizm_bakanlik', password: 'Klt@Trzm#2025!BkSec&Tr9', fullName: 'Kültür ve Turizm Bakanlığı', institution: 'Kültür ve Turizm Bakanlığı' },
    { username: 'milli_egitim_bakanlik', password: 'Ml!Egtm#2025@BkTr&SecPw8', fullName: 'Milli Eğitim Bakanlığı', institution: 'Milli Eğitim Bakanlığı' },
    { username: 'milli_savunma_bakanlik', password: 'Ml#Svnm2025!Def@TrSec&9', fullName: 'Milli Savunma Bakanlığı', institution: 'Milli Savunma Bakanlığı' },
    { username: 'saglik_bakanlik', password: 'Sg!lk#2025@BkHlth&SecTr8', fullName: 'Sağlık Bakanlığı', institution: 'Sağlık Bakanlığı' },
    { username: 'sanayi_teknoloji_bakanlik', password: 'Sny&Tek2025#BkInd@Sec!9', fullName: 'Sanayi ve Teknoloji Bakanlığı', institution: 'Sanayi ve Teknoloji Bakanlığı' },
    { username: 'tarim_orman_bakanlik', password: 'Tr!m#Orm2025@BkAgr&Sec8', fullName: 'Tarım ve Orman Bakanlığı', institution: 'Tarım ve Orman Bakanlığı' },
    { username: 'ticaret_bakanlik', password: 'Tc@ret#2025!BkTrd&SecPw7', fullName: 'Ticaret Bakanlığı', institution: 'Ticaret Bakanlığı' },
    { username: 'ulastirma_altyapi_bakanlik', password: 'Ul#strm2025!Altyp@Sec&9', fullName: 'Ulaştırma ve Altyapı Bakanlığı', institution: 'Ulaştırma ve Altyapı Bakanlığı' }
  ];

  console.log('Bakanlık kullanıcıları ekleniyor...');

  for (const ministry of ministries) {
    try {
      const hashedPassword = await bcrypt.hash(ministry.password, 10);
      
      const user = await prisma.user.create({
        data: {
          username: ministry.username,
          password: hashedPassword,
          email: `${ministry.username}@gov.tr`,
          fullName: ministry.fullName,
          role: 'INSTITUTION_USER',
          institution: ministry.institution,
          active: true
        }
      });

      console.log(`✓ ${ministry.fullName} kullanıcısı eklendi`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`! ${ministry.fullName} kullanıcısı zaten mevcut`);
      } else {
        console.error(`✗ ${ministry.fullName} eklenirken hata:`, error.message);
      }
    }
  }

  console.log('\nTüm bakanlık kullanıcıları işlendi.');
}

addMinistryUsers()
  .catch((e) => {
    console.error('Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });