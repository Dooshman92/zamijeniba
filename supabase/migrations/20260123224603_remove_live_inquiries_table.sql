/*
  # Remove Live Inquiries System

  1. Changes
    - Drop all policies on `live_inquiries` table
    - Drop all indexes on `live_inquiries` table
    - Drop `live_inquiries` table

  2. Reason
    - Live inquiries feature is being removed
    - Replacing with direct messaging system for premium users
*/

DROP POLICY IF EXISTS "Users can create live inquiries" ON live_inquiries;
DROP POLICY IF EXISTS "Users can view sent inquiries" ON live_inquiries;
DROP POLICY IF EXISTS "Users can view received inquiries" ON live_inquiries;
DROP POLICY IF EXISTS "Users can update received inquiries" ON live_inquiries;

DROP INDEX IF EXISTS idx_live_inquiries_sender;
DROP INDEX IF EXISTS idx_live_inquiries_receiver;
DROP INDEX IF EXISTS idx_live_inquiries_car;
DROP INDEX IF EXISTS idx_live_inquiries_status;
DROP INDEX IF EXISTS idx_live_inquiries_created;

DROP TABLE IF EXISTS live_inquiries;