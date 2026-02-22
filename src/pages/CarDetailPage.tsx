import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { CarDetailModal } from '../components/CarDetailModal';

export function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCar();
    }
  }, [id]);

  const loadCar = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select(`
        *,
        user_profiles!cars_user_id_fkey (
          id,
          nickname,
          avatar_url,
          is_premium,
          phone,
          show_phone_number
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      setCar(data);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!car) {
    return null;
  }

  return (
    <CarDetailModal
      car={car}
      onClose={handleClose}
      onSwapOffer={() => {}}
      onDirectMessage={() => {}}
    />
  );
}
