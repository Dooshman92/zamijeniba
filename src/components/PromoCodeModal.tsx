import { useState } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface PromoCodeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PromoCodeModal({ onClose, onSuccess }: PromoCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { user } = useAuth();

  const handleRedeem = async () => {
    if (!user || !code.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const upperCode = code.trim().toUpperCase();

      const { data: existingRedemption } = await supabase
        .from('promo_code_redemptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('code', upperCode)
        .maybeSingle();

      if (existingRedemption) {
        setMessage({ type: 'error', text: 'Već ste iskoristili ovaj kod!' });
        setLoading(false);
        return;
      }

      const { data: promoCode } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', upperCode)
        .eq('is_active', true)
        .maybeSingle();

      if (!promoCode) {
        setMessage({ type: 'error', text: 'Nevažeći promo kod!' });
        setLoading(false);
        return;
      }

      const { data: anyoneUsedIt } = await supabase
        .from('promo_code_redemptions')
        .select('*')
        .eq('code', upperCode)
        .maybeSingle();

      if (anyoneUsedIt) {
        setMessage({ type: 'error', text: 'Ovaj kod je već iskorišten!' });
        setLoading(false);
        return;
      }

      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      const newCredits = (currentProfile?.credits || 0) + promoCode.credits_reward;

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ credits: newCredits })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await supabase
        .from('promo_code_redemptions')
        .insert({
          user_id: user.id,
          code: upperCode,
          credits_received: promoCode.credits_reward
        });

      setMessage({
        type: 'success',
        text: `Čestitamo! Dobili ste ${promoCode.credits_reward} kredita!`
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error redeeming promo code:', error);
      setMessage({ type: 'error', text: 'Došlo je do greške. Pokušajte ponovo.' });
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-2 rounded-lg">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Promo Kod</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold mb-1">Upisi kredit code</p>
                <p className="text-gray-400 text-xs">
                  Unesite kod i dobijte kredite za razne pogodnosti!
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Promo Kod
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="UNESITE KOD"
              className="w-full px-4 py-3 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent uppercase tracking-wider font-bold"
              disabled={loading}
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <p className="text-sm font-semibold">{message.text}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 backdrop-blur-md bg-white/5 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              disabled={loading}
            >
              Odustani
            </button>
            <button
              onClick={handleRedeem}
              disabled={loading || !code.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Provjera...' : 'Iskoristi'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
