import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MarkerPoint {
  user_id: string;
  display_name: string;
  city: string | null;
  hourly_rate: number | null;
  avatar_url: string | null;
  latitude: number;
  longitude: number;
}

interface Props {
  center: [number, number];
  markers: MarkerPoint[];
  onMarkerClick?: (id: string) => void;
}

const Recenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const buildAvatarIcon = (url: string | null, _name: string) => {
  const inner = url
    ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<img src="/cleaner-placeholder.svg" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  return L.divIcon({
    html: `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,hsl(340 82% 60%),hsl(200 95% 55%));border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.25);overflow:hidden;">${inner}</div>`,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const MapView = ({ center, markers, onMarkerClick }: Props) => {
  return (
    <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
      <Recenter center={center} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker
          key={m.user_id}
          position={[m.latitude, m.longitude]}
          icon={buildAvatarIcon(m.avatar_url, m.display_name)}
          eventHandlers={{ click: () => onMarkerClick?.(m.user_id) }}
        >
          <Popup>
            <div className="rtl text-right">
              <strong>{m.display_name}</strong>
              {m.city && <div className="text-xs text-gray-500">{m.city}</div>}
              {m.hourly_rate && <div className="text-primary font-semibold">₪{m.hourly_rate}/שעה</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
