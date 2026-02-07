/*
  # Complete Rollback of Restrictive Security Policies

  ## Changes
  This migration completely removes all restrictive RLS policies and restores
  full functionality to the site.

  ## What's Being Fixed
  - Drops ALL existing policies
  - Recreates simple, permissive policies that work
  - Restores all site functionality
*/

-- =====================================================
-- DROP ALL EXISTING POLICIES TO START FRESH
-- =====================================================

-- Cars
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'cars') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.cars';
    END LOOP;
END $$;

-- Car Images
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'car_images') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.car_images';
    END LOOP;
END $$;

-- Car Preferences
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'car_preferences') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.car_preferences';
    END LOOP;
END $$;

-- Advertisements
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'advertisements') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.advertisements';
    END LOOP;
END $$;

-- User Profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_profiles';
    END LOOP;
END $$;

-- Swap Offers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'swap_offers') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.swap_offers';
    END LOOP;
END $$;

-- Car Views
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'car_views') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.car_views';
    END LOOP;
END $$;

-- Site Settings
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'site_settings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.site_settings';
    END LOOP;
END $$;

-- System Settings
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'system_settings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.system_settings';
    END LOOP;
END $$;

-- Favorites
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'favorites') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.favorites';
    END LOOP;
END $$;

-- Premium Subscriptions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'premium_subscriptions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.premium_subscriptions';
    END LOOP;
END $$;

-- Conversation Participants
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversation_participants') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.conversation_participants';
    END LOOP;
END $$;

-- Conversations
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.conversations';
    END LOOP;
END $$;

-- Messages
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'messages') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.messages';
    END LOOP;
END $$;

-- Promo Codes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'promo_codes') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.promo_codes';
    END LOOP;
END $$;

-- Promo Code Redemptions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'promo_code_redemptions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.promo_code_redemptions';
    END LOOP;
END $$;

-- Reports
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reports') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.reports';
    END LOOP;
END $$;

-- User Reviews
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_reviews') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.user_reviews';
    END LOOP;
END $$;

-- Review Reactions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'review_reactions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.review_reactions';
    END LOOP;
END $$;

-- Support Tickets
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'support_tickets') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.support_tickets';
    END LOOP;
END $$;

-- Support Messages
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'support_messages') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.support_messages';
    END LOOP;
END $$;

-- System Notifications
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'system_notifications') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.system_notifications';
    END LOOP;
END $$;

-- Security Audit Log
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'security_audit_log') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.security_audit_log';
    END LOOP;
END $$;

-- Password Reset Attempts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'password_reset_attempts') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.password_reset_attempts';
    END LOOP;
END $$;

-- Spam Detection Log
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'spam_detection_log') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.spam_detection_log';
    END LOOP;
END $$;

-- =====================================================
-- RECREATE SIMPLE, WORKING POLICIES
-- =====================================================

-- CARS
CREATE POLICY "select_cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "insert_cars" ON public.cars FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update_cars" ON public.cars FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_cars" ON public.cars FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_delete_cars" ON public.cars FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR is_moderator = true))
);

-- CAR_IMAGES
CREATE POLICY "select_car_images" ON public.car_images FOR SELECT USING (true);
CREATE POLICY "insert_car_images" ON public.car_images FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.cars WHERE id = car_images.car_id AND user_id = auth.uid())
);
CREATE POLICY "delete_car_images" ON public.car_images FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.cars WHERE id = car_images.car_id AND user_id = auth.uid())
);

-- CAR_PREFERENCES
CREATE POLICY "select_car_preferences" ON public.car_preferences FOR SELECT USING (true);
CREATE POLICY "manage_car_preferences" ON public.car_preferences FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.cars WHERE id = car_preferences.car_id AND user_id = auth.uid())
);

-- ADVERTISEMENTS
CREATE POLICY "select_advertisements" ON public.advertisements FOR SELECT USING (true);
CREATE POLICY "manage_advertisements" ON public.advertisements FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- USER_PROFILES
CREATE POLICY "select_user_profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_user_profiles" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "update_user_profiles" ON public.user_profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admin_update_profiles" ON public.user_profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- SWAP_OFFERS
CREATE POLICY "select_swap_offers" ON public.swap_offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_swap_offers" ON public.swap_offers FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.cars WHERE id = swap_offers.offered_car_id AND user_id = auth.uid())
);
CREATE POLICY "update_swap_offers" ON public.swap_offers FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.cars WHERE id = swap_offers.offered_car_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.cars WHERE id = swap_offers.car_id AND user_id = auth.uid())
);

-- CAR_VIEWS
CREATE POLICY "insert_car_views" ON public.car_views FOR INSERT WITH CHECK (true);
CREATE POLICY "select_car_views" ON public.car_views FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.cars WHERE id = car_views.car_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- SITE_SETTINGS
CREATE POLICY "select_site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "update_site_settings" ON public.site_settings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- SYSTEM_SETTINGS
CREATE POLICY "select_system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "update_system_settings" ON public.system_settings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- FAVORITES
CREATE POLICY "select_favorites" ON public.favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_favorites" ON public.favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

-- PREMIUM_SUBSCRIPTIONS
CREATE POLICY "select_premium_subscriptions" ON public.premium_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "insert_premium_subscriptions" ON public.premium_subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- CONVERSATION_PARTICIPANTS
CREATE POLICY "select_conversation_participants" ON public.conversation_participants FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid())
);
CREATE POLICY "insert_conversation_participants" ON public.conversation_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_conversation_participants" ON public.conversation_participants FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "delete_conversation_participants" ON public.conversation_participants FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid())
);

-- CONVERSATIONS
CREATE POLICY "select_conversations" ON public.conversations FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);
CREATE POLICY "insert_conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_conversations" ON public.conversations FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);
CREATE POLICY "delete_conversations" ON public.conversations FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);

-- MESSAGES
CREATE POLICY "select_messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "insert_messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "update_messages" ON public.messages FOR UPDATE TO authenticated USING (receiver_id = auth.uid());
CREATE POLICY "delete_messages" ON public.messages FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- PROMO_CODES
CREATE POLICY "select_promo_codes" ON public.promo_codes FOR SELECT TO authenticated USING (true);
CREATE POLICY "manage_promo_codes" ON public.promo_codes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- PROMO_CODE_REDEMPTIONS
CREATE POLICY "select_promo_code_redemptions" ON public.promo_code_redemptions FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "insert_promo_code_redemptions" ON public.promo_code_redemptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- REPORTS
CREATE POLICY "select_reports" ON public.reports FOR SELECT TO authenticated USING (
  reported_by = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR is_moderator = true))
);
CREATE POLICY "insert_reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());
CREATE POLICY "update_reports" ON public.reports FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR is_moderator = true))
);

-- USER_REVIEWS
CREATE POLICY "select_user_reviews" ON public.user_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_user_reviews" ON public.user_reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid() AND reviewer_id != reviewed_user_id);
CREATE POLICY "update_user_reviews" ON public.user_reviews FOR UPDATE TO authenticated USING (reviewer_id = auth.uid());
CREATE POLICY "delete_user_reviews" ON public.user_reviews FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

-- REVIEW_REACTIONS
CREATE POLICY "select_review_reactions" ON public.review_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_review_reactions" ON public.review_reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete_review_reactions" ON public.review_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- SUPPORT_TICKETS
CREATE POLICY "select_support_tickets" ON public.support_tickets FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR is_moderator = true))
);
CREATE POLICY "insert_support_tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "update_support_tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR is_moderator = true))
);

-- SUPPORT_MESSAGES
CREATE POLICY "select_support_messages" ON public.support_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = support_messages.ticket_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR is_moderator = true))))
);
CREATE POLICY "insert_support_messages" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.support_tickets WHERE id = support_messages.ticket_id AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = true OR is_moderator = true))))
);

-- SYSTEM_NOTIFICATIONS
CREATE POLICY "select_system_notifications" ON public.system_notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "insert_system_notifications" ON public.system_notifications FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "update_system_notifications" ON public.system_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "delete_system_notifications" ON public.system_notifications FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- SECURITY_AUDIT_LOG
CREATE POLICY "select_security_audit_log" ON public.security_audit_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- PASSWORD_RESET_ATTEMPTS
CREATE POLICY "select_password_reset_attempts" ON public.password_reset_attempts FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);

-- SPAM_DETECTION_LOG
CREATE POLICY "select_spam_detection_log" ON public.spam_detection_log FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
);
