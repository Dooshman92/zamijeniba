/*
  # Car Swap Platform Schema

  1. New Tables
    - `cars`
      - `id` (uuid, primary key)
      - `user_name` (text) - Owner's name
      - `brand` (text) - Car brand (e.g., BMW, Audi)
      - `model` (text) - Car model
      - `year` (integer) - Manufacturing year
      - `mileage` (integer) - Kilometers driven
      - `fuel_type` (text) - Petrol, Diesel, Electric, Hybrid
      - `description` (text) - Detailed description
      - `image_url` (text) - Car image
      - `color` (text) - Car color
      - `transmission` (text) - Manual or Automatic
      - `created_at` (timestamp)
    
    - `swap_offers`
      - `id` (uuid, primary key)
      - `car_id` (uuid) - Original car being offered for swap
      - `offered_car_id` (uuid) - Counter-offer car
      - `status` (text) - pending, accepted, rejected
      - `message` (text) - Optional message
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Public can read all cars
    - Public can create cars and swap offers
    - Public can view swap offers
*/

CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  mileage integer NOT NULL,
  fuel_type text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  color text NOT NULL,
  transmission text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS swap_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  offered_car_id uuid REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cars"
  ON cars FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create cars"
  ON cars FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view swap offers"
  ON swap_offers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create swap offers"
  ON swap_offers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update swap offers"
  ON swap_offers FOR UPDATE
  USING (true)
  WITH CHECK (true);