import { ConfidentialClientApplication, ClientCredentialRequest } from '@azure/msal-node'
import { getRedisClient } from './redis'

export interface CachedToken {
  accessToken: string
  expiresAt: number
  scope: string
}

class MSALTokenService {
  private msalInstance: ConfidentialClientApplication
  private readonly CACHE_PREFIX = 'msal_token:'
  private readonly CACHE_TTL = 3300 // 55 minutes (tokens expire in 1h, refresh 5min early)

  constructor() {
    const clientConfig = {
      auth: {
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`
      }
    }

    this.msalInstance = new ConfidentialClientApplication(clientConfig)
    console.log('🔐 MSAL Token Service initialized')
  }

  private getCacheKey(scope: string): string {
    return `${this.CACHE_PREFIX}${scope.replace(/[^a-zA-Z0-9]/g, '_')}`
  }

  async getAccessToken(scope: string = 'https://database.windows.net/.default'): Promise<string> {
    const cacheKey = this.getCacheKey(scope)
    const redis = await getRedisClient()
    
    try {
      // Try to get cached token
      const cachedTokenData = await redis.get(cacheKey)
      if (cachedTokenData) {
        const cachedToken: CachedToken = JSON.parse(cachedTokenData)
        
        // Check if token is still valid (5 min buffer)
        if (cachedToken.expiresAt > Date.now() + 300000) {
          console.log('🎫 Using cached MSAL token')
          return cachedToken.accessToken
        } else {
          console.log('⏰ Cached token expired, removing from cache')
          await redis.del(cacheKey)
        }
      }

      // Request new token
      console.log('🔄 Requesting new MSAL token...')
      const clientCredentialRequest: ClientCredentialRequest = {
        scopes: [scope]
      }

      const response = await this.msalInstance.acquireTokenByClientCredential(clientCredentialRequest)
      
      if (!response?.accessToken) {
        throw new Error('Failed to acquire access token from MSAL')
      }

      // Cache the token
      const tokenToCache: CachedToken = {
        accessToken: response.accessToken,
        expiresAt: response.expiresOn?.getTime() || (Date.now() + 3600000), // Default 1h
        scope
      }

            await redis.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(tokenToCache))

      console.log(`✅ New MSAL token acquired and cached, expires: ${new Date(tokenToCache.expiresAt).toISOString()}`)
      return response.accessToken

    } catch (error) {
      console.error('❌ MSAL token acquisition failed:', error)
      throw new Error(`Failed to acquire access token: ${(error as Error).message}`)
    }
  }

  async clearTokenCache(scope?: string): Promise<void> {
    const redis = await getRedisClient()
    try {
      if (scope) {
        const cacheKey = this.getCacheKey(scope)
        await redis.del(cacheKey)
        console.log(`🧹 Cleared token cache for scope: ${scope}`)
      } else {
        // Clear all MSAL tokens
        const keys = await redis.keys(`${this.CACHE_PREFIX}*`)
        if (keys.length > 0) {
          // Delete keys one by one to avoid spread operator issues
          for (const key of keys) {
            await redis.del(key)
          }
          console.log(`🧹 Cleared ${keys.length} cached MSAL tokens`)
        }
      }
    } catch (error) {
      console.error('❌ Error clearing token cache:', error)
    }
  }

  async getTokenInfo(scope: string = 'https://database.windows.net/.default'): Promise<CachedToken | null> {
    const redis = await getRedisClient()
    try {
      const cacheKey = this.getCacheKey(scope)
      const cachedTokenData = await redis.get(cacheKey)
      
      if (cachedTokenData) {
        return JSON.parse(cachedTokenData)
      }
      return null
    } catch (error) {
      console.error('❌ Error getting token info:', error)
      return null
    }
  }
}

// Singleton instance
let msalTokenService: MSALTokenService | null = null

export function getMSALTokenService(): MSALTokenService {
  if (!msalTokenService) {
    msalTokenService = new MSALTokenService()
  }
  return msalTokenService
}

export default MSALTokenService 