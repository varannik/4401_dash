-- Carbon Certified Queries
-- Carbon certification and verification metrics

-- Get current certification summary
SELECT 
    total_certified_tons,
    certification_type,
    certification_body,
    issued_date,
    expiry_date,
    verification_status,
    last_updated
FROM carbon_certification_summary 
WHERE expiry_date >= GETDATE()
ORDER BY last_updated DESC;

-- Get certification timeline and milestones
SELECT 
    milestone_type,
    milestone_name,
    target_date,
    completion_date,
    status,
    certified_amount,
    verification_body,
    notes
FROM carbon_certification_timeline
WHERE target_date >= DATEADD(month, -6, GETDATE())
ORDER BY target_date ASC;

-- Get monthly certification progress
SELECT 
    month_year,
    tons_certified,
    tons_pending,
    tons_rejected,
    certification_rate,
    cumulative_certified
FROM carbon_certification_monthly
WHERE month_year >= FORMAT(DATEADD(month, -12, GETDATE()), 'yyyy-MM')
ORDER BY month_year ASC;

-- Get certification by methodology
SELECT 
    methodology_name,
    methodology_version,
    tons_certified,
    average_verification_time,
    success_rate,
    certification_body
FROM carbon_certification_methodologies
WHERE is_active = 1
ORDER BY tons_certified DESC;

-- Get verification activities
SELECT 
    verification_id,
    verification_type,
    verifier_name,
    scheduled_date,
    completion_date,
    status,
    findings,
    certified_amount
FROM carbon_verification_activities
WHERE scheduled_date >= DATEADD(month, -3, GETDATE())
ORDER BY scheduled_date DESC; 