import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

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
  distance_km?: number;
}

interface Props {
  profile: Profile;
  onSwipe: (liked: boolean) => void;
}

const SwipeCard = ({ profile, onSwipe }: Props) => {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const start = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  // Combine avatar + photos into a gallery
  const gallery = [
    ...(profile.avatar_url ? [profile.avatar_url] : []),
    ...(profile.photos || []),
  ];

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const onPointerUp = () => {
    dragging.current = false;
    if (drag.x > 120) {
      setExiting("right");
      setTimeout(() => onSwipe(true), 200);
    } else if (drag.x < -120) {
      setExiting("left");
      setTimeout(() => onSwipe(false), 200);
    } else {
      setDrag({ x: 0, y: 0 });
    }
  };

  const rotation = drag.x * 0.08;
  const transform = exiting
    ? `translate(${exiting === "right" ? 800 : -800}px, ${drag.y}px) rotate(${exiting === "right" ? 30 : -30}deg)`
    : `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`;

  const currentPhoto = gallery[photoIdx];

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gallery.length > 1) setPhotoIdx((i) => (i + 1) % gallery.length);
  };
  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gallery.length > 1) setPhotoIdx((i) => (i - 1 + gallery.length) % gallery.length);
  };

  return (
    <Card
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none overflow-hidden shadow-[var(--shadow-card)] border-0"
      style={{
        transform,
        transition: exiting ? "transform 0.2s ease-out" : dragging.current ? "none" : "transform 0.3s",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Like / Nope overlays */}
      {drag.x > 40 && (
        <div className="absolute top-8 left-8 z-20 px-4 py-2 border-4 border-accent rounded-xl rotate-[-15deg] bg-background/30 backdrop-blur">
          <span className="text-3xl font-bold text-accent">לייק</span>
        </div>
      )}
      {drag.x < -40 && (
        <div className="absolute top-8 right-8 z-20 px-4 py-2 border-4 border-destructive rounded-xl rotate-[15deg] bg-background/30 backdrop-blur">
          <span className="text-3xl font-bold text-destructive">דלג</span>
        </div>
      )}

      {/* Photo with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary">
        {currentPhoto ? (
          <img src={currentPhoto} alt={profile.display_name} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <img src="/cleaner-placeholder.svg" alt="מנקה" className="w-full h-full object-cover" draggable={false} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Photo navigation */}
      {gallery.length > 1 && (
        <>
          <div className="absolute top-3 inset-x-3 z-10 flex gap-1">
            {gallery.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i === photoIdx ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
          <button
            onClick={prevPhoto}
            title="תמונה קודמת"
            aria-label="תמונה קודמת"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center z-10 hover:bg-black/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={nextPhoto}
            title="תמונה הבאה"
            aria-label="תמונה הבאה"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur text-white flex items-center justify-center z-10 hover:bg-black/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 inset-x-0 p-5 text-white space-y-2 z-10">
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-bold drop-shadow">
            {profile.display_name}
            {profile.age && <span className="font-normal mr-2">, {profile.age}</span>}
          </h3>
          {profile.hourly_rate && (
            <div className="bg-primary px-3 py-1 rounded-full text-sm font-bold shadow">
              ₪{profile.hourly_rate}/ש
            </div>
          )}
        </div>

        {profile.city && (
          <div className="flex items-center text-sm gap-1 text-white/90">
            <MapPin className="w-4 h-4" />
            <span>{profile.city}</span>
            {profile.distance_km !== undefined && <span>• {profile.distance_km.toFixed(1)} ק"מ ממך</span>}
          </div>
        )}

        {profile.experience_years != null && (
          <div className="flex items-center text-sm gap-1 text-white/90">
            <Briefcase className="w-4 h-4" />
            <span>{profile.experience_years} שנות ניסיון</span>
          </div>
        )}

        {profile.bio && <p className="text-sm text-white/90 line-clamp-2 drop-shadow">{profile.bio}</p>}

        {profile.services && profile.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.services.slice(0, 4).map((s) => (
              <Badge key={s} className="text-xs bg-white/20 backdrop-blur text-white border-0 hover:bg-white/30">{s}</Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SwipeCard;
