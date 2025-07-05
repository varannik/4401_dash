-- Battery Management Queries
-- Battery performance, health, and charging metrics

-- Get current battery status
SELECT 
    battery_id,
    battery_name,
    current_charge_level,
    health_percentage,
    voltage,
    temperature,
    charging_status,
    estimated_runtime,
    last_updated
FROM battery_status 
WHERE measurement_time >= DATEADD(hour, -1, GETDATE())
ORDER BY measurement_time DESC;

-- Get battery charge history (last 48 hours)
SELECT 
    DATEPART(hour, measurement_time) as hour_of_day,
    AVG(current_charge_level) as avg_charge_level,
    AVG(health_percentage) as avg_health,
    AVG(temperature) as avg_temperature,
    COUNT(*) as measurement_count
FROM battery_status 
WHERE measurement_time >= DATEADD(hour, -48, GETDATE())
GROUP BY DATEPART(hour, measurement_time)
ORDER BY hour_of_day;

-- Get battery configuration and specs
SELECT 
    battery_id,
    battery_type,
    capacity_kwh,
    max_charge_rate,
    max_discharge_rate,
    installation_date,
    warranty_expiry,
    manufacturer
FROM battery_configuration
WHERE is_active = 1
ORDER BY capacity_kwh DESC;

-- Get battery alerts and maintenance
SELECT 
    alert_type,
    severity,
    battery_id,
    message,
    created_at,
    resolved_at,
    recommended_action
FROM battery_alerts
WHERE resolved_at IS NULL OR resolved_at >= DATEADD(hour, -24, GETDATE())
ORDER BY severity DESC, created_at DESC; 