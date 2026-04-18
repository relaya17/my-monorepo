/**
 * Sentiment Analysis – ניתוח רגשות על טקסט משוב (פשוט, מבוסס מילות מפתח)
 * מחזיר ציון -1 (שלילי) עד 1 (חיובי)
 */
const NEGATIVE_HE = [
  'לכלוך', 'גרוע', 'רע', 'לא טוב', 'אכזבה', 'עזב', 'בלגן', 'איטי',
  'מגעיל', 'נורא', 'כישלון', 'לא מקצועי', 'לא מרוצה', 'חרטה', 'מתחרט',
];

const POSITIVE_HE = [
  'מעולה', 'מצוין', 'מושלם', 'סופר', 'נהניתי', 'מרוצה', 'מקצועי', 'מהיר',
  'נקי', 'מדויק', 'ממליץ', 'תודה', 'כל הכבוד',
];

function normalize(text: string): string {
  return (text ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function analyzeSentiment(text: string): number {
  const norm = normalize(text);
  if (!norm) return 0;

  let score = 0;
  for (const w of NEGATIVE_HE) {
    if (norm.includes(w)) score -= 0.3;
  }
  for (const w of POSITIVE_HE) {
    if (norm.includes(w)) score += 0.25;
  }
  return Math.max(-1, Math.min(1, score));
}
