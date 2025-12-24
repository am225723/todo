-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_items_updated_at
  BEFORE UPDATE ON todo_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_progress_updated_at
  BEFORE UPDATE ON todo_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_integrations_updated_at
  BEFORE UPDATE ON calendar_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Get today's tasks function
CREATE OR REPLACE FUNCTION get_todays_tasks(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  link_url TEXT,
  link_type VARCHAR,
  priority INTEGER,
  display_time TIME,
  is_static BOOLEAN,
  tags TEXT[],
  category VARCHAR,
  color_code VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.link_url,
    t.link_type,
    t.priority,
    t.display_time,
    t.is_static,
    t.tags,
    t.category,
    t.color_code
  FROM todo_items t
  WHERE t.is_active = true
    AND (
      t.is_static = true
      OR
      (t.is_static = false AND t.display_date = target_date)
      OR
      (
        t.recurrence_pattern = 'weekly' 
        AND EXTRACT(ISODOW FROM target_date)::INTEGER = ANY(t.recurrence_days)
      )
    )
  ORDER BY t.priority DESC, t.display_time ASC NULLS LAST, t.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user progress for date
CREATE OR REPLACE FUNCTION get_user_progress(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  todo_item_id UUID,
  completed BOOLEAN,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  time_spent_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.todo_item_id,
    tp.completed,
    tp.completed_at,
    tp.notes,
    tp.time_spent_minutes
  FROM todo_progress tp
  WHERE tp.user_id = p_user_id
    AND tp.progress_date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check PIN rate limit
CREATE OR REPLACE FUNCTION check_pin_rate_limit(
  p_email VARCHAR,
  p_ip_address INET DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_max_attempts INTEGER;
  v_lockout_duration INTEGER;
  v_recent_attempts INTEGER;
  v_lockout_until TIMESTAMPTZ;
BEGIN
  SELECT (setting_value)::INTEGER INTO v_max_attempts
  FROM app_settings WHERE setting_key = 'max_pin_attempts';
  
  SELECT (setting_value)::INTEGER INTO v_lockout_duration
  FROM app_settings WHERE setting_key = 'pin_lockout_duration_minutes';
  
  SELECT COUNT(*) INTO v_recent_attempts
  FROM pin_attempts
  WHERE email = p_email
    AND success = false
    AND attempted_at > NOW() - (v_lockout_duration || ' minutes')::INTERVAL;
  
  IF v_recent_attempts >= v_max_attempts THEN
    SELECT attempted_at + (v_lockout_duration || ' minutes')::INTERVAL
    INTO v_lockout_until
    FROM pin_attempts
    WHERE email = p_email AND success = false
    ORDER BY attempted_at DESC
    LIMIT 1;
    
    RETURN jsonb_build_object(
      'allowed', false,
      'attempts_remaining', 0,
      'locked_until', v_lockout_until,
      'message', 'Too many failed attempts. Please try again later.'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'attempts_remaining', v_max_attempts - v_recent_attempts,
    'locked_until', NULL,
    'message', 'Attempt allowed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record PIN attempt
CREATE OR REPLACE FUNCTION record_pin_attempt(
  p_email VARCHAR,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_attempt_id UUID;
BEGIN
  INSERT INTO pin_attempts (email, success, ip_address, user_agent)
  VALUES (p_email, p_success, p_ip_address, p_user_agent)
  RETURNING id INTO v_attempt_id;
  
  RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get completion statistics
CREATE OR REPLACE FUNCTION get_completion_stats(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  total_tasks INTEGER,
  completed_tasks INTEGER,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::INTERVAL)::DATE AS date
  ),
  daily_tasks AS (
    SELECT 
      ds.date,
      COUNT(DISTINCT t.id) AS total_tasks,
      COUNT(DISTINCT CASE WHEN tp.completed = true THEN t.id END) AS completed_tasks
    FROM date_series ds
    CROSS JOIN LATERAL get_todays_tasks(ds.date) t
    LEFT JOIN todo_progress tp ON tp.todo_item_id = t.id 
      AND tp.user_id = p_user_id 
      AND tp.progress_date = ds.date
    GROUP BY ds.date
  )
  SELECT 
    dt.date,
    dt.total_tasks::INTEGER,
    dt.completed_tasks::INTEGER,
    CASE 
      WHEN dt.total_tasks > 0 THEN ROUND((dt.completed_tasks::NUMERIC / dt.total_tasks::NUMERIC) * 100, 2)
      ELSE 0
    END AS completion_rate
  FROM daily_tasks dt
  ORDER BY dt.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;