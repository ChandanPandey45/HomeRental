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

// Reverse geocode lat/lng → city name and full address using Nominatim (OpenStreetMap, free, no key needed)
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    // Prefer city > town > village > county > state, in that priority
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      addr.state_district ||
      addr.state ||
      'Your Location';

    return { city, address: addr, fullData: data };
  } catch {
    return { city: 'Your Location', address: {}, fullData: null };
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
        const geoData = await reverseGeocode(lat, lng);
        setLocationName(geoData.city);
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
    const geoData = await reverseGeocode(newCenter.lat, newCenter.lng);
    setLocationName(geoData.city);
    if (onLocationSelect) onLocationSelect({ ...newCenter, ...geoData });
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
              <Popup className="custom-popup p-0 border-0 rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-56 h-64 relative group cursor-pointer" onClick={() => window.location.href = `/room/${room.id || room._id}`}>

                  {/* Background Image & Overlay */}
                  <div className="absolute inset-0 bg-gray-200">
                    <img
                      src={room.coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&q=80'}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/50 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100"></div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    {room.availability ? (
                      <span className="bg-green-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase shadow-sm flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span> Available
                      </span>
                    ) : (
                      <span className="bg-red-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase shadow-sm">
                        Rented
                      </span>
                    )}

                    {room.ratings && room.ratings.totalReviews > 0 && (
                      <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <span className="text-[10px]">⭐</span>
                        <span className="text-[10px] font-bold">{room.ratings.averageRating?.toFixed(1) || '5.0'}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-3 left-3 right-3 text-white z-10 flex flex-col justify-end h-full pointer-events-none">
                    <div className="mb-2">
                      <h3 className="text-sm font-extrabold line-clamp-2 leading-tight drop-shadow-md mb-1">{room.title}</h3>
                      <p className="text-[10px] text-gray-300 flex items-center truncate drop-shadow-sm">
                        📍 {room.address?.city || 'Unknown'}, {room.address?.state || ''}
                      </p>
                    </div>

                    <div className="flex items-end justify-between border-t border-white/20 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-300 uppercase tracking-widest font-semibold mb-0.5">Rent</span>
                        <span className="text-lg font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
                          ₹{room.price}
                        </span>
                      </div>
                      <div className="text-[10px] font-medium text-gray-300 flex gap-1.5 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">
                        <span>{room.bedrooms} 🛏️</span>
                        <span className="w-px h-3 bg-white/30 self-center"></span>
                        <span>{room.bathrooms} 🚿</span>
                      </div>
                    </div>
                  </div>
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
