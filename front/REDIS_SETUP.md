# Redis Setup Guide

This implementation uses the official [Redis Node.js client](https://github.com/redis/node-redis) for session storage and token management.

## Why Official Redis Client?

The official `redis` package provides:
- ✅ **Official Support**: Maintained by the Redis team
- ✅ **Better Performance**: Auto-pipelining and client-side caching
- ✅ **Modern Features**: RESP3 support, TypeScript types
- ✅ **Active Development**: Regular updates and security patches

## Installation

```bash
npm install redis@^4.7.0
```

## Redis Server Setup

### Option 1: Local Redis (Development)
```bash
# Using Docker
docker run -p 6379:6379 -d redis:8.0-rc1

# Using Homebrew (macOS)
brew install redis
brew services start redis

# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

### Option 2: Redis Cloud (Production)
1. Sign up at [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Copy the connection string to your `.env` file

### Option 3: Other Cloud Providers
- **AWS ElastiCache**
- **Azure Cache for Redis**
- **Google Cloud Memorystore**

## Environment Configuration

Add to your `.env.local` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# For Redis Cloud or TLS connections
# REDIS_URL=rediss://username:password@your-redis-endpoint:port
```

## Features Used

### 1. Session Storage
- User sessions stored in Redis with automatic expiration
- Better performance than JWT for large session data
- Shared sessions across multiple app instances

### 2. Token Caching
- Azure AD tokens cached with automatic TTL
- Prevents unnecessary token requests
- Secure token storage with Redis encryption

### 3. Auto-Pipelining
The Redis client automatically pipelines multiple commands for better performance:

```javascript
// These commands are automatically pipelined
await Promise.all([
  TokenCache.setUserTokens(userId, tokens),
  client.set('session:123', sessionData),
  client.expire('user:456', 3600)
]);
```

## Monitoring and Debugging

### Redis CLI Commands
```bash
# Connect to Redis
redis-cli

# Check connection
PING

# List all keys
KEYS *

# Check user tokens
GET user:your-user-id:tokens

# Check session data
KEYS user:session:*
```

### Application Logs
The implementation includes comprehensive logging:
- Connection status
- Token cache hits/misses
- Session operations
- Error handling

## Security Best Practices

1. **Use TLS in Production**
   ```env
   REDIS_URL=rediss://your-secure-endpoint
   ```

2. **Set Strong Password**
   ```env
   REDIS_PASSWORD=your-very-secure-password
   ```

3. **Network Security**
   - Use private networks
   - Implement proper firewall rules
   - Consider Redis AUTH and ACLs

4. **Data Encryption**
   - Redis encryption at rest
   - TLS for data in transit

## Performance Optimization

### Connection Pooling
The Redis client automatically manages connections with:
- Automatic reconnection
- Connection health checks
- Graceful error handling

### Memory Management
Configure Redis for optimal memory usage:

```redis
# Redis configuration
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:6379
   ```
   - Check if Redis server is running
   - Verify Redis URL and port

2. **Authentication Error**
   ```
   Error: NOAUTH Authentication required
   ```
   - Check Redis password configuration
   - Verify environment variables

3. **Memory Issues**
   ```
   Error: OOM command not allowed when used memory > 'maxmemory'
   ```
   - Increase Redis memory limit
   - Implement proper TTL for keys

### Debug Mode
Enable debug logging in development:

```javascript
// In your Redis client configuration
const client = createClient({
  url: process.env.REDIS_URL,
  debug: process.env.NODE_ENV === 'development'
});
```

## Migration from ioredis

If migrating from ioredis, the main differences are:

1. **Client Creation**
   ```javascript
   // ioredis
   const redis = new Redis(url)
   
   // Official client
   const redis = createClient({ url })
   await redis.connect()
   ```

2. **Command Names**
   ```javascript
   // ioredis
   await redis.setex(key, ttl, value)
   
   // Official client
   await redis.setEx(key, ttl, value)
   ```

3. **Error Handling**
   ```javascript
   // Both support similar error events
   redis.on('error', (err) => console.error(err))
   ```

## Next Steps

1. Install the Redis client: `npm install`
2. Set up your Redis server (local or cloud)
3. Configure environment variables
4. Test the connection
5. Deploy and monitor

For more information, visit the [official Redis documentation](https://redis.io/docs/). 