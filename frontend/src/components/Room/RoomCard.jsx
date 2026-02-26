import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';

const RoomCard = ({ room, featured = false }) => {
  return (
    <Link to={`/room/${room.id || room._id}`} className="group block h-full">
      <div className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border  ${featured ? 'border-indigo-400 ring-2 ring-indigo-100 ring-offset-2' : 'border-gray-100 hover:border-gray-200'} transform group-hover:-translate-y-1`}>

        {/* Image Container */}
        <div className="relative h-56 bg-gray-200 overflow-hidden shrink-0">
          {featured && (
            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-md">
              Featured
            </div>
          )}

          {/* Price Badge over image (Mobile friendly / quick glance) */}
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm font-bold text-gray-900">
            ${room.price} <span className="text-xs font-normal text-gray-500">/mo</span>
          </div>

          <img
            src={room.coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          />
          {/* Subtle gradient overlay to make text pop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Content Container */}
        <div className="p-5 flex flex-col flex-grow">

          {/* Title & Rating */}
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {room.title}
            </h3>
            {room.ratings && room.ratings.totalReviews > 0 && (
              <div className="flex items-center shrink-0 bg-yellow-50 px-2 py-1 rounded-md">
                <FaStar className="text-yellow-500 mr-1" size={12} />
                <span className="text-xs font-bold text-yellow-700">{room.ratings.averageRating?.toFixed(1) || '5.0'}</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <FaMapMarkerAlt className="mr-1.5 text-indigo-400 shrink-0" size={14} />
            <span className="truncate">
              {room.address?.city || 'Unknown City'}, {room.address?.state || 'N/A'}
            </span>
          </div>

          {/* Room Specs */}
          <div className="flex items-center gap-4 text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-xl">
            <div className="flex items-center font-medium" title="Bedrooms">
              <FaBed className="mr-2 text-indigo-400" size={16} />
              <span>{room.bedrooms}</span>
            </div>
            {/* Divider */}
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center font-medium" title="Bathrooms">
              <FaBath className="mr-2 text-teal-400" size={16} />
              <span>{room.bathrooms}</span>
            </div>
            {/* Divider */}
            {room.squareFeet && (
              <>
                <div className="w-px h-4 bg-gray-300"></div>
                <div className="flex items-center font-medium" title="Square Feet">
                  <FaRulerCombined className="mr-2 text-purple-400" size={14} />
                  <span>{room.squareFeet} sqft</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-auto">
            {/* Amenities Preview */}
            <div className="flex flex-wrap gap-2 mb-4">
              {room.amenities && room.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="text-[11px] font-medium bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full shadow-sm"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities && room.amenities.length > 3 && (
                <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  +{room.amenities.length - 3} more
                </span>
              )}
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-400 font-medium">
                {room.availability ? (
                  <span className="text-green-600 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span> Available</span>
                ) : (
                  <span className="text-red-500 flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> Rented</span>
                )}
              </div>
              <span className="text-indigo-600 font-semibold text-sm group-hover:text-indigo-700 flex items-center transition-colors hover:underline">
                View details
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
