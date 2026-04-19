import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, ArrowRight } from "lucide-react";
import PhotoUpload from "@/components/PhotoUpload";
import { SERVICE_OPTIONS } from "@/lib/constants";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    display_name: "",
    bio: "",
    age: "",
    experience_years: "",
    hourly_rate: "",
    city: "",
    services: [] as string[],
    role: "client" as "client" | "cleaner",
    latitude: null as number | null,
    longitude: null as number | null,
    avatar_url: null as string | null,
    photos: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/");
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data) {
          setProfile({
            display_name: data.display_name || "",
            bio: data.bio || "",
            age: data.age?.toString() || "",
            experience_years: data.experience_years?.toString() || "",
            hourly_rate: data.hourly_rate?.toString() || "",
            city: data.city || "",
            services: data.services || [],
            role: data.role,
            latitude: data.latitude,
            longitude: data.longitude,
            avatar_url: data.avatar_url,
            photos: data.photos || [],
          });
        }
      });
    }
  }, [user, loading, navigate]);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProfile((p) => ({ ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        toast({ title: "מיקום זוהה!", description: "המיקום שלך נשמר" });
        setLocating(false);
      },
      (err) => {
        toast({ title: "שגיאה במיקום", description: err.message, variant: "destructive" });
        setLocating(false);
      }
    );
  };

  const toggleService = (s: string) => {
    setProfile((p) => ({
      ...p,
      services: p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s],
    }));
  };

  const persistMedia = async (avatar_url: string | null, photos: string[]) => {
    setProfile((p) => ({ ...p, avatar_url, photos }));
    if (!user) return;
    await supabase.from("profiles").update({ avatar_url, photos }).eq("user_id", user.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      bio: profile.bio || null,
      age: profile.age ? parseInt(profile.age) : null,
      experience_years: profile.experience_years ? parseInt(profile.experience_years) : null,
      hourly_rate: profile.hourly_rate ? parseFloat(profile.hourly_rate) : null,
      city: profile.city || null,
      services: profile.services,
      latitude: profile.latitude,
      longitude: profile.longitude,
      avatar_url: profile.avatar_url,
      photos: profile.photos,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "הפרופיל נשמר!" });
    navigate("/app");
  };

  const isCleaner = profile.role === "cleaner";

  const completionScore = (() => {
    let score = 0;
    if (profile.display_name.trim()) score += 20;
    if (profile.avatar_url) score += 20;
    if (profile.bio.trim()) score += 10;
    if (profile.city.trim()) score += 10;
    if (profile.latitude) score += 15;
    if (profile.services.length > 0) score += 10;
    if (isCleaner && profile.hourly_rate) score += 8;
    if (isCleaner && profile.experience_years) score += 7;
    return score;
  })();

  const completionLabel =
    completionScore < 40 ? "בסיסי" :
    completionScore < 70 ? "טוב" :
    completionScore < 90 ? "מצוין" :
    "מושלם ✨";

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-primary/5 to-secondary/5 py-10">
      <Card className="max-w-2xl mx-auto shadow-xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="text-right">
              <CardTitle>הפרופיל שלי</CardTitle>
              <CardDescription>
                {isCleaner ? "ספר ללקוחות על עצמך" : "ספר למנקים מה אתה מחפש"}
              </CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>השלמת פרופיל</span>
              <span className="font-medium text-primary">{completionScore}% — {completionLabel}</span>
            </div>
            <Progress value={completionScore} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {user && (
              <PhotoUpload
                userId={user.id}
                avatarUrl={profile.avatar_url}
                photos={profile.photos}
                onChange={persistMedia}
              />
            )}

            <div className="space-y-2">
              <Label>שם מלא *</Label>
              <Input required value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>על עצמי</Label>
              <Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder={isCleaner ? "ניסיון, התמחויות..." : "מה אני מחפש..."} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>גיל</Label>
                <Input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>עיר</Label>
                <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="תל אביב" />
              </div>
            </div>

            {isCleaner && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>שנות ניסיון</Label>
                  <Input type="number" value={profile.experience_years} onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>מחיר לשעה (₪)</Label>
                  <Input type="number" value={profile.hourly_rate} onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{isCleaner ? "השירותים שלי" : "שירותים שאני מחפש"}</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((s) => (
                  <Badge
                    key={s}
                    variant={profile.services.includes(s) ? "default" : "outline"}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => toggleService(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>מיקום</Label>
              <Button type="button" variant="outline" onClick={detectLocation} disabled={locating} className="w-full">
                {locating ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <MapPin className="w-4 h-4 ml-2" />}
                {profile.latitude ? `מיקום זוהה ✓` : "זהה את המיקום שלי"}
              </Button>
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "שמור והמשך"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
