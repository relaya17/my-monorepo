import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface OtherUser {
  display_name: string;
  avatar_url: string | null;
}

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  // Load match details + messages
  useEffect(() => {
    if (!user || !matchId) return;
    (async () => {
      // Get match and find other user
      const { data: match } = await supabase
        .from("matches")
        .select("user_a, user_b")
        .eq("id", matchId)
        .maybeSingle();

      if (!match) {
        navigate("/matches");
        return;
      }

      const otherId = match.user_a === user.id ? match.user_b : match.user_a;
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", otherId)
        .maybeSingle();

      setOtherUser(profile ?? { display_name: "משתמש לא ידוע", avatar_url: null });

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true })
        .limit(100);

      setMessages((msgs as Message[]) ?? []);
      setLoadingChat(false);
    })();
  }, [user, matchId, navigate]);

  // Real-time subscription
  useEffect(() => {
    if (!matchId) return;
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !user || !matchId || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);
    await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      content,
    });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b bg-background/80 backdrop-blur sticky top-0 z-10 max-w-md mx-auto w-full">
        <Button variant="ghost" size="icon" onClick={() => navigate("/matches")} aria-label="חזרה" title="חזרה">
          <ArrowRight className="w-5 h-5" />
        </Button>
        {otherUser && (
          <>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={otherUser.avatar_url || "/cleaner-placeholder.svg"}
                alt={otherUser.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="font-bold text-lg">{otherUser.display_name}</h1>
          </>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-3">
        {loadingChat ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-1">שלחו הודעה ראשונה! 👋</p>
            <p className="text-sm">זה התחיל ממאצ' — עכשיו תתחילו לדבר</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    isMine
                      ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-br-sm"
                      : "bg-card border rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"} text-left`}>
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="p-4 border-t bg-background/80 backdrop-blur sticky bottom-0 max-w-md mx-auto w-full">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="כתוב הודעה..."
            className="flex-1 rounded-full"
            maxLength={2000}
            aria-label="כתוב הודעה"
          />
          <Button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            size="icon"
            className="rounded-full w-10 h-10 bg-gradient-to-br from-primary to-secondary flex-shrink-0"
            aria-label="שלח הודעה"
            title="שלח"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
