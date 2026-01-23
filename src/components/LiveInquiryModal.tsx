import { X, Zap, Phone, MessageSquare, Send, Crown } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Car } from '../lib/supabase';

interface LiveInquiryModalProps {
  car: Car;
  onClose: () => void;
  onSuccess: () => void;
}

export function LiveInquiryModal({ car, onClose, onSuccess }: LiveInquiryModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !car.user_id) return;

    if (user.id === car.user_id) {
      alert('Ne možete poslati upit za svoj automobil');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('live_inquiries')
        .insert({
          sender_id: user.id,
          receiver_id: car.user_id,
          car_id: car.id,
          message,
          contact_phone: phone,
          status: 'pending',
          priority: 'high',
        });

      if (error) throw error;

      alert('Live upit je uspješno poslan! Vlasnik će biti odmah obaviješten.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error sending inquiry:', error);
      alert('Došlo je do greške. Molimo pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl max-w-2xl w-full border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 p-6 rounded-t-3xl border-b-2 border-yellow-400/30 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6" />
                Live Upit
              </h2>
              <p className="text-sm text-white/80">Prioritetni kontakt sa vlasnikom</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="backdrop-blur-md bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <img
                src={car.image_url}
                alt={`${car.brand} ${car.model}`}
                className="w-24 h-24 object-cover rounded-xl"
              />
              <div>
                <h3 className="text-xl font-bold text-white">
                  {car.brand} {car.model}
                </h3>
                <p className="text-cyan-400">{car.year}</p>
                <p className="text-sm text-gray-400">
                  Vlasnik: {car.owner_nickname ? `@${car.owner_nickname}` : car.user_email?.split('@')[0]}
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-bold mb-2">Premium Prednost</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Vlasnik će biti odmah obaviješten</li>
                  <li>• Prioritetni tretman vašeg upita</li>
                  <li>• Brži odgovor od vlasnika</li>
                  <li>• Direktan kontakt telefon</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <Phone className="w-5 h-5 text-yellow-500" />
                Vaš Broj Telefona
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="npr. +387 61 123 456"
                required
                className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">
                Vlasnik će vas moći odmah kontaktirati
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-white font-semibold mb-2">
                <MessageSquare className="w-5 h-5 text-yellow-500" />
                Vaša Poruka
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Pozdrav! Interesuje me vaš automobil. Mogu li dobiti dodatne informacije?"
                required
                rows={5}
                className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Budite jasni i detaljni u svom upitu
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Slanje...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Pošalji Live Upit
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500">
            Kao premium korisnik, vaš upit ima prioritet i biće odmah dostavljen vlasniku.
          </p>
        </form>
      </div>
    </div>
  );
}
