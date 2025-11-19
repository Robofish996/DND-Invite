-- Create the roster table for D&D campaign characters
CREATE TABLE IF NOT EXISTS roster (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  locked_in TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_roster_user_id ON roster(user_id);

-- Disable Row Level Security (RLS) to allow public read/write
-- This is fine for a simple D&D invite, but you can enable RLS later for security
ALTER TABLE roster DISABLE ROW LEVEL SECURITY;

-- Optional: If RLS is enabled, create policies to allow all access
-- Uncomment these if you want to use RLS instead of disabling it:
-- CREATE POLICY "Allow public read access" ON roster FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON roster FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON roster FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON roster FOR DELETE USING (true);

