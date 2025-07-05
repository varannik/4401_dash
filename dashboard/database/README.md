# Dashboard Data System

A comprehensive system for fetching real-time dashboard data from Microsoft Fabric SQL Analytics Endpoint using organized SQL queries and secure server actions.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Security](#security)
- [SQL Queries](#sql-queries)
- [Server Actions](#server-actions)
- [Type Safety](#type-safety)
- [Usage Examples](#usage-examples)
- [Query Management](#query-management)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🏗️ Overview

This system provides a clean, secure, and maintainable way to fetch dashboard data by:

- **🔐 Secure Authentication**: Uses existing cached AAD tokens via `getFabricSQLToken()`
- **📁 Organized Queries**: SQL queries managed in separate files for maintainability
- **🔄 Reusable Actions**: Server actions that can be called from any component
- **🎯 Type Safety**: Full TypeScript support with comprehensive type definitions
- **⚡ Performance**: Parallel query execution and efficient data fetching
- **🛡️ Error Handling**: Comprehensive error handling and logging

## 🏛️ Architecture

```
dashboard/
├── database/
│   ├── queries/                 # SQL query files
│   │   ├── plant-overview.sql
│   │   ├── dac.sql
│   │   ├── commercial.sql
│   │   ├── energy.sql
│   │   ├── battery.sql
│   │   ├── mmrv.sql
│   │   ├── carbon-certified.sql
│   │   └── carbon-credits.sql
│   └── README.md
├── lib/
│   ├── fabric-server-actions.ts # Base SQL execution
│   ├── query-manager.ts         # Query file management
│   ├── dashboard-server-actions.ts # Widget-specific actions
│   └── ...
├── types/
│   ├── dashboard-data.ts        # Type definitions
│   └── widgets.ts               # Widget types
└── components/
    └── dashboard/
        ├── detailed-widgets/    # Widget components
        └── MonitoringDashboard.tsx
```

## 🔐 Security

The system uses your existing secure token infrastructure:

- **Server-Side Only**: All database operations happen on the server
- **Cached Tokens**: Uses `getFabricSQLToken()` with automatic refresh
- **No Token Exposure**: Client never sees connection strings or tokens
- **Secure Connections**: All connections use SSL/TLS encryption

## 📄 SQL Queries

### Organization

Each widget has its own SQL file containing multiple related queries:

```sql
-- plant-overview.sql
-- Query 0: Get current plant metrics
SELECT water_flow_rate, co2_temp, ... FROM plant_overview_metrics ...

-- Query 1: Get historical flow data
SELECT DATEPART(hour, measurement_time) as hour_of_day, ... FROM plant_overview_metrics ...

-- Query 2: Get system status
SELECT system_component, status, ... FROM plant_system_status ...
```

### Available Query Files

| File | Purpose | Queries |
|------|---------|---------|
| `plant-overview.sql` | Plant operation metrics | Current metrics, historical data, system status |
| `dac.sql` | Direct Air Capture data | Metrics, trends, maintenance, alerts |
| `commercial.sql` | Revenue and financial data | Summary, monthly data, breakdown, KPIs |
| `energy.sql` | Energy management | Metrics, consumption, config, backup info |
| `battery.sql` | Battery performance | Status, history, config, alerts |
| `mmrv.sql` | Monitoring & verification | Metrics, trends, verification, equipment, reports |
| `carbon-certified.sql` | Carbon certification | Summary, timeline, progress, methodologies |
| `carbon-credits.sql` | Carbon credit trading | Summary, history, opportunities, pricing |

## ⚙️ Server Actions

### Individual Widget Actions

```typescript
// Import specific widget actions
import { 
  getPlantOverviewData,
  getDACData,
  getCommercialData,
  getEnergyData,
  getBatteryData,
  getMMRVData,
  getCarbonCertifiedData,
  getCarbonCreditsData
} from '@/lib/dashboard-server-actions'

// Fetch data for a specific widget
const plantData = await getPlantOverviewData()
```

### Combined Dashboard Action

```typescript
// Fetch all dashboard data at once
import { getAllDashboardData } from '@/lib/dashboard-server-actions'

const allData = await getAllDashboardData()
```

## 🎯 Type Safety

Full TypeScript support with comprehensive type definitions:

```typescript
import type { 
  PlantOverviewData,
  DACData,
  CommercialData,
  AllDashboardData,
  ApiResponse
} from '@/types/dashboard-data'

// Type-safe data handling
const response: ApiResponse<PlantOverviewData> = await getPlantOverviewData()
if (response.success) {
  const current = response.data.current // Fully typed
  const historical = response.data.historical // Fully typed
}
```

## 📚 Usage Examples

### Basic Widget Data Fetching

```typescript
"use client"

import { useState, useEffect } from 'react'
import { getPlantOverviewData } from '@/lib/dashboard-server-actions'
import type { PlantOverviewData } from '@/types/dashboard-data'

function PlantOverviewWidget() {
  const [data, setData] = useState<PlantOverviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getPlantOverviewData()
        if (response.success) {
          setData(response.data)
        } else {
          console.error('Failed to fetch data:', response.error)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!data) return <div>No data available</div>

  return (
    <div>
      <h3>Water Flow: {data.current?.water_flow_rate} m³/hr</h3>
      <h3>CO₂ Temperature: {data.current?.co2_temp}°C</h3>
      {/* Historical data chart */}
      <Chart data={data.historical} />
    </div>
  )
}
```

### Complete Dashboard with Error Handling

```typescript
"use client"

import { useState, useEffect } from 'react'
import { getAllDashboardData } from '@/lib/dashboard-server-actions'
import type { AllDashboardData, ApiError } from '@/types/dashboard-data'

function Dashboard() {
  const [data, setData] = useState<AllDashboardData | null>(null)
  const [errors, setErrors] = useState<ApiError[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllData() {
      try {
        const response = await getAllDashboardData()
        if (response.success) {
          setData(response.data)
          setErrors(response.errors || [])
        } else {
          console.error('Failed to fetch dashboard data:', response.error)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div>
      {errors.length > 0 && (
        <div className="error-panel">
          <h3>Errors:</h3>
          {errors.map((error, index) => (
            <div key={index}>
              Widget {error.widget}: {error.error}
            </div>
          ))}
        </div>
      )}
      
      {data && (
        <div className="dashboard-grid">
          <PlantOverviewWidget data={data.plantOverview} />
          <DACWidget data={data.dac} />
          <CommercialWidget data={data.commercial} />
          <EnergyWidget data={data.energy} />
          <BatteryWidget data={data.battery} />
          <MMRVWidget data={data.mmrv} />
          <CarbonCertifiedWidget data={data.carbonCertified} />
          <CarbonCreditsWidget data={data.carbonCredits} />
        </div>
      )}
    </div>
  )
}
```

## 🔧 Query Management

### QueryManager Utility

The `QueryManager` class provides flexible query execution:

```typescript
import { QueryManager } from '@/lib/query-manager'

// Execute specific query from file
const results = await QueryManager.executeQuery('plant-overview', 0)

// Execute all queries from file
const allResults = await QueryManager.executeAllQueries('plant-overview')

// Execute parameterized query
const paramResults = await QueryManager.executeParameterizedQuery(
  'plant-overview', 
  0, 
  { startDate: '2024-01-01', endDate: '2024-12-31' }
)
```

### DatabaseQueries Shortcuts

Pre-configured shortcuts for common operations:

```typescript
import { DatabaseQueries } from '@/lib/query-manager'

// Plant Overview
const metrics = await DatabaseQueries.getPlantOverviewMetrics()
const historical = await DatabaseQueries.getPlantHistoricalData()
const status = await DatabaseQueries.getPlantSystemStatus()

// DAC
const dacMetrics = await DatabaseQueries.getDACMetrics()
const dacTrends = await DatabaseQueries.getDACTrends()
const dacMaintenance = await DatabaseQueries.getDACMaintenance()
const dacAlerts = await DatabaseQueries.getDACAlerts()
```

## 🎯 Best Practices

### 1. Query Organization
- **One file per widget**: Keep related queries together
- **Descriptive comments**: Document what each query does
- **Consistent naming**: Use clear, descriptive table and column names

### 2. Error Handling
- **Always handle errors**: Use try-catch blocks
- **Log errors**: Include context for debugging
- **Graceful degradation**: Show partial data when possible

### 3. Performance
- **Parallel execution**: Use `Promise.all()` for independent queries
- **Efficient queries**: Limit data with WHERE clauses and date ranges
- **Caching**: Consider implementing client-side caching for frequently accessed data

### 4. Security
- **Server-side only**: Never expose connection strings to client
- **Parameterized queries**: Use parameters to prevent SQL injection
- **Validate inputs**: Check parameters before query execution

## 🔍 Troubleshooting

### Common Issues

#### 1. Query File Not Found
```
Error: Failed to read query from plant-overview.sql
```
**Solution**: Ensure the SQL file exists in `database/queries/` directory

#### 2. Query Index Out of Range
```
Error: Query index 2 not found in plant-overview.sql
```
**Solution**: Check that your SQL file has enough queries (separated by semicolons)

#### 3. Database Connection Issues
```
Error: Fabric SQL query failed: Connection timeout
```
**Solution**: 
- Verify your Fabric SQL environment variables
- Check network connectivity
- Ensure your AAD token has proper permissions

#### 4. SQL Syntax Errors
```
Error: Incorrect syntax near 'WHERE'
```
**Solution**: 
- Validate your SQL syntax
- Check table and column names
- Ensure proper query formatting

### Debugging Tips

1. **Check console logs**: Server actions log detailed execution information
2. **Test queries individually**: Use `QueryManager.executeQuery()` to isolate issues
3. **Validate data structures**: Ensure your database schema matches expected types
4. **Monitor performance**: Watch for slow queries and optimize as needed

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for detailed error messages
3. Verify your Fabric SQL connection configuration
4. Test individual queries using the QueryManager utility

## 🔄 Updates

When adding new widgets or modifying existing ones:
1. Add/update SQL queries in the appropriate `.sql` file
2. Update the `DatabaseQueries` shortcuts in `query-manager.ts`
3. Add/update server actions in `dashboard-server-actions.ts`
4. Update type definitions in `types/dashboard-data.ts`
5. Update this README with new functionality 