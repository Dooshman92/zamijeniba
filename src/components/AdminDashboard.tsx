import { useState, useEffect } from 'react';
import {
  Users, UserX, Car, Ticket, TrendingUp, MessageSquare,
  RefreshCw, Shield, Crown, Package, Search, Filter,
  ChevronLeft, ChevronRight, Ban, Check, X, Mail, Phone, Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type AdminSection = 'dashboard' | 'users' | 'banned' | 'cars' | 'promo' | 'premium' | 'swaps' | 'inquiries';

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  phone_number: string;
  is_admin: boolean;
  is_premium: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  ban_expires_at: string | null;
  credits: number;
  created_at: string;
}

interface Car {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  status: string;
  price: number;
  location: string;
  created_at: string;
  user_profiles: {
    nickname: string;
    email: string;
  };
}

interface PromoCode {
  id: string;
  code: string;
  credits_reward: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  creator: {
    nickname: string;
  } | null;
  promo_code_redemptions?: Array<{
    redeemed_at: string;
    user_profiles: {
      nickname: string;
      email: string;
    };
  }>;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalCars: number;
  activeCars: number;
  soldCars: number;
  premiumUsers: number;
  totalSwapOffers: number;
  activePromoCodes: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bannedUsers, setBannedUsers] = useState<UserProfile[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadDashboardStats();
    } else if (activeSection === 'users') {
      loadUsers();
    } else if (activeSection === 'banned') {
      loadBannedUsers();
    } else if (activeSection === 'cars') {
      loadCars();
    } else if (activeSection === 'promo') {
      loadPromoCodes();
    }
  }, [activeSection]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const [usersRes, carsRes, swapsRes, promoRes] = await Promise.all([
        supabase.from('user_profiles').select('is_banned, is_premium, created_at'),
        supabase.from('cars').select('status'),
        supabase.from('swap_offers').select('status'),
        supabase.from('promo_codes').select('is_active')
      ]);

      const totalUsers = usersRes.data?.length || 0;
      const bannedUsers = usersRes.data?.filter(u => u.is_banned).length || 0;
      const premiumUsers = usersRes.data?.filter(u => u.is_premium).length || 0;
      const activeUsers = totalUsers - bannedUsers;

      const totalCars = carsRes.data?.length || 0;
      const activeCars = carsRes.data?.filter(c => c.status === 'active').length || 0;
      const soldCars = carsRes.data?.filter(c => c.status === 'sold').length || 0;

      const totalSwapOffers = swapsRes.data?.length || 0;
      const activePromoCodes = promoRes.data?.filter(p => p.is_active).length || 0;

      setStats({
        totalUsers,
        activeUsers,
        bannedUsers,
        totalCars,
        activeCars,
        soldCars,
        premiumUsers,
        totalSwapOffers,
        activePromoCodes
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBannedUsers = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_banned', true)
        .order('created_at', { ascending: false });

      setBannedUsers(data || []);
    } catch (error) {
      console.error('Error loading banned users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCars = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('cars')
        .select('*, user_profiles(nickname, email)')
        .order('created_at', { ascending: false });

      setCars(data || []);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPromoCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select(`
          *,
          creator:user_profiles!promo_codes_created_by_fkey(nickname),
          promo_code_redemptions(
            redeemed_at,
            user_profiles(nickname, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading promo codes:', error);
      }

      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error loading promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string) => {
    const reason = prompt('Razlog banovanja:');
    if (!reason) return;

    const daysStr = prompt('Broj dana bana (ostavite prazno za trajno):');
    let expiresAt = null;

    if (daysStr) {
      const days = parseInt(daysStr);
      if (!isNaN(days)) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString();
      }
    }

    try {
      await supabase
        .from('user_profiles')
        .update({
          is_banned: true,
          ban_reason: reason,
          ban_expires_at: expiresAt
        })
        .eq('id', userId);

      alert('Korisnik je banovan');
      if (activeSection === 'users') loadUsers();
      if (activeSection === 'banned') loadBannedUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Greška pri banovanju korisnika');
    }
  };

  const unbanUser = async (userId: string) => {
    if (!confirm('Da li ste sigurni da želite da debanujete ovog korisnika?')) return;

    try {
      await supabase
        .from('user_profiles')
        .update({
          is_banned: false,
          ban_reason: null,
          ban_expires_at: null
        })
        .eq('id', userId);

      alert('Korisnik je debanovan');
      if (activeSection === 'users') loadUsers();
      if (activeSection === 'banned') loadBannedUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Greška pri debanovanju korisnika');
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('user_profiles')
        .update({ is_premium: !currentStatus })
        .eq('id', userId);

      alert(currentStatus ? 'Premium status uklonjen' : 'Premium status dodeljen');
      loadUsers();
    } catch (error) {
      console.error('Error toggling premium:', error);
      alert('Greška pri promeni premium statusa');
    }
  };

  const createPromoCode = async () => {
    const creditsStr = prompt('Broj kredita za novi promo kod:');
    if (!creditsStr) return;

    const credits = parseInt(creditsStr);
    if (isNaN(credits) || credits <= 0) {
      alert('Unesite validan broj kredita');
      return;
    }

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    try {
      const { error } = await supabase
        .from('promo_codes')
        .insert({
          code,
          credits_reward: credits,
          description: `${credits} kredita`,
          created_by: user!.id,
          is_active: true
        });

      if (error) throw error;

      alert(`Promo kod kreiran: ${code}`);
      loadPromoCodes();
    } catch (error) {
      console.error('Error creating promo code:', error);
      alert('Greška pri kreiranju promo koda');
    }
  };

  const deletePromoCode = async (codeId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj promo kod?')) return;

    try {
      await supabase
        .from('promo_codes')
        .delete()
        .eq('id', codeId);

      alert('Promo kod je obrisan');
      loadPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      alert('Greška pri brisanju promo koda');
    }
  };

  const filterData = (data: any[]) => {
    if (!searchTerm) return data;

    return data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return JSON.stringify(item).toLowerCase().includes(searchLower);
    });
  };

  const paginateData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data: any[]) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pregled Statistika</h2>
        <p className="text-gray-600">Kompletan uvid u platformu</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.totalUsers}</span>
              </div>
              <p className="text-blue-100">Ukupno Korisnika</p>
              <p className="text-sm text-blue-200 mt-1">{stats.activeUsers} aktivnih</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <UserX className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.bannedUsers}</span>
              </div>
              <p className="text-red-100">Banovanih Korisnika</p>
              <p className="text-sm text-red-200 mt-1">
                {((stats.bannedUsers / stats.totalUsers) * 100).toFixed(1)}% od ukupno
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Car className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.totalCars}</span>
              </div>
              <p className="text-green-100">Ukupno Automobila</p>
              <p className="text-sm text-green-200 mt-1">{stats.activeCars} aktivnih</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Crown className="w-8 h-8 opacity-80" />
                <span className="text-3xl font-bold">{stats.premiumUsers}</span>
              </div>
              <p className="text-purple-100">Premium Korisnika</p>
              <p className="text-sm text-purple-200 mt-1">
                {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% od ukupno
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCars}</p>
                  <p className="text-sm text-gray-600">Aktivni Oglasi</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.soldCars}</p>
                  <p className="text-sm text-gray-600">Prodato Automobila</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSwapOffers}</p>
                  <p className="text-sm text-gray-600">Swap Ponuda</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Ticket className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.activePromoCodes}</p>
                  <p className="text-sm text-gray-600">Aktivni Promo Kodovi</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brzi Uvid</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Conversion Rate (Aktivni/Ukupno)</span>
                <span className="font-semibold text-gray-900">
                  {((stats.activeCars / stats.totalCars) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Prodato/Ukupno Automobila</span>
                <span className="font-semibold text-gray-900">
                  {((stats.soldCars / stats.totalCars) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Premium Adoption Rate</span>
                <span className="font-semibold text-gray-900">
                  {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = filterData(users);
    const paginatedUsers = paginateData(filteredUsers);
    const totalPages = getTotalPages(filteredUsers);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upravljanje Korisnicima</h2>
            <p className="text-gray-600">Ukupno {filteredUsers.length} korisnika</p>
          </div>
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Osveži
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pretraži korisnike (email, nickname, telefon...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 outline-none text-gray-900"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Korisnik</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kontakt</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Krediti</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Datum</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.nickname.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.nickname}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
                            {user.phone_number && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                {user.phone_number}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {user.is_admin && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                            {user.is_premium && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                <Crown className="w-3 h-3" />
                                Premium
                              </span>
                            )}
                            {user.is_banned && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                <Ban className="w-3 h-3" />
                                Banovan
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900">{user.credits}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('sr-RS')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {!user.is_admin && (
                              <>
                                <button
                                  onClick={() => togglePremium(user.id, user.is_premium)}
                                  className={`p-2 rounded-lg ${
                                    user.is_premium
                                      ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  title={user.is_premium ? 'Ukloni Premium' : 'Dodaj Premium'}
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
                                {user.is_banned ? (
                                  <button
                                    onClick={() => unbanUser(user.id)}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                    title="Debanuj"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => banUser(user.id)}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                    title="Banuj"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                  Prikazano {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} od {filteredUsers.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    Strana {currentPage} od {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderBannedUsers = () => {
    const filteredUsers = filterData(bannedUsers);
    const paginatedUsers = paginateData(filteredUsers);
    const totalPages = getTotalPages(filteredUsers);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Banovani Korisnici</h2>
            <p className="text-gray-600">Ukupno {filteredUsers.length} banovanih korisnika</p>
          </div>
          <button
            onClick={loadBannedUsers}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Osveži
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pretraži banovane korisnike..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 outline-none text-gray-900"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : bannedUsers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <UserX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nema banovanih korisnika</h3>
            <p className="text-gray-600">Trenutno nema korisnika sa aktivnim banom</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {paginatedUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border border-red-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {user.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{user.nickname}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            <Ban className="w-3 h-3" />
                            Banovan
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </p>
                          {user.phone_number && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {user.phone_number}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-900 mb-1">Razlog bana:</p>
                          <p className="text-sm text-red-700">{user.ban_reason || 'Nije naveden razlog'}</p>
                          {user.ban_expires_at && (
                            <p className="text-xs text-red-600 mt-2">
                              Ban ističe: {new Date(user.ban_expires_at).toLocaleString('sr-RS')}
                            </p>
                          )}
                          {!user.ban_expires_at && (
                            <p className="text-xs text-red-600 mt-2">Trajni ban</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Banovan: {new Date(user.created_at).toLocaleString('sr-RS')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => unbanUser(user.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                      Debanuj
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                  Prikazano {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} od {filteredUsers.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    Strana {currentPage} od {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderCars = () => {
    const filteredCars = filterData(cars);
    const paginatedCars = paginateData(filteredCars);
    const totalPages = getTotalPages(filteredCars);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upravljanje Automobilima</h2>
            <p className="text-gray-600">Ukupno {filteredCars.length} oglasa</p>
          </div>
          <button
            onClick={loadCars}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Osveži
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pretraži automobile (brend, model, lokacija...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 outline-none text-gray-900"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Automobil</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vlasnik</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lokacija</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cena</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Datum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedCars.map((car) => (
                      <tr key={car.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Car className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{car.brand} {car.model}</p>
                              <p className="text-sm text-gray-500">{car.year}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{car.user_profiles?.nickname}</p>
                          <p className="text-sm text-gray-500">{car.user_profiles?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{car.location}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{car.price?.toLocaleString()} €</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            car.status === 'active' ? 'bg-green-100 text-green-700' :
                            car.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {car.status === 'active' ? 'Aktivan' : car.status === 'sold' ? 'Prodat' : 'Neaktivan'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(car.created_at).toLocaleDateString('sr-RS')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                  Prikazano {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCars.length)} od {filteredCars.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    Strana {currentPage} od {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderPromoCodes = () => {
    const filteredCodes = filterData(promoCodes);
    const paginatedCodes = paginateData(filteredCodes);
    const totalPages = getTotalPages(filteredCodes);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Promo Kodovi</h2>
            <p className="text-gray-600">Ukupno {filteredCodes.length} promo kodova</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createPromoCode}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Kreiraj Kod
            </button>
            <button
              onClick={loadPromoCodes}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Osveži
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCodes.map((code) => {
                const redemption = code.promo_code_redemptions?.[0];
                return (
                  <div key={code.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-pink-600" />
                        <span className="font-mono font-bold text-lg text-gray-900">{code.code}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        code.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {code.is_active ? 'Aktivan' : 'Iskorišćen'}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-gray-600">
                        Krediti: <span className="font-semibold text-gray-900">{code.credits_reward}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Kreirao: <span className="font-medium text-gray-900">{code.creator?.nickname || 'Sistem'}</span>
                      </p>
                      {redemption && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Iskoristio:</p>
                          <p className="text-xs text-blue-800">
                            @{redemption.user_profiles?.nickname}
                          </p>
                          <p className="text-xs text-blue-600">
                            {redemption.user_profiles?.email}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            {new Date(redemption.redeemed_at).toLocaleString('sr-RS')}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Kreiran: {new Date(code.created_at).toLocaleString('sr-RS')}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePromoCode(code.id)}
                      className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                    >
                      Obriši
                    </button>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                  Prikazano {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCodes.length)} od {filteredCodes.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">
                    Strana {currentPage} od {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Upravljanje platformom</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveSection('dashboard');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'dashboard'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('users');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'users'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Korisnici</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('banned');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'banned'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <UserX className="w-5 h-5" />
              <span className="font-medium">Banovani</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('cars');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'cars'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Car className="w-5 h-5" />
              <span className="font-medium">Automobili</span>
            </button>

            <button
              onClick={() => {
                setActiveSection('promo');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'promo'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Ticket className="w-5 h-5" />
              <span className="font-medium">Promo Kodovi</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'users' && renderUsers()}
          {activeSection === 'banned' && renderBannedUsers()}
          {activeSection === 'cars' && renderCars()}
          {activeSection === 'promo' && renderPromoCodes()}
        </div>
      </div>
    </div>
  );
}
