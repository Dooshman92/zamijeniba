import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Car, supabase } from '../lib/supabase';
import { CarCard } from '../components/CarCard';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { vehicleTypes } from '../data/carOptions';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';

export function VehiclesPage() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'sve');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) {
      setSelectedType(type);
    }
    loadCars();
  }, [searchParams]);

  const loadCars = async () => {
    setLoading(true);
    let query = supabase
      .from('cars')
      .select(`
        *,
        user_profiles!cars_user_id_fkey (
          id,
          nickname,
          avatar_url,
          is_premium,
          phone,
          show_phone_number
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    const type = searchParams.get('type');
    if (type && type !== 'sve') {
      query = query.eq('vehicle_type', type);
    }

    const { data, error } = await query;

    if (!error && data) {
      setCars(data);
    }
    setLoading(false);
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
  };

  const filteredCars = cars.filter(car => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      car.brand.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      (car.location && car.location.toLowerCase().includes(query)) ||
      car.year.toString().includes(query)
    );
  });

  const currentType = vehicleTypes.find(t => t.value === selectedType);
  const Icon = currentType?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            {Icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-cyan-400" />
              </div>
            )}
            <h1 className="text-4xl font-black text-white">
              {currentType?.label || 'Sva vozila'}
            </h1>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => {
                setSelectedType('sve');
                navigate('/vehicles');
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                selectedType === 'sve'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800/80 text-gray-300 hover:bg-slate-700/80'
              }`}
            >
              Sve kategorije
            </button>
            {vehicleTypes.map((type) => {
              const TypeIcon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value);
                    navigate(`/vehicles?type=${type.value}`);
                  }}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all ${
                    selectedType === type.value
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800/80 text-gray-300 hover:bg-slate-700/80'
                  }`}
                >
                  <TypeIcon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži po marki, modelu, lokaciji..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtri
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-8">
            <AdvancedFilters onChange={handleFilterChange} />
          </div>
        )}

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-400">
            Pronađeno <span className="text-cyan-400 font-semibold">{filteredCars.length}</span> oglasa
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Učitavanje...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nema vozila koja odgovaraju kriterijima</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.map((car) => (
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
  );
}
