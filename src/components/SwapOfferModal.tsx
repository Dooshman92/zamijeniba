import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Car, supabase } from '../lib/supabase';
import { CarCard } from './CarCard';
import { getOrCreateConversation, sendMessage } from '../lib/messaging';
import { useAuth } from '../lib/auth';

interface SwapOfferModalProps {
  targetCar: Car;
  onClose: () => void;
  onSuccess: () => void;
}

export function SwapOfferModal({ targetCar, onClose, onSuccess }: SwapOfferModalProps) {
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [message, setMessage] = useState('');
  const [additionalPayment, setAdditionalPayment] = useState<string>('0');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadMyCars();
  }, []);

  const loadMyCars = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', user.id)
      .neq('id', targetCar.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMyCars(data);
    }
    setLoading(false);
  };

  const handleSubmitOffer = async () => {
    if (!selectedCar || !user || !targetCar.user_id) return;

    if (user.id === targetCar.user_id) {
      alert('Ne možete ponuditi zamjenu za svoj automobil');
      return;
    }

    setSubmitting(true);

    const paymentAmount = parseFloat(additionalPayment) || 0;

    const { data: offerData, error } = await supabase.from('swap_offers').insert([{
      car_id: targetCar.id,
      offered_car_id: selectedCar.id,
      message,
      additional_payment: paymentAmount,
      status: 'pending'
    }]).select().single();

    if (error || !offerData) {
      console.error('Error creating swap offer:', error);
      alert('Greška pri slanju ponude');
      setSubmitting(false);
      return;
    }

    const conversationId = await getOrCreateConversation(user.id, targetCar.user_id, targetCar.id);

    if (conversationId) {
      let messageContent = `Ponuda za zamenu: ${selectedCar.brand} ${selectedCar.model} za ${targetCar.brand} ${targetCar.model}`;

      if (paymentAmount > 0) {
        messageContent += `\n💰 Doplata: ${paymentAmount.toLocaleString('de-DE')} KM`;
      }

      if (message) {
        messageContent += `\n\n${message}`;
      }

      await sendMessage(
        conversationId,
        user.id,
        targetCar.user_id,
        messageContent,
        'swap_offer',
        offerData.id
      );
    }

    onSuccess();
    onClose();
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ponudi zamjenu za</h2>
            <p className="text-gray-600">{targetCar.brand} {targetCar.model}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!selectedCar ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Odaberi svoj automobil za zamjenu:
              </h3>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Učitavanje...</div>
              ) : myCars.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nema dostupnih automobila za zamjenu
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCars.map((car) => (
                    <div key={car.id} onClick={() => setSelectedCar(car)} className="cursor-pointer">
                      <CarCard car={car} onSwapOffer={() => setSelectedCar(car)} showSwapButton={false} />
                      <button
                        onClick={() => setSelectedCar(car)}
                        className="w-full mt-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                      >
                        Odaberi ovaj
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tvoja ponuda:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Nudiš:</p>
                    <CarCard car={selectedCar} onSwapOffer={() => {}} showSwapButton={false} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Za:</p>
                    <CarCard car={targetCar} onSwapOffer={() => {}} showSwapButton={false} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Poruka (opcionalno):
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Dodaj poruku vlasniku..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Doplata (KM):
                </label>
                <input
                  type="number"
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(e.target.value)}
                  min="0"
                  step="100"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ako želite da doplatite za vozilo, unesite iznos. Ostavi 0 ako nema doplate.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCar(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Nazad
                </button>
                <button
                  onClick={handleSubmitOffer}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {submitting ? 'Slanje...' : 'Pošalji ponudu'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
