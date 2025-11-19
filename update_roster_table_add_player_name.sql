-- Add player_name column to the roster table
-- Run this in your Supabase SQL editor

ALTER TABLE roster 
ADD COLUMN IF NOT EXISTS player_name TEXT;

-- Update existing rows (optional - sets empty string if null)
UPDATE roster 
SET player_name = '' 
WHERE player_name IS NULL;

