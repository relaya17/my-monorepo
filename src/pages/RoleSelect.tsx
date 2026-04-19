import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, MapPin, Zap, Shield } from "lucide-react";
import LandingLayout from "@/components/LandingLayout";

const RoleSelect = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/app");
  }, [user, loading, navigate]);

  return (
    <LandingLayout>
    <div className="min-h-screen relative overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source
          src="https://res.cloudinary.com/dora8sxcb/video/upload/v1776615758/clranMatch.mp4_yavy3r.mp4"
          type="video/mp4"
        />
      </video>
      {/* Gradient overlay for readability */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"
        aria-hidden="true"
      />
      {/* Content layer */}
      <div className="relative z-10 min-h-screen text-white flex flex-col">
      {/* Hero */}
      <header className="container mx-auto px-3 pt-4 pb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium mb-4 shadow">
          <Zap className="w-3 h-3" />
          הסטארטאפ שמחבר בין Service Specialists ללקוחות
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-2">
          <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            CleanMatch
          </span>
        </h1>

        <p className="text-lg sm:text-2xl font-bold text-white drop-shadow mb-2">
          מנקה בקליק ✨
        </p>

        <p className="text-sm sm:text-base text-white max-w-md mx-auto drop-shadow">
          מצא מנקה מקצועי בשניות — בדיוק כמו שוואפ, רק לבית נקי 🏠
        </p>
      </header>

      {/* Role Cards */}
      <main className="container mx-auto px-3 pb-4 flex-1">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
          <Card className="p-4 sm:p-8 border-2 border-white/30 hover:border-primary bg-black/50 backdrop-blur-[12px] text-white flex flex-col items-center text-center shadow-xl">
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/30 flex items-center justify-center mb-3">
              <img src="/icons/cleaners-icon.svg" alt="Service Specialists" className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-base sm:text-2xl font-bold mb-1 sm:mb-2 text-white drop-shadow">אני מחפש Service Specialist</h2>
            <p className="text-white/90 mb-3 text-xs sm:text-base hidden sm:block">גלה Service Specialists מקצועיים בקרבתך והחלק כדי להתאים</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/app?guest=true")}
                className="w-full rounded-md px-3 py-2 bg-gradient-to-r from-primary to-primary-glow text-white text-xs sm:text-sm font-medium text-center hover:opacity-90 transition-opacity"
                aria-label="גלוש כאורח ללא הרשמה"
              >
                גלישה חופשית
              </button>
              <button
                onClick={() => navigate("/auth?role=client")}
                className="w-full rounded-md px-3 py-2 border border-white/50 text-white text-xs sm:text-sm font-medium text-center transition-colors bg-white/10 backdrop-blur-[8px] hover:bg-white/20"
                aria-label="התחבר או הירשם כלקוח"
              >
                התחבר / הירשם
              </button>
            </div>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            onClick={() => navigate("/auth?role=cleaner")}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/auth?role=cleaner")}
            aria-label="אני מחפש עבודה — הצטרף כ-Service Specialist"
            className="p-4 sm:p-8 cursor-pointer hover:scale-[1.03] transition-all duration-300 border-2 border-white/30 hover:border-secondary group bg-black/50 backdrop-blur-[12px] text-white flex flex-col items-center text-center shadow-xl"
          >
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-secondary/30 flex items-center justify-center mb-3 group-hover:bg-secondary/40 transition-colors">
              <img src="/icons/cleaners-icon.svg" alt="מנקה" className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-base sm:text-2xl font-bold mb-1 sm:mb-2 text-white drop-shadow">אני מנקה 🧹</h2>
            <p className="text-white/90 mb-3 text-xs sm:text-base hidden sm:block">הצג את עצמך, קבל לקוחות ותתחיל לעבוד</p>
            <div className="w-full rounded-md px-3 py-2 border border-white/50 text-white text-xs sm:text-sm font-medium text-center">
              הצטרף בקליל ✨
            </div>
          </Card>
        </div>
      </main>

      {/* Features — hidden on very small screens */}
      <section aria-label="תכונות" className="container mx-auto px-3 pb-6 hidden sm:block">
        <div className="grid grid-cols-3 gap-3 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-bold mb-1 text-sm">מבוסס מיקום</h3>
            <p className="text-xs text-white/70">מצא התאמות בקרבתך</p>
          </div>
          <div className="text-center">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-bold mb-1 text-sm">החלקה מהירה</h3>
            <p className="text-xs text-white/70">ימינה ללייק, שמאלה לדלג</p>
          </div>
          <div className="text-center">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="font-bold mb-1 text-sm">מאובטח ומאומת</h3>
            <p className="text-xs text-white/70">פרופילים מאומתים</p>
          </div>
        </div>
      </section>
      </div>{/* /content layer */}
    </div>
    </LandingLayout>
  );
};

export default RoleSelect;
