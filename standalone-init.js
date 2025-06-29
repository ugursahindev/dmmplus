const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const path = require('path');

async function initializeDatabase() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'dmm.db'),
    logging: console.log,
  });

  try {
    // Define User model
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'full_name',
      },
      role: {
        type: DataTypes.ENUM('idp_personnel', 'legal_personnel', 'admin', 'institution_user'),
        allowNull: false,
      },
      institution: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }, {
      tableName: 'users',
      timestamps: true,
      underscored: true,
    });

    // Define Case model
    const Case = sequelize.define('Case', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      caseNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'case_number',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      platform: {
        type: DataTypes.ENUM('twitter', 'facebook', 'instagram', 'youtube', 'whatsapp', 'telegram', 'tiktok', 'other'),
        allowNull: false,
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('idp_form', 'hukuk_incelemesi', 'son_kontrol', 'rapor_uretimi', 'kurum_bekleniyor', 'tamamlandi'),
        allowNull: false,
        defaultValue: 'idp_form',
      },
      tags: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      geographicScope: {
        type: DataTypes.ENUM('local', 'regional', 'national', 'international'),
        allowNull: false,
        field: 'geographic_scope',
      },
      sourceType: {
        type: DataTypes.ENUM('social_media', 'news_site', 'blog', 'forum', 'messaging_app', 'other'),
        allowNull: false,
        field: 'source_type',
      },
      sourceUrl: {
        type: DataTypes.STRING,
        field: 'source_url',
      },
      createdById: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_by_id',
      },
    }, {
      tableName: 'cases',
      timestamps: true,
      underscored: true,
    });

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Create demo users
    const users = await User.bulkCreate([
      {
        username: 'admin',
        password: await bcrypt.hash('123456', 12),
        email: 'admin@dmm.gov.tr',
        fullName: 'Sistem Yöneticisi',
        role: 'admin',
        active: true,
      },
      {
        username: 'idp_user',
        password: await bcrypt.hash('123456', 12),
        email: 'idp@dmm.gov.tr',
        fullName: 'İnceleme Değerlendirme Personeli',
        role: 'idp_personnel',
        active: true,
      },
      {
        username: 'legal_user',
        password: await bcrypt.hash('123456', 12),
        email: 'hukuk@dmm.gov.tr',
        fullName: 'Hukuk Müşaviri',
        role: 'legal_personnel',
        active: true,
      },
      {
        username: 'kurum_user',
        password: await bcrypt.hash('123456', 12),
        email: 'kurum@meb.gov.tr',
        fullName: 'MEB Temsilcisi',
        role: 'institution_user',
        institution: 'Milli Eğitim Bakanlığı',
        active: true,
      },
    ]);

    console.log('✅ Demo users created');
    console.log('\n📝 Users:');
    users.forEach(user => {
      console.log(`  - ${user.username} / 123456 (${user.role})`);
    });

    await sequelize.close();
    console.log('\n✅ Database initialization completed!');
  } catch (error) {
    console.error('❌ Error:', error);
    await sequelize.close();
  }
}

initializeDatabase();