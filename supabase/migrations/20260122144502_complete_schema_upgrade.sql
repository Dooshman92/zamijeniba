/*
  # Complete AutoSwap Database Schema

  1. New Tables
    - `user_profiles` - Extended user information
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `location` (text)
      - `avatar_url` (text)
      - `created_at`, `updated_at`
    
    - `car_images` - Multiple images per car
      - `id` (uuid, primary key)
      - `car_id` (uuid, references cars)
      - `image_url` (text)
      - `is_primary` (boolean)
      - `order_index` (integer)
      - `created_at`
    
    - `car_preferences` - User preferences for car swap
      - `id` (uuid, primary key)
      - `car_id` (uuid, references cars)
      - `preferred_brands` (text array)
      - `min_year` (integer)
      - `max_year` (integer)
      - `preferred_fuel_types` (text array)
      - `max_mileage` (integer)
      - `price_difference` (integer) - willing to pay extra
      - `created_at`, `updated_at`
    
    - `favorites` - Saved cars
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `car_id` (uuid, references cars)
      - `created_at`
    
    - `messages` - Chat between users
      - `id` (uuid, primary key)
      - `swap_offer_id` (uuid, references swap_offers)
      - `sender_id` (uuid, references auth.users)
      - `receiver_id` (uuid, references auth.users)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at`
    
    - `reports` - Report inappropriate content
      - `id` (uuid, primary key)
      - `car_id` (uuid, references cars)
      - `reported_by` (uuid, references auth.users)
      - `reason` (text)
      - `description` (text)
      - `status` (text) - pending, reviewed, resolved
      - `created_at`
  
  2. Updates to Existing Tables
    - Add columns to `cars` for condition ratings and estimated value
    - Update `swap_offers` with additional statuses
  
  3. Triggers
    - Auto-create user profile on signup
    - Auto-update timestamps
  
  4. Security
    - RLS policies for all tables
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  location text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to cars table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'body_condition') THEN
    ALTER TABLE cars ADD COLUMN body_condition integer DEFAULT 5 CHECK (body_condition >= 1 AND body_condition <= 10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'mechanical_condition') THEN
    ALTER TABLE cars ADD COLUMN mechanical_condition integer DEFAULT 5 CHECK (mechanical_condition >= 1 AND mechanical_condition <= 10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'interior_condition') THEN
    ALTER TABLE cars ADD COLUMN interior_condition integer DEFAULT 5 CHECK (interior_condition >= 1 AND interior_condition <= 10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'estimated_value') THEN
    ALTER TABLE cars ADD COLUMN estimated_value integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'horse_power') THEN
    ALTER TABLE cars ADD COLUMN horse_power integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'engine_size') THEN
    ALTER TABLE cars ADD COLUMN engine_size text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'doors') THEN
    ALTER TABLE cars ADD COLUMN doors integer DEFAULT 4;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'seats') THEN
    ALTER TABLE cars ADD COLUMN seats integer DEFAULT 5;
  END IF;
END $$;

-- Create car_images table
CREATE TABLE IF NOT EXISTS car_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create car_preferences table
CREATE TABLE IF NOT EXISTS car_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferred_brands text[],
  min_year integer,
  max_year integer,
  preferred_fuel_types text[],
  max_mileage integer,
  price_difference integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, car_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swap_offer_id uuid REFERENCES swap_offers(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  reported_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for car_images
CREATE POLICY "Anyone can view car images" ON car_images FOR SELECT USING (true);
CREATE POLICY "Car owners can manage images" ON car_images FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM cars WHERE cars.id = car_images.car_id AND cars.user_id = auth.uid())
);

-- RLS Policies for car_preferences
CREATE POLICY "Anyone can view preferences" ON car_preferences FOR SELECT USING (true);
CREATE POLICY "Car owners can manage preferences" ON car_preferences FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM cars WHERE cars.id = car_preferences.car_id AND cars.user_id = auth.uid())
);

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view own messages" ON messages FOR SELECT TO authenticated USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update received messages" ON messages FOR UPDATE TO authenticated USING (auth.uid() = receiver_id);

-- RLS Policies for reports
CREATE POLICY "Users can create reports" ON reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Users can view own reports" ON reports FOR SELECT TO authenticated USING (auth.uid() = reported_by);

-- Function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON user_profiles;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON car_preferences;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON car_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();