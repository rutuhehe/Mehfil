import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ChartNoAxesColumn, ClipboardList, Clock3, LogOut, Moon, Plus, QrCode, Sun, Users } from 'lucide-react';
import { createOrganizerEvent, getOrganizerEvent, getOrganizerEvents, updateOrganizerEvent } from './api/events';
import { getAllRegistrations } from './api/registrations';

const categories = ['Wellness', 'Seminar', 'Networking', 'Workshop', 'Culture', 'Hackathon', 'Volunteer', 'Social', 'Career', 'Competition', 'Sports', 'Create'];

const toLocalDateTime = (value) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const formatDate = (value) => new Date(value).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export function OrganizerPortalLayout({ user, theme, setTheme, onLogout }) {
  const links = [
    { to: '/organizer', label: 'Dashboard', end: true },
    { to: '/organizer/events', label: 'My Events', end: true },
    { to: '/organizer/events/new', label: 'Create Event', end: true },
    { to: '/organizer/participants', label: 'Participants', end: true },
    { to: '/organizer/check-in', label: 'QR Check-in', end: true },
    { to: '/organizer/attendance', label: 'Attendance', end: true },
    { to: '/organizer/analytics', label: 'Analytics', end: true }
  ];

  return (
    <div className="organizer-shell">
      <header className="site-header organizer-header">
        <div className="page-shell organizer-header-inner">
          <Link to="/organizer" className="brand" aria-label="MEHFIL Organizer Dashboard">
            <span className="logo-mark">M</span>
            <span className="logo-wordmark">MEHFIL</span>
            <span className="organizer-brand-label">Organizer</span>
          </Link>
          <nav className="organizer-nav" aria-label="Organizer navigation">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `organizer-nav-link${isActive ? ' active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="organizer-header-actions">
            <button type="button" className="icon-button" aria-label="Toggle theme" onClick={() => setTheme((previous) => previous === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button type="button" className="btn btn-ghost organizer-logout" onClick={onLogout}>
              <LogOut size={16} /> Log out
            </button>
          </div>
        </div>
      </header>

      {user.isDemoRole && (
        <div className="page-shell organizer-demo-banner" role="status">
          <strong>Mock organizer access</strong>
          <span>This frontend demo uses local data. Route guards are not security controls; backend authorization is required before production use.</span>
        </div>
      )}

      <main className="organizer-content">
        <Outlet />
      </main>
    </div>
  );
}

export function OrganizerDashboard({ user }) {
  const events = getOrganizerEvents(user);
  const eventIds = new Set(events.map((event) => event.id));
  const registrations = getAllRegistrations().filter((entry) => eventIds.has(entry.eventId));
  const upcoming = events.filter((event) => event.status !== 'past');
  const stats = [
    { label: 'Assigned events', value: events.length, icon: CalendarDays },
    { label: 'Upcoming', value: upcoming.length, icon: Clock3 },
    { label: 'Local registrations', value: registrations.length, icon: Users }
  ];

  return (
    <section className="page-shell organizer-page">
      <div className="organizer-page-heading">
        <div>
          <p className="kicker">Organizer portal</p>
          <h1 className="section-title">Dashboard</h1>
          <p className="muted">Manage events assigned to {user.name}.</p>
        </div>
        <Link to="/organizer/events/new" className="btn btn-primary"><Plus size={16} /> Create event</Link>
      </div>
      {user.isDemoRole && <p className="organizer-data-note">Overview values are based on local demo data and are not backend-verified.</p>}

      <div className="organizer-stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article className="organizer-stat-card" key={label}>
            <span className="organizer-stat-icon"><Icon size={18} /></span>
            <span className="muted">{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="organizer-section-heading">
        <h2>Assigned events</h2>
        <Link to="/organizer/events" className="text-link">View all</Link>
      </div>
      <OrganizerEventList events={events.slice(0, 3)} />
    </section>
  );
}

export function OrganizerEventsPage({ user }) {
  const events = getOrganizerEvents(user);
  return (
    <section className="page-shell organizer-page">
      <div className="organizer-page-heading">
        <div>
          <p className="kicker">Organizer portal</p>
          <h1 className="section-title">My Events</h1>
        </div>
        <Link to="/organizer/events/new" className="btn btn-primary"><Plus size={16} /> Create event</Link>
      </div>
      {user.isDemoRole && <p className="organizer-data-note">Only events assigned to this mock organizer are shown. Changes are saved in this browser.</p>}
      <OrganizerEventList events={events} />
    </section>
  );
}

function OrganizerEventList({ events }) {
  if (!events.length) {
    return <div className="empty-state organizer-empty"><h2>No assigned events yet</h2><p className="muted">Create an event or ask an administrator to assign one to your organizer account.</p></div>;
  }

  return (
    <div className="organizer-event-list">
      {events.map((event) => (
        <article className="organizer-event-card" key={event.id}>
          <div className={`organizer-event-art gradient-${event.gradient}`} aria-hidden="true" />
          <div className="organizer-event-info">
            <div className="organizer-event-title-row">
              <h3>{event.title}</h3>
              <span className="capsule confirmed">FREE</span>
            </div>
            <p className="muted">{event.category} · {formatDate(event.start)} · {event.venue}</p>
            <p className="muted">{event.seatsTaken} / {event.capacity} seats taken</p>
          </div>
          <Link to={`/organizer/events/${event.id}/edit`} className="btn btn-secondary">Edit event</Link>
        </article>
      ))}
    </div>
  );
}

export function OrganizerEventForm({ user }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const existing = eventId ? getOrganizerEvent(user, eventId) : null;
  const [form, setForm] = useState(() => {
    const start = existing ? new Date(existing.start) : new Date(Date.now() + 86400000);
    const end = existing ? new Date(existing.end) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return {
      title: existing?.title ?? '',
      category: existing?.category ?? categories[0],
      description: existing?.description ?? '',
      venue: existing?.venue ?? '',
      start: toLocalDateTime(start),
      end: toLocalDateTime(end),
      capacity: existing?.capacity ?? 100
    };
  });
  const [error, setError] = useState('');

  if (eventId && !existing) {
    return (
      <section className="page-shell organizer-page">
        <div className="empty-state organizer-empty">
          <h1>Event unavailable</h1>
          <p className="muted">This event does not exist or is not assigned to your organizer account.</p>
          <Link to="/organizer/events" className="btn btn-primary">Back to My Events</Link>
        </div>
      </section>
    );
  }

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    setError('');
    const start = new Date(form.start);
    const end = new Date(form.end);
    const capacity = Number(form.capacity);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      setError('Enter a valid start and end date.');
      return;
    }
    if (!existing && start <= new Date()) {
      setError('The event start time must be in the future.');
      return;
    }
    if (start >= end) {
      setError('The event end time must be after the start time.');
      return;
    }
    if (!Number.isInteger(capacity) || capacity < (existing?.seatsTaken ?? 0) || capacity < 1) {
      setError('Capacity must be a whole number at least as large as seats already taken.');
      return;
    }
    const eventData = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      venue: form.venue.trim(),
      start: start.toISOString(),
      end: end.toISOString(),
      capacity,
      price: 0
    };
    try {
      if (existing) updateOrganizerEvent(user, existing.id, eventData);
      else createOrganizerEvent(user, eventData);
      navigate('/organizer/events');
    } catch (saveError) {
      setError(saveError.message || 'The event could not be saved.');
    }
  };

  return (
    <section className="page-shell organizer-page">
      <div className="organizer-page-heading">
        <div>
          <p className="kicker">Organizer portal</p>
          <h1 className="section-title">{existing ? 'Edit Event' : 'Create Event'}</h1>
        </div>
        <Link to="/organizer/events" className="btn btn-ghost">Cancel</Link>
      </div>
      <form className="profile-panel organizer-form" onSubmit={submit}>
        <p className="organizer-data-note">Events are free. This demo saves changes in local browser storage only.</p>
        <div className="organizer-form-grid">
          <label className="field organizer-field-wide">Event title<input required maxLength={100} value={form.title} onChange={updateField('title')} /></label>
          <label className="field">Category<select value={form.category} onChange={updateField('category')}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="field">Venue<input required maxLength={120} value={form.venue} onChange={updateField('venue')} /></label>
          <label className="field">Starts<input required type="datetime-local" value={form.start} onChange={updateField('start')} /></label>
          <label className="field">Ends<input required type="datetime-local" value={form.end} onChange={updateField('end')} /></label>
          <label className="field">Capacity<input required type="number" min={existing?.seatsTaken ?? 1} step="1" value={form.capacity} onChange={updateField('capacity')} /></label>
          <label className="field organizer-field-wide">Description<textarea required maxLength={2000} rows="5" value={form.description} onChange={updateField('description')} /></label>
        </div>
        <p className="organizer-free-note">Registration price: <strong>FREE</strong></p>
        {error && <p className="organizer-form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary">{existing ? 'Save changes' : 'Create event'}</button>
      </form>
    </section>
  );
}

export function OrganizerParticipantsPage({ user }) {
  const events = getOrganizerEvents(user);
  const eventMap = new Map(events.map((event) => [event.id, event]));
  const participants = getAllRegistrations().filter((entry) => eventMap.has(entry.eventId));

  return (
    <section className="page-shell organizer-page">
      <div className="organizer-page-heading">
        <div><p className="kicker">Organizer portal</p><h1 className="section-title">Participants</h1></div>
        <ClipboardList size={22} />
      </div>
      <p className="organizer-data-note">Local demo registrations only. Participant records are not synchronized with or verified by a backend.</p>
      {participants.length ? (
        <div className="organizer-table-wrap">
          <table className="organizer-table">
            <thead><tr><th>Event</th><th>Registration reference</th><th>Status</th><th>Registered</th></tr></thead>
            <tbody>{participants.map((participant) => (
              <tr key={participant.id}>
                <td>{eventMap.get(participant.eventId).title}</td>
                <td>{participant.id}</td>
                <td>Local demo</td>
                <td>{participant.createdAt ? formatDate(participant.createdAt) : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <div className="empty-state organizer-empty"><p className="muted">No local registrations exist for your assigned events.</p></div>}
    </section>
  );
}

export function OrganizerCheckInPage() {
  return (
    <section className="page-shell organizer-page">
      <p className="kicker">Organizer portal</p>
      <h1 className="section-title">QR Check-in</h1>
      <div className="organizer-unavailable" role="status">
        <QrCode size={24} aria-hidden="true" />
        <div>
          <h2>QR verification is not connected yet</h2>
          <p>A backend verification and attendance API is required before organizers can scan passes or confirm check-ins. No attendance has been recorded.</p>
        </div>
      </div>
    </section>
  );
}

export function OrganizerAttendancePage() {
  return (
    <section className="page-shell organizer-page">
      <p className="kicker">Organizer portal</p>
      <h1 className="section-title">Attendance Management</h1>
      <div className="organizer-unavailable" role="status">
        <Clock3 size={24} aria-hidden="true" />
        <div>
          <h2>Attendance management is not connected yet</h2>
          <p>Attendance can only be updated after the authorized backend API verifies a registration and records the check-in.</p>
        </div>
      </div>
    </section>
  );
}

export function OrganizerAnalyticsPage({ user }) {
  const events = getOrganizerEvents(user);
  const eventIds = new Set(events.map((event) => event.id));
  const registrations = getAllRegistrations().filter((entry) => eventIds.has(entry.eventId));

  return (
    <section className="page-shell organizer-page">
      <div className="organizer-page-heading">
        <div><p className="kicker">Organizer portal</p><h1 className="section-title">Event Analytics</h1></div>
        <ChartNoAxesColumn size={22} />
      </div>
      <p className="organizer-data-note">Local demo counts only; these figures are not authoritative analytics.</p>
      <div className="organizer-stats-grid">
        <article className="organizer-stat-card"><span className="muted">Assigned events</span><strong>{events.length}</strong></article>
        <article className="organizer-stat-card"><span className="muted">Local registrations</span><strong>{registrations.length}</strong></article>
        <article className="organizer-stat-card"><span className="muted">Seats in assigned events</span><strong>{events.reduce((sum, event) => sum + event.capacity, 0)}</strong></article>
      </div>
      <div className="organizer-event-list">
        {events.map((event) => {
          const count = registrations.filter((registration) => registration.eventId === event.id).length;
          return (
            <article className="organizer-event-card" key={event.id}>
              <div className="organizer-event-info">
                <h3>{event.title}</h3>
                <p className="muted">{count} local registration{count === 1 ? '' : 's'} · {event.seatsTaken}/{event.capacity} seeded seats taken</p>
              </div>
              <Link to={`/organizer/events/${event.id}/edit`} className="btn btn-ghost">Manage event</Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
