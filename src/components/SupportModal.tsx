import { useState, useEffect } from 'react';
import { X, Send, Plus, MessageCircle, Clock, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { supabase, UserProfile } from '../lib/supabase';
import { formatDateTime } from '../lib/dateUtils';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userProfile: UserProfile;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'pending' | 'open' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  locked: boolean;
  locked_at: string | null;
  locked_by: string | null;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_staff_reply: boolean;
  created_at: string;
}

export function SupportModal({ isOpen, onClose, userId, userProfile }: SupportModalProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTickets();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);

      const channel = supabase
        .channel(`support_messages:${selectedTicket.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`
        }, () => {
          loadMessages(selectedTicket.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
  };

  const loadMessages = async (ticketId: string) => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const createTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{
        user_id: userId,
        subject: newTicketSubject,
        message: newTicketMessage,
        priority: newTicketPriority,
        status: 'pending'
      }])
      .select()
      .single();

    setLoading(false);

    if (!error && data) {
      setTickets([data, ...tickets]);
      setNewTicketSubject('');
      setNewTicketMessage('');
      setNewTicketPriority('normal');
      setShowNewTicketForm(false);
      setSelectedTicket(data);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setLoading(true);
    const { error } = await supabase
      .from('support_messages')
      .insert([{
        ticket_id: selectedTicket.id,
        user_id: userId,
        message: newMessage,
        is_staff_reply: false
      }]);

    setLoading(false);

    if (!error) {
      setNewMessage('');
      loadMessages(selectedTicket.id);
    }
  };

  const closeAndLockTicket = async () => {
    if (!selectedTicket) return;

    const confirmed = window.confirm(
      'Da li ste sigurni da želite zatvoriti ovaj tiket?\n\n' +
      'Tiket će biti zaključan i automatski obrisan nakon 3 dana.\n' +
      'Nećete moći ponovo otvoriti ili slati poruke.'
    );

    if (!confirmed) return;

    setLoading(true);
    const { error } = await supabase
      .from('support_tickets')
      .update({
        status: 'closed',
        locked: true,
        locked_at: new Date().toISOString(),
        locked_by: userId
      })
      .eq('id', selectedTicket.id);

    if (!error) {
      await supabase
        .from('support_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          user_id: userId,
          message: 'Zatvorili ste tiket. Tiket će biti automatski obrisan za 3 dana.',
          is_staff_reply: false
        }]);

      loadMessages(selectedTicket.id);
      loadTickets();
      setSelectedTicket({
        ...selectedTicket,
        status: 'closed',
        locked: true,
        locked_at: new Date().toISOString(),
        locked_by: userId
      });
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'open': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Na čekanju';
      case 'open': return 'Otvoreno';
      case 'closed': return 'Zatvoreno';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'normal': return 'text-blue-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <MessageCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Podrška korisnicima</h2>
                <p className="text-sm text-gray-400">Pošaljite pitanje ili prijavite problem</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          <div className="w-1/3 border-r border-white/10 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setShowNewTicketForm(true)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Novi tiket
              </button>
            </div>

            <div className="space-y-2 p-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowNewTicketForm(false);
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-cyan-500/20 border-2 border-cyan-500/50'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {ticket.locked && <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      <h3 className="font-bold text-white text-sm line-clamp-1">{ticket.subject}</h3>
                    </div>
                    {getStatusIcon(ticket.status)}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{ticket.message}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      Kreirano {formatDateTime(ticket.created_at)}
                    </span>
                  </div>
                </div>
              ))}

              {tickets.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nemate tiketa</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {showNewTicketForm ? (
              <div className="p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">Novi tiket</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Naslov
                    </label>
                    <input
                      type="text"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      placeholder="Unesite naslov tiketa"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Prioritet
                    </label>
                    <select
                      value={newTicketPriority}
                      onChange={(e) => setNewTicketPriority(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="low">Nizak</option>
                      <option value="normal">Normalan</option>
                      <option value="high">Visok</option>
                      <option value="urgent">Hitan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Poruka
                    </label>
                    <textarea
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      placeholder="Opišite vaš problem ili pitanje..."
                      rows={8}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={createTicket}
                      disabled={loading || !newTicketSubject.trim() || !newTicketMessage.trim()}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-300"
                    >
                      Kreiraj tiket
                    </button>
                    <button
                      onClick={() => setShowNewTicketForm(false)}
                      className="px-6 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                    >
                      Otkaži
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedTicket ? (
              <>
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                      {getStatusIcon(selectedTicket.status)}
                      <span className="text-sm text-gray-300">{getStatusText(selectedTicket.status)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">ID: {selectedTicket.id}</p>
                  {selectedTicket.locked && selectedTicket.locked_at && (
                    <div className="mt-3 flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <Lock className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-semibold">
                        Tiket je zaključan {formatDateTime(selectedTicket.locked_at)}
                        {selectedTicket.locked_by === userId ? ' (zatvorili ste ga vi)' : ' (zaključao admin/moderator)'}.
                        {' '}Biti će automatski obrisan za{' '}
                        {Math.max(0, 3 - Math.floor((Date.now() - new Date(selectedTicket.locked_at).getTime()) / (1000 * 60 * 60 * 24)))} dana.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-cyan-400">Vi</span>
                      <span className="text-xs text-gray-500">{formatDateTime(selectedTicket.created_at)}</span>
                    </div>
                    <p className="text-white whitespace-pre-line">{selectedTicket.message}</p>
                  </div>

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-xl p-4 ${
                        message.is_staff_reply
                          ? 'bg-blue-500/10 border border-blue-500/30 ml-4'
                          : 'bg-white/5 border border-white/10 mr-4'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold ${message.is_staff_reply ? 'text-blue-400' : 'text-cyan-400'}`}>
                          {message.is_staff_reply ? 'Podrška' : 'Vi'}
                        </span>
                        <span className="text-xs text-gray-500">{formatDateTime(message.created_at)}</span>
                      </div>
                      <p className="text-white whitespace-pre-line">{message.message}</p>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== 'closed' && !selectedTicket.locked && (
                  <div className="p-6 border-t border-white/10 space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Napišite poruku..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Pošalji
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={closeAndLockTicket}
                        disabled={loading}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 text-sm"
                      >
                        <Lock className="w-4 h-4" />
                        Zatvori tiket (problem riješen)
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Odaberite tiket ili kreirajte novi</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
