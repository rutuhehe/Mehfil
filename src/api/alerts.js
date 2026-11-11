const KEY = 'mehfil_alerts';

const safeRead = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export const getAlerts = (userId) => safeRead(KEY, []).filter((item) => item.userId === userId);

export const addAlert = (userId, message, type = 'info') => {
  const list = safeRead(KEY, []);
  const alert = {
    id: `alert-${Date.now()}`,
    userId,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  list.push(alert);
  localStorage.setItem(KEY, JSON.stringify(list));
  return alert;
};

export const markAlertRead = (userId, alertId) => {
  const list = safeRead(KEY, []).map((item) => item.userId === userId && item.id === alertId ? { ...item, read: true } : item);
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const markAllAlertsRead = (userId) => {
  const list = safeRead(KEY, []).map((item) => item.userId === userId ? { ...item, read: true } : item);
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const deleteAlert = (userId, alertId) => {
  const list = safeRead(KEY, []).filter((item) => !(item.userId === userId && item.id === alertId));
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const unreadCount = (userId) => getAlerts(userId).filter((item) => !item.read).length;
