import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Car } from '../lib/supabase';

interface SearchWithAutocompleteProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cars: Car[];
}

interface Suggestion {
  type: 'brand' | 'model' | 'location' | 'year';
  value: string;
  count: number;
}

export function SearchWithAutocomplete({ searchQuery, onSearchChange, cars }: SearchWithAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const allSuggestions: Suggestion[] = [];

    const brandCounts = new Map<string, number>();
    const modelCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();
    const yearCounts = new Map<string, number>();

    cars.forEach(car => {
      if (car.brand.toLowerCase().includes(query)) {
        brandCounts.set(car.brand, (brandCounts.get(car.brand) || 0) + 1);
      }

      const fullModel = `${car.brand} ${car.model}`;
      if (fullModel.toLowerCase().includes(query)) {
        modelCounts.set(fullModel, (modelCounts.get(fullModel) || 0) + 1);
      }

      if (car.location && car.location.toLowerCase().includes(query)) {
        locationCounts.set(car.location, (locationCounts.get(car.location) || 0) + 1);
      }

      if (car.year.toString().includes(query)) {
        yearCounts.set(car.year.toString(), (yearCounts.get(car.year.toString()) || 0) + 1);
      }
    });

    brandCounts.forEach((count, brand) => {
      allSuggestions.push({ type: 'brand', value: brand, count });
    });

    modelCounts.forEach((count, model) => {
      allSuggestions.push({ type: 'model', value: model, count });
    });

    locationCounts.forEach((count, location) => {
      allSuggestions.push({ type: 'location', value: location, count });
    });

    yearCounts.forEach((count, year) => {
      allSuggestions.push({ type: 'year', value: year, count });
    });

    allSuggestions.sort((a, b) => b.count - a.count);
    setSuggestions(allSuggestions.slice(0, 8));
  }, [searchQuery, cars]);

  const handleSuggestionClick = (value: string) => {
    onSearchChange(value);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    scrollToResults();
  };

  const scrollToResults = () => {
    const resultsElement = document.getElementById('results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex].value);
      } else if (searchQuery.trim()) {
        setShowSuggestions(false);
        scrollToResults();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'brand': return 'Marka';
      case 'model': return 'Model';
      case 'location': return 'Lokacija';
      case 'year': return 'Godina';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'brand': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'model': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'location': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'year': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={handleKeyDown}
        placeholder="Pretraži automobile (marka, model, godina, cijena...)"
        className="w-full pl-12 pr-4 py-4 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
      />
      {searchQuery && (
        <button
          onClick={() => {
            onSearchChange('');
            setShowSuggestions(false);
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <span className="text-xl">×</span>
        </button>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-md bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionClick(suggestion.value)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left ${
                  selectedIndex === index ? 'bg-cyan-500/20 border border-cyan-500/30' : 'hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded border ${getTypeColor(suggestion.type)}`}>
                    {getTypeLabel(suggestion.type)}
                  </span>
                  <span className="text-white font-medium">{suggestion.value}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {suggestion.count} {suggestion.count === 1 ? 'vozilo' : 'vozila'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
