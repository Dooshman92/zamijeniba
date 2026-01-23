/*
  # Add Credits System and Promo Codes

  1. Changes to user_profiles
    - Add `credits` column (integer, default 0)
      - Credits can be used for:
        - Additional images (1 credit = 1 extra image)
        - Additional ads for free users (10 credits = 1 extra ad slot)
    
  2. New Tables
    - `promo_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique) - The promo code
      - `credits_reward` (integer) - How many credits this code gives
      - `description` (text) - What the code does
      - `max_uses` (integer) - Maximum number of times code can be used
      - `current_uses` (integer, default 0) - How many times used
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      
    - `promo_code_redemptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `code` (text, references promo_codes)
      - `credits_received` (integer)
      - `redeemed_at` (timestamp)
  
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
    
  4. Sample Promo Codes
    - BONUS5 - 5 credits (50 uses)
    - MEGA10 - 10 credits (30 uses)
    - SUPER20 - 20 credits (20 uses)
    - VIP50 - 50 credits (10 uses)
    - STARTER3 - 3 credits (100 uses)
*/

-- Add credits to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'credits'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN credits integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  credits_reward integer NOT NULL,
  description text NOT NULL,
  max_uses integer NOT NULL,
  current_uses integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create promo_code_redemptions table
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) NOT NULL,
  code text NOT NULL,
  credits_received integer NOT NULL,
  redeemed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Promo codes policies (anyone can view active codes for validation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promo_codes' AND policyname = 'Anyone can view active promo codes'
  ) THEN
    CREATE POLICY "Anyone can view active promo codes"
      ON promo_codes FOR SELECT
      TO authenticated
      USING (is_active = true);
  END IF;
END $$;

-- Redemptions policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promo_code_redemptions' AND policyname = 'Users can view their own redemptions'
  ) THEN
    CREATE POLICY "Users can view their own redemptions"
      ON promo_code_redemptions FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'promo_code_redemptions' AND policyname = 'Users can insert their own redemptions'
  ) THEN
    CREATE POLICY "Users can insert their own redemptions"
      ON promo_code_redemptions FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Insert sample promo codes
INSERT INTO promo_codes (code, credits_reward, description, max_uses, current_uses)
VALUES
  ('BONUS5', 5, 'Dobij 5 kredita za dodatne slike', 50, 0),
  ('MEGA10', 10, 'Dobij 10 kredita za dodatni oglas', 30, 0),
  ('SUPER20', 20, 'Dobij 20 kredita za 2 dodatna oglasa', 20, 0),
  ('VIP50', 50, 'VIP paket - 50 kredita', 10, 0),
  ('STARTER3', 3, 'Početni bonus - 3 kredita', 100, 0),
  ('PHOTO15', 15, 'Dodatne fotografije - 15 kredita', 40, 0)
ON CONFLICT (code) DO NOTHING;
