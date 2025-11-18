# Supabase Setup Instructions

To enable shared character roster across all players, you need to set up Supabase (a free, open-source Firebase alternative).

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Sign up or log in (free tier available)
3. Click "New Project"
4. Fill in:
   - **Organization:** Create one if you don't have one
   - **Name:** `dnd-invite` (or any name you like)
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to your players
   - Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 2: Create the Roster Table

1. In your Supabase project, go to **Table Editor** in the left sidebar
2. Click **Create a new table**
3. Name it: `roster`
4. **Enable Row Level Security (RLS):** Turn this OFF for simplicity (we want anyone to read/write)
5. Click **Save**
6. Now add these columns (click "+ Insert Column" for each):

   **Column 1:**
   - Name: `id`
   - Type: `int8`
   - Default value: `uuid_generate_v4()`
   - Is Primary Key: ✓
   - Is Identity: ✓

   **Column 2:**
   - Name: `user_id`
   - Type: `text`
   - Is Nullable: ✗

   **Column 3:**
   - Name: `name`
   - Type: `text`
   - Is Nullable: ✗

   **Column 4:**
   - Name: `class`
   - Type: `text`
   - Is Nullable: ✗

   **Column 5:**
   - Name: `locked_in`
   - Type: `timestamptz`
   - Default value: `now()`

7. Click **Save** to create the table

## Step 3: Get Your Supabase Credentials

1. Go to **Settings** (gear icon) in the left sidebar
2. Click **API** under "Project Settings"
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

## Step 4: Disable Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. Or go to **Table Editor** → click on `roster` table
3. Click the padlock icon next to the table name
4. Make sure RLS is **disabled** (or create policies that allow all reads/writes)

**Alternative:** In SQL Editor, run:
```sql
ALTER TABLE roster DISABLE ROW LEVEL SECURITY;
```

## Step 5: Update main.js

Open `main.js` and replace the placeholder values (around line 4-5):

```javascript
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";
```

Replace with your actual values from Step 3.

## Step 6: Deploy

After updating `main.js` with your Supabase credentials:

```bash
git add main.js
git commit -m "Add Supabase configuration"
git push
```

The site will automatically redeploy, and now all players will see the same roster in real-time!

## Troubleshooting

- **Characters not showing up?** Check the browser console (F12) for errors
- **"Failed to save character"?** Make sure RLS is disabled or you have proper policies
- **Still using localStorage?** Check the console - it will say "Supabase not configured" if credentials aren't set
- **Table not found?** Make sure you created the table exactly as `roster` with the correct column names

## Real-time Updates

Supabase will automatically sync changes across all players' browsers in real-time - no refresh needed!

## Free Tier Limits

Supabase free tier includes:
- 500MB database space
- 2GB bandwidth
- Real-time subscriptions
- Perfect for a D&D campaign roster!

