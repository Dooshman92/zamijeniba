import { useEffect, useState } from 'react';
import { ArrowRightLeft, MessageSquare, Check, X, Phone, MapPin, User, MessageCircle } from 'lucide-react';
import { Car, SwapOffer, supabase, UserProfile } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { getOrCreateConversation } from '../lib/messaging';
import { CarDetailModal } from './CarDetailModal';
import { UserProfileModal } from './UserProfileModal';

interface SwapOfferWithDetails extends SwapOffer {
  targetCar?: Car;
  offeredCar?: Car;
  targetOwnerProfile?: UserProfile;
  offeredOwnerProfile?: UserProfile;
}

interface ConversationWithDetails {
  id: string;
  car_id: string;
  updated_at: string;
  last_message_at: string;
  unread_count: number;
  other_user_id: string;
  other_user_email: string;
  other_user_nickname: string | null;
  car?: Car;
  last_message_content?: string;
}

interface SwapOffersPanelProps {
  onAcceptOffer?: (conversationId: string, otherUserId: string) => void;
  onSwapOffer?: (car: Car) => void;
  onLiveInquiry?: (car: Car) => void;
  onOwnerClick?: (userId: string) => void;
  onSendMessage?: (userId: string, carId?: string) => void;
  isPremiumUser?: boolean;
}

export function SwapOffersPanel({ onAcceptOffer, onSwapOffer, onLiveInquiry, onOwnerClick, onSendMessage, isPremiumUser = false }: SwapOffersPanelProps) {
  const [offers, setOffers] = useState<SwapOfferWithDetails[]>([]);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<{ userId: string; userEmail: string } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadOffers();
    loadConversations();

    if (!user) return;

    const messagesChannel = supabase
      .channel('swap-offers-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  const loadOffers = async () => {
    const { data: offersData, error } = await supabase
      .from('swap_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && offersData) {
      const offersWithDetails = await Promise.all(
        offersData.map(async (offer) => {
          const { data: targetCar } = await supabase
            .from('cars')
            .select('*')
            .eq('id', offer.car_id)
            .maybeSingle();

          const { data: offeredCar } = await supabase
            .from('cars')
            .select('*')
            .eq('id', offer.offered_car_id)
            .maybeSingle();

          let targetOwnerProfile;
          let offeredOwnerProfile;

          if (targetCar?.user_id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', targetCar.user_id)
              .maybeSingle();
            targetOwnerProfile = profile || undefined;
          }

          if (offeredCar?.user_id) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', offeredCar.user_id)
              .maybeSingle();
            offeredOwnerProfile = profile || undefined;
          }

          return {
            ...offer,
            targetCar: targetCar || undefined,
            offeredCar: offeredCar || undefined,
            targetOwnerProfile,
            offeredOwnerProfile
          };
        })
      );

      setOffers(offersWithDetails);
    }
    setLoading(false);
  };

  const loadConversations = async () => {
    if (!user) return;

    const { data: acceptedOffers } = await supabase
      .from('swap_offers')
      .select('conversation_id')
      .eq('status', 'accepted')
      .not('conversation_id', 'is', null);

    if (!acceptedOffers || acceptedOffers.length === 0) {
      setConversations([]);
      return;
    }

    const offerConversationIds = acceptedOffers.map(o => o.conversation_id).filter(Boolean);

    const { data: participantData } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        unread_count,
        conversations (
          id,
          car_id,
          updated_at,
          last_message_at
        )
      `)
      .eq('user_id', user.id)
      .in('conversation_id', offerConversationIds);

    if (!participantData || participantData.length === 0) {
      setConversations([]);
      return;
    }

    const conversationIds = participantData.map(p => p.conversation_id);

    const { data: otherParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id, user_profiles(id, nickname)')
      .in('conversation_id', conversationIds)
      .neq('user_id', user.id);

    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    const conversationsMap = new Map();
    participantData.forEach(p => {
      if (p.conversations) {
        conversationsMap.set(p.conversation_id, {
          id: (p.conversations as any).id,
          car_id: (p.conversations as any).car_id,
          updated_at: (p.conversations as any).updated_at,
          last_message_at: (p.conversations as any).last_message_at,
          unread_count: p.unread_count,
          other_user_id: '',
          other_user_nickname: null,
          other_user_email: '',
        });
      }
    });

    otherParticipants?.forEach(op => {
      const conv = conversationsMap.get(op.conversation_id);
      if (conv) {
        conv.other_user_id = op.user_id;
        conv.other_user_nickname = op.user_profiles ? (op.user_profiles as any).nickname : null;
      }
    });

    const messagesByConversation = new Map();
    lastMessages?.forEach(msg => {
      if (!messagesByConversation.has(msg.conversation_id)) {
        messagesByConversation.set(msg.conversation_id, msg.content);
      }
    });

    const conversationsList = Array.from(conversationsMap.values())
      .filter(conv => conv.other_user_id)
      .map(conv => ({
        ...conv,
        last_message_content: messagesByConversation.get(conv.id) || '',
      }));

    const carIds = conversationsList.map(c => c.car_id).filter(Boolean);
    const { data: cars } = await supabase
      .from('cars')
      .select('*')
      .in('id', carIds);

    const { data: offerData } = await supabase
      .from('swap_offers')
      .select('*')
      .in('conversation_id', conversationsList.map(c => c.id));

    conversationsList.forEach(conv => {
      conv.car = cars?.find(c => c.id === conv.car_id);
      const offer = offerData?.find(o => o.conversation_id === conv.id);
      if (offer) {
        (conv as any).offer = offer;
      }
    });

    conversationsList.sort((a, b) =>
      new Date(b.last_message_at || b.updated_at).getTime() -
      new Date(a.last_message_at || a.updated_at).getTime()
    );

    const otherUserIds = conversationsList.map(c => c.other_user_id).filter(Boolean);
    if (otherUserIds.length > 0) {
      const { data: emails } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', otherUserIds);

      conversationsList.forEach(conv => {
        const profile = emails?.find(e => e.id === conv.other_user_id);
        conv.other_user_email = profile?.email || '';
      });
    }

    setConversations(conversationsList);
  };

  const updateOfferStatus = async (offerId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('swap_offers')
      .update({ status })
      .eq('id', offerId);

    if (!error) {
      loadOffers();
    }
  };

  const handleAcceptOffer = async (offer: SwapOfferWithDetails) => {
    if (!user || !offer.offeredCar?.user_id || !offer.targetCar) return;

    const conversationId = await getOrCreateConversation(
      user.id,
      offer.offeredCar.user_id,
      offer.targetCar.id
    );

    if (!conversationId) {
      alert('Greška pri kreiranju konverzacije');
      return;
    }

    const { error } = await supabase
      .from('swap_offers')
      .update({
        status: 'accepted',
        conversation_id: conversationId
      })
      .eq('id', offer.id);

    if (error) {
      console.error('Error accepting offer:', error);
      alert('Greška pri prihvatanju ponude');
      return;
    }

    loadOffers();
    loadConversations();
    if (onAcceptOffer) {
      onAcceptOffer(conversationId, offer.offeredCar.user_id);
    }
  };

  const shouldShowPhone = (profile: UserProfile | undefined, offerStatus: string) => {
    if (!profile?.phone) return false;
    return offerStatus === 'accepted';
  };

  if (loading) {
    return (
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <div className="inline-block relative mb-2">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-cyan-500/30 border-t-cyan-500"></div>
        </div>
        <p className="text-gray-300 text-sm">Učitavanje ponuda...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="relative inline-block mb-3">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
          <ArrowRightLeft className="relative w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Nema aktivnih ponuda</h3>
        <p className="text-gray-400 text-sm">Ponude za zamjenu će se prikazati ovdje</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.length > 0 && (
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            Poruke o ponudama
          </h2>

          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onAcceptOffer && onAcceptOffer(conv.id, conv.other_user_id)}
                className={`backdrop-blur-md rounded-xl p-3 transition-all cursor-pointer hover:scale-[1.01] ${
                  conv.unread_count > 0
                    ? 'border-2 border-green-500/50 bg-green-500/10 hover:bg-green-500/20'
                    : 'border border-white/10 bg-white/5 hover:border-green-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {conv.car && (
                    <img
                      src={conv.car.image_url}
                      alt={conv.car.brand}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-white text-sm ${conv.unread_count > 0 ? 'font-black' : 'font-bold'}`}>
                        @{conv.other_user_nickname || conv.other_user_email.split('@')[0]}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 animate-pulse">
                          {conv.unread_count}
                        </span>
                      )}
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold rounded-full px-1.5 py-0.5 border border-green-500/30">
                        Prihvaćeno
                      </span>
                    </div>
                    {conv.car && (
                      <p className="text-xs text-cyan-400 mb-0.5">
                        {conv.car.brand} {conv.car.model} ({conv.car.year})
                      </p>
                    )}
                    {conv.last_message_content && (
                      <p className={`text-xs truncate ${conv.unread_count > 0 ? 'text-white font-semibold' : 'text-gray-400'}`}>{conv.last_message_content}</p>
                    )}
                  </div>
                  <MessageSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <ArrowRightLeft className="w-4 h-4 text-white" />
          </div>
          Ponude za zamjenu
        </h2>

        <div className="space-y-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`backdrop-blur-md rounded-xl p-3 transition-all border ${
              offer.status === 'accepted'
                ? 'border-green-500/50 bg-green-500/10'
                : offer.status === 'rejected'
                ? 'border-red-500/50 bg-red-500/10'
                : 'border-white/10 bg-white/5 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${
                  offer.status === 'accepted'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : offer.status === 'rejected'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}
              >
                {offer.status === 'accepted'
                  ? 'Prihvaćeno'
                  : offer.status === 'rejected'
                  ? 'Odbijeno'
                  : 'Na čekanju'}
              </span>
              <span className="text-xs text-gray-400 backdrop-blur-md bg-white/5 px-2 py-1 rounded-lg">
                {new Date(offer.created_at).toLocaleDateString('hr-HR')}
              </span>
            </div>

            {onAcceptOffer && user && offer.offeredCar && offer.targetCar && offer.status === 'accepted' && offer.conversation_id && (
              <div className="mb-3">
                {offer.targetCar.user_id === user.id && offer.offeredCar.user_id && (
                  <button
                    onClick={() => onAcceptOffer(offer.conversation_id!, offer.offeredCar!.user_id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50 animate-pulse"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Otvori chat sa @{offer.offeredOwnerProfile?.nickname || offer.offeredCar.user_email?.split('@')[0]}</span>
                  </button>
                )}
                {offer.offeredCar.user_id === user.id && offer.targetCar.user_id && (
                  <button
                    onClick={() => onAcceptOffer(offer.conversation_id!, offer.targetCar!.user_id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50 animate-pulse"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Otvori chat sa @{offer.targetOwnerProfile?.nickname || offer.targetCar.user_email?.split('@')[0]}</span>
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
              {offer.offeredCar && (
                <div
                  onClick={() => setSelectedCar(offer.offeredCar!)}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-2 hover:border-cyan-500/30 transition-colors cursor-pointer hover:scale-[1.02] transform duration-200"
                >
                  <p className="text-xs text-cyan-400 mb-1.5 font-semibold uppercase tracking-wide">Nudi se:</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={offer.offeredCar.image_url}
                      alt={offer.offeredCar.brand}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-white text-xs mb-0.5">
                        {offer.offeredCar.brand} {offer.offeredCar.model}
                      </p>
                      <p className="text-xs text-cyan-400">{offer.offeredCar.year}</p>
                      <p className="text-xs text-gray-400">{offer.offeredCar.user_email?.split('@')[0]}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                  <ArrowRightLeft className="w-5 h-5 text-white" />
                </div>
              </div>

              {offer.targetCar && (
                <div
                  onClick={() => setSelectedCar(offer.targetCar!)}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-2 hover:border-cyan-500/30 transition-colors cursor-pointer hover:scale-[1.02] transform duration-200"
                >
                  <p className="text-xs text-blue-400 mb-1.5 font-semibold uppercase tracking-wide">Za:</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={offer.targetCar.image_url}
                      alt={offer.targetCar.brand}
                      className="w-16 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-white text-xs mb-0.5">
                        {offer.targetCar.brand} {offer.targetCar.model}
                      </p>
                      <p className="text-xs text-blue-400">{offer.targetCar.year}</p>
                      <p className="text-xs text-gray-400">{offer.targetCar.user_email?.split('@')[0]}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(offer.message || (offer.additional_payment && offer.additional_payment > 0) ||
              shouldShowPhone(offer.targetOwnerProfile, offer.status) ||
              shouldShowPhone(offer.offeredOwnerProfile, offer.status)) && (
              <div className="mt-3 space-y-2">
                {offer.message && (
                  <div className="backdrop-blur-md bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 flex gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 leading-relaxed">{offer.message}</p>
                  </div>
                )}
                {offer.additional_payment && offer.additional_payment > 0 && (
                  <div className="backdrop-blur-md bg-green-500/10 border border-green-500/20 rounded-lg p-2 flex gap-2 items-center">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-400 text-sm font-bold">💰</span>
                    </div>
                    <div>
                      <p className="text-xs text-green-400 font-semibold uppercase tracking-wide">Doplata</p>
                      <p className="text-sm font-bold text-white">{Number(offer.additional_payment).toLocaleString('de-DE')} KM</p>
                    </div>
                  </div>
                )}

                {offer.status === 'accepted' && user && (
                  <>
                    {offer.targetCar?.user_id === user.id && offer.offeredOwnerProfile && (
                      <div className="relative backdrop-blur-md bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 shadow-lg shadow-cyan-500/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-lg"></div>
                        <div className="relative">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                              <User className="w-3 h-3 text-cyan-400" />
                            </div>
                            <p className="text-xs text-cyan-400 font-bold uppercase tracking-wide">Kontakt</p>
                          </div>
                          <div className="space-y-2">
                            <div className="group backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all duration-300 border border-white/10 hover:border-cyan-500/30">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <User className="w-3 h-3 text-cyan-400" />
                                  </div>
                                  <button
                                    onClick={() => setSelectedUserProfile({
                                      userId: offer.offeredCar!.user_id,
                                      userEmail: offer.offeredCar!.user_email || ''
                                    })}
                                    className="text-white text-sm font-bold hover:text-cyan-400 transition-all duration-300"
                                  >
                                    @{offer.offeredOwnerProfile.nickname || offer.offeredCar?.user_email?.split('@')[0]}
                                  </button>
                                </div>
                                {onAcceptOffer && offer.conversation_id && offer.offeredCar?.user_id && (
                                  <button
                                    onClick={() => onAcceptOffer(offer.conversation_id!, offer.offeredCar!.user_id)}
                                    className="p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 rounded-lg transition-all duration-300 hover:scale-110"
                                    title="Otvori chat"
                                  >
                                    <MessageCircle className="w-3 h-3 text-green-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {offer.offeredOwnerProfile.location && (
                              <div className="group backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all duration-300 border border-white/10 hover:border-cyan-500/30">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <MapPin className="w-3 h-3 text-cyan-400" />
                                  </div>
                                  <span className="text-white font-medium text-xs">{offer.offeredOwnerProfile.location}</span>
                                </div>
                              </div>
                            )}
                            {shouldShowPhone(offer.offeredOwnerProfile, offer.status) && (
                              <div className="group backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all duration-300 border border-white/10 hover:border-cyan-500/30">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <Phone className="w-3 h-3 text-cyan-400" />
                                  </div>
                                  <a href={`tel:${offer.offeredOwnerProfile.phone}`} className="text-white text-sm font-bold hover:text-cyan-400 transition-all duration-300">
                                    {offer.offeredOwnerProfile.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {offer.offeredCar?.user_id === user.id && offer.targetOwnerProfile && (
                      <div className="relative backdrop-blur-md bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/10 border border-blue-500/30 rounded-lg p-3 shadow-lg shadow-blue-500/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg"></div>
                        <div className="relative">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                              <User className="w-3 h-3 text-blue-400" />
                            </div>
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-wide">Kontakt</p>
                          </div>
                          <div className="space-y-2">
                            <div className="group backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all duration-300 border border-white/10 hover:border-blue-500/30">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <User className="w-3 h-3 text-blue-400" />
                                  </div>
                                  <button
                                    onClick={() => setSelectedUserProfile({
                                      userId: offer.targetCar!.user_id,
                                      userEmail: offer.targetCar!.user_email || ''
                                    })}
                                    className="text-white text-sm font-bold hover:text-blue-400 transition-all duration-300"
                                  >
                                    @{offer.targetOwnerProfile.nickname || offer.targetCar?.user_email?.split('@')[0]}
                                  </button>
                                </div>
                                {onAcceptOffer && offer.conversation_id && offer.targetCar?.user_id && (
                                  <button
                                    onClick={() => onAcceptOffer(offer.conversation_id!, offer.targetCar!.user_id)}
                                    className="p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 rounded-lg transition-all duration-300 hover:scale-110"
                                    title="Otvori chat"
                                  >
                                    <MessageCircle className="w-3 h-3 text-green-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {offer.targetOwnerProfile.location && (
                              <div className="group backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all duration-300 border border-white/10 hover:border-blue-500/30">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <MapPin className="w-3 h-3 text-blue-400" />
                                  </div>
                                  <span className="text-white font-medium text-xs">{offer.targetOwnerProfile.location}</span>
                                </div>
                              </div>
                            )}
                            {shouldShowPhone(offer.targetOwnerProfile, offer.status) && (
                              <div className="group backdrop-blur-sm bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all duration-300 border border-white/10 hover:border-blue-500/30">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <Phone className="w-3 h-3 text-blue-400" />
                                  </div>
                                  <a href={`tel:${offer.targetOwnerProfile.phone}`} className="text-white text-sm font-bold hover:text-blue-400 transition-all duration-300">
                                    {offer.targetOwnerProfile.phone}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {offer.status === 'pending' && offer.targetCar && user && offer.targetCar.user_id === user.id && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => updateOfferStatus(offer.id, 'rejected')}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/30"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Odbij</span>
                </button>
                <button
                  onClick={() => handleAcceptOffer(offer)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Prihvati</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>

      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
          onSwapOffer={onSwapOffer}
          onLiveInquiry={onLiveInquiry}
          onOwnerClick={onOwnerClick}
          onSendMessage={onSendMessage}
          isPremiumUser={isPremiumUser}
        />
      )}

      {selectedUserProfile && (
        <UserProfileModal
          userId={selectedUserProfile.userId}
          userEmail={selectedUserProfile.userEmail}
          onClose={() => setSelectedUserProfile(null)}
        />
      )}
    </div>
  );
}
