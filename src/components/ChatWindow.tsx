import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, Send, User, ExternalLink, ArrowRightLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Car } from '../lib/supabase';
import { CarDetailModal } from './CarDetailModal';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: string;
  swap_offer_id?: string;
}

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
  onClose: () => void;
  onViewSwapOffer?: (offerId: string) => void;
}

export function ChatWindow({ conversationId, onBack, onClose, onViewSwapOffer }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; avatar: string | null } | null>(null);
  const [carInfo, setCarInfo] = useState<{ brand: string; model: string; year: number; id: string } | null>(null);
  const [fullCarData, setFullCarData] = useState<Car | null>(null);
  const [showCarDetail, setShowCarDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OKbSw0PUKXh8LhjHQU7k9nx0IEtBSh+zPLaizsKFlm48OihUxIIQ5zd8sFuJAUuhM/z24w4CRxqvvDimUoNDlCl4fC4Yx0FOJHX8s15LAUnfM3y24s5ChVYt+7poFUSCEOb3PLCcSYGMIfP89yOOwoea7/x5JlKDg9Rp+PwtmMcBjiP1vLNeTAGKH3P8tyNOgoWWbjv6aFUEgpFnN7ywm8mBSyEz/PajTkJHGq+8OSaSQ0PUqbh77djHAY3kdbyzngwBSd8zPPajToKFVm48OmhUxIIQpvc8sJyJgYsh9Dz3I05ChxrvvHkmUoOD1Kn4u+5Yx0FM5DW8s94MQUofM3y3Iw6ChdaufDoqFUTCkWd3vPEcycHLoXR8+GOOgsea73y5JtLDg9TqOLvuWQdBjKQ1/HQeTEFJ3vN8tyMOQoWWLfw6KpUEwpGnuDzxXQnCDGG0PPhjjsLHWu+8eSbSw0PVKji77pkHgU0kNfy0HsxBSl7zfLdjDkKFlm48OiqVBMJRp7g88V0Jgcxh9Dz4Y47ChxqvfHlm0oOEFWp4vC7ZR4GM5HY8tF7MQUoe8zy3Iw5CRVauvDqq1UUCkae4PPGdygIMYbR8+KPOwsea77x5ZxLDhBUqeLvumYeBS+Q2PLRfDIFJ3rL8tyMOQkVWbnw66tUEwlFnt/zxnYpCDKH0PPijzwLHmq98uWbSw4QVKni77tlHgYzj9fx0HsxBSh6y/Lbi3oJFlm48OqsVBMKRp7f88Z3Kgkxh9Dz4o88Cx1qvfLlmkoOEFWp4u+7ZR4GM5HX8dJ8MgUmetDy2408CRVYt+/prFUSCUWd3/PGdioIMIbQ8+KPOwscar3y5ZtKDg9VqePwvGUeBTOP1vHSezEFJ3rL8tyOOgkWWrjw6qtVEwpFnd7zxnUpCDGG0PPijzsLHWq98eWcSg4PVKji8LxlHgU0jNbx0HsxBSh6y/Lajj0KFVm5792sVRMLRZze88Z1KgkwhM/y4o87ChxpvPHkmkoOD1Op4vC8ZB4FM4/W8dJ7MQUnetDy2o89ChVZuO/drFYTCkWd3vPGdSkJMYXO8uKOOwscar3y5ZtKDhBUqOLvvGUeBjOP1vHTezIGKHrM8tyNPgoVWbnw6q1WFApGnt/zxnYqCjCGz/LijzoKHGm88uSaSg4QU6ni8LxlHgYykNbx0n0yBSh6y/LcjjwKFVi48OqsVRMKRZzd88V1Kgkwhs/y4o86Ch1pvfLlmkoOEFSp4u+8Zh4FM4/W8dJ9MgUoe8zy24w+ChVaufDqrVUTC0Wc3fPFdisJMIfP8uKPOwscar7x5ZxKDhBUqOLwvGYeBjOP1vLQfTIGKHvM8tyNPwoVWbnw6q5VEwtFnN3zxnYrCjCFz/LijzoLHWq98uWbSw4QVKfi8LxmHgU0j9bx0n4yBil7zPLbjj4JFVq48Oqt') as HTMLAudioElement;
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchOtherUser();
      fetchCarInfo();
      markAsRead();
      subscribeToMessages();
    }
  }, [conversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOtherUser = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .rpc('get_conversation_participants', { conv_id: conversationId });

    if (error || !data) return;

    const otherParticipant = data.find((p: any) => p.user_id !== user.id);
    if (!otherParticipant) return;

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('nickname, full_name, avatar_url')
      .eq('id', otherParticipant.user_id)
      .maybeSingle();

    if (profileError || !profileData) return;

    setOtherUser({
      id: otherParticipant.user_id,
      name: profileData.nickname || profileData.full_name || 'Korisnik',
      avatar: profileData.avatar_url,
    });
  };

  const fetchCarInfo = async () => {
    const { data: conversationData } = await supabase
      .from('conversations')
      .select('car_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (conversationData?.car_id) {
      const { data: carData } = await supabase
        .from('cars')
        .select('*')
        .eq('id', conversationData.car_id)
        .maybeSingle();

      if (carData) {
        setCarInfo({
          brand: carData.brand,
          model: carData.model,
          year: carData.year,
          id: carData.id
        });
        setFullCarData(carData as Car);
      }
    }
  };

  const handleCarClick = () => {
    if (fullCarData) {
      setShowCarDetail(true);
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const markAsRead = async () => {
    if (!user) return;

    await supabase
      .from('conversation_participants')
      .update({
        last_read_at: new Date().toISOString(),
        unread_count: 0
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages(prev => {
            const exists = prev.some(m => m.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          if (newMessage.sender_id !== user?.id) {
            playNotificationSound();
          }

          markAsRead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || sending || !otherUser?.id) return;

    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const messageContent = newMessage.trim();

    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      message_type: 'text',
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    const messageData = {
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: otherUser.id,
      content: messageContent,
      message: messageContent,
      message_type: 'text',
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      alert('Greška pri slanju poruke');
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setNewMessage(messageContent);
    } else if (data) {
      setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    }

    setSending(false);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Danas';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Juče';
    } else {
      return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const shouldShowDateSeparator = (currentMsg: Message, previousMsg: Message | undefined) => {
    if (!previousMsg) return true;
    const currentDate = new Date(currentMsg.created_at).toDateString();
    const previousDate = new Date(previousMsg.created_at).toDateString();
    return currentDate !== previousDate;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            {otherUser?.avatar ? (
              <img
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                {otherUser?.name || 'Korisnik'}
              </h2>
              {carInfo && (
                <button
                  onClick={handleCarClick}
                  className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors group"
                >
                  <span>Za: {carInfo.brand} {carInfo.model} {carInfo.year}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Učitavanje...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-gray-500">Nema poruka. Započnite razgovor!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const showDateSeparator = shouldShowDateSeparator(message, messages[index - 1]);
                const isOwnMessage = message.sender_id === user?.id;

                return (
                  <div key={message.id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-4">
                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {formatMessageDate(message.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.message_type === 'swap_offer'
                            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30'
                            : isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        {message.message_type === 'swap_offer' && message.swap_offer_id ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowRightLeft className="w-4 h-4 text-cyan-600" />
                              <span className="text-xs font-semibold text-cyan-700 uppercase">Ponuda za zamjenu</span>
                            </div>
                            <p className="text-sm break-words text-gray-900 whitespace-pre-line mb-3">{message.content}</p>
                            <button
                              onClick={() => {
                                if (onViewSwapOffer) {
                                  onViewSwapOffer(message.swap_offer_id!);
                                }
                              }}
                              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                            >
                              Pogledaj ponudu
                            </button>
                            <p className="text-xs mt-2 text-gray-500">
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm break-words">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              {formatMessageTime(message.created_at)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napišite poruku..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || !otherUser?.id}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {showCarDetail && fullCarData && (
        <CarDetailModal
          car={fullCarData}
          onClose={() => setShowCarDetail(false)}
          onSwapOffer={() => {}}
          isPremiumUser={false}
        />
      )}
    </div>
  );
}
