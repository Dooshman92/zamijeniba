import { useEffect, useState } from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info, AlertTriangle, Megaphone, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
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

interface NotificationsPanelProps {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    // Fetch notifications with read status
    const { data, error } = await supabase
      .from('system_notifications')
      .select(`
        *,
        notification_read_status!left(read_at)
      `)
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      // Map the data to include is_read based on notification_read_status
      const notificationsWithReadStatus = (data || []).map(notification => {
        const readStatus = Array.isArray(notification.notification_read_status)
          ? notification.notification_read_status[0]
          : notification.notification_read_status;

        return {
          ...notification,
          is_read: !!readStatus?.read_at
        };
      });
      setNotifications(notificationsWithReadStatus);
    }
    setLoading(false);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('system_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    // Insert into notification_read_status to mark as read
    const { error } = await supabase
      .from('notification_read_status')
      .insert({
        notification_id: notificationId,
        user_id: user.id
      });

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } else {
      // If error is duplicate key (already marked as read), just update UI
      if (error.code === '23505') {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
      }
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const unreadNotifications = notifications.filter(n => !n.is_read);

    if (unreadNotifications.length === 0) return;

    // Insert read status for all unread notifications
    const readStatusRecords = unreadNotifications.map(n => ({
      notification_id: n.id,
      user_id: user.id
    }));

    const { error } = await supabase
      .from('notification_read_status')
      .insert(readStatusRecords);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } else {
      // Even if there's an error (e.g., some already marked), update UI
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from('system_notifications')
      .delete()
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-purple-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    const opacity = isRead ? 'bg-opacity-5' : 'bg-opacity-10';
    switch (type) {
      case 'success':
        return `bg-green-500 ${opacity}`;
      case 'error':
        return `bg-red-500 ${opacity}`;
      case 'warning':
        return `bg-yellow-500 ${opacity}`;
      case 'announcement':
        return `bg-purple-500 ${opacity}`;
      default:
        return `bg-blue-500 ${opacity}`;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Obavještenja</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Označi sve kao pročitano
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              Učitavanje obavještenja...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nemate novih obavještenja</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${getNotificationBgColor(notification.type, notification.is_read)} rounded-xl p-4 border ${
                    notification.is_read ? 'border-gray-700' : 'border-cyan-500/30'
                  } transition-all hover:scale-[1.02]`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold ${
                          notification.is_read ? 'text-gray-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Obriši obavještenje"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-sm mt-1 ${
                        notification.is_read ? 'text-gray-400' : 'text-gray-300'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDateTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            Označi kao pročitano
                          </button>
                        )}
                      </div>
                      {notification.user_id === null && (
                        <div className="mt-2">
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            Globalna poruka
                          </span>
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
    </div>
  );
}