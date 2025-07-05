-- MMRV (Monitoring, Measurement, Reporting, and Verification) Queries
-- Environmental monitoring and compliance metrics

-- Get current MMRV metrics
SELECT 
    measurement_type,
    current_value,
    unit_of_measure,
    temperature,
    pressure,
    co2_mineralized,
    verification_status,
    last_updated
FROM mmrv_measurements 
WHERE measurement_time >= DATEADD(hour, -1, GETDATE())
ORDER BY measurement_time DESC;

-- Get environmental monitoring trends (last 7 days)
SELECT 
    CAST(measurement_time AS DATE) as measurement_date,
    AVG(temperature) as avg_temperature,
    AVG(pressure) as avg_pressure,
    SUM(co2_mineralized) as total_co2_mineralized,
    COUNT(*) as measurement_count
FROM mmrv_measurements 
WHERE measurement_time >= DATEADD(day, -7, GETDATE())
GROUP BY CAST(measurement_time AS DATE)
ORDER BY measurement_date;

-- Get verification status summary
SELECT 
    verification_type,
    status,
    verifier_name,
    verification_date,
    expiry_date,
    compliance_level,
    notes
FROM mmrv_verification_status
WHERE expiry_date >= GETDATE() OR status = 'PENDING'
ORDER BY verification_date DESC;

-- Get monitoring equipment status
SELECT 
    equipment_id,
    equipment_name,
    equipment_type,
    location,
    operational_status,
    last_calibration,
    next_calibration,
    accuracy_rating
FROM mmrv_equipment_status
WHERE is_active = 1
ORDER BY next_calibration ASC;

-- Get compliance reports
SELECT 
    report_type,
    report_period,
    submission_date,
    approval_status,
    compliance_score,
    findings,
    corrective_actions
FROM mmrv_compliance_reports
WHERE report_period >= FORMAT(DATEADD(month, -6, GETDATE()), 'yyyy-MM')
ORDER BY submission_date DESC; 