import { supabase } from './supabase';

export interface CreditCost {
  action: string;
  cost: number;
  description: string;
}

export const CREDIT_COSTS = {
  CAR_AD: 5,
  SWAP_OFFER: 1,
  FEATURED_3H: 1,
  FEATURED_5H: 2,
  FEATURED_24H: 5,
} as const;

export const CREDIT_PACKAGES = [
  { credits: 10, price: 5, label: '10 kredita' },
  { credits: 25, price: 10, label: '25 kredita' },
  { credits: 50, price: 18, label: '50 kredita' },
  { credits: 100, price: 30, label: '100 kredita' },
];

export async function getUserCredits(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return 0;
  }

  return data.credits || 0;
}

export async function isUserPremium(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('is_premium, premium_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  if (!data.is_premium) {
    return false;
  }

  if (data.premium_expires_at) {
    return new Date(data.premium_expires_at) > new Date();
  }

  return true;
}

export async function checkCredits(userId: string, cost: number): Promise<{
  hasEnough: boolean;
  currentCredits: number;
  isPremium: boolean;
}> {
  const isPremium = await isUserPremium(userId);

  if (isPremium) {
    return {
      hasEnough: true,
      currentCredits: 0,
      isPremium: true,
    };
  }

  const currentCredits = await getUserCredits(userId);

  return {
    hasEnough: currentCredits >= cost,
    currentCredits,
    isPremium: false,
  };
}

export async function spendCredits(userId: string, cost: number): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> {
  const isPremium = await isUserPremium(userId);

  if (isPremium) {
    return {
      success: true,
      newBalance: 0,
    };
  }

  const currentCredits = await getUserCredits(userId);

  if (currentCredits < cost) {
    return {
      success: false,
      newBalance: currentCredits,
      error: `Nemate dovoljno kredita. Potrebno: ${cost}, Imate: ${currentCredits}`,
    };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ credits: currentCredits - cost })
    .eq('id', userId)
    .select('credits')
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      newBalance: currentCredits,
      error: 'Greška pri trošenju kredita',
    };
  }

  return {
    success: true,
    newBalance: data.credits,
  };
}

export async function addCredits(userId: string, amount: number): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> {
  const currentCredits = await getUserCredits(userId);
  const newBalance = currentCredits + amount;

  const { data, error } = await supabase
    .from('user_profiles')
    .update({ credits: newBalance })
    .eq('id', userId)
    .select('credits')
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      newBalance: currentCredits,
      error: 'Greška pri dodavanju kredita',
    };
  }

  return {
    success: true,
    newBalance: data.credits,
  };
}

export async function isFirstCarAdFree(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('first_car_ad_used')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return !data.first_car_ad_used;
}

export async function markFirstCarAdUsed(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ first_car_ad_used: true })
    .eq('id', userId);

  return !error;
}

export async function isFirstSwapOfferFree(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('first_swap_offer_used')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return !data.first_swap_offer_used;
}

export async function markFirstSwapOfferUsed(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ first_swap_offer_used: true })
    .eq('id', userId);

  return !error;
}

export async function calculateCarAdCost(userId: string): Promise<{
  cost: number;
  isFree: boolean;
  reason: string;
}> {
  const isPremium = await isUserPremium(userId);

  if (isPremium) {
    return {
      cost: 0,
      isFree: true,
      reason: 'Premium korisnik - besplatno',
    };
  }

  const isFirstFree = await isFirstCarAdFree(userId);

  if (isFirstFree) {
    return {
      cost: 0,
      isFree: true,
      reason: 'Prvi oglas je besplatan',
    };
  }

  return {
    cost: CREDIT_COSTS.CAR_AD,
    isFree: false,
    reason: `Košta ${CREDIT_COSTS.CAR_AD} kredita`,
  };
}

export async function calculateSwapOfferCost(userId: string): Promise<{
  cost: number;
  isFree: boolean;
  reason: string;
}> {
  const isPremium = await isUserPremium(userId);

  if (isPremium) {
    return {
      cost: 0,
      isFree: true,
      reason: 'Premium korisnik - besplatno',
    };
  }

  const isFirstFree = await isFirstSwapOfferFree(userId);

  if (isFirstFree) {
    return {
      cost: 0,
      isFree: true,
      reason: 'Prva swap ponuda je besplatna',
    };
  }

  return {
    cost: CREDIT_COSTS.SWAP_OFFER,
    isFree: false,
    reason: `Košta ${CREDIT_COSTS.SWAP_OFFER} kredit`,
  };
}
