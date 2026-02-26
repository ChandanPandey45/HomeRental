import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaPlus, FaTh, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaBars, FaTimes, FaUser } from 'react-icons/fa';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive(path)
            ? 'bg-indigo-600 text-white shadow-md'
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
        }`;

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-10">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-indigo-300 transition-shadow">
                            <FaHome className="text-white text-sm" />
                        </div>
                        <span className="font-extrabold text-xl text-gray-900 tracking-tight">
                            Room<span className="text-indigo-600">Finder</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/" className={navLinkClass('/')}>
                            <FaHome size={13} /> Browse Rooms
                        </Link>

                        {isAuthenticated && user?.role === 'roomOwner' && (
                            <>
                                <Link to="/my-rooms" className={navLinkClass('/my-rooms')}>
                                    <FaTh size={13} /> My Listings
                                </Link>
                                <Link to="/create-room" className={navLinkClass('/create-room')}>
                                    <FaPlus size={13} /> New Listing
                                </Link>
                            </>
                        )}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow">
                                        {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 hidden lg:block">
                                        {user?.firstName || 'User'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <FaSignOutAlt size={13} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200">
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                >
                                    <FaSignInAlt size={13} /> Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                >
                                    <FaUserPlus size={13} /> Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1 shadow-lg">
                    <Link to="/" className={`block ${navLinkClass('/')}`} onClick={() => setMobileOpen(false)}>
                        <FaHome size={13} /> Browse Rooms
                    </Link>

                    {isAuthenticated && user?.role === 'roomOwner' && (
                        <>
                            <Link to="/my-rooms" className={`block ${navLinkClass('/my-rooms')}`} onClick={() => setMobileOpen(false)}>
                                <FaTh size={13} /> My Listings
                            </Link>
                            <Link to="/create-room" className={`block ${navLinkClass('/create-room')}`} onClick={() => setMobileOpen(false)}>
                                <FaPlus size={13} /> New Listing
                            </Link>
                        </>
                    )}

                    <div className="pt-3 mt-3 border-t border-gray-100">
                        {isAuthenticated ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 px-2 py-2">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow">
                                        {(user?.firstName?.[0] || 'U').toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <FaSignOutAlt size={13} /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    to="/login"
                                    className="block w-full text-center px-4 py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="block w-full text-center px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
