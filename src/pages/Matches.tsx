import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, MapPin, MessageCircle, Loader2 } from "lucide-react";

interface MatchedProfile {
  match_id: string;
  user_id: string;
  display_name: string;
  city: string | null;
  role: string;
  hourly_rate: number | null;
  avatar_url: string | null;
  matched_at: string;
}

const Matches = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rows } = await supabase
        .from("matches")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const otherIds = (rows || []).map((r) => (r.user_a === user.id ? r.user_b : r.user_a));
      if (otherIds.length === 0) {
        setMatches([]);
        return;
      }

      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, city, role, hourly_rate, avatar_url")
        .in("user_id", otherIds);

      const profMap = new Map(profs?.map((p) => [p.user_id, p]));
      const merged = (rows || []).map((r) => {
        const otherId = r.user_a === user.id ? r.user_b : r.user_a;
        const p = profMap.get(otherId);
        return p ? { ...p, match_id: r.id, matched_at: r.created_at } as MatchedProfile : null;
      }).filter(Boolean) as MatchedProfile[];

      setMatches(merged);
      setLoadingMatches(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <header className="flex items-center justify-between max-w-md mx-auto mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">ההתאמות שלי</h1>
        <div className="w-10" />
      </header>

      <div className="max-w-md mx-auto space-y-3">
        {loadingMatches ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : matches.length === 0 ? (
          <Card className="p-10 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-bold mb-1">אין התאמות עדיין</h3>
            <p className="text-sm text-muted-foreground">המשך להחליק כדי למצוא התאמות</p>
          </Card>
        ) : (
          matches.map((m) => {
            return (
              <Card
                key={m.match_id}
                className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/chat/${m.match_id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/chat/${m.match_id}`)}
                aria-label={`פתח שיחה עם ${m.display_name}`}
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={m.avatar_url || "/cleaner-placeholder.svg"}
                    alt={m.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{m.display_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {m.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {m.city}
                      </span>
                    )}
                    {m.hourly_rate && <span>• ₪{m.hourly_rate}/שעה</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary shrink-0"
                  aria-label={`שלח הודעה ל${m.display_name}`}
                  title="שלח הודעה"
                  onClick={(e) => { e.stopPropagation(); navigate(`/chat/${m.match_id}`); }}
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Matches;
