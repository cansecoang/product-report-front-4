-- Complete Database Setup for Product Report MVP
-- Execute these commands in your PostgreSQL database

-- 1. Drop existing constraints and tables if needed (be careful in production)
-- This is for development/testing purposes only

-- 2. Create base tables

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
    country_id SERIAL PRIMARY KEY,
    country_name VARCHAR(255) NOT NULL UNIQUE,
    country_code VARCHAR(3) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR(255) NOT NULL,
    organization_description TEXT,
    country_id INTEGER REFERENCES countries(country_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_last_name VARCHAR(100),
    user_email VARCHAR(255) UNIQUE,
    organization_id INTEGER REFERENCES organizations(organization_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workpackages table (already exists but ensuring consistency)
CREATE TABLE IF NOT EXISTS workpackages (
    workpackage_id SERIAL PRIMARY KEY,
    workpackage_name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table (extended with new fields)
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_objective TEXT,
    deliverable TEXT,
    delivery_date DATE,
    product_output VARCHAR(255),
    methodology_description TEXT,
    gender_specific_actions TEXT,
    next_steps TEXT,
    workpackage_id INTEGER REFERENCES workpackages(workpackage_id) ON DELETE CASCADE,
    product_owner_id INTEGER REFERENCES organizations(organization_id),
    country_id INTEGER REFERENCES countries(country_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indicators table
CREATE TABLE IF NOT EXISTS indicators (
    indicator_id SERIAL PRIMARY KEY,
    indicator_code VARCHAR(50),
    output_number VARCHAR(50),
    indicator_name VARCHAR(255) NOT NULL,
    indicator_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product-Responsibles relationship table
CREATE TABLE IF NOT EXISTS product_responsibles (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    role_label VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id)
);

-- Product-Indicators relationship table
CREATE TABLE IF NOT EXISTS product_indicators (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    indicator_id INTEGER REFERENCES indicators(indicator_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, indicator_id)
);

-- Product-Organizations relationship table
CREATE TABLE IF NOT EXISTS product_organizations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
    relation_type VARCHAR(100),
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, organization_id)
);

-- Product-Distributor Organizations table
CREATE TABLE IF NOT EXISTS product_distributor_orgs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, organization_id)
);

-- Product-Distributor Users table
CREATE TABLE IF NOT EXISTS product_distributor_users (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id)
);

-- Product-Distributor Others table
CREATE TABLE IF NOT EXISTS product_distributor_others (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insert sample data

-- Insert countries
INSERT INTO countries (country_name, country_code) VALUES 
('Colombia', 'COL'),
('Ecuador', 'ECU'),
('Perú', 'PER'),
('Bolivia', 'BOL'),
('Brazil', 'BRA')
ON CONFLICT (country_name) DO NOTHING;

-- Insert organizations
INSERT INTO organizations (organization_name, organization_description, country_id) VALUES 
('OroVerde Foundation', 'Environmental conservation foundation', 1),
('BioFincas Colombia', 'Organic farming organization in Colombia', 1),
('EcoSolutions', 'Environmental consulting company', 2),
('Green Impact', 'Sustainable development organization', 3),
('Conservation International', 'Global conservation organization', 1)
ON CONFLICT DO NOTHING;

-- Insert users
INSERT INTO users (user_name, user_last_name, user_email, organization_id) VALUES 
('Maria', 'Rodriguez', 'maria.rodriguez@oroverde.org', 1),
('Carlos', 'Gonzalez', 'carlos.gonzalez@biofincas.com', 2),
('Ana', 'Silva', 'ana.silva@ecosolutions.com', 3),
('Luis', 'Torres', 'luis.torres@greenimpact.org', 4),
('Sofia', 'Mendez', 'sofia.mendez@conservation.org', 5)
ON CONFLICT (user_email) DO NOTHING;

-- Insert indicators
INSERT INTO indicators (indicator_code, output_number, indicator_name, indicator_description) VALUES 
('IND-001', 'OUT-1.1', 'Forest Coverage Increase', 'Percentage increase in forest coverage in target areas'),
('IND-002', 'OUT-1.2', 'Biodiversity Index', 'Measurement of species diversity in conservation areas'),
('IND-003', 'OUT-2.1', 'Organic Certification', 'Number of farms achieving organic certification'),
('IND-004', 'OUT-2.2', 'Soil Quality Improvement', 'Improvement in soil health indicators'),
('IND-005', 'OUT-3.1', 'Community Engagement', 'Level of community participation in projects')
ON CONFLICT DO NOTHING;

-- Update existing workpackages with sample data
INSERT INTO workpackages (workpackage_name, description) VALUES 
('WP-001: Conservation', 'Forest and biodiversity conservation activities'),
('WP-002: Sustainable Agriculture', 'Organic farming and sustainable agriculture promotion'),
('WP-003: Community Development', 'Local community capacity building and engagement'),
('WP-004: Research', 'Environmental research and monitoring activities')
ON CONFLICT DO NOTHING;

-- Update existing products table with new columns (if the table already exists)
-- Note: This assumes the products table exists and we're adding new columns
DO $$ 
BEGIN
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='product_objective') THEN
        ALTER TABLE products ADD COLUMN product_objective TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='deliverable') THEN
        ALTER TABLE products ADD COLUMN deliverable TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='delivery_date') THEN
        ALTER TABLE products ADD COLUMN delivery_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='product_output') THEN
        ALTER TABLE products ADD COLUMN product_output VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='methodology_description') THEN
        ALTER TABLE products ADD COLUMN methodology_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='gender_specific_actions') THEN
        ALTER TABLE products ADD COLUMN gender_specific_actions TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='next_steps') THEN
        ALTER TABLE products ADD COLUMN next_steps TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='product_owner_id') THEN
        ALTER TABLE products ADD COLUMN product_owner_id INTEGER REFERENCES organizations(organization_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='country_id') THEN
        ALTER TABLE products ADD COLUMN country_id INTEGER REFERENCES countries(country_id);
    END IF;
END $$;

-- Insert/Update sample products
INSERT INTO products (product_name, product_objective, deliverable, delivery_date, product_output, workpackage_id, product_owner_id, country_id) VALUES 
('Forest Restoration Program', 'Restore 1000 hectares of degraded forest', 'Restoration plan and implementation', '2025-12-31', 'OUT-1.1', 1, 1, 1),
('Organic Farm Certification', 'Certify 50 farms as organic', 'Certified organic farms', '2025-06-30', 'OUT-2.1', 2, 2, 1),
('Biodiversity Monitoring System', 'Implement monitoring system for key species', 'Monitoring protocol and database', '2025-09-15', 'OUT-1.2', 4, 3, 2),
('Community Education Program', 'Train 200 community members in sustainable practices', 'Training materials and workshops', '2025-08-31', 'OUT-3.1', 3, 4, 3),
('Soil Health Assessment', 'Assess soil quality in 100 farms', 'Soil health reports', '2025-07-15', 'OUT-2.2', 2, 5, 1)
ON CONFLICT DO NOTHING;

-- 4. Verification queries
SELECT 'Tables created successfully!' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('countries', 'organizations', 'users', 'workpackages', 'products', 'indicators', 
                   'product_responsibles', 'product_indicators', 'product_organizations',
                   'product_distributor_orgs', 'product_distributor_users', 'product_distributor_others')
ORDER BY table_name;
