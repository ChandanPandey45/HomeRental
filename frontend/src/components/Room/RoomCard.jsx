import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';

const RoomCard = ({ room, featured = false }) => {
  return (
    <Link to={`/room/${room.id || room._id}`} className="group block h-full">
      <div className={`bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border ${featured ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-gray-100 hover:border-gray-200'} transform group-hover:-translate-y-2 relative`}>

        {/* ── IMAGE SECTION ── */}
        <div className="relative h-64 overflow-hidden shrink-0">
          <img
            src={room.coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90"></div>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              {featured && (
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg backdrop-blur-sm self-start">
                  Featured
                </span>
              )}
              {room.availability ? (
                <span className="bg-green-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm flex items-center gap-1 self-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Available
                </span>
              ) : (
                <span className="bg-red-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm self-start">
                  Rented
                </span>
              )}
            </div>

            {room.ratings && room.ratings.totalReviews > 0 && (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-lg">
                <FaStar className="text-yellow-400" size={12} />
                <span className="text-xs font-bold">{room.ratings.averageRating?.toFixed(1) || '5.0'}</span>
              </div>
            )}
          </div>

          {/* Bottom Price & Location (Over Image) */}
          <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="mb-1 flex items-end gap-1">
              <span className="text-3xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">₹{room.price}</span>
              <span className="text-xs font-medium text-gray-300 mb-0.5">/ mo</span>
            </div>
            <div className="flex items-center text-sm font-medium text-gray-200">
              <FaMapMarkerAlt className="mr-1.5 text-indigo-400 flex-shrink-0" size={13} />
              <span className="truncate drop-shadow-md">
                {room.address?.city || 'Unknown City'}, {room.address?.state || ''}
              </span>
            </div>
          </div>
        </div>

        {/* ── CONTENT SECTION ── */}
        <div className="p-5 flex flex-col flex-grow bg-white relative z-10">

          <h3 className="text-lg font-extrabold text-gray-900 line-clamp-2 mb-4 group-hover:text-indigo-600 transition-colors leading-snug">
            {room.title}
          </h3>

          {/* Specs Bar */}
          <div className="flex items-center gap-4 text-gray-600 text-sm mb-5 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
            <div className="flex items-center gap-2 font-semibold" title="Bedrooms">
              <div className="p-1.5 bg-indigo-100/80 rounded-lg text-indigo-600">
                <FaBed size={14} />
              </div>
              {room.bedrooms} Space
            </div>

            <div className="w-[1px] h-6 bg-gray-200"></div>

            <div className="flex items-center gap-2 font-semibold" title="Bathrooms">
              <div className="p-1.5 bg-teal-100/80 rounded-lg text-teal-600">
                <FaBath size={14} />
              </div>
              {room.bathrooms} Bath
            </div>

            {room.squareFeet && (
              <>
                <div className="w-[1px] h-6 bg-gray-200"></div>
                <div className="flex items-center gap-2 font-semibold" title="Square Feet">
                  <div className="p-1.5 bg-purple-100/80 rounded-lg text-purple-600">
                    <FaRulerCombined size={12} />
                  </div>
                  {room.squareFeet} ft²
                </div>
              </>
            )}
          </div>

          <div className="mt-auto">
            {/* Amenities Preview */}
            <div className="flex flex-wrap gap-2 mb-5">
              {room.amenities && room.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="text-[10px] font-bold tracking-wide uppercase bg-gray-50 border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities && room.amenities.length > 3 && (
                <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-400 px-3 py-1.5 rounded-lg">
                  +{room.amenities.length - 3}
                </span>
              )}
            </div>

            {/* Action Row */}
            {/* <div className="pt-4 border-t border-gray-100/80 flex items-center justify-between"> */}
            <div className="w-full bg-gray-900 group-hover:bg-indigo-600 text-white text-center py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-gray-900/20 group-hover:shadow-indigo-600/30">
              View Details
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            {/* </div> */}
          </div>

        </div>
      </div>
    </Link>
  );
};

export default RoomCard;

