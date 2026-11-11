const USERS_KEY = 'mehfil_users';
const SESSION_KEY = 'mehfil_session';

const safeRead = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export const readUsers = () => safeRead(USERS_KEY, []);
export const readSession = () => safeRead(SESSION_KEY, null);

export const writeSession = (session) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getCurrentUser = () => {
  const session = readSession();
  const users = readUsers();
  if (!session) return null;
  return users.find((user) => user.id === session.userId) ?? null;
};

export const setCurrentUser = (user) => {
  if (!user) {
    writeSession(null);
    return;
  }
  const users = readUsers();
  const existing = users.findIndex((item) => item.id === user.id);
  if (existing >= 0) {
    users[existing] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  writeSession({ userId: user.id });
};

export const registerUser = ({ name, email, password, username, department, year, phone = '', photo = '' }) => {
  const users = readUsers();
  if (users.some((entry) => entry.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('A user with that email already exists.');
  }
  if (users.some((entry) => entry.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('That username is already taken.');
  }

  const user = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    username,
    department,
    year,
    phone,
    photo,
    profileComplete: true,
    role: 'student'
  };

  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  writeSession({ userId: user.id });
  return user;
};

export const loginUser = ({ identifier, password }) => {
  const users = readUsers();
  const found = users.find((user) => {
    const entry = identifier.trim();
    return user.email.toLowerCase() === entry.toLowerCase() || user.username.toLowerCase() === entry.toLowerCase();
  });
  if (!found || found.password !== password) {
    throw new Error('Incorrect email/username or password.');
  }
  writeSession({ userId: found.id });
  return found;
};

export const loginAsDemoOrganizer = () => {
  const user = {
    id: 'demo-organizer',
    name: 'MEHFIL Demo Organizer',
    email: 'organizer-demo@mehfil.local',
    username: 'organizer-demo',
    profileComplete: true,
    role: 'organizer',
    isDemoRole: true,
    assignedEventIds: ['evt-1', 'evt-2', 'evt-3']
  };
  setCurrentUser(user);
  return user;
};

export const logoutUser = () => {
  writeSession(null);
};

export const updateUserProfile = (userId, updates) => {
  const users = readUsers();
  const index = users.findIndex((item) => item.id === userId);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const current = getCurrentUser();
  if (current) {
    writeSession({ userId: current.id });
  }
  return users[index];
};

export const isUsernameTaken = (username, currentUserId = null) => {
  const users = readUsers();
  return users.some((entry) => {
    if (currentUserId && entry.id === currentUserId) return false;
    return entry.username.toLowerCase() === username.toLowerCase();
  });
};
