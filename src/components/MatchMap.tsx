/**
 * MatchMap — מציג מפת OpenStreetMap עם מיקום מטושטש של המנקה.
 * לפי חוק הפרטיות: לפני אישור הזמנה מסומן אזור כללי בלבד (רדיוס 500 מ').
 */
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MatchMapProps {
  lat: number;
  lng: number;
  label: string;
}

const MatchMap = ({ lat, lng, label }: MatchMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // הזזה קלה (±~300 מ') כדי לא לחשוף מיקום מדויק
    const jitter = () => (Math.random() - 0.5) * 0.006;
    const blurredLat = lat + jitter();
    const blurredLng = lng + jitter();

    const map = L.map(containerRef.current, {
      center: [blurredLat, blurredLng],
      zoom: 15,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // עיגול אזור משוער — לא סיכה מדויקת
    L.circle([blurredLat, blurredLng], {
      radius: 400,
      color: "#e8356d",
      fillColor: "#e8356d",
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map).bindTooltip(`אזור ${label}`, { permanent: false, direction: "top" });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, label]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      <div ref={containerRef} className="h-44 w-full" />
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
        📍 מיקום משוער · לפרטים מלאים — אחרי הזמנה
      </div>
    </div>
  );
};

export default MatchMap;
