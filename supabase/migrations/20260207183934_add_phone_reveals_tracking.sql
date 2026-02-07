/*
  # Add Phone Reveals Tracking System

  1. New Tables
    - `phone_reveals`
      - `id` (uuid, primary key)
      - `revealer_id` (uuid, references user_profiles) - User who revealed the phone
      - `owner_id` (uuid, references user_profiles) - User whose phone was revealed
      - `car_id` (uuid, references cars, nullable) - Car where phone was revealed
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `phone_reveals` table
    - Add policy for users to view their own phone reveals
    - Add policy for users to create new phone reveals
    - Add policy for users to see who revealed their phone number
    
  3. Important Notes
    - This tracks when users reveal other users' phone numbers
    - Used to display revealed status in user settings
    - Helps users track where their phone number was shared
*/

-- Create phone_reveals table
CREATE TABLE IF NOT EXISTS phone_reveals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revealer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  car_id uuid REFERENCES cars(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE phone_reveals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view phone numbers they have revealed
CREATE POLICY "Users can view their phone reveals"
  ON phone_reveals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = revealer_id);

-- Policy: Users can view who revealed their phone number
CREATE POLICY "Users can see who revealed their phone"
  ON phone_reveals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policy: Users can create new phone reveals
CREATE POLICY "Users can create phone reveals"
  ON phone_reveals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = revealer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_reveals_revealer ON phone_reveals(revealer_id);
CREATE INDEX IF NOT EXISTS idx_phone_reveals_owner ON phone_reveals(owner_id);
CREATE INDEX IF NOT EXISTS idx_phone_reveals_car ON phone_reveals(car_id);