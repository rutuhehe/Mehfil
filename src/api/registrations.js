const KEY = 'mehfil_registrations';
const SAVED_KEY = 'mehfil_saved';
export const PASS_QR_PREFIX = 'MEHFIL-REG:';

const safeRead = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export const getRegistrations = (userId) => safeRead(KEY, []).filter((entry) => entry.userId === userId);
export const getAllRegistrations = () => safeRead(KEY, []);
export const getSavedEvents = (userId) => safeRead(SAVED_KEY, []).filter((entry) => entry.userId === userId);
export const getPassQrValue = (registrationId) => `${PASS_QR_PREFIX}${registrationId}`;

export const addRegistration = (userId, eventId) => {
  const list = safeRead(KEY, []);
  if (list.some((item) => item.userId === userId && item.eventId === eventId)) {
    return list.find((item) => item.userId === userId && item.eventId === eventId);
  }
  const registrationId = globalThis.crypto?.randomUUID
    ? `reg-${globalThis.crypto.randomUUID()}`
    : `reg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const registration = {
    id: registrationId,
    userId,
    eventId,
    status: 'demo-local',
    createdAt: new Date().toISOString()
  };
  list.push(registration);
  localStorage.setItem(KEY, JSON.stringify(list));
  return registration;
};

export const updateRegistrationStatus = (userId, eventId, status) => {
  const list = safeRead(KEY, []);
  const next = list.map((item) => {
    if (item.userId === userId && item.eventId === eventId) {
      return { ...item, status };
    }
    return item;
  });
  localStorage.setItem(KEY, JSON.stringify(next));
};

export const saveEvent = (userId, eventId) => {
  const list = safeRead(SAVED_KEY, []);
  const existing = list.find((entry) => entry.userId === userId && entry.eventId === eventId);
  if (existing) {
    const next = list.filter((entry) => !(entry.userId === userId && entry.eventId === eventId));
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    return false;
  }
  list.push({ userId, eventId, savedAt: new Date().toISOString() });
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  return true;
};

export const isSaved = (userId, eventId) => getSavedEvents(userId).some((entry) => entry.eventId === eventId);

export const removeSavedEvent = (userId, eventId) => {
  const list = getSavedEvents(userId).filter((entry) => entry.eventId !== eventId);
  const full = safeRead(SAVED_KEY, []).filter((entry) => !(entry.userId === userId && entry.eventId === eventId));
  localStorage.setItem(SAVED_KEY, JSON.stringify(full));
  return list;
};

export const removeRegistration = (userId, eventId) => {
  const list = safeRead(KEY, []).filter((entry) => !(entry.userId === userId && entry.eventId === eventId));
  localStorage.setItem(KEY, JSON.stringify(list));
};
