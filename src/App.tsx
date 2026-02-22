import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase, UserProfile } from './lib/supabase';
import { useAuth } from './lib/auth';
import { initializeStorage } from './lib/storage';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { VehiclesPage } from './pages/VehiclesPage';
import { CarDetailPage } from './pages/CarDetailPage';

const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const AddCarFormMultiStep = lazy(() => import('./components/AddCarFormMultiStep').then(m => ({ default: m.AddCarFormMultiStep })));
const ProfileEditModal = lazy(() => import('./components/ProfileEditModal').then(m => ({ default: m.ProfileEditModal })));
const MessagingCenterModal = lazy(() => import('./components/MessagingCenterModal').then(m => ({ default: m.MessagingCenterModal })));
const SwapOffersPanel = lazy(() => import('./components/SwapOffersPanel').then(m => ({ default: m.SwapOffersPanel })));
const NotificationsPanel = lazy(() => import('./components/NotificationsPanel').then(m => ({ default: m.NotificationsPanel })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SupportModal = lazy(() => import('./components/SupportModal').then(m => ({ default: m.SupportModal })));
const MyAdsModal = lazy(() => import('./components/MyAdsModal').then(m => ({ default: m.MyAdsModal })));

function AppContent() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showMyAds, setShowMyAds] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    initializeStorage();
    if (user) {
      loadUserProfile();
      fetchUnreadCount();
    }
  }, [user]);

  const loadUserProfile = async () => {
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

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('messages')
      .select('id')
      .eq('recipient_id', user.id)
      .eq('read', false);

    if (data) {
      setUnreadCount(data.length);
    }
  };

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || userProfile?.role === 'moderator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation
        onAddCarClick={() => user ? setShowAddForm(true) : setShowAuthModal(true)}
        onLoginClick={() => setShowAuthModal(true)}
        onProfileClick={() => setShowProfileEdit(true)}
        onMessagesClick={() => setShowInbox(true)}
        onOffersClick={() => setShowOffers(true)}
        onNotificationsClick={() => setShowNotifications(true)}
        onAdminClick={isAdmin ? () => setShowAdminPanel(true) : undefined}
        onSupportClick={() => setShowSupport(true)}
        unreadCount={unreadCount}
        isAdmin={isAdmin}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/vehicle/:id" element={<CarDetailPage />} />
      </Routes>

      {/* Modals */}
      <Suspense fallback={null}>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
              loadUserProfile();
            }}
          />
        )}

        {showAddForm && (
          <AddCarFormMultiStep
            car={null}
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              window.location.reload();
            }}
            isPremiumUser={userProfile?.is_premium || false}
          />
        )}

        {showProfileEdit && (
          <ProfileEditModal
            onClose={() => setShowProfileEdit(false)}
            onShowMyAds={() => {
              setShowProfileEdit(false);
              setShowMyAds(true);
            }}
          />
        )}

        {showMyAds && (
          <MyAdsModal
            onClose={() => setShowMyAds(false)}
            onEdit={() => {}}
          />
        )}

        {showInbox && (
          <MessagingCenterModal
            onClose={() => {
              setShowInbox(false);
              fetchUnreadCount();
            }}
            onConversationUpdate={() => fetchUnreadCount()}
          />
        )}

        {showOffers && (
          <SwapOffersPanel
            onClose={() => setShowOffers(false)}
          />
        )}

        {showNotifications && (
          <NotificationsPanel
            onClose={() => setShowNotifications(false)}
          />
        )}

        {showAdminPanel && isAdmin && (
          <AdminDashboard
            onClose={() => setShowAdminPanel(false)}
            initialSection={undefined}
          />
        )}

        {showSupport && (
          <SupportModal
            onClose={() => setShowSupport(false)}
          />
        )}
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
