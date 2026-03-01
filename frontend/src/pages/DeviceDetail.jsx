import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deviceService } from '../services/devices';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import './DeviceDetail.css';

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [history, setHistory] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const loadData = async () => {
    try {
      setError('');
      const [deviceRes, currentRes, historyRes, errorsRes] = await Promise.all([
        deviceService.getDevice(deviceId),
        deviceService.getCurrentState(deviceId),
        deviceService.getHistory(deviceId, { limit: 100 }),
        deviceService.getErrors(deviceId, { limit: 20 }),
      ]);
      setDevice(deviceRes.device);
      setCurrentState(currentRes.data);
      setHistory(historyRes.data || []);
      setErrors(errorsRes.errors || []);
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

  const prepareChartData = () => {
    return history
      .slice()
      .reverse()
      .map((m) => {
        const d = m.data;
        const tempBattery = d?.temperature_battery?.value ?? d?.temperature;
        const tempBoard = d?.temperature_board?.value;
        return {
          time: format(new Date(m.timestamp), 'HH:mm:ss'),
          batteryVoltage: d?.battery?.voltage || null,
          outputVoltage: d?.output?.voltage || null,
          temperature: tempBattery ?? tempBoard ?? null,
          temperatureBattery: tempBattery ?? null,
          temperatureBoard: tempBoard ?? null,
          efficiency: d?.efficiency || null,
          remainingPercent: d?.capacity?.remaining_percent ?? null,
        };
      });
  };

  if (loading) {
    return <div className="loading">Завантаження...</div>;
  }

  if (!device) {
    return (
      <div className="error-container">
        <p>Пристрій не знайдено</p>
        <button onClick={() => navigate('/dashboard')}>Повернутися</button>
      </div>
    );
  }

  const chartData = prepareChartData();
  const data = currentState?.data || {};

  return (
    <div className="device-detail">
      <div className="device-header-section">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Назад
        </button>
        <h1>{device.name || device.device_id}</h1>
        <span
          className="status-badge-large"
          style={{ backgroundColor: getStatusColor(currentState?.status) }}
        >
          {currentState?.status || 'unknown'}
        </span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="device-info-section">
        <div className="info-card">
          <h3>Інформація про пристрій</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Device ID:</span>
              <span className="info-value">{device.device_id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Тип:</span>
              <span className="info-value">{device.device_type}</span>
            </div>
            {device.location && (
              <div className="info-item">
                <span className="info-label">Розташування:</span>
                <span className="info-value">{device.location}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Останній зв'язок:</span>
              <span className="info-value">
                {device.last_seen
                  ? format(new Date(device.last_seen), 'dd.MM.yyyy HH:mm:ss')
                  : 'Невідомо'}
              </span>
            </div>
          </div>
        </div>

        {currentState && (
          <div className="info-card">
            <h3>Поточний стан</h3>
            <div className="current-state-grid">
              {data.battery && (
                <>
                  <div className="state-item">
                    <span className="state-label">Батарея - Напруга:</span>
                    <span className="state-value">
                      {data.battery.voltage?.toFixed(2) || 'N/A'} V
                    </span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Батарея - Струм:</span>
                    <span className="state-value">
                      {data.battery.current?.toFixed(2) || 'N/A'} A
                    </span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Батарея - Потужність:</span>
                    <span className="state-value">
                      {data.battery.power?.toFixed(2) || 'N/A'} W
                    </span>
                  </div>
                </>
              )}
              {data.output && (
                <>
                  <div className="state-item">
                    <span className="state-label">Вихід - Напруга:</span>
                    <span className="state-value">
                      {data.output.voltage?.toFixed(2) || 'N/A'} V
                    </span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Вихід - Струм:</span>
                    <span className="state-value">
                      {data.output.current?.toFixed(2) || 'N/A'} A
                    </span>
                  </div>
                  <div className="state-item">
                    <span className="state-label">Вихід - Потужність:</span>
                    <span className="state-value">
                      {data.output.power?.toFixed(2) || 'N/A'} W
                    </span>
                  </div>
                </>
              )}
              {data.temperature_battery && (
                <div className="state-item">
                  <span className="state-label">Темп. батареї:</span>
                  <span className="state-value">
                    {data.temperature_battery.value?.toFixed(1) ?? 'N/A'} °C
                    {data.temperature_battery.sensor && (
                      <span className="state-sensor"> ({data.temperature_battery.sensor})</span>
                    )}
                  </span>
                </div>
              )}
              {data.temperature_board && (
                <div className="state-item">
                  <span className="state-label">Темп. плати:</span>
                  <span className="state-value">
                    {data.temperature_board.value?.toFixed(1) ?? 'N/A'} °C
                    {data.temperature_board.sensor && (
                      <span className="state-sensor"> ({data.temperature_board.sensor})</span>
                    )}
                  </span>
                </div>
              )}
              {!data.temperature_battery && !data.temperature_board && data.temperature != null && (
                <div className="state-item">
                  <span className="state-label">Температура:</span>
                  <span className="state-value">
                    {data.temperature?.toFixed(1) ?? 'N/A'} °C
                  </span>
                </div>
              )}
              {data.capacity && (
                <div className="state-item capacity-item">
                  <span className="state-label">Ємність (SOC):</span>
                  <span className="state-value">
                    {data.capacity.remaining_percent?.toFixed(1) ?? 'N/A'}%
                    {data.capacity.remaining_ah != null && (
                      <span className="state-sub">
                        {' '}({data.capacity.remaining_ah?.toFixed(1)} / {data.capacity.total_ah?.toFixed(1)} А·год)
                      </span>
                    )}
                  </span>
                </div>
              )}
              {data.efficiency !== null && data.efficiency !== undefined && (
                <div className="state-item">
                  <span className="state-label">Ефективність:</span>
                  <span className="state-value">
                    {data.efficiency?.toFixed(1) || 'N/A'} %
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="charts-section">
          <div className="chart-card">
            <h3>Напруга</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="batteryVoltage"
                  stroke="#3498db"
                  name="Батарея (V)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="outputVoltage"
                  stroke="#2ecc71"
                  name="Вихід (V)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {(chartData.some((d) => d.temperatureBattery !== null) || chartData.some((d) => d.temperatureBoard !== null) || chartData.some((d) => d.temperature !== null)) && (
            <div className="chart-card">
              <h3>Температура</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {chartData.some((d) => d.temperatureBattery !== null) && (
                    <Line
                      type="monotone"
                      dataKey="temperatureBattery"
                      stroke="#e74c3c"
                      name="Батарея (°C)"
                      dot={false}
                    />
                  )}
                  {chartData.some((d) => d.temperatureBoard !== null) && (
                    <Line
                      type="monotone"
                      dataKey="temperatureBoard"
                      stroke="#e67e22"
                      name="Плата (°C)"
                      dot={false}
                    />
                  )}
                  {chartData.some((d) => d.temperature !== null) && !chartData.some((d) => d.temperatureBattery !== null) && !chartData.some((d) => d.temperatureBoard !== null) && (
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#e74c3c"
                      name="Температура (°C)"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.some((d) => d.remainingPercent !== null) && (
            <div className="chart-card">
              <h3>Заряд батареї (SOC)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="remainingPercent"
                    stroke="#27ae60"
                    name="Заряд (%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.some((d) => d.efficiency !== null) && (
            <div className="chart-card">
              <h3>Ефективність</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#9b59b6"
                    name="Ефективність (%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {errors.length > 0 && (
        <div className="errors-section">
          <h3>Останні помилки</h3>
          <div className="errors-list">
            {errors.map((err) => (
              <div key={err.id} className="error-item">
                <div className="error-header">
                  <span
                    className="error-severity"
                    style={{ color: getStatusColor(err.severity) }}
                  >
                    {err.severity}
                  </span>
                  <span className="error-time">
                    {format(new Date(err.timestamp), 'dd.MM.yyyy HH:mm:ss')}
                  </span>
                </div>
                <div className="error-message">{err.message}</div>
                <div className="error-category">Категорія: {err.category}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
