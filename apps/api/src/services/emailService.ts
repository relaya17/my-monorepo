/**
 * Email Service – Onboarding, Notifications.
 * Uses Resend when RESEND_API_KEY is set; otherwise logs to console (dev).
 */
import { Resend } from 'resend';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const resend = config.resendApiKey?.trim() ? new Resend(config.resendApiKey) : null;
const appLink = config.frontendUrl ? `${config.frontendUrl}/user-login` : 'https://vantera.co.il/user-login';

/** תבנית Onboarding מדף LAUNCH_STRATEGY / sales-templates.json */
const ONBOARDING_SUBJECT_HE = 'ברוכים הבאים לעתיד: הבניין שלכם עבר לסטנדרט Vantera 🛡️';
const ONBOARDING_SUBJECT_EN = 'Welcome: Your building has upgraded to Vantera Standard 🛡️';

const ONBOARDING_BODY_HE = (buildingName: string, link: string) =>
  `דייר יקר,

הבניין "${buildingName}" שודרג למערכת הניהול והאבטחה המתקדמת בעולם. מהיום, הביטחון והנוחות שלך בידיים שלנו:

• אבטחה היקפית: הבניין מנוטר 24/7 ע"י AI ולוויין.
• שירות מיידי: צריכים טכנאי? פתחו את האפליקציה וראו את המקצוען הקרוב אליכם על המפה ב-GPS.
• כניסה חכמה: הזמנתם אורח או ספק? שלחו לו מפתח דיגיטלי זמני ישירות לנייד.

לחצו כאן להורדת האפליקציה והפעלת חשבון הפרימיום שלכם: ${link}

בברכה,
צוות Vantera`;

const ONBOARDING_BODY_EN = (buildingName: string, link: string) =>
  `Dear Resident,

Your building "${buildingName}" has been upgraded to the world's most advanced management and security system. From today, your safety and comfort are in our hands:

• Full security: The building is monitored 24/7 by AI and satellite.
• Instant service: Need a technician? Open the app and see the nearest professional on the GPS map.
• Smart entry: Invited a guest or supplier? Send them a temporary digital key directly to their phone.

Click here to download the app and activate your premium account: ${link}

Best regards,
Vantera Team`;

export async function sendOnboardingEmail(
  to: string,
  buildingName: string,
  options?: { lang?: 'he' | 'en'; link?: string }
): Promise<boolean> {
  const link = options?.link ?? appLink;
  const lang = options?.lang ?? 'he';
  const subject = lang === 'he' ? ONBOARDING_SUBJECT_HE : ONBOARDING_SUBJECT_EN;
  const body = lang === 'he' ? ONBOARDING_BODY_HE(buildingName, link) : ONBOARDING_BODY_EN(buildingName, link);

  if (!resend) {
    logger.info('[Email] Onboarding (no Resend):', { to, buildingName, subject: subject.slice(0, 40) });
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: config.emailFrom,
      to: to.trim(),
      subject,
      text: body,
    });
    if (error) {
      logger.error('[Email] Onboarding failed', { to, error });
      return false;
    }
    logger.info('[Email] Onboarding sent', { to, buildingName });
    return true;
  } catch (err) {
    logger.error('[Email] Onboarding exception', { to, err });
    return false;
  }
}

/** Revenue Share – "Hot Real Estate Lead Found" – Real-time Alert to property manager */
const REAL_ESTATE_LEAD_SUBJECT = 'Hot Real Estate Lead Found';
const REAL_ESTATE_LEAD_BODY = (
  buildingName: string,
  apartmentNumber: string,
  residentName: string,
  dealType: 'sale' | 'rent'
) =>
  `A resident in your building has expressed interest in ${dealType === 'rent' ? 'renting' : 'selling'} their apartment.

Building: ${buildingName}
Apartment: ${apartmentNumber}
Resident: ${residentName}

Contact them now through the Vantera CEO Dashboard – Real Estate Opportunities tab.

— Vantera OS`;

export async function sendRealEstateLeadAlert(
  to: string,
  buildingName: string,
  apartmentNumber: string,
  residentName: string,
  dealType: 'sale' | 'rent'
): Promise<boolean> {
  const body = REAL_ESTATE_LEAD_BODY(buildingName, apartmentNumber, residentName, dealType);

  if (!resend) {
    logger.info('[Email] Real Estate Lead (no Resend):', { to, buildingName, subject: REAL_ESTATE_LEAD_SUBJECT });
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: config.emailFrom,
      to: to.trim(),
      subject: REAL_ESTATE_LEAD_SUBJECT,
      text: body,
    });
    if (error) {
      logger.error('[Email] Real Estate Lead failed', { to, error });
      return false;
    }
    logger.info('[Email] Real Estate Lead sent', { to, buildingName, apartmentNumber });
    return true;
  } catch (err) {
    logger.error('[Email] Real Estate Lead exception', { to, err });
    return false;
  }
}
