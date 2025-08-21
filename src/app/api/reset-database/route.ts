import { pool } from '@/lib/db';

export async function POST() {
  try {
    console.log('🗑️ Starting database reset...');
    
    // 1. Drop all tables safely (in correct order due to foreign keys)
    const dropTablesScript = `
      -- Drop tables in correct order (child tables first)
      DROP TABLE IF EXISTS product_distributor_others CASCADE;
      DROP TABLE IF EXISTS product_distributor_users CASCADE;
      DROP TABLE IF EXISTS product_distributor_orgs CASCADE;
      DROP TABLE IF EXISTS product_organizations CASCADE;
      DROP TABLE IF EXISTS product_indicators CASCADE;
      DROP TABLE IF EXISTS product_responsibles CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS indicators CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
      DROP TABLE IF EXISTS countries CASCADE;
      DROP TABLE IF EXISTS workpackages CASCADE;
    `;
    
    await pool.query(dropTablesScript);
    console.log('✅ All tables dropped successfully');
    
    // 2. Create all tables with the complete schema
    const createTablesScript = `
      -- Countries table
      CREATE TABLE countries (
          country_id SERIAL PRIMARY KEY,
          country_name VARCHAR(255) NOT NULL UNIQUE,
          country_code VARCHAR(3) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Organizations table
      CREATE TABLE organizations (
          organization_id SERIAL PRIMARY KEY,
          organization_name VARCHAR(255) NOT NULL,
          organization_description TEXT,
          country_id INTEGER REFERENCES countries(country_id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Users table
      CREATE TABLE users (
          user_id SERIAL PRIMARY KEY,
          user_name VARCHAR(100) NOT NULL,
          user_last_name VARCHAR(100),
          user_email VARCHAR(255) UNIQUE,
          organization_id INTEGER REFERENCES organizations(organization_id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Workpackages table
      CREATE TABLE workpackages (
          workpackage_id SERIAL PRIMARY KEY,
          workpackage_name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Products table
      CREATE TABLE products (
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
      CREATE TABLE indicators (
          indicator_id SERIAL PRIMARY KEY,
          indicator_code VARCHAR(50),
          output_number VARCHAR(50),
          indicator_name VARCHAR(255) NOT NULL,
          indicator_description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Product-Responsibles relationship table
      CREATE TABLE product_responsibles (
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
      CREATE TABLE product_indicators (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
          indicator_id INTEGER REFERENCES indicators(indicator_id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, indicator_id)
      );

      -- Product-Organizations relationship table
      CREATE TABLE product_organizations (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
          organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
          relation_type VARCHAR(100),
          position INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, organization_id)
      );

      -- Product-Distributor Organizations table
      CREATE TABLE product_distributor_orgs (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
          organization_id INTEGER REFERENCES organizations(organization_id) ON DELETE CASCADE,
          position INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, organization_id)
      );

      -- Product-Distributor Users table
      CREATE TABLE product_distributor_users (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
          position INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, user_id)
      );

      -- Product-Distributor Others table
      CREATE TABLE product_distributor_others (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
          display_name VARCHAR(255) NOT NULL,
          contact VARCHAR(255),
          position INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await pool.query(createTablesScript);
    console.log('✅ All tables created successfully');
    
    // 3. Insert sample data
    const insertDataScript = `
      -- Insert countries
      INSERT INTO countries (country_name, country_code) VALUES 
      ('Colombia', 'COL'),
      ('Ecuador', 'ECU'),
      ('Perú', 'PER'),
      ('Bolivia', 'BOL'),
      ('Brazil', 'BRA');

      -- Insert organizations
      INSERT INTO organizations (organization_name, organization_description, country_id) VALUES 
      ('OroVerde Foundation', 'Environmental conservation foundation', 1),
      ('BioFincas Colombia', 'Organic farming organization in Colombia', 1),
      ('EcoSolutions', 'Environmental consulting company', 2),
      ('Green Impact', 'Sustainable development organization', 3),
      ('Conservation International', 'Global conservation organization', 1);

      -- Insert users
      INSERT INTO users (user_name, user_last_name, user_email, organization_id) VALUES 
      ('Maria', 'Rodriguez', 'maria.rodriguez@oroverde.org', 1),
      ('Carlos', 'Gonzalez', 'carlos.gonzalez@biofincas.com', 2),
      ('Ana', 'Silva', 'ana.silva@ecosolutions.com', 3),
      ('Luis', 'Torres', 'luis.torres@greenimpact.org', 4),
      ('Sofia', 'Mendez', 'sofia.mendez@conservation.org', 5);

      -- Insert indicators
      INSERT INTO indicators (indicator_code, output_number, indicator_name, indicator_description) VALUES 
      ('IND-001', 'OUT-1.1', 'Forest Coverage Increase', 'Percentage increase in forest coverage in target areas'),
      ('IND-002', 'OUT-1.2', 'Biodiversity Index', 'Measurement of species diversity in conservation areas'),
      ('IND-003', 'OUT-2.1', 'Organic Certification', 'Number of farms achieving organic certification'),
      ('IND-004', 'OUT-2.2', 'Soil Quality Improvement', 'Improvement in soil health indicators'),
      ('IND-005', 'OUT-3.1', 'Community Engagement', 'Level of community participation in projects');

      -- Insert workpackages
      INSERT INTO workpackages (workpackage_name, description) VALUES 
      ('WP-001: Conservation', 'Forest and biodiversity conservation activities'),
      ('WP-002: Sustainable Agriculture', 'Organic farming and sustainable agriculture promotion'),
      ('WP-003: Community Development', 'Local community capacity building and engagement'),
      ('WP-004: Research', 'Environmental research and monitoring activities');

      -- Insert sample products
      INSERT INTO products (product_name, product_objective, deliverable, delivery_date, product_output, workpackage_id, product_owner_id, country_id) VALUES 
      ('Forest Restoration Program', 'Restore 1000 hectares of degraded forest', 'Restoration plan and implementation', '2025-12-31', 'OUT-1.1', 1, 1, 1),
      ('Organic Farm Certification', 'Certify 50 farms as organic', 'Certified organic farms', '2025-06-30', 'OUT-2.1', 2, 2, 1),
      ('Biodiversity Monitoring System', 'Implement monitoring system for key species', 'Monitoring protocol and database', '2025-09-15', 'OUT-1.2', 4, 3, 2),
      ('Community Education Program', 'Train 200 community members in sustainable practices', 'Training materials and workshops', '2025-08-31', 'OUT-3.1', 3, 4, 3),
      ('Soil Health Assessment', 'Assess soil quality in 100 farms', 'Soil health reports', '2025-07-15', 'OUT-2.2', 2, 5, 1),
      ('Carbon Footprint Analysis', 'Analyze carbon footprint of agricultural practices', 'Carbon assessment report', '2025-10-31', 'OUT-3.2', 4, 1, 1);
    `;
    
    await pool.query(insertDataScript);
    console.log('✅ Sample data inserted successfully');
    
    // 4. Verify the setup
    const verificationQuery = `
      SELECT 
        t.table_name,
        COUNT(c.column_name) as column_count
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
      GROUP BY t.table_name
      ORDER BY t.table_name;
    `;
    
    const verification = await pool.query(verificationQuery);
    
    return Response.json({
      status: 'success',
      message: 'Database reset and recreated successfully!',
      tables_created: verification.rows,
      summary: {
        countries: 5,
        organizations: 5,
        users: 5,
        workpackages: 4,
        products: 6,
        indicators: 5
      }
    });
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return Response.json({ 
      status: 'error',
      error: 'Failed to reset database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
