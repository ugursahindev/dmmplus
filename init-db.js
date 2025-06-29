const { execSync } = require('child_process');
const axios = require('axios');

// Olası portları dene
const POSSIBLE_PORTS = [3000, 3009, 3001, 3008];

async function findRunningServer() {
  for (const port of POSSIBLE_PORTS) {
    try {
      const response = await axios.get(`http://localhost:${port}`, { timeout: 2000 });
      console.log(`✅ Server found on port ${port}`);
      return port;
    } catch (error) {
      console.log(`⚠️  Port ${port} not available`);
    }
  }
  return null;
}

async function initializeDatabase(port) {
  console.log(`Starting database initialization on port ${port}...`);
  
  try {
    // Make a request to the init endpoint
    const response = await axios.post(`http://localhost:${port}/api/init`, {}, {
      params: { force: 'true' },
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log('✅ Database initialized successfully!');
      console.log('\n📝 Demo users created:');
      console.log('  - Admin: admin / 123456');
      console.log('  - IDP Personnel: idp_user / 123456');
      console.log('  - Legal Personnel: legal_user / 123456');
      console.log('  - Institution User: kurum_user / 123456');
      console.log(`\n🚀 You can now login at http://localhost:${port}/login`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    console.log('\n⚠️  Make sure the Next.js development server is running (npm run dev)');
    console.log(`⚠️  Expected server on port ${port}`);
  }
}

async function main() {
  console.log('🔍 Looking for running Next.js server...');
  
  const runningPort = await findRunningServer();
  
  if (runningPort) {
    await initializeDatabase(runningPort);
  } else {
    console.log('⚠️  No Next.js server found on any port.');
    console.log('🚀 Starting development server...');
    console.log('Please run this script again once the server is fully started.');
    
    try {
      execSync('npm run dev', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Failed to start development server. Please run "npm run dev" manually.');
    }
  }
}

main().catch(console.error);