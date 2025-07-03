/**
 * Environment validation and Redis connection checker
 */

export function validateEnvironment() {
  const required = [
    'NEXTAUTH_SECRET',
    'AZURE_AD_CLIENT_ID',
    'AZURE_AD_CLIENT_SECRET',
    'AZURE_AD_TENANT_ID'
  ]

  const optional = [
    'REDIS_URL',
    'REDIS_PASSWORD',
    'FABRIC_SQL_SERVER',
    'FABRIC_SQL_DATABASE'
  ]

  console.log('🔍 Environment Variable Check:')
  
  // Check required variables
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing)
    return false
  } else {
    console.log('✅ All required environment variables are set')
  }

  // Check optional variables
  optional.forEach(key => {
    if (process.env[key]) {
      console.log(`✅ ${key}: Set`)
    } else {
      console.log(`⚠️  ${key}: Not set (optional)`)
    }
  })

  // Validate Redis URL format
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  console.log(`🔗 Redis URL: ${redisUrl.replace(/:[^:@]*@/, ':***@')}`)
  
  try {
    const url = new URL(redisUrl)
    if (!['redis:', 'rediss:'].includes(url.protocol)) {
      console.error(`❌ Invalid Redis protocol: ${url.protocol}. Must be redis:// or rediss://`)
      return false
    }
    console.log('✅ Redis URL format is valid')
  } catch (error) {
    console.error('❌ Invalid Redis URL format:', error)
    return false
  }

  return true
}

export function getRedisInfo() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  
  try {
    const url = new URL(redisUrl)
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'rediss:' ? '6380' : '6379'),
      hasPassword: !!url.password || !!process.env.REDIS_PASSWORD,
      username: url.username || undefined
    }
  } catch (error) {
    return null
  }
}

// Development helper
if (process.env.NODE_ENV === 'development') {
  validateEnvironment()
} 