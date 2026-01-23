/*
  # Add Live Inquiries System for Premium Users

  1. New Tables
    - `live_inquiries`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to auth.users) - Must be premium
      - `receiver_id` (uuid, foreign key to auth.users)
      - `car_id` (uuid, foreign key to cars)
      - `message` (text) - Inquiry message
      - `contact_phone` (text) - Contact phone for quick response
      - `status` (text) - pending, responded, closed
      - `priority` (text) - high (premium), normal
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `live_inquiries` table
    - Add policy for authenticated users to create inquiries
    - Add policy for users to view their sent inquiries
    - Add policy for users to view received inquiries
    - Add policy for users to update their received inquiries

  3. Important Notes
    - Live inquiries are a premium feature
    - Premium users can send live/instant inquiries to car owners
    - High priority for better visibility
*/

CREATE TABLE IF NOT EXISTS live_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  contact_phone text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  priority text DEFAULT 'high' CHECK (priority IN ('high', 'normal')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE live_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create live inquiries"
  ON live_inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view sent inquiries"
  ON live_inquiries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view received inquiries"
  ON live_inquiries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can update received inquiries"
  ON live_inquiries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE INDEX IF NOT EXISTS idx_live_inquiries_sender ON live_inquiries(sender_id);
CREATE INDEX IF NOT EXISTS idx_live_inquiries_receiver ON live_inquiries(receiver_id);
CREATE INDEX IF NOT EXISTS idx_live_inquiries_car ON live_inquiries(car_id);
CREATE INDEX IF NOT EXISTS idx_live_inquiries_status ON live_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_live_inquiries_created ON live_inquiries(created_at DESC);