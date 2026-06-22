CREATE OR REPLACE FUNCTION get_analytics_summary(start_date timestamptz, end_date timestamptz)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
    time_series_data json;
    top_pages_data json;
    entry_pages_data json;
    exit_pages_data json;
    top_referrers_data json;
    devices_data json;
    locations_data json;
    total_views_count integer;
    unique_visitors_count integer;
    bounce_rate_calc numeric;
    session_duration_calc text;
    interval_step interval;
BEGIN
    -- Determine interval step for time series based on date range
    IF (end_date - start_date) <= interval '2 days' THEN
        interval_step := interval '2 hours';
    ELSIF (end_date - start_date) <= interval '31 days' THEN
        interval_step := interval '1 day';
    ELSE
        interval_step := interval '1 week';
    END IF;

    -- 1. Time Series
    WITH series AS (
        SELECT generate_series(
            date_trunc('hour', start_date),
            end_date,
            interval_step
        ) as bucket
    ),
    bucket_sessions AS (
        SELECT 
            CASE 
                WHEN interval_step = interval '2 hours' THEN 
                     date_trunc('hour', timestamp) - (EXTRACT(hour FROM timestamp)::int % 2) * interval '1 hour'
                WHEN interval_step = interval '1 day' THEN date_trunc('day', timestamp)
                ELSE date_trunc('week', timestamp)
            END as date,
            ip_address,
            COUNT(*) as view_count,
            MIN(timestamp) as session_start,
            MAX(timestamp) as session_end
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY 1, 2
    ),
    bucket_metrics AS (
        SELECT
            date,
            SUM(view_count) as views,
            COUNT(DISTINCT ip_address) as unique,
            COUNT(*) as total_sessions,
            COUNT(*) FILTER (WHERE view_count = 1) as bounce_sessions,
            AVG(EXTRACT(EPOCH FROM (session_end - session_start))) FILTER (WHERE view_count > 1) as avg_duration_seconds
        FROM bucket_sessions
        GROUP BY date
    )
    SELECT 
        COALESCE(json_agg(
            json_build_object(
                'date', s.bucket,
                'views', COALESCE(bm.views, 0),
                'unique', COALESCE(bm.unique, 0),
                'bounce_rate', CASE WHEN COALESCE(bm.total_sessions, 0) = 0 THEN 0 ELSE ROUND((COALESCE(bm.bounce_sessions, 0)::numeric * 100.0) / bm.total_sessions, 1) END,
                'duration_seconds', COALESCE(bm.avg_duration_seconds, 0)
            ) ORDER BY s.bucket
        ), '[]'::json)
    INTO time_series_data
    FROM series s
    LEFT JOIN bucket_metrics bm ON 
        (interval_step = interval '2 hours' AND bm.date = (s.bucket - (EXTRACT(hour FROM s.bucket)::int % 2) * interval '1 hour')) OR
        (interval_step != interval '2 hours' AND bm.date = s.bucket);

    -- 2. Sessions (Entry, Exit, Duration, Bounce)
    WITH user_sessions AS (
        SELECT 
            ip_address,
            MIN(timestamp) as session_start,
            MAX(timestamp) as session_end,
            COUNT(*) as view_count,
            (ARRAY_AGG(path ORDER BY timestamp ASC))[1] as entry_page,
            (ARRAY_AGG(path ORDER BY timestamp DESC))[1] as exit_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    ),
    session_metrics AS (
        SELECT 
            COUNT(*) as total_sessions,
            COUNT(*) FILTER (WHERE view_count = 1) as bounce_sessions,
            AVG(EXTRACT(EPOCH FROM (session_end - session_start))) FILTER (WHERE view_count > 1) as avg_duration_seconds
        FROM user_sessions
    )
    SELECT 
        CASE WHEN total_sessions = 0 THEN 0 ELSE ROUND((bounce_sessions::numeric * 100.0) / total_sessions, 1) END,
        CASE 
            WHEN avg_duration_seconds IS NULL THEN '0m 0s'
            ELSE floor(avg_duration_seconds / 60)::text || 'm ' || round(avg_duration_seconds % 60)::text || 's'
        END
    INTO bounce_rate_calc, session_duration_calc
    FROM session_metrics;

    -- Entry pages
    WITH user_sessions AS (
        SELECT (ARRAY_AGG(path ORDER BY timestamp ASC))[1] as entry_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    )
    SELECT COALESCE(json_agg(json_build_object('path', entry_page, 'views', views)), '[]'::json)
    INTO entry_pages_data
    FROM (
        SELECT entry_page, COUNT(*) as views
        FROM user_sessions
        GROUP BY entry_page
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Exit pages
    WITH user_sessions AS (
        SELECT (ARRAY_AGG(path ORDER BY timestamp DESC))[1] as exit_page
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY ip_address, date_trunc('day', timestamp)
    )
    SELECT COALESCE(json_agg(json_build_object('path', exit_page, 'views', views)), '[]'::json)
    INTO exit_pages_data
    FROM (
        SELECT exit_page, COUNT(*) as views
        FROM user_sessions
        GROUP BY exit_page
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Totals
    SELECT COUNT(*), COUNT(DISTINCT ip_address)
    INTO total_views_count, unique_visitors_count
    FROM page_views
    WHERE timestamp BETWEEN start_date AND end_date;

    -- Top Pages
    SELECT COALESCE(json_agg(json_build_object('path', path, 'views', views)), '[]'::json)
    INTO top_pages_data
    FROM (
        SELECT path, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY path
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Referrers
    SELECT COALESCE(json_agg(json_build_object('referrer', referrer, 'views', views)), '[]'::json)
    INTO top_referrers_data
    FROM (
        SELECT referrer, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date AND referrer IS NOT NULL AND referrer != ''
        GROUP BY referrer
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Devices
    SELECT COALESCE(json_agg(json_build_object('device_type', device_type, 'views', views)), '[]'::json)
    INTO devices_data
    FROM (
        SELECT device_type, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY device_type
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Locations
    SELECT COALESCE(json_agg(json_build_object('country', country, 'views', views)), '[]'::json)
    INTO locations_data
    FROM (
        SELECT country, COUNT(*) as views
        FROM page_views
        WHERE timestamp BETWEEN start_date AND end_date
        GROUP BY country
        ORDER BY views DESC LIMIT 10
    ) t;

    -- Build final JSON
    result := json_build_object(
        'total_views', COALESCE(total_views_count, 0),
        'unique_visitors', COALESCE(unique_visitors_count, 0),
        'bounce_rate', COALESCE(bounce_rate_calc, 0),
        'session_duration', COALESCE(session_duration_calc, '0m 0s'),
        'time_series', time_series_data,
        'top_pages', top_pages_data,
        'entry_pages', entry_pages_data,
        'exit_pages', exit_pages_data,
        'top_referrers', top_referrers_data,
        'devices', devices_data,
        'locations', locations_data
    );

    RETURN result;
END;
$$;
