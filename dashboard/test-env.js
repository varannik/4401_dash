require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing environment variables...');
console.log('');

console.log('REDIS_URL:', process.env.REDIS_URL ? '✅ Set' : '❌ Not set');
if (process.env.REDIS_URL) {
  console.log('  Value:', process.env.REDIS_URL.replace(/:[^:@]*@/, ':***@'));
}

console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '✅ Set' : '❌ Not set');
if (process.env.REDIS_PASSWORD) {
  console.log('  Value:', process.env.REDIS_PASSWORD.substring(0, 10) + '...');
}

console.log('COSMOS_DB_ENDPOINT:', process.env.COSMOS_DB_ENDPOINT ? '✅ Set' : '❌ Not set');
console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? '✅ Set' : '❌ Not set');
console.log('AZURE_KEY_VAULT_URI:', process.env.AZURE_KEY_VAULT_URI ? '✅ Set' : '❌ Not set');

console.log('');
console.log('📁 Current directory:', process.cwd());
console.log('📄 .env.local exists:', require('fs').existsSync('.env.local'));
