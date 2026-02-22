import { memo, useState, useEffect } from 'react';
import { Calendar, Gauge, Fuel, Palette, Settings, ArrowRightLeft, Zap, MapPin, Car as CarIcon, Phone } from 'lucide-react';
import { Car, VehicleType, supabase, UserProfile } from '../lib/supabase';
import { UserBadge } from './UserBadge';
import { getUserRatingInfo, UserRatingInfo } from '../lib/userRatings';

interface CarCardProps {
  car: Car;
  onSwapOffer: (car: Car) => void;
  showSwapButton?: boolean;
  isPremiumUser?: boolean;
  currentUserId?: string;
  onOwnerClick?: (userId: string) => void;
  onCardClick?: (car: Car) => void;
  layout?: 'grid' | 'list';
}

const getVehicleTypeLabel = (type: VehicleType): string => {
  const labels: Record<VehicleType, string> = {
    'automobil': 'Automobil',
    'motocikl': 'Motocikl',
    'quad': 'Quad/ATV',
    'motorne_sanke': 'Motorne sanke',
    'jetski': 'Jet Ski'
  };
  return labels[type] || 'Vozilo';
};

const formatSwapPreference = (car: Car): string | null => {
  if (!car.swap_preference || !car.swap_preference.preferred_vehicle_type) {
    return null;
  }

  const pref = car.swap_preference;

  if (pref.preferred_vehicle_type === 'Razno') {
    return 'Razno';
  }

  const vehicleType = getVehicleTypeLabel(pref.preferred_vehicle_type as VehicleType);

  if (pref.preferred_brand === 'Razno' || !pref.preferred_brand) {
    return vehicleType;
  }

  if (pref.preferred_model === 'Razno' || !pref.preferred_model) {
    return `${vehicleType} ${pref.preferred_brand}`;
  }

  return `${vehicleType} ${pref.preferred_brand} ${pref.preferred_model}`;
};

const CarCardComponent = ({ car, onSwapOffer, showSwapButton = true, isPremiumUser = false, currentUserId, onOwnerClick, onCardClick, layout = 'grid' }: CarCardProps) => {
  const isOwnCar = currentUserId && car.user_id === currentUserId;
  const ownerDisplayName = car.owner_nickname
    ? car.owner_nickname
    : car.user_email?.split('@')[0];

  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [ownerRating, setOwnerRating] = useState<UserRatingInfo>({ averageRating: null, reviewCount: 0 });

  useEffect(() => {
    if (car.user_id) {
      loadOwnerProfile();
      loadOwnerRating();
      if (currentUserId && currentUserId !== car.user_id) {
        checkPhoneRevealed();
      }
    }
  }, [car.user_id, currentUserId]);

  const loadOwnerProfile = async () => {
    if (!car.user_id) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', car.user_id)
      .maybeSingle();

    if (data) {
      setOwnerProfile(data);
    }
  };

  const loadOwnerRating = async () => {
    if (!car.user_id) return;
    const ratingInfo = await getUserRatingInfo(car.user_id);
    console.log('CarCard: loadOwnerRating for user', car.user_id, ':', ratingInfo);
    setOwnerRating(ratingInfo);
  };

  const checkPhoneRevealed = async () => {
    if (!currentUserId || !car.user_id || currentUserId === car.user_id) return;

    const { data: userCars } = await supabase
      .from('cars')
      .select('id')
      .eq('user_id', currentUserId);

    if (!userCars?.length) {
      setPhoneRevealed(false);
      return;
    }

    const userCarIds = userCars.map(c => c.id);

    const { data: acceptedOffers } = await supabase
      .from('swap_offers')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(car_id.eq.${car.id},offered_car_id.in.(${userCarIds.join(',')})),and(offered_car_id.eq.${car.id},car_id.in.(${userCarIds.join(',')}))`);

    setPhoneRevealed(!!acceptedOffers && acceptedOffers.length > 0);
  };

  if (layout === 'list') {
    return (
      <div
        onClick={() => onCardClick && onCardClick(car)}
        className={`group backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:shadow-cyan-500/20 ${
          onCardClick ? 'cursor-pointer' : ''
        }`}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-80 h-56 md:h-auto overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10"></div>
            <img
              src={car.image_url}
              alt={`${car.brand} ${car.model}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-3xl font-black text-white">
                    {car.brand} {car.model}
                  </h3>
                  {car.vehicle_type && car.vehicle_type !== 'automobil' && (
                    <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold rounded-lg">
                      {getVehicleTypeLabel(car.vehicle_type)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOwnerClick && car.user_id) {
                        onOwnerClick(car.user_id);
                      }
                    }}
                    className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors font-medium cursor-pointer"
                  >
                    {ownerDisplayName}
                  </button>
                  <UserBadge
                    averageRating={ownerRating.averageRating}
                    reviewCount={ownerRating.reviewCount}
                    size="md"
                  />
                </div>
                {!isOwnCar && ownerProfile?.phone && (ownerProfile?.show_phone_number || phoneRevealed) && (
                  <div className="flex items-center gap-2 backdrop-blur-md bg-green-500/10 border border-green-500/30 rounded-lg px-2 py-1 mb-2">
                    <Phone className="w-3 h-3 text-green-400" />
                    <a
                      href={`tel:${ownerProfile.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-green-400 hover:text-green-300 font-semibold transition-colors"
                    >
                      {ownerProfile.phone}
                    </a>
                  </div>
                )}
              </div>
              <div className="backdrop-blur-md bg-green-500/90 px-4 py-2 rounded-xl shadow-lg">
                <p className="text-2xl font-black text-white">
                  {car.price.toLocaleString()} KM
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Godište</p>
                    <p className="text-sm font-bold text-white">{car.year}</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Kilometraža</p>
                    <p className="text-sm font-bold text-white">{car.mileage.toLocaleString()} km</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Gorivo</p>
                    <p className="text-sm font-bold text-white">{car.fuel_type}</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Mjenjač</p>
                    <p className="text-sm font-bold text-white">{car.transmission}</p>
                  </div>
                </div>
              </div>
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Boja</p>
                    <p className="text-sm font-bold text-white">{car.color}</p>
                  </div>
                </div>
              </div>
              {car.location && (
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Lokacija</p>
                      <p className="text-sm font-bold text-white">{car.location}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {formatSwapPreference(car) && (
              <div className="backdrop-blur-md bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-orange-300/80">Preferiram zamjenu za</p>
                    <p className="text-sm font-bold text-orange-300">{formatSwapPreference(car)}</p>
                  </div>
                </div>
              </div>
            )}

            {!isOwnCar && (
              <div className="flex gap-3">
                {showSwapButton && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwapOffer(car);
                    }}
                    className="group/btn relative flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <ArrowRightLeft className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                      <span className="text-base">Ponudi zamjenu</span>
                    </div>
                  </button>
                )}
              </div>
            )}
            {isOwnCar && (
              <div className="backdrop-blur-md bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 text-center">
                <p className="text-cyan-400 text-sm font-semibold">Vaš oglas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onCardClick && onCardClick(car)}
      className={`group backdrop-blur-md rounded-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:shadow-cyan-500/20 ${
        onCardClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10"></div>
        <img
          src={car.image_url}
          alt={`${car.brand} ${car.model}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-2 right-2 backdrop-blur-md bg-cyan-500/90 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow z-20">
          {car.year}
        </div>
        <div className="absolute bottom-2 left-2 right-2 z-20">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-black text-white drop-shadow-lg">
              {car.brand} {car.model}
            </h3>
            {car.vehicle_type && car.vehicle_type !== 'automobil' && (
              <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold rounded">
                {getVehicleTypeLabel(car.vehicle_type)}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <div className="backdrop-blur-md bg-green-500/90 px-2 py-0.5 rounded shadow">
              <p className="text-sm font-black text-white">
                {car.price.toLocaleString()} KM
              </p>
            </div>
            {car.location && (
              <div className="backdrop-blur-md bg-white/20 px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-white" />
                <span className="text-[10px] font-bold text-white">{car.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-2.5">
        <div className="flex items-center gap-1 mb-2 text-[10px]">
          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-gray-400 truncate">
            {ownerDisplayName}
          </span>
        </div>

        {!isOwnCar && ownerProfile?.phone && (ownerProfile?.show_phone_number || phoneRevealed) && (
          <div className="flex items-center gap-1 backdrop-blur-md bg-green-500/10 border border-green-500/30 rounded px-1.5 py-1 mb-2">
            <Phone className="w-2.5 h-2.5 text-green-400 flex-shrink-0" />
            <a
              href={`tel:${ownerProfile.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] text-green-400 hover:text-green-300 font-semibold transition-colors truncate"
            >
              {ownerProfile.phone}
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded p-1.5 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-1">
              <Gauge className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
              <p className="text-[9px] font-bold text-white truncate">{car.mileage.toLocaleString()}km</p>
            </div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded p-1.5 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-1">
              <Fuel className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />
              <p className="text-[9px] font-bold text-white truncate">{car.fuel_type}</p>
            </div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded p-1.5 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-1">
              <Settings className="w-2.5 h-2.5 text-violet-400 flex-shrink-0" />
              <p className="text-[9px] font-bold text-white truncate">{car.transmission}</p>
            </div>
          </div>
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded p-1.5 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-1">
              <Palette className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
              <p className="text-[9px] font-bold text-white truncate">{car.color}</p>
            </div>
          </div>
        </div>

        {formatSwapPreference(car) && (
          <div className="backdrop-blur-md bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded p-1.5 mb-1.5">
            <div className="flex items-center gap-1">
              <ArrowRightLeft className="w-2.5 h-2.5 text-orange-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[8px] text-orange-300/80">Preferiram zamjenu za</p>
                <p className="text-[9px] font-bold text-orange-300 truncate">{formatSwapPreference(car)}</p>
              </div>
            </div>
          </div>
        )}

        {!isOwnCar && (
          <div className="space-y-1.5">
            {showSwapButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSwapOffer(car);
                }}
                className="group/btn relative w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-1.5 px-2 rounded transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 group-hover/btn:rotate-180 transition-transform duration-500" />
                  <span className="text-[11px]">Zamjena</span>
                </div>
              </button>
            )}
          </div>
        )}
        {isOwnCar && (
          <div className="backdrop-blur-md bg-cyan-500/10 border border-cyan-500/30 rounded p-2 text-center">
            <p className="text-cyan-400 text-[10px] font-semibold">Vaš oglas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const CarCard = memo(CarCardComponent);
