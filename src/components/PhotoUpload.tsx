import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, Plus } from "lucide-react";

interface Props {
  userId: string;
  avatarUrl: string | null;
  photos: string[];
  onChange: (avatarUrl: string | null, photos: string[]) => void;
}

const MAX_PHOTOS = 5;

const PhotoUpload = ({ userId, avatarUrl, photos, onChange }: Props) => {
  const { toast } = useToast();
  const avatarInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"avatar" | "photo" | null>(null);

  const upload = async (file: File, kind: "avatar" | "photo") => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "הקובץ גדול מדי", description: "מקסימום 5MB", variant: "destructive" });
      return;
    }
    setUploading(kind);
    const ext = file.name.split(".").pop();
    const filename = `${userId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(filename, file, { upsert: true });
    if (error) {
      toast({ title: "שגיאה בהעלאה", description: error.message, variant: "destructive" });
      setUploading(null);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filename);
    if (kind === "avatar") {
      onChange(publicUrl, photos);
    } else {
      onChange(avatarUrl, [...photos, publicUrl]);
    }
    setUploading(null);
  };

  const removePhoto = async (url: string) => {
    const path = url.split("/avatars/")[1];
    if (path) await supabase.storage.from("avatars").remove([path]);
    onChange(avatarUrl, photos.filter((p) => p !== url));
  };

  const removeAvatar = async () => {
    if (avatarUrl) {
      const path = avatarUrl.split("/avatars/")[1];
      if (path) await supabase.storage.from("avatars").remove([path]);
    }
    onChange(null, photos);
  };

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary overflow-hidden flex items-center justify-center shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-10 h-10 text-primary-foreground/70" />
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarInput.current?.click()}
            className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 shadow-md hover:scale-110 transition-transform"
            disabled={uploading === "avatar"}
            title="העלאת תמונת פרופיל"
            aria-label="העלאת תמונת פרופיל"
          >
            {uploading === "avatar" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={removeAvatar}
              className="absolute -top-1 -left-1 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
              title="הסרת תמונת פרופיל"
              aria-label="הסרת תמונת פרופיל"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <input
            ref={avatarInput}
            type="file"
            accept="image/*"
            className="hidden"
            title="בחר תמונת פרופיל"
            aria-label="בחר תמונת פרופיל"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "avatar")}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">תמונת פרופיל ראשית</p>
      </div>

      {/* Gallery */}
      <div>
        <p className="text-sm font-medium mb-2">גלריית תמונות (עד {MAX_PHOTOS})</p>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={url} alt="photo" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute top-1 left-1 bg-destructive/90 text-destructive-foreground rounded-full p-1 hover:scale-110 transition-transform"
              title="הסרת תמונה"
              aria-label="הסרת תמונה"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              disabled={uploading === "photo"}
              title="הוסף תמונה לגלריה"
              aria-label="הוסף תמונה לגלריה"
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
            >
              {uploading === "photo" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6 text-muted-foreground" />}
            </button>
          )}
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            className="hidden"
            title="בחר תמונה לגלריה"
            aria-label="בחר תמונה לגלריה"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "photo")}
          />
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
