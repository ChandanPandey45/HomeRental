import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaHeart, FaGithub, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-gray-400 mt-auto">
            <div className="w-full px-4 sm:px-8 lg:px-12 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link to="/" className="inline-flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <FaHome className="text-white text-sm" />
                            </div>
                            <span className="font-extrabold text-xl text-white tracking-tight">
                                Room<span className="text-indigo-400">Finder</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                            The premium marketplace for discovering and listing beautiful rental rooms. Find your perfect space or earn from yours.
                        </p>
                        <div className="flex items-center gap-3 mt-5">
                            {[FaTwitter, FaFacebook, FaInstagram, FaGithub].map((Icon, i) => (
                                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-indigo-600 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5">
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Discover</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/" className="hover:text-indigo-400 transition-colors">Browse Rooms</Link></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Map Search</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">New Listings</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Owners</h4>
                        <ul className="space-y-2.5 text-sm">
                            <li><Link to="/register" className="hover:text-indigo-400 transition-colors">List Your Room</Link></li>
                            <li><Link to="/my-rooms" className="hover:text-indigo-400 transition-colors">My Listings</Link></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Owner Guide</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} RoomFinder. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                        Made with <FaHeart className="text-red-500 mx-1" size={10} /> for renters and owners everywhere.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
