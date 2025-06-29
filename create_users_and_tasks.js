const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating additional users and tasks...');

  // Create IDP Personnel
  const idpUsers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        username: `idp_${i}`,
        email: `idp${i}@dmm.gov.tr`,
        fullName: `IDP Personeli ${i}`,
        password: await bcrypt.hash('123456', 12),
        role: 'IDP_PERSONNEL',
        active: true
      }
    });
    idpUsers.push(user);
    console.log(`✅ Created IDP user: ${user.username}`);
  }

  // Create Legal Personnel
  const legalUsers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        username: `legal_${i}`,
        email: `legal${i}@dmm.gov.tr`,
        fullName: `Hukuk Personeli ${i}`,
        password: await bcrypt.hash('123456', 12),
        role: 'LEGAL_PERSONNEL',
        active: true
      }
    });
    legalUsers.push(user);
    console.log(`✅ Created Legal user: ${user.username}`);
  }

  // Get admin user
  const admin = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!admin) {
    console.error('❌ Admin user not found!');
    return;
  }

  // Create sample tasks for IDP Personnel
  const idpTasks = [
    {
      title: 'Twitter Sahte Haber Analizi',
      description: 'Twitter\'da yayılan sağlık konulu sahte haberin detaylı analizi yapılması gerekmektedir. Kaynak tespiti ve yayılım analizi önemlidir.',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    },
    {
      title: 'WhatsApp Dezenformasyon Raporu',
      description: 'WhatsApp gruplarında dolaşan ekonomi haberleri hakkında rapor hazırlanması. Etki analizi ve düzeltici bilgi önerisi eklenmelidir.',
      priority: 'CRITICAL',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day
    },
    {
      title: 'YouTube Video İncelemesi',
      description: 'Manipüle edilmiş video içeriğinin teknik analizi. Video editing izlerinin tespiti ve orijinal kaynak araştırması.',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    },
    {
      title: 'Facebook Kampanya Takibi',
      description: 'Organize dezenformasyon kampanyasının takibi ve raporlanması. Fake hesapların tespiti önemli.',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    },
    {
      title: 'TikTok Trend Analizi',
      description: 'Yanlış bilgi içeren viral TikTok videolarının analizi. Genç kullanıcılara etkisi değerlendirilmeli.',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4 days
    }
  ];

  // Assign tasks to IDP personnel
  for (let i = 0; i < idpTasks.length; i++) {
    const task = await prisma.task.create({
      data: {
        ...idpTasks[i],
        assignedToId: idpUsers[i].id,
        assignedById: admin.id,
        status: i === 0 ? 'IN_PROGRESS' : 'PENDING'
      }
    });
    console.log(`✅ Created task for ${idpUsers[i].username}: ${task.title}`);

    // Add a comment from admin
    await prisma.taskComment.create({
      data: {
        taskId: task.id,
        userId: admin.id,
        comment: 'Bu konuya öncelik verilmesi gerekmektedir. Detaylı analiz bekliyorum.'
      }
    });
  }

  // Create sample tasks for Legal Personnel
  const legalTasks = [
    {
      title: 'TCK 217/A Değerlendirmesi',
      description: 'Sahte haber vakasının TCK madde 217/A kapsamında değerlendirilmesi. Emsal kararlar incelenmeli.',
      priority: 'CRITICAL',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day
    },
    {
      title: 'Telif Hakkı İhlali İncelemesi',
      description: 'Manipüle edilmiş görsel içeriğin telif hakkı açısından değerlendirilmesi.',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    },
    {
      title: 'Kişilik Haklarına Saldırı',
      description: 'Deepfake video vakasının kişilik hakları ihlali açısından incelenmesi.',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    },
    {
      title: 'BTK Bildirimi Hazırlığı',
      description: 'Platform üzerinden kaldırılması gereken içerik için BTK\'ya bildirim hazırlanması.',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    },
    {
      title: 'Suç Duyurusu Değerlendirmesi',
      description: 'Organize dezenformasyon kampanyası için suç duyurusu yapılıp yapılmayacağının değerlendirilmesi.',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    }
  ];

  // Assign tasks to Legal personnel
  for (let i = 0; i < legalTasks.length; i++) {
    const task = await prisma.task.create({
      data: {
        ...legalTasks[i],
        assignedToId: legalUsers[i].id,
        assignedById: admin.id,
        status: 'PENDING'
      }
    });
    console.log(`✅ Created task for ${legalUsers[i].username}: ${task.title}`);
  }

  // Create a completed task with feedback
  const completedTask = await prisma.task.create({
    data: {
      title: 'Acil: Seçim Dönemi Dezenformasyon',
      description: 'Seçim sürecinde yayılan sahte anket sonuçlarının analizi tamamlandı.',
      priority: 'CRITICAL',
      assignedToId: idpUsers[0].id,
      assignedById: admin.id,
      status: 'COMPLETED',
      completedAt: new Date(),
      feedback: 'Analiz çok detaylı ve başarılı. Sahte anket kaynağı tespit edildi, sosyal medya hesapları belgelendi. BTK\'ya bildirim yapıldı.',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
    }
  });

  // Add comments to completed task
  await prisma.taskComment.create({
    data: {
      taskId: completedTask.id,
      userId: idpUsers[0].id,
      comment: 'Analiz tamamlandı. 3 farklı sahte anket şirketi tespit edildi. Detaylı rapor ekte.'
    }
  });

  await prisma.taskComment.create({
    data: {
      taskId: completedTask.id,
      userId: admin.id,
      comment: 'Mükemmel çalışma! Hukuk birimine iletildi.'
    }
  });

  console.log('✅ All users and tasks created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });