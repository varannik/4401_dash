'use server'

import { getMSALTokenService } from './msal-service'
import sql from 'mssql'

/**
 * Example Server Action for querying Fabric SQL securely
 * This demonstrates the proper pattern for using cached AAD tokens
 */
export async function queryFabricSQL(query: string): Promise<any[]> {
  try {
    // Get the cached AAD token (will refresh if expired)
    const msalService = getMSALTokenService()
    const accessToken = await msalService.getAccessToken('https://database.windows.net/.default')
    
    // Configure SQL connection with AAD token
    const config: sql.config = {
      server: process.env.FABRIC_SQL_SERVER!,
      database: process.env.FABRIC_SQL_DATABASE!,
      port: parseInt(process.env.FABRIC_SQL_PORT || '1433'),
      authentication: {
        type: 'azure-active-directory-access-token',
        options: {
          token: accessToken
        }
      },
      options: {
        encrypt: true,
        trustServerCertificate: false,
        connectTimeout: 30000,
        requestTimeout: 30000
      }
    }

    // Execute query securely on server
    const pool = await sql.connect(config)
    const result = await pool.request().query(query)
    await pool.close()
    
    console.log(`✅ Fabric SQL query executed successfully, returned ${result.recordset.length} rows`)
    return result.recordset
    
  } catch (error) {
    console.error('❌ Fabric SQL query failed:', error)
    throw new Error(`Fabric SQL query failed: ${(error as Error).message}`)
  }
}

/**
 * Example: Get sample data from Fabric SQL
 */
export async function getSampleFabricData(): Promise<any[]> {
  const sampleQuery = `
    SELECT TOP 10 
      GETDATE() as query_time,
      'Sample Data' as data_type,
      NEWID() as sample_id,
      RAND() * 100 as sample_value
  `
  
  return await queryFabricSQL(sampleQuery)
}

/**
 * Example: Test connection to Fabric SQL
 */
export async function testFabricConnection(): Promise<{ success: boolean; message: string; timestamp: string }> {
  try {
    const result = await queryFabricSQL('SELECT GETDATE() as current_time, @@VERSION as sql_version')
    
    return {
      success: true,
      message: `Connected successfully. Server time: ${result[0]?.current_time}`,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Security Note: 
 * These server actions run on the server and have access to environment variables
 * and cached tokens. The client never sees the actual tokens or connection strings.
 * 
 * Usage in client components:
 * 
 * import { getSampleFabricData, testFabricConnection } from '@/lib/fabric-server-actions'
 * 
 * // In your component:
 * const handleTest = async () => {
 *   const result = await testFabricConnection()
 *   console.log(result)
 * }
 * 
 * const loadData = async () => {
 *   const data = await getSampleFabricData()
 *   setData(data)
 * }
 */ 