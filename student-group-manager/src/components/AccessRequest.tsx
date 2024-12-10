import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AccessRequestFormData {
  firstName: string;
  lastName: string;
}

export function AccessRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AccessRequestFormData>({
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('access_requests_channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'access_requests',
        },
        (payload) => {
          if (payload.new.status === 'approved') {
            navigate('/manager');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('access_requests')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          status: 'pending'
        });

      if (error) throw error;
      
      setFormData({ firstName: '', lastName: '' });
      alert('მოთხოვნა გაგზავნილია. გთხოვთ დაელოდოთ დადასტურებას.');
    } catch (error) {
      console.error('Error:', error);
      alert('შეცდომა მოთხოვნის გაგზავნისას');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-request-container">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="სახელი"
            required
          />
        </div>
        <div className="input-group">
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="გვარი"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'იგზავნება...' : 'მოთხოვნის გაგზავნა'}
        </button>
      </form>
    </div>
  );
}
