-- Migration: 009_create_metrics
-- Description: Create metrics table for operational analytics
-- Version: 1.0.0

CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Scope
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE, -- NULL for global metrics

    -- Metric identification
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'ACTIVE_ORDERS',
        'AVG_PREP_TIME',
        'OUT_FOR_DELIVERY',
        'STOCKOUTS',
        'REVENUE',
        'ORDER_COUNT',
        'CUSTOMER_SATISFACTION',
        'DRIVER_UTILIZATION',
        'DELIVERY_TIME_AVG'
    )),

    -- Value
    value NUMERIC(15, 4) NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN (
        'COUNT', 'MINUTES', 'HOURS', 'PERCENTAGE', 'CURRENCY', 'RATIO'
    )),

    -- Time dimension
    dimension TEXT NOT NULL CHECK (dimension IN (
        'REALTIME', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY'
    )),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Trend data (optional)
    trend_direction TEXT CHECK (trend_direction IN ('UP', 'DOWN', 'STABLE')),
    trend_percentage NUMERIC(5, 2),
    comparison_type TEXT CHECK (comparison_type IN (
        'PREVIOUS_PERIOD',
        'SAME_PERIOD_LAST_WEEK',
        'SAME_PERIOD_LAST_MONTH'
    )),

    -- Timestamps
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraint: unique metric per period
    CONSTRAINT unique_metric_period UNIQUE (store_id, metric_type, dimension, period_start)
);

-- Indexes for metrics
CREATE INDEX idx_metrics_store_id ON metrics(store_id) WHERE store_id IS NOT NULL;
CREATE INDEX idx_metrics_metric_type ON metrics(metric_type);
CREATE INDEX idx_metrics_dimension ON metrics(dimension);
CREATE INDEX idx_metrics_computed_at ON metrics(computed_at DESC);
CREATE INDEX idx_metrics_period_start ON metrics(period_start DESC);
CREATE INDEX idx_metrics_store_type ON metrics(store_id, metric_type) WHERE store_id IS NOT NULL;
CREATE INDEX idx_metrics_type_dimension ON metrics(metric_type, dimension);
CREATE INDEX idx_metrics_realtime ON metrics(metric_type, computed_at DESC) WHERE dimension = 'REALTIME';

-- Composite index for dashboard queries
CREATE INDEX idx_metrics_dashboard ON metrics(store_id, metric_type, dimension, period_start DESC);

-- Comments
COMMENT ON TABLE metrics IS 'Operational metrics computed from events and aggregated data';
COMMENT ON COLUMN metrics.store_id IS 'Store-specific metric (NULL for global/system-wide)';
COMMENT ON COLUMN metrics.dimension IS 'Time granularity of the metric';
COMMENT ON COLUMN metrics.period_start IS 'Start of the measurement period';
COMMENT ON COLUMN metrics.period_end IS 'End of the measurement period';
COMMENT ON COLUMN metrics.trend_direction IS 'Direction of trend compared to previous period';

-- View for latest realtime metrics
CREATE VIEW realtime_metrics AS
SELECT DISTINCT ON (store_id, metric_type)
    id,
    store_id,
    metric_type,
    value,
    unit,
    computed_at
FROM metrics
WHERE dimension = 'REALTIME'
ORDER BY store_id, metric_type, computed_at DESC;

COMMENT ON VIEW realtime_metrics IS 'Latest realtime metrics per store and metric type';

-- View for daily metrics aggregation
CREATE VIEW daily_metrics_summary AS
SELECT
    store_id,
    metric_type,
    DATE(period_start) as date,
    AVG(value) as avg_value,
    MIN(value) as min_value,
    MAX(value) as max_value,
    COUNT(*) as sample_count
FROM metrics
WHERE dimension = 'DAILY'
GROUP BY store_id, metric_type, DATE(period_start);

COMMENT ON VIEW daily_metrics_summary IS 'Daily metric aggregations with min/max/avg';
