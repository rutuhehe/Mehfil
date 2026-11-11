# MEHFIL role-based portals

## Frontend behavior

- New accounts are assigned the `student` role by the mock auth API.
- The login dialog offers a clearly labeled **Continue as demo organizer** option. It creates a local demo organizer with the seeded event assignments `evt-1` through `evt-3`.
- Organizer event creation and editing are persisted in the browser under `mehfil_organizer_events`. The demo participant and analytics views read local registration data only.
- Student registrations use local browser storage and are labeled as demo data; they are not confirmed by an event organizer or backend.
- Student routes use the student layout. `/organizer/*` routes use the separate organizer layout and a frontend role guard. An organizer is redirected away from student pages; a student is denied access to organizer pages.
- Student pass QR codes are local demo references and are not valid for entry or attendance verification. QR check-in and attendance routes show an unavailable state. They do not scan passes, verify registrations, or update attendance.

## Production backend dependencies

The demo role selector and browser storage are not authentication or authorization. Frontend route guards can be bypassed and must never be treated as security controls.

Before production, the backend must provide:

- Authenticated sessions and authoritative role claims.
- Server-side authorization for organizer routes and event assignments.
- Event registration and cancellation APIs that return authoritative registration status.
- Event create, read, and update APIs that enforce ownership/assignment and free-event pricing.
- Authorized participant and analytics data for each assigned event.
- A QR verification endpoint that validates the registration reference and an attendance endpoint that records check-in.

No backend code or endpoints were added or assumed by this frontend implementation.
