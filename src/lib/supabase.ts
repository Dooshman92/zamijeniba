import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type VehicleType = 'automobil' | 'motocikl' | 'quad' | 'motorne_sanke' | 'jetski';

export interface Car {
  id: string;
  user_id: string;
  user_email: string;
  owner_is_premium?: boolean;
  owner_nickname?: string;
  vehicle_type: VehicleType;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuel_type: string;
  description: string;
  image_url: string;
  color: string;
  transmission: string;
  drive_type?: string;
  kilowatts?: number;
  body_condition: number;
  mechanical_condition: number;
  interior_condition: number;
  horse_power: number;
  engine_size: string;
  doors: string;
  seats: number;
  location: string;
  status: 'active' | 'inactive' | 'hidden';
  damaged?: boolean;
  priority_score?: number;
  is_featured?: boolean;
  featured_until?: string;
  view_count?: number;
  last_promoted_at?: string;
  engine_displacement?: number;
  hull_material?: string;
  track_length?: number;
  xenon_lights?: boolean;
  heated_seats?: boolean;
  leather_seats?: boolean;
  sunroof?: boolean;
  parking_sensors?: boolean;
  parking_camera?: boolean;
  navigation?: boolean;
  bluetooth?: boolean;
  cruise_control?: boolean;
  climate_control?: boolean;
  alloy_wheels?: boolean;
  fog_lights?: boolean;
  roof_rack?: boolean;
  tow_hitch?: boolean;
  sport_package?: boolean;
  winter_tires?: boolean;
  summer_tires?: boolean;
  spare_tire?: boolean;
  electric_windows?: boolean;
  electric_mirrors?: boolean;
  abs?: boolean;
  esp?: boolean;
  airbags?: string;
  central_locking?: boolean;
  alarm?: boolean;
  immobilizer?: boolean;
  rain_sensor?: boolean;
  light_sensor?: boolean;
  tinted_windows?: boolean;
  electric_seats?: boolean;
  memory_seats?: boolean;
  sport_seats?: boolean;
  isofix?: boolean;
  start_stop?: boolean;
  keyless_entry?: boolean;
  rear_parking_sensors?: boolean;
  front_parking_sensors?: boolean;
  created_at: string;
  swap_preference?: CarPreference;
}

export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

export interface CarPreference {
  id: string;
  car_id: string;
  preferred_vehicle_type?: string;
  preferred_brand?: string;
  preferred_model?: string;
  min_year: number;
  max_year: number;
  max_mileage: number;
  price_difference: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  nickname: string;
  phone: string;
  location: string;
  avatar_url: string;
  gender: 'male' | 'female' | null;
  is_premium: boolean;
  is_admin: boolean;
  is_moderator: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  banned_by: string | null;
  ban_expires_at: string | null;
  credits: number;
  show_phone_number: boolean;
  premium_expires_at: string | null;
  premium_package_days: number | null;
  created_at: string;
  updated_at: string;
  email?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  credits_reward: number;
  description: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface PromoCodeRedemption {
  id: string;
  user_id: string;
  code: string;
  credits_received: number;
  redeemed_at: string;
}

export interface PremiumSubscription {
  id: string;
  user_id: string;
  plan_type: 'monthly' | 'yearly';
  amount: number;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  car_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  swap_offer_id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  content?: string;
  topic: string;
  extension: string;
  is_read: boolean;
  private: boolean;
  message_type?: string;
  image_url?: string;
  conversation_id?: string;
  created_at: string;
}

export interface SwapOffer {
  id: string;
  car_id: string;
  offered_car_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  message: string | null;
  additional_payment?: number;
  conversation_id?: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  car_id: string;
  reported_by: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}
