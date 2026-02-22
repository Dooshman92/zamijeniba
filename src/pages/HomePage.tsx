import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, supabase } from '../lib/supabase';
import { CarCard } from '../components/CarCard';
import { vehicleTypes } from '../data/carOptions';
import { Sparkles } from 'lucide-react';

export function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFeaturedCars();
  }, []);

  const loadFeaturedCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12);

    if (!error && data) {
      setCars(data);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-white mb-6 tracking-tight">
            Razmijeni svoje vozilo
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Pronađi savršenu zamjenu za tvoj automobil, motocikl, quad ili drugo vozilo
          </p>
        </div>

        {/* Vehicle Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Kategorije vozila</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {vehicleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => navigate(`/vehicles?type=${type.value}`)}
                  className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all">
                      <Icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <span className="text-white font-semibold text-center">{type.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Cars */}
        <div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h2 className="text-3xl font-bold text-white">Najnoviji oglasi</h2>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Učitavanje...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Nema dostupnih oglasa</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onClick={() => navigate(`/vehicle/${car.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
