import { useState, useEffect } from 'react';
import { X, Car as CarIcon, Eye, EyeOff, Archive, Trash2, Edit, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Car } from '../lib/supabase';
import { AddCarFormMultiStep } from './AddCarFormMultiStep';
import { BoostCarModal } from './BoostCarModal';

interface MyAdsModalProps {
  onClose: () => void;
  userId: string;
}

type CarStatus = 'active' | 'inactive' | 'hidden';

interface CarWithStatus extends Car {
  status: CarStatus;
}

export function MyAdsModal({ onClose, userId }: MyAdsModalProps) {
  const [cars, setCars] = useState<CarWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CarStatus>('active');
  const [editingCar, setEditingCar] = useState<CarWithStatus | null>(null);
  const [boostingCar, setBoostingCar] = useState<CarWithStatus | null>(null);

  useEffect(() => {
    loadMyCars();
  }, [userId]);

  const loadMyCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCars(data as CarWithStatus[]);
    }
    setLoading(false);
  };

  const updateCarStatus = async (carId: string, newStatus: CarStatus) => {
    const { error } = await supabase
      .from('cars')
      .update({ status: newStatus })
      .eq('id', carId);

    if (!error) {
      setCars(cars.map(car =>
        car.id === carId ? { ...car, status: newStatus } : car
      ));
    } else {
      alert('Greška pri ažuriranju statusa');
    }
  };

  const deleteCar = async (carId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj oglas?')) return;

    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId);

    if (!error) {
      setCars(cars.filter(car => car.id !== carId));
    } else {
      alert('Greška pri brisanju oglasa');
    }
  };

  const filteredCars = cars.filter(car => car.status === activeTab);

  const getStatusCount = (status: CarStatus) => {
    return cars.filter(car => car.status === status).length;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-cyan-500/30">
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-cyan-500/30 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Moji Oglasi
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Aktivni ({getStatusCount('active')})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'inactive'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Neaktivni ({getStatusCount('inactive')})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('hidden')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'hidden'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                Skriveni ({getStatusCount('hidden')})
              </div>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <CarIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">
                {activeTab === 'active' && 'Nemate aktivnih oglasa'}
                {activeTab === 'inactive' && 'Nemate neaktivnih oglasa'}
                {activeTab === 'hidden' && 'Nemate skrivenih oglasa'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCars.map(car => (
                <div
                  key={car.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <img
                      src={car.image_url}
                      alt={`${car.brand} ${car.model}`}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {car.brand} {car.model}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-3">
                        <div>Godina: {car.year}</div>
                        <div>Kilometraža: {car.mileage.toLocaleString()} km</div>
                        <div>Gorivo: {car.fuel_type}</div>
                        <div>Transmisija: {car.transmission}</div>
                        {car.view_count !== undefined && (
                          <div className="flex items-center gap-1 text-cyan-400 font-semibold">
                            <Eye className="w-4 h-4" />
                            {car.view_count} pregleda
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setEditingCar(car)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Uredi
                        </button>
                        {activeTab === 'active' && !car.is_featured && (
                          <button
                            onClick={() => setBoostingCar(car)}
                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Istakni
                          </button>
                        )}
                        {activeTab === 'active' && car.is_featured && (
                          <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500 text-yellow-500 rounded-lg flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Istaknut
                          </div>
                        )}
                        {activeTab !== 'active' && (
                          <button
                            onClick={() => updateCarStatus(car.id, 'active')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Aktiviraj
                          </button>
                        )}
                        {activeTab !== 'inactive' && (
                          <button
                            onClick={() => updateCarStatus(car.id, 'inactive')}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Deaktiviraj
                          </button>
                        )}
                        {activeTab !== 'hidden' && (
                          <button
                            onClick={() => updateCarStatus(car.id, 'hidden')}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <EyeOff className="w-4 h-4" />
                            Sakrij
                          </button>
                        )}
                        <button
                          onClick={() => deleteCar(car.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
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

      {editingCar && (
        <AddCarFormMultiStep
          editMode={true}
          carToEdit={editingCar}
          onClose={() => setEditingCar(null)}
          onSuccess={() => {
            setEditingCar(null);
            loadMyCars();
          }}
        />
      )}

      {boostingCar && (
        <BoostCarModal
          carId={boostingCar.id}
          carTitle={`${boostingCar.brand} ${boostingCar.model}`}
          onClose={() => setBoostingCar(null)}
          onSuccess={() => {
            setBoostingCar(null);
            loadMyCars();
          }}
        />
      )}
    </div>
  );
}
