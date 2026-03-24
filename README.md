# निर्भय Navigator - Full-Stack AI Women's Safety App

निर्भय Navigator is a futuristic, AI-powered safety application designed to empower women through real-time protection, smart safe routing, and instant emergency alerts.

## 🚀 Features

- **Smart Safe Route System:** Uses Google Maps API to calculate routes based on safety scores (crime data, lighting, crowd density).
- **Instant SOS:** One-tap emergency alert system that sends SMS and makes calls via Twilio.
- **Live Tracking:** Real-time location sharing with emergency contacts.
- **Futuristic UI:** Dark mode, neon aesthetics, and smooth animations using Framer Motion.

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express.
- **Database:** Supabase (PostgreSQL).
- **APIs:** Google Maps (Directions, Places), Twilio (SMS/Voice).

## 📦 Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the SQL Editor and run the contents of `supabase_schema.sql` to create the necessary tables and RLS policies.
3. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 2. API Keys
1. **Google Maps:** Get an API key from [Google Cloud Console](https://console.cloud.google.com/). Enable Directions API and Maps JavaScript API.
2. **Twilio:** Get your `ACCOUNT_SID`, `AUTH_TOKEN`, and a `TWILIO_PHONE_NUMBER` from [Twilio Console](https://www.twilio.com/console).

### 3. Environment Variables
Create a `.env` file (or use the AI Studio Secrets panel) with the following:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### 4. Installation & Running
```bash
# Install dependencies
npm install

# Run locally (Frontend + Backend)
npm run dev
```

## 📂 Folder Structure
- `/src/App.tsx`: Main frontend UI and logic.
- `/server.ts`: Express backend handling Twilio and Route Analysis.
- `/supabase_schema.sql`: Database schema.
- `/src/lib/supabase.ts`: Supabase client configuration.
