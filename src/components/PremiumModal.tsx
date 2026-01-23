import { X, Crown, Check, Star, Zap, Shield } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface PremiumModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type PlanDuration = '3days' | '5days' | '10days' | '15days' | '30days';

interface Plan {
  id: PlanDuration;
  name: string;
  duration: string;
  days: number;
  price: number;
  discount?: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: '3days',
    name: '3 Dana',
    duration: '3 dana',
    days: 3,
    price: 2.99,
  },
  {
    id: '5days',
    name: '5 Dana',
    duration: '5 dana',
    days: 5,
    price: 4.99,
  },
  {
    id: '10days',
    name: '10 Dana',
    duration: '10 dana',
    days: 10,
    price: 8.99,
    discount: '-10%',
    popular: true,
  },
  {
    id: '15days',
    name: '15 Dana',
    duration: '15 dana',
    days: 15,
    price: 12.99,
    discount: '-14%',
  },
  {
    id: '30days',
    name: '30 Dana',
    duration: '30 dana',
    days: 30,
    price: 19.99,
    discount: '-33%',
  },
];

const premiumFeatures = [
  {
    icon: Star,
    title: 'Prioritetni Oglasi',
    description: 'Tvoji oglasi se prikazuju na vrhu rezultata pretrage',
  },
  {
    icon: Zap,
    title: '15 Slika Po Autu',
    description: 'Do 15 slika po oglasu (obični korisnici 5+krediti)',
  },
  {
    icon: Crown,
    title: 'Email Notifikacije',
    description: 'Primatelj dobija email kada mu pošalješ poruku',
  },
  {
    icon: Shield,
    title: 'Statistika Pregleda',
    description: 'Prati koliko puta je tvoj oglas pregledan',
  },
];

export function PremiumModal({ onClose, onSuccess }: PremiumModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanDuration>('10days');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.days);

      const { error: subscriptionError } = await supabase
        .from('premium_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: selectedPlan,
          amount_paid: plan.price,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'active',
        });

      if (subscriptionError) throw subscriptionError;

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          is_premium: true,
          premium_expires_at: expiresAt.toISOString(),
          premium_package_days: plan.days,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      alert(`✨ Čestitamo! Uspješno ste aktivirali Premium nalog na ${plan.days} dana!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error activating premium:', error);
      alert('Došlo je do greške. Molimo pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 p-6 rounded-t-3xl border-b-2 border-yellow-400/30 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Premium Članstvo
              </h2>
              <p className="text-sm text-white/80">Nadogradi na premium i iskoristi sve prednosti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {premiumFeatures.map((feature) => (
              <div
                key={feature.title}
                className="backdrop-blur-md bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl p-5 hover:border-yellow-500/40 transition-all hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Odaberi Paket
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative backdrop-blur-md rounded-2xl p-6 border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500 scale-105 shadow-lg shadow-yellow-500/30'
                      : 'bg-white/5 border-white/10 hover:border-yellow-500/50 hover:scale-102'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      Najpopularnije
                    </div>
                  )}
                  {plan.discount && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {plan.discount}
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{plan.name}</div>
                    <div className="text-sm text-gray-400 mb-4">{plan.duration}</div>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-yellow-500">
                        €{plan.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        €{(plan.price / plan.days).toFixed(2)}/dan
                      </div>
                    </div>
                    {selectedPlan === plan.id && (
                      <div className="flex items-center justify-center gap-2 text-yellow-500">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-semibold">Odabrano</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="backdrop-blur-md bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h4 className="text-white font-bold mb-2">Sigurna Plaćanja</h4>
                <p className="text-gray-400 text-sm">
                  Sva plaćanja su sigurna i enkriptovana. Možete otkazati pretplatu bilo kada.
                  Nakon isteka perioda, možete obnoviti svoje članstvo.
                </p>
              </div>
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
              onClick={handlePurchase}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-600 hover:via-amber-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Aktiviranje...
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  Aktiviraj Premium - €{plans.find(p => p.id === selectedPlan)?.price.toFixed(2)}
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500">
            Klikom na "Aktiviraj Premium" prihvatate naše uslove korištenja i politiku privatnosti.
          </p>
        </div>
      </div>
    </div>
  );
}
