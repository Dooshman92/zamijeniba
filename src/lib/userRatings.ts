import { supabase } from './supabase';

export interface UserRatingInfo {
  averageRating: number | null;
  reviewCount: number;
}

export async function getUserRatingInfo(userId: string): Promise<UserRatingInfo> {
  try {
    const { data, error } = await supabase
      .from('user_reviews')
      .select('rating_communication, rating_reliability, rating_friendliness')
      .eq('reviewed_user_id', userId);

    console.log('Fetching ratings for user:', userId, 'Data:', data, 'Error:', error);

    if (error) {
      console.error('Error fetching user ratings:', error);
      return { averageRating: null, reviewCount: 0 };
    }

    if (!data || data.length === 0) {
      console.log('No reviews found for user:', userId);
      return { averageRating: null, reviewCount: 0 };
    }

    // Calculate average of all three ratings for each review, then average all reviews
    const totalAverage = data.reduce((acc, review) => {
      const reviewAverage = (review.rating_communication + review.rating_reliability + review.rating_friendliness) / 3;
      return acc + reviewAverage;
    }, 0) / data.length;

    console.log('Calculated average:', totalAverage, 'Review count:', data.length);

    return {
      averageRating: totalAverage,
      reviewCount: data.length
    };
  } catch (error) {
    console.error('Unexpected error fetching user ratings:', error);
    return { averageRating: null, reviewCount: 0 };
  }
}
