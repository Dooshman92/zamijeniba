import { useState, useEffect } from 'react';
import { X, Coins, CreditCard, Gift } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { CREDIT_PACKAGES, addCredits, getUserCredits } from '../lib/credits';
import { PromoCodeModal } from './PromoCodeModal';

interface BuyCreditsModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function BuyCreditsModal({ onClose, onSuccess }: BuyCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [loading, setLoading] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserCredits();
    }
  }, [user]);

  const loadUserCredits = async () => {
    if (!user) return;
    const credits = await getUserCredits(user.id);
    setCurrentCredits(credits);
  };

  const handlePurchase = () => {
    alert(
      `Plaćanje trenutno nije dostupno.\n\nMožete koristiti promo kodove ili nadograditi na Premium za neograničeno korišćenje!`
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Kupi Kredite</h2>
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700">Trenutni krediti:</p>
              <p className="text-2xl font-bold text-blue-600">{currentCredits} kredita</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Šta možete sa kreditima?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Prvi oglas besplatan, ostali 5 kredita</li>
                <li>• Prva swap ponuda besplatna, ostale 1 kredit</li>
                <li>• Istaknuti oglas: 1-5 kredita (3h-24h)</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Odaberite paket:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CREDIT_PACKAGES.map((pkg, index) => (
                <button
                  key={pkg.credits}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPackage.credits === pkg.credits
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${index === 2 ? 'md:col-span-1' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPackage.credits === pkg.credits
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPackage.credits === pkg.credits && (
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                      )}
                    </div>
                    {index === 2 && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Najpopularnije
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {pkg.credits} kredita
                    </p>
                    <p className="text-lg text-gray-600">{pkg.price} KM</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(pkg.price / pkg.credits).toFixed(2)} KM / kredit
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowPromoCode(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
            >
              <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-blue-600">
                <Gift className="w-5 h-5" />
                <span className="font-medium">Imam promo kod</span>
              </div>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Odustani
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Procesiranje...' : `Kupi ${selectedPackage.credits} kredita`}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Plaćanje trenutno nije dostupno. Koristite promo kodove ili nadogradite na Premium.
          </p>
        </div>
      </div>

      {showPromoCode && (
        <PromoCodeModal
          onClose={() => setShowPromoCode(false)}
          onSuccess={() => {
            setShowPromoCode(false);
            loadUserCredits();
            onSuccess?.();
          }}
        />
      )}
    </div>
  );
}
