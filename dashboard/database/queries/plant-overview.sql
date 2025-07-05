-- Plant Overview Queries
-- Real-time plant operation metrics

-- Get current plant metrics
SELECT 
    water_flow_rate,
    water_temp,
    injection_ratio,
    co2_temp,
    co2_flow_rate,
    total_water_injected,
    system_status,
    last_updated
FROM plant_overview_metrics 
WHERE measurement_time >= DATEADD(hour, -1, GETDATE())
ORDER BY measurement_time DESC;

-- Get historical flow data (last 12 hours)
SELECT 
    DATEPART(hour, measurement_time) as hour_of_day,
    AVG(water_flow_rate) as avg_flow_rate,
    AVG(co2_temp) as avg_co2_temp,
    COUNT(*) as measurement_count
FROM plant_overview_metrics 
WHERE measurement_time >= DATEADD(hour, -12, GETDATE())
GROUP BY DATEPART(hour, measurement_time)
ORDER BY hour_of_day;

-- Get system status summary
SELECT 
    system_component,
    status,
    last_maintenance,
    next_maintenance,
    operational_hours,
    efficiency_rating
FROM plant_system_status
WHERE is_active = 1
ORDER BY priority DESC; 