import { X, Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Megaphone } from 'lucide-react';
import { formatDateTime } from '../lib/dateUtils';

interface SystemNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'announcement';
  is_read: boolean;
  sent_by_admin_id: string | null;
  created_at: string;
  expires_at: string | null;
}

interface NotificationDetailModalProps {
  notification: SystemNotification;
  onClose: () => void;
  onMarkAsRead?: () => void;
}

export function NotificationDetailModal({ notification, onClose, onMarkAsRead }: NotificationDetailModalProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
      case 'announcement':
        return <Megaphone className="w-12 h-12 text-purple-400" />;
      default:
        return <Info className="w-12 h-12 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'announcement':
        return 'text-purple-400';
      default:
        return 'text-blue-400';
    }
  };

  const getNotificationBgGradient = (type: string) => {
    switch (type) {
      case 'success':
        return 'from-green-500/10 to-green-500/5';
      case 'error':
        return 'from-red-500/10 to-red-500/5';
      case 'warning':
        return 'from-yellow-500/10 to-yellow-500/5';
      case 'announcement':
        return 'from-purple-500/10 to-purple-500/5';
      default:
        return 'from-blue-500/10 to-blue-500/5';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'success':
        return 'Uspjeh';
      case 'error':
        return 'Greška';
      case 'warning':
        return 'Upozorenje';
      case 'announcement':
        return 'Najava';
      default:
        return 'Informacija';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Detalji Obavještenja</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className={`bg-gradient-to-br ${getNotificationBgGradient(notification.type)} rounded-2xl p-8 border border-gray-700`}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-4">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="mb-2">
                <span className={`text-sm font-semibold ${getNotificationColor(notification.type)} px-3 py-1 rounded-full bg-gray-900/50`}>
                  {getTypeLabel(notification.type)}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                {notification.title}
              </h3>

              <div className="w-full max-w-xl">
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-700/50 pt-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900/30 rounded-lg p-3">
                  <span className="text-gray-400 block mb-1">Vrijeme slanja:</span>
                  <span className="text-white font-medium">{formatDateTime(notification.created_at)}</span>
                </div>

                {notification.expires_at && (
                  <div className="bg-gray-900/30 rounded-lg p-3">
                    <span className="text-gray-400 block mb-1">Ističe:</span>
                    <span className="text-white font-medium">{formatDateTime(notification.expires_at)}</span>
                  </div>
                )}

                {notification.user_id === null && (
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <span className="text-gray-400 block mb-1">Tip poruke:</span>
                    <span className="text-purple-300 font-medium">Globalna poruka</span>
                  </div>
                )}

                <div className="bg-gray-900/30 rounded-lg p-3">
                  <span className="text-gray-400 block mb-1">Status:</span>
                  <span className={`font-medium ${notification.is_read ? 'text-gray-400' : 'text-cyan-400'}`}>
                    {notification.is_read ? 'Pročitano' : 'Nepročitano'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            {!notification.is_read && onMarkAsRead && (
              <button
                onClick={() => {
                  onMarkAsRead();
                  onClose();
                }}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                Označi kao pročitano
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Zatvori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
