import { useState } from 'react';
import { X, Star, MessageSquare, Shield, Smile, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserReviewModalProps {
  onClose: () => void;
  reviewedUserId: string;
  reviewedUserNickname: string;
  conversationId?: string;
  onReviewSubmitted?: () => void;
}

export function UserReviewModal({
  onClose,
  reviewedUserId,
  reviewedUserNickname,
  conversationId,
  onReviewSubmitted
}: UserReviewModalProps) {
  const [ratingCommunication, setRatingCommunication] = useState(0);
  const [ratingReliability, setRatingReliability] = useState(0);
  const [ratingFriendliness, setRatingFriendliness] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<{ [key: string]: number }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (ratingCommunication === 0 || ratingReliability === 0 || ratingFriendliness === 0) {
      alert('Molimo vas da ocenite sve kategorije');
      return;
    }

    if (comment.trim().length === 0) {
      alert('Molimo vas da napišete komentar o korisniku');
      return;
    }

    try {
      setSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Morate biti prijavljeni');
        return;
      }

      const { error } = await supabase
        .from('user_reviews')
        .insert({
          reviewer_id: user.id,
          reviewed_user_id: reviewedUserId,
          conversation_id: conversationId || null,
          rating_communication: ratingCommunication,
          rating_reliability: ratingReliability,
          rating_friendliness: ratingFriendliness,
          comment: comment.trim(),
          is_verified: false
        });

      if (error) {
        if (error.code === '23505') {
          alert('Već ste ostavili dojam o ovom korisniku za ovu konverzaciju');
        } else {
          throw error;
        }
        return;
      }

      alert('Dojam je uspješno ostavljen!');
      onReviewSubmitted?.();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Greška pri slanju dojma');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (category: string, value: number, setValue: (val: number) => void) => {
    const displayValue = hoveredStar[category] || value;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredStar({ ...hoveredStar, [category]: star })}
            onMouseLeave={() => setHoveredStar({ ...hoveredStar, [category]: 0 })}
            onClick={() => setValue(star)}
            className="transition-all hover:scale-110"
          >
            <Star
              className={`w-7 h-7 transition-all ${
                star <= displayValue
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication':
        return <MessageSquare className="w-5 h-5" />;
      case 'reliability':
        return <Shield className="w-5 h-5" />;
      case 'friendliness':
        return <Smile className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'communication':
        return 'Komunikacija';
      case 'reliability':
        return 'Pouzdanost';
      case 'friendliness':
        return 'Ljubaznost';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ostavi dojam</h2>
              <p className="text-blue-100 text-sm">o korisniku {reviewedUserNickname}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-5">
            {['communication', 'reliability', 'friendliness'].map((category) => (
              <div
                key={category}
                onMouseEnter={() => setHoveredCat(category)}
                onMouseLeave={() => setHoveredCat(null)}
                className={`p-4 rounded-xl border transition-all ${
                  hoveredCat === category
                    ? 'bg-white/5 border-blue-500/50'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      hoveredCat === category ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400'
                    } transition-colors`}>
                      {getCategoryIcon(category)}
                    </div>
                    <span className="font-medium text-white">{getCategoryLabel(category)}</span>
                  </div>
                  {renderStars(
                    category,
                    category === 'communication' ? ratingCommunication :
                    category === 'reliability' ? ratingReliability :
                    ratingFriendliness,
                    category === 'communication' ? setRatingCommunication :
                    category === 'reliability' ? setRatingReliability :
                    setRatingFriendliness
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Vaš dojam o korisniku
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Opišite svoje iskustvo sa ovim korisnikom..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/500 karaktera
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-medium"
            >
              Otkaži
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Šaljem...' : 'Ostavi dojam'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}