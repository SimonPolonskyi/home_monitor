import './DeviceCard.css';
import { format } from 'date-fns';

export default function DeviceCard({ device, onClick }) {
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

  const getStatusText = (status) => {
    const statusMap = {
      ok: 'ОК',
      warning: 'Попередження',
      error: 'Помилка',
      critical: 'Критично',
    };
    return statusMap[status] || status;
  };

  const currentState = device.current_state;
  const status = currentState?.status || 'unknown';
  const lastSeen = device.last_seen
    ? format(new Date(device.last_seen), 'dd.MM.yyyy HH:mm')
    : 'Невідомо';

  return (
    <div className="device-card" onClick={onClick}>
      <div className="device-header">
        <h3>{device.name || device.device_id}</h3>
        <span
          className="status-badge"
          style={{ backgroundColor: getStatusColor(status) }}
        >
          {getStatusText(status)}
        </span>
      </div>
      <div className="device-info">
        <div className="info-row">
          <span className="info-label">Тип:</span>
          <span className="info-value">{device.device_type || 'Невідомо'}</span>
        </div>
        {device.location && (
          <div className="info-row">
            <span className="info-label">Розташування:</span>
            <span className="info-value">{device.location}</span>
          </div>
        )}
        <div className="info-row">
          <span className="info-label">Останній зв'язок:</span>
          <span className="info-value">{lastSeen}</span>
        </div>
        {currentState?.data?.battery && (
          <div className="info-row">
            <span className="info-label">Напруга батареї:</span>
            <span className="info-value">
              {currentState.data.battery.voltage?.toFixed(2) || 'N/A'} V
            </span>
          </div>
        )}
        {currentState?.data?.temperature !== null && (
          <div className="info-row">
            <span className="info-label">Температура:</span>
            <span className="info-value">
              {currentState.data.temperature?.toFixed(1) || 'N/A'} °C
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
