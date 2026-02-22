import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogIn, LogOut, User, Settings, MessageCircle, ArrowRightLeft, Bell, Shield, Headset } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Logo } from './Logo';

interface NavigationProps {
  onAddCarClick: () => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onMessagesClick: () => void;
  onOffersClick: () => void;
  onNotificationsClick: () => void;
  onAdminClick?: () => void;
  onSupportClick: () => void;
  unreadCount?: number;
  isAdmin?: boolean;
}

export function Navigation({
  onAddCarClick,
  onLoginClick,
  onProfileClick,
  onMessagesClick,
  onOffersClick,
  onNotificationsClick,
  onAdminClick,
  onSupportClick,
  unreadCount = 0,
  isAdmin = false
}: NavigationProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/90 border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo size="sm" />
            <span className="text-xl font-black text-white hidden sm:block">Swap Vozila</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={onAddCarClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Dodaj oglas</span>
                </button>

                <button
                  onClick={onMessagesClick}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  title="Poruke"
                >
                  <MessageCircle className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={onOffersClick}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  title="Ponude"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={onNotificationsClick}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  title="Obavještenja"
                >
                  <Bell className="w-5 h-5" />
                </button>

                <button
                  onClick={onSupportClick}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  title="Podrška"
                >
                  <Headset className="w-5 h-5" />
                </button>

                {isAdmin && onAdminClick && (
                  <button
                    onClick={onAdminClick}
                    className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-slate-800/50 rounded-lg transition-all"
                    title="Admin Panel"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={onProfileClick}
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
                  title="Profil"
                >
                  <User className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
                  title="Odjavi se"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Prijavi se</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
