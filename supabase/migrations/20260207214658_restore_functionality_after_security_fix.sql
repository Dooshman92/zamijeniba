/*
  # Restore Full Functionality After Security Fix

  Fixes overly restrictive policies that were blocking access to:
  - Admin functions
  - User ads/cars
  - All other features

  Restores proper access while keeping the security improvements (indexes).
*/

-- =====================================================
-- RESTORE CARS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "View active cars" ON public.cars;
DROP POLICY IF EXISTS "View cars authenticated" ON public.cars;

-- Anon users can see active cars
CREATE POLICY "Anonymous view active cars"
  ON public.cars FOR SELECT
  TO anon
  USING (status = 'active');

-- Authenticated users can see active cars, their own cars, or all cars if admin/moderator
CREATE POLICY "Authenticated users view cars"
  ON public.cars FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    OR user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (select auth.uid())
      AND (is_admin = true OR is_moderator = true OR is_super_admin = true)
    )
  );

-- =====================================================
-- RESTORE CAR_IMAGES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "View car images" ON public.car_images;
DROP POLICY IF EXISTS "Manage own car images" ON public.car_images;

CREATE POLICY "Anyone can view car images"
  ON public.car_images FOR SELECT
  USING (true);

CREATE POLICY "Car owners can manage images"
  ON public.car_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cars
      WHERE id = car_images.car_id
      AND user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cars
      WHERE id = car_images.car_id
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- RESTORE CAR_PREFERENCES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "View car preferences" ON public.car_preferences;
DROP POLICY IF EXISTS "Manage own car preferences" ON public.car_preferences;

CREATE POLICY "Anyone can view preferences"
  ON public.car_preferences FOR SELECT
  USING (true);

CREATE POLICY "Car owners can manage preferences"
  ON public.car_preferences FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cars
      WHERE id = car_preferences.car_id
      AND user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cars
      WHERE id = car_preferences.car_id
      AND user_id = (select auth.uid())
    )
  );

-- =====================================================
-- RESTORE SITE_SETTINGS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "View site settings" ON public.site_settings;

CREATE POLICY "Authenticated users can view site settings"
  ON public.site_settings FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- RESTORE USER_PROFILES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "View user profiles" ON public.user_profiles;

CREATE POLICY "Anyone can view profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    NOT is_banned OR
    id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = (select auth.uid())
      AND (up.is_admin = true OR up.is_super_admin = true)
    )
  );

-- Ensure admin can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (select auth.uid())
      AND (is_admin = true OR is_super_admin = true)
    )
  );

-- =====================================================
-- RESTORE CARS DELETE POLICY
-- =====================================================

-- Make sure both user and admin delete policies exist
DROP POLICY IF EXISTS "Users can delete own cars" ON public.cars;
DROP POLICY IF EXISTS "Admins and moderators can delete cars" ON public.cars;

CREATE POLICY "Users can delete own cars"
  ON public.cars FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Admins and moderators can delete cars"
  ON public.cars FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (select auth.uid())
      AND (is_admin = true OR is_moderator = true OR is_super_admin = true)
    )
  );

-- =====================================================
-- ENSURE ADVERTISEMENTS ARE VISIBLE
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active advertisements" ON public.advertisements;
DROP POLICY IF EXISTS "Authenticated users can view advertisements" ON public.advertisements;

CREATE POLICY "Anyone can view active advertisements"
  ON public.advertisements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all advertisements"
  ON public.advertisements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = (select auth.uid())
      AND (is_admin = true OR is_super_admin = true)
    )
  );
