/**
 * V-One – העוזר האישי של Vantera
 * הודעת פתיחה מותאמת אישית, Quick Reply, Pulse, Voice (Web Speech API)
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequestJson } from '../api';
import './VOneWidget.css';

// Web Speech API types (not in standard lib.dom.d.ts)
interface WebSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}
interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const SpeechRecognition =
  typeof window !== 'undefined' &&
  ((window as unknown as { SpeechRecognition?: new () => WebSpeechRecognition }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => WebSpeechRecognition }).webkitSpeechRecognition);
const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

type UserStatus = {
  firstName: string;
  buildingName: string;
  pendingFeedbacks?: { id: string; title: string }[];
  openTicketsCount?: number;
  emergencyDetected?: boolean;
  recentVisionAlerts?: { eventType: string; cameraId?: string; timestamp?: string }[];
  moneySaved?: number;
};

const OPENING_TEMPLATE = (
  firstName: string,
  buildingName: string,
  ctx?: { openTicketsCount?: number; emergencyDetected?: boolean; recentVisionAlerts?: number; moneySaved?: number }
) => {
  let header = `שלום ${firstName || 'שם'}${firstName ? ',' : ''} איזה כיף לראות אותך! 🌟`;
  if (ctx?.emergencyDetected) {
    header = `⚠️ שים לב: יש אירוע חירום בבניין. הישאר מחוץ לאזורים המושפעים.\n\n${header}`;
  } else if (ctx?.openTicketsCount && ctx.openTicketsCount > 0) {
    header = `יש לך ${ctx.openTicketsCount} תקלה/ות פתוחות. אם צריך עזרה – אני כאן.\n\n${header}`;
  } else if (ctx?.recentVisionAlerts && ctx.recentVisionAlerts > 0) {
    header = `מצלמות ה-AI זיהו אירועים – פתחנו כרטיסים. הכל תחת מעקב.\n\n${header}`;
  }
  let body = `אני V-One, העוזר האישי שלך כאן ב-Vantera. אני לא סתם צ'אט – אני מחובר ישירות ל'לב' של הבניין שלך${buildingName ? ` ב${buildingName}` : ''}.

מה אני יכול לעשות בשבילך כבר עכשיו?

💰 שקיפות מלאה: תרצה לראות לאן הולכים דמי הוועד שלך החודש?

🔧 דיווח מהיר: יש תקלה בקומה? רק תגיד לי ואני כבר מזמין טכנאי.

🤖 מעקב AI: אני משגיח על המעליות והמשאבות 24/7 כדי למנוע תקלות לפני שהן קורות.`;
  if (ctx?.moneySaved && ctx.moneySaved > 0) {
    body += `\n\nהבניין חסך ₪${ctx.moneySaved} הודות ל-AI – אנחנו עובדים כדי לתת לך יותר ערך.`;
  }
  body += `

אם קשה לך להקליד, פשוט לחץ על כפתור המיקרופון ודבר איתי. אני כאן כדי להפוך את המגורים בבניין לשקטים וחכמים יותר.

אז... איך אני יכול לעזור לך היום?`;
  return header + body;
};

const VOneWidget: React.FC = () => {
  const { isUserLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [message, setMessage] = useState('');
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<{ id: string; title: string } | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatReplies, setChatReplies] = useState<string[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { response, data } = await apiRequestJson<UserStatus>('user/status');
      if (response.ok && data) {
        setUserStatus(data);
        const pending = data.pendingFeedbacks?.[0];
        if (pending) setPendingFeedback({ id: pending.id, title: pending.title });
      }
    } catch {
      setUserStatus({ firstName: '', buildingName: '' });
    }
  }, []);

  useEffect(() => {
    if (!isUserLoggedIn || !isOpen) return;
    fetchStatus();
  }, [isUserLoggedIn, isOpen, fetchStatus]);

  useEffect(() => {
    if (!isOpen || !userStatus) return;
    const ctx =
      userStatus.emergencyDetected
        ? { emergencyDetected: true, moneySaved: userStatus.moneySaved }
        : userStatus.openTicketsCount && userStatus.openTicketsCount > 0
          ? { openTicketsCount: userStatus.openTicketsCount, moneySaved: userStatus.moneySaved }
          : userStatus.recentVisionAlerts?.length
            ? { recentVisionAlerts: userStatus.recentVisionAlerts.length, moneySaved: userStatus.moneySaved }
            : userStatus.moneySaved
              ? { moneySaved: userStatus.moneySaved }
              : undefined;
    const fullText = OPENING_TEMPLATE(userStatus.firstName, userStatus.buildingName, ctx);
    setMessage('');
    setIsTyping(true);
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setMessage(fullText.slice(0, i + 1));
        i += 1;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [isOpen, userStatus?.firstName, userStatus?.buildingName]);

  const handleQuickReply = useCallback(
    (action: string) => {
      if (action === 'account') navigate('/payment-page');
      else if (action === 'report') navigate('/report-fault');
      else if (action === 'real_estate') navigate('/apartments');
      else if (action === 'who') setMessage((m) => m + '\n\nאני V-One, העוזר האישי שלך ב-Vantera. אני מחובר לכל המערכות של הבניין ויכול לעזור עם תשלומים, תקלות ומעקב 24/7.');
    },
    [navigate]
  );

  const handleSpeak = useCallback(() => {
    if (!hasSpeech || !message.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(message);
    u.lang = 'he-IL';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  }, [message]);

  const handleMicStart = useCallback(() => {
    if (!SpeechRecognition) return;
    const RecCtor = SpeechRecognition as new () => WebSpeechRecognition;
    const rec = new RecCtor();
    rec.lang = 'he-IL';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      setVoiceTranscript(t);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }, []);

  const handleMicStop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (!voiceTranscript || isListening) return;
    const lower = voiceTranscript.toLowerCase();
    if (/\bתקלה|נזיל|חשמל|מעלית|דווח\b/.test(lower)) handleQuickReply('report');
    else if (/\bחשבון|תשלום|כסף\b/.test(lower)) handleQuickReply('account');
    else if (/\bמי אתה|v-one|בוט\b/.test(lower)) handleQuickReply('who');
    else if (/\bמכור|למכור|מכירה|להשכיר|השכרה|הערכת שווי|מעבר דירה|חוזה שכירות|מחפש קונה|sell|rent|vendre|louer\b/.test(lower)) handleQuickReply('real_estate');
  }, [voiceTranscript, isListening, handleQuickReply]);

  const handleSendChat = useCallback(async () => {
    const text = chatInput.trim() || voiceTranscript.trim();
    if (!text) return;
    setChatLoading(true);
    setChatInput('');
    setVoiceTranscript('');
    try {
      const { response, data } = await apiRequestJson<{ reply?: string; action?: string; dealType?: string }>('vone/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (response.ok && data?.reply) {
        setChatReplies((r) => [...r, data.reply!]);
        if (data.action === 'report') navigate('/report-fault');
        else if (data.action === 'account') navigate('/payment-page');
        else if (data.action === 'real_estate_lead' && data.dealType === 'rent') navigate('/for-rent');
        else if (data.action === 'real_estate_lead' && data.dealType === 'sale') navigate('/for-sale');
      }
    } catch {
      setChatReplies((r) => [...r, 'מצטער, אירעה שגיאה. נסה שוב.']);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, voiceTranscript, navigate]);

  const handleSubmitFeedback = async () => {
    if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5 || !pendingFeedback) return;
    try {
      const { response } = await apiRequestJson<{ message?: string }>('feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: pendingFeedback.id, rating: feedbackRating, feedbackText: feedbackText.trim() || undefined }),
      });
      if (response.ok) {
        setFeedbackSent(true);
        setPendingFeedback(null);
        setFeedbackText('');
        fetchStatus();
      }
    } catch {
      // ignore
    }
  };

  if (!isUserLoggedIn) return null;

  return (
    <>
      <button
        type="button"
        className="vone-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'סגור V-One' : 'פתח V-One - העוזר האישי'}
      >
        <span className="vone-fab-pulse" aria-hidden />
        <i className="fas fa-robot" aria-hidden />
      </button>

      {isOpen && (
        <div className="vone-panel">
          <div className="vone-header">
            <div className="vone-avatar">
              {isTyping && <span className="vone-pulse" />}
              <i className="fas fa-robot" aria-hidden />
            </div>
            <h3 className="vone-title">V-One</h3>
            <button type="button" className="vone-close" onClick={() => setIsOpen(false)} aria-label="סגור">
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="vone-body">
            {pendingFeedback && !feedbackSent ? (
              <div className="vone-feedback-card">
                <p className="vone-feedback-title">
                  היי {userStatus?.firstName || ''}👋 ראיתי שהטכנאי סיים את הטיפול. איך היה השירות?
                </p>
                <textarea
                  className="vone-feedback-text"
                  placeholder="הוסף הערה (אופציונלי) – למשל: היה מקצועי ומהיר"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={2}
                />
                <div className="vone-stars">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`vone-star ${feedbackRating >= r ? 'active' : ''}`}
                      onClick={() => setFeedbackRating(r)}
                      aria-label={`דירוג ${r} כוכבים`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="vone-btn vone-btn-primary"
                  onClick={handleSubmitFeedback}
                  disabled={feedbackRating < 1}
                >
                  שלח דירוג
                </button>
              </div>
            ) : feedbackSent ? (
              <div className="vone-success">
                <i className="fas fa-check-circle" aria-hidden />
                <p>תודה! הדירוג שלך עוזר לנו לשמור על הבניין חכם ואיכותי.</p>
              </div>
            ) : null}

            <div className="vone-message">
              <pre>{message}</pre>
              {isTyping && <span className="vone-caret" />}
            </div>

            <div className="vone-quick-replies">
              <button type="button" className="vone-quick-btn" onClick={() => handleQuickReply('account')}>
                💰 הצג לי את מצב החשבון
              </button>
              <button type="button" className="vone-quick-btn" onClick={() => handleQuickReply('report')}>
                🔧 דווח על תקלה חדשה
              </button>
              <button type="button" className="vone-quick-btn" onClick={() => setChatInput('רוצה למכור את הדירה שלי')}>
                🏠 מכירה/השכרה
              </button>
              <button type="button" className="vone-quick-btn" onClick={() => handleQuickReply('who')}>
                🤖 מי אתה V-One?
              </button>
            </div>

            <div className="vone-voice-actions">
              {hasSpeech && (
                <button
                  type="button"
                  className="vone-voice-btn"
                  onClick={handleSpeak}
                  aria-label="השמע את ההודעה"
                  title="השמע"
                >
                  <i className="fas fa-volume-up" aria-hidden />
                  <span>השמע</span>
                </button>
              )}
              {SpeechRecognition && (
                <button
                  type="button"
                  className={`vone-voice-btn vone-mic ${isListening ? 'active' : ''}`}
                  onClick={isListening ? handleMicStop : handleMicStart}
                  aria-label={isListening ? 'עצור הקלטה' : 'דבר איתי'}
                  title={isListening ? 'עצור' : 'דבר'}
                >
                  <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`} aria-hidden />
                  <span>{isListening ? 'עצור' : 'דבר'}</span>
                </button>
              )}
            </div>
            {voiceTranscript && (
              <p className="vone-transcript">
                <i className="fas fa-comment-dots me-2" />
                {voiceTranscript}
              </p>
            )}
            <div className="vone-chat-input-wrap">
              <input
                type="text"
                className="vone-chat-input"
                placeholder="כתוב הודעה..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button type="button" className="vone-chat-send" onClick={handleSendChat} disabled={chatLoading}>
                {chatLoading ? '...' : 'שלח'}
              </button>
            </div>
            {chatReplies.length > 0 && (
              <div className="vone-replies">
                {chatReplies.map((reply, i) => (
                  <div key={i} className="vone-reply-bubble">
                    {reply}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VOneWidget;
