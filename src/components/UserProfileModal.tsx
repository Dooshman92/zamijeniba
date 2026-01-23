import { useEffect, useState } from 'react';
import { X, Car as CarIcon, User, MessageCircle, MapPin } from 'lucide-react';
import { Car, supabase, UserProfile } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { CarCard } from './CarCard';
import { PremiumBadge } from './PremiumBadge';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  onStartConversation?: (userId: string) => void;
}

export function UserProfileModal({ userId, onClose, onStartConversation }: UserProfileModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUserProfile();
    fetchUserCars();
  }, [userId]);

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
                  <h3 className="text-2xl font-bold text-white mb-2">{displayName}</h3>
                  {userProfile?.full_name && (
                    <p className="text-gray-400 mb-2">{userProfile.full_name}</p>
                  )}
                  {userProfile?.location && (
                    <div className="flex items-center gap-2 text-cyan-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}
                  {userProfile?.phone && userProfile?.show_phone_number && (
                    <p className="text-gray-400 mb-3">Tel: {userProfile.phone}</p>
                  )}

                  {!isOwnProfile && currentUser && (
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
