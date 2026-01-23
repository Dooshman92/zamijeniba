import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadCarImage } from '../lib/storage';
import { useAuth } from '../lib/auth';
import { carBrands, carModels, carColors, fuelTypes, transmissionTypes, yearOptions } from '../data/carOptions';

interface AddCarFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddCarForm({ onClose, onSuccess }: AddCarFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: 0,
    mileage: 0,
    price: 0,
    fuel_type: '',
    description: '',
    color: '',
    transmission: '',
    kilowatts: 0,
    horse_power: 0
  });

  const handleKilowattsChange = (kw: number) => {
    const hp = Math.round(kw * 1.35962);
    setFormData({ ...formData, kilowatts: kw, horse_power: hp });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10485760) {
        alert('Slika je prevelika. Maksimalna veličina je 10MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Morate biti prijavljeni da biste dodali automobil');
      return;
    }

    if (!imageFile) {
      alert('Molimo dodajte sliku automobila');
      return;
    }

    setLoading(true);

    const imageUrl = await uploadCarImage(imageFile, user.id);

    if (!imageUrl) {
      alert('Greška pri upload-u slike');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('cars').insert([{
      ...formData,
      image_url: imageUrl,
      user_id: user.id,
      user_email: user.email,
      user_name: user.email?.split('@')[0] || 'Korisnik'
    }]);

    if (error) {
      console.error('Error adding car:', error);
      alert('Greška pri dodavanju automobila');
    } else {
      onSuccess();
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dodaj automobil</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Slika automobila
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Kliknite da odaberete sliku</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF do 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marka
              </label>
              <select
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Odaberi marku</option>
                {carBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Model
              </label>
              <select
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.brand}
              >
                <option value="">Odaberi model</option>
                {formData.brand && carModels[formData.brand]?.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Godina proizvodnje
              </label>
              <select
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Odaberi godinu</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kilometraža
              </label>
              <input
                type="number"
                required
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cijena (KM)
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                placeholder="npr. 15000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gorivo
              </label>
              <select
                required
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Odaberi gorivo</option>
                {fuelTypes.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Boja
              </label>
              <select
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Odaberi boju</option>
                {carColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mjenjač
              </label>
              <select
                required
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Odaberi mjenjač</option>
                {transmissionTypes.map((transmission) => (
                  <option key={transmission} value={transmission}>
                    {transmission}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Snaga motora (kW)
              </label>
              <input
                type="number"
                value={formData.kilowatts || ''}
                onChange={(e) => handleKilowattsChange(parseInt(e.target.value) || 0)}
                placeholder="npr. 110"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.kilowatts > 0 && (
                <p className="text-xs text-gray-600 mt-1">≈ {formData.horse_power} KS</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Opis
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Dodavanje...' : 'Dodaj automobil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
