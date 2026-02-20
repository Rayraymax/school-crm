CREATE TABLE school_leads (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    school_type VARCHAR(100),
    location VARCHAR(255),
    contact_name VARCHAR(255),
    contact_role VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    visit_date DATE,
    interest_level VARCHAR(50),
    notes TEXT,
    next_action VARCHAR(100),
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
