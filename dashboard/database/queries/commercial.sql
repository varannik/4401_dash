-- Commercial Revenue Queries
-- Financial performance and revenue metrics

-- Get current month revenue summary
SELECT 
    total_revenue,
    monthly_target,
    revenue_growth,
    profit_margin,
    active_contracts,
    new_customers,
    last_updated
FROM commercial_revenue_summary 
WHERE month_year = FORMAT(GETDATE(), 'yyyy-MM')
ORDER BY last_updated DESC;

-- Get monthly revenue data (last 12 months)
SELECT 
    month_year,
    total_revenue,
    profit,
    expenses,
    contracts_count,
    growth_percentage
FROM commercial_monthly_revenue 
WHERE month_year >= FORMAT(DATEADD(month, -12, GETDATE()), 'yyyy-MM')
ORDER BY month_year ASC;

-- Get revenue breakdown by source
SELECT 
    revenue_source,
    amount,
    percentage_of_total,
    contract_type,
    customer_segment
FROM commercial_revenue_breakdown
WHERE month_year = FORMAT(GETDATE(), 'yyyy-MM')
ORDER BY amount DESC;

-- Get financial KPIs
SELECT 
    kpi_name,
    current_value,
    target_value,
    variance,
    trend,
    last_updated
FROM commercial_financial_kpis
WHERE is_active = 1
ORDER BY priority ASC; 