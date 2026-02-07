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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwordData.currentPassword
    });

    if (signInError) {
      setPasswordError('Trenutna lozinka nije ispravna');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordData.newPassword
    });

    setLoading(false);

    if (updateError) {
      setPasswordError('Greška pri promjeni lozinke');
      return;
    }

    setPasswordSuccess('Lozinka uspješno promijenjena');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
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
      <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-white/20 rounded-3xl max-w-2xl w-full shadow-2xl shadow-cyan-500/20 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 backdrop-blur-xl bg-gray-900/50 border-b border-white/10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Uredi profil</h2>
          </div>
          <button
            onClick={onClose}
            className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/30 bg-gradient-to-br from-gray-700 to-gray-800">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {formData.gender === 'female' ? (
                      <svg className="w-16 h-16 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 8a3 3 0 113-3 3 3 0 01-3 3zM12 11c-4.42 0-8 2.69-8 6v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-3.31-3.58-6-8-6z"/>
                      </svg>
                    ) : formData.gender === 'male' ? (
                      <svg className="w-16 h-16 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 8a3 3 0 113-3 3 3 0 01-3 3zM12 11c-4.42 0-8 2.69-8 6v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-3.31-3.58-6-8-6z"/>
                      </svg>
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 backdrop-blur-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-2 border-white p-3 rounded-full transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Camera className="w-5 h-5 text-white" />
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
            <p className="text-xs text-gray-400 text-center">Klikni na kameru za upload slike<br />Max 5MB</p>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <label className="text-sm font-semibold text-gray-300">Email</label>
            </div>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 cursor-not-allowed opacity-50"
            />
            <p className="text-xs text-gray-500 mt-2">Email ne može biti promijenjen</p>
          </div>

          <div className="backdrop-blur-md bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Promjena lozinke</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Trenutna lozinka</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Unesite trenutnu lozinku"
                    className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Nova lozinka</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Unesite novu lozinku (min. 6 karaktera)"
                    className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-300 mb-2 block">Potvrda nove lozinke</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Ponovo unesite novu lozinku"
                    className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-300">{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-green-300">{passwordSuccess}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Promjena u toku...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Promijeni lozinku</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!currentProfile?.is_premium && (
            <div className="backdrop-blur-md bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">Krediti</h3>
                    <span className="text-2xl font-black text-green-400">
                      {currentProfile?.credits || 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-3">
                    Koristite kredite za dodatne funkcionalnosti
                  </p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span>1 kredit = 1 dodatna slika na oglasu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span>10 kredita = 1 dodatni oglas</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      Dobijte kredite koristeći promo kodove!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-cyan-400" />
              <label className="text-sm font-semibold text-gray-300">Nadimak</label>
            </div>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder="Unesite jedinstveni nadimak"
              className={`w-full backdrop-blur-md bg-white/10 border ${nicknameError ? 'border-red-500' : 'border-white/20'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors`}
            />
            {nicknameError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{nicknameError}</span>
              </div>
            )}
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-cyan-400" />
              <label className="text-sm font-semibold text-gray-300">Puno ime</label>
            </div>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Unesite svoje puno ime"
              className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <UserCircle2 className="w-5 h-5 text-cyan-400" />
              <label className="text-sm font-semibold text-gray-300">Pol</label>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' })}
                  className="w-5 h-5 text-cyan-500 bg-white/10 border-white/20 focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-white">Muški</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'female' })}
                  className="w-5 h-5 text-cyan-500 bg-white/10 border-white/20 focus:ring-cyan-500 focus:ring-2"
                />
                <span className="text-white">Ženski</span>
              </label>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-cyan-400" />
              <label className="text-sm font-semibold text-gray-300">Telefon</label>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Unesite broj telefona"
              className="w-full backdrop-blur-md bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <label className="flex items-center gap-3 mt-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.show_phone_number}
                onChange={(e) => setFormData({ ...formData, show_phone_number: e.target.checked })}
                className="w-5 h-5 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Prikaži broj telefona svima (inače samo kada prihvatim ponudu)
              </span>
            </label>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <label className="text-sm font-semibold text-gray-300">Grad</label>
            </div>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full backdrop-blur-md bg-gray-900 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900">Odaberite grad</option>
              {bosnianCities.map((city) => (
                <option key={city} value={city} className="bg-gray-900">
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Spremanje...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Spremi promjene</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
