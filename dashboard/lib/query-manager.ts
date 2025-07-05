import { promises as fs } from 'fs'
import path from 'path'
import { queryFabricSQL } from './fabric-server-actions'

/**
 * Query Manager - Manages database queries from SQL files
 * Provides a centralized way to execute SQL queries from organized files
 */
export class QueryManager {
  private static queriesBasePath = path.join(process.cwd(), 'database', 'queries')
  
  /**
   * Read SQL query from file
   * @param filename - SQL file name (without extension)
   * @param queryIndex - Index of query in file (0-based, optional)
   * @returns SQL query string
   */
  private static async readQueryFromFile(filename: string, queryIndex: number = 0): Promise<string> {
    try {
      const filePath = path.join(this.queriesBasePath, `${filename}.sql`)
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Split by semicolon and filter out comments and empty lines
      const queries = content
        .split(';')
        .map(query => query.trim())
        .filter(query => query.length > 0 && !query.startsWith('--'))
      
      if (queryIndex >= queries.length) {
        throw new Error(`Query index ${queryIndex} not found in ${filename}.sql`)
      }
      
      return queries[queryIndex]
    } catch (error) {
      console.error(`Error reading query from ${filename}.sql:`, error)
      throw new Error(`Failed to read query from ${filename}.sql: ${(error as Error).message}`)
    }
  }
  
  /**
   * Execute a specific query from a SQL file
   * @param filename - SQL file name (without extension)
   * @param queryIndex - Index of query in file (0-based)
   * @returns Query results
   */
  public static async executeQuery(filename: string, queryIndex: number = 0): Promise<any[]> {
    const query = await this.readQueryFromFile(filename, queryIndex)
    console.log(`📋 Executing query from ${filename}.sql [${queryIndex}]:`, query.substring(0, 100) + '...')
    
    return await queryFabricSQL(query)
  }
  
  /**
   * Execute all queries from a SQL file
   * @param filename - SQL file name (without extension)
   * @returns Array of query results
   */
  public static async executeAllQueries(filename: string): Promise<any[][]> {
    try {
      const filePath = path.join(this.queriesBasePath, `${filename}.sql`)
      const content = await fs.readFile(filePath, 'utf-8')
      
      // Split by semicolon and filter out comments and empty lines
      const queries = content
        .split(';')
        .map(query => query.trim())
        .filter(query => query.length > 0 && !query.startsWith('--'))
      
      console.log(`📋 Executing ${queries.length} queries from ${filename}.sql`)
      
      const results: any[][] = []
      for (let i = 0; i < queries.length; i++) {
        const result = await queryFabricSQL(queries[i])
        results.push(result)
      }
      
      return results
    } catch (error) {
      console.error(`Error executing queries from ${filename}.sql:`, error)
      throw new Error(`Failed to execute queries from ${filename}.sql: ${(error as Error).message}`)
    }
  }
  
  /**
   * Execute a parameterized query (with replacements)
   * @param filename - SQL file name (without extension)
   * @param queryIndex - Index of query in file (0-based)
   * @param parameters - Object with parameter replacements
   * @returns Query results
   */
  public static async executeParameterizedQuery(
    filename: string, 
    queryIndex: number = 0, 
    parameters: Record<string, string | number> = {}
  ): Promise<any[]> {
    let query = await this.readQueryFromFile(filename, queryIndex)
    
    // Replace parameters in the query
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{{${key}}}`
      query = query.replace(new RegExp(placeholder, 'g'), String(value))
    }
    
    console.log(`📋 Executing parameterized query from ${filename}.sql [${queryIndex}]:`, query.substring(0, 100) + '...')
    
    return await queryFabricSQL(query)
  }
}

/**
 * Query execution shortcuts for common patterns
 */
export const DatabaseQueries = {
  // Plant Overview
  getPlantOverviewMetrics: () => QueryManager.executeQuery('plant-overview', 0),
  getPlantHistoricalData: () => QueryManager.executeQuery('plant-overview', 1),
  getPlantSystemStatus: () => QueryManager.executeQuery('plant-overview', 2),
  
  // DAC
  getDACMetrics: () => QueryManager.executeQuery('dac', 0),
  getDACTrends: () => QueryManager.executeQuery('dac', 1),
  getDACMaintenance: () => QueryManager.executeQuery('dac', 2),
  getDACAlerts: () => QueryManager.executeQuery('dac', 3),
  
  // Commercial
  getCommercialSummary: () => QueryManager.executeQuery('commercial', 0),
  getCommercialMonthlyData: () => QueryManager.executeQuery('commercial', 1),
  getCommercialBreakdown: () => QueryManager.executeQuery('commercial', 2),
  getCommercialKPIs: () => QueryManager.executeQuery('commercial', 3),
  
  // Energy
  getEnergyMetrics: () => QueryManager.executeQuery('energy', 0),
  getEnergyConsumption: () => QueryManager.executeQuery('energy', 1),
  getEnergySystemConfig: () => QueryManager.executeQuery('energy', 2),
  getEnergyBackupInfo: () => QueryManager.executeQuery('energy', 3),
  
  // Battery
  getBatteryStatus: () => QueryManager.executeQuery('battery', 0),
  getBatteryHistory: () => QueryManager.executeQuery('battery', 1),
  getBatteryConfig: () => QueryManager.executeQuery('battery', 2),
  getBatteryAlerts: () => QueryManager.executeQuery('battery', 3),
  
  // MMRV
  getMMRVMetrics: () => QueryManager.executeQuery('mmrv', 0),
  getMMRVTrends: () => QueryManager.executeQuery('mmrv', 1),
  getMMRVVerification: () => QueryManager.executeQuery('mmrv', 2),
  getMMRVEquipment: () => QueryManager.executeQuery('mmrv', 3),
  getMMRVReports: () => QueryManager.executeQuery('mmrv', 4),
  
  // Carbon Certified
  getCarbonCertificationSummary: () => QueryManager.executeQuery('carbon-certified', 0),
  getCarbonCertificationTimeline: () => QueryManager.executeQuery('carbon-certified', 1),
  getCarbonCertificationProgress: () => QueryManager.executeQuery('carbon-certified', 2),
  getCarbonCertificationMethodologies: () => QueryManager.executeQuery('carbon-certified', 3),
  getCarbonVerificationActivities: () => QueryManager.executeQuery('carbon-certified', 4),
  
  // Carbon Credits
  getCarbonCreditsSummary: () => QueryManager.executeQuery('carbon-credits', 0),
  getCarbonCreditsHistory: () => QueryManager.executeQuery('carbon-credits', 1),
  getCarbonCreditsOpportunities: () => QueryManager.executeQuery('carbon-credits', 2),
  getCarbonCreditsPricing: () => QueryManager.executeQuery('carbon-credits', 3),
  getCarbonCreditsRegistry: () => QueryManager.executeQuery('carbon-credits', 4),
} 