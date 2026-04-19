import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background p-4 max-w-2xl mx-auto" dir="rtl" lang="he">
      <header className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="חזור">
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">תנאי שימוש</h1>
      </header>

      <div className="prose prose-sm space-y-6 text-foreground">
        <p className="text-muted-foreground text-sm">עדכון אחרון: אפריל 2026</p>

        <section>
          <h2 className="text-lg font-semibold mb-2">1. קבלת התנאים</h2>
          <p>
            על ידי הורדה, התקנה או שימוש באפליקציית CleanMatch, אתה מסכים לתנאי שימוש אלה.
            אם אינך מסכים, אנא הפסק את השימוש באפליקציה.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. תיאור השירות</h2>
          <p>
            CleanMatch היא פלטפורמה המחברת בין מנקים ביתיים ללקוחות. אנו מספקים את הפלטפורמה בלבד
            ולא אחראים על איכות, בטיחות, או חוקיות השירותים הניתנים על ידי מנקים.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. כשירות להשתמש בשירות</h2>
          <ul className="list-disc list-inside space-y-1 pr-2">
            <li>עליך להיות בן 18 שנים לפחות.</li>
            <li>עליך לספק מידע נכון ומדויק בהרשמה.</li>
            <li>אינך רשאי לפתוח יותר מחשבון אחד.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. כללי התנהגות</h2>
          <p>המשתמשים מתחייבים:</p>
          <ul className="list-disc list-inside space-y-1 pr-2">
            <li>לא לפרסם תוכן פוגעני, מטעה או בלתי חוקי.</li>
            <li>לא להטריד משתמשים אחרים.</li>
            <li>לא לנסות לעקוף את מנגנוני האבטחה.</li>
            <li>לשמור על פרטיות משתמשים אחרים.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. עסקאות ותשלומים</h2>
          <p>
            כל תיאום כספי בין לקוחות למנקים הוא ישיר ובאחריותם הבלעדית. CleanMatch אינה צד
            לעסקה ואינה גובה עמלות כרגע.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. קניין רוחני</h2>
          <p>
            כל התוכן והקוד של CleanMatch הוא רכוש החברה. אינך רשאי להעתיק, לשנות
            או להפיץ את האפליקציה ללא אישור בכתב.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. הגבלת אחריות</h2>
          <p>
            CleanMatch אינה אחראית לנזקים ישירים, עקיפים, או תוצאתיים הנובעים משימוש בשירות,
            כולל נזקים מפגישות עם מנקים/לקוחות שנמצאו דרך הפלטפורמה.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. סיום חשבון</h2>
          <p>
            אנו שומרים לעצמנו את הזכות להשעות או למחוק חשבונות שמפרים תנאי שימוש אלה,
            ללא הודעה מוקדמת.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">9. שינויים בתנאים</h2>
          <p>
            אנו עשויים לעדכן תנאים אלה מעת לעת. שימוש מתמשך באפליקציה לאחר פרסום שינויים
            מהווה הסכמה לתנאים המעודכנים.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">10. דין וסמכות שיפוט</h2>
          <p>
            תנאים אלה כפופים לדין הישראלי. כל סכסוך יידון בבתי המשפט המוסמכים בישראל.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">11. יצירת קשר</h2>
          <p>
            לשאלות:{" "}
            <a href="mailto:support@cleanmatch.app" className="text-primary underline">
              support@cleanmatch.app
            </a>
          </p>
        </section>
      </div>
    </main>
  );
};

export default TermsOfService;
