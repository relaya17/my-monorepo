/**
 * Voice-to-Insight — Web Speech API → AI triage analysis.
 * Resident speaks a maintenance problem → transcript → AI insight.
 */
import React, { useState, useRef } from 'react';
import './VoiceInsightPage.css';
import { getApiUrl, getApiHeaders } from '../api';

interface VoiceInsight {
  transcript: string;
  category: string;
  priority: string;
  confidence: number;
  suggestedTitle: string;
  nextSteps: string[];
  summary: string;
}

// Web Speech API type augmentation (not in standard TS lib)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const PRIORITY_LABELS: Record<string, string> = {
  Urgent: 'דחוף',
  High: 'גבוה',
  Medium: 'בינוני',
  Low: 'נמוך',
};

const PRIORITY_COLORS: Record<string, string> = {
  Urgent: 'danger',
  High: 'warning',
  Medium: 'info',
  Low: 'success',
};

const VoiceInsightPage: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<VoiceInsight | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const hasSpeechAPI =
    typeof window !== 'undefined' && (window.SpeechRecognition ?? window.webkitSpeechRecognition);

  const startRecording = () => {
    const SpeechRec = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setError('הדפדפן שלך אינו תומך בזיהוי קול. נסה Chrome.');
      return;
    }
    const rec = new SpeechRec();
    rec.lang = 'he-IL';
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ');
      setTranscript(text);
    };
    rec.onerror = () => {
      setError('שגיאה בזיהוי הקול');
      setIsRecording(false);
    };
    rec.onend = () => setIsRecording(false);

    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
    setError(null);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const analyzeTranscript = async () => {
    if (!transcript.trim()) {
      setError('נא להזין תמלול');
      return;
    }
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const res = await fetch(getApiUrl('ai-services/voice-insight'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ transcript: transcript.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { message?: string };
        throw new Error(data.message ?? 'שגיאה בניתוח');
      }
      const data = (await res.json()) as VoiceInsight;
      setInsight(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בניתוח הקול');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4 voice-insight-container" dir="rtl">
      <h3 className="fw-bold mb-2">
        <i className="fas fa-microphone me-2 text-primary" aria-hidden="true" />
        קול לתובנה
      </h3>
      <p className="text-muted mb-4">
        דבר על הבעיה בבניין – המערכת תנתח ותסווג אוטומטית לפי עדיפות.
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label className="form-label fw-semibold" htmlFor="vi-transcript">
            תמלול / תיאור הבעיה
          </label>
          <textarea
            id="vi-transcript"
            className="form-control mb-3"
            rows={4}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="לחץ על המיקרופון או הקלד כאן את תיאור הבעיה..."
            disabled={isRecording || loading}
          />

          <div className="d-flex gap-2 flex-wrap">
            {hasSpeechAPI && !isRecording && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={startRecording}
                disabled={loading}
                aria-label="התחל הקלטה"
              >
                <i className="fas fa-microphone me-2" aria-hidden="true" />
                הקלט
              </button>
            )}
            {isRecording && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={stopRecording}
                aria-label="עצור הקלטה"
              >
                <span className="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true" />
                עצור
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { void analyzeTranscript(); }}
              disabled={loading || !transcript.trim()}
              aria-label="נתח תמלול"
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              ) : (
                <i className="fas fa-brain me-2" aria-hidden="true" />
              )}
              נתח
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => { setTranscript(''); setInsight(null); setError(null); }}
              disabled={loading}
            >
              נקה
            </button>
          </div>
        </div>
      </div>

      {insight && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-light fw-bold">
            <i className="fas fa-lightbulb me-2 text-warning" aria-hidden="true" />
            תובנה
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-6">
                <span className="text-muted small">קטגוריה</span>
                <div className="fw-bold">{insight.category}</div>
              </div>
              <div className="col-6">
                <span className="text-muted small">עדיפות</span>
                <div>
                  <span className={`badge bg-${PRIORITY_COLORS[insight.priority] ?? 'secondary'}`}>
                    {PRIORITY_LABELS[insight.priority] ?? insight.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-muted small">כותרת מוצעת</span>
              <div className="fw-semibold">{insight.suggestedTitle}</div>
            </div>

            <div className="mb-3">
              <span className="text-muted small">סיכום</span>
              <div>{insight.summary}</div>
            </div>

            {insight.nextSteps.length > 0 && (
              <div>
                <span className="text-muted small">צעדים מומלצים</span>
                <ul className="mb-0 mt-1">
                  {insight.nextSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 text-muted small">
              ביטחון AI: {Math.round(insight.confidence * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInsightPage;
