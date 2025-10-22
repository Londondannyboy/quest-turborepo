-- Companies table for placement agents and other company profiles
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  hero_image_url TEXT,

  -- Classification
  target_site VARCHAR(50) NOT NULL, -- placement, relocation, mba, etc.
  company_type VARCHAR(100), -- 'placement_agent', 'relocation_service', etc.
  specialty TEXT[], -- Array of specialties

  -- Key metrics
  founded_year INTEGER,
  headquarters VARCHAR(255),
  geographic_focus TEXT[], -- Array of regions
  fund_size_min VARCHAR(100), -- e.g., "$100M+"
  fund_size_max VARCHAR(100),
  fee_range VARCHAR(100), -- e.g., "1.5-3%"
  total_raised VARCHAR(100), -- e.g., "$500B+"

  -- Contact & Links
  website_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT[],

  -- Status
  status VARCHAR(50) DEFAULT 'published', -- published, draft, archived
  featured BOOLEAN DEFAULT FALSE,
  rank INTEGER, -- For ordering (1 = top)

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  UNIQUE(target_site, slug)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_companies_target_site ON companies(target_site);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_featured ON companies(featured);
CREATE INDEX IF NOT EXISTS idx_companies_rank ON companies(rank);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at_trigger
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_companies_updated_at();
