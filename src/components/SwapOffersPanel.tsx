import { useEffect, useState } from 'react';
import { ArrowRightLeft, MessageSquare, Check, X, Phone } from 'lucide-react';
import { Car, SwapOffer, supabase, UserProfile } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { getOrCreateConversation } from '../lib/messaging';
import { CarDetailModal } from './CarDetailModal';

interface SwapOfferWithDetails extends SwapOffer {
  targetCar?: Car;
  offeredCar?: Car;
  targetOwnerProfile?: UserProfile;
  offeredOwnerProfile?: UserProfile;
}

interface SwapOffersPanelProps {
  onAcceptOffer?: (conversationId: string) => void;
}

export function SwapOffersPanel({ onAcceptOffer }: SwapOffersPanelProps) {
  const [offers, setOffers] = useState<SwapOfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadOffers();
  }, []);

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

    const { error } = await supabase
      .from('swap_offers')
      .update({ status: 'accepted' })
      .eq('id', offer.id);

    if (error) {
      console.error('Error accepting offer:', error);
      alert('Greška pri prihvatanju ponude');
      return;
    }

    const conversationId = await getOrCreateConversation(
      user.id,
      offer.offeredCar.user_id,
      offer.targetCar.id
    );

    if (conversationId) {
      loadOffers();
      if (onAcceptOffer) {
        onAcceptOffer(conversationId);
      }
    }
  };

  const shouldShowPhone = (profile: UserProfile | undefined, offerStatus: string) => {
    if (!profile?.phone) return false;
    return profile.show_phone_number || offerStatus === 'accepted';
  };

  if (loading) {
    return (
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
        <div className="inline-block relative mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500"></div>
        </div>
        <p className="text-gray-300">Učitavanje ponuda...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <ArrowRightLeft className="relative w-20 h-20 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Nema aktivnih ponuda</h3>
        <p className="text-gray-400">Ponude za zamjenu će se prikazati ovdje</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
          <ArrowRightLeft className="w-6 h-6 text-white" />
        </div>
        Ponude za zamjenu
      </h2>

      <div className="space-y-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`backdrop-blur-md rounded-2xl p-6 transition-all border-2 ${
              offer.status === 'accepted'
                ? 'border-green-500/50 bg-green-500/10'
                : offer.status === 'rejected'
                ? 'border-red-500/50 bg-red-500/10'
                : 'border-white/10 bg-white/5 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <span
                className={`px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md ${
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
              <span className="text-xs text-gray-400 backdrop-blur-md bg-white/5 px-3 py-1 rounded-lg">
                {new Date(offer.created_at).toLocaleDateString('hr-HR')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {offer.offeredCar && (
                <div
                  onClick={() => setSelectedCar(offer.offeredCar!)}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-colors cursor-pointer hover:scale-105 transform duration-200"
                >
                  <p className="text-xs text-cyan-400 mb-3 font-semibold uppercase tracking-wider">Nudi se:</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={offer.offeredCar.image_url}
                      alt={offer.offeredCar.brand}
                      className="w-24 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-white text-sm mb-1">
                        {offer.offeredCar.brand} {offer.offeredCar.model}
                      </p>
                      <p className="text-xs text-cyan-400">{offer.offeredCar.year}</p>
                      <p className="text-xs text-gray-400">{offer.offeredCar.user_email?.split('@')[0]}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                  <ArrowRightLeft className="w-8 h-8 text-white" />
                </div>
              </div>

              {offer.targetCar && (
                <div
                  onClick={() => setSelectedCar(offer.targetCar!)}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-colors cursor-pointer hover:scale-105 transform duration-200"
                >
                  <p className="text-xs text-blue-400 mb-3 font-semibold uppercase tracking-wider">Za:</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={offer.targetCar.image_url}
                      alt={offer.targetCar.brand}
                      className="w-24 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-bold text-white text-sm mb-1">
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
              <div className="mt-6 space-y-3">
                {offer.message && (
                  <div className="backdrop-blur-md bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex gap-3">
                    <MessageSquare className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300 leading-relaxed">{offer.message}</p>
                  </div>
                )}
                {offer.additional_payment && offer.additional_payment > 0 && (
                  <div className="backdrop-blur-md bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-3 items-center">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-400 text-lg font-bold">💰</span>
                    </div>
                    <div>
                      <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1">Doplata</p>
                      <p className="text-lg font-bold text-white">{Number(offer.additional_payment).toLocaleString('de-DE')} KM</p>
                    </div>
                  </div>
                )}

                {(shouldShowPhone(offer.targetOwnerProfile, offer.status) ||
                  shouldShowPhone(offer.offeredOwnerProfile, offer.status)) && (
                  <div className="backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3">Kontakt informacije</p>
                    <div className="space-y-2">
                      {shouldShowPhone(offer.offeredOwnerProfile, offer.status) && offer.offeredOwnerProfile && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-cyan-400" />
                          <span className="text-gray-300">{offer.offeredCar?.user_email?.split('@')[0]}:</span>
                          <a href={`tel:${offer.offeredOwnerProfile.phone}`} className="text-white font-semibold hover:text-cyan-400 transition-colors">
                            {offer.offeredOwnerProfile.phone}
                          </a>
                        </div>
                      )}
                      {shouldShowPhone(offer.targetOwnerProfile, offer.status) && offer.targetOwnerProfile && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">{offer.targetCar?.user_email?.split('@')[0]}:</span>
                          <a href={`tel:${offer.targetOwnerProfile.phone}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                            {offer.targetOwnerProfile.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {offer.status === 'pending' && offer.targetCar && user && offer.targetCar.user_id === user.id && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => updateOfferStatus(offer.id, 'rejected')}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/30"
                >
                  <X className="w-5 h-5" />
                  Odbij
                </button>
                <button
                  onClick={() => handleAcceptOffer(offer)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/30"
                >
                  <Check className="w-5 h-5" />
                  Prihvati
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </div>
  );
}
