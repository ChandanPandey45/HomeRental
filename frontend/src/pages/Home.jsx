import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { roomAPI } from '../services/api';
import MapComponent from '../components/Map/MapComponent';
import RoomCard from '../components/Room/RoomCard';
import { FaSearch, FaMapMarkerAlt, FaDollarSign, FaBed, FaBath, FaMap, FaTimes, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);

  // Scroll-hide search card
  const [searchVisible, setSearchVisible] = useState(true);
  const lastScrollY = useRef(0);

  const [filterFormData, setFilterFormData] = useState({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 100) {
        setSearchVisible(true);
      } else if (currentY > lastScrollY.current + 6) {
        setSearchVisible(false);   // scrolling down
      } else if (currentY < lastScrollY.current - 6) {
        setSearchVisible(true);    // scrolling up
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchRooms = async (params = {}) => {
    try {
      setLoading(true);
      const response = await roomAPI.getAllRooms(params);
      setRooms(response.data.rooms || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    const params = {};
    if (filterFormData.keyword) params.keyword = filterFormData.keyword;
    if (filterFormData.minPrice) params.minPrice = filterFormData.minPrice;
    if (filterFormData.maxPrice) params.maxPrice = filterFormData.maxPrice;
    if (filterFormData.bedrooms) params.bedrooms = filterFormData.bedrooms;
    if (filterFormData.bathrooms) params.bathrooms = filterFormData.bathrooms;
    await fetchRooms(params);
  };

  const clearFilters = () => {
    setFilterFormData({ keyword: '', minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '' });
    fetchRooms({});
  };

  const hasActiveFilters = Object.values(filterFormData).some(v => v !== '');

  return (
    <div className="min-h-screen bg-[#f0f2f7] font-sans">

      {/* HERO SECTION */}
      <div
        className="relative w-full flex flex-col items-center justify-center text-white"
        style={{ minHeight: '440px', background: 'linear-gradient(135deg, #1a1a4e 0%, #2d3a8c 50%, #1e3a5f 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />

        <div className="relative z-10 text-center px-6 pt-16 pb-20 w-full">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-widest text-blue-200 px-4 py-1.5 rounded-full mb-5">
            🏠 Premium Room Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 leading-none">
            Find Your{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc)' }}>
              Perfect Room
            </span>
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto font-light mt-3">
            Discover verified rooms, compare prices, and move in — all in one place.
          </p>

          {/* STATS ROW */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {[['10K+', 'Rooms Listed'], ['5K+', 'Happy Tenants'], ['98%', 'Verified Owners']].map(([num, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{num}</p>
                <p className="text-xs text-blue-300 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SEARCH CARD (hides on scroll down, shows on scroll up) ── */}
      <div
        className={`sticky top-0 z-30 px-4 lg:px-10 transition-all duration-300 ease-in-out ${searchVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        style={{ marginTop: '-48px' }}
      >
        <form
          onSubmit={handleApplyFilters}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5"
        >
          {/* Row 1: 5 equal-proportion inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">

            {/* Location/Keyword */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">🏙 City or Place</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={13} />
                <input
                  type="text"
                  name="keyword"
                  value={filterFormData.keyword}
                  onChange={handleFilterChange}
                  placeholder="e.g. Mumbai..."
                  className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Min Price */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">💰 Min Price</label>
              <input type="number" name="minPrice" value={filterFormData.minPrice} onChange={handleFilterChange} placeholder="Min ₹" className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            </div>

            {/* Max Price */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">💰 Max Price</label>
              <input type="number" name="maxPrice" value={filterFormData.maxPrice} onChange={handleFilterChange} placeholder="Max ₹" className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            </div>

            {/* Beds */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">🛏 Bedrooms</label>
              <input type="number" name="bedrooms" value={filterFormData.bedrooms} onChange={handleFilterChange} placeholder="Any" min="0" className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            </div>

            {/* Baths */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">🚿 Bathrooms</label>
              <input type="number" name="bathrooms" value={filterFormData.bathrooms} onChange={handleFilterChange} placeholder="Any" min="0" className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            </div>
          </div>

          {/* Row 2: Search Button + Clear */}
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
            >
              <FaSearch size={14} /> Search Rooms
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-all"
              >
                <FaTimes size={12} /> Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────── */}
      <div className="w-full px-4 lg:px-10 pt-8">

        {/* Map toggle bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {loading ? 'Searching...' : `${rooms.length} Room${rooms.length !== 1 ? 's' : ''} Found`}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {hasActiveFilters ? 'Filtered results' : 'All available listings'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!searchVisible && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all"
                title="Back to search"
              >
                <FaChevronUp size={12} /> Search
              </button>
            )}
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${showMap
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                }`}
            >
              <FaMap size={13} /> {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>

        {/* ─── MAP ─── */}
        {showMap && (
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-6" style={{ height: '520px' }}>
            <MapComponent
              showRooms={true}
              rooms={rooms}
              hoveredRoomId={hoveredRoomId}
            />
          </div>
        )}

        {/* ─── ROOMS GRID ─── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin" />
            </div>
            <p className="text-gray-500 font-medium animate-pulse">Finding rooms for you...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-28 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-indigo-300 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No rooms found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">Try adjusting your search filters or browse all available listings.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md"
            >
              Show All Rooms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
            {rooms.map((room) => (
              <RoomCard
                key={room._id || room.id}
                room={room}
                onHoverStart={() => setHoveredRoomId(room._id || room.id)}
                onHoverEnd={() => setHoveredRoomId(null)}
              />
            ))}
          </div>
        )}

        {/* ─── CTA (unauthenticated only) ─── */}
        {!isAuthenticated && (
          <div className="mb-16 rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #3730a3 0%, #6d28d9 100%)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 py-14 px-8 text-center text-white">
              <h3 className="text-3xl md:text-4xl font-extrabold mb-3">Ready to List Your Room?</h3>
              <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of room owners earning from their spaces. Fast, safe, and free to get started.
              </p>
              <a
                href="/register"
                className="inline-block bg-white text-indigo-700 font-extrabold py-3.5 px-10 rounded-full hover:bg-indigo-50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 transform text-sm"
              >
                Get Started as an Owner →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
