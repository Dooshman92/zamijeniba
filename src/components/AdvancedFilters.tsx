import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { carBrands, fuelTypes, transmissionTypes } from '../data/carOptions';
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
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

export function AdvancedFilters({ filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const currentYear = new Date().getFullYear();

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
    filters.onlyDamaged;

  const handleFilterChange = (key: keyof FilterOptions, value: string | number) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowFilters(false);
      scrollToResults();
    }
  };

  return (
    <>
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setShowFilters(false)}
        />
      )}

      <div className="relative">
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
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="absolute right-0 top-full mt-2 backdrop-blur-md bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl z-50 w-80 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md p-6 pb-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Napredni filteri</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Očisti sve
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

          <div className="p-6 pt-0 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lokacija
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Sve lokacije</option>
                {bosnianCities.map((city) => (
                  <option key={city} value={city} className="bg-gray-800">
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
                onKeyDown={handleKeyDown}
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Sve marke</option>
                {carBrands.map((brand) => (
                  <option key={brand} value={brand} className="bg-gray-800">
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Godište od
              </label>
              <input
                type="number"
                value={filters.minYear || ''}
                onChange={(e) => handleFilterChange('minYear', parseInt(e.target.value) || 1990)}
                onKeyDown={handleKeyDown}
                placeholder="1990"
                min="1990"
                max={currentYear}
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                onKeyDown={handleKeyDown}
                placeholder={currentYear.toString()}
                min="1990"
                max={currentYear}
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cijena od (KM)
              </label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                onKeyDown={handleKeyDown}
                placeholder="0"
                min="0"
                step="100"
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                onKeyDown={handleKeyDown}
                placeholder="1000000"
                min="0"
                step="100"
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gorivo
              </label>
              <select
                value={filters.fuelType}
                onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Svi tipovi</option>
                {fuelTypes.map((type) => (
                  <option key={type} value={type} className="bg-gray-800">
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
                onKeyDown={handleKeyDown}
                className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Svi tipovi</option>
                {transmissionTypes.map((type) => (
                  <option key={type} value={type} className="bg-gray-800">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 hover:bg-orange-500/20 transition-colors">
                <input
                  type="checkbox"
                  checked={filters.onlyDamaged}
                  onChange={(e) => handleFilterChange('onlyDamaged', e.target.checked)}
                  className="w-5 h-5 text-orange-500 border-orange-400 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-white">Samo oštećena vozila</span>
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-md p-6 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                setShowFilters(false);
                const resultsElement = document.getElementById('results-section');
                if (resultsElement) {
                  resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Primijeni filtere
            </button>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
