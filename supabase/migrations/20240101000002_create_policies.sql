-- User Profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (supabase_uid = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (supabase_uid = auth.uid())
  WITH CHECK (supabase_uid = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

-- Todo Items Policies
CREATE POLICY "Users can view active todos"
  ON todo_items FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can insert todos"
  ON todo_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update todos"
  ON todo_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete todos"
  ON todo_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

-- Todo Progress Policies
CREATE POLICY "Users can view own progress"
  ON todo_progress FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

CREATE POLICY "Users can insert own progress"
  ON todo_progress FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

CREATE POLICY "Users can update own progress"
  ON todo_progress FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

CREATE POLICY "Admins can view all progress"
  ON todo_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update notifications"
  ON notifications FOR UPDATE
  USING (true);

-- Calendar Integrations Policies
CREATE POLICY "Users can view own calendar integrations"
  ON calendar_integrations FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

CREATE POLICY "Users can insert own calendar integrations"
  ON calendar_integrations FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

CREATE POLICY "Users can update own calendar integrations"
  ON calendar_integrations FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

CREATE POLICY "Users can delete own calendar integrations"
  ON calendar_integrations FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

-- Achievements Policies
CREATE POLICY "All users can view achievements"
  ON achievements FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage achievements"
  ON achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

-- User Achievements Policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
    )
  );

CREATE POLICY "System can insert user achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

-- App Settings Policies
CREATE POLICY "Users can view settings"
  ON app_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can modify settings"
  ON app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );

-- PIN Attempts Policies
CREATE POLICY "Service role can insert pin attempts"
  ON pin_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view pin attempts"
  ON pin_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE supabase_uid = auth.uid() AND role = 'admin'
    )
  );