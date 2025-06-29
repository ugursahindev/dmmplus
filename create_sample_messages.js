const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleMessages() {
  try {
    // Get some users
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const idpUsers = await prisma.user.findMany({ 
      where: { role: 'IDP_PERSONNEL' },
      take: 3
    });
    const legalUsers = await prisma.user.findMany({ 
      where: { role: 'LEGAL_PERSONNEL' },
      take: 2
    });

    if (!admin || idpUsers.length === 0 || legalUsers.length === 0) {
      console.log('Not enough users found');
      return;
    }

    // Create individual conversations
    console.log('Creating individual conversations...');

    // Admin to IDP Personnel
    const conv1 = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: admin.id },
            { userId: idpUsers[0].id }
          ]
        }
      }
    });

    // Add messages
    await prisma.message.createMany({
      data: [
        {
          conversationId: conv1.id,
          senderId: admin.id,
          content: 'Merhaba, yeni gelen vaka hakkında görüşünüz nedir?'
        },
        {
          conversationId: conv1.id,
          senderId: idpUsers[0].id,
          content: 'Merhaba, vakayı inceledim. Öncelik seviyesi yüksek olarak belirlenmeli.'
        },
        {
          conversationId: conv1.id,
          senderId: admin.id,
          content: 'Anladım, hemen gerekli düzenlemeleri yapıyorum.'
        }
      ]
    });

    await prisma.conversation.update({
      where: { id: conv1.id },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: 'Anladım, hemen gerekli düzenlemeleri yapıyorum.'
      }
    });

    // IDP to Legal Personnel
    const conv2 = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: idpUsers[1].id },
            { userId: legalUsers[0].id }
          ]
        }
      }
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conv2.id,
          senderId: idpUsers[1].id,
          content: 'Hukuki inceleme için bir vaka gönderdim, kontrol eder misiniz?'
        },
        {
          conversationId: conv2.id,
          senderId: legalUsers[0].id,
          content: 'Tabii, hemen bakıyorum.'
        },
        {
          conversationId: conv2.id,
          senderId: legalUsers[0].id,
          content: 'İncelemeyi tamamladım, onay verdim.'
        }
      ]
    });

    await prisma.conversation.update({
      where: { id: conv2.id },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: 'İncelemeyi tamamladım, onay verdim.'
      }
    });

    // Create a group conversation
    console.log('Creating group conversation...');

    const groupConv = await prisma.conversation.create({
      data: {
        title: 'DMM Ekip Toplantısı',
        isGroup: true,
        participants: {
          create: [
            { userId: admin.id },
            { userId: idpUsers[0].id },
            { userId: idpUsers[1].id },
            { userId: legalUsers[0].id }
          ]
        }
      }
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: groupConv.id,
          senderId: admin.id,
          content: 'Merhaba ekip, yarınki toplantı için hazır mısınız?'
        },
        {
          conversationId: groupConv.id,
          senderId: idpUsers[0].id,
          content: 'Evet, sunum hazır.'
        },
        {
          conversationId: groupConv.id,
          senderId: legalUsers[0].id,
          content: 'Hukuki raporları da hazırladım.'
        },
        {
          conversationId: groupConv.id,
          senderId: idpUsers[1].id,
          content: 'Harika, ben de istatistikleri derledim.'
        },
        {
          conversationId: groupConv.id,
          senderId: admin.id,
          content: 'Mükemmel! Yarın saat 10:00\'da görüşürüz.'
        }
      ]
    });

    await prisma.conversation.update({
      where: { id: groupConv.id },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: 'Mükemmel! Yarın saat 10:00\'da görüşürüz.'
      }
    });

    // Mark some messages as read
    const allMessages = await prisma.message.findMany({
      where: {
        conversationId: { in: [conv1.id, conv2.id, groupConv.id] }
      }
    });

    // Admin reads all messages
    for (const msg of allMessages) {
      if (msg.senderId !== admin.id) {
        await prisma.messageRead.create({
          data: {
            messageId: msg.id,
            userId: admin.id
          }
        }).catch(() => {}); // Ignore duplicates
      }
    }

    console.log('Sample messages created successfully!');
  } catch (error) {
    console.error('Error creating sample messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleMessages();