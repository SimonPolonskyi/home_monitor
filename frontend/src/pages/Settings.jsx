import { useState, useEffect } from 'react';
import { deviceService } from '../services/devices';
import { format } from 'date-fns';
import { getStatusColor, getStatusText } from '../utils/statusColors';
import './Settings.css';

export default function Settings() {
  const [devices, setDevices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setError('');
      const res = await deviceService.getDevices();
      setDevices(res.devices || []);
    } catch (err) {
      setError('Помилка завантаження пристроїв');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (device) => {
    setEditing(device.device_id);
    setForm({
      name: device.name || '',
      location: device.location || '',
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', location: '' });
  };

  const saveDevice = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      setError('');
      await deviceService.updateDevice(editing, form);
      await loadDevices();
      setEditing(null);
      setForm({ name: '', location: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  return (
    <div className="settings-page">
      <h1>Налаштування</h1>

      {error && <div className="error-banner">{error}</div>}

      <section className="settings-section">
        <h2>Пристрої</h2>
        <p className="section-hint">
          Натисніть на пристрій, щоб змінити назву або розташування.
        </p>

        {devices.length === 0 ? (
          <div className="no-devices">
            <p>Немає пристроїв</p>
          </div>
        ) : (
          <div className="devices-list">
            {devices.map((device) => (
              <div key={device.device_id} className="device-row">
                {editing === device.device_id ? (
                  <div className="device-edit-form">
                    <div className="form-row">
                      <label>Назва:</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="UPS-001"
                      />
                    </div>
                    <div className="form-row">
                      <label>Розташування:</label>
                      <input
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="Офіс"
                      />
                    </div>
                    <div className="form-actions">
                      <button onClick={saveDevice} disabled={saving}>
                        {saving ? 'Збереження...' : 'Зберегти'}
                      </button>
                      <button onClick={cancelEdit} className="btn-cancel">
                        Скасувати
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="device-info">
                      <div className="device-main">
                        <span className="device-name">
                          {device.name || device.device_id}
                        </span>
                        <span
                          className="status-dot"
                          style={{ backgroundColor: getStatusColor(device.current_state?.status) }}
                          title={getStatusText(device.current_state?.status)}
                        />
                      </div>
                      <div className="device-meta">
                        <span>{device.device_id}</span>
                        {device.location && <span>• {device.location}</span>}
                        {device.last_seen && (
                          <span>• {format(new Date(device.last_seen), 'dd.MM.yyyy HH:mm')}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => startEdit(device)} className="btn-edit">
                      Редагувати
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
