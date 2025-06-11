'use server'

import { getMSALTokenService } from './msal-service'
import { getRedisClient } from './redis'

export interface TokenInfo {
  accessToken: string
  expiresAt: number
  scope: string
  isExpired: boolean
  timeUntilExpiry: string
  cacheStatus: 'cached' | 'fresh'
}

/**
 * Server Action to securely get AAD token for Fabric SQL
 * Caches token in Redis for 1 hour to avoid rate-limiting AAD
 */
export async function getFabricSQLToken(): Promise<TokenInfo> {
  try {
    const msalService = getMSALTokenService()
    const scope = 'https://database.windows.net/.default'
    
    // Get token info from cache first
    const cachedTokenInfo = await msalService.getTokenInfo(scope)
    let cacheStatus: 'cached' | 'fresh' = 'cached'
    
    // Get fresh token (will use cache if valid, or fetch new)
    const accessToken = await msalService.getAccessToken(scope)
    
    // Get updated token info after potential refresh
    const tokenInfo = await msalService.getTokenInfo(scope)
    
    if (!tokenInfo) {
      throw new Error('Unable to retrieve token information')
    }
    
    // Check if we got a fresh token
    if (!cachedTokenInfo || cachedTokenInfo.accessToken !== tokenInfo.accessToken) {
      cacheStatus = 'fresh'
    }
    
    const now = Date.now()
    const isExpired = tokenInfo.expiresAt <= now
    const timeUntilExpiry = isExpired 
      ? 'Expired' 
      : formatTimeUntilExpiry(tokenInfo.expiresAt - now)
    
    return {
      accessToken: tokenInfo.accessToken,
      expiresAt: tokenInfo.expiresAt,
      scope: tokenInfo.scope,
      isExpired,
      timeUntilExpiry,
      cacheStatus
    }
  } catch (error) {
    console.error('Failed to get Fabric SQL token:', error)
    throw new Error(`Failed to retrieve Fabric SQL token: ${(error as Error).message}`)
  }
}

/**
 * Server Action to clear the token cache
 */
export async function clearTokenCache(): Promise<boolean> {
  try {
    const msalService = getMSALTokenService()
    await msalService.clearTokenCache()
    return true
  } catch (error) {
    console.error('Failed to clear token cache:', error)
    return false
  }
}

/**
 * Server Action to get Redis connection status
 */
export async function getRedisStatus(): Promise<{ connected: boolean; error?: string }> {
  try {
    const redis = await getRedisClient()
    await redis.ping()
    return { connected: true }
  } catch (error) {
    return { 
      connected: false, 
      error: (error as Error).message 
    }
  }
}

function formatTimeUntilExpiry(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  } else {
    return `${minutes}m`
  }
} 