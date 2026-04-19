import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Briefcase, Heart, MapPin, Zap, Shield, Star } from "lucide-react";

const RoleSelect = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate("/app");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Hero */}
      <div className="container mx-auto px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          הסטארטאפ שמחבר בין מנקים ללקוחות
        </div>

        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[var(--shadow-glow)]">
          <Sparkles className="w-12 h-12 text-primary-foreground" />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            CleanMatch
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-2">
          כמו טינדר, רק לניקיון 💫
        </p>
        <p className="text-base text-muted-foreground max-w-lg mx-auto">
          החלק ימינה כדי למצוא את ההתאמה המושלמת שלך - מנקה מקצועי או עבודה חלומית
        </p>
      </div>

      {/* Role Cards */}
      <div className="container mx-auto px-4 pb-10">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card
            onClick={() => navigate("/auth?role=client")}
            className="p-8 cursor-pointer hover:scale-[1.03] transition-all duration-300 hover:shadow-[var(--shadow-card)] border-2 hover:border-primary group bg-gradient-to-br from-card to-primary/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Heart className="w-8 h-8 text-primary fill-primary/20" />
            </div>
            <h2 className="text-2xl font-bold mb-2">אני מחפש מנקה</h2>
            <p className="text-muted-foreground mb-4">גלה מנקים מקצועיים בקרבתך והחלק כדי להתאים</p>
            <Button className="w-full bg-gradient-to-r from-primary to-primary-glow text-white">
              התחל עכשיו
            </Button>
          </Card>

          <Card
            onClick={() => navigate("/auth?role=cleaner")}
            className="p-8 cursor-pointer hover:scale-[1.03] transition-all duration-300 hover:shadow-[var(--shadow-card)] border-2 hover:border-secondary group bg-gradient-to-br from-card to-secondary/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
              <Briefcase className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">אני מחפש עבודה</h2>
            <p className="text-muted-foreground mb-4">הצג את הכישורים שלך וקבל עבודות בקרבתך</p>
            <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
              הצטרף כמנקה
            </Button>
          </Card>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold mb-1">מבוסס מיקום</h3>
            <p className="text-sm text-muted-foreground">מצא התאמות בקרבתך עם מפה אינטראקטיבית</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-bold mb-1">החלקה מהירה</h3>
            <p className="text-sm text-muted-foreground">החלק ימינה ללייק, שמאלה לדלג</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold mb-1">מאובטח ומאומת</h3>
            <p className="text-sm text-muted-foreground">פרופילים מאומתים ומידע מוגן</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
