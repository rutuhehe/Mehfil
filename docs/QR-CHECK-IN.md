# MEHFIL QR passes and organizer check-in

Local demo registrations retain a downloadable digital pass. Its QR code contains only a local registration reference (`MEHFIL-REG:<registration-id>`), not credentials or personal details. It is not a backend-verified ticket and is not valid for event entry.

Students can display and download their passes from My Registrations. The organizer `/organizer/check-in` page currently displays “QR verification is not connected yet.” It does not scan codes, verify registrations, or record attendance.

Production check-in requires a backend verification endpoint that validates a pass reference and records attendance server-side. The organizer interface should only report success after that backend confirms the check-in.

See [ROLE-BASED-PORTALS.md](./ROLE-BASED-PORTALS.md) for all organizer portal backend dependencies and the frontend-only role guard limitations.
