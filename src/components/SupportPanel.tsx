import { useState, useEffect } from 'react';
import { Send, AlertCircle, Clock, CheckCircle, Filter, Lock, Unlock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDateTime } from '../lib/dateUtils';

interface SupportPanelProps {
  userId: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'pending' | 'open' | 'in_progress' | 'resolved' | 'closed';
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

export function SupportPanel({ userId }: SupportPanelProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTickets();

    const channel = supabase
      .channel('support_tickets_admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_tickets'
      }, () => {
        loadTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter(t => t.status === statusFilter));
    }
  }, [tickets, statusFilter]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);

      if (selectedTicket.status === 'pending') {
        updateTicketStatus(selectedTicket.id, 'open');
      }

      const channel = supabase
        .channel(`support_messages_admin:${selectedTicket.id}`)
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setLoading(true);
    const { error } = await supabase
      .from('support_messages')
      .insert([{
        ticket_id: selectedTicket.id,
        user_id: userId,
        message: newMessage,
        is_staff_reply: true
      }]);

    setLoading(false);

    if (!error) {
      setNewMessage('');
      loadMessages(selectedTicket.id);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    setLoading(true);
    const updates: any = { status };

    if (status === 'resolved' || status === 'closed') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = userId;
    }

    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId);

    setLoading(false);

    if (!error) {
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as any });
      }
    }
  };

  const toggleLockTicket = async (ticketId: string, currentlyLocked: boolean) => {
    setLoading(true);
    const updates: any = {
      locked: !currentlyLocked,
      locked_at: !currentlyLocked ? new Date().toISOString() : null,
      locked_by: !currentlyLocked ? userId : null
    };

    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId);

    setLoading(false);

    if (!error) {
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          locked: !currentlyLocked,
          locked_at: updates.locked_at,
          locked_by: updates.locked_by
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'open': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Na čekanju';
      case 'open': return 'Otvoreno';
      case 'in_progress': return 'U obradi';
      case 'resolved': return 'Riješeno';
      case 'closed': return 'Zatvoreno';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getTicketStats = () => {
    return {
      pending: tickets.filter(t => t.status === 'pending').length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      total: tickets.length
    };
  };

  const stats = getTicketStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Ukupno</p>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="backdrop-blur-md bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <p className="text-orange-400 text-sm mb-1">Na čekanju</p>
          <p className="text-3xl font-black text-orange-400">{stats.pending}</p>
        </div>
        <div className="backdrop-blur-md bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 text-sm mb-1">Otvoreno</p>
          <p className="text-3xl font-black text-yellow-400">{stats.open}</p>
        </div>
        <div className="backdrop-blur-md bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm mb-1">U obradi</p>
          <p className="text-3xl font-black text-blue-400">{stats.in_progress}</p>
        </div>
        <div className="backdrop-blur-md bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400 text-sm mb-1">Riješeno</p>
          <p className="text-3xl font-black text-green-400">{stats.resolved}</p>
        </div>
        <div className="backdrop-blur-md bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Zatvoreno</p>
          <p className="text-3xl font-black text-gray-400">{stats.closed}</p>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">Svi tiketi</option>
            <option value="pending">Na čekanju</option>
            <option value="open">Otvoreni</option>
            <option value="in_progress">U obradi</option>
            <option value="resolved">Riješeni</option>
            <option value="closed">Zatvoreni</option>
          </select>
        </div>

        <div className="flex h-[600px]">
          <div className="w-1/3 border-r border-white/10 overflow-y-auto">
            <div className="space-y-2 p-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
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
                    <div className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(ticket.priority)} flex-shrink-0 ml-2`}>
                      {ticket.priority}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{ticket.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(ticket.status)}
                      <span className="text-xs text-gray-400">{getStatusText(ticket.status)}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatDateTime(ticket.created_at)}</span>
                  </div>
                </div>
              ))}

              {filteredTickets.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nema tiketa</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedTicket ? (
              <>
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h3>
                      <p className="text-sm text-gray-400">ID: {selectedTicket.id}</p>
                      {selectedTicket.locked && selectedTicket.locked_at && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Lock className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 font-semibold">
                            Zaključano {formatDateTime(selectedTicket.locked_at)} - Automatski će se obrisati za{' '}
                            {Math.max(0, 3 - Math.floor((Date.now() - new Date(selectedTicket.locked_at).getTime()) / (1000 * 60 * 60 * 24)))} dana
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'open')}
                      disabled={loading || selectedTicket.status === 'open'}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedTicket.status === 'open'
                          ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Otvoreno
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                      disabled={loading || selectedTicket.status === 'in_progress'}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedTicket.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/50'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      U obradi
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      disabled={loading || selectedTicket.status === 'resolved'}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedTicket.status === 'resolved'
                          ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Riješeno
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                      disabled={loading || selectedTicket.status === 'closed'}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedTicket.status === 'closed'
                          ? 'bg-gray-500/20 text-gray-400 border-2 border-gray-500/50'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      Zatvoreno
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleLockTicket(selectedTicket.id, selectedTicket.locked)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                        selectedTicket.locked
                          ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 hover:bg-red-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {selectedTicket.locked ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          Otključaj tiket
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Zaključaj tiket (briše se za 3 dana)
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-cyan-400">Korisnik</span>
                      <span className="text-xs text-gray-500">{formatDateTime(selectedTicket.created_at)}</span>
                    </div>
                    <p className="text-white whitespace-pre-line">{selectedTicket.message}</p>
                  </div>

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-xl p-4 ${
                        message.is_staff_reply
                          ? 'bg-blue-500/10 border border-blue-500/30 mr-4'
                          : 'bg-white/5 border border-white/10 ml-4'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold ${message.is_staff_reply ? 'text-blue-400' : 'text-cyan-400'}`}>
                          {message.is_staff_reply ? 'Podrška' : 'Korisnik'}
                        </span>
                        <span className="text-xs text-gray-500">{formatDateTime(message.created_at)}</span>
                      </div>
                      <p className="text-white whitespace-pre-line">{message.message}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Odgovorite korisniku..."
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
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Odaberite tiket</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
