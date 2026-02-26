import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Custom pulsing user location marker (blue dot)
const userLocationIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;
    background:#4f46e5;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(79,70,229,0.25), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

// Custom room marker
const roomIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;
    background:#ef4444;
    border:2px solid white;
    border-radius:50%;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

// Handles map click
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
}

// Smoothly re-centers map when center prop changes
function MapCenter({ center, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Reverse geocode lat/lng → city name using Nominatim (OpenStreetMap, free, no key needed)
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    // Prefer city > town > village > county > state, in that priority
    return (
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      'Your Location'
    );
  } catch {
    return 'Your Location';
  }
}

const MapComponent = ({
  defaultCenter = { lat: 20.5937, lng: 78.9629 }, // India
  onLocationSelect = null,
  showRooms = true,
  rooms = [],
}) => {
  const [center, setCenter] = useState(defaultCenter);
  const [locationName, setLocationName] = useState('Detecting location...');
  const [locationLoading, setLocationLoading] = useState(true);

  // 🌐 On mount: auto-detect user's real location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName('Location unavailable');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter({ lat, lng });
        // Reverse geocode to get city name
        const city = await reverseGeocode(lat, lng);
        setLocationName(city);
        setLocationLoading(false);
      },
      (err) => {
        // Permission denied or unavailable — stay on India default
        setLocationName('India (default)');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // If rooms change, re-center to first valid room
  useEffect(() => {
    if (showRooms && rooms.length > 0) {
      const first = rooms.find(r => r.location && typeof r.location.latitude === 'number');
      if (first) {
        setCenter({ lat: first.location.latitude, lng: first.location.longitude });
      }
    }
  }, [rooms, showRooms]);

  const handleLocationSelect = async (newCenter) => {
    setCenter(newCenter);
    const city = await reverseGeocode(newCenter.lat, newCenter.lng);
    setLocationName(city);
    if (onLocationSelect) onLocationSelect({ ...newCenter, cityName: city });
  };

  return (
    <div className="relative w-full h-full">
      {/* Location Badge (top-left overlay) */}
      <div className="absolute top-3 left-12 z-[999] bg-white/90 backdrop-blur-sm border border-indigo-100 shadow-lg rounded-full px-4 py-1.5 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
        {locationLoading ? (
          <span className="text-gray-400 italic">Detecting location...</span>
        ) : (
          <span>📍 {locationName}</span>
        )}
      </div>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        {/* CartoDB Voyager — modern clean open-source tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <MapClickHandler onLocationSelect={handleLocationSelect} />
        <MapCenter center={center} />

        {/* User location marker */}
        <Marker position={[center.lat, center.lng]} icon={userLocationIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-bold text-indigo-700 text-sm">📍 {locationName}</p>
              <p className="text-xs text-gray-400 mt-0.5">Your current location</p>
            </div>
          </Popup>
        </Marker>

        {/* Room markers */}
        {rooms.map((room) => {
          if (!room.location || typeof room.location.latitude !== 'number') return null;
          const lat = room.location.latitude;
          const lng = room.location.longitude;
          return (
            <Marker key={room._id || room.id} position={[lat, lng]} icon={roomIcon}>
              <Popup className="custom-popup">
                <div className="w-56">
                  {room.coverImage && (
                    <img
                      src={room.coverImage}
                      alt={room.title}
                      className="w-full h-36 object-cover rounded-lg mb-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <h3 className="font-bold text-base mb-1 line-clamp-2 text-gray-900">{room.title}</h3>
                  <p className="text-gray-500 text-xs mb-2">
                    📍 {room.address?.city}, {room.address?.state}
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-indigo-600">₹{room.price}<span className="text-xs font-normal text-gray-400">/mo</span></span>
                    <span className="text-xs text-gray-500">{room.bedrooms} bed · {room.bathrooms} bath</span>
                  </div>
                  <a
                    href={`/room/${room._id}`}
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    View Details →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
