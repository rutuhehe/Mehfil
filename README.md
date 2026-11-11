# MEHFIL

MEHFIL is a React frontend for student event discovery and organizer portals. It is built with React and Vite.

## Getting started

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

Other available scripts:

```sh
npm run lint
npm run build
npm run preview
```

## Demo limitations

This project currently uses browser storage and mock authentication for demo behavior. Student registrations and organizer data are local and are not backed by a server. Frontend role guards are not security controls.

Student QR passes contain local demo references only. They are not valid for event entry, and QR check-in is not connected to a verification or attendance backend.

See [Role-based portals](./docs/ROLE-BASED-PORTALS.md) for frontend behavior and production backend requirements, and [QR check-in](./docs/QR-CHECK-IN.md) for pass and check-in details.
