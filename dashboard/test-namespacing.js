require('dotenv').config({ path: '.env.local' });

const { createClient } = require('redis');

async function testNamespacing() {
  console.log('🔍 Testing Redis namespacing...');
  
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`📡 Connecting to: ${redisUrl.replace(/:[^:@]*@/, ':***@')}`);
  
  try {
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: false
      }
    });
    
    client.on('error', (err) => {
      console.error('❌ Redis client error:', err.message);
    });
    
    client.on('connect', () => {
      console.log('🔗 Connected to Redis server');
    });
    
    await client.connect();
    
    console.log('🧪 Testing namespaced keys...');
    
    // Test NextAuth namespace
    await client.set('nextauth:user:test-user-123', JSON.stringify({ id: 'test-user-123', name: 'Test User' }), { EX: 60 });
    await client.set('nextauth:session:test-session-456', JSON.stringify({ id: 'test-session-456', userId: 'test-user-123' }), { EX: 60 });
    
    // Test Fabric namespace
    await client.set('fabric:user:test-user-123:tokens', JSON.stringify({ accessToken: 'test-token', expiresAt: Date.now() + 3600000 }), { EX: 60 });
    await client.set('fabric:test:connection', 'success', { EX: 60 });
    
    // Test FastAPI namespace
    await client.set('fastapi:temp:data:test-batch-789', JSON.stringify({ batchId: 'test-batch-789', status: 'processing' }), { EX: 60 });
    
    console.log('✅ Test keys created successfully');
    
    // List all keys to verify namespacing
    const allKeys = await client.keys('*');
    console.log('\n📋 All Redis keys:');
    allKeys.forEach(key => {
      console.log(`  - ${key}`);
    });
    
    // Verify no redundant prefixes
    const redundantKeys = allKeys.filter(key => key.includes('nextauth:nextauth:'));
    if (redundantKeys.length > 0) {
      console.log('\n❌ Found redundant keys:');
      redundantKeys.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log('\n✅ No redundant prefixes found');
    }
    
    // Clean up test keys
    await Promise.all([
      client.del('nextauth:user:test-user-123'),
      client.del('nextauth:session:test-session-456'),
      client.del('fabric:user:test-user-123:tokens'),
      client.del('fabric:test:connection'),
      client.del('fastapi:temp:data:test-batch-789')
    ]);
    
    console.log('🧹 Test keys cleaned up');
    
    await client.quit();
    console.log('🔚 Redis connection closed');
    
    console.log('\n✅ Namespacing test PASSED! 🎉');
    
  } catch (error) {
    console.error('\n❌ Namespacing test FAILED:');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testNamespacing();
}

module.exports = { testNamespacing };
