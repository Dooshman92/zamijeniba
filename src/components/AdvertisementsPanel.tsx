import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Image as ImageIcon, ExternalLink, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_url: string | null;
  position: number;
  is_active: boolean;
  clicks_count: number;
  created_at: string;
  updated_at: string;
}

interface AdvertisementsPanelProps {
  onClose: () => void;
}

export default function AdvertisementsPanel({ onClose }: AdvertisementsPanelProps) {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    target_url: '',
    position: 1,
    is_active: true
  });

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const loadAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error loading advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update({
            title: formData.title,
            description: formData.description || null,
            image_url: formData.image_url || null,
            target_url: formData.target_url || null,
            position: formData.position,
            is_active: formData.is_active
          })
          .eq('id', editingAd.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert([{
            title: formData.title,
            description: formData.description || null,
            image_url: formData.image_url || null,
            target_url: formData.target_url || null,
            position: formData.position,
            is_active: formData.is_active
          }]);

        if (error) throw error;
      }

      setShowForm(false);
      setEditingAd(null);
      setFormData({
        title: '',
        description: '',
        image_url: '',
        target_url: '',
        position: 1,
        is_active: true
      });
      loadAdvertisements();
    } catch (error) {
      console.error('Error saving advertisement:', error);
      alert('Greška pri spremanju reklame');
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url || '',
      target_url: ad.target_url || '',
      position: ad.position,
      is_active: ad.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovu reklamu?')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAdvertisements();
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      alert('Greška pri brisanju reklame');
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !ad.is_active })
        .eq('id', ad.id);

      if (error) throw error;
      loadAdvertisements();
    } catch (error) {
      console.error('Error toggling advertisement:', error);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingAd(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      target_url: '',
      position: 1,
      is_active: true
    });
  };

  return (
    <div className="w-full">
      <div className="p-6">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj novu reklamu
            </button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingAd ? 'Uredi reklamu' : 'Nova reklama'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Naslov *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Naziv reklame"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Opis
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    placeholder="Kratki opis (opciono)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL slike
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link za otvaranje (opciono)
                  </label>
                  <input
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pozicija *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1}>Lijevo (1)</option>
                    <option value={2}>Sredina (2)</option>
                    <option value={3}>Desno (3)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-300">
                    Aktivna reklama
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
                >
                  {editingAd ? 'Spremi promjene' : 'Dodaj reklamu'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="flex-1 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                >
                  Odustani
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Učitavanje...</p>
            </div>
          ) : advertisements.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
              <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Nema reklama</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {advertisements.map((ad) => (
                <div
                  key={ad.id}
                  className={`bg-white/5 rounded-xl p-6 border ${
                    ad.is_active ? 'border-cyan-500/30' : 'border-white/10'
                  }`}
                >
                  <div className="flex gap-4">
                    {ad.image_url && (
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white">{ad.title}</h3>
                          {ad.description && (
                            <p className="text-sm text-gray-400 mt-1">{ad.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ad.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {ad.is_active ? 'Aktivna' : 'Neaktivna'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                            Pozicija {ad.position}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        {ad.target_url && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" />
                            <span className="truncate max-w-xs">{ad.target_url}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{ad.clicks_count} klikova</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleActive(ad)}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          {ad.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                        </button>
                        <button
                          onClick={() => handleEdit(ad)}
                          className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Obriši
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}