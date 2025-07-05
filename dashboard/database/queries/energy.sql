-- Energy Management Queries
-- Power consumption, generation, and efficiency metrics

-- Get current energy metrics
SELECT 
    current_consumption,
    current_generation,
    outgoing_volts,
    battery_level,
    power_backup_status,
    grid_connection_status,
    efficiency_rating,
    last_updated
FROM energy_metrics 
WHERE measurement_time >= DATEADD(hour, -1, GETDATE())
ORDER BY measurement_time DESC;

-- Get hourly energy consumption (last 24 hours)
SELECT 
    DATEPART(hour, measurement_time) as hour_of_day,
    AVG(current_consumption) as avg_consumption,
    AVG(current_generation) as avg_generation,
    AVG(battery_level) as avg_battery_level,
    MAX(peak_demand) as peak_demand
FROM energy_metrics 
WHERE measurement_time >= DATEADD(hour, -24, GETDATE())
GROUP BY DATEPART(hour, measurement_time)
ORDER BY hour_of_day;

-- Get energy system configuration
SELECT 
    system_component,
    capacity_kw,
    operational_status,
    efficiency_rating,
    maintenance_due,
    installation_date
FROM energy_system_config
WHERE is_active = 1
ORDER BY capacity_kw DESC;

-- Get power backup information
SELECT 
    backup_system_id,
    backup_type,
    capacity,
    current_charge,
    estimated_runtime,
    last_test_date,
    test_result
FROM energy_backup_systems
WHERE is_active = 1
ORDER BY capacity DESC; 