# Eden Wellness & Hospitality CRM

Operations, Reservations, and Guest 360 CRM platform for **Eden Wellness & Hospitality** (Salan Gaon, near Mussoorie & Dehradun, Uttarakhand).

Built with a Swiss minimal design system, neutral palette, and Inter sans-serif typography.

---

## Core Features

### 1. Multi-Role Live Switcher
Toggle between 5 distinct operating roles directly from the navigation bar:
- **Owner / General Manager (Vikramaditya Sen):** Real-time financial metrics, ADR, RevPAR, revenue realized, and full executive controls.
- **Front Desk & Reservations (Priyanka Rawat):** 6-stage Kanban pipeline, visual room calendar, check-ins/outs, and guest folios.
- **Spa & Wellness (Dr. Ananya Bhatt):** Ayurvedic therapies, Himalayan massage slots, sunrise yoga, and hydrotherapy bookings.
- **F&B Staff (Chef Raghavendra Joshi):** Nouveau Table, The Nook Cafe, and private balcony candlelight covers with dietary allergy warnings.
- **Marketing & Performance (Aryan / Astria & Co.):** Channel attribution, ROAS calculations, and CSV reporting.

### 2. Lead & Enquiry Pipeline
- 6-stage Kanban board (*New Enquiry -> Contacted -> Quote Sent -> Negotiating -> Confirmed/Won -> Lost/Closed*).
- 48-hour inactivity alerts to prevent lost bookings.
- 1-click conversion from sales enquiry to confirmed room reservation.

### 3. Visual 15-Room Inventory & Availability Calendar
- Multi-day interactive grid across 15 suites, residences, and villas.
- Double-booking collision detection preventing overlapping date ranges.
- Live room housekeeping status tracking (*Clean, Occupied, Dirty, Maintenance*).

### 4. Guest 360 Directory & Loyalty Dossier
- Profiles with stay history, lifetime spend, and repeat guest tracking.
- Indian residency compliance tracking (Aadhaar, Passport, and Form C).
- Dedicated dietary, medical, and allergy sensitivity records shared across kitchen and wellness teams.

### 5. Spa & Dining Outlets
- Therapist appointment scheduler for Ayurvedic and hydrotherapy sessions.
- Nouveau Table and The Nook table covers with dietary alerts and direct billing into folios.

### 6. Communication & WhatsApp Dispatcher
- Direct `wa.me` integration with dynamic message population.
- Pre-configured templates for stay quotes, driving directions, pre-arrival questionnaires, and review requests.
- Master timeline tracking touchpoints across WhatsApp, phone calls, and email.

### 7. Printable Quotations & Folios
- Print-ready A4 stylesheet (`@media print`) for proforma invoices and official quotations.
- Itemized room tariffs, 12% Hospitality GST, experience add-ons, and bank transfer details.

### 8. Marketing Attribution & CSV Exports
- Compares inquiries, win rates, ad spend, and revenue across Instagram, Google, Agoda, Hotels.com, and Referrals.
- 1-click CSV data exports for leads, bookings, and guests.

### 9. Production-Ready Supabase Schema
- Complete relational PostgreSQL schema located at `supabase/schema.sql` with custom enums, foreign keys, and Row Level Security (RLS) policies.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Inter Typography
- **Icons:** Lucide React
- **Persistence:** LocalStorage with state versioning (`v3`)
- **Backend Ready:** Supabase PostgreSQL Schema

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sunarstartsdeveloping/eden-crm.git

# Navigate into directory
cd eden-crm

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be available at `http://localhost:5173/`.

### Production Build

```bash
npm run build
```
