/*
  # Fix Function Security and Clean Up Unused Indexes

  ## 1. Fix Function Search Path Security
  Sets secure search_path for all functions to prevent potential security vulnerabilities
  where malicious users could manipulate the search path.

  ## 2. Drop Unused Indexes
  Removes indexes that haven't been used to reduce database overhead.

  ## 3. Security Improvements
  Ensures all functions use a fixed, secure search path to prevent SQL injection
  and other security vulnerabilities.
*/

-- =====================================================
-- PART 1: FIX FUNCTION SEARCH PATH SECURITY
-- =====================================================

-- Set secure search_path for functions without parameters
ALTER FUNCTION public.sync_message_from_content() SET search_path = public, pg_catalog;
ALTER FUNCTION public.check_conversation_not_blocked() SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_user_reviews_updated_at() SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_system_settings_updated_at() SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_site_settings_updated_at() SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_support_ticket_updated_at() SET search_path = public, pg_catalog;
ALTER FUNCTION public.delete_old_locked_tickets() SET search_path = public, pg_catalog;
ALTER FUNCTION public.trigger_cleanup_old_locked_tickets() SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_advertisement_updated_at() SET search_path = public, pg_catalog;
ALTER FUNCTION public.auto_expire_bans() SET search_path = public, pg_catalog;
ALTER FUNCTION public.check_and_expire_premium() SET search_path = public, pg_catalog;
ALTER FUNCTION public.is_admin_or_moderator() SET search_path = public, pg_catalog;
ALTER FUNCTION public.expire_all_premium_users() SET search_path = public, pg_catalog;
ALTER FUNCTION public.cleanup_old_audit_logs() SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_user_cars_featured_status() SET search_path = public, pg_catalog;
ALTER FUNCTION public.cleanup_password_reset_attempts() SET search_path = public, pg_catalog;
ALTER FUNCTION public.cleanup_spam_detection_logs() SET search_path = public, pg_catalog;
ALTER FUNCTION public.delete_old_blocked_conversations() SET search_path = public, pg_catalog;
ALTER FUNCTION public.delete_expired_notifications() SET search_path = public, pg_catalog;
ALTER FUNCTION public.is_super_admin() SET search_path = public, pg_catalog;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_catalog;
ALTER FUNCTION public.handle_updated_at() SET search_path = public, pg_catalog;
ALTER FUNCTION public.check_premium_expiry() SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_conversation_timestamp() SET search_path = public, pg_catalog;
ALTER FUNCTION public.increment_unread_count() SET search_path = public, pg_catalog;
ALTER FUNCTION public.increment_car_view_count() SET search_path = public, pg_catalog;

-- Set secure search_path for functions with parameters (using correct signatures)
ALTER FUNCTION public.is_password_reset_blocked(p_email text) SET search_path = public, pg_catalog;
ALTER FUNCTION public.is_spam_blocked(p_email text, p_ip_address text) SET search_path = public, pg_catalog;
ALTER FUNCTION public.get_spam_statistics(days_back integer) SET search_path = public, pg_catalog;
ALTER FUNCTION public.promote_to_admin(target_user_id uuid) SET search_path = public, pg_catalog;
ALTER FUNCTION public.demote_from_admin(target_user_id uuid) SET search_path = public, pg_catalog;
ALTER FUNCTION public.is_user_banned(user_id uuid) SET search_path = public, pg_catalog;

-- =====================================================
-- PART 2: DROP UNUSED INDEXES
-- =====================================================

-- Drop unused conversation and messaging indexes
DROP INDEX IF EXISTS idx_conversations_car_id;
DROP INDEX IF EXISTS idx_conversations_blocked_by;
DROP INDEX IF EXISTS idx_conversation_participants_user;
DROP INDEX IF EXISTS idx_conversation_participants_conversation;
DROP INDEX IF EXISTS idx_messages_conversation;

-- Drop unused car-related indexes
DROP INDEX IF EXISTS idx_car_views_viewed_at;
DROP INDEX IF EXISTS idx_cars_is_featured;
DROP INDEX IF EXISTS idx_cars_priority_score;
DROP INDEX IF EXISTS idx_cars_vehicle_type;

-- Drop unused user profile indexes
DROP INDEX IF EXISTS idx_user_profiles_is_moderator;
DROP INDEX IF EXISTS idx_user_profiles_is_super_admin;
DROP INDEX IF EXISTS idx_premium_expires_at;

-- Drop unused report indexes
DROP INDEX IF EXISTS idx_reports_status;
DROP INDEX IF EXISTS idx_reports_reported_by;
DROP INDEX IF EXISTS idx_reports_reported_user;
DROP INDEX IF EXISTS idx_reports_car_id;
DROP INDEX IF EXISTS idx_reports_created_at;

-- Drop unused review indexes
DROP INDEX IF EXISTS idx_review_reactions_review;
DROP INDEX IF EXISTS idx_user_reviews_reviewer;
DROP INDEX IF EXISTS idx_user_reviews_reviewed_user;
DROP INDEX IF EXISTS idx_user_reviews_conversation;

-- Drop unused security and audit indexes
DROP INDEX IF EXISTS idx_security_audit_log_user_id;
DROP INDEX IF EXISTS idx_security_audit_log_action;
DROP INDEX IF EXISTS idx_security_audit_log_created_at;
DROP INDEX IF EXISTS idx_password_reset_email;
DROP INDEX IF EXISTS idx_password_reset_blocked;

-- Drop unused spam detection indexes
DROP INDEX IF EXISTS idx_spam_detection_email;
DROP INDEX IF EXISTS idx_spam_detection_ip;
DROP INDEX IF EXISTS idx_spam_detection_type;
DROP INDEX IF EXISTS idx_spam_detection_created;
DROP INDEX IF EXISTS idx_spam_detection_blocked;

-- Drop unused support ticket indexes
DROP INDEX IF EXISTS idx_support_tickets_locked_at;

-- Drop unused notification indexes
DROP INDEX IF EXISTS idx_system_notifications_created_at;
DROP INDEX IF EXISTS idx_system_notifications_is_read;
