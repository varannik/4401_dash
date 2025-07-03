import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TokenCache, getRedisClient } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Debug endpoint only available in development' }, { status: 403 })
    }

    // Get session
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        session: null,
        userId: null,
        tokens: null 
      }, { status: 401 })
    }

    console.log('Debug - Session object:', session)
    console.log('Debug - Session userId:', session.userId)

    let tokens = null
    let redisKeys: string[] = []
    
    if (session.userId) {
      // Try to get tokens from Redis
      tokens = await TokenCache.getUserTokens(session.userId)
      console.log('Debug - Tokens from Redis:', !!tokens)
      
      // Get all Redis keys to see what's stored
      try {
        const redis = await getRedisClient()
        redisKeys = await redis.keys('user:*')
        console.log('Debug - Redis keys found:', redisKeys)
      } catch (error) {
        console.error('Debug - Error getting Redis keys:', error)
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        session: {
          userId: session.userId,
          user: session.user,
          expires: session.expires
        },
        tokens: tokens ? {
          hasAccessToken: !!tokens.accessToken,
          hasIdToken: !!tokens.idToken,
          hasRefreshToken: !!tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          isExpired: tokens.expiresAt ? tokens.expiresAt < Date.now() : 'unknown'
        } : null,
        redis: {
          connected: true,
          keysFound: redisKeys.length,
          userKeys: redisKeys.filter(key => key.includes('tokens')),
          allKeys: redisKeys
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug session error:', error)
    
    return NextResponse.json({
      error: 'Debug session failed',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 