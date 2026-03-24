-- Supabase Schema for निर्भय Navigator

-- 1. Profiles Table (Extended with Role)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'authority')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Reports Table (User Incidents)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- Harassment, Stalking, etc.
  description TEXT,
  location_name TEXT,
  pincode TEXT,
  location_coords JSONB, -- {lat, lng}
  media_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Area Risk Table (Authority Updates)
CREATE TABLE IF NOT EXISTS area_risk (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  authority_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  pincode TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  last_crime_type TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_risk ENABLE ROW LEVEL SECURITY;

-- 6. Create Policies
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Emergency Contacts
CREATE POLICY "Users can view their own contacts" ON emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contacts" ON emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contacts" ON emergency_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contacts" ON emergency_contacts FOR DELETE USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'authority');
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorities can update report status" ON reports FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'authority');

-- Area Risk
CREATE POLICY "Area risk is viewable by everyone" ON area_risk FOR SELECT USING (true);
CREATE POLICY "Authorities can manage area risk" ON area_risk FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'authority');
