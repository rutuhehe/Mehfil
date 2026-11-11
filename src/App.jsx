import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';
import {
  ChevronRight,
  CircleUserRound,
  Download,
  Heart,
  Moon,
  QrCode,
  Search,
  Sun,
  Ticket,
  Users,
  X,
  Bell,
  Menu,
  HeartHandshake,
  BookOpen,
  Trophy,
  Sparkles,
  MapPin,
  CalendarRange,
  ArrowLeft,
  ArrowRight,
  Save,
  SquarePen,
  PawPrint,
  BadgeCheck,
} from 'lucide-react';
import { format, parseISO, isSameMonth, isSameDay, addMonths, subMonths, endOfMonth, startOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, differenceInCalendarDays, areIntervalsOverlapping } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

import { EVENTS as EVENT_SEED } from './data/events';
import { getCurrentUser, loginUser, loginAsDemoOrganizer, logoutUser, registerUser, updateUserProfile } from './api/auth';
import { getAlerts, addAlert, markAlertRead, deleteAlert } from './api/alerts';
import { addRegistration, getPassQrValue, getRegistrations, getSavedEvents, removeRegistration, removeSavedEvent, saveEvent } from './api/registrations';
import { getEventById, getFeaturedEvents, getPublishedEvents, getSimilarEvents } from './api/events';
import {
  OrganizerAnalyticsPage,
  OrganizerAttendancePage,
  OrganizerCheckInPage,
  OrganizerDashboard,
  OrganizerEventForm,
  OrganizerEventsPage,
  OrganizerParticipantsPage,
  OrganizerPortalLayout
} from './OrganizerPortal';

const themeKey = 'mehfil_theme';
const REQUIRE_LOGIN_ON_ENTRY = false;

const homeRouteTitle = 'MEHFIL | Campus events';

const categoryList = ['All', 'Wellness', 'Seminar', 'Networking', 'Workshop', 'Culture', 'Hackathon', 'Volunteer', 'Social', 'Career', 'Competition', 'Sports', 'Create'];

const systemTheme = () => (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

// Central route and application state layer for the MEHFIL campus experience.
function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => getCurrentUser());
  const [theme, setTheme] = useState(() => localStorage.getItem(themeKey) || systemTheme());
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [toast, setToast] = useState('');
  const [clashEvent, setClashEvent] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [registrations, setRegistrations] = useState(user ? getRegistrations(user.id) : []);
  const [saved, setSaved] = useState(user ? getSavedEvents(user.id) : []);
  const [alerts, setAlerts] = useState(user ? getAlerts(user.id) : []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    localStorage.setItem(themeKey, theme);
  }, [theme]);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      setRegistrations(getRegistrations(user.id));
      setSaved(getSavedEvents(user.id));
      setAlerts(getAlerts(user.id));
    }
  }, [user, location.pathname]);

  useEffect(() => {
    const seen = sessionStorage.getItem('mehfil_visit_seen');
    if (!user && !seen && !REQUIRE_LOGIN_ON_ENTRY) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('mehfil_visit_seen', '1');
        setAuthOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const maps = {
      '/': homeRouteTitle,
      '/explore': 'Explore | MEHFIL',
      '/my-registrations': 'My registrations | MEHFIL',
      '/my-pass': 'My Digital Pass | MEHFIL',
      '/profile': 'Profile | MEHFIL'
    };
    document.title = maps[location.pathname] || (location.pathname.startsWith('/organizer') ? 'Organizer Portal | MEHFIL' : 'MEHFIL');
  }, [location.pathname]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const node = document.getElementById(id);
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const handleAuthSuccess = (nextUser) => {
    setUser(nextUser);
    setAuthOpen(false);
    setToast('Welcome to MEHFIL.');
    if (nextUser.role === 'organizer') navigate('/organizer');
    else if (location.pathname.startsWith('/organizer')) navigate('/');
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const requireAuth = (actionLabel) => {
    if (!user) {
      setToast(actionLabel);
      setAuthOpen(true);
      return false;
    }
    return true;
  };

  const handleRegisterEvent = (event) => {
    if (event.status === 'past' || event.status === 'closed' || parseISO(event.start) <= new Date()) {
      setToast('Registration is closed for this event.');
      return;
    }
    if (event.seatsTaken >= event.capacity) {
      setToast('This event is full and is not accepting registrations.');
      return;
    }
    if (!requireAuth('Please log in to register.')) return;
    if (!user.profileComplete) {
      setToast('Complete your profile to register.');
      setAuthOpen(true);
      return;
    }
    if (registrations.some((entry) => entry.eventId === event.id)) {
      setToast('A demo registration for this event already exists on this device.');
      return;
    }
    const eventStart = parseISO(event.start);
    const eventEnd = parseISO(event.end);
    const overlap = registrations.find((entry) => {
      const regEvent = getEventById(entry.eventId);
      if (!regEvent || regEvent.id === event.id) return false;
      const regStart = parseISO(regEvent.start);
      const regEnd = parseISO(regEvent.end);
      return areIntervalsOverlapping(
        { start: eventStart, end: eventEnd },
        { start: regStart, end: regEnd }
      );
    });
    if (overlap) {
      setClashEvent(getEventById(overlap.eventId));
      return;
    }
    let next;
    try {
      next = addRegistration(user.id, event.id);
    } catch {
      setToast('Could not save the demo registration in this browser. No registration was created.');
      return;
    }
    setRegistrations(getRegistrations(user.id));
    let alertSaveFailed = false;
    try {
      addAlert(user.id, `Demo registration saved locally for ${event.title}.`, 'info');
      setAlerts(getAlerts(user.id));
    } catch {
      alertSaveFailed = true;
    }
    setToast(alertSaveFailed
      ? 'Demo registration saved locally, but its alert could not be saved.'
      : `Demo registration saved on this device for ${event.title}. No backend confirmation is available.`);
    if (next) {
      setUser({ ...user, profileComplete: true });
    }
  };

  const handleSaveToggle = (eventId) => {
    if (!user) {
      setToast('Please log in to save events.');
      setAuthOpen(true);
      return;
    }
    let savedNow;
    try {
      savedNow = saveEvent(user.id, eventId);
    } catch {
      setToast('Could not update saved events in this browser.');
      return;
    }
    const nextSaved = getSavedEvents(user.id);
    setSaved(nextSaved);
    setToast(savedNow ? 'Event saved on this device.' : 'Event removed from this device.');
  };

  const handleCancelRegistration = (eventId) => {
    const event = getEventById(eventId);
    if (!window.confirm(`Remove your local demo registration${event ? ` for ${event.title}` : ''}?`)) return;
    try {
      removeRegistration(user.id, eventId);
    } catch {
      setToast('Could not remove the demo registration from this browser.');
      return;
    }
    setRegistrations(getRegistrations(user.id));
    setToast('Local demo registration removed.');
    try {
      addAlert(user.id, 'A local demo registration was removed.', 'warning');
      setAlerts(getAlerts(user.id));
    } catch {
      setToast('Local demo registration removed, but its alert could not be saved.');
    }
  };

  const handleLogout = () => {
    if (!window.confirm('Log out of MEHFIL?')) return;
    logoutUser();
    setUser(null);
    setToast('Logged out.');
    navigate('/');
  };

  const unreadAlerts = alerts.filter((alert) => !alert.read).length;

  return (
    <div className="app-shell">
      <Routes>
        <Route element={<StudentPortalGuard user={user} />}>
          <Route element={<StudentPortalLayout user={user} onOpenAuth={openAuth} theme={theme} setTheme={setTheme} unread={unreadAlerts} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} onLogout={handleLogout} />}>
            <Route path="/" element={<HomePage user={user} onOpenAuth={openAuth} onSaveToggle={handleSaveToggle} saved={saved} onOpenExplore={() => navigate('/explore')} />} />
            <Route path="/explore" element={<ExplorePage onSaveToggle={handleSaveToggle} saved={saved} />} />
            <Route path="/saved" element={<SavedEventsPage user={user} onOpenAuth={openAuth} saved={saved} onSaveToggle={handleSaveToggle} />} />
            <Route path="/events/:id" element={<EventDetailPage registrations={registrations} onRegister={handleRegisterEvent} onSaveToggle={handleSaveToggle} saved={saved} />} />
            <Route path="/event/:eventId" element={<EventDetailPage registrations={registrations} onRegister={handleRegisterEvent} onSaveToggle={handleSaveToggle} saved={saved} />} />
            <Route path="/my-registrations" element={<MyRegistrationsPage user={user} onOpenAuth={openAuth} registrations={registrations} onCancel={handleCancelRegistration} />} />
            <Route path="/my-pass" element={<MyRegistrationsPage user={user} onOpenAuth={openAuth} registrations={registrations} onCancel={handleCancelRegistration} pageTitle="My Digital Pass" />} />
            <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} onOpenAuth={openAuth} onLogout={handleLogout} saved={saved} registrations={registrations} alerts={alerts} setAlerts={setAlerts} theme={theme} setTheme={setTheme} />} />
          </Route>
        </Route>
        <Route path="/organizer" element={<OrganizerPortalRoute user={user} onOpenAuth={openAuth} theme={theme} setTheme={setTheme} onLogout={handleLogout} />}>
          <Route index element={<OrganizerDashboard user={user} />} />
          <Route path="events" element={<OrganizerEventsPage user={user} />} />
          <Route path="events/new" element={<OrganizerEventForm user={user} />} />
          <Route path="events/:eventId/edit" element={<OrganizerEventForm user={user} />} />
          <Route path="participants" element={<OrganizerParticipantsPage user={user} />} />
          <Route path="check-in" element={<OrganizerCheckInPage />} />
          <Route path="attendance" element={<OrganizerAttendancePage />} />
          <Route path="analytics" element={<OrganizerAnalyticsPage user={user} />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {authOpen && (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {clashEvent && (
        <ClashModal
          onClose={() => setClashEvent(null)}
          onConfirm={() => {
            setClashEvent(null);
            handleRegisterEvent(clashEvent);
          }}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}

function StudentPortalGuard({ user }) {
  return user?.role === 'organizer' ? <Navigate to="/organizer" replace /> : <Outlet />;
}

function StudentPortalLayout({ user, onOpenAuth, theme, setTheme, unread, mobileNavOpen, setMobileNavOpen, onLogout }) {
  return (
    <>
      <Navbar user={user} onOpenAuth={onOpenAuth} theme={theme} setTheme={setTheme} unread={unread} mobileNavOpen={mobileNavOpen} setMobileNavOpen={setMobileNavOpen} onLogout={onLogout} />
      <Outlet />
      <Footer />
    </>
  );
}

function OrganizerPortalRoute({ user, onOpenAuth, theme, setTheme, onLogout }) {
  if (!user) {
    return (
      <main className="page-shell role-access-page">
        <div className="empty-state">
          <h1>Organizer sign-in required</h1>
          <p className="muted">Sign in with an organizer account to continue. For UI testing, the login dialog offers a clearly labeled mock organizer role.</p>
          <button type="button" className="btn btn-primary" onClick={() => onOpenAuth('login')}>Sign in</button>
        </div>
      </main>
    );
  }
  if (user.role !== 'organizer') {
    return (
      <main className="page-shell role-access-page">
        <div className="empty-state">
          <h1>Organizer access denied</h1>
          <p className="muted">This account has the student role and cannot access organizer tools.</p>
          <Link to="/" className="btn btn-primary">Return to Student Home</Link>
        </div>
      </main>
    );
  }
  return <OrganizerPortalLayout user={user} theme={theme} setTheme={setTheme} onLogout={onLogout} />;
}

function Navbar({ user, onOpenAuth, theme, setTheme, unread, mobileNavOpen, setMobileNavOpen, onLogout }) {
  const navigate = useNavigate();
  const navLinkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');
  const avatarText = user ? user.name?.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase().slice(0, 2) : '';

  return (
    <header className="site-header">
      <div className="page-shell head-inner">
        <div className="brand-wrap">
          <button className="menu-button mobile-only" type="button" aria-label="Open menu" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            <Menu size={20} />
          </button>
          <Link to="/" className="brand" aria-label="MEHFIL home">
            <span className="logo-mark">M</span>
            <span className="logo-wordmark">MEHFIL</span>
          </Link>
        </div>

        <nav className={`nav-wrap ${mobileNavOpen ? 'open' : ''}`}>
          <NavLink to="/" className={navLinkClass}>{user ? 'Student Home' : 'Home'}</NavLink>
          <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>
          <NavLink to="/saved" className={navLinkClass}>Saved</NavLink>
          <NavLink to="/my-registrations" className={navLinkClass}>My registrations</NavLink>
          {user && <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>}
        </nav>

        <div className="nav-actions">
          <button type="button" className="icon-button" aria-label="Toggle theme" onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <button type="button" className="profile-avatar-wrap" aria-label="Open profile" onClick={() => navigate('/profile')}>
              {user.photo ? <img src={user.photo} alt="Profile" className="profile-avatar" /> : <span className="profile-avatar initial">{avatarText || 'U'}</span>}
              {unread > 0 && <span className="gold-dot" aria-label="Unread alerts" />}
            </button>
          ) : (
            <button type="button" className="profile-avatar-wrap guest" aria-label="Open login" onClick={() => onOpenAuth('login')}>
              <CircleUserRound size={20} />
            </button>
          )}
        </div>
      </div>
      {mobileNavOpen && (
        <div className="mobile-menu">
          <NavLink to="/" onClick={() => setMobileNavOpen(false)}>{user ? 'Student Home' : 'Home'}</NavLink>
          <NavLink to="/explore" onClick={() => setMobileNavOpen(false)}>Explore</NavLink>
          <NavLink to="/saved" onClick={() => setMobileNavOpen(false)}>Saved</NavLink>
          <NavLink to="/my-registrations" onClick={() => setMobileNavOpen(false)}>My registrations</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" onClick={() => setMobileNavOpen(false)}>Profile</NavLink>
              <button type="button" className="btn btn-ghost" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => { onOpenAuth('login'); setMobileNavOpen(false); }}>Log in</button>
          )}
        </div>
      )}
    </header>
  );
}

function HomePage({ user, onOpenAuth, onSaveToggle, saved, onOpenExplore }) {
  const navigate = useNavigate();
  const featured = getFeaturedEvents();
  const vibeTiles = [
    { icon: BookOpen, label: 'Learn', description: 'Ideas, skills and expert perspectives that move you.' },
    { icon: Trophy, label: 'Compete', description: 'Challenge yourself with campus classics and friendly rivalries.' },
    { icon: Sparkles, label: 'Create', description: 'Build, design, film, and bring your creativity to life.' },
    { icon: PawPrint, label: 'Chill', description: 'Relaxed hangouts and easy friendships for a slower vibe.' },
    { icon: Users, label: 'Network', description: 'Meet future collaborators, peers and mentors in person.' },
    { icon: HeartHandshake, label: 'Give back', description: 'Make your campus stronger and more connected.' }
  ];

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Where campus comes together</p>
          <h1 className="hero-title">Find your next great <span className="accent">experience.</span></h1>
          <p className="muted" style={{ maxWidth: '560px' }}>Meet people, discover events and make campus feel like yours.</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={onOpenExplore}>Explore events</button>
            <button type="button" className="text-link" onClick={() => user ? navigate('/my-registrations') : onOpenAuth('register')}>{user ? 'My registrations' : 'Join MEHFIL'}</button>
          </div>
          <div className="hero-step-row">01 DISCOVER 02 REGISTER 03 EXPERIENCE</div>
        </div>
        <CalendarHero />
      </section>

      <div className="campus-strip">ONE CAMPUS • MANY INTERESTS • COUNTLESS EXPERIENCES</div>

      <section className="spaced-section">
        <div className="section-heading-row">
          <div>
            <p className="kicker">Featured</p>
            <h2 className="section-title">Pick your next vibe</h2>
          </div>
        </div>
        <div className="featured-grid">
          {featured.map((event) => (
            <EventCard key={event.id} event={event} onSaveToggle={onSaveToggle} saved={saved} />
          ))}
        </div>
      </section>

      <section className="spaced-section">
        <div className="section-heading-row">
          <div>
            <p className="kicker">Explore by energy</p>
            <h2 className="section-title">Find your fit</h2>
          </div>
        </div>
        <div className="vibe-grid">
          {vibeTiles.map(({ icon: Icon, label, description }) => (
            <Link key={label} to={`/explore?category=${encodeURIComponent(label)}`} className="vibe-tile card">
              <div className="icon-box"><Icon size={22} /></div>
              <h3>{label}</h3>
              <p className="muted">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="spaced-section">
        <div className="section-heading-row">
          <div>
            <p className="kicker">How it works</p>
            <h2 className="section-title">Feel the momentum</h2>
          </div>
        </div>
        <div className="how-grid">
          {[
            { number: '01', title: 'Discover', description: 'Browse campus events that match your energy and interests.', icon: Search },
            { number: '02', title: 'Save', description: 'Keep the ones you want close to your plans and reminders.', icon: Heart },
            { number: '03', title: 'Register', description: 'Try a free demo registration saved in this browser; no backend confirmation is connected.', icon: Ticket },
            { number: '04', title: 'Show up', description: 'Turn up, connect, and make your week a little brighter.', icon: QrCode }
          ].map(({ number, title, description, icon: Icon }) => (
            <div key={title} className="how-card card">
              <div className="number-badge">{number}</div>
              <div className="icon-box"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p className="muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-band">
        <div>
          <p className="kicker">Join the campus rhythm</p>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>Not just an event. A place to belong.</h3>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => user ? navigate('/explore') : onOpenAuth('register')}>Explore now</button>
      </div>
    </main>
  );
}

function CalendarHero() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date('2026-12-01'));
  const [monthCursor, setMonthCursor] = useState(new Date('2026-12-01'));

  const eventMap = useMemo(() => {
    const map = {};
    EVENT_SEED.forEach((event) => {
      const dayKey = format(parseISO(event.start), 'yyyy-MM-dd');
      if (!map[dayKey]) map[dayKey] = [];
      map[dayKey].push(event);
    });
    return map;
  }, []);

  const monthDates = eachDayOfInterval({
    start: startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 })
  });

  const selectedDayEvents = eventMap[format(selectedDate, 'yyyy-MM-dd')] || [];

  return (
    <div className="calendar-card card">
      <div className="calendar-header">
        <button type="button" className="icon-button" onClick={() => setMonthCursor(prev => subMonths(prev, 1))}><ArrowLeft size={18} /></button>
        <div className="calendar-month">{format(monthCursor, 'MMMM yyyy')}</div>
        <button type="button" className="icon-button" onClick={() => setMonthCursor(prev => addMonths(prev, 1))}><ArrowRight size={18} /></button>
      </div>
      <div className="calendar-weekdays">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid" role="grid" aria-label="Monthly event calendar">
        {monthDates.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const dayEvents = eventMap[key] || [];
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, monthCursor);
          return (
            <button
              type="button"
              key={key}
              role="gridcell"
              className={`day-cell ${isCurrentMonth ? '' : 'muted'} ${isSelected ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
              aria-label={`Open ${format(date, 'dd MMM yyyy')}`}
              onClick={() => setSelectedDate(date)}
            >
              <span>{format(date, 'd')}</span>
              {dayEvents.length > 0 && (
                <span className="day-dots">{dayEvents.slice(0, 3).map((event) => <span key={event.id} className="dot" />)}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="day-events-list">
        {selectedDayEvents.length > 0 ? selectedDayEvents.slice(0, 3).map((event) => (
          <button key={event.id} type="button" className="day-event" onClick={() => navigate(`/events/${event.id}`)}>
            <span className="date-block small"><strong>{format(parseISO(event.start), 'd')}</strong><span>{format(parseISO(event.start), 'MMM')}</span></span>
            <div>
              <strong>{event.title}</strong>
              <small>{format(parseISO(event.start), 'p')} • {event.seatsTaken}/{event.capacity} left</small>
            </div>
          </button>
        )) : <p className="muted">No events planned.</p>}
        <Link to="/explore" className="text-link">View all events</Link>
      </div>
    </div>
  );
}

function ExplorePage({ onSaveToggle, saved }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Soonest');
  const [dateFilter, setDateFilter] = useState('Any date');
  const [visibleCount, setVisibleCount] = useState(12);

  const all = useMemo(() => {
    let items = [...getPublishedEvents()];
    if (query) {
      items = items.filter((item) => `${item.title} ${item.category} ${item.venue}`.toLowerCase().includes(query.toLowerCase()));
    }
    if (category !== 'All') items = items.filter((item) => item.category === category);
    if (dateFilter === 'This week') items = items.filter((item) => {
      const daysUntilEvent = differenceInCalendarDays(parseISO(item.start), new Date());
      return daysUntilEvent >= 0 && daysUntilEvent <= 7;
    });
    if (dateFilter === 'This month') items = items.filter((item) => format(parseISO(item.start), 'yyyy-MM') === format(new Date(), 'yyyy-MM'));
    if (dateFilter === 'Next month') items = items.filter((item) => format(parseISO(item.start), 'yyyy-MM') === format(addMonths(new Date(), 1), 'yyyy-MM'));
    if (sort === 'Popular') items = items.sort((a, b) => b.seatsTaken - a.seatsTaken);
    else if (sort === 'Newest') items = items.sort((a, b) => parseISO(b.start) - parseISO(a.start));
    else items = items.sort((a, b) => parseISO(a.start) - parseISO(b.start));
    return items;
  }, [query, category, sort, dateFilter]);

  const visible = all.slice(0, visibleCount);

  return (
    <main className="page-shell explore-page">
      <div className="explore-header">
        <p className="kicker">Discover</p>
        <h1 className="section-title">Discover what fits your vibe</h1>
      </div>

      <div className="toolbar">
        <div className="toolbar-inner">
          <div className="toolbar-row">
            <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" aria-label="Search events" />
            <select className="select-box" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option>Any date</option>
              <option>This week</option>
              <option>This month</option>
              <option>Next month</option>
            </select>
            <select className="select-box" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Soonest</option>
              <option>Popular</option>
              <option>Newest</option>
            </select>
            <span className="muted">{all.length} events</span>
          </div>
          <div className="category-row">
            {categoryList.map((item) => (
              <button key={item} type="button" className={`category-chip ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="event-grid">
        {visible.map((event) => (
          <EventCard key={event.id} event={event} onSaveToggle={onSaveToggle} saved={saved} />
        ))}
      </div>

      {visible.length === 0 && <div className="empty-state"><h3>No events match.</h3><p className="muted">Try a broader search or change filters.</p></div>}
      {visible.length < all.length && (
        <div style={{ display: 'grid', placeItems: 'center', marginTop: '1.2rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setVisibleCount((count) => count + 12)}>Load more</button>
        </div>
      )}
    </main>
  );
}

function EventDetailPage({ registrations, onRegister, onSaveToggle, saved }) {
  const { id, eventId } = useParams();
  const event = getEventById(id || eventId);
  const [tab, setTab] = useState('About');

  if (!event) return <NotFoundPage />;

  const start = parseISO(event.start);
  const end = parseISO(event.end);
  const similar = getSimilarEvents(event.category, event.id);
  const isSavedState = saved.some((entry) => entry.eventId === event.id);
  const isFull = event.seatsTaken >= event.capacity;
  const isPast = event.status === 'past' || event.status === 'closed';
  const registration = registrations.find((entry) => entry.eventId === event.id);
  const isRegistered = Boolean(registration);
  const userCanRegister = !isFull && !isPast && !isRegistered;
  const remaining = Math.max(event.capacity - event.seatsTaken, 0);

  const handleRegister = () => {
    if (userCanRegister) onRegister(event);
  };

  return (
    <main className="page-shell details-page">
      <div className="detail-cover">
        <div className={`cover-art gradient-${event.gradient}`}>
          <div>
            <span className="capsule upcoming">{event.category}</span>
            <span className="capsule confirmed" style={{ marginLeft: '0.5rem' }}>FREE</span>
            <h1 style={{ fontSize: '2.8rem', marginTop: '1rem' }}>{event.title}</h1>
          </div>
          <div className="date-box large-box"><strong>{format(start, 'd')}</strong><span>{format(start, 'MMM')}</span></div>
        </div>
        <div className="cover-side">
          <div className="event-meta">
            <div className="date-box"><strong>{format(start, 'd')}</strong><span>{format(start, 'MMM')}</span></div>
            <div>
              <strong>{event.category}</strong>
              <p className="muted">{format(start, 'EEEE, d MMMM')}</p>
            </div>
          </div>
          <div className="meta-row"><MapPin size={18} /><span>{event.venue}</span></div>
          <div className="meta-row"><CalendarRange size={18} /><span>{format(start, 'p')} to {format(end, 'p')}</span></div>
          <div className="meta-row"><Users size={18} /><span>{remaining} seats left</span></div>
        </div>
      </div>

      <div className="detail-header">
        <div>
          <p className="kicker">Organizer</p>
          <h3 style={{ margin: 0 }}>{event.organizer}</h3>
        </div>
        <div className="profile-actions">
          <button type="button" className={`btn ${isSavedState ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onSaveToggle(event.id)}>
            <Heart size={16} fill={isSavedState ? 'currentColor' : 'none'} />
            {isSavedState ? 'Saved' : 'Save event'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Share</button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="info-panel">
          <div className="detail-tabs">
            {['About', 'Schedule', 'FAQs'].map((entry) => (
              <button key={entry} type="button" className={tab === entry ? 'active' : ''} onClick={() => setTab(entry)}>{entry}</button>
            ))}
          </div>

          <div className="tab-panel">
            {tab === 'About' && <p className="muted">{event.description}</p>}
            {tab === 'Schedule' && <div className="meta-list"><div className="meta-row"><strong>Start</strong><span>{format(start, 'EEEE, d MMMM yyyy • p')}</span></div><div className="meta-row"><strong>End</strong><span>{format(end, 'EEEE, d MMMM yyyy • p')}</span></div><div className="meta-row"><strong>Venue</strong><span>{event.venue}</span></div></div>}
            {tab === 'FAQs' && <div className="meta-list"><div className="meta-row"><strong>Doors</strong><span>Arrival 30 minutes before showtime.</span></div><div className="meta-row"><strong>Pass</strong><span>A local demo pass is available after a demo registration.</span></div><div className="meta-row"><strong>Notes</strong><span>Organizer check-in verification is not connected in this demo.</span></div></div>}
          </div>
        </div>

        <aside className="booking-panel">
          <div className="event-seat">
            <div className="event-seat-row"><span>Seats left</span><strong>{remaining}</strong></div>
            <div className="progress-bar"><span style={{ width: `${(event.seatsTaken / event.capacity) * 100}%` }} /></div>
          </div>
          <h3 style={{ marginTop: '1rem' }}>FREE</h3>
          <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleRegister} disabled={!userCanRegister}>
            {isRegistered ? 'Registered on this device' : isPast ? 'Registration closed' : isFull ? 'Event full' : 'Register free'}
          </button>
          <p className="muted" style={{ fontSize: '0.85rem' }}>Demo only: registration is stored in this browser and is not sent to event organizers.</p>
          <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.7rem' }} onClick={() => {
            const calendarText = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDTSTART:${format(start, 'yyyyMMdd\'T\'HHmmss')}\nDTEND:${format(end, 'yyyyMMdd\'T\'HHmmss')}\nLOCATION:${event.venue}\nEND:VEVENT\nEND:VCALENDAR`;
            const blob = new Blob([calendarText], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${event.title}.ics`;
            a.click();
            URL.revokeObjectURL(url);
          }}>Add to calendar</button>
          <div className="meta-list">
            <div className="meta-row"><strong>Category</strong><span>{event.category}</span></div>
            <div className="meta-row"><strong>Venue</strong><span>{event.venue}</span></div>
          </div>
        </aside>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <p className="kicker">YOU MAY ALSO LIKE</p>
        <div className="similar-row">
          {similar.map((item) => (
            <EventCard key={item.id} event={item} onSaveToggle={onSaveToggle} saved={saved} />
          ))}
        </div>
      </div>

      <div className="mobile-bar">
        <div>
          <strong>FREE</strong>
          <div className="muted">{remaining} seats left</div>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleRegister} disabled={!userCanRegister}>
          {isRegistered ? 'Registered on this device' : isPast ? 'Registration closed' : isFull ? 'Event full' : 'Register free'}
        </button>
      </div>
    </main>
  );
}

function SavedEventsPage({ user, onOpenAuth, saved, onSaveToggle }) {
  if (!user) {
    return <EmptyGuestPage title="Saved events" message="Log in to keep track of events that you want to revisit." onAction={() => onOpenAuth('login')} />;
  }

  const savedEvents = saved
    .map((entry) => getEventById(entry.eventId))
    .filter(Boolean);

  return (
    <main className="page-shell profile-page">
      <h1 className="section-title">Saved events</h1>
      {savedEvents.length ? (
        <div className="event-grid">
          {savedEvents.map((event) => (
            <EventCard key={event.id} event={event} onSaveToggle={onSaveToggle} saved={saved} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No saved events yet.</h3>
          <p className="muted">Save an event and it will appear here.</p>
        </div>
      )}
    </main>
  );
}

function DigitalEventPass({ registration, event, user }) {
  const passRef = useRef(null);
  const [downloadState, setDownloadState] = useState('idle');
  const [downloadError, setDownloadError] = useState('');
  const start = parseISO(event.start);

  const downloadPass = async () => {
    if (!passRef.current) {
      setDownloadError('The event pass is not ready yet.');
      setDownloadState('error');
      return;
    }

    setDownloadState('loading');
    setDownloadError('');
    try {
      const qrSvg = passRef.current.querySelector('.pass-qr svg');
      if (!qrSvg) throw new Error('QR code is not ready');

      const svgText = new XMLSerializer().serializeToString(qrSvg);
      const svgUrl = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
      const qrImage = new Image();
      qrImage.src = svgUrl;
      try {
        await qrImage.decode();
      } finally {
        URL.revokeObjectURL(svgUrl);
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 780;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is unavailable');

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#0B132B';
      context.fillRect(0, 0, canvas.width, 22);
      context.fillStyle = '#0B132B';
      context.beginPath();
      context.arc(92, 92, 34, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#F4F7FA';
      context.font = '700 38px Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('M', 92, 92);

      context.textAlign = 'left';
      context.textBaseline = 'alphabetic';
      context.fillStyle = '#0B132B';
      context.font = '700 34px Arial, sans-serif';
      context.fillText('MEHFIL', 145, 88);
      context.fillStyle = '#3A506B';
      context.font = '18px Arial, sans-serif';
      context.fillText('DIGITAL EVENT PASS', 145, 119);
      context.strokeStyle = '#DCE3EA';
      context.beginPath();
      context.moveTo(72, 160);
      context.lineTo(1128, 160);
      context.stroke();

      context.fillStyle = '#0B132B';
      context.font = '700 36px Arial, sans-serif';
      context.fillText(event.title, 72, 220, 720);

      const passRows = [
        ['ATTENDEE', user.name],
        ...(user.studentId ? [['STUDENT ID', user.studentId]] : []),
        ['DATE & TIME', `${format(start, 'EEEE, d MMM yyyy')} • ${format(start, 'p')}`],
        ['VENUE', event.venue],
        ['REGISTRATION ID', registration.id]
      ];
      let rowY = 280;
      passRows.forEach(([label, value]) => {
        context.fillStyle = '#3A506B';
        context.font = '700 15px Arial, sans-serif';
        context.fillText(label, 72, rowY);
        context.fillStyle = '#0B132B';
        context.font = '23px Arial, sans-serif';
        context.fillText(value, 72, rowY + 30, 700);
        rowY += 92;
      });

      context.fillStyle = '#ffffff';
      context.fillRect(850, 230, 290, 290);
      context.drawImage(qrImage, 875, 255, 240, 240);
      context.fillStyle = '#3A506B';
      context.textAlign = 'center';
      context.font = '16px Arial, sans-serif';
      context.fillText('DEMO QR — NOT VALID FOR ENTRY', 995, 550);

      const image = canvas.toDataURL('image/png');
      if (image === 'data:,') throw new Error('PNG generation failed');
      const link = document.createElement('a');
      link.download = `mehfil-pass-${registration.id}.png`;
      link.href = image;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadState('idle');
    } catch {
      setDownloadError('Could not generate the pass image. Please try again.');
      setDownloadState('error');
    }
  };

  return (
    <section className="digital-pass" aria-label={`Demo digital event pass for ${event.title}`}>
      <div className="digital-pass-content" ref={passRef}>
        <header className="pass-brand">
          <span className="logo-mark">M</span>
          <div>
            <strong>MEHFIL</strong>
            <span>Demo digital event pass</span>
          </div>
        </header>
        <div className="pass-details">
          <h3>{event.title}</h3>
          <div><strong>Attendee</strong><span>{user.name}</span></div>
          {user.studentId && <div><strong>Student ID</strong><span>{user.studentId}</span></div>}
          <div><strong>Date &amp; time</strong><span>{format(start, 'EEEE, d MMM yyyy')} • {format(start, 'p')}</span></div>
          <div><strong>Venue</strong><span>{event.venue}</span></div>
          <div><strong>Registration ID</strong><span>{registration.id}</span></div>
        </div>
        <div className="pass-qr" aria-label="Registration QR code">
          <QRCodeSVG
            value={getPassQrValue(registration.id)}
            size={184}
            level="H"
            bgColor="#ffffff"
            fgColor="#0B132B"
            title={`MEHFIL registration ${registration.id}`}
          />
        </div>
        <p className="pass-qr-caption">Demo QR only — not valid for entry or attendance verification.</p>
      </div>
      <div className="pass-download-row">
        <button type="button" className="btn btn-secondary" onClick={downloadPass} disabled={downloadState === 'loading'} aria-busy={downloadState === 'loading'}>
          <Download size={16} />
          {downloadState === 'loading' ? 'Generating pass…' : 'Download demo pass'}
        </button>
        {downloadError && <p className="pass-error" role="alert">{downloadError}</p>}
      </div>
    </section>
  );
}

function MyRegistrationsPage({ user, onOpenAuth, registrations, onCancel, pageTitle = 'My registrations' }) {
  if (!user) {
    return <EmptyGuestPage title={pageTitle} message="Log in to keep track of your upcoming campus plans." onAction={() => onOpenAuth('login')} />;
  }

  const upcoming = registrations.filter((entry) => parseISO(getEventById(entry.eventId)?.start || '2099-12-01') >= new Date());
  const past = registrations.filter((entry) => parseISO(getEventById(entry.eventId)?.start || '1999-12-01') < new Date());

  return (
    <main className="page-shell profile-page">
      <h1 className="section-title">{pageTitle}</h1>
      <p className="muted">Demo registrations are stored in this browser only and are not confirmed by an event organizer.</p>
      <div className="profile-content">
        <div className="profile-panel">
          <h3>Upcoming</h3>
          {upcoming.length ? upcoming.map((reg) => {
            const event = getEventById(reg.eventId);
            if (!event) return null;
            return (
              <div key={reg.id} className="registration-entry">
                <div className="reg-item">
                  <div>
                    <strong>{event.title}</strong>
                    <div className="muted">{format(parseISO(event.start), 'd MMM')} • {event.venue}</div>
                    <span className="capsule upcoming">Local demo</span>
                  </div>
                  <div className="profile-actions">
                    <Link to={`/events/${event.id}`} className="btn btn-ghost">View event</Link>
                    <button type="button" className="btn btn-danger" onClick={() => onCancel(event.id)}>Remove demo registration</button>
                  </div>
                </div>
                {(reg.status === 'confirmed' || reg.status === 'demo-local') && <DigitalEventPass registration={reg} event={event} user={user} />}
              </div>
            );
          }) : <div className="empty-state"><p className="muted">No upcoming events yet.</p></div>}
        </div>
        <div className="profile-panel" style={{ marginTop: '1rem' }}>
          <h3>Past</h3>
          {past.length ? past.map((reg) => { const event = getEventById(reg.eventId); return <div key={reg.id} className="reg-item"><div><strong>{event?.title}</strong><div className="muted">{format(parseISO(event?.start || '2026-12-01'), 'd MMM')}</div></div><Link to={`/events/${event?.id}`} className="btn btn-ghost">View</Link></div>;}) : <div className="empty-state"><p className="muted">No past registrations.</p></div>}
        </div>
      </div>
    </main>
  );
}

function ProfilePage({ user, setUser, onOpenAuth, onLogout, saved, registrations, alerts, setAlerts, theme, setTheme }) {
  const [tab, setTab] = useState('Profile');
  const [openPanel, setOpenPanel] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [formSaved, setFormSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setPhoto(user.photo || '');
    }
  }, [user]);

  if (!user) {
    return <EmptyGuestPage title="Profile" message="Create an account to manage your profile, alerts and saved events." onAction={() => onOpenAuth('register')} />;
  }

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    const next = updateUserProfile(user.id, { name, username, phone, photo, profileComplete: true });
    setUser(next);
    setFormSaved(true);
    setTimeout(() => setFormSaved(false), 1800);
  };

  const alertItems = alerts.length ? alerts : [];
  const savedList = saved.map((entry) => getEventById(entry.eventId)).filter(Boolean);

  return (
    <main className="page-shell profile-page">
      <div className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="avatar-large">{photo ? <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (user.name || 'U').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase().slice(0, 2)}</div>
          <div>
            <h1 style={{ margin: 0 }}>{user.name}</h1>
            <p className="muted">@{user.username}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              <span className="capsule confirmed">{user.department || 'Student'}</span>
              <span className="capsule upcoming">{user.year || 'Year 1'}</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setOpenPanel('profile')}>Edit profile</button>
          <button type="button" className="btn btn-danger" onClick={onLogout}>Log out</button>
        </div>
      </div>

      <div className="quick-actions">
        {[
          { key: 'profile', label: 'Profile', description: 'Update your details', icon: SquarePen },
          { key: 'alerts', label: 'Alerts', description: 'Fresh updates from campus', icon: Bell },
          { key: 'saved', label: 'Saved', description: 'Keep track of your next plans', icon: Save }
        ].map(({ key, label, description, icon: Icon }) => (
          <button key={key} type="button" className={`quick-card ${openPanel === key ? 'active' : ''}`} onClick={() => {
            setOpenPanel(key);
            window.location.hash = key;
          }}>
            <div className="quick-card-header">
              <span className="icon-box"><Icon size={18} /></span>
              {key === 'alerts' && alerts.filter((item) => !item.read).length > 0 && <span className="count-badge">{alerts.filter((item) => !item.read).length}</span>}
              {key === 'saved' && saved.length > 0 && <span className="count-badge">{saved.length}</span>}
            </div>
            <strong>{label}</strong>
            <p className="muted">{description}</p>
            <span className="muted" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><ChevronRight size={16} /></span>
          </button>
        ))}
      </div>

      <div className="profile-content">
        {openPanel === 'profile' && (
          <div className="profile-panel">
            <h3>Profile</h3>
            <div className="form-grid">
              <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="field"><label>Username</label><input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
              <div className="field"><label>Department</label><select value={user.department || ''} onChange={(e) => setUser({ ...user, department: e.target.value })}><option value="">Select department</option><option>Computer Science</option><option>Design</option><option>Business</option><option>Mechanical</option><option>Biotechnology</option></select></div>
              <div className="field"><label>Year</label><select value={user.year || ''} onChange={(e) => setUser({ ...user, year: e.target.value })}><option value="">Select year</option><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option></select></div>
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Photo</label>
                <div className="profile-actions">
                  <input type="file" accept="image/png,image/jpeg" onChange={handlePhotoUpload} />
                  {photo && <button type="button" className="btn btn-danger" onClick={() => setPhoto('')}>Remove</button>}
                </div>
              </div>
            </div>
            <div className="profile-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>{formSaved ? 'Saved' : 'Save changes'}</button>
            </div>
          </div>
        )}

        {openPanel === 'alerts' && (
          <div className="profile-panel">
            <h3>Alerts</h3>
            <div className="profile-actions" style={{ marginBottom: '1rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => { alerts.forEach((item) => markAlertRead(user.id, item.id)); setAlerts(getAlerts(user.id)); }}>Mark all as read</button>
            </div>
            {alertItems.length ? alertItems.map((item) => (
              <div key={item.id} className="alert-item">
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {!item.read && <span className="alert-bubble" />}
                  <div>
                    <strong>{item.message}</strong>
                    <div className="muted">{format(parseISO(item.createdAt), 'd MMM')}</div>
                  </div>
                </div>
                <div className="profile-actions">
                  {!item.read && <button type="button" className="btn btn-secondary" onClick={() => { markAlertRead(user.id, item.id); setAlerts(getAlerts(user.id)); }}>Mark read</button>}
                  <button type="button" className="btn btn-danger" onClick={() => { deleteAlert(user.id, item.id); setAlerts(getAlerts(user.id)); }}>Delete</button>
                </div>
              </div>
            )) : <div className="empty-state"><p className="muted">You are up to date.</p></div>}
          </div>
        )}

        {openPanel === 'saved' && (
          <div className="profile-panel">
            <h3>Saved</h3>
            {savedList.length ? savedList.map((event) => (
              <div key={event.id} className="saved-item">
                <div><strong>{event.title}</strong><div className="muted">{format(parseISO(event.start), 'd MMM')}</div></div>
                <div className="profile-actions">
                  <Link to={`/events/${event.id}`} className="btn btn-primary">View event</Link>
                  <button type="button" className="btn btn-danger" onClick={() => { removeSavedEvent(user.id, event.id); setUser({ ...user }); window.location.reload(); }}>Remove</button>
                </div>
              </div>
            )) : <div className="empty-state"><p className="muted">Saved events will appear here.</p></div>}
          </div>
        )}
      </div>

      <div className="profile-tabs">
        {['Profile', 'Registrations', 'Saved', 'Alerts', 'Achievements', 'Appearance'].map((name) => (
          <button key={name} type="button" className={`profile-tab ${tab === name ? 'active' : ''}`} onClick={() => setTab(name)}>{name}</button>
        ))}
      </div>

      {tab === 'Registrations' && (
        <div className="profile-panel" style={{ marginTop: '1rem' }}>
          {registrations.length ? registrations.map((reg) => { const event = getEventById(reg.eventId); if (!event) return null; return <div key={reg.id} className="reg-item"><div><strong>{event.title}</strong><div className="muted">{format(parseISO(event.start), 'd MMM')} • {event.venue}</div></div>          <span className="capsule upcoming">Local demo</span></div>; }) : <div className="empty-state"><p className="muted">No registrations yet.</p></div>}
        </div>
      )}

      {tab === 'Achievements' && (
        <div className="profile-panel" style={{ marginTop: '1rem' }}>
          <div className="achievement-grid">
            {[
              { name: 'First RSVP', unlocked: registrations.length > 0 },
              { name: 'Campus Explorer', unlocked: saved.length > 0 },
              { name: 'Volunteer Spirit', unlocked: false },
              { name: 'Community Builder', unlocked: false }
            ].map((item) => (
              <div key={item.name} className={`achievement ${item.unlocked ? 'unlocked' : ''}`}>
                <BadgeCheck size={20} />
                <strong>{item.name}</strong>
                <p className="muted">{item.unlocked ? 'Unlocked' : 'Locked'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Appearance' && (
        <div className="profile-panel" style={{ marginTop: '1rem' }}>
          <h3>Appearance</h3>
          <div className="appearance-group">
            {['Light', 'Dark', 'System'].map((option) => (
              <button key={option} type="button" className={`choice-pill ${theme === (option.toLowerCase()) || (option === 'System' && theme !== 'light' && theme !== 'dark') ? 'active' : ''}`} onClick={() => {
                if (option === 'System') setTheme(systemTheme());
                else setTheme(option.toLowerCase());
              }}>{option}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}></div>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="page-shell" style={{ padding: '4rem 0' }}>
      <div className="empty-state">
        <h1>Page not found</h1>
        <p className="muted">The route you requested is not available.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back home</Link>
      </div>
    </main>
  );
}

function EmptyGuestPage({ title, message, onAction }) {
  return (
    <main className="page-shell" style={{ padding: '4rem 0' }}>
      <div className="empty-state">
        <h1>{title}</h1>
        <p className="muted">{message}</p>
        <button type="button" className="btn btn-primary" onClick={onAction} style={{ marginTop: '1rem' }}>Continue</button>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <div className="brand"><span className="logo-mark">M</span><span className="logo-wordmark">MEHFIL</span></div>
          <p className="muted" style={{ marginTop: '0.75rem' }}>Where campus comes together</p>
        </div>
        <div>
          <strong>Explore</strong>
          <ul className="footer-links">
            <li><Link to="/explore">Events</Link></li>
            <li><Link to="/saved">Saved</Link></li>
            <li><Link to="/my-pass">My pass</Link></li>
          </ul>
        </div>
        <div>
          <strong>Campus</strong>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function AuthModal({ mode, onModeChange, onClose, onSuccess }) {
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirm: '', username: '', department: 'Computer Science', year: 'Year 1', phone: '', photo: '', terms: false });
  const [stage, setStage] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const submitLogin = (e) => {
    e.preventDefault();
    try {
      const next = loginUser(loginData);
      onSuccess(next);
    } catch (err) {
      setError(err.message);
    }
  };

  const useDemoOrganizer = () => {
    try {
      onSuccess(loginAsDemoOrganizer());
    } catch (demoError) {
      setError(demoError.message || 'The organizer demo could not be opened.');
    }
  };

  const submitRegister = (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!registerData.terms) {
      setError('Please accept the terms to continue.');
      return;
    }
    if (stage === 1) {
      setStage(2);
      return;
    }
    if (!registerData.username) {
      setError('Choose a username.');
      return;
    }
    try {
      const next = registerUser({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        username: registerData.username,
        department: registerData.department,
        year: registerData.year,
        phone: registerData.phone,
        photo: registerData.photo,
      });
      onSuccess(next);
    } catch (err) {
      setError(err.message);
    }
  };

  const loginPanel = (
    <form onSubmit={submitLogin}>
      <div className="field"><label>Email or username</label><input value={loginData.identifier} onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })} /></div>
      <div className="field"><label>Password</label><input type={showPass ? 'text' : 'password'} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} /></div>
      <div className="profile-actions" style={{ justifyContent: 'space-between', marginTop: '0.7rem' }}>
        <button type="button" className="btn btn-ghost" onClick={() => setShowPass((prev) => !prev)}>{showPass ? 'Hide' : 'Show'}</button>
        <button type="button" className="btn btn-secondary">Forgot password</button>
      </div>
      {error && <p className="muted" style={{ marginTop: '0.8rem' }}>{error}</p>}
      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Log in</button>
      <div className="demo-role-access">
        <p><strong>Mock role demo only.</strong> This shortcut does not authenticate a real organizer or secure organizer routes.</p>
        <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={useDemoOrganizer}>Continue as demo organizer</button>
      </div>
    </form>
  );

  const registerPanel = (
    <form onSubmit={submitRegister}>
      {stage === 1 ? (
        <>
          <div className="field"><label>Full name</label><input value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} /></div>
          <div className="field"><label>Password</label><input type={showPass ? 'text' : 'password'} value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} /></div>
          <div className="field"><label>Confirm password</label><input type={showPass ? 'text' : 'password'} value={registerData.confirm} onChange={(e) => setRegisterData({ ...registerData, confirm: e.target.value })} /></div>
          <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <input type="checkbox" checked={registerData.terms} onChange={(e) => setRegisterData({ ...registerData, terms: e.target.checked })} />
            <span>I agree to the terms and conditions.</span>
          </label>
        </>
      ) : (
        <>
          <div className="field"><label>Username</label><input value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} /></div>
          <div className="field"><label>Department</label><select value={registerData.department} onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })}><option>Computer Science</option><option>Design</option><option>Business</option><option>Mechanical</option><option>Biotechnology</option></select></div>
          <div className="field"><label>Year</label><select value={registerData.year} onChange={(e) => setRegisterData({ ...registerData, year: e.target.value })}><option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option></select></div>
          <div className="field"><label>Phone (optional)</label><input value={registerData.phone} onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} /></div>
          <div className="field"><label>Photo (optional)</label><input type="file" accept="image/png,image/jpeg" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setRegisterData({ ...registerData, photo: reader.result });
            reader.readAsDataURL(file);
          }} /></div>
        </>
      )}
      {error && <p className="muted" style={{ marginTop: '0.8rem' }}>{error}</p>}
      <div className="profile-actions" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
        {stage === 2 && <button type="button" className="btn btn-ghost" onClick={() => setStage(1)}>Back</button>}
        <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>{stage === 1 ? 'Continue' : 'Create account'}</button>
      </div>
    </form>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Welcome to MEHFIL</h2>
            <button type="button" className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="tab-strip" style={{ marginTop: '0.8rem' }}>
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => onModeChange('login')}>Log in</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => onModeChange('register')}>Register</button>
          </div>
        </div>
        <div className="modal-body">
          {mode === 'login' ? loginPanel : registerPanel}
        </div>
      </div>
    </div>
  );
}

function ClashModal({ onClose, onConfirm }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Clash warning</h3>
        </div>
        <div className="modal-body">
          <p className="muted">This event overlaps another registration in your list. Do you still want to continue?</p>
          <div className="profile-actions" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={onConfirm}>Continue</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  return <div className="toast">{message}</div>;
}

function EventCard({ event, onSaveToggle, saved }) {
  const start = parseISO(event.start);
  const isSavedState = saved.some((entry) => entry.eventId === event.id);
  const seatsLeft = event.capacity - event.seatsTaken;
  const meterTone = seatsLeft > 30 ? 'mint' : seatsLeft > 12 ? 'gold' : 'danger';

  return (
    <article className="card event-card">
      <Link to={`/events/${event.id}`} className="event-card-link" aria-label={`View ${event.title} event details`} />
      <div className={`event-cover gradient-${event.gradient}`}>
        <span className="event-category">{event.category}</span>
        <span className="capsule confirmed free-badge">FREE</span>
      </div>
      <div className="event-card-body">
        <div className="event-meta">
          <div className="date-block"><strong>{format(start, 'd')}</strong><span>{format(start, 'MMM')}</span></div>
          <div className="event-copy">
            <h3 style={{ margin: 0 }}>{event.title}</h3>
            <p className="muted">{event.venue}</p>
          </div>
        </div>
        <div className="event-seat">
          <div className="event-seat-row"><span>Seats left</span><strong>{seatsLeft}</strong></div>
          <div className={`progress-bar ${meterTone}`}><span style={{ width: `${Math.min((event.seatsTaken / event.capacity) * 100, 100)}%` }} /></div>
        </div>
        <div className="event-actions">
          <button type="button" className={`btn ${isSavedState ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onSaveToggle(event.id)}>
            <Heart size={16} fill={isSavedState ? 'currentColor' : 'none'} />
            {isSavedState ? 'Saved' : 'Save'}
          </button>
          <Link to={`/events/${event.id}`} className="btn btn-secondary">View Event</Link>
        </div>
      </div>
    </article>
  );
}

export default App;
