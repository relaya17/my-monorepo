/**
 * seed-cleaners.mjs
 * Creates 10 demo cleaner accounts with profiles and avatar photos.
 * Run: node scripts/seed-cleaners.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ifptzqhrvgctqacphgeu.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcHR6cWhydmdjdHFhY3BoZ2V1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUzODU2NCwiZXhwIjoyMDkyMTE0NTY0fQ.xFQLvGMGTNzDM8ub900hwBdDGcEzAcM5SG01crbhApM";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Real photos from randomuser.me API — reliable for demos
const cleaners = [
  {
    email: "maya.cohen@cleanmatch.demo",
    display_name: "מאיה כהן",
    bio: "מנקה מקצועית עם 8 שנות ניסיון. מתמחה בניקוי עמוק ואקולוגי.",
    city: "תל אביב",
    age: 32,
    experience_years: 8,
    hourly_rate: 80,
    services: ["ניקוי עמוק", "ניקוי אקולוגי", "ניקוי חלונות"],
    latitude: 32.0853,
    longitude: 34.7818,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    email: "sarah.levi@cleanmatch.demo",
    display_name: "שרה לוי",
    bio: "סדר ונקיון הם אמנות בשבילי. עובדת עם חומרים ידידותיים לסביבה.",
    city: "רמת גן",
    age: 27,
    experience_years: 4,
    hourly_rate: 70,
    services: ["ניקוי שוטף", "ניקוי אחרי שיפוץ", "ניקוי ירוק"],
    latitude: 32.0824,
    longitude: 34.8138,
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    email: "noa.mizrahi@cleanmatch.demo",
    display_name: "נועה מזרחי",
    bio: "אמא של 3 — יודעת מה זה בלאגן אמיתי ואיך לנצח אותו! 😄",
    city: "פתח תקווה",
    age: 35,
    experience_years: 6,
    hourly_rate: 75,
    services: ["ניקוי בית", "ניקוי עם ילדים", "ארגון ופינוי"],
    latitude: 32.0873,
    longitude: 34.8882,
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    email: "rachel.sharon@cleanmatch.demo",
    display_name: "רחל שרון",
    bio: "מנקה משרדים ובתים. אמינה, מדויקת ועם המלצות מעולות.",
    city: "חולון",
    age: 41,
    experience_years: 12,
    hourly_rate: 85,
    services: ["ניקוי משרד", "ניקוי עמוק", "שטיפת חלונות"],
    latitude: 32.0114,
    longitude: 34.7796,
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    email: "diana.azulay@cleanmatch.demo",
    display_name: "דיאנה אזולאי",
    bio: "מתמחה בניקוי לאחר אירועים ומסיבות. מהירה ויסודית.",
    city: "ראשון לציון",
    age: 29,
    experience_years: 5,
    hourly_rate: 90,
    services: ["ניקוי אחרי אירוע", "ניקוי עמוק", "ניקוי מטבח"],
    latitude: 31.9642,
    longitude: 34.8007,
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    email: "michal.ben.david@cleanmatch.demo",
    display_name: "מיכל בן דוד",
    bio: "ניקוי הוא הסוד לחיים מאושרים. אני כאן לעזור לך להגיע לשם!",
    city: "נתניה",
    age: 38,
    experience_years: 9,
    hourly_rate: 72,
    services: ["ניקוי שוטף", "ניקוי אביב", "ניקוי מרפסות"],
    latitude: 32.3215,
    longitude: 34.8532,
    avatar: "https://randomuser.me/api/portraits/women/77.jpg",
  },
  {
    email: "liora.dahan@cleanmatch.demo",
    display_name: "ליאורה דהן",
    bio: "מנקה דירות ווילות. ניסיון עם כלבים וחתולים בבית — אין בעיה!",
    city: "הרצליה",
    age: 31,
    experience_years: 7,
    hourly_rate: 95,
    services: ["ניקוי וילה", "ניקוי עם חיות מחמד", "עקירת שיער חיות"],
    latitude: 32.1663,
    longitude: 34.8467,
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
  },
  {
    email: "yael.peretz@cleanmatch.demo",
    display_name: "יעל פרץ",
    bio: "6 שנות ניסיון בניקוי דירות להשכרה ו-Airbnb. מהירה ואמינה.",
    city: "בת ים",
    age: 26,
    experience_years: 6,
    hourly_rate: 78,
    services: ["ניקוי Airbnb", "ניקוי דירה להשכרה", "ניקוי מהיר"],
    latitude: 32.0178,
    longitude: 34.7506,
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
  },
  {
    email: "hana.levy@cleanmatch.demo",
    display_name: "חנה לוי",
    bio: "עובדת לפי רשימות תיוג — בית שלך יהיה נקי מהרצפה עד התקרה.",
    city: "גבעתיים",
    age: 44,
    experience_years: 15,
    hourly_rate: 100,
    services: ["ניקוי עמוק", "ניקוי חג", "ניקוי אחרי שיפוץ"],
    latitude: 32.0694,
    longitude: 34.8126,
    avatar: "https://randomuser.me/api/portraits/women/62.jpg",
  },
  {
    email: "tali.cohen@cleanmatch.demo",
    display_name: "טלי כהן",
    bio: "מנקה ממליצה להשאיר מפתח — כי כשאחזור הכל יהיה מבריק ✨",
    city: "כפר סבא",
    age: 33,
    experience_years: 5,
    hourly_rate: 68,
    services: ["ניקוי שוטף", "ניקוי חלונות", "ניקוי מקרר ותנור"],
    latitude: 32.1797,
    longitude: 34.9078,
    avatar: "https://randomuser.me/api/portraits/women/48.jpg",
  },
];

async function seed() {
  console.log("🚀 מתחיל ליצור מנקות דמו...\n");

  for (const cleaner of cleaners) {
    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: cleaner.email,
        password: "Demo1234!",
        email_confirm: true,
        user_metadata: { display_name: cleaner.display_name, role: "cleaner" },
      });

    let userId;
    if (authError) {
      if (authError.message.includes("already been registered")) {
        // fetch existing user id
        const { data: list } = await supabase.auth.admin.listUsers({ perPage: 200 });
        const existing = list?.users?.find((u) => u.email === cleaner.email);
        if (!existing) { console.error(`✗  ${cleaner.display_name}: לא נמצא`); continue; }
        userId = existing.id;
      } else {
        console.error(`✗  ${cleaner.display_name}:`, authError.message);
        continue;
      }
    } else {
      userId = authData.user.id;
    }

    // Insert profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id: userId,
      role: "cleaner",
      display_name: cleaner.display_name,
      bio: cleaner.bio,
      city: cleaner.city,
      age: cleaner.age,
      experience_years: cleaner.experience_years,
      hourly_rate: cleaner.hourly_rate,
      services: cleaner.services,
      latitude: cleaner.latitude,
      longitude: cleaner.longitude,
      avatar_url: cleaner.avatar,
    });

    if (profileError) {
      console.error(`✗  פרופיל ${cleaner.display_name}:`, profileError.message);
    } else {
      console.log(`✓  ${cleaner.display_name} — ${cleaner.city} | ₪${cleaner.hourly_rate}/ש`);
    }
  }

  console.log("\n✅ סיום! 10 מנקות דמו נוצרו.");
  console.log("📧 כולן עם סיסמה: Demo1234!");
}

seed().catch(console.error);
