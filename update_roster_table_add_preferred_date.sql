-- Add preferred_date column to the roster table
-- Run this in your Supabase SQL editor

ALTER TABLE roster 
ADD COLUMN IF NOT EXISTS preferred_date TEXT DEFAULT '2025-11-29';

-- Update existing rows to use default date if null
UPDATE roster 
SET preferred_date = '2025-11-29' 
WHERE preferred_date IS NULL;

