import { useState, useEffect } from 'react';
import { Send, AlertCircle, Clock, CheckCircle, Filter, Lock, Unlock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { formatDateTime } from '../lib/dateUtils';

interface SupportPanelProps {
  onClose: () => void;
}

interface UserProfile {
  id: string;
  nickname: string;
  is_admin: boolean;
  is_moderator: boolean;
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
  user_profiles: {
    nickname: string;
  };
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_staff_reply: boolean;
  created_at: string;
}

export function SupportPanel({ onClose }: SupportPanelProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadTickets();
    }
  }, [user]);

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

      if (selectedTicket.status === 'pending' && (userProfile?.is_admin || userProfile?.is_moderator)) {
        updateTicketStatus(selectedTicket.id, 'open');
      }

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

  const loadUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('id, nickname, is_admin, is_moderator')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
    }
  };

  const loadTickets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user_profiles!support_tickets_user_id_fkey_profiles (
          nickname
        )
      `)
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
    if (!newMessage.trim() || !selectedTicket || !user) return;

    setLoading(true);
    const { error } = await supabase
      .from('support_messages')
      .insert([{
        ticket_id: selectedTicket.id,
        user_id: user.id,
        message: newMessage,
        is_staff_reply: userProfile?.is_admin || userProfile?.is_moderator || false
      }]);

    setLoading(false);

    if (!error) {
      setNewMessage('');
      loadMessages(selectedTicket.id);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    if (!user) return;

    setLoading(true);
    const updates: any = { status };

    if (status === 'resolved' || status === 'closed') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user.id;
    }

    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId);

    if (!error && status === 'closed') {
      const staffRole = userProfile?.is_admin ? 'Admin' : 'Moderator';
      await supabase
        .from('support_messages')
        .insert([{
          ticket_id: ticketId,
          user_id: user.id,
          message: `${staffRole} je zatvorio tiket.`,
          is_staff_reply: true
        }]);

      if (selectedTicket?.id === ticketId) {
        loadMessages(ticketId);
      }
    }

    setLoading(false);

    if (!error) {
      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as any });
      }
    }
  };

  const toggleLockTicket = async (ticketId: string, currentlyLocked: boolean) => {
    if (!user) return;

    setLoading(true);
    const updates: any = {
      locked: !currentlyLocked,
      locked_at: !currentlyLocked ? new Date().toISOString() : null,
      locked_by: !currentlyLocked ? user.id : null
    };

    if (!currentlyLocked) {
      updates.status = 'closed';
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user.id;
    }

    const { error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId);

    if (!error) {
      if (!currentlyLocked) {
        const staffRole = userProfile?.is_admin ? 'Admin' : 'Moderator';
        await supabase
          .from('support_messages')
          .insert([{
            ticket_id: ticketId,
            user_id: user.id,
            message: `${staffRole} je zaključao tiket. Tiket će biti automatski obrisan za 3 dana.`,
            is_staff_reply: true
          }]);

        if (selectedTicket?.id === ticketId) {
          loadMessages(ticketId);
        }
      }

      loadTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          locked: !currentlyLocked,
          locked_at: updates.locked_at,
          locked_by: updates.locked_by,
          status: updates.status || selectedTicket.status
        });
      }
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'open': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-500" />;
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
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
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
  const isStaff = userProfile?.is_admin || userProfile?.is_moderator;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 text-sm font-semibold mb-1">Ukupno</p>
          <p className="text-3xl font-black text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-4 shadow-sm">
          <p className="text-orange-700 text-sm font-semibold mb-1">Na čekanju</p>
          <p className="text-3xl font-black text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-4 shadow-sm">
          <p className="text-yellow-700 text-sm font-semibold mb-1">Otvoreno</p>
          <p className="text-3xl font-black text-yellow-600">{stats.open}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-sm">
          <p className="text-blue-700 text-sm font-semibold mb-1">U obradi</p>
          <p className="text-3xl font-black text-blue-600">{stats.in_progress}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4 shadow-sm">
          <p className="text-green-700 text-sm font-semibold mb-1">Riješeno</p>
          <p className="text-3xl font-black text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4 shadow-sm">
          <p className="text-gray-700 text-sm font-semibold mb-1">Zatvoreno</p>
          <p className="text-3xl font-black text-gray-600">{stats.closed}</p>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b-2 border-gray-200 flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-800 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
          <div className="w-1/3 border-r-2 border-gray-200 overflow-y-auto bg-gray-50">
            <div className="space-y-2 p-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-blue-50 border-blue-500 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {ticket.locked && <Lock className="w-4 h-4 text-red-600 flex-shrink-0" />}
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{ticket.subject}</h3>
                    </div>
                    <div className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getPriorityColor(ticket.priority)} flex-shrink-0 ml-2`}>
                      {ticket.priority}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{ticket.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(ticket.status)}
                      <span className="text-xs font-semibold text-gray-700">{getStatusText(ticket.status)}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{formatDateTime(ticket.created_at)}</span>
                  </div>
                  {isStaff && ticket.user_profiles && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600 font-medium">{ticket.user_profiles.nickname}</span>
                    </div>
                  )}
                </div>
              ))}

              {filteredTickets.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">Nema tiketa</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-white">
            {selectedTicket ? (
              <>
                <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h3>
                      <p className="text-sm text-gray-500 font-medium">ID: {selectedTicket.id}</p>
                      {isStaff && selectedTicket.user_profiles && (
                        <div className="mt-2 flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700 font-semibold">Korisnik: {selectedTicket.user_profiles.nickname}</span>
                        </div>
                      )}
                      {selectedTicket.locked && selectedTicket.locked_at && (
                        <div className="mt-2 flex items-center gap-2 text-sm bg-red-50 border border-red-200 rounded-lg p-2">
                          <Lock className="w-4 h-4 text-red-600" />
                          <span className="text-red-700 font-semibold">
                            Zaključano - briše se za {Math.max(0, 3 - Math.floor((Date.now() - new Date(selectedTicket.locked_at).getTime()) / (1000 * 60 * 60 * 24)))} dana
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isStaff && (
                    <>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        <button
                          onClick={() => updateTicketStatus(selectedTicket.id, 'open')}
                          disabled={loading || selectedTicket.status === 'open'}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                            selectedTicket.status === 'open'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-500 shadow-md'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                          }`}
                        >
                          Otvoreno
                        </button>
                        <button
                          onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                          disabled={loading || selectedTicket.status === 'in_progress'}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                            selectedTicket.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-700 border-blue-500 shadow-md'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          U obradi
                        </button>
                        <button
                          onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                          disabled={loading || selectedTicket.status === 'resolved'}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                            selectedTicket.status === 'resolved'
                              ? 'bg-green-100 text-green-700 border-green-500 shadow-md'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:bg-green-50'
                          }`}
                        >
                          Riješeno
                        </button>
                        <button
                          onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                          disabled={loading || selectedTicket.status === 'closed'}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${
                            selectedTicket.status === 'closed'
                              ? 'bg-gray-100 text-gray-700 border-gray-500 shadow-md'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          Zatvoreno
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleLockTicket(selectedTicket.id, selectedTicket.locked)}
                          disabled={loading}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 border-2 ${
                            selectedTicket.locked
                              ? 'bg-red-100 text-red-700 border-red-500 hover:bg-red-200'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-red-400 hover:bg-red-50'
                          }`}
                        >
                          {selectedTicket.locked ? (
                            <>
                              <Unlock className="w-4 h-4" />
                              Otključaj
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Zaključaj (briše se za 3 dana)
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-700" />
                      <span className="text-sm font-bold text-blue-700">
                        {isStaff && selectedTicket.user_profiles ? selectedTicket.user_profiles.nickname : 'Korisnik'}
                      </span>
                      <span className="text-xs text-blue-600 font-medium ml-auto">{formatDateTime(selectedTicket.created_at)}</span>
                    </div>
                    <p className="text-gray-900 whitespace-pre-line font-medium">{selectedTicket.message}</p>
                  </div>

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-xl p-4 border-2 shadow-sm ${
                        message.is_staff_reply
                          ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 mr-8'
                          : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 ml-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className={`w-4 h-4 ${message.is_staff_reply ? 'text-green-700' : 'text-blue-700'}`} />
                        <span className={`text-sm font-bold ${message.is_staff_reply ? 'text-green-700' : 'text-blue-700'}`}>
                          {message.is_staff_reply ? 'Podrška' : (isStaff && selectedTicket.user_profiles ? selectedTicket.user_profiles.nickname : 'Korisnik')}
                        </span>
                        <span className={`text-xs font-medium ml-auto ${message.is_staff_reply ? 'text-green-600' : 'text-blue-600'}`}>
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-900 whitespace-pre-line font-medium">{message.message}</p>
                    </div>
                  ))}
                </div>

                {(!selectedTicket.locked || selectedTicket.locked_by !== selectedTicket.user_id) && (
                  <div className="p-6 border-t-2 border-gray-200 bg-white">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={isStaff ? "Odgovorite korisniku..." : "Pošaljite poruku..."}
                        className="flex-1 bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={loading || !newMessage.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
                      >
                        <Send className="w-5 h-5" />
                        Pošalji
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <AlertCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-semibold">Odaberite tiket</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
