import { useState, useEffect } from 'react';
import { X, Zap, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { CREDIT_COSTS, spendCredits, getUserCredits } from '../lib/credits';

interface BoostCarModalProps {
  carId: string;
  carTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface BoostOption {
  duration: number;
  label: string;
  cost: number;
  popular?: boolean;
}

const BOOST_OPTIONS: BoostOption[] = [
  { duration: 3, label: '3 sata', cost: CREDIT_COSTS.FEATURED_3H },
  { duration: 5, label: '5 sati', cost: CREDIT_COSTS.FEATURED_5H, popular: true },
  { duration: 24, label: '24 sata', cost: CREDIT_COSTS.FEATURED_24H },
];

export function BoostCarModal({ carId, carTitle, onClose, onSuccess }: BoostCarModalProps) {
  const [selectedOption, setSelectedOption] = useState<BoostOption>(BOOST_OPTIONS[1]);
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserCredits();
    }
  }, [user]);

  const loadUserCredits = async () => {
    if (!user) return;
    const credits = await getUserCredits(user.id);
    setUserCredits(credits);
  };

  const handleBoost = async () => {
    if (!user) {
      alert('Morate biti prijavljeni');
      return;
    }

    if (userCredits < selectedOption.cost) {
      alert(`Nemate dovoljno kredita. Potrebno: ${selectedOption.cost}, Imate: ${userCredits}`);
      return;
    }

    setLoading(true);

    const result = await spendCredits(user.id, selectedOption.cost);

    if (!result.success) {
      alert(result.error || 'Greška pri trošenju kredita');
      setLoading(false);
      return;
    }

    const featuredUntil = new Date();
    featuredUntil.setHours(featuredUntil.getHours() + selectedOption.duration);

    const { error } = await supabase
      .from('cars')
      .update({
        is_featured: true,
        featured_until: featuredUntil.toISOString(),
        priority_score: 100,
      })
      .eq('id', carId);

    if (error) {
      alert('Greška pri postavljanju istaknutog oglasa');
      setLoading(false);
      return;
    }

    console.log('Car boosted successfully:', { carId, featuredUntil: featuredUntil.toISOString() });

    alert(`Oglas je uspješno istaknut na ${selectedOption.label}!`);
    onSuccess();
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Istakni oglas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-2">Oglas:</p>
            <p className="text-lg font-semibold text-gray-900">{carTitle}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700">Vaši krediti:</p>
              <p className="text-lg font-bold text-blue-600">{userCredits} kredita</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Prednosti istaknutog oglasa:</p>
                  <ul className="space-y-1">
                    <li>• Prikaz na vrhu liste</li>
                    <li>• Veća vidljivost</li>
                    <li>• Više pregleda i kontakta</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Odaberite trajanje:</p>
            <div className="space-y-3">
              {BOOST_OPTIONS.map((option) => (
                <button
                  key={option.duration}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedOption.duration === option.duration
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedOption.duration === option.duration
                            ? 'border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedOption.duration === option.duration && (
                          <div className="w-3 h-3 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{option.label}</p>
                          {option.popular && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              Popularno
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{option.cost} kredita</p>
                      </div>
                    </div>
                    {userCredits < option.cost && (
                      <span className="text-xs text-red-600 font-medium">
                        Nedovoljno kredita
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Odustani
            </button>
            <button
              onClick={handleBoost}
              disabled={loading || userCredits < selectedOption.cost}
              className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {loading ? 'Procesiranje...' : `Istakni (${selectedOption.cost} kredita)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
