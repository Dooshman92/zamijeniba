import { useState, useEffect } from 'react';
import { X, Shield, Crown, User, Search, CheckCircle, XCircle, Power, Gift, Eye, EyeOff, Plus, Trash2, ToggleLeft, ToggleRight, Users, Ban, UserX, Clock, MessageCircle } from 'lucide-react';
import { supabase, UserProfile } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatDate, formatDateTimeShort } from '../lib/dateUtils';
import { SupportPanel } from './SupportPanel';

interface PromoCode {
  code: string;
  credits_reward: number;
  is_active: boolean;
  created_at: string;
  description: string;
}

interface PromoRedemption {
  id: string;
  user_id: string;
  code: string;
  credits_received: number;
  redeemed_at: string;
  user_profile?: {
    full_name: string;
    nickname: string;
  };
}

interface PromoCodeWithRedemption extends PromoCode {
  redemption?: PromoRedemption;
}

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'support' | 'promo'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCodeWithRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [premiumEnabled, setPremiumEnabled] = useState(true);
  const [updatingPremiumSystem, setUpdatingPremiumSystem] = useState(false);
  const [creditsEnabled, setCreditsEnabled] = useState(true);
  const [updatingCreditsSystem, setUpdatingCreditsSystem] = useState(false);
  const [showPromoCodes, setShowPromoCodes] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCodeCredits, setNewCodeCredits] = useState(10);
  const [creating, setCreating] = useState(false);
  const [selectedCodeRedemptions, setSelectedCodeRedemptions] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<PromoRedemption[]>([]);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<'permanent' | '1day' | '7days' | '30days'>('permanent');
  const [banning, setBanning] = useState(false);

  useEffect(() => {
    loadUsers();
    loadSiteSettings();
    loadSystemSettings();
    loadPromoCodes();

    const interval = setInterval(() => {
      loadPromoCodes();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const loadSiteSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('id', 'premium_enabled')
      .maybeSingle();

    if (!error && data) {
      setPremiumEnabled(data.value);
    }
  };

  const loadSystemSettings = async () => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('credits_enabled')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    if (!error && data) {
      setCreditsEnabled(data.credits_enabled);
    }
  };

  const loadPromoCodes = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const codesWithRedemptions = await Promise.all(
        data.map(async (code) => {
          if (!code.is_active) {
            const { data: redemptionData } = await supabase
              .from('promo_code_redemptions')
              .select(`
                *,
                user_profiles:user_id (
                  full_name,
                  nickname
                )
              `)
              .eq('code', code.code)
              .maybeSingle();

            if (redemptionData) {
              const redemption = {
                ...redemptionData,
                user_profile: Array.isArray(redemptionData.user_profiles)
                  ? redemptionData.user_profiles[0]
                  : redemptionData.user_profiles
              };
              return { ...code, redemption };
            }
          }
          return code;
        })
      );
      setPromoCodes(codesWithRedemptions);
    }
  };

  const generateRandomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createPromoCode = async () => {
    setCreating(true);
    const newCode = generateRandomCode();

    const { error } = await supabase
      .from('promo_codes')
      .insert({
        code: newCode,
        credits_reward: newCodeCredits,
        description: `Promo kod - ${newCodeCredits} kredita`,
        is_active: true
      });

    if (!error) {
      await loadPromoCodes();
      setShowCreateForm(false);
      alert(`Novi kod kreiran: ${newCode}`);
    } else {
      alert('Greška pri kreiranju koda');
    }

    setCreating(false);
  };

  const toggleCodeActive = async (code: string, currentStatus: boolean) => {
    setUpdating(code);

    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: !currentStatus })
      .eq('code', code);

    if (!error) {
      await loadPromoCodes();
    } else {
      alert('Greška pri ažuriranju koda');
    }

    setUpdating(null);
  };

  const deletePromoCode = async (code: string) => {
    if (!confirm(`Da li ste sigurni da želite obrisati kod ${code}?`)) return;

    setUpdating(code);

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('code', code);

    if (!error) {
      await loadPromoCodes();
    } else {
      alert('Greška pri brisanju koda');
    }

    setUpdating(null);
  };

  const loadRedemptions = async (code: string) => {
    const { data, error } = await supabase
      .from('promo_code_redemptions')
      .select(`
        *,
        user_profiles:user_id (
          full_name,
          nickname
        )
      `)
      .eq('code', code)
      .order('redeemed_at', { ascending: false });

    if (!error && data) {
      const formatted = data.map(r => ({
        ...r,
        user_profile: Array.isArray(r.user_profiles) ? r.user_profiles[0] : r.user_profiles
      }));
      setRedemptions(formatted);
      setSelectedCodeRedemptions(code);
    }
  };

  const togglePremiumSystem = async () => {
    setUpdatingPremiumSystem(true);

    const { data: currentUser } = await supabase.auth.getUser();
    const newValue = !premiumEnabled;

    const { error } = await supabase
      .from('site_settings')
      .update({
        value: newValue,
        updated_at: new Date().toISOString(),
        updated_by: currentUser?.user?.id
      })
      .eq('id', 'premium_enabled');

    if (!error) {
      setPremiumEnabled(newValue);
    } else {
      alert('Greška pri ažuriranju sistema');
    }

    setUpdatingPremiumSystem(false);
  };

  const toggleCreditsSystem = async () => {
    setUpdatingCreditsSystem(true);

    const newValue = !creditsEnabled;

    const { error } = await supabase
      .from('system_settings')
      .update({
        credits_enabled: newValue
      })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    if (!error) {
      setCreditsEnabled(newValue);
    } else {
      alert('Greška pri ažuriranju sistema kredita');
    }

    setUpdatingCreditsSystem(false);
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId);

    const newPremiumStatus = !currentStatus;
    const updateData: any = {
      is_premium: newPremiumStatus
    };

    if (newPremiumStatus) {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 10);
      updateData.premium_expires_at = expiresAt.toISOString();
    } else {
      updateData.premium_expires_at = null;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, is_premium: newPremiumStatus, premium_expires_at: updateData.premium_expires_at }
          : user
      ));
    } else {
      alert('Greška pri ažuriranju premium statusa');
    }

    setUpdating(null);
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId);

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(user =>
        user.id === userId ? { ...user, is_admin: !currentStatus } : user
      ));
    } else {
      alert('Greška pri ažuriranju admin statusa');
    }

    setUpdating(null);
  };

  const openBanModal = (userId: string) => {
    setBanUserId(userId);
    setBanReason('');
    setBanDuration('permanent');
    setShowBanModal(true);
  };

  const handleBan = async () => {
    if (!banUserId || !currentUser) return;

    setBanning(true);

    let banExpiresAt = null;
    if (banDuration !== 'permanent') {
      const expiryDate = new Date();
      switch (banDuration) {
        case '1day':
          expiryDate.setDate(expiryDate.getDate() + 1);
          break;
        case '7days':
          expiryDate.setDate(expiryDate.getDate() + 7);
          break;
        case '30days':
          expiryDate.setDate(expiryDate.getDate() + 30);
          break;
      }
      banExpiresAt = expiryDate.toISOString();
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_banned: true,
        ban_reason: banReason || 'Kršenje pravila',
        banned_at: new Date().toISOString(),
        banned_by: currentUser.id,
        ban_expires_at: banExpiresAt
      })
      .eq('id', banUserId);

    if (!error) {
      setUsers(users.map(user =>
        user.id === banUserId
          ? {
              ...user,
              is_banned: true,
              ban_reason: banReason || 'Kršenje pravila',
              banned_at: new Date().toISOString(),
              banned_by: currentUser.id,
              ban_expires_at: banExpiresAt
            }
          : user
      ));
      setShowBanModal(false);
      setBanUserId(null);
    } else {
      alert('Greška pri banovanju korisnika');
    }

    setBanning(false);
  };

  const handleUnban = async (userId: string) => {
    setUpdating(userId);

    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_banned: false,
        ban_reason: null,
        banned_at: null,
        banned_by: null,
        ban_expires_at: null
      })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(user =>
        user.id === userId
          ? {
              ...user,
              is_banned: false,
              ban_reason: null,
              banned_at: null,
              banned_by: null,
              ban_expires_at: null
            }
          : user
      ));
    } else {
      alert('Greška pri odbanovanju korisnika');
    }

    setUpdating(null);
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-red-500/30">
        <div className="sticky top-0 bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b border-red-500/30 px-6 py-4 z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-7 h-7 text-red-400" />
              <h2 className="text-2xl font-bold text-white">
                Admin Panel
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              Korisnici
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'support'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Podrška
            </button>
            <button
              onClick={() => setActiveTab('promo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'promo'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Gift className="w-5 h-5" />
              Promo Kodovi
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] px-6 py-4">
          {activeTab === 'support' && currentUser?.id && (
            <SupportPanel userId={currentUser.id} />
          )}

          {activeTab === 'users' && (
            <>
              <div className="space-y-4 mb-6">
                <div className={`p-4 rounded-xl border-2 ${
            premiumEnabled
              ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-yellow-500/50'
              : 'bg-gradient-to-r from-green-900/30 to-green-800/30 border-green-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Power className={`w-6 h-6 ${premiumEnabled ? 'text-yellow-400' : 'text-green-400'}`} />
                <div>
                  <h3 className="text-lg font-bold text-white">Premium Sistem</h3>
                  <p className="text-sm text-gray-300">
                    {premiumEnabled
                      ? 'Premium funkcije su aktivne - korisnici moraju platiti'
                      : 'Premium funkcije su besplatne za sve korisnike'}
                  </p>
                </div>
              </div>
              <button
                onClick={togglePremiumSystem}
                disabled={updatingPremiumSystem}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                  premiumEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } ${updatingPremiumSystem ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
              >
                {updatingPremiumSystem ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Power className="w-5 h-5" />
                    {premiumEnabled ? 'Isključi Premium' : 'Uključi Premium'}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${
            creditsEnabled
              ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-500/50'
              : 'bg-gradient-to-r from-red-900/30 to-red-800/30 border-red-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className={`w-6 h-6 ${creditsEnabled ? 'text-blue-400' : 'text-red-400'}`} />
                <div>
                  <h3 className="text-lg font-bold text-white">Sistem Kredita</h3>
                  <p className="text-sm text-gray-300">
                    {creditsEnabled
                      ? 'Sistem kupovine kredita je aktivan - korisnici mogu kupiti kredite'
                      : 'Sistem kupovine kredita je isključen - opcija kupovine je skrivena'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleCreditsSystem}
                disabled={updatingCreditsSystem}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
                  creditsEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } ${updatingCreditsSystem ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
              >
                {updatingCreditsSystem ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Power className="w-5 h-5" />
                    {creditsEnabled ? 'Isključi Kredite' : 'Uključi Kredite'}
                  </>
                )}
              </button>
            </div>
          </div>
              </div>

          {activeTab === 'promo' && (
            <>
              <div className="flex items-center justify-between p-4 rounded-xl border-2 bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-purple-500/50 mb-4">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Promo Kodovi</h3>
                    <p className="text-sm text-gray-300">
                      Aktivnih kodova: {promoCodes.filter(p => p.is_active).length} / {promoCodes.length}
                    </p>
                  </div>
                </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Novi Kod
              </button>
              <button
                onClick={() => setShowPromoCodes(!showPromoCodes)}
                className="px-4 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {showPromoCodes ? (
                  <>
                    <EyeOff className="w-5 h-5" />
                    Sakrij
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" />
                    Prikaži
                  </>
                )}
              </button>
            </div>
          </div>

          {showCreateForm && (
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-5 border border-green-500/30">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-400" />
                Kreiraj Novi Promo Kod (jednokratna upotreba)
              </h4>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Broj kredita
                </label>
                <input
                  type="number"
                  value={newCodeCredits}
                  onChange={(e) => setNewCodeCredits(parseInt(e.target.value) || 0)}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-2">Svaki kod se može iskoristiti samo jednom</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={creating}
                >
                  Odustani
                </button>
                <button
                  onClick={createPromoCode}
                  disabled={creating || newCodeCredits < 1}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Kreiranje...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      Generiši Nasumični Kod
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {showPromoCodes && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-purple-500/30 space-y-3">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-400" />
                Svi Promo Kodovi
              </h4>
              {promoCodes.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nema kreiranih promo kodova</p>
              ) : (
                <div className="grid gap-3">
                  {promoCodes.map((promo) => (
                    <div key={promo.code}>
                      <div
                        className={`p-4 rounded-lg border-2 ${
                          promo.is_active
                            ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30'
                            : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-purple-600 to-purple-700 px-4 py-2 rounded-lg">
                              <span className="font-mono font-bold text-white text-lg">
                                {promo.code}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-400 font-bold text-lg">
                                  {promo.credits_reward} kredita
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  promo.is_active
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {promo.is_active ? 'AKTIVAN' : 'NEAKTIVAN'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-400">
                                Jednokratna upotreba
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            <div>Kreirano:</div>
                            <div className="text-gray-300">{formatDate(promo.created_at)}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadRedemptions(promo.code)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                            <Users className="w-4 h-4" />
                            Ko je iskoristio
                          </button>
                          <button
                            onClick={() => toggleCodeActive(promo.code, promo.is_active)}
                            disabled={updating === promo.code}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                              promo.is_active
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            } ${updating === promo.code ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {promo.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {promo.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                          </button>
                          <button
                            onClick={() => deletePromoCode(promo.code)}
                            disabled={updating === promo.code}
                            className={`flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors ${
                              updating === promo.code ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            Obriši
                          </button>
                        </div>
                      </div>

                      {!promo.is_active && promo.redemption && (
                        <div className="mt-3 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
                          <h5 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" />
                            Iskoristio:
                          </h5>
                          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-blue-400" />
                              <div>
                                <div className="text-white font-semibold text-sm">
                                  {promo.redemption.user_profile?.full_name || 'Nepoznat korisnik'}
                                </div>
                                {promo.redemption.user_profile?.nickname && (
                                  <div className="text-cyan-400 text-xs">@{promo.redemption.user_profile.nickname}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-yellow-400 font-bold text-sm">
                                +{promo.redemption.credits_received} kredita
                              </div>
                              <div className="text-gray-400 text-xs">
                                {formatDateTimeShort(promo.redemption.redeemed_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedCodeRedemptions === promo.code && (
                        <div className="mt-2 bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-bold text-white flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-400" />
                              Korisnici koji su iskoristili kod {promo.code}
                            </h5>
                            <button
                              onClick={() => setSelectedCodeRedemptions(null)}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {redemptions.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-2">Niko nije iskoristio ovaj kod</p>
                          ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {redemptions.map((redemption) => (
                                <div
                                  key={redemption.id}
                                  className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-blue-400" />
                                    <div>
                                      <div className="text-white font-semibold text-sm">
                                        {redemption.user_profile?.full_name || 'Nepoznat korisnik'}
                                      </div>
                                      {redemption.user_profile?.nickname && (
                                        <div className="text-cyan-400 text-xs">@{redemption.user_profile.nickname}</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-yellow-400 font-bold text-sm">
                                      +{redemption.credits_received} kredita
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                      {formatDateTimeShort(redemption.redeemed_at)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
            </>
          )}

          {activeTab === 'users' && (
            <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pretraži korisnike..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="mt-3 flex gap-4 text-sm text-gray-400">
            <div>Ukupno korisnika: <span className="text-white font-bold">{users.length}</span></div>
            <div>Premium: <span className="text-yellow-400 font-bold">{users.filter(u => u.is_premium).length}</span></div>
            <div>Admini: <span className="text-red-400 font-bold">{users.filter(u => u.is_admin).length}</span></div>
            <div>Banovani: <span className="text-gray-400 font-bold">{users.filter(u => u.is_banned).length}</span></div>
          </div>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Nema korisnika</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 hover:border-red-500/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="Avatar"
                        className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400"
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-full ${
                        user.gender === 'female'
                          ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                          : user.gender === 'male'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                      } flex items-center justify-center`}>
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {user.full_name || 'Bez imena'}
                        </h3>
                        {user.nickname && (
                          <span className="text-sm text-cyan-400">@{user.nickname}</span>
                        )}
                        {user.is_premium && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-semibold">
                            <Crown className="w-3 h-3" />
                            Premium
                          </span>
                        )}
                        {user.is_admin && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {user.is_banned && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-900 text-gray-300 rounded-lg text-xs font-semibold border border-gray-600">
                            <Ban className="w-3 h-3" />
                            Banovan
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
                        <div>Telefon: {user.phone || 'N/A'}</div>
                        <div>Lokacija: {user.location || 'N/A'}</div>
                        <div>Kreiran: {formatDate(user.created_at)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePremium(user.id, user.is_premium)}
                          disabled={updating === user.id}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                            user.is_premium
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          } ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updating === user.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : user.is_premium ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              Ukloni Premium
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Dodaj Premium
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          disabled={updating === user.id}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                            user.is_admin
                              ? 'bg-gray-600 hover:bg-gray-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          } ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {user.is_admin ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              Ukloni Admin
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4" />
                              Dodaj Admin
                            </>
                          )}
                        </button>
                        {user.is_banned ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            disabled={updating === user.id}
                            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium bg-green-600 hover:bg-green-700 text-white ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {updating === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Odbaniraj
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => openBanModal(user.id)}
                            disabled={updating === user.id}
                            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium bg-gray-900 hover:bg-black text-white border border-gray-700 ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Ban className="w-4 h-4" />
                            Baniraj
                          </button>
                        )}
                      </div>
                      {user.is_banned && user.ban_reason && (
                        <div className="mt-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                          <div className="flex items-start gap-2">
                            <UserX className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-400 mb-1">Razlog bana:</p>
                              <p className="text-sm text-gray-300">{user.ban_reason}</p>
                              {user.ban_expires_at && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  Ističe: {new Date(user.ban_expires_at).toLocaleString('sr-RS')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
            </>
          )}
        </div>

      {showBanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-red-500/30">
            <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b border-red-500/30 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Ban className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">Baniraj Korisnika</h2>
              </div>
              <button
                onClick={() => setShowBanModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Razlog bana
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Unesite razlog banovanja..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Trajanje bana
                </label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value as any)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="permanent">Trajno</option>
                  <option value="1day">1 Dan</option>
                  <option value="7days">7 Dana</option>
                  <option value="30days">30 Dana</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBanModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  disabled={banning}
                >
                  Odustani
                </button>
                <button
                  onClick={handleBan}
                  disabled={banning}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {banning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Banovanje...
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Potvrdi Ban
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
