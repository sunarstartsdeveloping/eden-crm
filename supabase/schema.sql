-- ==============================================================================
-- EDEN WELLNESS & HOSPITALITY (SALAN GAON, DEHRADUN/MUSSOORIE)
-- CRM Database Schema for PostgreSQL / Supabase
-- ==============================================================================

-- 1. Custom Types & Enums
CREATE TYPE user_role AS ENUM ('owner', 'frontdesk', 'spa', 'fnb', 'marketing');
CREATE TYPE lead_source AS ENUM ('instagram', 'whatsapp', 'website', 'google', 'agoda', 'hotels_com', 'walkin', 'referral');
CREATE TYPE lead_stage AS ENUM ('new', 'contacted', 'quote_sent', 'negotiating', 'confirmed', 'lost');
CREATE TYPE room_category AS ENUM ('Valley Suite', 'Serviced Apartment', 'Wellness Cottage', 'Penthouse Villa');
CREATE TYPE room_status AS ENUM ('clean', 'occupied', 'dirty', 'maintenance');
CREATE TYPE booking_status AS ENUM ('tentative', 'confirmed', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'advance_paid', 'paid', 'refunded');
CREATE TYPE service_category AS ENUM ('spa', 'wellness', 'fnb', 'salon');
CREATE TYPE interaction_channel AS ENUM ('whatsapp', 'call', 'instagram', 'email', 'in_person');

-- 2. Staff Profiles (Linked to Supabase Auth)
CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'frontdesk',
    title VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Guests Table (Single source of guest identity & 360 profile)
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    id_proof_type VARCHAR(100), -- Aadhaar, Passport, OCI
    id_proof_number VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    total_stays INT DEFAULT 0,
    total_spend NUMERIC(12, 2) DEFAULT 0.00,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    dietary_preferences TEXT,
    room_preferences TEXT,
    allergies TEXT,
    special_notes TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Rooms Inventory (15 boutique suites & serviced apartments)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category room_category NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    capacity INT NOT NULL DEFAULT 2,
    base_rate NUMERIC(10, 2) NOT NULL,
    status room_status NOT NULL DEFAULT 'clean',
    features TEXT[] DEFAULT '{}',
    description TEXT,
    sqft INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Leads & Enquiries Pipeline
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    source lead_source NOT NULL DEFAULT 'instagram',
    stage lead_stage NOT NULL DEFAULT 'new',
    assigned_to UUID REFERENCES staff_profiles(id),
    preferred_check_in DATE NOT NULL,
    preferred_check_out DATE NOT NULL,
    num_guests INT NOT NULL DEFAULT 2,
    room_type_interested VARCHAR(255),
    budget NUMERIC(10, 2),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    last_contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Bookings (With constraint to prevent double-booking collisions)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_guests INT NOT NULL DEFAULT 2,
    status booking_status NOT NULL DEFAULT 'confirmed',
    rate_per_night NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    advance_amount NUMERIC(12, 2) DEFAULT 0.00,
    source lead_source NOT NULL DEFAULT 'direct',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- 7. Add-On Services Catalogue
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category service_category NOT NULL,
    duration_minutes INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Service Bookings (Spa, Yoga, Dining Reservations)
CREATE TABLE service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    service_id UUID NOT NULL REFERENCES services(id),
    service_name VARCHAR(255) NOT NULL,
    category service_category NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    staff_assigned VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled',
    price NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Interactions & Touchpoint Log
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL, -- 'lead' or 'guest'
    entity_id UUID NOT NULL,
    channel interaction_channel NOT NULL,
    summary VARCHAR(255) NOT NULL,
    notes TEXT,
    staff_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Operational Tasks & Reminders
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    related_type VARCHAR(50) NOT NULL,
    related_id UUID,
    related_name VARCHAR(255),
    due_date DATE NOT NULL,
    assigned_to VARCHAR(255) NOT NULL,
    priority VARCHAR(20) DEFAULT 'high',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Row Level Security (RLS) Configuration
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated staff full access
CREATE POLICY "Authenticated staff can view all guests" ON guests FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated staff can view all rooms" ON rooms FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated staff can view all bookings" ON bookings FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated staff can view all leads" ON leads FOR ALL TO authenticated USING (true);
