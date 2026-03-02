export function getStatusColor(status) {
  switch (status) {
    case 'ok':
      return '#27ae60';
    case 'warning':
      return '#f39c12';
    case 'error':
      return '#e74c3c';
    case 'critical':
      return '#c0392b';
    case 'info':
      return '#3498db';
    default:
      return '#95a5a6';
  }
}

export function getStatusText(status) {
  const statusMap = {
    ok: 'ОК',
    warning: 'Попередження',
    error: 'Помилка',
    critical: 'Критично',
    info: 'Інформація',
  };
  return statusMap[status] || status;
}
