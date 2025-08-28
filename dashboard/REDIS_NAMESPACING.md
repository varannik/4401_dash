# Redis Namespacing Implementation

This document explains how Redis namespacing is implemented to prevent conflicts between multiple applications using the same Redis instance.

## Overview

Three applications use Redis:
1. **NextAuth Sessions** (Next.js) - User authentication sessions
2. **Fabric Data** (Next.js) - Token caching and data from Microsoft Fabric
3. **FastAPI Temp Data** (FastAPI) - Temporary processing data

## Namespace Structure

### 1. NextAuth Namespace (`nextauth:`)

**Purpose**: User authentication and session management

**Key Patterns**:
```
nextauth:user:{userId}                    # User data
nextauth:session:{sessionId}              # Session data
nextauth:account:{provider}:{accountId}   # OAuth account data
nextauth:email:{email}                    # Email to user ID mapping
nextauth:token:{verificationToken}        # Verification tokens
```

**Example Keys**:
```
nextauth:user:12345678-1234-1234-1234-123456789abc
nextauth:session:abcdef12-3456-7890-abcd-ef1234567890
nextauth:account:azure:user@example.com
nextauth:email:user@example.com
```

### 2. Fabric Data Namespace (`fabric:`)

**Purpose**: Microsoft Fabric SQL data and token caching

**Key Patterns**:
```
fabric:user:{userId}:tokens               # User's AAD tokens
fabric:data:chart:{chartId}:{dataType}    # Chart data
fabric:cache:query:{queryId}              # Query cache
fabric:test:connection                    # Connection test data
```

**Example Keys**:
```
fabric:user:12345678-1234-1234-1234-123456789abc:tokens
fabric:data:chart:co2-flow:realtime
fabric:data:chart:temperature:historical
fabric:cache:query:plant-overview
fabric:test:connection
```

### 3. FastAPI Namespace (`fastapi:`)

**Purpose**: Temporary processing data and queues

**Key Patterns**:
```
fastapi:temp:data:{batchId}               # Temporary data
fastapi:queue:processing:{itemId}         # Processing queues
fastapi:results:analysis:{analysisId}     # Analysis results
fastapi:cache:model:{modelName}           # Model cache
```

**Example Keys**:
```
fastapi:temp:data:batch-12345
fastapi:queue:processing:item-67890
fastapi:results:analysis:analysis-abc123
fastapi:cache:model:anomaly-detector
```

## Configuration

### NextAuth Configuration

```typescript
// dashboard/lib/auth.ts
export const authOptions: NextAuthOptions = {
  adapter: RedisAdapter(getRedisClient, {
    accountKeyPrefix: "nextauth:account:",
    accountByUserIdPrefix: "nextauth:account:by-user-id:",
    emailKeyPrefix: "nextauth:email:",
    sessionKeyPrefix: "nextauth:session:",
    sessionByUserIdKeyPrefix: "nextauth:session:by-user-id:",
    userKeyPrefix: "nextauth:user:",
    verificationTokenKeyPrefix: "nextauth:token:",
  }),
  // ... rest of configuration
}
```

### TokenCache Configuration

```typescript
// dashboard/lib/redis.ts
export const TokenCache = {
  async setUserTokens(userId: string, tokens: any): Promise<void> {
    const key = `fabric:user:${userId}:tokens`  // Namespaced key
    // ... implementation
  },

  async getUserTokens(userId: string): Promise<any | null> {
    const key = `fabric:user:${userId}:tokens`  // Namespaced key
    // ... implementation
  },

  async deleteUserTokens(userId: string): Promise<void> {
    const key = `fabric:user:${userId}:tokens`  // Namespaced key
    // ... implementation
  }
}
```

## TTL Configuration

Different data types have different TTL (Time To Live) settings:

```typescript
const TTL = {
  // NextAuth
  SESSION: 3600,        // 1 hour
  VERIFICATION_TOKEN: 3600, // 1 hour
  
  // Fabric Data
  TOKEN: 3300,          // 55 minutes (refresh 5 min before expiry)
  CHART_DATA: 300,      // 5 minutes (real-time updates)
  QUERY_CACHE: 600,     // 10 minutes
  
  // FastAPI
  TEMP_DATA: 3600,      // 1 hour
  PROCESSING_QUEUE: 1800, // 30 minutes
  RESULTS: 86400,       // 24 hours
  MODEL_CACHE: 3600     // 1 hour
}
```

## Redis Trigger Patterns

Azure Functions can listen to specific namespaces:

```python
# Listen to FastAPI temp data
@redis_trigger(key_pattern="fastapi:temp:data:*")
def process_fastapi_data(key: str, value: str):
    pass

# Listen to Fabric chart updates
@redis_trigger(key_pattern="fabric:data:chart:*")
def update_charts(key: str, value: str):
    pass

# Listen to NextAuth session changes
@redis_trigger(key_pattern="nextauth:session:*")
def handle_session_changes(key: str, value: str):
    pass
```

## Monitoring and Debugging

### List Keys by Namespace

```bash
# Connect to Redis
redis-cli

# List all NextAuth keys
KEYS nextauth:*

# List all Fabric keys
KEYS fabric:*

# List all FastAPI keys
KEYS fastapi:*

# List specific key types
KEYS nextauth:session:*
KEYS fabric:user:*:tokens
KEYS fastapi:temp:data:*
```

### Debug Endpoint

The debug endpoint (`/api/debug/session`) now shows keys from both namespaces:

```typescript
// Get keys from both namespaces
const [nextauthKeys, fabricKeys] = await Promise.all([
  redis.keys('nextauth:*'),
  redis.keys('fabric:*')
])
```

## Benefits

1. **No Conflicts**: Each application has its own namespace
2. **Easy Cleanup**: Can delete all keys for a specific app
3. **Better Monitoring**: Can track usage per application
4. **Selective Triggers**: Redis triggers can listen to specific namespaces
5. **Debugging**: Easy to identify which app owns which data

## Migration Notes

If you have existing data in Redis without namespaces, you may need to migrate:

```bash
# Example migration script
redis-cli --eval migrate-keys.lua

# Or manually migrate specific keys
redis-cli RENAME user:123:tokens fabric:user:123:tokens
redis-cli RENAME session:abc123 nextauth:session:abc123
```

## Best Practices

1. **Always use namespaced keys** when adding new Redis operations
2. **Use consistent naming patterns** within each namespace
3. **Set appropriate TTL** for different data types
4. **Monitor key usage** by namespace
5. **Clean up old keys** regularly
6. **Test trigger patterns** before deploying to production
