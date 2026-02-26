import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roomAPI } from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaHome } from 'react-icons/fa';
import { toast } from 'react-toastify';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getRoomsByOwner();
      setRooms(response.data.rooms || []);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) {
      return;
    }

    try {
      await roomAPI.deleteRoom(roomId);
      toast.success('Room listing deleted successfully');
      setRooms(rooms.filter(r => r._id !== roomId && r.id !== roomId));
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-indigo-800 font-semibold animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">

      {/* Premium Dashboard Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-8">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center text-sm font-medium text-indigo-600 mb-1 tracking-wide uppercase">
                <FaHome className="mr-2" /> Owner Portal
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user?.firstName || 'Owner'}</h1>
              <p className="text-gray-500 mt-1 max-w-xl">
                Manage your active listings securely. You have {rooms.length} active {rooms.length === 1 ? 'property' : 'properties'}.
              </p>
            </div>

            <Link
              to="/create-room"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <FaPlus className="mr-2" /> List New Room
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 mt-12">
        {rooms.length === 0 ? (
          /* Premium Empty State */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 lg:p-20 text-center flex flex-col items-center justify-center">
            <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border border-indigo-100">
              <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No active listings</h3>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
              Start generating income by adding your first property to our marketplace today.
            </p>
            <Link
              to="/create-room"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <FaPlus className="inline mr-2 mb-1" /> Create Your First Listing
            </Link>
          </div>
        ) : (
          /* Listed Rooms Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div
                key={room.id || room._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:border-indigo-200 group"
              >
                {/* Image Section */}
                <div className="relative h-56 bg-gray-200 overflow-hidden shrink-0">
                  <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wider shadow-md flex items-center">
                    <span className="w-2 h-2 rounded-full bg-white mr-1.5 animate-pulse"></span> Active
                  </div>

                  <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur px-4 py-2 rounded-xl shadow-lg font-bold text-gray-900 text-lg">
                    ${room.price} <span className="text-sm font-normal text-gray-500">/ mo</span>
                  </div>

                  <img
                    src={room.coverImage || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {room.title}
                  </h3>

                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <FaMapMarkerAlt className="mr-1.5 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {room.address?.street ? `${room.address.street}, ` : ''}{room.address?.city || 'Unknown'}, {room.address?.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 mb-6">
                    <div className="flex flex-col items-center justify-center p-1">
                      <FaBed className="text-gray-400 mb-1" size={18} />
                      <span className="text-xs font-semibold text-gray-700">{room.bedrooms} Beds</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1 border-x border-gray-200">
                      <FaBath className="text-gray-400 mb-1" size={18} />
                      <span className="text-xs font-semibold text-gray-700">{room.bathrooms} Baths</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-1">
                      <FaRulerCombined className="text-gray-400 mb-1" size={16} />
                      <span className="text-xs font-semibold text-gray-700">{room.squareFeet || '-'} sqft</span>
                    </div>
                  </div>

                  {/* Actions (pushed to bottom) */}
                  <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                    <Link
                      to={`/room/${room.id || room._id}`}
                      className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2.5 px-4 rounded-xl transition-colors"
                    >
                      <FaEdit /> Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteRoom(room.id || room._id)}
                      className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 px-4 rounded-xl transition-colors"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
