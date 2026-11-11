import { ALL_EVENTS } from '../data/events';

const ORGANIZER_EVENTS_KEY = 'mehfil_organizer_events';

const readOrganizerEvents = () => {
  try {
    return JSON.parse(localStorage.getItem(ORGANIZER_EVENTS_KEY)) ?? [];
  } catch {
    return [];
  }
};

const writeOrganizerEvents = (events) => {
  localStorage.setItem(ORGANIZER_EVENTS_KEY, JSON.stringify(events));
};

export const getAllEvents = () => {
  const stored = readOrganizerEvents();
  const overrides = new Map(stored.map((event) => [event.id, event]));
  const seededIds = new Set(ALL_EVENTS.map((event) => event.id));
  return [
    ...ALL_EVENTS.map((event) => overrides.get(event.id) ?? event),
    ...stored.filter((event) => !seededIds.has(event.id))
  ];
};

export const getPublishedEvents = () => getAllEvents().filter((event) => event.status !== 'past' && event.published !== false);

export const getEventById = (id) => getAllEvents().find((event) => event.id === id) ?? null;

export const getFeaturedEvents = () => getPublishedEvents().slice(0, 3);

export const getSimilarEvents = (category, excludeId) => {
  const available = getPublishedEvents().filter((event) => event.id !== excludeId);
  const similar = available.filter((event) => event.category === category);
  const fallback = available.filter((event) => event.category !== category);
  return [...similar, ...fallback].slice(0, 3);
};

export const getOrganizerEvents = (user) => {
  if (user?.role !== 'organizer') return [];
  const assignedIds = new Set(user.assignedEventIds ?? []);
  return getAllEvents().filter((event) => event.organizerId === user.id || assignedIds.has(event.id));
};

export const getOrganizerEvent = (user, eventId) => (
  getOrganizerEvents(user).find((event) => event.id === eventId) ?? null
);

export const createOrganizerEvent = (user, eventData) => {
  if (user?.role !== 'organizer') {
    throw new Error('Organizer access is required to create events.');
  }
  const id = globalThis.crypto?.randomUUID
    ? `evt-local-${globalThis.crypto.randomUUID()}`
    : `evt-local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const event = {
    ...eventData,
    id,
    organizerId: user.id,
    organizer: user.name,
    price: 0,
    seatsTaken: 0,
    status: 'upcoming',
    published: true,
    gradient: 'aurora'
  };
  writeOrganizerEvents([...readOrganizerEvents(), event]);
  return event;
};

export const updateOrganizerEvent = (user, eventId, eventData) => {
  const existing = getOrganizerEvent(user, eventId);
  if (!existing) {
    throw new Error('You are not assigned to manage this event.');
  }
  const updated = {
    ...existing,
    ...eventData,
    id: existing.id,
    organizerId: existing.organizerId ?? user.id,
    organizer: existing.organizer || user.name,
    price: 0
  };
  const stored = readOrganizerEvents().filter((event) => event.id !== eventId);
  writeOrganizerEvents([...stored, updated]);
  return updated;
};
