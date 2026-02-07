import { useEffect, useState, lazy, Suspense } from 'react';
import { Plus, Car as CarIcon, LogIn, LogOut, User, Sparkles, Settings, FileText, Shield, ShieldCheck, MessageCircle, Gift, ArrowRightLeft, Coins, Zap, Headset, Bike, Ship, Waves } from 'lucide-react';
import { Car, supabase, UserProfile } from './lib/supabase';
import { useAuth } from './lib/auth';
import { initializeStorage } from './lib/storage';
import { getOrCreateConversation } from './lib/messaging';
import { CarCard } from './components/CarCard';
import { Logo } from './components/Logo';
import { AdvancedFilters, FilterOptions } from './components/AdvancedFilters';
import { SearchWithAutocomplete } from './components/SearchWithAutocomplete';
import { FEATURES } from './config/features';

const AddCarFormMultiStep = lazy(() => import('./components/AddCarFormMultiStep').then(m => ({ default: m.AddCarFormMultiStep })));
const SwapOfferModal = lazy(() => import('./components/SwapOfferModal').then(m => ({ default: m.SwapOfferModal })));
const SwapOffersPanel = lazy(() => import('./components/SwapOffersPanel').then(m => ({ default: m.SwapOffersPanel })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const ProfileEditModal = lazy(() => import('./components/ProfileEditModal').then(m => ({ default: m.ProfileEditModal })));
const PremiumModal = lazy(() => import('./components/PremiumModal').then(m => ({ default: m.PremiumModal })));
const MyAdsModal = lazy(() => import('./components/MyAdsModal').then(m => ({ default: m.MyAdsModal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const MessagingCenterModal = lazy(() => import('./components/MessagingCenterModal').then(m => ({ default: m.MessagingCenterModal })));
const PromoCodeModal = lazy(() => import('./components/PromoCodeModal').then(m => ({ default: m.PromoCodeModal })));
const BuyCreditsModal = lazy(() => import('./components/BuyCreditsModal').then(m => ({ default: m.BuyCreditsModal })));
const DirectChatModal = lazy(() => import('./components/DirectChatModal').then(m => ({ default: m.DirectChatModal })));
const UserProfileModal = lazy(() => import('./components/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
const CarDetailModal = lazy(() => import('./components/CarDetailModal').then(m => ({ default: m.CarDetailModal })));
const SupportModal = lazy(() => import('./components/SupportModal').then(m => ({ default: m.SupportModal })));

function App() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMyAds, setShowMyAds] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPanelSection, setAdminPanelSection] = useState<'dashboard' | 'users' | 'banned' | 'cars' | 'promo' | 'reports' | 'support' | undefined>(undefined);
  const [showInbox, setShowInbox] = useState(false);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [directChatConversationId, setDirectChatConversationId] = useState<string | null>(null);
  const [directChatOtherUserId, setDirectChatOtherUserId] = useState<string | null>(null);
  const [showCarDetail, setShowCarDetail] = useState(false);
  const [selectedCarForDetail, setSelectedCarForDetail] = useState<Car | null>(null);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const [offersUnreadCount, setOffersUnreadCount] = useState(0);
  const [supportUnreadCount, setSupportUnreadCount] = useState(0);
  const [selectedCarForSwap, setSelectedCarForSwap] = useState<Car | null>(null);
  const [activeTab, setActiveTab] = useState<'cars' | 'offers'>('cars');
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [creditsEnabled, setCreditsEnabled] = useState(true);
  const [premiumEnabled, setPremiumEnabled] = useState(false);
  const [visibleCarsCount, setVisibleCarsCount] = useState(30);
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    brand: '',
    minYear: 1990,
    maxYear: currentYear,
    minPrice: 0,
    maxPrice: 1000000,
    fuelType: '',
    transmission: '',
    onlyDamaged: false,
  });
  const { user, signOut } = useAuth();
  const audioRef = useState<HTMLAudioElement | null>(() => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OKbSw0PUKXh8LhjHQU7k9nx0IEtBSh+zPLaizsKFlm48OihUxIIQ5zd8sFuJAUuhM/z24w4CRxqvvDimUoNDlCl4fC4Yx0FOJHX8s15LAUnfM3y24s5ChVYt+7poFUSCEOb3PLCcSYGMIfP89yOOwoea7/x5JlKDg9Rp+PwtmMcBjiP1vLNeTAGKH3P8tyNOgoWWbjv6aFUEgpFnN7ywm8mBSyEz/PajTkJHGq+8OSaSQ0PUqbh77djHAY3kdbyzngwBSd8zPPajToKFVm48OmhUxIIQpvc8sJyJgYsh9Dz3I05ChxrvvHkmUoOD1Kn4u+5Yx0FM5DW8s94MQUofM3y3Iw6ChdaufDoqFUTCkWd3vPEcycHLoXR8+GOOgsea73y5JtLDg9TqOLvuWQdBjKQ1/HQeTEFJ3vN8tyMOQoWWLfw6KpUEwpGnuDzxXQnCDGG0PPhjjsLHWu+8eSbSw0PVKji77pkHgU0kNfy0HsxBSl7zfLdjDkKFlm48OiqVBMJRp7g88V0Jgcxh9Dz4Y47ChxqvfHlm0oOEFWp4vC7ZR4GM5HY8tF7MQUoe8zy3Iw5CRVauvDqq1UUCkae4PPGdygIMYbR8+KPOwsea77x5ZxLDhBUqeLvumYeBS+Q2PLRfDIFJ3rL8tyMOQkVWbnw66tUEwlFnt/zxnYpCDKH0PPijzwLHmq98uWbSw4QVKni77tlHgYzj9fx0HsxBSh6y/Lbi3oJFlm48OqsVBMKRp7f88Z3Kgkxh9Dz4o88Cx1qvfLlmkoOEFWp4u+7ZR4GM5HX8dJ8MgUmetDy2408CRVYt+/prFUSCUWd3/PGdioIMIbQ8+KPOwscar3y5ZtKDg9VqePwvGUeBTOP1vHSezEFJ3rL8tyOOgkWWrjw6qtVEwpFnd7zxnUpCDGG0PPijzsLHWq98eWcSg4PVKji8LxlHgU0jNbx0HsxBSh6y/Lajj0KFVm5792sVRMLRZze88Z1KgkwhM/y4o87ChxpvPHkmkoOD1Op4vC8ZB4FM4/W8dJ7MQUnetDy2o89ChVZuO/drFYTCkWd3vPGdSkJMYXO8uKOOwscar3y5ZtKDhBUqOLvvGUeBjOP1vHTezIGKHrM8tyNPgoVWbnw6q1WFApGnt/zxnYqCjCGz/LijzoKHGm88uSaSg4QU6ni8LxlHgYykNbx0n0yBSh6y/LcjjwKFVi48OqsVRMKRZzd88V1Kgkwhs/y4o86Ch1pvfLlmkoOEFSp4u+8Zh4FM4/W8dJ9MgUoe8zy24w+ChVaufDqrVUTC0Wc3fPFdisJMIfP8uKPOwscar7x5ZxKDhBUqOLwvGYeBjOP1vLQfTIGKHvM8tyNPwoVWbnw6q5VEwtFnN3zxnYrCjCFz/LijzoLHWq98uWbSw4QVKfi8LxmHgU0j9bx0n4yBil7zPLbjj4JFVq48Oqt');
    return audio;
  })[0];

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('conversation_participants')
      .select(`
        unread_count,
        conversations (
          car_id
        )
      `)
      .eq('user_id', user.id);

    if (data) {
      let inboxTotal = 0;
      let offersTotal = 0;

      data.forEach(p => {
        const hasCarId = p.conversations && (p.conversations as any).car_id;
        if (hasCarId) {
          offersTotal += p.unread_count || 0;
        } else {
          inboxTotal += p.unread_count || 0;
        }
      });

      setInboxUnreadCount(inboxTotal);
      setOffersUnreadCount(offersTotal);
    }
  };

  const fetchSupportUnreadCount = async () => {
    if (!user) {
      setSupportUnreadCount(0);
      return;
    }

    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'open']);

    if (!userProfile?.is_admin && !userProfile?.is_moderator) {
      query = query.eq('user_id', user.id);
    }

    const { count } = await query;
    setSupportUnreadCount(count ?? 0);
  };

  const loadSystemSettings = async () => {
    const { data: creditsData, error: creditsError } = await supabase
      .from('system_settings')
      .select('credits_enabled')
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .maybeSingle();

    if (!creditsError && creditsData) {
      setCreditsEnabled(creditsData.credits_enabled);
    }

    const { data: premiumData, error: premiumError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('id', 'premium_enabled')
      .maybeSingle();

    if (!premiumError && premiumData) {
      setPremiumEnabled(premiumData.value);
    }
  };

  useEffect(() => {
    initializeStorage();
    loadCars();
    loadSystemSettings();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUnreadCount();
      fetchSupportUnreadCount();

      const unreadChannel = supabase
        .channel('unread-count-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversation_participants',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      const messagesChannel = supabase
        .channel('global-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload: any) => {
            if (payload.new && payload.new.receiver_id === user.id && payload.new.sender_id !== user.id) {
              if (audioRef) {
                audioRef.volume = 0.5;
                audioRef.play().catch(err => console.log('Audio play failed:', err));
              }
            }
          }
        )
        .subscribe();

      const supportChannel = supabase
        .channel('support-tickets-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_tickets',
          },
          () => {
            fetchSupportUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(unreadChannel);
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(supportChannel);
      };
    } else {
      setUserProfile(null);
      setInboxUnreadCount(0);
      setOffersUnreadCount(0);
      setSupportUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      fetchSupportUnreadCount();
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
    }
  };

  const loadCars = async () => {
    console.log('loadCars called at:', new Date().toISOString());
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: false });

    console.log('loadCars result:', { error, dataLength: data?.length, timestamp: new Date().toISOString() });
    if (error) {
      console.error('loadCars error details:', error);
    }

    if (!error && data) {
      const carIds = data.map(car => car.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, is_premium, nickname')
        .in('id', carIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const carsWithOwnerInfo = data.map(car => {
        const profile = profileMap.get(car.user_id);
        return {
          ...car,
          owner_is_premium: profile?.is_premium || false,
          owner_nickname: profile?.nickname || null,
        };
      });

      const sortedCars = carsWithOwnerInfo.sort((a, b) => {
        const now = new Date();
        const aIsFeatured = a.is_featured && (!a.featured_until || new Date(a.featured_until) > now);
        const bIsFeatured = b.is_featured && (!b.featured_until || new Date(b.featured_until) > now);

        if (aIsFeatured && !bIsFeatured) return -1;
        if (!aIsFeatured && bIsFeatured) return 1;

        if (aIsFeatured && bIsFeatured) {
          const scoreDiff = (b.priority_score || 0) - (a.priority_score || 0);
          if (scoreDiff !== 0) return scoreDiff;
        }

        if (a.owner_is_premium && !b.owner_is_premium) return -1;
        if (!a.owner_is_premium && b.owner_is_premium) return 1;

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      console.log('Featured cars:', sortedCars.filter(c => c.is_featured).map(c => ({
        id: c.id,
        brand: c.brand,
        model: c.model,
        is_featured: c.is_featured,
        featured_until: c.featured_until,
        priority_score: c.priority_score
      })));

      setCars(sortedCars as Car[]);
    }
    setLoading(false);
  };

  const handleAddCarClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setEditingCar(null);
      setShowAddForm(true);
    }
  };

  const handleOwnerClick = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserProfile(true);
  };

  const handleStartConversation = (userId: string) => {
    setShowUserProfile(false);
    setShowInbox(true);
  };

  const handleCarClick = async (car: Car) => {
    setSelectedCarForDetail(car);
    setShowCarDetail(true);

    if (user) {
      try {
        await supabase.from('car_views').insert({
          car_id: car.id,
          viewer_id: user.id,
          viewed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.log('Failed to track view (non-critical):', error);
      }
    }
  };

  const handleEditCar = (car: Car) => {
    setShowCarDetail(false);
    setEditingCar(car);
    setShowAddForm(true);
  };

  const handleClearFilters = () => {
    setFilters({
      location: '',
      brand: '',
      minYear: 1990,
      maxYear: currentYear,
      minPrice: 0,
      maxPrice: 1000000,
      fuelType: '',
      transmission: '',
      onlyDamaged: false,
    });
  };

  const handleSendMessage = async (userId: string, carId?: string) => {
    if (!user || !userProfile?.is_premium) return;

    setShowCarDetail(false);

    const conversationId = await getOrCreateConversation(user.id, userId, carId);
    if (conversationId) {
      setDirectChatConversationId(conversationId);
      setDirectChatOtherUserId(userId);
      setShowDirectChat(true);
    }
  };

  const handleLogoClick = () => {
    setShowAddForm(false);
    setShowAuthModal(false);
    setShowProfileEdit(false);
    setShowPremiumModal(false);
    setShowMyAds(false);
    setShowAdminPanel(false);
    setAdminPanelSection(undefined);
    setShowInbox(false);
    setShowPromoCode(false);
    setShowBuyCredits(false);
    setShowUserProfile(false);
    setShowSupport(false);
    setShowDirectChat(false);
    setShowCarDetail(false);
    setEditingCar(null);
    setSelectedCarForSwap(null);
    setSelectedCarForDetail(null);
    setActiveTab('cars');
    setSearchQuery('');
    setSelectedVehicleCategory(null);
    setFilters({
      location: '',
      brand: '',
      minYear: 1990,
      maxYear: currentYear,
      minPrice: 0,
      maxPrice: 1000000,
      fuelType: '',
      transmission: '',
      onlyDamaged: false,
    });
  };

  const handleVehicleCategoryClick = (category: string | null) => {
    setSelectedVehicleCategory(category);
    setFilters(prev => ({
      ...prev,
      vehicleType: category || undefined,
    }));
    setVisibleCarsCount(30);

    const resultsElement = document.getElementById('results-section');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    setVisibleCarsCount(30);
  }, [searchQuery, filters]);

  const filteredCars = cars.filter(car => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const fullCarName = `${car.brand} ${car.model}`.toLowerCase();
      const matchesSearch =
        fullCarName.includes(query) ||
        car.brand.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.year.toString().includes(query) ||
        car.fuel_type.toLowerCase().includes(query) ||
        car.color.toLowerCase().includes(query) ||
        car.transmission.toLowerCase().includes(query) ||
        car.price.toString().includes(query) ||
        (car.location && car.location.toLowerCase().includes(query));

      if (!matchesSearch) return false;
    }

    if (filters.vehicleType && car.vehicle_type !== filters.vehicleType) return false;
    if (filters.location && car.location !== filters.location) return false;
    if (filters.brand && car.brand !== filters.brand) return false;
    if (car.year < filters.minYear || car.year > filters.maxYear) return false;
    if (car.price < filters.minPrice || car.price > filters.maxPrice) return false;
    if (filters.fuelType && car.fuel_type !== filters.fuelType) return false;
    if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.onlyDamaged && !car.damaged) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNk0xMiAxNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZNMTIgMzhjMy4zMSAwIDYgMi42OSA2IDZzLTIuNjkgNi02IDYtNi0yLjY5LTYtNiAyLjY5LTYgNi02TTM2IDM4YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

      <div className="relative z-10">
        <nav className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Logo size="md" onClick={handleLogoClick} />

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    {premiumEnabled && !userProfile?.is_premium && (
                      <>
                        <button
                          onClick={() => setShowPromoCode(true)}
                          className="flex items-center gap-2 backdrop-blur-md bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-600 hover:to-emerald-600 border border-green-500/50 text-white px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 font-bold text-sm"
                          title="Iskoristi Promo Kod"
                        >
                          <Gift className="w-5 h-5" />
                          <span>Promo</span>
                        </button>
                        <button
                          onClick={() => setShowPremiumModal(true)}
                          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-500/30 font-semibold text-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Premium
                        </button>
                      </>
                    )}
                    {(userProfile?.is_admin || userProfile?.is_moderator) && (
                      <>
                        <button
                          onClick={() => {
                            setAdminPanelSection(undefined);
                            setShowAdminPanel(true);
                          }}
                          className={`backdrop-blur-md ${
                            userProfile?.is_admin
                              ? 'bg-red-600/80 hover:bg-red-600 border-red-500/50'
                              : 'bg-blue-600/80 hover:bg-blue-600 border-blue-500/50'
                          } border text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105`}
                          title={userProfile?.is_admin ? 'Admin Panel' : 'Moderator Panel'}
                        >
                          {userProfile?.is_admin ? <Shield className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowMyAds(true)}
                      className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                      title="Moji Oglasi"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowInbox(true)}
                      className="relative backdrop-blur-md bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-600 border border-cyan-500/50 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                      title="Ponude za zamjenu"
                    >
                      <ArrowRightLeft className="w-5 h-5" />
                      {offersUnreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {offersUnreadCount > 9 ? '9+' : offersUnreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={signOut}
                      className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                      title="Odjavi se"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowProfileEdit(true)}
                      className="backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-xl transition-all duration-300 hover:scale-105"
                      title="Profil"
                    >
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full ${
                          userProfile?.gender === 'female'
                            ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                            : userProfile?.gender === 'male'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                        } flex items-center justify-center`}>
                          {userProfile?.gender === 'female' ? (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 8a3 3 0 113-3 3 3 0 01-3 3zM12 11c-4.42 0-8 2.69-8 6v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-3.31-3.58-6-8-6z"/>
                            </svg>
                          ) : userProfile?.gender === 'male' ? (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 8a3 3 0 113-3 3 3 0 01-3 3zM12 11c-4.42 0-8 2.69-8 6v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-3.31-3.58-6-8-6z"/>
                            </svg>
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Prijavi se</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <header className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            {premiumEnabled && (
              <div className="flex justify-center gap-4 mb-8 flex-wrap">
                <button
                  onClick={() => user ? setShowPremiumModal(true) : setShowAuthModal(true)}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <Sparkles className="w-6 h-6 relative z-10" />
                  <span className="relative z-10 text-lg">Postani Premium</span>
                </button>

                {creditsEnabled && (
                  <button
                    onClick={() => user ? setShowBuyCredits(true) : setShowAuthModal(true)}
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <Coins className="w-6 h-6 relative z-10" />
                    <span className="relative z-10 text-lg">Kupi Kredite</span>
                  </button>
                )}

                <button
                  onClick={() => user ? setShowPromoCode(true) : setShowAuthModal(true)}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <Gift className="w-6 h-6 relative z-10" />
                  <span className="relative z-10 text-lg">Iskoristi kredit code</span>
                </button>
              </div>
            )}

            <div className="inline-flex items-center gap-2 backdrop-blur-md bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 px-4 py-2 rounded-full mb-8 animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Nova era trgovine vozilima</span>
            </div>

            <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Zamijeni svoje vozilo
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent">
                bez komplikacija
              </span>
            </h2>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Najbolja platforma za direktnu zamjenu vozila. Pronađi savršenu zamjenu,
              pregovaraj direktno i ostvari bolji deal nego ikad prije.
            </p>

            <button
              onClick={handleAddCarClick}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-5 px-10 rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <Plus className="w-6 h-6 relative z-10" />
              <span className="relative z-10 text-lg">Dodaj svoje vozilo</span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex gap-4 items-start">
              <SearchWithAutocomplete
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                cars={cars}
              />
              <AdvancedFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="inline-flex backdrop-blur-md bg-white/5 border border-white/10 p-1.5 rounded-2xl gap-2">
              <button
                onClick={() => {
                  setActiveTab('cars');
                  setSelectedVehicleCategory(null);
                  setFilters(prev => ({ ...prev, vehicleType: undefined }));
                }}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'cars'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Vozila
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'offers'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Ponude za zamjenu
              </button>
            </div>
          </div>

          {activeTab === 'cars' && (
            <div className="flex justify-center mt-6">
              <div className="inline-flex flex-wrap backdrop-blur-md bg-white/5 border border-white/10 p-2 rounded-2xl gap-2 max-w-4xl">
                <button
                  onClick={() => handleVehicleCategoryClick(null)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedVehicleCategory === null
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Sve kategorije
                </button>
                <button
                  onClick={() => handleVehicleCategoryClick('automobil')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedVehicleCategory === 'automobil'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <CarIcon className="w-5 h-5" />
                  Automobili
                </button>
                <button
                  onClick={() => handleVehicleCategoryClick('motocikl')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedVehicleCategory === 'motocikl'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                  Motocikli
                </button>
                <button
                  onClick={() => handleVehicleCategoryClick('quad')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedVehicleCategory === 'quad'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                  Quad
                </button>
                <button
                  onClick={() => handleVehicleCategoryClick('motorne_sanke')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedVehicleCategory === 'motorne_sanke'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Ship className="w-5 h-5" />
                  Motorne Sanke
                </button>
                <button
                  onClick={() => handleVehicleCategoryClick('jetski')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedVehicleCategory === 'jetski'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Waves className="w-5 h-5" />
                  Jetski
                </button>
              </div>
            </div>
          )}
        </div>

        <div id="results-section" className="max-w-7xl mx-auto px-4 pb-20">
          {activeTab === 'cars' ? (
            <>
              {loading ? (
                <div className="text-center py-32">
                  <div className="inline-block relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-500"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-cyan-500/20"></div>
                  </div>
                  <p className="mt-6 text-gray-300 font-medium">Učitavanje vozila...</p>
                </div>
              ) : filteredCars.length === 0 ? (
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                    <CarIcon className="relative w-24 h-24 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">
                    {searchQuery ? 'Nema rezultata' : 'Nema dostupnih vozila'}
                  </h3>
                  <p className="text-gray-400 text-lg">
                    {searchQuery ? 'Pokušajte sa drugom pretragom' : 'Budi prvi koji će dodati vozilo za zamjenu!'}
                  </p>
                </div>
              ) : searchQuery.trim() ? (
                <div className="max-w-4xl mx-auto">
                  <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white">
                      Rezultati pretrage: <span className="text-cyan-400">{searchQuery}</span>
                    </h2>
                    <p className="text-gray-400 mt-2">
                      Pronađeno {filteredCars.length} {filteredCars.length === 1 ? 'vozilo' : filteredCars.length < 5 ? 'vozila' : 'vozila'}
                    </p>
                  </div>

                  {(() => {
                    const now = new Date();
                    const featuredCars = filteredCars.filter(car =>
                      car.is_featured && (!car.featured_until || new Date(car.featured_until) > now)
                    );
                    return premiumEnabled && featuredCars.length > 0 && (
                      <div className="mb-8">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl blur-2xl"></div>
                          <div className="relative backdrop-blur-md bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-orange-500/40 rounded-2xl p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Zap className="w-6 h-6 text-orange-400 animate-pulse" />
                              <h3 className="text-2xl font-black bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                                Istaknuti Oglasi
                              </h3>
                              <Zap className="w-6 h-6 text-orange-400 animate-pulse" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {featuredCars.map((car) => (
                            <CarCard
                              key={car.id}
                              car={car}
                              onSwapOffer={setSelectedCarForSwap}
                              isPremiumUser={userProfile?.is_premium || false}
                              currentUserId={user?.id}
                              onOwnerClick={handleOwnerClick}
                              onCardClick={handleCarClick}
                              layout="list"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const now = new Date();
                    const premiumCars = filteredCars.filter(car => {
                      const isFeatured = car.is_featured && (!car.featured_until || new Date(car.featured_until) > now);
                      return !isFeatured && car.owner_is_premium;
                    });
                    return premiumEnabled && premiumCars.length > 0 && (
                      <div className="mb-8">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-2xl blur-2xl"></div>
                          <div className="relative backdrop-blur-md bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                              <h3 className="text-2xl font-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                                Premium Oglasi
                              </h3>
                              <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {premiumCars.map((car) => (
                            <CarCard
                              key={car.id}
                              car={car}
                              onSwapOffer={setSelectedCarForSwap}
                              isPremiumUser={userProfile?.is_premium || false}
                              currentUserId={user?.id}
                              onOwnerClick={handleOwnerClick}
                              onCardClick={handleCarClick}
                              layout="list"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const now = new Date();
                    const regularCars = premiumEnabled
                      ? filteredCars.filter(car => {
                          const isFeatured = car.is_featured && (!car.featured_until || new Date(car.featured_until) > now);
                          return !isFeatured && !car.owner_is_premium;
                        })
                      : filteredCars;

                    const visibleRegularCars = regularCars.slice(0, visibleCarsCount);
                    const hasMoreCars = regularCars.length > visibleCarsCount;

                    return regularCars.length > 0 && (
                      <div>
                        <div className="mb-6">
                          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4">
                            <h3 className="text-xl font-bold text-white text-center">
                              Svi Oglasi
                            </h3>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {visibleRegularCars.map((car) => (
                            <CarCard
                              key={car.id}
                              car={car}
                              onSwapOffer={setSelectedCarForSwap}
                              isPremiumUser={userProfile?.is_premium || false}
                              currentUserId={user?.id}
                              onOwnerClick={handleOwnerClick}
                              onCardClick={handleCarClick}
                              layout="list"
                            />
                          ))}
                        </div>
                        {hasMoreCars && (
                          <div className="mt-6 text-center">
                            <button
                              onClick={() => setVisibleCarsCount(prev => prev + 30)}
                              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
                            >
                              Učitaj još
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <>
                  {(() => {
                    const now = new Date();
                    const featuredCars = filteredCars.filter(car =>
                      car.is_featured && (!car.featured_until || new Date(car.featured_until) > now)
                    );
                    return premiumEnabled && featuredCars.length > 0 && (
                      <div className="mb-16">
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-3xl blur-3xl"></div>
                          <div className="relative backdrop-blur-md bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-orange-500/40 rounded-3xl p-6">
                            <div className="flex items-center justify-center gap-3">
                              <Zap className="w-8 h-8 text-orange-400 animate-pulse" />
                              <h2 className="text-4xl font-black bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                                Istaknuti Oglasi
                              </h2>
                              <Zap className="w-8 h-8 text-orange-400 animate-pulse" />
                            </div>
                            <p className="text-center text-orange-200/80 mt-2 font-medium">
                              Super istakni svoj oglas i dobij do 10x više pregleda
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                          {featuredCars.map((car) => (
                            <CarCard
                              key={car.id}
                              car={car}
                              onSwapOffer={setSelectedCarForSwap}
                              isPremiumUser={userProfile?.is_premium || false}
                              currentUserId={user?.id}
                              onOwnerClick={handleOwnerClick}
                              onCardClick={handleCarClick}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const now = new Date();
                    const premiumCars = filteredCars.filter(car => {
                      const isFeatured = car.is_featured && (!car.featured_until || new Date(car.featured_until) > now);
                      return !isFeatured && car.owner_is_premium;
                    });
                    return premiumEnabled && premiumCars.length > 0 && (
                      <div className="mb-16">
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 rounded-3xl blur-3xl"></div>
                          <div className="relative backdrop-blur-md bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 border-2 border-yellow-500/30 rounded-3xl p-6">
                            <div className="flex items-center justify-center gap-3">
                              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                              <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                                Premium Oglasi
                              </h2>
                              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                            </div>
                            <p className="text-center text-yellow-200/80 mt-2 font-medium">
                              Oglasi premium korisnika dobijaju više pregleda
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                          {premiumCars.map((car) => (
                            <CarCard
                              key={car.id}
                              car={car}
                              onSwapOffer={setSelectedCarForSwap}
                              isPremiumUser={userProfile?.is_premium || false}
                              currentUserId={user?.id}
                              onOwnerClick={handleOwnerClick}
                              onCardClick={handleCarClick}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const now = new Date();
                    const regularCars = premiumEnabled
                      ? filteredCars.filter(car => {
                          const isFeatured = car.is_featured && (!car.featured_until || new Date(car.featured_until) > now);
                          return !isFeatured && !car.owner_is_premium;
                        })
                      : filteredCars;

                    const visibleRegularCars = regularCars.slice(0, visibleCarsCount);
                    const hasMoreCars = regularCars.length > visibleCarsCount;

                    return regularCars.length > 0 && (
                      <div>
                        <div className="mb-8">
                          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5">
                            <h2 className="text-3xl font-bold text-white text-center">
                              Svi Oglasi
                            </h2>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                          {visibleRegularCars.map((car) => (
                            <CarCard
                              key={car.id}
                              car={car}
                              onSwapOffer={setSelectedCarForSwap}
                              isPremiumUser={userProfile?.is_premium || false}
                              currentUserId={user?.id}
                              onOwnerClick={handleOwnerClick}
                              onCardClick={handleCarClick}
                            />
                          ))}
                        </div>
                        {hasMoreCars && (
                          <div className="mt-8 text-center">
                            <button
                              onClick={() => setVisibleCarsCount(prev => prev + 30)}
                              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors"
                            >
                              Učitaj još
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}
            </>
          ) : (
            <Suspense fallback={<div className="text-center py-32"><div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-500"></div></div>}>
              <SwapOffersPanel
                onAcceptOffer={(conversationId, otherUserId) => {
                  setDirectChatConversationId(conversationId);
                  setDirectChatOtherUserId(otherUserId);
                  setShowDirectChat(true);
                }}
                onSwapOffer={(car) => {
                  setSelectedCarForSwap(car);
                }}
                onOwnerClick={handleOwnerClick}
                onSendMessage={handleSendMessage}
                isPremiumUser={userProfile?.is_premium || false}
              />
            </Suspense>
          )}
        </div>

        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-500"></div></div>}>
          {showAddForm && (
            <AddCarFormMultiStep
              onClose={() => {
                setShowAddForm(false);
                setEditingCar(null);
              }}
              onSuccess={() => {
                loadCars();
                setEditingCar(null);
              }}
              editMode={!!editingCar}
              carToEdit={editingCar || undefined}
              premiumEnabled={premiumEnabled}
            />
          )}

          {selectedCarForSwap && (
            <SwapOfferModal
              targetCar={selectedCarForSwap}
              onClose={() => setSelectedCarForSwap(null)}
              onSuccess={() => {
                loadCars();
                setActiveTab('offers');
              }}
              premiumEnabled={premiumEnabled}
            />
          )}

          {showAuthModal && (
            <AuthModal
              onClose={() => setShowAuthModal(false)}
            />
          )}

          {showProfileEdit && (
            <ProfileEditModal
              onClose={() => setShowProfileEdit(false)}
              onSuccess={fetchUserProfile}
              currentProfile={userProfile}
            />
          )}

          {showPremiumModal && (
            <PremiumModal
              onClose={() => setShowPremiumModal(false)}
              onSuccess={fetchUserProfile}
            />
          )}

          {showMyAds && user && (
            <MyAdsModal
              onClose={() => {
                setShowMyAds(false);
                loadCars();
              }}
              userId={user.id}
              onCarUpdated={loadCars}
              premiumEnabled={premiumEnabled}
            />
          )}

          {showAdminPanel && (userProfile?.is_admin || userProfile?.is_moderator) && (
            <div className="fixed inset-0 z-50 bg-gray-50">
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => {
                    setShowAdminPanel(false);
                    setAdminPanelSection(undefined);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-lg"
                >
                  <span className="text-gray-700">Zatvori {userProfile?.is_admin ? 'Admin' : 'Moderator'} Panel</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AdminDashboard initialSection={adminPanelSection} />
            </div>
          )}

          {showInbox && user && (
            <MessagingCenterModal
              onClose={() => {
                setShowInbox(false);
                fetchUnreadCount();
              }}
              onViewSwapOffer={(offerId) => {
                setShowInbox(false);
                setActiveTab('offers');
                setTimeout(() => {
                  document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              onSwapOffer={(car) => {
                setShowInbox(false);
                setSelectedCarForSwap(car);
              }}
              onOwnerClick={(userId) => {
                setShowInbox(false);
                handleOwnerClick(userId);
              }}
              onSendMessage={handleSendMessage}
              isPremiumUser={userProfile?.is_premium || false}
            />
          )}

          {showDirectChat && directChatConversationId && directChatOtherUserId && (
            <DirectChatModal
              conversationId={directChatConversationId}
              otherUserId={directChatOtherUserId}
              onClose={() => {
                setShowDirectChat(false);
                setDirectChatConversationId(null);
                setDirectChatOtherUserId(null);
              }}
            />
          )}

          {showPromoCode && (
            <PromoCodeModal
              onClose={() => setShowPromoCode(false)}
              onSuccess={fetchUserProfile}
            />
          )}

          {showBuyCredits && (
            <BuyCreditsModal
              onClose={() => setShowBuyCredits(false)}
              onSuccess={fetchUserProfile}
            />
          )}

          {showUserProfile && selectedUserId && (
            <UserProfileModal
              userId={selectedUserId}
              onClose={() => {
                setShowUserProfile(false);
                setSelectedUserId(null);
              }}
              onStartConversation={handleStartConversation}
            />
          )}

          {showCarDetail && selectedCarForDetail && (
            <CarDetailModal
              car={selectedCarForDetail}
              onClose={() => {
                setShowCarDetail(false);
                setSelectedCarForDetail(null);
              }}
              onSwapOffer={(car) => {
                setShowCarDetail(false);
                setSelectedCarForSwap(car);
              }}
              onOwnerClick={(userId) => {
                setShowCarDetail(false);
                handleOwnerClick(userId);
              }}
              onSendMessage={handleSendMessage}
              onEdit={handleEditCar}
              isPremiumUser={userProfile?.is_premium || false}
            />
          )}

          {showSupport && user && userProfile && (
            <SupportModal
              isOpen={showSupport}
              onClose={() => setShowSupport(false)}
              userId={user.id}
              userProfile={userProfile}
            />
          )}
        </Suspense>

        <footer className="border-t border-white/10 backdrop-blur-md bg-white/5 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              {user && (
                <button
                  onClick={() => {
                    if (userProfile?.is_admin || userProfile?.is_moderator) {
                      setAdminPanelSection('support');
                      setShowAdminPanel(true);
                    } else {
                      setShowSupport(true);
                    }
                  }}
                  className="relative backdrop-blur-md bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-500 hover:to-emerald-600 border border-green-500/50 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Headset className="w-5 h-5" />
                  <span>Podrška korisnicima</span>
                  {supportUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {supportUnreadCount > 9 ? '9+' : supportUnreadCount}
                    </span>
                  )}
                </button>
              )}
              <div className="flex items-center justify-center flex-1">
                <Logo size="md" />
              </div>
              <div className="w-[200px]"></div>
            </div>
            <p className="text-gray-400 text-center">autozamjena.ba © 2026 - Najbolja platforma za zamjenu vozila u BiH</p>
            <p className="text-sm text-gray-500 mt-2 text-center">Brzo. Sigurno. Jednostavno.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
