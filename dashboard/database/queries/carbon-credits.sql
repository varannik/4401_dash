-- Carbon Credits Queries
-- Carbon credit trading and market opportunity metrics

-- Get current carbon credits summary
SELECT 
    total_credits_available,
    credits_sold,
    credits_pending,
    average_price,
    market_value,
    last_transaction_date,
    last_updated
FROM carbon_credits_summary 
WHERE month_year = FORMAT(GETDATE(), 'yyyy-MM')
ORDER BY last_updated DESC;

-- Get carbon credit trading history (last 12 months)
SELECT 
    month_year,
    credits_generated,
    credits_sold,
    credits_retired,
    average_selling_price,
    total_revenue,
    market_demand_score
FROM carbon_credits_trading_history
WHERE month_year >= FORMAT(DATEADD(month, -12, GETDATE()), 'yyyy-MM')
ORDER BY month_year ASC;

-- Get market opportunities
SELECT 
    opportunity_id,
    buyer_name,
    buyer_type,
    requested_credits,
    offered_price,
    contract_duration,
    delivery_date,
    opportunity_status,
    risk_rating
FROM carbon_credits_market_opportunities
WHERE opportunity_status IN ('ACTIVE', 'NEGOTIATING', 'PENDING')
ORDER BY offered_price DESC;

-- Get credit pricing trends
SELECT 
    price_date,
    market_price,
    our_price,
    volume_traded,
    price_volatility,
    market_sentiment
FROM carbon_credits_pricing
WHERE price_date >= DATEADD(day, -30, GETDATE())
ORDER BY price_date DESC;

-- Get credit registry information
SELECT 
    registry_name,
    credit_type,
    vintage_year,
    credits_issued,
    credits_retired,
    credits_available,
    verification_standard,
    project_type
FROM carbon_credits_registry
WHERE credits_available > 0
ORDER BY vintage_year DESC, credits_available DESC; 