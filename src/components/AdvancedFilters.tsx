import { useState, useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import {
  vehicleTypes,
  getBrandsByVehicleType,
  getFuelTypesByVehicleType,
  getTransmissionTypesByVehicleType
} from '../data/carOptions';
import { bosnianCities } from '../data/cities';

export interface FilterOptions {
  location: string;
  brand: string;
  minYear: number;
  maxYear: number;
  minPrice: number;
  maxPrice: number;
  fuelType: string;
  transmission: string;
  onlyDamaged: boolean;
  vehicleType?: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export function AdvancedFilters({ filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const currentYear = new Date().getFullYear();

  const availableBrands = useMemo(() => {
    return getBrandsByVehicleType(filters.vehicleType || 'automobil');
  }, [filters.vehicleType]);

  const availableFuelTypes = useMemo(() => {
    return getFuelTypesByVehicleType(filters.vehicleType || 'automobil');
  }, [filters.vehicleType]);

  const availableTransmissionTypes = useMemo(() => {
    return getTransmissionTypesByVehicleType(filters.vehicleType || 'automobil');
  }, [filters.vehicleType]);

  const scrollToResults = () => {
    const resultsElement = document.getElementById('results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasActiveFilters =
    filters.location ||
    filters.brand ||
    filters.minYear > 1990 ||
    filters.maxYear < currentYear ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1000000 ||
    filters.fuelType ||
    filters.transmission ||
    filters.onlyDamaged ||
    filters.vehicleType;

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | boolean) => {
    if (key === 'vehicleType') {
      onFiltersChange({
        ...filters,
        [key]: value,
        brand: '',
        fuelType: '',
        transmission: '',
      });
    } else {
      onFiltersChange({
        ...filters,
        [key]: value,
      });
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    scrollToResults();
  };

  return (
    <>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
          hasActiveFilters
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
            : 'backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20'
        }`}
      >
        <Filter className="w-5 h-5" />
        <span>Filteri</span>
        {hasActiveFilters && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">Aktivni</span>
        )}
      </button>

      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowFilters(false)}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-gray-900 shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Napredni filteri</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tip vozila
                </label>
                <select
                  value={filters.vehicleType || ''}
                  onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Svi tipovi</option>
                  {vehicleTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lokacija
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Sve lokacije</option>
                  {bosnianCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marka
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Sve marke</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Godište od
                  </label>
                  <input
                    type="number"
                    value={filters.minYear || ''}
                    onChange={(e) => handleFilterChange('minYear', parseInt(e.target.value) || 1990)}
                    placeholder="1990"
                    min="1990"
                    max={currentYear}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Godište do
                  </label>
                  <input
                    type="number"
                    value={filters.maxYear === currentYear ? '' : filters.maxYear}
                    onChange={(e) => handleFilterChange('maxYear', parseInt(e.target.value) || currentYear)}
                    placeholder={currentYear.toString()}
                    min="1990"
                    max={currentYear}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cijena od (KM)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="100"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cijena do (KM)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice === 1000000 ? '' : filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 1000000)}
                    placeholder="1000000"
                    min="0"
                    step="100"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gorivo
                </label>
                <select
                  value={filters.fuelType}
                  onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Svi tipovi</option>
                  {availableFuelTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mjenjač
                </label>
                <select
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Svi tipovi</option>
                  {availableTransmissionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 hover:bg-orange-500/20 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.onlyDamaged}
                  onChange={(e) => handleFilterChange('onlyDamaged', e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-orange-400 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-white">Samo oštećena vozila</span>
              </label>
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-6 space-y-3">
              <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
              >
                Primijeni filtere
              </button>

              {hasActiveFilters && (
                <button
                  onClick={() => {
                    onClearFilters();
                    setShowFilters(false);
                  }}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Očisti sve filtere
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
