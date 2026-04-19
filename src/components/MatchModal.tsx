import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, X } from "lucide-react";

export interface MatchInfo {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  match_id: string;
}

interface MatchModalProps {
  match: MatchInfo | null;
  myAvatar: string | null;
  onClose: () => void;
  onMessage: (matchId: string) => void;
}

const MatchModal = ({ match, myAvatar, onClose, onMessage }: MatchModalProps) => {
  if (!match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm mx-4 rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 text-center text-white shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          aria-label="סגור חלון התאמה"
          title="סגור"
        >
          <X className="w-5 h-5" />
        </button>

        <Heart className="w-16 h-16 mx-auto text-white drop-shadow mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold mb-1">זה מאצ'! 🎉</h2>
        <p className="text-white/85 mb-8 text-sm">
          אתם ו{match.display_name} לייקתם אחד את השני
        </p>

        <div className="flex items-center justify-center gap-5 mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl">
            <img src={myAvatar || "/cleaner-placeholder.svg"} alt="אני" className="w-full h-full object-cover" />
          </div>
          <span className="text-3xl">💕</span>
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-xl">
            <img src={match.avatar_url || "/cleaner-placeholder.svg"} alt={match.display_name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => onMessage(match.match_id)}
            className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-full py-6 text-lg shadow-lg"
          >
            <MessageCircle className="w-5 h-5 ml-2" />
            שלח הודעה
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-white hover:bg-white/10 rounded-full"
          >
            המשך להחליק
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
