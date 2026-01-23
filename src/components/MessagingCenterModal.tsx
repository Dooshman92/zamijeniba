import { useState } from 'react';
import { MessageCircle, ArrowRightLeft } from 'lucide-react';
import { InboxModal } from './InboxModal';
import { SwapOffersPanel } from './SwapOffersPanel';
import { DirectChatModal } from './DirectChatModal';
import { useAuth } from '../lib/auth';
import { getOrCreateConversation } from '../lib/messaging';

interface MessagingCenterModalProps {
  onClose: () => void;
  initialConversationId?: string | null;
  initialTab?: 'messages' | 'offers';
  onViewSwapOffer?: (offerId: string) => void;
}

export function MessagingCenterModal({
  onClose,
  initialConversationId,
  initialTab = 'messages',
  onViewSwapOffer
}: MessagingCenterModalProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'offers'>(initialTab);
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [directChatConversationId, setDirectChatConversationId] = useState<string | null>(null);
  const [directChatOtherUserId, setDirectChatOtherUserId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleOpenChat = async (userId: string, carId?: string) => {
    if (!user) return;

    const conversationId = await getOrCreateConversation(user.id, userId, carId);
    if (conversationId) {
      setDirectChatConversationId(conversationId);
      setDirectChatOtherUserId(userId);
      setShowDirectChat(true);
    }
  };

  if (showDirectChat && directChatConversationId && directChatOtherUserId) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col border border-white/10">
          <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-3xl flex items-center justify-between">
            <button
              onClick={() => {
                setShowDirectChat(false);
                setDirectChatConversationId(null);
                setDirectChatOtherUserId(null);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-semibold">Nazad</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              title="Zatvori"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex">
            <DirectChatModal
              conversationId={directChatConversationId}
              otherUserId={directChatOtherUserId}
              onClose={() => {
                setShowDirectChat(false);
                setDirectChatConversationId(null);
                setDirectChatOtherUserId(null);
              }}
              embedded={true}
            />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'messages') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[700px] flex flex-col">
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setActiveTab('messages')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Poruke</span>
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Ponude</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-lg"
              title="Zatvori"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <InboxModal
              onClose={onClose}
              initialConversationId={initialConversationId}
              onViewSwapOffer={onViewSwapOffer}
              onSwitchToOffers={() => setActiveTab('offers')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col border border-white/10">
        <div className="px-6 py-3 border-b border-white/10 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-3xl flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setActiveTab('messages')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Poruke</span>
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Ponude</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <SwapOffersPanel
            onAcceptOffer={(conversationId, otherUserId) => {
              setDirectChatConversationId(conversationId);
              setDirectChatOtherUserId(otherUserId);
              setShowDirectChat(true);
            }}
            onOpenChat={handleOpenChat}
          />
        </div>
      </div>
    </div>
  );
}
