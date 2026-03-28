# Fitness Club - VIT Chennai

Fitness Club is a React + TypeScript portal built for the Fitness Club at VIT Chennai. The site combines a polished public-facing experience with an admin-controlled backend for managing members, events, achievements, announcements, testimonials, and club content.

## Highlights

- Built with React, TypeScript, Vite, Framer Motion, React Router, Three.js, and Supabase
- Includes dedicated pages for landing, leadership, event timeline, hall of fame, join flow, contact, calculator, privacy policy, and terms of service
- Features an admin dashboard for managing club data and content modules
- Supports member-related utilities such as login, member ID access, and QR or scan-oriented admin tools
- Loads live data from Supabase, with optional seed data available for initial system setup

## Project Structure

```text
.
|-- components/        Routed pages, shared UI, 3D visuals, and admin dashboard tabs
|-- utils/             Supabase mapping and helper utilities
|-- App.tsx            Main application shell, routes, navigation, and global UI behavior
|-- supabaseClient.ts  Supabase client setup
|-- constants.tsx      Seed data and initial fallback constants
|-- types.ts           Shared TypeScript models
```

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Vite will start the development server and print the local URL in the terminal.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run preview  # Preview the production build locally
npm run start    # Serve the project with a static server
```

## Supabase Configuration

The app currently creates the Supabase client directly in `supabaseClient.ts` using a project URL and anon key.

If you plan to make this project easier to deploy across environments, move those values into environment variables such as:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then update `supabaseClient.ts` to read from `import.meta.env`.

## Data and Admin Flow

Most of the public content is loaded from Supabase rather than hardcoded client-side data. The admin dashboard includes sections for:

- profiles or registry management
- event cycles and announcements
- hall of fame or archive content
- testimonials, FAQs, and site content blocks
- system seeding and backend write checks

Seed data for demo initialization is defined in `constants.tsx`.

## Build Notes

- Routing is handled with `HashRouter`
- The project includes animated UI transitions and some 3D presentation components
- `metadata.json` requests camera permission, which aligns with scan or QR-related features in the admin experience
- `netlify.toml` exists for deployment setup, though it is currently empty

## License

This repository does not currently declare a license.
