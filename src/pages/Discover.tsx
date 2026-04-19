import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SwipeCard from "@/components/SwipeCard";
import MapView from "@/components/MapView";
import MatchModal, { MatchInfo } from "@/components/MatchModal";
import FilterDrawer, { Filters, DEFAULT_FILTERS } from "@/components/FilterDrawer";
import { Heart, X, Sparkles, Users, LogOut, Loader2, Map as MapIcon, Layers, RefreshCw } from "lucide-react";
import { MAX_CANDIDATES, DEFAULT_CENTER } from "@/lib/constants";

interface Profile {
  user_id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  age: number | null;
  experience_years: number | null;
  hourly_rate: number | null;
  services: string[] | null;
  avatar_url: string | null;
  photos: string[] | null;
  latitude: number | null;
  longitude: number | null;
  role: "cleaner" | "client";
  distance_km?: number;
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Discover = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [view, setView] = useState<"cards" | "map">("cards");
  const [matchedProfile, setMatchedProfile] = useState<MatchInfo | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoadingCards(true);
    const { data: me } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (!me) {
      navigate("/profile-setup");
      return;
    }
    setMyProfile(me as Profile);

    const oppositeRole = me.role === "cleaner" ? "client" : "cleaner";
    const { data: swiped } = await supabase.from("swipes").select("swiped_id").eq("swiper_id", user.id);
    const swipedIds = swiped?.map((s) => s.swiped_id) || [];

    let query = supabase.from("profiles").select("*").eq("role", oppositeRole).neq("user_id", user.id);
    if (swipedIds.length > 0) query = query.not("user_id", "in", `(${swipedIds.join(",")})`);

    const { data: list } = await query.limit(MAX_CANDIDATES);

    const enriched = (list || []).map((p) => {
      const distance =
        me.latitude && me.longitude && p.latitude && p.longitude
          ? haversine(me.latitude, me.longitude, p.latitude, p.longitude)
          : undefined;
      return { ...p, distance_km: distance } as Profile;
    });

    enriched.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
    setCandidates(enriched);
    setLoadingCards(false);
  }, [user, navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleSwipe = async (liked: boolean) => {
    if (!user || candidates.length === 0) return;
    const target = candidates[0];
    setCandidates((c) => c.slice(1));

    const { error } = await supabase.from("swipes").insert({
      swiper_id: user.id,
      swiped_id: target.user_id,
      liked,
    });
    if (error) {
      toast({ title: "שגיאה בשמירת סווייפ", description: error.message, variant: "destructive" });
      return;
    }

    if (liked) {
      const { data: reciprocal } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_id", target.user_id)
        .eq("swiped_id", user.id)
        .eq("liked", true)
        .maybeSingle();
      if (reciprocal) {
        // Fetch match_id for chat navigation
        const a = user.id < target.user_id ? user.id : target.user_id;
        const b = user.id < target.user_id ? target.user_id : user.id;
        const { data: matchRow } = await supabase
          .from("matches")
          .select("id")
          .eq("user_a", a)
          .eq("user_b", b)
          .maybeSingle();
        setMatchedProfile({
          user_id: target.user_id,
          display_name: target.display_name,
          avatar_url: target.avatar_url,
          match_id: matchRow?.id ?? "",
        });
      }
    }
  };

  const top = candidates[0];
  const filteredCandidates = candidates.filter((c) => {
    if (filters.maxDistance < 50 && (c.distance_km ?? 999) > filters.maxDistance) return false;
    if (filters.maxPrice < 500 && c.hourly_rate != null && c.hourly_rate > filters.maxPrice) return false;
    if (filters.services.length > 0) {
      const has = filters.services.some((s) => c.services?.includes(s));
      if (!has) return false;
    }
    return true;
  });
  const filteredTop = filteredCandidates[0];

  const mapMarkers = filteredCandidates
    .filter((c) => c.latitude != null && c.longitude != null)
    .map((c) => ({
      user_id: c.user_id,
      display_name: c.display_name,
      city: c.city,
      hourly_rate: c.hourly_rate,
      avatar_url: c.avatar_url,
      latitude: c.latitude!,
      longitude: c.longitude!,
    }));
  const mapCenter: [number, number] =
    myProfile?.latitude && myProfile?.longitude ? [myProfile.latitude, myProfile.longitude] : DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="flex items-center justify-between p-4 max-w-md mx-auto">
        <Button variant="ghost" size="icon" onClick={() => navigate("/profile-setup")} title="הפרופיל שלי" aria-label="הפרופיל שלי">
          <img
            src={myProfile?.avatar_url || "/cleaner-placeholder.svg"}
            alt="הפרופיל שלי"
            className="w-9 h-9 rounded-full object-cover"
          />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CleanMatch</h1>
        </div>
        <div className="flex gap-1">
          <FilterDrawer filters={filters} onChange={setFilters} />
          <Button variant="ghost" size="icon" onClick={() => navigate("/matches")} title="ההתאמות שלי" aria-label="ההתאמות שלי">
            <Users className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => signOut().then(() => navigate("/"))} title="התנתק" aria-label="התנתק">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4">
        <Tabs value={view} onValueChange={(v) => setView(v as "cards" | "map")} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-3">
            <TabsTrigger value="cards"><Layers className="w-4 h-4 ml-2" />כרטיסיות</TabsTrigger>
            <TabsTrigger value="map"><MapIcon className="w-4 h-4 ml-2" />מפה</TabsTrigger>
          </TabsList>

          <TabsContent value="cards">
            <div className="text-center mb-3 text-sm text-muted-foreground">
              {myProfile?.role === "cleaner" ? "מצא לקוחות שזקוקים לך" : "מצא את המנקה המושלם"}
              {filteredCandidates.length > 0 && (
                <span className="mr-2 text-primary font-medium">({filteredCandidates.length})</span>
              )}
            </div>

            {/* Onboarding swipe hint */}
            {showHint && filteredTop && !loadingCards && (
              <div className="flex items-center justify-center gap-4 mb-3 text-xs text-muted-foreground animate-in fade-in">
                <span className="flex items-center gap-1">
                  <X className="w-3.5 h-3.5 text-destructive" /> החלק שמאלה לדחייה
                </span>
                <span className="w-px h-4 bg-border" />
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-primary" /> החלק ימינה ללייק
                </span>
                <button
                  className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  onClick={() => setShowHint(false)}
                  aria-label="סגור רמז"
                  title="סגור"
                >
                  ×
                </button>
              </div>
            )}

            <div className="relative w-full aspect-[3/4] max-h-[560px]">
              {loadingCards ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredTop ? (
                <>
                  {filteredCandidates[1] && (
                    <div className="absolute inset-0 scale-95 opacity-60 pointer-events-none">
                      <SwipeCard profile={filteredCandidates[1]} onSwipe={() => {}} />
                    </div>
                  )}
                  <SwipeCard key={filteredTop.user_id} profile={filteredTop} onSwipe={handleSwipe} />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="w-9 h-9 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {candidates.length > 0 ? "אין תוצאות לפילטרים אלה" : "סיימת לעת עתה!"}
                  </h3>
                  <p className="text-muted-foreground mb-5 text-sm">
                    {candidates.length > 0
                      ? "נסה לשנות את הפילטרים כדי לראות עוד אנשים"
                      : "חזור מאוחר יותר למשתמשים חדשים"}
                  </p>
                  <Button onClick={loadData} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    רענן
                  </Button>
                </div>
              )}
            </div>

            {filteredTop && (
              <div className="flex justify-center gap-6 mt-6">
                <Button
                  onClick={() => handleSwipe(false)}
                  size="icon"
                  variant="outline"
                  className="w-16 h-16 rounded-full border-2 border-destructive hover:bg-destructive/10"
                  title="דלג"
                  aria-label="דלג"
                >
                  <X className="w-7 h-7 text-destructive" />
                </Button>
                <Button
                  onClick={() => handleSwipe(true)}
                  size="icon"
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform shadow-lg"
                  title="לייק"
                  aria-label="לייק"
                >
                  <Heart className="w-7 h-7 fill-white" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <div className="rounded-2xl overflow-hidden h-[500px] shadow-lg border">
              <MapView center={mapCenter} markers={mapMarkers} />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              {mapMarkers.length} משתמשים בקרבתך
            </p>
          </TabsContent>
        </Tabs>
      </main>

      <MatchModal
        match={matchedProfile}
        myAvatar={myProfile?.avatar_url ?? null}
        onClose={() => setMatchedProfile(null)}
        onMessage={(matchId) => {
          setMatchedProfile(null);
          navigate(`/chat/${matchId}`);
        }}
      />
    </div>
  );
};

export default Discover;
