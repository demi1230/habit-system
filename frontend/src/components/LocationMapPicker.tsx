import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { motion } from 'motion/react';
import { MapPin, Crosshair, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationMapPickerProps {
  accentColor: string;
  btnColor: string;
  onConfirm: (location: { lat: number; lng: number; label: string }) => void;
  onClose: () => void;
}

function ClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
}

export function LocationMapPicker({ accentColor, btnColor, onConfirm, onClose }: LocationMapPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState<[number, number]>([47.9184, 106.9177]); // UB default
  const [mapReady, setMapReady] = useState(false);

  // Try to get user's current location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          setMapReady(true);
        },
        () => setMapReady(true),
        { timeout: 5000 }
      );
    } else {
      setMapReady(true);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=mn`,
        { headers: { 'User-Agent': 'HabitSystemApp/1.0' } }
      );
      const data = await res.json();
      const addr = data.address;
      // Build a short label
      const parts = [addr?.road, addr?.suburb, addr?.city_district, addr?.city].filter(Boolean);
      setLabel(parts.slice(0, 2).join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch {
      setLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
    setLoading(false);
  }, []);

  const handleMapClick = useCallback((latlng: LatLng) => {
    setPosition({ lat: latlng.lat, lng: latlng.lng });
    reverseGeocode(latlng.lat, latlng.lng);
  }, [reverseGeocode]);

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          setCenter([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        },
        () => setLoading(false),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  if (!mapReady) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: `${accentColor} transparent transparent transparent` }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-3">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden relative" style={{ height: 220, border: '1px solid rgba(0,0,0,0.08)' }}>
          <MapContainer
            center={center} zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler onClick={handleMapClick} />
            {position && <Marker position={[position.lat, position.lng]} icon={markerIcon} />}
          </MapContainer>

          {/* Current location button */}
          <button
            onClick={handleUseCurrentLocation}
            className="absolute bottom-3 right-3 z-[1000] w-9 h-9 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
          >
            <Crosshair className="w-4 h-4" style={{ color: accentColor }} />
          </button>
        </div>

        {/* Selected location info */}
        {position && (
          <div className="mt-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
            <p className="text-foreground flex-1 truncate" style={{ fontSize: 12, fontWeight: 500 }}>
              {loading ? 'Хайж байна...' : label}
            </p>
            <button onClick={() => { setPosition(null); setLabel(''); }}
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Confirm / hints */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-muted-foreground" style={{ fontSize: 11 }}>
            {position ? '' : 'Газрын зурагт дарж байршил сонгоно уу'}
          </p>
          {position && label && !loading && (
            <motion.button whileTap={{ scale: 0.95 }}
              onClick={() => onConfirm({ lat: position.lat, lng: position.lng, label })}
              className="px-4 py-1.5 rounded-full"
              style={{ fontSize: 12, fontWeight: 600, color: accentColor, backgroundColor: btnColor }}>
              Сонгох
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
