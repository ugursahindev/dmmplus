const path = require('path');

// Test database connection
async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Import Sequelize and models
    const { Sequelize } = require('sequelize');
    
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'dmm.db'),
      logging: console.log,
    });

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check if tables exist
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('\n📋 Tables found:', results.map(r => r.name));

    // Check users
    const [users] = await sequelize.query("SELECT username, role FROM users");
    console.log('\n👥 Users found:', users);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();