import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit2, Trash2, Image as ImageIcon, ExternalLink, Eye, EyeOff, TrendingUp, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

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
  const { user } = useAuth();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Molimo odaberite sliku');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Slika je prevelika. Maksimalna veličina je 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('advertisement-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Greška pri upload-u slike');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('advertisement-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Greška pri upload-u slike');
    } finally {
      setUploadingImage(false);
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
    <div className="w-full space-y-6 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upravljanje Reklamama</h2>
        <p className="text-gray-600">Ukupno {advertisements.length} reklama</p>
      </div>

      <div className="space-y-6">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj novu reklamu
            </button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingAd ? 'Uredi reklamu' : 'Nova reklama'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Naslov *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Naziv reklame"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Kratki opis (opciono)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slika za banner
                  </label>

                  {formData.image_url && (
                    <div className="mb-4 relative">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border-2 border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-700 border-t-transparent"></div>
                          <span>Upload...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload sliku</span>
                        </>
                      )}
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    Max 5MB · JPG, PNG, GIF, WEBP · Preporučena dimenzija: 1200x300px
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link za otvaranje (opciono)
                  </label>
                  <input
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pozicija *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                    className="w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Aktivna reklama
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-sm"
                >
                  {editingAd ? 'Spremi promjene' : 'Dodaj reklamu'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-gray-300"
                >
                  Odustani
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
              <p className="text-gray-600 mt-4">Učitavanje...</p>
            </div>
          ) : advertisements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nema reklama</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {advertisements.map((ad) => (
                <div
                  key={ad.id}
                  className={`bg-white rounded-xl overflow-hidden border shadow-sm ${
                    ad.is_active ? 'border-cyan-500' : 'border-gray-200'
                  }`}
                >
                  {ad.image_url && (
                    <div className="relative">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg ${
                          ad.is_active
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {ad.is_active ? 'Aktivna' : 'Neaktivna'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-blue-500 text-white shadow-lg">
                          Pozicija {ad.position}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{ad.title}</h3>
                      {ad.description && (
                        <p className="text-sm text-gray-600">{ad.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
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

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => toggleActive(ad)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 border border-gray-300"
                      >
                        {ad.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {ad.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
                      </button>
                      <button
                        onClick={() => handleEdit(ad)}
                        className="px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg transition-colors flex items-center gap-2 border border-cyan-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        Uredi
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors flex items-center gap-2 border border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Obriši
                      </button>
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