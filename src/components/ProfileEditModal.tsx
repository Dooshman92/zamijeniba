import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, MapPin, Save, Camera, Upload, AlertCircle, UserCircle2, Gift, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase, UserProfile } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { bosnianCities } from '../data/cities';

interface ProfileEditModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentProfile: UserProfile | null;
}

interface PhoneReveal {
  id: string;
  revealer_id: string;
  car_id: string | null;
  created_at: string;
  revealer_nickname: string | null;
  car_brand: string | null;
  car_model: string | null;
}

export function ProfileEditModal({ onClose, onSuccess, currentProfile }: ProfileEditModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatar_url || '');
  const [phoneReveals, setPhoneReveals] = useState<PhoneReveal[]>([]);
  const [loadingReveals, setLoadingReveals] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: currentProfile?.full_name || '',
    nickname: currentProfile?.nickname || '',
    phone: currentProfile?.phone || '',
    location: currentProfile?.location || '',
    gender: currentProfile?.gender || null as 'male' | 'female' | null,
    show_phone_number: currentProfile?.show_phone_number || false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      fetchPhoneReveals();
    }
  }, [user]);

  const fetchPhoneReveals = async () => {
    if (!user) return;

    setLoadingReveals(true);
    const { data } = await supabase
      .from('phone_reveals')
      .select(`
        id,
        revealer_id,
        car_id,
        created_at,
        revealer:user_profiles!revealer_id(nickname),
        car:cars(brand, model)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const formattedData = data.map((reveal: any) => ({
        id: reveal.id,
        revealer_id: reveal.revealer_id,
        car_id: reveal.car_id,
        created_at: reveal.created_at,
        revealer_nickname: reveal.revealer?.nickname || null,
        car_brand: reveal.car?.brand || null,
        car_model: reveal.car?.model || null,
      }));
      setPhoneReveals(formattedData);
    }
    setLoadingReveals(false);
  };

  const checkNicknameAvailability = async (nickname: string) => {
    if (!nickname.trim()) {
      setNicknameError('');
      return true;
    }

    if (nickname.trim() === currentProfile?.nickname) {
      setNicknameError('');
      return true;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .ilike('nickname', nickname.trim())
      .maybeSingle();

    if (error) {
      setNicknameError('Greška pri provjeri nadimka');
      return false;
    }

    if (data) {
      setNicknameError('Nadimak je već zauzet');
      return false;
    }

    setNicknameError('');
    return true;
  };

  const handleNicknameChange = async (value: string) => {
    setFormData({ ...formData, nickname: value });
    if (value.trim().length > 0) {
      await checkNicknameAvailability(value);
    } else {
      setNicknameError('');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Molimo odaberite sliku');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Slika je prevelika. Maksimalna veličina je 5MB');
      return;
    }

    setUploadingAvatar(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Greška pri upload-u slike');
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    setAvatarUrl(publicUrl);
    setUploadingAvatar(false);
  };

  const handlePasswordChange = async () => {
    if (!user?.email) return;

    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword) {
      setPasswordError('Unesite trenutnu lozinku');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('Unesite novu lozinku');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Nova lozinka mora imati najmanje 6 karaktera');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Nova lozinka i potvrda se ne poklapaju');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setPasswordError('Sesija nije aktivna');
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/change-password`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      setLoading(false);

      if (!response.ok) {
        setPasswordError(result.error || 'Greška pri promjeni lozinke');
        return;
      }

      setPasswordSuccess('Lozinka uspješno promijenjena');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setLoading(false);
      setPasswordError('Greška pri promjeni lozinke');
      console.error('Password change error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.nickname && !(await checkNicknameAvailability(formData.nickname))) {
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        full_name: formData.full_name || null,
        nickname: formData.nickname || null,
        phone: formData.phone || null,
        location: formData.location || null,
        avatar_url: avatarUrl || null,
        gender: formData.gender || null,
        show_phone_number: formData.show_phone_number,
        updated_at: new Date().toISOString()
      });

    setLoading(false);

    if (!error) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-white/20 rounded-2xl max-w-md w-full shadow-2xl shadow-cyan-500/20 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 backdrop-blur-xl bg-gray-900/50 border-b border-white/10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Uredi profil</h2>
          </div>
          <button
            onClick={onClose}
            className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-lg transition-all duration-300 hover:scale-110"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500 shadow-lg shadow-cyan-500/30 bg-gradient-to-br from-gray-700 to-gray-800">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {formData.gender === 'female' ? (
                      <svg className="w-12 h-12 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 8a3 3 0 113-3 3 3 0 01-3 3zM12 11c-4.42 0-8 2.69-8 6v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-3.31-3.58-6-8-6z"/>
                      </svg>
                    ) : formData.gender === 'male' ? (
                      <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 8a3 3 0 113-3 3 3 0 01-3 3zM12 11c-4.42 0-8 2.69-8 6v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-3.31-3.58-6-8-6z"/>
                      </svg>
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 backdrop-blur-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-2 border-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-400 text-center">Max 5MB</p>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Mail className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-semibold text-gray-300">Email</label>
            </div>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 cursor-not-allowed opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">Email ne može biti promijenjen</p>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">Promjena lozinke</h3>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Trenutna lozinka</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Trenutna lozinka"
                    className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Nova lozinka</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Min. 6 karaktera"
                    className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1 block">Potvrda lozinke</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Ponovi lozinku"
                    className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-xs text-red-300">{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-xs text-green-300">{passwordSuccess}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Promjena...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Promijeni lozinku</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-semibold text-gray-300">Nadimak</label>
            </div>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder="Jedinstveni nadimak"
              className={`w-full backdrop-blur-md bg-white/10 border ${nicknameError ? 'border-red-500' : 'border-white/20'} rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors`}
            />
            {nicknameError && (
              <div className="flex items-center gap-1.5 mt-1 text-red-400 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>{nicknameError}</span>
              </div>
            )}
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-semibold text-gray-300">Puno ime</label>
            </div>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Puno ime"
              className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <UserCircle2 className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-semibold text-gray-300">Pol</label>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' })}
                  className="w-4 h-4 text-cyan-500 bg-white/10 border-white/20 focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-sm text-white">Muški</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'female' })}
                  className="w-4 h-4 text-cyan-500 bg-white/10 border-white/20 focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-sm text-white">Ženski</span>
              </label>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Phone className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-semibold text-gray-300">Telefon</label>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Broj telefona"
              className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.show_phone_number}
                onChange={(e) => setFormData({ ...formData, show_phone_number: e.target.checked })}
                className="w-4 h-4 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                Prikaži svima
              </span>
            </label>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <label className="text-xs font-semibold text-gray-300">Grad</label>
            </div>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full backdrop-blur-md bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900">Odaberi grad</option>
              {bosnianCities.map((city) => (
                <option key={city} value={city} className="bg-gray-900">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {formData.phone && formData.show_phone_number && (
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Otkrieni telefoni</h3>
              </div>

              {loadingReveals ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent"></div>
                  <p className="text-xs text-gray-400 mt-2">Učitavanje...</p>
                </div>
              ) : phoneReveals.length === 0 ? (
                <div className="text-center py-4">
                  <Eye className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Niko još nije otkrio vaš telefon</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {phoneReveals.map((reveal) => (
                    <div
                      key={reveal.id}
                      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">
                            {reveal.revealer_nickname ? `@${reveal.revealer_nickname}` : 'Korisnik'}
                          </p>
                          {reveal.car_brand && reveal.car_model && (
                            <p className="text-xs text-gray-400">
                              {reveal.car_brand} {reveal.car_model}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(reveal.created_at).toLocaleDateString('sr-Latn-RS', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 text-sm"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Spremanje...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Spremi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
