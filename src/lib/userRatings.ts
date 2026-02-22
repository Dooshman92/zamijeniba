import { supabase } from './supabase';

export interface UserRatingInfo {
  averageRating: number | null;
  reviewCount: number;
}

export async function getUserRatingInfo(userId: string): Promise<UserRatingInfo> {
  try {
    const { data, error } = await supabase
      .from('user_reviews')
      .select('rating')
      .eq('reviewed_user_id', userId);

    if (error) {
      console.error('Error fetching user ratings:', error);
      return { averageRating: null, reviewCount: 0 };
    }

    if (!data || data.length === 0) {
      return { averageRating: null, reviewCount: 0 };
    }

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = sum / data.length;

    return {
      averageRating,
      reviewCount: data.length
    };
  } catch (error) {
    console.error('Unexpected error fetching user ratings:', error);
    return { averageRating: null, reviewCount: 0 };
  }
}
