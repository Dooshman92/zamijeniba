/*
  # Premium User System

  1. Updates to Existing Tables
    - Add premium fields to `user_profiles`
      - `is_premium` (boolean) - whether user has active premium
      - `premium_expires_at` (timestamptz) - when premium expires
  
  2. New Tables
    - `premium_subscriptions` - Track premium payments and subscriptions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `plan_type` (text) - monthly, yearly
      - `amount` (integer) - amount paid in cents
      - `status` (text) - active, cancelled, expired
      - `started_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at`, `updated_at`
  
  3. Security
    - RLS policies for premium_subscriptions
  
  4. Notes
    - Free users: 7 images per car
    - Premium users: 15 images per car
*/

-- Add premium fields to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_premium') THEN
    ALTER TABLE user_profiles ADD COLUMN is_premium boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'premium_expires_at') THEN
    ALTER TABLE user_profiles ADD COLUMN premium_expires_at timestamptz;
  END IF;
END $$;

-- Create premium_subscriptions table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  amount integer NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for premium_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON premium_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON premium_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON premium_subscriptions;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON premium_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to check if premium is expired and update status
CREATE OR REPLACE FUNCTION public.check_premium_expiry()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET is_premium = false
  WHERE is_premium = true 
    AND premium_expires_at < now();
    
  UPDATE premium_subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;