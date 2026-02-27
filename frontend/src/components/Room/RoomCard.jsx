import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';

const RoomCard = ({ room, featured = false, onHoverStart, onHoverEnd }) => {
  return (
    <Link
      to={`/room/${room.id || room._id}`}
      className="group block h-full"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div className={`bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border ${featured ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-gray-200'} transform group-hover:-translate-y-2 relative`}>

        {/* ── IMAGE SECTION ── */}
        <div className="relative h-56 overflow-hidden shrink-0">
          <img
            src={room.coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex flex-col gap-1.5">
              {featured && (
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg self-start">
                  Featured
                </span>
              )}
              {room.availability ? (
                <span className="bg-green-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm flex items-center gap-1 self-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Available
                </span>
              ) : (
                <span className="bg-red-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm self-start">
                  Rented
                </span>
              )}
            </div>
            {room.ratings && room.ratings.totalReviews > 0 && (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-lg">
                <FaStar className="text-yellow-400" size={11} />
                <span className="text-xs font-bold">{room.ratings.averageRating?.toFixed(1) || '5.0'}</span>
              </div>
            )}
          </div>

          {/* Price & Location overlay */}
          <div className="absolute bottom-3 left-3 right-3 text-white transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex items-end gap-1 mb-0.5">
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">₹{room.price}</span>
              <span className="text-xs text-gray-300 mb-0.5">/ mo</span>
            </div>
            <div className="flex items-center text-xs font-medium text-gray-200">
              <FaMapMarkerAlt className="mr-1 text-indigo-400 flex-shrink-0" size={11} />
              <span className="truncate">{room.address?.city || 'Unknown City'}{room.address?.state ? `, ${room.address.state}` : ''}</span>
            </div>
          </div>
        </div>

        {/* ── CONTENT SECTION ── */}
        <div className="p-4 flex flex-col flex-grow bg-white">

          <h3 className="text-base font-extrabold text-gray-900 line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors leading-snug">
            {room.title}
          </h3>

          {/* Specs Bar */}
          <div className="flex items-center gap-3 text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-1.5 font-semibold">
              <div className="p-1 bg-indigo-100 rounded-lg text-indigo-600"><FaBed size={13} /></div>
              {room.bedrooms} Bed
            </div>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-1.5 font-semibold">
              <div className="p-1 bg-teal-100 rounded-lg text-teal-600"><FaBath size={13} /></div>
              {room.bathrooms} Bath
            </div>
            {room.squareFeet && (
              <>
                <div className="w-px h-5 bg-gray-200" />
                <div className="flex items-center gap-1.5 font-semibold">
                  <div className="p-1 bg-purple-100 rounded-lg text-purple-600"><FaRulerCombined size={11} /></div>
                  {room.squareFeet} ft²
                </div>
              </>
            )}
          </div>

          <div className="mt-auto">
            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {room.amenities.slice(0, 3).map((amenity, i) => (
                  <span key={i} className="text-[10px] font-bold tracking-wide uppercase bg-gray-50 border border-gray-200 text-gray-500 px-2.5 py-1 rounded-lg">
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 3 && (
                  <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-400 px-2.5 py-1 rounded-lg">
                    +{room.amenities.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* CTA Button */}
            <div className="w-full bg-gray-900 group-hover:bg-indigo-600 text-white text-center py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-gray-900/20 group-hover:shadow-indigo-600/30">
              View Details
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
