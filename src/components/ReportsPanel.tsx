import { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { supabase, Car } from '../lib/supabase';

interface Report {
  id: string;
  car_id: string;
  reported_by: string;
  reported_user_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
}

interface ReportWithDetails extends Report {
  car: Car | null;
  reporter_nickname: string;
  reported_user_nickname: string;
}

interface ReportsPanelProps {
  onClose: () => void;
}

export function ReportsPanel({ onClose }: ReportsPanelProps) {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadReports();

    const subscription = supabase
      .channel('reports_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          loadReports();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filterStatus]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select('*, car:cars(*)')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      const reportsWithDetails = await Promise.all(
        (data || []).map(async (report) => {
          const [reporterProfile, reportedUserProfile] = await Promise.all([
            supabase.from('user_profiles').select('nickname').eq('id', report.reported_by).maybeSingle(),
            report.reported_user_id
              ? supabase.from('user_profiles').select('nickname').eq('id', report.reported_user_id).maybeSingle()
              : Promise.resolve({ data: null })
          ]);

          return {
            ...report,
            reporter_nickname: reporterProfile.data?.nickname || 'Nepoznato',
            reported_user_nickname: reportedUserProfile.data?.nickname || 'Nepoznato'
          };
        })
      );

      setReports(reportsWithDetails);
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Greška pri učitavanju prijava');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const report = reports.find(r => r.id === reportId);

      if (newStatus === 'resolved' && report?.car) {
        const { error: deleteError } = await supabase
          .from('cars')
          .delete()
          .eq('id', report.car_id);

        if (deleteError) throw deleteError;
      }

      const { error } = await supabase
        .from('reports')
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || null
        })
        .eq('id', reportId);

      if (error) throw error;

      setSelectedReport(null);
      setResolutionNotes('');
      loadReports();

      if (newStatus === 'resolved') {
        alert('Oglas je obrisan i prijava je riješena');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Greška pri ažuriranju prijave');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Na čekanju';
      case 'resolved':
        return 'Riješeno';
      case 'dismissed':
        return 'Odbačeno';
      default:
        return status;
    }
  };

  const filteredReports = filterStatus === 'all'
    ? reports
    : reports.filter(r => r.status === filterStatus);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">Prijavljeni oglasi</h2>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-medium">
              {reports.filter(r => r.status === 'pending').length} novih
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-white/10">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'resolved', 'dismissed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filterStatus === status
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {status === 'all' ? 'Sve' : getStatusText(status)}
                {status !== 'all' && (
                  <span className="ml-2 opacity-60">
                    ({reports.filter(r => r.status === status).length})
                  </span>
                )}
                {status === 'all' && (
                  <span className="ml-2 opacity-60">({reports.length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Učitavanje...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Nema prijava
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(report.status)}
                        <span className="text-sm font-medium text-gray-400">
                          {getStatusText(report.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(report.created_at).toLocaleString('sr-RS')}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Oglas:</span>
                          <span className="text-white font-medium">
                            {report.car ? `${report.car.brand} ${report.car.model}` : 'Obrisan oglas'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-400">
                            Prijavio: {report.reporter_nickname}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-sm text-gray-400">
                            Vlasnik: {report.reported_user_nickname}
                          </span>
                        </div>
                      </div>

                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                        <div className="text-sm font-medium text-orange-500 mb-1">
                          {report.reason}
                        </div>
                        {report.description && (
                          <div className="text-sm text-gray-400">
                            {report.description}
                          </div>
                        )}
                      </div>

                      {report.resolution_notes && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <div className="text-sm text-blue-400">
                            <strong>Napomena:</strong> {report.resolution_notes}
                          </div>
                        </div>
                      )}
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm font-medium"
                        >
                          Pregledi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Pregledi prijavu</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Napomena (opciono)
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Dodajte napomenu o odluci..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (selectedReport.car && confirm('Ovom akcijom ćete obrisati oglas. Da li ste sigurni?')) {
                      handleUpdateStatus(selectedReport.id, 'resolved');
                    } else if (!selectedReport.car) {
                      handleUpdateStatus(selectedReport.id, 'resolved');
                    }
                  }}
                  disabled={processing}
                  className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Riješeno
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                  disabled={processing}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Odbaci
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
