require('dotenv').config({ path: '.env.local' });

const { createClient } = require('redis');

async function testRedisConnection() {
  console.log('🔍 Testing Redis connection...');
  
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  console.log(`📡 Connecting to: ${redisUrl.replace(/:[^:@]*@/, ':***@')}`);
  
  try {
    // Validate URL format
    const url = new URL(redisUrl);
    if (!['redis:', 'rediss:'].includes(url.protocol)) {
      throw new Error(`Invalid Redis protocol: ${url.protocol}. Must be redis:// or rediss://`);
    }
    
    // Create client
    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: false // Don't retry for test
      }
    });
    
    // Event listeners
    client.on('error', (err) => {
      console.error('❌ Redis client error:', err.message);
    });
    
    client.on('connect', () => {
      console.log('🔗 Connected to Redis server');
    });
    
    client.on('ready', () => {
      console.log('✅ Redis client ready');
    });
    
    // Connect
    await client.connect();
    
    // Test basic operations
    console.log('🧪 Testing basic operations...');
    
    // Set a test key with namespaced prefix
    await client.set('fabric:test:connection', 'success', { EX: 10 });
    console.log('✅ SET operation successful');
    
    // Get the test key
    const value = await client.get('fabric:test:connection');
    if (value === 'success') {
      console.log('✅ GET operation successful');
    } else {
      console.log('❌ GET operation failed - unexpected value:', value);
    }
    
    // Clean up
    await client.del('fabric:test:connection');
    console.log('✅ DEL operation successful');
    
    // Close connection
    await client.quit();
    console.log('🔚 Redis connection closed');
    
    console.log('\n✅ Redis connection test PASSED! 🎉');
    
  } catch (error) {
    console.error('\n❌ Redis connection test FAILED:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure Redis server is running');
      console.log('2. For local Redis: docker run -p 6379:6379 -d redis');
      console.log('3. Or install Redis locally: brew install redis && brew services start redis');
      console.log('4. Check your REDIS_URL environment variable');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  testRedisConnection();
}

module.exports = { testRedisConnection }; 