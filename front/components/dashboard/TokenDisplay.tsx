'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Key, Clock, Database, CheckCircle, XCircle, Copy, Eye, EyeOff, Play } from 'lucide-react'
import { getFabricSQLToken, clearTokenCache, getRedisStatus, type TokenInfo } from '@/lib/server-actions'
import { testFabricConnection } from '@/lib/fabric-server-actions'

export function TokenDisplay() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [redisStatus, setRedisStatus] = useState<{ connected: boolean; error?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFullToken, setShowFullToken] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [connectionTest, setConnectionTest] = useState<{ success: boolean; message: string; timestamp: string } | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)

  const loadTokenInfo = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [token, redis] = await Promise.all([
        getFabricSQLToken(),
        getRedisStatus()
      ])
      setTokenInfo(token)
      setRedisStatus(redis)
    } catch (err) {
      setError((err as Error).message)
      setTokenInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearCache = async () => {
    setIsLoading(true)
    try {
      await clearTokenCache()
      // Reload token info after clearing cache
      await loadTokenInfo()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (tokenInfo?.accessToken) {
      try {
        await navigator.clipboard.writeText(tokenInfo.accessToken)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const maskToken = (token: string) => {
    if (token.length <= 20) return token
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    try {
      const result = await testFabricConnection()
      setConnectionTest(result)
    } catch (err) {
      setConnectionTest({
        success: false,
        message: (err as Error).message,
        timestamp: new Date().toISOString()
      })
    } finally {
      setTestingConnection(false)
    }
  }

  useEffect(() => {
    loadTokenInfo()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Key className="w-6 h-6 mr-2 text-blue-600" />
            AAD Token for Fabric SQL
          </h2>
          <p className="text-gray-600 mt-1">
            Secure token cached in Redis for accessing Fabric SQL Analytics Endpoint
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleTestConnection}
            disabled={testingConnection || isLoading}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            <Play className={`w-4 h-4 mr-2 ${testingConnection ? 'animate-spin' : ''}`} />
            Test Connection
          </button>
          <button
            onClick={handleClearCache}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Clear Cache
          </button>
          <button
            onClick={loadTokenInfo}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Token Information */}
      {tokenInfo && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center">
                      {tokenInfo.isExpired ? (
                        <XCircle className="w-4 h-4 text-red-500 mr-1" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${tokenInfo.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                        {tokenInfo.isExpired ? 'Expired' : 'Valid'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cache Status</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      tokenInfo.cacheStatus === 'cached' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {tokenInfo.cacheStatus === 'cached' ? 'From Cache' : 'Fresh Token'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time Until Expiry</span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {tokenInfo.timeUntilExpiry}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Scope</span>
                    <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {tokenInfo.scope}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expires At</span>
                    <span className="text-sm text-gray-900">
                      {new Date(tokenInfo.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Redis Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Redis Cache Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connection</span>
                    <div className="flex items-center">
                      {redisStatus?.connected ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${redisStatus?.connected ? 'text-green-600' : 'text-red-600'}`}>
                        {redisStatus?.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  
                  {redisStatus?.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-red-700 text-sm">{redisStatus.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Token Display */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Access Token</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowFullToken(!showFullToken)}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {showFullToken ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Show Full
                      </>
                    )}
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <code className="text-sm font-mono break-all text-gray-800">
                  {showFullToken ? tokenInfo.accessToken : maskToken(tokenInfo.accessToken)}
                </code>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                Token Length: {tokenInfo.accessToken.length} characters
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !tokenInfo && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Loading token information...</span>
          </div>
        </div>
      )}

      {/* Connection Test Results */}
      {connectionTest && (
        <div className={`border rounded-lg p-4 ${
          connectionTest.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            {connectionTest.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`text-sm font-medium mb-1 ${
                connectionTest.success ? 'text-green-900' : 'text-red-900'
              }`}>
                Connection Test {connectionTest.success ? 'Successful' : 'Failed'}
              </h4>
              <p className={`text-sm ${
                connectionTest.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {connectionTest.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tested at: {new Date(connectionTest.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Development Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Database className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-1">
              Development Testing Note
            </h4>
            <p className="text-yellow-800 text-sm">
              This token is used for secure server-side access to Fabric SQL Analytics Endpoint. 
              It's automatically cached in Redis for 1 hour to avoid rate-limiting Azure AD. 
              Use this token in your server actions to query Fabric SQL securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 