import { useEffect, useState, useRef } from 'react';
import { X, Send, User, Phone, Mail, Image as ImageIcon, ExternalLink, Car as CarIcon, Ban, Unlock, Star } from 'lucide-react';
import { supabase, Message, UserProfile, Car } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { CarDetailModal } from './CarDetailModal';
import { UserReviewModal } from './UserReviewModal';

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
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [carInfo, setCarInfo] = useState<{ id: string; brand: string; model: string; year: number; image_url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwapAccepted, setIsSwapAccepted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [blockedByUserId, setBlockedByUserId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initChat = async () => {
      await Promise.all([
        loadOtherUserProfile(),
        loadCurrentUserProfile(),
        loadMessages(),
        loadCarInfo(),
        loadBlockedStatus(),
        checkSwapStatus(),
      ]);
      markAsRead();
      setLoading(false);
    };

    initChat();
    const cleanup = subscribeToMessages();
    return cleanup;
  }, [conversationId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isSwapAccepted && otherUserProfile && !otherUserProfile.email) {
      const loadEmail = async () => {
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
            const fullProfile = await response.json();
            setOtherUserProfile(fullProfile);
          }
        } catch (error) {
          console.error('Could not fetch email:', error);
        }
      };
      loadEmail();
    }
  }, [isSwapAccepted, otherUserProfile]);

  const loadBlockedStatus = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('blocked_by_user_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (data) {
      setBlockedByUserId(data.blocked_by_user_id);
    }
  };

  const toggleBlockConversation = async () => {
    if (!user) return;

    const newBlockedStatus = blockedByUserId ? null : user.id;
    const newBlockedAt = blockedByUserId ? null : new Date().toISOString();

    const { error } = await supabase
      .from('conversations')
      .update({
        blocked_by_user_id: newBlockedStatus,
        blocked_at: newBlockedAt
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error toggling block status:', error);
      alert('Greška pri promjeni statusa razgovora');
      return;
    }

    setBlockedByUserId(newBlockedStatus);
  };

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
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', otherUserId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (profile) {
        setOtherUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadCurrentUserProfile = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading current user profile:', error);
        return;
      }

      if (profile) {
        setCurrentUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading current user profile:', error);
    }
  };

  const loadCarInfo = async () => {
    const { data: carData } = await supabase
      .from('cars')
      .select('id, brand, model, year, image_url')
      .eq('user_id', otherUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (carData) {
      setCarInfo({
        id: carData.id,
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        image_url: carData.image_url
      });
    }
  };

  const markAsRead = async () => {
    if (!user) return;

    await supabase
      .from('conversation_participants')
      .update({
        unread_count: 0,
        last_read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);
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
      markAsRead();
    }
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
          markAsRead();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setBlockedByUserId(newData.blocked_by_user_id);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('message-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('message-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !user) return;

    if (blockedByUserId) {
      alert('Razgovor je zatvoren. Poruke se ne mogu slati.');
      return;
    }

    setUploading(true);

    const { data: conversationCheck } = await supabase
      .from('conversations')
      .select('blocked_by_user_id')
      .eq('id', conversationId)
      .maybeSingle();

    if (conversationCheck?.blocked_by_user_id) {
      setBlockedByUserId(conversationCheck.blocked_by_user_id);
      alert('Razgovor je zatvoren. Poruke se ne mogu slati.');
      setUploading(false);
      return;
    }

    let imageUrl = null;
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) {
        alert('Greška pri uploadu slike');
        setUploading(false);
        return;
      }
    }

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: otherUserId,
      content: newMessage.trim() || 'Slika',
      message_type: imageUrl ? 'image' : 'text',
      image_url: imageUrl,
    });

    if (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      if (error.message.includes('blocked conversation')) {
        alert('Razgovor je zatvoren. Poruke se ne mogu slati.');
        await loadBlockedStatus();
      } else {
        alert(`Greška pri slanju poruke: ${error.message}`);
      }
    } else {
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
    }

    setUploading(false);
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
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 group"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>
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
    <div className="h-full w-full flex flex-col backdrop-blur-md bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-lg shadow-2xl">
      <div className="flex-shrink-0 relative p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
        <div className="flex items-center gap-3" style={{ paddingRight: embedded ? '0' : '3rem' }}>
          {otherUserProfile && (
            <>
            <div className="relative">
              {otherUserProfile.avatar_url ? (
                <img
                  src={otherUserProfile.avatar_url}
                  alt={otherUserProfile.nickname || 'User'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/50"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white">
                {otherUserProfile.nickname || 'Korisnik'}
              </h2>
              {carInfo && (
                <div className="flex items-center gap-2 mt-1">
                  <CarIcon className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                  <span className="text-xs text-cyan-300 truncate">
                    {carInfo.brand} {carInfo.model} ({carInfo.year})
                  </span>
                </div>
              )}
              {isSwapAccepted && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {otherUserProfile.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <Mail className="w-3 h-3 text-cyan-400" />
                      <span className="truncate">{otherUserProfile.email}</span>
                    </div>
                  )}
                  {otherUserProfile.phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-300">
                      <Phone className="w-3 h-3 text-green-400" />
                      <a href={`tel:${otherUserProfile.phone}`} className="hover:text-white transition-colors">
                        {otherUserProfile.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            </>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowReviewModal(true)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
              title="Ostavi dojam"
            >
              <Star className="w-4 h-4" />
            </button>

            <button
              onClick={toggleBlockConversation}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                blockedByUserId
                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              }`}
              title={blockedByUserId ? 'Otvori razgovor' : 'Zatvori razgovor'}
            >
              {blockedByUserId ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            </button>

            {carInfo && (
              <button
                onClick={() => setSelectedCarId(carInfo.id)}
                className="group relative flex-shrink-0"
                title="Vidi detalje auta"
              >
                <img
                  src={carInfo.image_url}
                  alt={`${carInfo.brand} ${carInfo.model}`}
                  className="w-16 h-12 object-cover rounded-lg border border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:border-cyan-500/50"
                />
                <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </button>
            )}
          </div>
        </div>

        {!embedded && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 p-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl transition-all duration-300 hover:scale-110 group z-30 shadow-xl"
            title="Zatvori"
          >
            <X className="w-6 h-6 text-red-400 group-hover:text-red-300" />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 opacity-50">
                <Send className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-400 text-base">Počnite razgovor</p>
              <p className="text-gray-500 text-sm mt-1">Pošaljite prvu poruku</p>
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
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    isMyMessage
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                      : 'bg-white/10 backdrop-blur-md text-gray-100 border border-white/10'
                  }`}
                >
                  {message.image_url && (
                    <img
                      src={message.image_url}
                      alt="Slika"
                      className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.image_url, '_blank')}
                    />
                  )}
                  {message.content && message.content !== 'Slika' && (
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  )}
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

      <div className="flex-shrink-0 p-3 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        {blockedByUserId && (
          <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400 text-center font-semibold">
              {blockedByUserId === user?.id
                ? 'Zatvorili ste ovaj razgovor. Kliknite na ikonicu za otključavanje da nastavite.'
                : 'Ovaj razgovor je zatvoren od strane drugog korisnika.'}
            </p>
          </div>
        )}
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-white/20" />
            <button
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!!blockedByUserId}
            className="flex-shrink-0 bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Dodaj sliku"
          >
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </button>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={blockedByUserId ? "Razgovor je zatvoren..." : "Napišite poruku..."}
            rows={1}
            disabled={!!blockedByUserId}
            className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '42px', maxHeight: '100px' }}
          />
          <button
            onClick={sendMessage}
            disabled={(!newMessage.trim() && !selectedImage) || uploading || !!blockedByUserId}
            className="flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-cyan-500/30"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        {!blockedByUserId && (
          <p className="text-xs text-gray-500 mt-1.5 text-center">
            Enter za slanje • Shift + Enter za novi red
          </p>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return (
      <>
        {chatContent}
        {selectedCarId && (
          <CarDetailModal
            carId={selectedCarId}
            onClose={() => setSelectedCarId(null)}
            currentUserProfile={currentUserProfile}
          />
        )}
        {showReviewModal && otherUserProfile && (
          <UserReviewModal
            reviewedUserId={otherUserId}
            reviewedUserNickname={otherUserProfile.nickname || otherUserProfile.email?.split('@')[0] || 'Korisnik'}
            conversationId={conversationId}
            onClose={() => setShowReviewModal(false)}
            onReviewSubmitted={() => setShowReviewModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full h-[90vh]">
          {chatContent}
        </div>
      </div>
      {selectedCarId && (
        <CarDetailModal
          carId={selectedCarId}
          onClose={() => setSelectedCarId(null)}
          currentUserProfile={currentUserProfile}
        />
      )}
      {showReviewModal && otherUserProfile && (
        <UserReviewModal
          reviewedUserId={otherUserId}
          reviewedUserNickname={otherUserProfile.nickname || otherUserProfile.email?.split('@')[0] || 'Korisnik'}
          conversationId={conversationId}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
}
