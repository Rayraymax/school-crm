-- leads.sql (clean, professional)

-- ✅ Users table (if not already existing)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- marketer, staff, manager
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Leads table (school_name removed)
CREATE TABLE IF NOT EXISTS school_leads (
    id SERIAL PRIMARY KEY,
    lead_type VARCHAR(50) NOT NULL DEFAULT 'School',        -- School / Firm / Individual
    location VARCHAR(255),
    contact_name VARCHAR(255),
    contact_role VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    visit_date DATE,
    interest_level VARCHAR(50),                              -- Interested, Needs Follow-up, Not Interested
    notes TEXT,
    next_action VARCHAR(100),
    follow_up_date DATE,
    image_path TEXT,
    services TEXT[],                                         -- Array of selected services
    submitted_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- Link to submitting user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- ✅ Pre-populate services
INSERT INTO services (name) VALUES
('Speed Governors'),
('Trackers'),
('Insurance'),
('Dashcams'),
('CCTV'),
('Fuel Management'),
('TrackMyKid')
ON CONFLICT (name) DO NOTHING;  -- Prevent duplicates

-- ✅ Indexes for faster filtering/search
CREATE INDEX IF NOT EXISTS idx_leads_interest_level ON school_leads(interest_level);
CREATE INDEX IF NOT EXISTS idx_leads_submitted_by ON school_leads(submitted_by_id);
CREATE INDEX IF NOT EXISTS idx_leads_lead_type ON school_leads(lead_type);