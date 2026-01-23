import { useState, useEffect } from 'react';
import { X, MessageCircle, User, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { ChatWindow } from './ChatWindow';

interface Conversation {
  id: string;
  updated_at: string;
  last_message_at: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  unread_count: number;
}

interface InboxModalProps {
  onClose: () => void;
  initialConversationId?: string | null;
  onViewSwapOffer?: (offerId: string) => void;
  onSwitchToOffers?: () => void;
}

export function InboxModal({ onClose, initialConversationId, onViewSwapOffer, onSwitchToOffers }: InboxModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToConversations();
    }
  }, [user]);

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversation(initialConversationId);
    }
  }, [initialConversationId]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data: participantData } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        unread_count,
        last_read_at,
        conversations (
          id,
          updated_at,
          last_message_at
        )
      `)
      .eq('user_id', user.id);

    if (!participantData) {
      setLoading(false);
      return;
    }

    const conversationIds = participantData.map(p => p.conversation_id);

    if (conversationIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const otherParticipantsPromises = conversationIds.map(async (convId) => {
      const { data } = await supabase.rpc('get_conversation_participants', { conv_id: convId });
      if (!data) return null;

      const otherParticipant = data.find((p: any) => p.user_id !== user.id);
      if (!otherParticipant) return null;

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('nickname, full_name, avatar_url')
        .eq('id', otherParticipant.user_id)
        .maybeSingle();

      return {
        conversation_id: convId,
        user_id: otherParticipant.user_id,
        user_profiles: profileData
      };
    });

    const otherParticipants = (await Promise.all(otherParticipantsPromises)).filter(Boolean);

    const { data: lastMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    const conversationsMap = new Map();
    participantData.forEach(p => {
      if (p.conversations) {
        conversationsMap.set(p.conversation_id, {
          id: p.conversations.id,
          updated_at: p.conversations.updated_at,
          last_message_at: p.conversations.last_message_at,
          unread_count: p.unread_count,
        });
      }
    });

    otherParticipants?.forEach(op => {
      const conv = conversationsMap.get(op.conversation_id);
      if (conv) {
        conv.other_user_id = op.user_id;
        conv.other_user_name = op.user_profiles?.nickname || op.user_profiles?.full_name || 'Korisnik';
        conv.other_user_avatar = op.user_profiles?.avatar_url || null;
      }
    });

    lastMessages?.forEach(msg => {
      const conv = conversationsMap.get(msg.conversation_id);
      if (conv && !conv.last_message) {
        conv.last_message = msg.content;
      }
    });

    const conversationsList = Array.from(conversationsMap.values())
      .sort((a, b) => {
        if (a.unread_count > 0 && b.unread_count === 0) return -1;
        if (a.unread_count === 0 && b.unread_count > 0) return 1;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });

    setConversations(conversationsList);
    setLoading(false);
  };

  const subscribeToConversations = () => {
    if (!user) return;

    const channel = supabase
      .channel('inbox-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Da li ste sigurni da želite da obrišete ovu konverzaciju?')) return;

    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId);

    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    fetchConversations();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Juče';
    } else {
      return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
    }
  };

  if (selectedConversation) {
    return (
      <ChatWindow
        conversationId={selectedConversation}
        onBack={() => {
          setSelectedConversation(null);
          fetchConversations();
        }}
        onClose={onClose}
        onViewSwapOffer={onViewSwapOffer}
      />
    );
  }

  const content = (
    <>
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Poruke</h2>
        </div>
        {!onSwitchToOffers && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Učitavanje...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-semibold mb-2">Nemate poruka</p>
              <p className="text-gray-500 text-sm">
                Pošaljite ponudu za zamenu ili upitite vlasnika o automobilu
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`relative group w-full px-6 py-4 transition-colors flex items-center gap-4 cursor-pointer ${
                    conversation.unread_count > 0
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 relative z-10 pointer-events-none">
                    {conversation.other_user_avatar ? (
                      <img
                        src={conversation.other_user_avatar}
                        alt={conversation.other_user_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {conversation.other_user_name}
                      </h3>
                      <div className={`flex items-center gap-1 text-xs ${conversation.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" />
                        {formatTime(conversation.last_message_at)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                        {conversation.last_message || 'Nema poruka'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteConversation(conversation.id, e)}
                    className="relative z-20 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 pointer-events-auto"
                    title="Obriši konverzaciju"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );

  if (onSwitchToOffers) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[600px] flex flex-col">
        {content}
      </div>
    </div>
  );
}
