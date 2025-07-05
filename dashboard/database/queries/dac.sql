-- DAC (Direct Air Capture) Queries
-- CO2 capture and processing metrics

-- Get current DAC metrics
SELECT 
    co2_temp,
    co2_flow_rate,
    injected_co2_total,
    co2_concentration,
    capture_efficiency,
    processing_rate,
    system_pressure,
    last_updated
FROM dac_metrics 
WHERE measurement_time >= DATEADD(hour, -1, GETDATE())
ORDER BY measurement_time DESC;

-- Get CO2 processing trends (last 24 hours)
SELECT 
    DATEPART(hour, measurement_time) as hour_of_day,
    AVG(co2_flow_rate) as avg_flow_rate,
    AVG(co2_temp) as avg_temperature,
    SUM(injected_co2_total) as total_injected,
    AVG(capture_efficiency) as avg_efficiency
FROM dac_metrics 
WHERE measurement_time >= DATEADD(hour, -24, GETDATE())
GROUP BY DATEPART(hour, measurement_time)
ORDER BY hour_of_day;

-- Get maintenance information
SELECT 
    equipment_id,
    equipment_name,
    maintenance_type,
    scheduled_date,
    completion_status,
    estimated_downtime,
    priority_level
FROM dac_maintenance_schedule
WHERE scheduled_date >= GETDATE()
ORDER BY scheduled_date ASC;

-- Get system alerts
SELECT 
    alert_type,
    severity,
    message,
    created_at,
    resolved_at,
    affected_component
FROM dac_system_alerts
WHERE resolved_at IS NULL OR resolved_at >= DATEADD(hour, -24, GETDATE())
ORDER BY severity DESC, created_at DESC; 