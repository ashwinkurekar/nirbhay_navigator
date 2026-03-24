import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// --- API ROUTES ---

// Trigger SOS Alert
app.post("/api/trigger-alert", async (req, res) => {
  const { location, userId, message, contacts: providedContacts } = req.body;
  
  console.log(`SOS Triggered for user ${userId} at ${JSON.stringify(location)}`);

  try {
    // 1. Use provided contacts or mock contacts if Supabase is removed
    const contacts = providedContacts || [
      { name: "Emergency Contact 1", phone: "+1234567890", priority: 1 },
      { name: "Emergency Contact 2", phone: "+0987654321", priority: 2 }
    ];

    const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const alertMessage = `EMERGENCY ALERT from निर्भय Navigator: ${message || 'I need help!'} My location: ${mapsUrl}`;

    // Helper to format phone numbers to E.164
    const formatPhoneNumber = (phone: string) => {
      let cleaned = phone.replace(/\D/g, ''); // Remove all non-digits
      
      // If it starts with 0, remove it
      if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
      
      // If it's a 10-digit number, assume India (+91)
      if (cleaned.length === 10) return `+91${cleaned}`;
      
      // If it's already 12 digits and starts with 91, add +
      if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
      
      // Otherwise, just ensure it has a +
      return phone.startsWith('+') ? phone : `+${phone}`;
    };

    // 2. Send SMS to ALL contacts via Twilio
    if (twilioClient) {
      const smsResults = await Promise.allSettled(
        (contacts || []).map((contact: any) => {
          const formattedTo = formatPhoneNumber(contact.phone);
          return twilioClient.messages.create({
            body: alertMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedTo
          });
        })
      );

      // Log failures but don't crash the whole SOS process
      smsResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          const reason = result.reason?.message || 'Unknown error';
          console.error(`Failed to send SMS to ${contacts[index]?.name} (${contacts[index]?.phone}):`, reason);
          
          // Check for common trial account error
          if (reason.includes('unverified')) {
            console.warn("TRIAL ACCOUNT LIMITATION: Twilio trial accounts can only send SMS to verified numbers.");
          }
        } else {
          console.log(`SMS successfully sent to ${contacts[index]?.name}`);
        }
      });

      // 3. Initiate Voice Call to Top Priority Contact
      if (contacts && contacts.length > 0) {
        const topContact = contacts[0];
        const formattedTo = formatPhoneNumber(topContact.phone);
        try {
          await twilioClient.calls.create({
            twiml: `<Response><Say>Emergency Alert from निर्भय Navigator. Your contact is in danger and needs help. Their location has been sent to you via SMS.</Say></Response>`,
            to: formattedTo,
            from: process.env.TWILIO_PHONE_NUMBER,
          });
          console.log(`Voice call initiated to ${topContact.name}`);
        } catch (callErr: any) {
          const reason = callErr.message || 'Unknown error';
          console.error(`Failed to call ${topContact.name}:`, reason);
          if (reason.includes('unverified')) {
            console.warn("TRIAL ACCOUNT LIMITATION: Twilio trial accounts can only make calls to verified numbers.");
          }
        }
      }
    }

    res.json({ success: true, message: "Alerts and calls initiated successfully" });
  } catch (err: any) {
    console.error("SOS Alert Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Safe Route Analysis (Mock Logic)
app.post("/api/safe-route", async (req, res) => {
  const { routes } = req.body; 
  
  const analyzedRoutes = routes.map((route: any, index: number) => {
    const safetyScore = Math.floor(Math.random() * 40) + 60; 
    return {
      ...route,
      safetyScore,
      isSafest: index === 0 
    };
  });

  res.json({ routes: analyzedRoutes });
});

// Location Search Proxy with Fallback (PositionStack -> Nominatim)
app.get("/api/search-location", async (req, res) => {
  const { query } = req.query;
  
  if (!query || (query as string).trim().length < 2) {
    return res.json({ data: [] });
  }

  const apiKey = process.env.VITE_POSITIONSTACK_API_KEY || process.env.POSITIONSTACK_API_KEY;

  const tryNominatim = async (q: string) => {
    const isReverse = q.includes(',');
    let url = "";
    
    if (isReverse) {
      const [lat, lon] = q.split(',').map(s => s.trim());
      url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    } else {
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NirbhayaNavigator/1.0 (Safety App)'
      }
    });
    
    if (!response.ok) throw new Error(`Nominatim error: ${response.statusText}`);
    
    const data = await response.json();
    
    // Map Nominatim format to a consistent internal format
    if (isReverse) {
      return {
        data: [{
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lon),
          label: data.display_name,
          name: data.name || data.display_name.split(',')[0]
        }]
      };
    } else {
      return {
        data: data.map((item: any) => ({
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          label: item.display_name,
          name: item.name || item.display_name.split(',')[0]
        }))
      };
    }
  };

  // 1. Try PositionStack if API key is available
  if (apiKey) {
    try {
      const isReverse = (query as string).includes(',');
      const endpoint = isReverse ? 'reverse' : 'forward';
      const response = await fetch(`http://api.positionstack.com/v1/${endpoint}?access_key=${apiKey}&query=${encodeURIComponent(query as string)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          return res.json(data);
        }
      }
      
      // If PositionStack returns an error or no results, log it and fall back
      console.warn("PositionStack failed or returned no results, falling back to Nominatim...");
    } catch (err) {
      console.warn("PositionStack error, falling back to Nominatim:", err);
    }
  }

  // 2. Fallback to Nominatim (or use it directly if no API key)
  try {
    const data = await tryNominatim(query as string);
    res.json(data);
  } catch (err: any) {
    console.error("Location Search Proxy Error (All providers failed):", err);
    res.status(500).json({ error: "Location search failed. Please try again later." });
  }
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`निर्भय Navigator Server running on http://localhost:${PORT}`);
  });
}

startServer();
