import { supabase } from './supabase';

export interface ActivatePremiumParams {
  userId: string;
  planType: 'monthly' | 'yearly';
  amount: number;
}

export async function isPremiumSystemEnabled() {
  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('id', 'premium_enabled')
    .maybeSingle();

  return settings?.value ?? true;
}

export async function activatePremium({ userId, planType, amount }: ActivatePremiumParams) {
  const durationMonths = planType === 'monthly' ? 1 : 12;
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      is_premium: true,
      premium_expires_at: expiresAt.toISOString(),
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating user profile:', profileError);
    return { success: false, error: profileError };
  }

  const { error: subscriptionError } = await supabase
    .from('premium_subscriptions')
    .insert({
      user_id: userId,
      plan_type: planType,
      amount,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    });

  if (subscriptionError) {
    console.error('Error creating subscription:', subscriptionError);
    return { success: false, error: subscriptionError };
  }

  return { success: true };
}

export async function checkPremiumStatus(userId: string) {
  const { data: settings } = await supabase
    .from('site_settings')
    .select('value')
    .eq('id', 'premium_enabled')
    .maybeSingle();

  if (settings && !settings.value) {
    return { isPremium: true, expiresAt: null };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('is_premium, premium_expires_at')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return { isPremium: false, expiresAt: null };
  }

  if (data.is_premium && data.premium_expires_at) {
    const expiresAt = new Date(data.premium_expires_at);
    const isExpired = expiresAt < new Date();

    if (isExpired) {
      await supabase
        .from('user_profiles')
        .update({ is_premium: false })
        .eq('id', userId);

      return { isPremium: false, expiresAt: null };
    }

    return { isPremium: true, expiresAt: data.premium_expires_at };
  }

  return { isPremium: false, expiresAt: null };
}

export async function cancelPremium(userId: string) {
  const { error } = await supabase
    .from('premium_subscriptions')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error cancelling subscription:', error);
    return { success: false, error };
  }

  return { success: true };
}

export async function getUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('premium_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return { subscriptions: [], error };
  }

  return { subscriptions: data, error: null };
}
