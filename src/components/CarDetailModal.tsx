import { useEffect, useState } from 'react';
import { X, Calendar, Gauge, Fuel, Palette, Settings, ArrowRightLeft, User, Star, Wrench, Sparkles, DoorOpen, Users, ChevronLeft, ChevronRight, MessageCircle, Maximize2, CheckCircle2, Crown, Clock, Zap, AlertTriangle, Phone } from 'lucide-react';
import { Car, supabase, CarImage, UserProfile } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatDateTime } from '../lib/dateUtils';
import { PremiumBadge } from './PremiumBadge';

interface CarDetailModalProps {
  car?: Car;
  carId?: string;
  onClose: () => void;
  onSwapOffer?: (car: Car) => void;
  onOwnerClick?: (userId: string) => void;
  onSendMessage?: (userId: string) => void;
  onEdit?: (car: Car) => void;
  isPremiumUser?: boolean;
}

export function CarDetailModal({ car: initialCar, carId, onClose, onSwapOffer, onOwnerClick, onSendMessage, onEdit, isPremiumUser = false }: CarDetailModalProps) {
  const [car, setCar] = useState<Car | null>(initialCar || null);
  const [carImages, setCarImages] = useState<CarImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (carId && !initialCar) {
      loadCarById(carId);
    } else if (initialCar) {
      setCar(initialCar);
      fetchCarImages(initialCar.id, initialCar);
    }
  }, [carId, initialCar]);

  useEffect(() => {
    if (user && car && car.user_id === user.id) {
      loadUserProfile();
    }
    if (car && car.user_id) {
      loadOwnerProfile();
      if (user && user.id !== car.user_id) {
        checkPhoneRevealed();
      }
    }
  }, [user, car]);

  const loadOwnerProfile = async () => {
    if (!car || !car.user_id) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', car.user_id)
      .maybeSingle();

    if (data) {
      setOwnerProfile(data);
    }
  };

  const checkPhoneRevealed = async () => {
    if (!user || !car || !car.user_id || user.id === car.user_id) return;

    const { data: userCars } = await supabase
      .from('cars')
      .select('id')
      .eq('user_id', user.id);

    const { data: ownerCars } = await supabase
      .from('cars')
      .select('id')
      .eq('user_id', car.user_id);

    if (!userCars?.length || !ownerCars?.length) {
      setPhoneRevealed(false);
      return;
    }

    const userCarIds = userCars.map(c => c.id);
    const ownerCarIds = ownerCars.map(c => c.id);

    const { data: acceptedOffers } = await supabase
      .from('swap_offers')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(car_id.in.(${ownerCarIds.join(',')}),offered_car_id.in.(${userCarIds.join(',')})),and(car_id.in.(${userCarIds.join(',')}),offered_car_id.in.(${ownerCarIds.join(',')}))`);

    setPhoneRevealed(!!acceptedOffers && acceptedOffers.length > 0);
  };

  const loadUserProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
    }
  };

  const loadCarById = async (id: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('cars')
      .select(`
        *,
        owner_nickname:profiles!cars_user_id_fkey(nickname)
      `)
      .eq('id', id)
      .maybeSingle();

    if (data) {
      const { data: preference } = await supabase
        .from('car_preferences')
        .select('*')
        .eq('car_id', id)
        .maybeSingle();

      const carData: Car = {
        ...data,
        owner_nickname: data.owner_nickname?.nickname || null,
        swap_preference: preference || undefined
      };
      setCar(carData);
      fetchCarImages(id);
    } else {
      setLoading(false);
    }
  };

  const isOwnCar = user && car && car.user_id === user.id;
  const ownerDisplayName = car?.owner_nickname
    ? `@${car.owner_nickname}`
    : car?.user_email?.split('@')[0];

  const fetchCarImages = async (carIdToFetch: string, carData?: Car) => {
    setLoading(true);
    setCurrentImageIndex(0);
    const { data } = await supabase
      .from('car_images')
      .select('*')
      .eq('car_id', carIdToFetch)
      .order('order_index', { ascending: true });

    const currentCar = carData || car;
    if (data && data.length > 0) {
      setCarImages(data);
    } else if (currentCar) {
      setCarImages([{
        id: 'default',
        car_id: carIdToFetch,
        image_url: currentCar.image_url,
        is_primary: true,
        order_index: 0,
        created_at: currentCar.created_at,
      }]);
    }
    setLoading(false);
  };

  const nextImage = () => {
    if (carImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % carImages.length);
  };

  const prevImage = () => {
    if (carImages.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + carImages.length) % carImages.length);
  };


  const getRemainingPremiumTime = () => {
    if (!userProfile?.is_premium || !userProfile?.premium_expires_at) {
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(userProfile.premium_expires_at);
    const diffMs = expiresAt.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { expired: true, text: 'Premium je istekao' };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return {
        expired: false,
        text: `${diffDays} ${diffDays === 1 ? 'dan' : diffDays < 5 ? 'dana' : 'dana'}`,
        detailed: `${diffDays}d ${diffHours}h`
      };
    } else if (diffHours > 0) {
      return {
        expired: false,
        text: `${diffHours} ${diffHours === 1 ? 'sat' : diffHours < 5 ? 'sata' : 'sati'}`,
        detailed: `${diffHours}h ${diffMinutes}m`
      };
    } else {
      return {
        expired: false,
        text: `${diffMinutes} ${diffMinutes === 1 ? 'minuta' : diffMinutes < 5 ? 'minute' : 'minuta'}`,
        detailed: `${diffMinutes}m`
      };
    }
  };

  const getRemainingFeaturedTime = () => {
    if (!car?.is_featured || !car?.featured_until) return null;

    const now = new Date();
    const featuredUntil = new Date(car.featured_until);
    const diffMs = featuredUntil.getTime() - now.getTime();

    if (diffMs <= 0) return null;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const handleReportCar = async () => {
    if (!user) {
      alert('Morate biti prijavljeni da biste prijavili oglas');
      return;
    }

    if (!reportReason.trim()) {
      alert('Molimo unesite razlog prijave');
      return;
    }

    setSubmittingReport(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          car_id: car!.id,
          reported_by: user.id,
          reported_user_id: car!.user_id,
          reason: reportReason,
          description: reportDescription,
          status: 'pending'
        });

      if (error) throw error;

      setReportSuccess(true);
      setReportReason('');
      setReportDescription('');

      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
      }, 2500);
    } catch (error) {
      console.error('Error reporting car:', error);
      alert('Greška pri slanju prijave. Pokušajte ponovo.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const getEquipmentList = () => {
    if (!car) return [];
    const equipment: { label: string; value: boolean }[] = [];

    if (car.xenon_lights) equipment.push({ label: 'Xenon/LED farovi', value: true });
    if (car.heated_seats) equipment.push({ label: 'Grijači sjedišta', value: true });
    if (car.leather_seats) equipment.push({ label: 'Kožna sjedišta', value: true });
    if (car.sunroof) equipment.push({ label: 'Panorama krov', value: true });
    if (car.parking_sensors) equipment.push({ label: 'Park senzori', value: true });
    if (car.parking_camera) equipment.push({ label: 'Kamera', value: true });
    if (car.navigation) equipment.push({ label: 'Navigacija', value: true });
    if (car.bluetooth) equipment.push({ label: 'Bluetooth', value: true });
    if (car.cruise_control) equipment.push({ label: 'Tempomat', value: true });
    if (car.climate_control) equipment.push({ label: 'Klima automatik', value: true });
    if (car.alloy_wheels) equipment.push({ label: 'Alu felge', value: true });
    if (car.fog_lights) equipment.push({ label: 'Maglenke', value: true });
    if (car.roof_rack) equipment.push({ label: 'Krovni nosač', value: true });
    if (car.tow_hitch) equipment.push({ label: 'Kuka za vuču', value: true });
    if (car.sport_package) equipment.push({ label: 'Sport paket', value: true });
    if (car.winter_tires) equipment.push({ label: 'Zimske gume', value: true });
    if (car.summer_tires) equipment.push({ label: 'Ljetne gume', value: true });
    if (car.spare_tire) equipment.push({ label: 'Rezervna guma', value: true });

    return equipment;
  };

  if (loading || !car) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-3xl p-8 border border-white/10 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg">Učitavanje...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/90 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Detalji vozila</h2>
              {car.owner_is_premium && <PremiumBadge size="sm" />}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] custom-scrollbar">
          <div className="relative h-96 overflow-hidden bg-black group/image">
            {carImages.length > 0 && carImages[currentImageIndex] && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10"></div>
                <img
                  src={carImages[currentImageIndex].image_url}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setFullscreenImage(true)}
                />
                <button
                  onClick={() => setFullscreenImage(true)}
                  className="absolute top-4 right-4 z-20 backdrop-blur-md bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover/image:opacity-100"
                  title="Prikaz punog ekrana"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                {carImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 backdrop-blur-md bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {carImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? 'bg-cyan-400 w-8'
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-4xl font-black text-white">
                      {car.brand} {car.model}
                    </h3>
                    {isOwnCar && car.is_featured && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-500 font-bold text-sm">Istaknut</span>
                      </div>
                    )}
                  </div>
                  {isOwnCar && car.is_featured && getRemainingFeaturedTime() && (
                    <div className="mb-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg inline-flex items-center gap-2">
                      <Clock className="w-3 h-3 text-yellow-400" />
                      <span className="text-yellow-300 font-semibold text-xs">
                        Preostalo: {getRemainingFeaturedTime()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <span className="text-gray-400">Vlasnik: </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOwnerClick && car.user_id) {
                          onOwnerClick(car.user_id);
                        }
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors hover:underline"
                    >
                      {ownerDisplayName}
                    </button>
                  </div>
                  {!isOwnCar && ownerProfile?.phone && (ownerProfile?.show_phone_number || phoneRevealed) && (
                    <div className="mt-3 backdrop-blur-md bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400">Telefon:</span>
                        <a
                          href={`tel:${ownerProfile.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-green-400 hover:text-green-300 font-semibold transition-colors hover:underline"
                        >
                          {ownerProfile.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {!isOwnCar && (!ownerProfile?.phone || (!ownerProfile?.show_phone_number && !phoneRevealed)) && (
                    <div className="mt-3 backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                      <p className="text-xs text-blue-300 flex items-center gap-2">
                        <span className="text-blue-400">ℹ️</span>
                        Kontakt informacije vlasnika vidljive su kada vlasnik oglasa prihvati ponudu za zamjenu
                      </p>
                    </div>
                  )}
                  {isOwnCar && userProfile?.phone && userProfile?.show_phone_number && (
                    <div className="mt-3 backdrop-blur-md bg-gray-500/10 border border-gray-500/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400">Vaš telefon:</span>
                        <span className="text-sm text-gray-300 font-semibold">{userProfile.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="backdrop-blur-md bg-green-500/90 px-6 py-3 rounded-xl shadow-lg">
                    <p className="text-3xl font-black text-white">
                      {car.price?.toLocaleString() || '0'} KM
                    </p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  Osnovne informacije
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-gray-400">Godište</p>
                        <p className="text-lg font-bold text-white">{car.year}</p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-xs text-gray-400">Kilometraža</p>
                        <p className="text-lg font-bold text-white">{car.mileage?.toLocaleString() || '0'} km</p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Fuel className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Gorivo</p>
                        <p className="text-lg font-bold text-white">{car.fuel_type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-xs text-gray-400">Mjenjač</p>
                        <p className="text-lg font-bold text-white">{car.transmission}</p>
                      </div>
                    </div>
                  </div>
                  {car.drive_type && (
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-xs text-gray-400">Pogon</p>
                          <p className="text-lg font-bold text-white">{car.drive_type}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-xs text-gray-400">Boja</p>
                        <p className="text-lg font-bold text-white">{car.color}</p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-xs text-gray-400">Snaga</p>
                        <p className="text-lg font-bold text-white">{car.horse_power} KS</p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-xs text-gray-400">Motor</p>
                        <p className="text-lg font-bold text-white">{car.engine_size}</p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <DoorOpen className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-xs text-gray-400">Vrata</p>
                        <p className="text-lg font-bold text-white">{car.doors}</p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-gray-400">Sjedišta</p>
                        <p className="text-lg font-bold text-white">{car.seats}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Stanje vozila
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Karoserija</span>
                      <span className="text-sm font-bold text-white">{car.body_condition}/10</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${car.body_condition * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Mehanika</span>
                      <span className="text-sm font-bold text-white">{car.mechanical_condition}/10</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${car.mechanical_condition * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Enterier</span>
                      <span className="text-sm font-bold text-white">{car.interior_condition}/10</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${car.interior_condition * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {getEquipmentList().length > 0 && (
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-400" />
                    Oprema
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getEquipmentList().map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-300 backdrop-blur-md bg-white/5 rounded-lg px-3 py-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Opis
                </h4>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {car.description}
                </p>
              </div>

              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-center text-sm text-gray-400">
                  <span>Objavljeno: {formatDateTime(car.created_at)}</span>
                </div>
              </div>
            </div>

            {car.swap_preference && car.swap_preference.preferred_vehicle_type && (
              <div className="backdrop-blur-md bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-2xl p-6 mb-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-orange-400" />
                  Preferencije za zamjenu
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Preferiram zamjenu za</p>
                      <p className="text-lg font-bold text-orange-300">
                        {(() => {
                          const pref = car.swap_preference;

                          if (pref.preferred_vehicle_type === 'Razno') {
                            return 'Razno';
                          }

                          const vehicleLabels = {
                            'automobil': 'Automobil',
                            'motocikl': 'Motocikl',
                            'quad': 'Quad/ATV',
                            'motorne_sanke': 'Motorne sanke',
                            'jetski': 'Jet Ski'
                          };
                          const vehicleType = vehicleLabels[pref.preferred_vehicle_type as keyof typeof vehicleLabels] || pref.preferred_vehicle_type;

                          if (pref.preferred_brand === 'Razno' || !pref.preferred_brand) {
                            return vehicleType;
                          }

                          if (pref.preferred_model === 'Razno' || !pref.preferred_model) {
                            return `${vehicleType} ${pref.preferred_brand}`;
                          }

                          return `${vehicleType} ${pref.preferred_brand} ${pref.preferred_model}`;
                        })()}
                      </p>
                    </div>
                  </div>

                  {car.swap_preference.preferred_vehicle_type !== 'Razno' && (car.swap_preference.min_year || car.swap_preference.max_year) && (
                    <div className="grid grid-cols-2 gap-3">
                      {car.swap_preference.min_year && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Min. godina</p>
                          <p className="text-sm font-bold text-white">{car.swap_preference.min_year}</p>
                        </div>
                      )}
                      {car.swap_preference.max_year && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Max. godina</p>
                          <p className="text-sm font-bold text-white">{car.swap_preference.max_year}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {car.swap_preference.preferred_vehicle_type !== 'Razno' && car.swap_preference.max_mileage > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Max. kilometraža</p>
                      <p className="text-sm font-bold text-white">{car.swap_preference.max_mileage.toLocaleString()} km</p>
                    </div>
                  )}

                  {car.swap_preference.preferred_vehicle_type !== 'Razno' && car.swap_preference.price_difference > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Spreman/a doplatiti</p>
                      <p className="text-sm font-bold text-green-400">{car.swap_preference.price_difference.toLocaleString()} KM</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isOwnCar && (
              <div className="sticky bottom-0 backdrop-blur-md bg-gray-900/90 border-t border-white/10 p-6 -mx-6 -mb-6">
                <div className="space-y-3">
                  {onSwapOffer && (
                    <button
                      onClick={() => onSwapOffer(car)}
                      className="group/btn relative w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 group-hover/btn:rotate-180 transition-transform duration-500" />
                        <span className="text-lg">Ponudi zamjenu</span>
                      </div>
                    </button>
                  )}
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-orange-400 rounded-xl transition-all border border-white/10 hover:border-orange-500/30"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">Prijavi oglas</span>
                  </button>
                </div>
              </div>
            )}
            {isOwnCar && (
              <div className="space-y-4">
                {userProfile?.is_premium && getRemainingPremiumTime() && !getRemainingPremiumTime()?.expired && (
                  <div className="backdrop-blur-md rounded-xl p-6 border-2 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-amber-600">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-yellow-500">
                            Premium Oglas
                          </h4>
                          <p className="text-sm text-gray-400">
                            Vaš oglas je istaknut
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="backdrop-blur-md bg-white/5 rounded-lg p-4 border border-yellow-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <p className="text-gray-300 font-semibold">Preostalo vrijeme:</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">
                          {getRemainingPremiumTime()?.text}
                        </span>
                      </div>
                      {userProfile?.premium_expires_at && (
                        <p className="text-xs text-gray-500 mt-3">
                          Ističe: {formatDateTime(userProfile.premium_expires_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="backdrop-blur-md bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
                  <p className="text-cyan-400 text-lg font-semibold text-center mb-4">Ovo je vaš oglas</p>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(car)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Uredi oglas
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Prijavi oglas</h3>
                </div>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                    setReportDescription('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {reportSuccess ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Prijava poslata!</h3>
                <p className="text-gray-400">
                  Moderatori će pregledati oglas i preduzeti odgovarajuće mere.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Razlog prijave *
                  </label>
                  <div className="space-y-2">
                    {[
                      'Lažan oglas',
                      'Neprikladne fotografije',
                      'Prevara',
                      'Duplikat oglasa',
                      'Netačni podaci',
                      'Ostalo'
                    ].map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                          reportReason === reason
                            ? 'bg-orange-500/20 border-orange-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={reason}
                          checked={reportReason === reason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="w-4 h-4 text-orange-500 bg-white/10 border-white/20 focus:ring-orange-500"
                        />
                        <span className="text-white">{reason}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dodatni opis (opciono)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Opišite problem detaljnije..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason('');
                      setReportDescription('');
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all border border-white/10"
                  >
                    Otkaži
                  </button>
                  <button
                    onClick={handleReportCar}
                    disabled={submittingReport || !reportReason}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReport ? 'Slanje...' : 'Pošalji prijavu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {fullscreenImage && carImages.length > 0 && carImages[currentImageIndex] && (
        <div
          className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
          onClick={() => setFullscreenImage(false)}
        >
          <button
            onClick={() => setFullscreenImage(false)}
            className="absolute top-4 right-4 z-10 backdrop-blur-md bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={carImages[currentImageIndex].image_url}
            alt={`${car.brand} ${car.model}`}
            className="max-w-full max-h-full object-contain p-4"
            onClick={(e) => e.stopPropagation()}
          />
          {carImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 backdrop-blur-md bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 backdrop-blur-md bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {carImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-cyan-400 w-10'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

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
