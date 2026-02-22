import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Star, Crown } from 'lucide-react';
import { supabase, UserProfile, VehicleType } from '../lib/supabase';
import { uploadMultipleCarImages } from '../lib/storage';
import { useAuth } from '../lib/auth';
import { vehicleTypes, carBrands, carModels, carColors, fuelTypes, transmissionTypes, driveTypes, yearOptions, getBrandsByVehicleType, getFuelTypesByVehicleType, getModelsByVehicleType, getTransmissionTypesByVehicleType, getDoorOptionsByVehicleType, getSeatOptionsByVehicleType } from '../data/carOptions';
import { getEquipmentCategories, getEquipmentByCategory } from '../data/vehicleEquipment';
import { bosnianCities } from '../data/cities';
import { calculateCarAdCost, spendCredits, markFirstCarAdUsed } from '../lib/credits';
import { FEATURES } from '../config/features';

interface AddCarFormMultiStepProps {
  onClose: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  carToEdit?: any;
  premiumEnabled?: boolean;
}

export function AddCarFormMultiStep({ onClose, onSuccess, editMode = false, carToEdit, premiumEnabled = false }: AddCarFormMultiStepProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const baseImageLimit = (!premiumEnabled || userProfile?.is_premium) ? 15 : 5;
  const creditBonusImages = (premiumEnabled && !userProfile?.is_premium) ? Math.min(userProfile?.credits || 0, 10) : 0;
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
    vehicle_type: (carToEdit?.vehicle_type || 'automobil') as VehicleType,
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
    engine_displacement: carToEdit?.engine_displacement || '' as any,
    hull_material: carToEdit?.hull_material || '',
    track_length: carToEdit?.track_length || '' as any,
    doors: carToEdit?.doors || '4/5',
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

  const handleKilowattsChange = (value: string) => {
    if (!value || value === '') {
      setFormData({ ...formData, kilowatts: '' as any, horse_power: '' as any });
      return;
    }
    const kw = parseInt(value);
    if (isNaN(kw) || kw === 0) {
      setFormData({ ...formData, kilowatts: '' as any, horse_power: '' as any });
    } else {
      const hp = Math.round(kw * 1.35962);
      setFormData({ ...formData, kilowatts: kw, horse_power: hp });
    }
  };

  const [preferences, setPreferences] = useState({
    preferred_vehicle_type: '',
    preferred_brand: '',
    preferred_model: '',
    min_year: 2000,
    max_year: new Date().getFullYear(),
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

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full px-4 py-2 border rounded-lg focus:ring-2";
    const hasError = validationErrors.has(fieldName);
    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }
    return `${baseClass} border-gray-300 focus:ring-blue-500`;
  };

  const getTextareaClassName = (fieldName: string) => {
    const baseClass = "w-full px-4 py-2 border rounded-lg focus:ring-2 min-h-32";
    const hasError = validationErrors.has(fieldName);
    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }
    return `${baseClass} border-gray-300 focus:ring-blue-500`;
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

    const errors = new Set<string>();
    const missingFields: string[] = [];

    if (!formData.brand) {
      errors.add('brand');
      missingFields.push('Marka');
    }
    if (!formData.model) {
      errors.add('model');
      missingFields.push('Model');
    }
    if (!formData.year) {
      errors.add('year');
      missingFields.push('Godina');
    }
    if (!formData.mileage && formData.mileage !== 0) {
      errors.add('mileage');
      missingFields.push('Kilometraža');
    }
    if (!formData.price && formData.price !== 0) {
      errors.add('price');
      missingFields.push('Cijena');
    }
    if (!formData.fuel_type) {
      errors.add('fuel_type');
      missingFields.push('Gorivo');
    }
    if (!formData.color) {
      errors.add('color');
      missingFields.push('Boja');
    }
    if (!formData.transmission) {
      errors.add('transmission');
      missingFields.push('Mjenjač');
    }
    if (!formData.location) {
      errors.add('location');
      missingFields.push('Lokacija');
    }
    if (!formData.description) {
      errors.add('description');
      missingFields.push('Opis');
    }

    if (formData.vehicle_type === 'automobil') {
      if (!formData.kilowatts && formData.kilowatts !== 0) {
        errors.add('kilowatts');
        missingFields.push('Snaga (kW)');
      }
      if (!formData.engine_size) {
        errors.add('engine_size');
        missingFields.push('Zapremina motora');
      }
    } else if (formData.vehicle_type === 'motocikl' || formData.vehicle_type === 'quad') {
      if (!formData.engine_displacement && formData.engine_displacement !== 0) {
        errors.add('engine_displacement');
        missingFields.push('Zapremina motora (ccm)');
      }
    }

    if (errors.size > 0) {
      setValidationErrors(errors);
      alert(`Molimo popunite sva obavezna polja:\n\n${missingFields.join('\n')}`);
      return;
    }

    setValidationErrors(new Set());

    setLoading(true);

    if (editMode && carToEdit) {
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadMultipleCarImages(imageFiles, user.id);
        imageUrls = [...imagePreviews, ...uploadedUrls];
      } else {
        imageUrls = imagePreviews;
      }

      const cleanValue = (val: any): number | null => {
        if (val === '' || val === null || val === undefined || isNaN(Number(val))) {
          return null;
        }
        return Number(val);
      };

      const cleanFormData = {
        vehicle_type: formData.vehicle_type,
        brand: formData.brand,
        model: formData.model,
        year: cleanValue(formData.year),
        mileage: cleanValue(formData.mileage),
        price: cleanValue(formData.price),
        fuel_type: formData.fuel_type,
        color: formData.color,
        transmission: formData.transmission,
        drive_type: formData.drive_type || null,
        kilowatts: cleanValue(formData.kilowatts),
        horse_power: cleanValue(formData.horse_power),
        engine_size: formData.engine_size || null,
        engine_displacement: cleanValue(formData.engine_displacement),
        hull_material: formData.hull_material || null,
        track_length: cleanValue(formData.track_length),
        doors: formData.doors || '4/5',
        seats: cleanValue(formData.seats) || 5,
        location: formData.location,
        description: formData.description,
        body_condition: cleanValue(formData.body_condition) || 5,
        mechanical_condition: cleanValue(formData.mechanical_condition) || 5,
        interior_condition: cleanValue(formData.interior_condition) || 5,
        damaged: formData.damaged || false,
        xenon_lights: formData.xenon_lights || false,
        heated_seats: formData.heated_seats || false,
        leather_seats: formData.leather_seats || false,
        sunroof: formData.sunroof || false,
        parking_camera: formData.parking_camera || false,
        navigation: formData.navigation || false,
        bluetooth: formData.bluetooth || false,
        cruise_control: formData.cruise_control || false,
        climate_control: formData.climate_control || false,
        alloy_wheels: formData.alloy_wheels || false,
        fog_lights: formData.fog_lights || false,
        roof_rack: formData.roof_rack || false,
        tow_hitch: formData.tow_hitch || false,
        sport_package: formData.sport_package || false,
        winter_tires: formData.winter_tires || false,
        summer_tires: formData.summer_tires || false,
        spare_tire: formData.spare_tire || false,
        electric_windows: formData.electric_windows || false,
        electric_mirrors: formData.electric_mirrors || false,
        abs: formData.abs || false,
        esp: formData.esp || false,
        central_locking: formData.central_locking || false,
        alarm: formData.alarm || false,
        immobilizer: formData.immobilizer || false,
        rain_sensor: formData.rain_sensor || false,
        light_sensor: formData.light_sensor || false,
        tinted_windows: formData.tinted_windows || false,
        electric_seats: formData.electric_seats || false,
        memory_seats: formData.memory_seats || false,
        sport_seats: formData.sport_seats || false,
        isofix: formData.isofix || false,
        start_stop: formData.start_stop || false,
        keyless_entry: formData.keyless_entry || false,
        rear_parking_sensors: formData.rear_parking_sensors || false,
        front_parking_sensors: formData.front_parking_sensors || false,
        image_url: imageUrls[0],
      };

      const { error: updateError } = await supabase
        .from('cars')
        .update(cleanFormData)
        .eq('id', carToEdit.id);

      if (updateError) {
        alert('Greška pri ažuriranju vozila');
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

    if (premiumEnabled) {
      const costInfo = await calculateCarAdCost(user.id);

      if (!costInfo.isFree) {
        const currentCredits = userProfile?.credits || 0;
        if (currentCredits < costInfo.cost) {
          alert(
            `Nemate dovoljno kredita za postavljanje oglasa.\n\nPotrebno: ${costInfo.cost} kredita\nImate: ${currentCredits} kredita\n\nNadogradite na Premium za neograničene oglase ili kupite kredite!`
          );
          setLoading(false);
          return;
        }
      }
    }

    const imageUrls = await uploadMultipleCarImages(imageFiles, user.id);

    if (imageUrls.length === 0) {
      alert('Greška pri upload-u slika');
      setLoading(false);
      return;
    }

    const cleanValue = (val: any): number | null => {
      if (val === '' || val === null || val === undefined || isNaN(Number(val))) {
        return null;
      }
      return Number(val);
    };

    const cleanFormData = {
      vehicle_type: formData.vehicle_type,
      brand: formData.brand,
      model: formData.model,
      year: cleanValue(formData.year),
      mileage: cleanValue(formData.mileage),
      price: cleanValue(formData.price),
      fuel_type: formData.fuel_type,
      color: formData.color,
      transmission: formData.transmission,
      drive_type: formData.drive_type || null,
      kilowatts: cleanValue(formData.kilowatts),
      horse_power: cleanValue(formData.horse_power),
      engine_size: formData.engine_size || null,
      engine_displacement: cleanValue(formData.engine_displacement),
      hull_material: formData.hull_material || null,
      track_length: cleanValue(formData.track_length),
      doors: formData.doors || '4/5',
      seats: cleanValue(formData.seats) || 5,
      location: formData.location,
      description: formData.description,
      body_condition: cleanValue(formData.body_condition) || 5,
      mechanical_condition: cleanValue(formData.mechanical_condition) || 5,
      interior_condition: cleanValue(formData.interior_condition) || 5,
      damaged: formData.damaged || false,
      xenon_lights: formData.xenon_lights || false,
      heated_seats: formData.heated_seats || false,
      leather_seats: formData.leather_seats || false,
      sunroof: formData.sunroof || false,
      parking_camera: formData.parking_camera || false,
      navigation: formData.navigation || false,
      bluetooth: formData.bluetooth || false,
      cruise_control: formData.cruise_control || false,
      climate_control: formData.climate_control || false,
      alloy_wheels: formData.alloy_wheels || false,
      fog_lights: formData.fog_lights || false,
      roof_rack: formData.roof_rack || false,
      tow_hitch: formData.tow_hitch || false,
      sport_package: formData.sport_package || false,
      winter_tires: formData.winter_tires || false,
      summer_tires: formData.summer_tires || false,
      spare_tire: formData.spare_tire || false,
      electric_windows: formData.electric_windows || false,
      electric_mirrors: formData.electric_mirrors || false,
      abs: formData.abs || false,
      esp: formData.esp || false,
      central_locking: formData.central_locking || false,
      alarm: formData.alarm || false,
      immobilizer: formData.immobilizer || false,
      rain_sensor: formData.rain_sensor || false,
      light_sensor: formData.light_sensor || false,
      tinted_windows: formData.tinted_windows || false,
      electric_seats: formData.electric_seats || false,
      memory_seats: formData.memory_seats || false,
      sport_seats: formData.sport_seats || false,
      isofix: formData.isofix || false,
      start_stop: formData.start_stop || false,
      keyless_entry: formData.keyless_entry || false,
      rear_parking_sensors: formData.rear_parking_sensors || false,
      front_parking_sensors: formData.front_parking_sensors || false,
    };

    const { data: carData, error: carError } = await supabase
      .from('cars')
      .insert([{
        ...cleanFormData,
        image_url: imageUrls[0],
        user_id: user.id,
        user_email: user.email,
        user_name: user.email?.split('@')[0] || 'Korisnik',
        priority_score: 0,
        is_featured: false,
        featured_until: null
      }])
      .select('*')
      .single();

    if (carError || !carData) {
      console.error('Error creating car:', carError);
      alert('Greška pri dodavanju vozila: ' + (carError?.message || 'Nepoznata greška'));
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

    if (preferences.preferred_vehicle_type) {
      const cleanPreferences = {
        car_id: carData.id,
        preferred_vehicle_type: preferences.preferred_vehicle_type || null,
        preferred_brand: preferences.preferred_brand || null,
        preferred_model: preferences.preferred_model || null,
        min_year: preferences.min_year && !isNaN(preferences.min_year) ? preferences.min_year : null,
        max_year: preferences.max_year && !isNaN(preferences.max_year) ? preferences.max_year : null,
        max_mileage: preferences.max_mileage && !isNaN(preferences.max_mileage) ? preferences.max_mileage : null,
        price_difference: preferences.price_difference && !isNaN(preferences.price_difference) ? preferences.price_difference : 0,
      };

      await supabase.from('car_preferences').insert([cleanPreferences]);
    }

    if (premiumEnabled) {
      const costInfo = await calculateCarAdCost(user.id);

      if (!costInfo.isFree) {
        await spendCredits(user.id, costInfo.cost);
      }

      if (costInfo.reason === 'Prvi oglas je besplatan') {
        await markFirstCarAdUsed(user.id);
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
            <h2 className="text-2xl font-bold text-gray-900">{editMode ? 'Uredi vozilo' : 'Dodaj vozilo'}</h2>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tip vozila *</label>
                  <select
                    required
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as VehicleType, brand: '', model: '', fuel_type: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marka *
                    {validationErrors.has('brand') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <select
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                    className={getInputClassName('brand')}
                  >
                    <option value="">Odaberi</option>
                    {getBrandsByVehicleType(formData.vehicle_type).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Model *
                    {validationErrors.has('model') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <select
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className={getInputClassName('model')}
                    disabled={!formData.brand}
                  >
                    <option value="">Odaberi</option>
                    {formData.brand && getModelsByVehicleType(formData.vehicle_type, formData.brand).map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Godina *
                    {validationErrors.has('year') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <select
                    required
                    value={formData.year || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseInt(e.target.value);
                      setFormData({ ...formData, year: value });
                    }}
                    className={getInputClassName('year')}
                  >
                    <option value="">Odaberi</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kilometraža *
                    {validationErrors.has('mileage') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.mileage || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseInt(e.target.value);
                      setFormData({ ...formData, mileage: value });
                    }}
                    className={getInputClassName('mileage')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cijena (KM) *
                    {validationErrors.has('price') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? '' : parseInt(e.target.value);
                      setFormData({ ...formData, price: value });
                    }}
                    placeholder="npr. 15000"
                    className={getInputClassName('price')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lokacija *
                    {validationErrors.has('location') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={getInputClassName('location')}
                  >
                    <option value="">Odaberi</option>
                    {bosnianCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gorivo *
                    {validationErrors.has('fuel_type') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <select
                    required
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className={getInputClassName('fuel_type')}
                  >
                    <option value="">Odaberi</option>
                    {getFuelTypesByVehicleType(formData.vehicle_type).map((fuel) => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mjenjač *
                    {validationErrors.has('transmission') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <select
                    required
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className={getInputClassName('transmission')}
                  >
                    <option value="">Odaberi</option>
                    {getTransmissionTypesByVehicleType(formData.vehicle_type).map((trans) => (
                      <option key={trans} value={trans}>{trans}</option>
                    ))}
                  </select>
                </div>

                {formData.vehicle_type === 'automobil' && (
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
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Boja *
                    {validationErrors.has('color') && <span className="text-red-500 ml-1">●</span>}
                  </label>
                  <select
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className={getInputClassName('color')}
                  >
                    <option value="">Odaberi</option>
                    {carColors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                {formData.vehicle_type === 'automobil' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Snaga motora (kW) *
                      {validationErrors.has('kilowatts') && <span className="text-red-500 ml-1">●</span>}
                    </label>
                    <input
                      type="number"
                      value={formData.kilowatts || ''}
                      onChange={(e) => handleKilowattsChange(e.target.value)}
                      className={getInputClassName('kilowatts')}
                      placeholder="npr. 110"
                    />
                    {typeof formData.kilowatts === 'number' && formData.kilowatts > 0 && (
                      <p className="text-xs text-gray-600 mt-1">≈ {formData.horse_power} KS</p>
                    )}
                  </div>
                )}

                {(formData.vehicle_type === 'motocikl' || formData.vehicle_type === 'quad') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zapremina motora (cm³) *
                      {validationErrors.has('engine_displacement') && <span className="text-red-500 ml-1">●</span>}
                    </label>
                    <input
                      type="number"
                      placeholder="npr. 600"
                      value={formData.engine_displacement || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : parseInt(e.target.value);
                        setFormData({ ...formData, engine_displacement: value });
                      }}
                      className={getInputClassName('engine_displacement')}
                    />
                  </div>
                )}

                {formData.vehicle_type === 'automobil' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zapremina motora *
                      {validationErrors.has('engine_size') && <span className="text-red-500 ml-1">●</span>}
                    </label>
                    <input
                      type="text"
                      placeholder="npr. 2.0L"
                      value={formData.engine_size}
                      onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
                      className={getInputClassName('engine_size')}
                    />
                  </div>
                )}

                {formData.vehicle_type === 'jetski' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Materijal trupa</label>
                    <input
                      type="text"
                      placeholder="npr. Fiberglas"
                      value={formData.hull_material}
                      onChange={(e) => setFormData({ ...formData, hull_material: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {formData.vehicle_type === 'motorne_sanke' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dužina gusenice (cm)</label>
                    <input
                      type="number"
                      placeholder="npr. 380"
                      value={formData.track_length || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : parseInt(e.target.value);
                        setFormData({ ...formData, track_length: value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {formData.vehicle_type === 'automobil' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Broj vrata</label>
                    <select
                      value={formData.doors}
                      onChange={(e) => {
                        setFormData({ ...formData, doors: e.target.value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {getDoorOptionsByVehicleType(formData.vehicle_type).map((doors) => (
                        <option key={doors} value={doors}>{doors}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(formData.vehicle_type === 'automobil' || formData.vehicle_type === 'quad') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Broj sjedišta</label>
                    <select
                      value={formData.seats}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setFormData({ ...formData, seats: value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {getSeatOptionsByVehicleType(formData.vehicle_type).map((seats) => (
                        <option key={seats} value={seats}>{seats}</option>
                      ))}
                    </select>
                  </div>
                )}

              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opis *
                  {validationErrors.has('description') && <span className="text-red-500 ml-1">●</span>}
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={getTextareaClassName('description')}
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
                  {getEquipmentCategories(formData.vehicle_type).map((category) => (
                    <div key={category}>
                      <p className="text-sm font-semibold text-gray-700 mb-3">{category}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {getEquipmentByCategory(formData.vehicle_type, category).map((equipment) => (
                          <label key={equipment.key} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[equipment.key as keyof typeof formData] as boolean || false}
                              onChange={(e) => setFormData({ ...formData, [equipment.key]: e.target.checked })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{equipment.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tip vozila</label>
                <select
                  value={preferences.preferred_vehicle_type}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferred_vehicle_type: e.target.value,
                    preferred_brand: '',
                    preferred_model: ''
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Odaberite tip vozila</option>
                  <option value="Razno">Razno (bilo koji tip)</option>
                  <option value="automobil">Automobil</option>
                  <option value="motocikl">Motocikl</option>
                  <option value="quad">Quad</option>
                  <option value="motorne_sanke">Motorne sanke</option>
                  <option value="jetski">Jetski</option>
                </select>
              </div>

              {preferences.preferred_vehicle_type && preferences.preferred_vehicle_type !== 'Razno' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marka</label>
                  <select
                    value={preferences.preferred_brand}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preferred_brand: e.target.value,
                      preferred_model: ''
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberite marku</option>
                    <option value="Razno">Razno (bilo koja marka)</option>
                    {getBrandsByVehicleType(preferences.preferred_vehicle_type).map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              )}

              {preferences.preferred_vehicle_type && preferences.preferred_brand && preferences.preferred_brand !== 'Razno' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                  <select
                    value={preferences.preferred_model}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      preferred_model: e.target.value
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Odaberite model</option>
                    <option value="Razno">Razno (bilo koji model)</option>
                    {getModelsByVehicleType(preferences.preferred_vehicle_type, preferences.preferred_brand).map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              )}

              {preferences.preferred_vehicle_type !== 'Razno' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Min. godina</label>
                      <input
                        type="number"
                        value={preferences.min_year || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                          setPreferences({ ...preferences, min_year: value });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Max. godina</label>
                      <input
                        type="number"
                        value={preferences.max_year || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                          setPreferences({ ...preferences, max_year: value });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max. kilometraža</label>
                    <input
                      type="number"
                      value={preferences.max_mileage || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setPreferences({ ...preferences, max_mileage: value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Razlika u cijeni (koliko ste spremni doplatiti KM)
                    </label>
                    <input
                      type="number"
                      value={preferences.price_difference || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                        setPreferences({ ...preferences, price_difference: value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </>
              )}
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
