import { useState } from 'react';
import { SwapOffersPanel } from './SwapOffersPanel';
import { DirectChatModal } from './DirectChatModal';
import { Car } from '../lib/supabase';

interface MessagingCenterModalProps {
  onClose: () => void;
  onViewSwapOffer?: (offerId: string) => void;
  onSwapOffer?: (car: Car) => void;
  onLiveInquiry?: (car: Car) => void;
  onOwnerClick?: (userId: string) => void;
  onSendMessage?: (userId: string, carId?: string) => void;
  isPremiumUser?: boolean;
}

export function MessagingCenterModal({
  onClose,
  onViewSwapOffer,
  onSwapOffer,
  onLiveInquiry,
  onOwnerClick,
  onSendMessage,
  isPremiumUser = false
}: MessagingCenterModalProps) {
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [directChatConversationId, setDirectChatConversationId] = useState<string | null>(null);
  const [directChatOtherUserId, setDirectChatOtherUserId] = useState<string | null>(null);

  if (showDirectChat && directChatConversationId && directChatOtherUserId) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-white/10">
          <div className="px-4 py-2.5 border-b border-white/10 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-2xl flex items-center justify-between">
            <button
              onClick={() => {
                setShowDirectChat(false);
                setDirectChatConversationId(null);
                setDirectChatOtherUserId(null);
              }}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-semibold text-sm">Nazad</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
              title="Zatvori"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex min-h-0 overflow-hidden">
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col border border-white/10">
        <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Ponude za zamjenu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <SwapOffersPanel
            onAcceptOffer={(conversationId, otherUserId) => {
              setDirectChatConversationId(conversationId);
              setDirectChatOtherUserId(otherUserId);
              setShowDirectChat(true);
            }}
            onSwapOffer={onSwapOffer}
            onLiveInquiry={onLiveInquiry}
            onOwnerClick={onOwnerClick}
            onSendMessage={onSendMessage}
            isPremiumUser={isPremiumUser}
          />
        </div>
      </div>
    </div>
  );
}
