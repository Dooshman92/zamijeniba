import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Star, Crown } from 'lucide-react';
import { supabase, UserProfile } from '../lib/supabase';
import { uploadMultipleCarImages } from '../lib/storage';
import { useAuth } from '../lib/auth';
import { carBrands, carModels, carColors, fuelTypes, transmissionTypes, driveTypes, yearOptions } from '../data/carOptions';
import { bosnianCities } from '../data/cities';

interface AddCarFormMultiStepProps {
  onClose: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  carToEdit?: any;
}

export function AddCarFormMultiStep({ onClose, onSuccess, editMode = false, carToEdit }: AddCarFormMultiStepProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth();

  const baseImageLimit = userProfile?.is_premium ? 15 : 5;
  const creditBonusImages = !userProfile?.is_premium ? Math.min(userProfile?.credits || 0, 10) : 0;
  const imageLimit = baseImageLimit + creditBonusImages;

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (editMode && carToEdit) {
      loadExistingImages();
    }
  }, [editMode, carToEdit]);

  const loadExistingImages = async () => {
    if (!carToEdit?.id) return;

    const { data } = await supabase
      .from('car_images')
      .select('image_url')
      .eq('car_id', carToEdit.id)
      .order('order_index', { ascending: true });

    if (data) {
      setImagePreviews(data.map(img => img.image_url));
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
    }
  };

  const [formData, setFormData] = useState({
    brand: carToEdit?.brand || '',
    model: carToEdit?.model || '',
    year: carToEdit?.year || '' as any,
    mileage: carToEdit?.mileage || '' as any,
    price: carToEdit?.price || '' as any,
    fuel_type: carToEdit?.fuel_type || '',
    color: carToEdit?.color || '',
    transmission: carToEdit?.transmission || '',
    drive_type: carToEdit?.drive_type || '',
    kilowatts: carToEdit?.kilowatts || '' as any,
    horse_power: carToEdit?.horse_power || '' as any,
    engine_size: carToEdit?.engine_size || '',
    doors: carToEdit?.doors || 4,
    seats: carToEdit?.seats || 5,
    location: carToEdit?.location || '',
    description: carToEdit?.description || '',
    body_condition: carToEdit?.body_condition || 5,
    mechanical_condition: carToEdit?.mechanical_condition || 5,
    interior_condition: carToEdit?.interior_condition || 5,
    damaged: carToEdit?.damaged || false,
    xenon_lights: carToEdit?.xenon_lights || false,
    heated_seats: carToEdit?.heated_seats || false,
    leather_seats: carToEdit?.leather_seats || false,
    sunroof: carToEdit?.sunroof || false,
    parking_camera: carToEdit?.parking_camera || false,
    navigation: carToEdit?.navigation || false,
    bluetooth: carToEdit?.bluetooth || false,
    cruise_control: carToEdit?.cruise_control || false,
    climate_control: carToEdit?.climate_control || false,
    alloy_wheels: carToEdit?.alloy_wheels || false,
    fog_lights: carToEdit?.fog_lights || false,
    roof_rack: carToEdit?.roof_rack || false,
    tow_hitch: carToEdit?.tow_hitch || false,
    sport_package: carToEdit?.sport_package || false,
    winter_tires: carToEdit?.winter_tires || false,
    summer_tires: carToEdit?.summer_tires || false,
    spare_tire: carToEdit?.spare_tire || false,
    electric_windows: carToEdit?.electric_windows || false,
    electric_mirrors: carToEdit?.electric_mirrors || false,
    abs: carToEdit?.abs || false,
    esp: carToEdit?.esp || false,
    central_locking: carToEdit?.central_locking || false,
    alarm: carToEdit?.alarm || false,
    immobilizer: carToEdit?.immobilizer || false,
    rain_sensor: carToEdit?.rain_sensor || false,
    light_sensor: carToEdit?.light_sensor || false,
    tinted_windows: carToEdit?.tinted_windows || false,
    electric_seats: carToEdit?.electric_seats || false,
    memory_seats: carToEdit?.memory_seats || false,
    sport_seats: carToEdit?.sport_seats || false,
    isofix: carToEdit?.isofix || false,
    start_stop: carToEdit?.start_stop || false,
    keyless_entry: carToEdit?.keyless_entry || false,
    rear_parking_sensors: carToEdit?.rear_parking_sensors || false,
    front_parking_sensors: carToEdit?.front_parking_sensors || false,
  });

  const handleKilowattsChange = (kw: number) => {
    if (isNaN(kw) || kw === 0) {
      setFormData({ ...formData, kilowatts: '', horse_power: '' });
    } else {
      const hp = Math.round(kw * 1.35962);
      setFormData({ ...formData, kilowatts: kw, horse_power: hp });
    }
  };

  const [preferences, setPreferences] = useState({
    preferred_brands: [] as string[],
    min_year: 2000,
    max_year: new Date().getFullYear(),
    preferred_fuel_types: [] as string[],
    max_mileage: 200000,
    price_difference: 0,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = imageLimit - imageFiles.length;
    const validFiles = files
      .filter(file => file.size <= 10485760)
      .slice(0, remainingSlots);

    if (validFiles.length < files.length) {
      const isPremium = userProfile?.is_premium;
      if (!isPremium && imageFiles.length + files.length > imageLimit) {
        const extraImages = Math.max(0, imageFiles.length + files.length - 5);
        alert(`Besplatni korisnici imaju 5 besplatnih slika. Svaka dodatna slika košta 1 kredit. Imate ${userProfile?.credits || 0} kredita. Nadogradite na Premium za do 15 besplatnih slika!`);
      } else if (isPremium && imageFiles.length + files.length > 15) {
        alert(`Premium korisnici mogu dodati do 15 slika.`);
      } else {
        alert('Neke slike su prevelike (max 10MB)');
      }
    }

    setImageFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Morate biti prijavljeni');
      return;
    }

    if (!editMode && imageFiles.length === 0) {
      alert('Dodajte najmanje jednu sliku');
      return;
    }

    if (editMode && imagePreviews.length === 0 && imageFiles.length === 0) {
      alert('Dodajte najmanje jednu sliku');
      return;
    }

    if (!formData.brand || !formData.model || !formData.year || !formData.mileage ||
        !formData.price || !formData.fuel_type || !formData.color || !formData.transmission ||
        !formData.kilowatts || !formData.engine_size || !formData.location || !formData.description) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    setLoading(true);

    if (editMode && carToEdit) {
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleCarImages(imageFiles, user.id);
        imageUrls = [...imagePreviews, ...uploadedUrls];
      } else {
        imageUrls = imagePreviews;
      }

      const cleanFormData = {
        ...formData,
        year: formData.year || null,
        mileage: formData.mileage || null,
        price: formData.price || null,
        kilowatts: formData.kilowatts || null,
        horse_power: formData.horse_power || null,
        doors: formData.doors || 4,
        seats: formData.seats || 5,
        image_url: imageUrls[0],
      };

      const { error: updateError } = await supabase
        .from('cars')
        .update(cleanFormData)
        .eq('id', carToEdit.id);

      if (updateError) {
        alert('Greška pri ažuriranju automobila');
        setLoading(false);
        return;
      }

      await supabase
        .from('car_images')
        .delete()
        .eq('car_id', carToEdit.id);

      const imageInserts = imageUrls.map((url, index) => ({
        car_id: carToEdit.id,
        image_url: url,
        is_primary: index === 0,
        order_index: index,
      }));

      await supabase.from('car_images').insert(imageInserts);

      onSuccess();
      onClose();
      setLoading(false);
      return;
    }

    const { count: activeAdsCount } = await supabase
      .from('cars')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (!userProfile?.is_premium) {
      const allowedAds = 1 + Math.floor((userProfile?.credits || 0) / 10);
      if ((activeAdsCount || 0) >= allowedAds) {
        alert(
          `Besplatni korisnici mogu imati ${allowedAds} aktivni oglas. ${
            (userProfile?.credits || 0) < 10
              ? 'Nadogradite na Premium ili koristite promo kod za dodatne kredite!'
              : 'Potrebno je 10 kredita za dodatni oglas.'
          }`
        );
        setLoading(false);
        return;
      }
    }

    const imageUrls = await uploadMultipleCarImages(imageFiles, user.id);

    if (imageUrls.length === 0) {
      alert('Greška pri upload-u slika');
      setLoading(false);
      return;
    }

    const cleanFormData = {
      ...formData,
      year: formData.year || null,
      mileage: formData.mileage || null,
      price: formData.price || null,
      kilowatts: formData.kilowatts || null,
      horse_power: formData.horse_power || null,
      doors: formData.doors || 4,
      seats: formData.seats || 5,
    };

    const isPremium = userProfile?.is_premium && userProfile?.premium_expires_at;
    const featuredUntil = isPremium ? userProfile.premium_expires_at : null;

    const { data: carData, error: carError } = await supabase
      .from('cars')
      .insert([{
        ...cleanFormData,
        image_url: imageUrls[0],
        user_id: user.id,
        user_email: user.email,
        user_name: user.email?.split('@')[0] || 'Korisnik',
        priority_score: isPremium ? 100 : 0,
        is_featured: isPremium,
        featured_until: featuredUntil
      }])
      .select('*')
      .single();

    if (carError || !carData) {
      alert('Greška pri dodavanju automobila');
      setLoading(false);
      return;
    }

    const imageInserts = imageUrls.map((url, index) => ({
      car_id: carData.id,
      image_url: url,
      is_primary: index === 0,
      order_index: index,
    }));

    await supabase.from('car_images').insert(imageInserts);

    await supabase.from('car_preferences').insert([{
      car_id: carData.id,
      ...preferences,
    }]);

    if (!userProfile?.is_premium) {
      let creditsToDeduct = 0;

      if ((activeAdsCount || 0) > 0) {
        creditsToDeduct += 10;
      }

      const extraImages = Math.max(0, imageFiles.length - 5);
      creditsToDeduct += extraImages;

      if (creditsToDeduct > 0) {
        const newCredits = Math.max(0, (userProfile?.credits || 0) - creditsToDeduct);
        await supabase
          .from('user_profiles')
          .update({ credits: newCredits })
          .eq('id', user.id);
      }
    }

    onSuccess();
    onClose();
    setLoading(false);
  };

  const nextStep = () => {
    const maxStep = editMode ? 3 : 4;
    if (currentStep < maxStep) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderRatingInput = (label: string, value: number, onChange: (val: number) => void) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        {[...Array(10)].map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className={`p-2 transition-colors ${
              i < value ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium">{value}/10</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{editMode ? 'Uredi automobil' : 'Dodaj automobil'}</h2>
            <p className="text-sm text-gray-600">Korak {currentStep} od {editMode ? 3 : 4}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="flex justify-between mb-6">
            {Array.from({ length: editMode ? 3 : 4 }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                } ${step < (editMode ? 3 : 4) ? 'mr-2' : ''}`}
              />
            ))}
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Osnovni podaci</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marka *</label>
                  <select
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberi</option>
                    {carBrands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Model *</label>
                  <select
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.brand}
                  >
                    <option value="">Odaberi</option>
                    {formData.brand && carModels[formData.brand]?.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Godina *</label>
                  <select
                    required
                    value={formData.year}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({ ...formData, year: isNaN(value) ? '' : value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberi</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kilometraža *</label>
                  <input
                    type="number"
                    required
                    value={formData.mileage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({ ...formData, mileage: isNaN(value) ? '' : value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cijena (KM) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({ ...formData, price: isNaN(value) ? '' : value });
                    }}
                    placeholder="npr. 15000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lokacija *</label>
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberi</option>
                    {bosnianCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gorivo *</label>
                  <select
                    required
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberi</option>
                    {fuelTypes.map((fuel) => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mjenjač *</label>
                  <select
                    required
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberi</option>
                    {transmissionTypes.map((trans) => (
                      <option key={trans} value={trans}>{trans}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pogon</label>
                  <select
                    value={formData.drive_type}
                    onChange={(e) => setFormData({ ...formData, drive_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberi</option>
                    {driveTypes.map((drive) => (
                      <option key={drive} value={drive}>{drive}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Boja *</label>
                  <select
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberi</option>
                    {carColors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Snaga motora (kW)</label>
                  <input
                    type="number"
                    value={formData.kilowatts || ''}
                    onChange={(e) => handleKilowattsChange(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="npr. 110"
                  />
                  {formData.kilowatts > 0 && (
                    <p className="text-xs text-gray-600 mt-1">≈ {formData.horse_power} KS</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Zapremina motora</label>
                  <input
                    type="text"
                    placeholder="npr. 2.0L"
                    value={formData.engine_size}
                    onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Broj vrata</label>
                  <input
                    type="number"
                    value={formData.doors}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({ ...formData, doors: isNaN(value) ? 4 : value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Broj sjedišta</label>
                  <input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({ ...formData, seats: isNaN(value) ? 5 : value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Opis *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Detaljan opis vozila..."
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-3 cursor-pointer bg-orange-50 border-2 border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.damaged}
                    onChange={(e) => setFormData({ ...formData, damaged: e.target.checked })}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-900">Vozilo je oštećeno / havarisan</span>
                    <p className="text-xs text-gray-600 mt-1">Označite ako vozilo ima štetu od udesa ili druge ozbiljne oštećenja</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ocjena stanja</h3>
                {renderRatingInput('Stanje karoserije', formData.body_condition, (val) =>
                  setFormData({ ...formData, body_condition: val })
                )}
                {renderRatingInput('Mehaničko stanje', formData.mechanical_condition, (val) =>
                  setFormData({ ...formData, mechanical_condition: val })
                )}
                {renderRatingInput('Stanje enterijera', formData.interior_condition, (val) =>
                  setFormData({ ...formData, interior_condition: val })
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Oprema</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Rasvjeta i vidljivost</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.xenon_lights}
                          onChange={(e) => setFormData({ ...formData, xenon_lights: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Xenon/LED farovi</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.fog_lights}
                          onChange={(e) => setFormData({ ...formData, fog_lights: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Maglenke</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rain_sensor}
                          onChange={(e) => setFormData({ ...formData, rain_sensor: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Senzor za kišu</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.light_sensor}
                          onChange={(e) => setFormData({ ...formData, light_sensor: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Senzor za svjetlo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tinted_windows}
                          onChange={(e) => setFormData({ ...formData, tinted_windows: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Zatamnjena stakla</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Komfor</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.heated_seats}
                          onChange={(e) => setFormData({ ...formData, heated_seats: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Grijači sjedišta</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.leather_seats}
                          onChange={(e) => setFormData({ ...formData, leather_seats: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Kožna sjedišta</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.electric_seats}
                          onChange={(e) => setFormData({ ...formData, electric_seats: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Električna sjedišta</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.memory_seats}
                          onChange={(e) => setFormData({ ...formData, memory_seats: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Memory sjedišta</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sport_seats}
                          onChange={(e) => setFormData({ ...formData, sport_seats: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Sport sjedišta</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sunroof}
                          onChange={(e) => setFormData({ ...formData, sunroof: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Panorama krov</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.climate_control}
                          onChange={(e) => setFormData({ ...formData, climate_control: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Klima automatik</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cruise_control}
                          onChange={(e) => setFormData({ ...formData, cruise_control: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Tempomat</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.electric_windows}
                          onChange={(e) => setFormData({ ...formData, electric_windows: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Električni podizači stakala</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.electric_mirrors}
                          onChange={(e) => setFormData({ ...formData, electric_mirrors: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Električni retrovizori</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.keyless_entry}
                          onChange={(e) => setFormData({ ...formData, keyless_entry: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Keyless Entry</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.start_stop}
                          onChange={(e) => setFormData({ ...formData, start_stop: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Start/Stop sistem</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isofix}
                          onChange={(e) => setFormData({ ...formData, isofix: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Isofix</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Sigurnost</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.abs}
                          onChange={(e) => setFormData({ ...formData, abs: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">ABS</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.esp}
                          onChange={(e) => setFormData({ ...formData, esp: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">ESP</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.central_locking}
                          onChange={(e) => setFormData({ ...formData, central_locking: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Centralno zaključavanje</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.alarm}
                          onChange={(e) => setFormData({ ...formData, alarm: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Alarm</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.immobilizer}
                          onChange={(e) => setFormData({ ...formData, immobilizer: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Imobilajzer</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Pomoć pri parkiranju</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rear_parking_sensors}
                          onChange={(e) => setFormData({ ...formData, rear_parking_sensors: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Zadnji park senzori</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.front_parking_sensors}
                          onChange={(e) => setFormData({ ...formData, front_parking_sensors: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Prednji park senzori</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.parking_camera}
                          onChange={(e) => setFormData({ ...formData, parking_camera: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Kamera</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Multimedija</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.navigation}
                          onChange={(e) => setFormData({ ...formData, navigation: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Navigacija</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.bluetooth}
                          onChange={(e) => setFormData({ ...formData, bluetooth: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Bluetooth</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Eksterijer</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.alloy_wheels}
                          onChange={(e) => setFormData({ ...formData, alloy_wheels: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Alu felge</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.roof_rack}
                          onChange={(e) => setFormData({ ...formData, roof_rack: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Krovni nosač</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.tow_hitch}
                          onChange={(e) => setFormData({ ...formData, tow_hitch: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Kuka za vuču</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.sport_package}
                          onChange={(e) => setFormData({ ...formData, sport_package: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Sport paket</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Gume</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.winter_tires}
                          onChange={(e) => setFormData({ ...formData, winter_tires: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Zimske gume</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.summer_tires}
                          onChange={(e) => setFormData({ ...formData, summer_tires: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Ljetne gume</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.spare_tire}
                          onChange={(e) => setFormData({ ...formData, spare_tire: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Rezervna guma</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Slike vozila</h3>
                {userProfile?.is_premium ? (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Crown className="w-4 h-4" />
                    Premium - do 15 slika
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                    Free - do 7 slika
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>{imageFiles.length} / {imageLimit}</strong> slika dodano
                </p>
                {!userProfile?.is_premium && (
                  <p className="text-xs text-blue-700 mt-2">
                    Želite više slika? Nadogradite na Premium i dobijte do 15 slika po oglasu!
                  </p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Kliknite da odaberete slike</p>
                  <p className="text-xs text-gray-500">PNG, JPG do 10MB (max {imageLimit} slika)</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={imageFiles.length >= imageLimit}
                  />
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Glavna
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!editMode && currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Preferencije za zamjenu</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferirane marke</label>
                <select
                  multiple
                  value={preferences.preferred_brands}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferred_brands: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                >
                  {carBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Držite Ctrl/Cmd za više izbora</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min. godina</label>
                  <input
                    type="number"
                    value={preferences.min_year}
                    onChange={(e) => setPreferences({ ...preferences, min_year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max. godina</label>
                  <input
                    type="number"
                    value={preferences.max_year}
                    onChange={(e) => setPreferences({ ...preferences, max_year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max. kilometraža</label>
                <input
                  type="number"
                  value={preferences.max_mileage}
                  onChange={(e) => setPreferences({ ...preferences, max_mileage: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Razlika u cijeni (koliko ste spremni doplatiti €)
                </label>
                <input
                  type="number"
                  value={preferences.price_difference}
                  onChange={(e) => setPreferences({ ...preferences, price_difference: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Nazad
          </button>

          {currentStep < (editMode ? 3 : 4) ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Dalje
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (editMode ? 'Ažuriranje...' : 'Dodavanje...') : 'Završi'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
