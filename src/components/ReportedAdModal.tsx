import { useState, useEffect } from 'react';
import { X, Eye, Trash2, AlertTriangle, CheckCircle, XCircle, User, Calendar, Tag, Shield } from 'lucide-react';
import { supabase, Car } from '../lib/supabase';
import { getCarImageUrl } from '../lib/storage';

interface ReportedAdModalProps {
  report: {
    id: string;
    car_id: string;
    reported_by: string;
    reported_user_id: string;
    reason: string;
    description: string | null;
    status: string;
    created_at: string;
    car: Car | null;
    reporter_nickname: string;
    reported_user_nickname: string;
  };
  onClose: () => void;
  onActionComplete: () => void;
}

export function ReportedAdModal({ report, onClose, onActionComplete }: ReportedAdModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showCarDetails, setShowCarDetails] = useState(true);
  const [carImageUrl, setCarImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadCarImage = async () => {
      if (report.car?.images && report.car.images.length > 0) {
        const url = await getCarImageUrl(report.car.images[0]);
        setCarImageUrl(url);
      }
    };
    loadCarImage();
  }, [report.car]);

  const handleDeleteAd = async () => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj oglas? Ova akcija je nepovratna.')) {
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: deleteError } = await supabase
        .from('cars')
        .delete()
        .eq('id', report.car_id);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || 'Oglas obrisan zbog kršenja pravila'
        })
        .eq('id', report.id);

      if (updateError) throw updateError;

      await supabase.from('system_notifications').insert({
        user_id: report.reported_user_id,
        type: 'ad_deleted',
        title: 'Oglas obrisan',
        message: `Vaš oglas "${report.car?.brand} ${report.car?.model}" je obrisan zbog kršenja pravila. ${resolutionNotes ? `Razlog: ${resolutionNotes}` : ''}`,
        priority: 'high'
      });

      await supabase.from('system_notifications').insert({
        user_id: report.reported_by,
        type: 'report_resolved',
        title: 'Prijava riješena',
        message: `Vaša prijava za oglas "${report.car?.brand} ${report.car?.model}" je riješena. Oglas je obrisan.`,
        priority: 'medium'
      });

      alert('Oglas je uspješno obrisan i notifikacije poslate');
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Greška pri brisanju oglasa');
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = async () => {
    if (!confirm('Da li želite odbaciti ovu prijavu? Oglas će ostati aktivan.')) {
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reports')
        .update({
          status: 'dismissed',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || 'Prijava odbijena - oglas ne krši pravila'
        })
        .eq('id', report.id);

      if (error) throw error;

      await supabase.from('system_notifications').insert({
        user_id: report.reported_by,
        type: 'report_dismissed',
        title: 'Prijava odbijena',
        message: `Vaša prijava za oglas "${report.car?.brand} ${report.car?.model}" je odbijena. Oglas ne krši pravila platforme. ${resolutionNotes ? `Napomena: ${resolutionNotes}` : ''}`,
        priority: 'low'
      });

      alert('Prijava je odbijena i notifikacija poslata');
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Error dismissing report:', error);
      alert('Greška pri odbacivanju prijave');
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestCorrection = async () => {
    if (!resolutionNotes.trim()) {
      alert('Molimo unesite šta korisnik treba da ispravi na oglasu');
      return;
    }

    if (!confirm('Da li želite zatražiti ispravku ovog oglasa od vlasnika?')) {
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reports')
        .update({
          status: 'reviewed',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: `Potrebna ispravka: ${resolutionNotes}`
        })
        .eq('id', report.id);

      if (error) throw error;

      await supabase.from('system_notifications').insert({
        user_id: report.reported_user_id,
        type: 'correction_required',
        title: 'Potrebna ispravka oglasa',
        message: `Vaš oglas "${report.car?.brand} ${report.car?.model}" zahtijeva ispravku. Detalji: ${resolutionNotes}`,
        priority: 'high'
      });

      await supabase.from('system_notifications').insert({
        user_id: report.reported_by,
        type: 'report_reviewed',
        title: 'Prijava pregledana',
        message: `Vaša prijava za oglas "${report.car?.brand} ${report.car?.model}" je pregledana. Od vlasnika je zatražena ispravka oglasa.`,
        priority: 'low'
      });

      alert('Zahtjev za ispravku je poslat i notifikacije poslate');
      onActionComplete();
      onClose();
    } catch (error) {
      console.error('Error requesting correction:', error);
      alert('Greška pri slanju zahtjeva');
    } finally {
      setProcessing(false);
    }
  };

  if (!report.car) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/10 p-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Oglas je već obrisan</h3>
            <p className="text-gray-400 mb-6">Ovaj oglas više ne postoji u sistemu.</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              Zatvori
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl border border-white/10 my-8">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">Pregled prijavljenog oglasa</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-red-500 font-bold mb-2">Razlog prijave</h3>
                <p className="text-white font-medium mb-2">{report.reason}</p>
                {report.description && (
                  <p className="text-gray-300 text-sm">{report.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-medium text-gray-400">Prijavio</span>
              </div>
              <p className="text-white font-medium">{report.reporter_nickname}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-400">Vlasnik oglasa</span>
              </div>
              <p className="text-white font-medium">{report.reported_user_nickname}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-400">Prijavljeno</span>
              </div>
              <p className="text-white font-medium">
                {new Date(report.created_at).toLocaleString('sr-RS')}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-400">Status</span>
              </div>
              <p className="text-white font-medium">
                {report.status === 'pending' ? 'Na čekanju' : report.status}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <button
              onClick={() => setShowCarDetails(!showCarDetails)}
              className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-all font-medium mb-4"
            >
              <Eye className="w-5 h-5" />
              {showCarDetails ? 'Sakrij' : 'Prikaži'} detalje oglasa
            </button>

            {showCarDetails && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex items-start gap-6">
                  {carImageUrl && (
                    <img
                      src={carImageUrl}
                      alt={`${report.car.brand} ${report.car.model}`}
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {report.car.brand} {report.car.model}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Godina:</span>
                        <span className="text-white font-medium">{report.car.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cijena:</span>
                        <span className="text-white font-medium">{report.car.price.toLocaleString()} KM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Kilometraža:</span>
                        <span className="text-white font-medium">{report.car.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gorivo:</span>
                        <span className="text-white font-medium">{report.car.fuel_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Transmisija:</span>
                        <span className="text-white font-medium">{report.car.transmission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Lokacija:</span>
                        <span className="text-white font-medium">{report.car.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {report.car.description && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Opis:</h4>
                    <p className="text-gray-300 text-sm">{report.car.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Napomena (obavezno za ispravku, opciono za ostale akcije)
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Za ispravku: opišite šta vlasnik treba popraviti na oglasu..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handleDeleteAd}
              disabled={processing}
              className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
            >
              <Trash2 className="w-5 h-5" />
              Obriši oglas
            </button>

            <button
              onClick={handleRequestCorrection}
              disabled={processing}
              className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
            >
              <Shield className="w-5 h-5" />
              Zatraži ispravku
            </button>

            <button
              onClick={handleDismiss}
              disabled={processing}
              className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
            >
              <CheckCircle className="w-5 h-5" />
              Oglas je u redu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
