import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background p-4 max-w-2xl mx-auto" dir="rtl" lang="he">
      <header className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="חזור">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">מדיניות פרטיות</h1>
      </header>

      <div className="prose prose-sm space-y-6 text-foreground">
        <p className="text-muted-foreground text-sm">עדכון אחרון: אפריל 2026</p>

        <section>
          <h2 className="text-lg font-semibold mb-2">1. מי אנחנו</h2>
          <p>
            CleanMatch היא פלטפורמה לחיבור בין מנקים ולקוחות. אנו מחויבים להגן על הפרטיות שלך
            ולטפל במידע האישי שלך בשקיפות ובאחריות.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. המידע שאנו אוספים</h2>
          <ul className="list-disc list-inside space-y-1 pr-2">
            <li><strong>פרטי חשבון:</strong> כתובת אימייל וסיסמה מוצפנת.</li>
            <li><strong>פרופיל:</strong> שם תצוגה, תמונת פרופיל, תיאור אישי.</li>
            <li><strong>מיקום:</strong> מיקום גאוגרפי משוער (בעת שימוש באפליקציה) לצורך התאמת מנקים/לקוחות בקרבתך.</li>
            <li><strong>הודעות:</strong> תוכן הצ'אט בין משתמשים.</li>
            <li><strong>נתוני שימוש:</strong> כיצד אתה משתמש באפליקציה (ללא זיהוי אישי).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. כיצד אנו משתמשים במידע</h2>
          <ul className="list-disc list-inside space-y-1 pr-2">
            <li>להפעלת שירות ההתאמה בין מנקים ולקוחות.</li>
            <li>לאפשר תקשורת בין משתמשים.</li>
            <li>לשיפור חוויית המשתמש ותכונות האפליקציה.</li>
            <li>לשלוח התראות שירות חשובות.</li>
          </ul>
          <p className="mt-2">אנו <strong>לא</strong> מוכרים את המידע שלך לצדדים שלישיים.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. שיתוף מידע</h2>
          <p>
            המידע שלך ייחשף למשתמשים אחרים רק במידה הנדרשת לשירות (למשל, שם ותמונה בכרטיס הפרופיל).
            אנו משתמשים ב-Supabase לאחסון מידע מאובטח בסטנדרטים תעשייתיים.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. שמירת מידע</h2>
          <p>
            המידע שלך נשמר כל עוד חשבונך פעיל. בעת מחיקת החשבון, נמחק את כל הנתונים האישיים שלך
            תוך 30 יום.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. הזכויות שלך</h2>
          <ul className="list-disc list-inside space-y-1 pr-2">
            <li>לעיין במידע האישי שלך.</li>
            <li>לתקן מידע שגוי.</li>
            <li>למחוק את חשבונך ואת כל המידע הקשור אליו.</li>
            <li>לבטל הסכמה לשימוש במיקום בכל עת דרך הגדרות המכשיר.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. אבטחת מידע</h2>
          <p>
            אנו מיישמים צעדי אבטחה תעשייתיים כולל הצפנת HTTPS, אימות דו-שלבי (בקרוב) ובקרת גישה
            מבוססת תפקידים.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. ילדים</h2>
          <p>
            האפליקציה מיועדת למשתמשים מגיל 18 ומעלה. אנו לא אוספים ביודעין מידע מקטינים.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. יצירת קשר</h2>
          <p>
            לשאלות בנוגע לפרטיות:{" "}
            <a href="mailto:privacy@cleanmatch.app" className="text-primary underline">
              privacy@cleanmatch.app
            </a>
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
