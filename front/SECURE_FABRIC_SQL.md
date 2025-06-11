# Secure Fabric SQL Implementation

This implementation provides a secure way to access Microsoft Fabric SQL Analytics Endpoint using Next.js Server Actions with Redis token caching.

## 🔐 Security Architecture

### Why Server Actions?
- **No Client-Side Secret Exposure**: AAD tokens and connection strings never reach the browser
- **Server-Side Execution**: All database operations happen on the server
- **Automatic Security**: Built-in CSRF protection and secure request handling

### Token Caching Strategy
- **Redis Storage**: Tokens are cached in Redis with automatic expiration
- **1 Hour TTL**: Tokens are cached for 55 minutes (refresh 5 minutes before expiry)
- **Rate Limiting Protection**: Avoids hitting Azure AD rate limits
- **Automatic Refresh**: Expired tokens are automatically refreshed

## 📁 File Structure

```
lib/
├── server-actions.ts          # Token management server actions
├── fabric-server-actions.ts   # Fabric SQL query server actions
├── msal-service.ts           # MSAL token service with Redis caching
└── redis.ts                  # Redis client configuration

components/dashboard/
└── TokenDisplay.tsx          # Token testing dashboard component

app/dashboard/
└── page.tsx                  # Updated dashboard without metrics
```

## 🚀 Usage Examples

### 1. Basic Token Retrieval

```typescript
import { getFabricSQLToken } from '@/lib/server-actions'

export async function myServerAction() {
  const tokenInfo = await getFabricSQLToken()
  console.log('Token expires at:', new Date(tokenInfo.expiresAt))
  // Use tokenInfo.accessToken for database connections
}
```

### 2. Fabric SQL Query

```typescript
import { queryFabricSQL } from '@/lib/fabric-server-actions'

export async function getCustomData() {
  const query = `
    SELECT TOP 100 
      column1, 
      column2, 
      created_date
    FROM your_fabric_table
    WHERE created_date >= DATEADD(day, -7, GETDATE())
  `
  
  const results = await queryFabricSQL(query)
  return results
}
```

### 3. Connection Testing

```typescript
import { testFabricConnection } from '@/lib/fabric-server-actions'

export async function healthCheck() {
  const result = await testFabricConnection()
  return result // { success: boolean, message: string, timestamp: string }
}
```

## 🔧 Environment Variables

Required environment variables in `.env.local`:

```bash
# Azure AD Configuration
AZURE_AD_CLIENT_ID=your-client-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Fabric SQL Configuration
FABRIC_SQL_SERVER=your-fabric-server.database.windows.net
FABRIC_SQL_DATABASE=your-database-name
FABRIC_SQL_PORT=1433
```

## 🛡️ Security Features

### 1. Token Security
- Tokens are never exposed to client-side code
- Stored in Redis with automatic expiration
- Encrypted in transit and at rest

### 2. Connection Security
- TLS encryption for all database connections
- Azure AD authentication only
- No SQL injection vulnerabilities (parameterized queries)

### 3. Access Control
- Server Actions run with server-side privileges
- User session validation through NextAuth
- Protected routes with authentication checks

## 📊 Dashboard Features

### Token Information Display
- Real-time token status and expiration
- Cache status (cached vs fresh token)
- Redis connection monitoring
- Token masking for security

### Testing Tools
- Connection test functionality
- Cache management (clear cache)
- Token refresh capabilities
- Error handling and display

## 🔄 Token Lifecycle

1. **First Request**: Token is requested from Azure AD
2. **Caching**: Token is stored in Redis with 55-minute TTL
3. **Subsequent Requests**: Token is retrieved from cache
4. **Near Expiry**: Token is automatically refreshed 5 minutes before expiry
5. **Expiry**: Expired tokens are removed from cache

## 🚫 What NOT to Do

❌ **Don't expose tokens to client-side**:
```typescript
// BAD - Never do this
'use client'
const token = await fetch('/api/get-token') // Exposes token to browser
```

❌ **Don't bypass Server Actions**:
```typescript
// BAD - Direct client-side database access
const connection = new sql.ConnectionPool(config) // Exposes credentials
```

❌ **Don't store tokens in localStorage**:
```typescript
// BAD - Client-side storage
localStorage.setItem('token', accessToken) // Security risk
```

## ✅ Best Practices

✅ **Use Server Actions for all database operations**:
```typescript
'use server'
export async function secureQuery() {
  // Server-side only
}
```

✅ **Cache tokens appropriately**:
```typescript
// Automatic caching in Redis with proper TTL
const token = await msalService.getAccessToken()
```

✅ **Handle errors gracefully**:
```typescript
try {
  const result = await queryFabricSQL(query)
  return result
} catch (error) {
  console.error('Query failed:', error)
  throw new Error('Database operation failed')
}
```

## 🔍 Monitoring

### Redis Monitoring
- Connection status in dashboard
- Cache hit/miss tracking
- Token expiration monitoring

### Performance Monitoring
- Query execution time logging
- Token refresh frequency tracking
- Error rate monitoring

## 🚀 Deployment Considerations

### Production Environment
- Use Redis with authentication and TLS
- Set proper CORS policies
- Monitor token usage patterns
- Implement rate limiting

### Azure Configuration
- Configure App Registration with proper scopes
- Set up managed identity for production
- Use Azure Key Vault for secrets
- Enable audit logging

## 📝 Notes

- This implementation is for **testing purposes** - remove token display in production
- Always use parameterized queries to prevent SQL injection
- Monitor Azure AD token usage to avoid rate limits
- Regularly rotate client secrets and connection strings
- Test token refresh scenarios thoroughly 