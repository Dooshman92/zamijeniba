import { useEffect, useState, useRef } from 'react';
import { X, Send, User, Phone, Mail } from 'lucide-react';
import { supabase, Message, UserProfile } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface DirectChatModalProps {
  conversationId: string;
  otherUserId: string;
  onClose: () => void;
  embedded?: boolean;
}

export function DirectChatModal({ conversationId, otherUserId, onClose, embedded = false }: DirectChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwapAccepted, setIsSwapAccepted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadOtherUserProfile();
    loadMessages();
    checkSwapStatus();
    const cleanup = subscribeToMessages();
    return cleanup;
  }, [conversationId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkSwapStatus = async () => {
    if (!user) return;

    const { data: conversation } = await supabase
      .from('conversations')
      .select('car_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conversation?.car_id) return;

    const { data: swapOffers } = await supabase
      .from('swap_offers')
      .select('status, offered_car_id')
      .eq('car_id', conversation.car_id);

    if (!swapOffers || swapOffers.length === 0) return;

    for (const offer of swapOffers) {
      const { data: offeredCar } = await supabase
        .from('cars')
        .select('user_id')
        .eq('id', offer.offered_car_id)
        .maybeSingle();

      if (offeredCar?.user_id === otherUserId && offer.status === 'accepted') {
        setIsSwapAccepted(true);
        break;
      }
    }
  };

  const loadOtherUserProfile = async () => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-profile-by-id`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: otherUserId }),
      });

      if (response.ok) {
        const profile = await response.json();
        setOtherUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
    } else if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: otherUserId,
      content: newMessage.trim(),
      message_type: 'text',
    });

    if (error) {
      console.error('Error sending message:', error);
      alert('Greška pri slanju poruke');
    } else {
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    const loadingContent = (
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500/30 border-t-cyan-500"></div>
          <p className="text-gray-300">Učitavanje chata...</p>
        </div>
      </div>
    );

    if (embedded) {
      return <div className="flex items-center justify-center h-full">{loadingContent}</div>;
    }

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
        {loadingContent}
      </div>
    );
  }

  const chatContent = (
    <div className="backdrop-blur-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-3xl w-full h-full flex flex-col shadow-2xl">
        <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
          {!embedded && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110 group"
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </button>
          )}

          {otherUserProfile && (
            <div className="flex items-center gap-4">
              <div className="relative">
                {otherUserProfile.avatar_url ? (
                  <img
                    src={otherUserProfile.avatar_url}
                    alt={otherUserProfile.nickname || 'User'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">
                  {otherUserProfile.nickname || 'Korisnik'}
                </h2>
                {isSwapAccepted && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {otherUserProfile.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="w-4 h-4 text-cyan-400" />
                        <span>{otherUserProfile.email}</span>
                      </div>
                    )}
                    {otherUserProfile.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Phone className="w-4 h-4 text-green-400" />
                        <a href={`tel:${otherUserProfile.phone}`} className="hover:text-white transition-colors">
                          {otherUserProfile.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=100')] bg-opacity-5">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Send className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-400 text-lg">Počnite razgovor</p>
                <p className="text-gray-500 text-sm mt-2">Pošaljite prvu poruku</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isMyMessage
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-sm'
                        : 'bg-white/10 backdrop-blur-md text-gray-100 border border-white/10 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMyMessage ? 'text-cyan-100' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Napišite poruku..."
              rows={1}
              className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
              style={{ minHeight: '50px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-cyan-500/30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Pritisnite Enter za slanje • Shift + Enter za novi red
          </p>
        </div>
    </div>
  );

  if (embedded) {
    return chatContent;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full h-[85vh]">
        {chatContent}
      </div>
    </div>
  );
}
