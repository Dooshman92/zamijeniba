import { useState, useEffect } from 'react';
import { Bell, Send, Trash2, Users, User, AlertCircle, CheckCircle, Info, AlertTriangle, Megaphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SystemNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'announcement';
  is_read: boolean;
  created_at: string;
  expires_at: string | null;
}

export function NotificationsAdminPanel() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error' | 'announcement'>('info');
  const [isGlobal, setIsGlobal] = useState(true);
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications();
    subscribeToChanges();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('system_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('admin_notifications_changes')
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

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Unesite naslov i poruku');
      return;
    }

    setSending(true);

    let userId: string | null = null;

    if (!isGlobal && targetUserEmail.trim()) {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', targetUserEmail.trim())
        .maybeSingle();

      if (profileError || !profileData) {
        alert('Korisnik sa datim email-om ne postoji');
        setSending(false);
        return;
      }

      userId = profileData.id;
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase.from('system_notifications').insert({
      user_id: isGlobal ? null : userId,
      title: title.trim(),
      message: message.trim(),
      type,
      expires_at: expiresAt,
    });

    if (error) {
      console.error('Error sending notification:', error);
      alert('Greška pri slanju obavještenja');
    } else {
      alert('Obavještenje uspješno poslato!');
      setTitle('');
      setMessage('');
      setType('info');
      setIsGlobal(true);
      setTargetUserEmail('');
      setExpiresInDays(null);
    }

    setSending(false);
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovo obavještenje?')) return;

    const { error } = await supabase
      .from('system_notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      alert('Greška pri brisanju obavještenja');
    }
  };

  const getTypeIcon = (notifType: string) => {
    switch (notifType) {
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-white">Pošalji Obavještenje</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tip Obavještenja
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="info">Informacija</option>
              <option value="success">Uspjeh</option>
              <option value="warning">Upozorenje</option>
              <option value="error">Greška</option>
              <option value="announcement">Najava</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Naslov
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Unesite naslov obavještenja"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Poruka
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Unesite sadržaj obavještenja"
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={isGlobal}
                onChange={(e) => setIsGlobal(e.target.checked)}
                className="w-4 h-4"
              />
              <Users className="w-4 h-4" />
              <span>Globalno obavještenje (za sve korisnike)</span>
            </label>
          </div>

          {!isGlobal && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Email Korisnika
              </label>
              <input
                type="email"
                value={targetUserEmail}
                onChange={(e) => setTargetUserEmail(e.target.value)}
                placeholder="Unesite email korisnika"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ističe za (dana)
            </label>
            <input
              type="number"
              value={expiresInDays || ''}
              onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Ostavi prazno ako ne ističe"
              min="1"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
            />
          </div>

          <button
            onClick={handleSendNotification}
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Šalje se...' : 'Pošalji Obavještenje'}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 border border-gray-600">
        <h3 className="text-xl font-bold text-white mb-4">
          Poslata Obavještenja ({notifications.length})
        </h3>

        {loading ? (
          <div className="text-center text-gray-400 py-8">
            Učitavanje...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            Nema poslatih obavještenja
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString('bs-BA')}
                          </span>
                          {notification.user_id === null ? (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                              <Users className="w-3 h-3 inline mr-1" />
                              Globalno
                            </span>
                          ) : (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                              <User className="w-3 h-3 inline mr-1" />
                              Pojedinačno
                            </span>
                          )}
                          {notification.expires_at && (
                            <span className="text-xs text-yellow-400">
                              Ističe: {new Date(notification.expires_at).toLocaleDateString('bs-BA')}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                        title="Obriši"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}