import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { GetApp as GetAppIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import './AccessRequest.css';

export function AccessRequest() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestCode, setRequestCode] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [serverTime, setServerTime] = useState<number>(Date.now());

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    const updateServerTime = () => {
      setServerTime(Date.now());
    };

    const interval = setInterval(updateServerTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => {
    const date = new Date(time);
    return `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const generateCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  useEffect(() => {
    if (!requestCode) return;

    const checkStatus = async () => {
      const { data, error } = await supabase
        .from('access_requests')
        .select('status')
        .eq('code', requestCode)
        .single();

      if (error) {
        console.error('Error checking status:', error);
        return;
      }

      if (data?.status === 'approved') {
        console.log('Request approved, navigating to manager...');
        navigate('/manager');
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [navigate, requestCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const code = generateCode();
      setRequestCode(code);

      const { error } = await supabase
        .from('access_requests')
        .insert([{
          first_name: firstName,
          last_name: lastName,
          status: 'pending',
          code: code
        }]);

      if (error) throw error;

      setFirstName('');
      setLastName('');
      alert('მოთხოვნა გაგზავნილია. გთხოვთ დაელოდოთ დადასტურებას.');
    } catch (error) {
      console.error('Error:', error);
      alert('შეცდომა მოთხოვნის გაგზავნისას');
      setRequestCode(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="request-page">
      <div className="access-request-container">
        <Typography variant="h4" className="title">
          მოთხოვნის გაგზავნა
        </Typography>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="სახელი"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="გვარი"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'იგზავნება...' : 'მოთხოვნის გაგზავნა'}
          </button>
        </form>
        {requestCode && (
          <div className="code-display">
            თქვენი კოდი: {requestCode}
          </div>
        )}
      </div>

      {deferredPrompt && (
        <Box className="install-container">
          <Button
            variant="contained"
            startIcon={<GetAppIcon />}
            onClick={handleInstallClick}
            className="install-button"
          >
            დააყენე აპლიკაცია
          </Button>
        </Box>
      )}
      <Box className="timer-container" sx={{ position: 'absolute', bottom: 0, right: 0 }}>
        <Typography variant="h6">
          დრო: {formatTime(serverTime)}
        </Typography>
      </Box>
    </Box>
  );
}
