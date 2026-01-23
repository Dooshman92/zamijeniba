import { useEffect, useState } from 'react';
import { X, Calendar, Gauge, Fuel, Palette, Settings, ArrowRightLeft, Zap, User, Star, Wrench, Sparkles, DoorOpen, Users, ChevronLeft, ChevronRight, MessageCircle, Maximize2, CheckCircle2 } from 'lucide-react';
import { Car, supabase, CarImage } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { PremiumBadge } from './PremiumBadge';

interface CarDetailModalProps {
  car: Car;
  onClose: () => void;
  onSwapOffer: (car: Car) => void;
  onLiveInquiry?: (car: Car) => void;
  onOwnerClick?: (userId: string) => void;
  onSendMessage?: (userId: string) => void;
  onEdit?: (car: Car) => void;
  isPremiumUser?: boolean;
}

export function CarDetailModal({ car, onClose, onSwapOffer, onLiveInquiry, onOwnerClick, onSendMessage, onEdit, isPremiumUser = false }: CarDetailModalProps) {
  const [carImages, setCarImages] = useState<CarImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const { user } = useAuth();

  const isOwnCar = user && car.user_id === user.id;
  const ownerDisplayName = car.owner_nickname
    ? `@${car.owner_nickname}`
    : car.user_email?.split('@')[0];

  useEffect(() => {
    fetchCarImages();
  }, [car.id]);

  const fetchCarImages = async () => {
    setLoading(true);
    setCurrentImageIndex(0);
    const { data } = await supabase
      .from('car_images')
      .select('*')
      .eq('car_id', car.id)
      .order('order_index', { ascending: true });

    if (data && data.length > 0) {
      setCarImages(data);
    } else {
      setCarImages([{
        id: 'default',
        car_id: car.id,
        image_url: car.image_url,
        is_primary: true,
        order_index: 0,
        created_at: car.created_at,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('bs-BA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('bs-BA', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${dateStr} u ${timeStr}`;
  };

  const getEquipmentList = () => {
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 backdrop-blur-md bg-gray-900/90 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Detalji automobila</h2>
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
            {!loading && carImages.length > 0 && carImages[currentImageIndex] && (
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
                  <h3 className="text-4xl font-black text-white mb-2">
                    {car.brand} {car.model}
                  </h3>
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
                  {!isOwnCar && (
                    <div className="mt-3 backdrop-blur-md bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                      <p className="text-xs text-blue-300 flex items-center gap-2">
                        <span className="text-blue-400">ℹ️</span>
                        Kontakt informacije vlasnika vidljive su kada vlasnik oglasa prihvati ponudu za zamjenu
                      </p>
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
                  <span>Objavljeno: {formatDate(car.created_at)}</span>
                </div>
              </div>
            </div>

            {!isOwnCar && (
              <div className="sticky bottom-0 backdrop-blur-md bg-gray-900/90 border-t border-white/10 p-6 -mx-6 -mb-6">
                <div className="space-y-3">
                  {isPremiumUser && onSendMessage && (
                    <button
                      onClick={() => onSendMessage(car.user_id, car.id)}
                      className="group/btn relative w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 overflow-hidden shadow-lg shadow-green-500/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        <MessageCircle className="w-6 h-6 group-hover/btn:scale-110 transition-transform duration-300" />
                        <span className="text-lg">Pošalji poruku</span>
                        <Crown className="w-5 h-5 text-yellow-300" />
                      </div>
                    </button>
                  )}
                  {isPremiumUser && onLiveInquiry && (
                    <button
                      onClick={() => onLiveInquiry(car)}
                      className="group/btn relative w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 overflow-hidden shadow-lg shadow-yellow-500/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-700 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        <Zap className="w-6 h-6 group-hover/btn:scale-110 transition-transform duration-300" />
                        <span className="text-lg">Live Upit</span>
                      </div>
                    </button>
                  )}
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
                </div>
              </div>
            )}
            {isOwnCar && (
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
            )}
          </div>
        </div>
      </div>

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
