import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deviceService } from '../services/devices';
import { statsService } from '../services/stats';
import DeviceCard from '../components/DeviceCard';
import './Dashboard.css';

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // Оновлювати дані кожні 30 секунд
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const [devicesRes, statsRes] = await Promise.all([
        deviceService.getDevices(),
        statsService.getStats(),
      ]);
      setDevices(devicesRes.devices || []);
      setStats(statsRes.stats || null);
    } catch (err) {
      setError('Помилка завантаження даних');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return '#27ae60';
      case 'warning':
        return '#f39c12';
      case 'error':
        return '#e74c3c';
      case 'critical':
        return '#c0392b';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {error && <div className="error-banner">{error}</div>}

      {stats && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-label">Всього пристроїв</div>
            <div className="stat-value">{stats.devices?.total_devices || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Активні</div>
            <div className="stat-value">{stats.devices?.active_devices || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Всього вимірювань</div>
            <div className="stat-value">
              {stats.measurements?.total_measurements || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Помилок</div>
            <div className="stat-value" style={{ color: '#e74c3c' }}>
              {stats.errors?.total || 0}
            </div>
          </div>
        </div>
      )}

      <h2>Пристрої</h2>
      {devices.length === 0 ? (
        <div className="no-devices">
          <p>Немає пристроїв</p>
          <p className="hint">Дані з'являться після першого запиту від UPS пристрою</p>
        </div>
      ) : (
        <div className="devices-grid">
          {devices.map((device) => (
            <DeviceCard
              key={device.device_id}
              device={device}
              onClick={() => navigate(`/devices/${device.device_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
