/**
 * כתובות וידאו רקע – מקום מרכזי להחלפה.
 *
 * אפשרות 1: להגדיר ב-.env
 *   VITE_HOME_VIDEO_URL=...
 *   VITE_LANDING_VIDEO_URL=...
 *
 * אפשרות 2: להחליף כאן ישירות:
 */
const HOME_VIDEO_PLACEHOLDER = ''; /* ← כתובת וידאו לדף הבית */
const LANDING_VIDEO_PLACEHOLDER = ''; /* ← כתובת וידאו לדף נחיתה/נתונים */

const FALLBACK_HOME = 'https://res.cloudinary.com/dora8sxcb/video/upload/v1770849384/motion2Fast_Cinematic.mp4_oorj6z.mp4';
const FALLBACK_LANDING = 'https://res.cloudinary.com/dora8sxcb/video/upload/v1770835423/motion2Fast_mp4_bwq9kf.mp4';

export const HOME_VIDEO_SRC =
  (import.meta.env.VITE_HOME_VIDEO_URL as string) || HOME_VIDEO_PLACEHOLDER || FALLBACK_HOME;

export const LANDING_VIDEO_SRC =
  (import.meta.env.VITE_LANDING_VIDEO_URL as string) || LANDING_VIDEO_PLACEHOLDER || FALLBACK_LANDING;
