import { useEffect, useState, useRef } from 'react';
import { X, Car as CarIcon, User, MessageCircle, MapPin, Star, MessageSquare, Shield, Smile, ThumbsUp, CheckCircle, Heart, Phone } from 'lucide-react';
import { Car, supabase, UserProfile } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { CarCard } from './CarCard';
import { PremiumBadge } from './PremiumBadge';

interface UserReview {
  id: string;
  reviewer_id: string;
  rating_communication: number;
  rating_reliability: number;
  rating_friendliness: number;
  comment: string;
  created_at: string;
  reviewer_nickname: string | null;
  reviewer_avatar: string | null;
  reactions: {
    helpful: number;
    accurate: number;
    supportive: number;
    user_reaction?: string | null;
  };
}

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  onStartConversation?: (userId: string) => void;
}

export function UserProfileModal({ userId, onClose, onStartConversation }: UserProfileModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const { user: currentUser } = useAuth();
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserCars();
    fetchReviews();
    if (currentUser) {
      fetchCurrentUserProfile();
    }
  }, [userId, currentUser]);

  const fetchCurrentUserProfile = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();
    if (data) {
      setCurrentUserProfile(data);
    }
  };

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
    }
  };

  const fetchUserCars = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      const carsWithOwnerInfo = data.map(car => ({
        ...car,
        owner_is_premium: userProfile?.is_premium || false,
        owner_nickname: userProfile?.nickname || null,
      }));
      setUserCars(carsWithOwnerInfo as Car[]);
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    const { data: reviewsData } = await supabase
      .from('user_reviews')
      .select(`
        id,
        reviewer_id,
        rating_communication,
        rating_reliability,
        rating_friendliness,
        comment,
        created_at
      `)
      .eq('reviewed_user_id', userId)
      .order('created_at', { ascending: false });

    if (reviewsData) {
      const reviewsWithDetails = await Promise.all(
        reviewsData.map(async (review) => {
          const { data: reviewer } = await supabase
            .from('user_profiles')
            .select('nickname, avatar_url')
            .eq('id', review.reviewer_id)
            .maybeSingle();

          const { data: reactions } = await supabase
            .from('review_reactions')
            .select('reaction_type, user_id')
            .eq('review_id', review.id);

          const reactionCounts = {
            helpful: reactions?.filter(r => r.reaction_type === 'helpful').length || 0,
            accurate: reactions?.filter(r => r.reaction_type === 'accurate').length || 0,
            supportive: reactions?.filter(r => r.reaction_type === 'supportive').length || 0,
            user_reaction: currentUser
              ? reactions?.find(r => r.user_id === currentUser.id)?.reaction_type || null
              : null
          };

          return {
            ...review,
            reviewer_nickname: reviewer?.nickname || null,
            reviewer_avatar: reviewer?.avatar_url || null,
            reactions: reactionCounts
          };
        })
      );

      setReviews(reviewsWithDetails);
    }
    setLoadingReviews(false);
  };

  const handleReaction = async (reviewId: string, reactionType: string) => {
    if (!currentUser) {
      alert('Morate biti prijavljeni');
      return;
    }

    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    if (review.reactions.user_reaction === reactionType) {
      await supabase
        .from('review_reactions')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', currentUser.id);
    } else {
      if (review.reactions.user_reaction) {
        await supabase
          .from('review_reactions')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', currentUser.id);
      }

      await supabase
        .from('review_reactions')
        .insert({
          review_id: reviewId,
          user_id: currentUser.id,
          reaction_type: reactionType
        });
    }

    fetchReviews();
  };


  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSendMessage = async () => {
    if (!currentUser || !userProfile) return;

    const participants = [currentUser.id, userId].sort();
    const conversationId = `${participants[0]}_${participants[1]}`;

    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!existingConv) {
      await supabase.from('conversations').insert({
        id: conversationId,
        created_at: new Date().toISOString(),
      });

      await supabase.from('conversation_participants').insert([
        { conversation_id: conversationId, user_id: currentUser.id },
        { conversation_id: conversationId, user_id: userId },
      ]);
    }

    if (onStartConversation) {
      onStartConversation(userId);
    }
    onClose();
  };

  const displayName = userProfile?.nickname
    ? `@${userProfile.nickname}`
    : userProfile?.email?.split('@')[0] || 'Korisnik';

  const isOwnProfile = currentUser?.id === userId;

  const calculateAverageRatings = () => {
    if (reviews.length === 0) return null;

    const avgCommunication = reviews.reduce((sum, r) => sum + r.rating_communication, 0) / reviews.length;
    const avgReliability = reviews.reduce((sum, r) => sum + r.rating_reliability, 0) / reviews.length;
    const avgFriendliness = reviews.reduce((sum, r) => sum + r.rating_friendliness, 0) / reviews.length;
    const overall = (avgCommunication + avgReliability + avgFriendliness) / 3;

    return {
      overall,
      communication: avgCommunication,
      reliability: avgReliability,
      friendliness: avgFriendliness
    };
  };

  const averageRatings = calculateAverageRatings();

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'helpful':
        return <ThumbsUp className="w-3 h-3" />;
      case 'accurate':
        return <CheckCircle className="w-3 h-3" />;
      case 'supportive':
        return <Heart className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getReactionLabel = (type: string) => {
    switch (type) {
      case 'helpful':
        return 'Korisno';
      case 'accurate':
        return 'Tačno';
      case 'supportive':
        return 'Podrška';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sr-Latn-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/90 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-cyan-400" />
              Profil korisnika
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
          <div className="p-6">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-full ${
                      userProfile?.gender === 'female'
                        ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                        : userProfile?.gender === 'male'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    } flex items-center justify-center border-4 border-white/20 shadow-lg`}>
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {userProfile?.is_premium && (
                    <div className="absolute -bottom-2 -right-2">
                      <PremiumBadge size="sm" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-2xl font-bold text-white">{displayName}</h3>
                    {averageRatings && (
                      <button
                        onClick={scrollToReviews}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 rounded-full px-3 py-1 hover:from-amber-500/30 hover:to-yellow-500/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                      >
                        {renderStars(averageRatings.overall, 'sm')}
                        <span className="text-amber-400 font-bold text-sm">{averageRatings.overall.toFixed(1)}</span>
                        <span className="text-amber-400/70 text-xs">• Dojmovi ({reviews.length})</span>
                      </button>
                    )}
                  </div>
                  {userProfile?.location && (
                    <div className="flex items-center gap-2 text-cyan-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}

                  {!isOwnProfile && userProfile?.phone && userProfile?.show_phone_number && (
                    <a
                      href={`tel:${userProfile.phone}`}
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors group mb-3"
                    >
                      <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{userProfile.phone}</span>
                    </a>
                  )}

                  {isOwnProfile && userProfile?.phone && userProfile?.show_phone_number && (
                    <div className="flex items-center gap-2 text-gray-400 mb-3">
                      <Phone className="w-4 h-4" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}

                  {!isOwnProfile && currentUser && currentUserProfile?.is_premium && (
                    <button
                      onClick={handleSendMessage}
                      className="mt-4 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Pošalji poruku
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <CarIcon className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-white">
                  Oglasi ({userCars.length})
                </h3>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500"></div>
                  </div>
                  <p className="mt-4 text-gray-300">Učitavanje...</p>
                </div>
              ) : userCars.length === 0 ? (
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                  <CarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Korisnik trenutno nema aktivnih oglasa</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userCars.map((car) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      onSwapOffer={() => {}}
                      showSwapButton={false}
                      currentUserId={currentUser?.id}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6" ref={reviewsRef}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Dojmovi ({reviews.length})
                </h3>
              </div>

              {loadingReviews ? (
                <div className="text-center py-6">
                  <div className="inline-block relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500/30 border-t-amber-500"></div>
                  </div>
                  <p className="mt-2 text-gray-300 text-xs">Učitavanje dojmova...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <Star className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    {isOwnProfile
                      ? 'Još uvijek niste primili nijedan dojam'
                      : 'Korisnik još nije primio nijedan dojam'}
                  </p>
                </div>
              ) : (
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
                  {averageRatings && (
                    <div className="pb-2 mb-2 border-b border-white/10">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-blue-400" />
                          <span className="text-gray-300">Komunikacija</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(averageRatings.communication, 'sm')}
                          <span className="text-gray-400 text-xs">{averageRatings.communication.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs mt-1">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-green-400" />
                          <span className="text-gray-300">Pouzdanost</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(averageRatings.reliability, 'sm')}
                          <span className="text-gray-400 text-xs">{averageRatings.reliability.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs mt-1">
                        <div className="flex items-center gap-1.5">
                          <Smile className="w-3 h-3 text-pink-400" />
                          <span className="text-gray-300">Ljubaznost</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(averageRatings.friendliness, 'sm')}
                          <span className="text-gray-400 text-xs">{averageRatings.friendliness.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0">
                            {review.reviewer_avatar ? (
                              <img
                                src={review.reviewer_avatar}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full object-cover border border-cyan-400"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className="font-semibold text-white text-xs">
                                {review.reviewer_nickname ? `@${review.reviewer_nickname}` : 'Korisnik'}
                              </p>
                              <div className="flex items-center gap-0.5">
                                {renderStars((review.rating_communication + review.rating_reliability + review.rating_friendliness) / 3, 'sm')}
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-1">{formatDate(review.created_at)}</p>
                            <p className="text-gray-300 text-xs mb-1.5 leading-tight">{review.comment}</p>

                            <div className="flex items-center gap-1 flex-wrap">
                              {['helpful', 'accurate', 'supportive'].map((reactionType) => {
                                const count = review.reactions[reactionType as keyof typeof review.reactions] as number;
                                const isActive = review.reactions.user_reaction === reactionType;

                                return (
                                  <button
                                    key={reactionType}
                                    onClick={() => handleReaction(review.id, reactionType)}
                                    disabled={!currentUser}
                                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full transition-all text-[10px] ${
                                      isActive
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    } border`}
                                  >
                                    {getReactionIcon(reactionType)}
                                    <span className="text-[10px]">{getReactionLabel(reactionType)}</span>
                                    {count > 0 && (
                                      <span className="text-[10px] font-semibold">{count}</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
