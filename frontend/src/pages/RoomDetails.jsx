import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomAPI, authAPI, uploadAPI } from '../services/api';
import {
    FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt,
    FaEdit, FaTrash, FaArrowLeft, FaCheckCircle, FaTimes, FaSave,
    FaPhone, FaEnvelope, FaUser, FaCloudUploadAlt, FaChevronLeft, FaChevronRight, FaHome, FaMap
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import MapComponent from '../components/Map/MapComponent';

/* ─────────────────────────────────────────
   Contact Owner Modal
   ───────────────────────────────────────── */
const ContactOwnerModal = ({ ownerId, onClose }) => {
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOwner = async () => {
            try {
                const res = await authAPI.getUserById(ownerId);
                setOwnerInfo(res.data?.user || res.data);
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Could not load owner details');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        if (ownerId) fetchOwner();
    }, [ownerId]);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <FaUser className="text-white" size={16} />
                        </div>
                        <div>
                            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Contact Info</p>
                            <p className="text-white font-bold text-lg leading-tight">Owner Details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-gray-400 text-sm">Fetching owner details…</p>
                        </div>
                    ) : ownerInfo ? (
                        <div className="space-y-4">
                            {/* Avatar + Name */}
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                                    {(ownerInfo.firstName?.[0] || ownerInfo.displayName?.[0] || '?').toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {ownerInfo.firstName && ownerInfo.lastName
                                            ? `${ownerInfo.firstName} ${ownerInfo.lastName}`
                                            : ownerInfo.displayName || 'Room Owner'}
                                    </p>
                                    <p className="text-indigo-600 text-xs font-semibold bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                        🔑 Property Owner
                                    </p>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-3">
                                {ownerInfo.email && (
                                    <a
                                        href={`mailto:${ownerInfo.email}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group"
                                    >
                                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-indigo-700 transition-colors">
                                            <FaEnvelope className="text-white" size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</p>
                                            <p className="text-gray-800 font-semibold text-sm truncate">{ownerInfo.email}</p>
                                        </div>
                                    </a>
                                )}
                                {
                                    (() => {
                                        const addr = ownerInfo.address;
                                        const formatted = addr
                                            ? [addr.city, addr.state, addr.country]
                                                .filter(Boolean).join(', ')
                                            : '';
                                        return formatted ? (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                                <div className="w-9 h-9 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FaHome className="text-white" size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Address</p>
                                                    <p className="text-gray-700 text-sm">{formatted}</p>
                                                </div>
                                            </div>
                                        ) : null;
                                    })()
                                }
                                {ownerInfo.phone ? (
                                    <a
                                        href={`tel:${ownerInfo.phone}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
                                    >
                                        <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-green-700 transition-colors">
                                            <FaPhone className="text-white" size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Phone</p>
                                            <p className="text-gray-800 font-semibold text-sm">{ownerInfo.phone}</p>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                        <div className="w-9 h-9 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FaPhone className="text-white" size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Phone</p>
                                            <p className="text-gray-400 text-sm italic">Not provided</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {ownerInfo.bio && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">About</p>
                                    <p className="text-gray-600 text-sm leading-relaxed">{ownerInfo.bio}</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const ImageGallery = ({ coverImage, images = [] }) => {
    const allImages = [
        coverImage,
        ...images.filter((url) => url && url !== coverImage)
    ].filter(Boolean);

    const [current, setCurrent] = useState(0);

    if (allImages.length === 0) {
        return (
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-200" style={{ height: '400px' }}>
                <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
                    alt="placeholder"
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    const prev = () => setCurrent((c) => (c - 1 + allImages.length) % allImages.length);
    const next = () => setCurrent((c) => (c + 1) % allImages.length);

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-200" style={{ height: '400px' }}>
                <img key={current} src={allImages[current]} alt={`Photo ${current + 1}`} className="w-full h-full object-cover" />
                {allImages.length > 1 && (
                    <>
                        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all">
                            <FaChevronLeft size={14} />
                        </button>
                        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all">
                            <FaChevronRight size={14} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {allImages.map((_, i) => (
                                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`} />
                            ))}
                        </div>
                    </>
                )}
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${current === 0 ? 'hidden' : 'hidden'}`} />
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((url, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === current ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <img src={url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    // Edit mode
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({});

    const [uploadingImages, setUploadingImages] = useState(false);
    const editFileRef = useRef(null);

    // Contact owner modal
    const [showContactModal, setShowContactModal] = useState(false);

    // Safely convert a Firestore Timestamp / Date / ISO string → 'YYYY-MM-DD' string
    const toDateStr = (val) => {
        if (!val) return '';
        // Firestore Timestamp object: { seconds, nanoseconds }
        if (val?.seconds) return new Date(val.seconds * 1000).toISOString().substring(0, 10);
        // JS Date object
        if (val instanceof Date) return val.toISOString().substring(0, 10);
        // already a string
        return String(val).substring(0, 10);
    };

    useEffect(() => { fetchRoom(); }, [id]);

    // Recalculate isOwner whenever room OR user resolves (fixes auth race condition)
    useEffect(() => {
        if (!room || !user) return;
        const ownerId = room?.owner?._id || room?.owner?.id || room?.ownerId || room?.owner;
        const myId = user?.uid || user?.id || user?._id;
        setIsOwner(
            isAuthenticated &&
            (user?.role === 'roomOwner' || user?.role === 'admin') &&
            !!myId &&
            String(ownerId) === String(myId)
        );
    }, [room, user, isAuthenticated]);

    const fetchRoom = async () => {
        try {
            setLoading(true);
            const res = await roomAPI.getRoomById(id);
            const r = res.data?.room || res.data;
            setRoom(r);
            // Normalize Firestore Timestamp fields so they're plain strings in editData
            setEditData({
                ...r,
                availableFrom: toDateStr(r.availableFrom),
                availableUntil: toDateStr(r.availableUntil),
                amenities: Array.isArray(r.amenities) ? r.amenities : [],
                images: Array.isArray(r.images) ? r.images : [],
                rules: r.rules || {},
            });
            // isOwner is computed reactively in its own useEffect below
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to load room details';
            toast.error(msg);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (field, value) => setEditData((prev) => ({ ...prev, [field]: value }));
    const handleAddressChange = (field, value) => setEditData((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));

    const handleSave = async () => {
        try {
            setSaving(true);
            await roomAPI.updateRoom(id, editData);
            setRoom(editData);
            setEditMode(false);
            toast.success('Room updated successfully! ✅');
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to save changes';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
        try {
            await roomAPI.deleteRoom(id);
            toast.success('Room deleted successfully');
            navigate('/my-rooms');
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to delete room';
            toast.error(msg);
        }
    };

    const toggleAmenity = (amenity) => {
        const current = editData.amenities || [];
        setEditData((prev) => ({
            ...prev,
            amenities: current.includes(amenity)
                ? current.filter((a) => a !== amenity)
                : [...current, amenity]
        }));
    };

    const handleEditFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploadingImages(true);
        const newUrls = [];
        for (const file of files) {
            try {
                const res = await uploadAPI.uploadRoomImage(file);
                newUrls.push(res.data.imageUrl);
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || `Failed to upload ${file.name}`;
                toast.error(msg);
            }
        }
        if (newUrls.length) {
            setEditData((prev) => {
                const currentImages = Array.isArray(prev.images) ? prev.images : [];
                const merged = [...currentImages, ...newUrls];
                return {
                    ...prev,
                    images: merged,
                    coverImage: prev.coverImage || merged[0]
                };
            });
            toast.success(`${newUrls.length} image(s) uploaded`);
        }
        setUploadingImages(false);
        e.target.value = '';
    };

    const removeEditImage = (url) => {
        setEditData((prev) => {
            const updated = (prev.images || []).filter((u) => u !== url);
            return {
                ...prev,
                images: updated,
                coverImage: prev.coverImage === url ? (updated[0] || '') : prev.coverImage
            };
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Loading room details...</p>
                </div>
            </div>
        );
    }

    if (!room) return null;

    const allAmenities = ['WiFi', 'Parking', 'Air Conditioning', 'Heating', 'Kitchen',
        'Washer', 'Dryer', 'Dishwasher', 'Gym', 'Pool', 'Patio',
        'Balcony', 'Furnace', 'TV Cable', 'Pet Friendly',
        'Security System', 'Elevator', 'Doorman'];

    const ownerId = room?.owner?._id || room?.owner?.id || room?.ownerId || room?.owner;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* Contact Owner Modal */}
            {showContactModal && (
                <ContactOwnerModal ownerId={ownerId} onClose={() => setShowContactModal(false)} />
            )}

            {isOwner && (
                <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
                    <div className="px-6 lg:px-12 py-3 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-2 font-bold text-sm">
                            🔑 <span>Owner View</span>
                            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full ml-1">Your Listing</span>
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                            {editMode ? (
                                <>
                                    <button
                                        onClick={() => { setEditMode(false); setEditData(room); }}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all"
                                    >
                                        <FaTimes size={12} /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-5 py-1.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-60"
                                    >
                                        <FaSave size={12} /> {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-semibold transition-all border border-white/30"
                                    >
                                        <FaEdit size={12} /> Edit Listing
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500/80 hover:bg-red-600 rounded-xl text-sm font-semibold transition-all"
                                    >
                                        <FaTrash size={12} /> Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="px-6 lg:px-12 py-5 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium text-sm">
                    <FaArrowLeft size={13} /> Back
                </button>
                {isOwner && !editMode && (
                    <Link to="/my-rooms" className="text-sm text-indigo-600 hover:underline font-medium ml-auto">← My Listings</Link>
                )}
            </div>

            <div className="px-6 lg:px-12 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">

                    {editMode ? (
                        /* ── Edit mode image manager ── */
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
                                <FaCloudUploadAlt className="text-indigo-500" /> Manage Photos
                            </h3>

                            {/* Current images */}
                            {(editData.images || []).length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                                    {(editData.images || []).map((url, idx) => (
                                        <div key={idx} className={`relative rounded-xl overflow-hidden border-2 ${url === editData.coverImage ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}>
                                            <img src={url} alt="" className="w-full h-24 object-cover" />
                                            {url === editData.coverImage && (
                                                <span className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[10px] font-bold text-center py-0.5">COVER</span>
                                            )}
                                            <div className="absolute top-1 right-1 flex flex-col gap-1">
                                                {url !== editData.coverImage && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditData((prev) => ({ ...prev, coverImage: url }))}
                                                        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-bold transition-all"
                                                        title="Set as cover"
                                                    >
                                                        ★
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeEditImage(url)}
                                                    className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-all"
                                                >
                                                    <FaTimes size={8} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div
                                onClick={() => !uploadingImages && editFileRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${uploadingImages ? 'border-indigo-300 bg-indigo-50 cursor-not-allowed' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                            >
                                <input ref={editFileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleEditFileChange} disabled={uploadingImages} />
                                {uploadingImages ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                        <p className="text-sm text-indigo-600 font-medium">Uploading…</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 text-gray-500">
                                        <FaCloudUploadAlt size={20} />
                                        <span className="text-sm font-medium">Add more images from device</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <ImageGallery coverImage={room.coverImage} images={room.images || []} />
                            <div className="absolute top-4 left-4 z-10">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${room.availability ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {room.availability ? '✓ Available' : '✗ Rented'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Room Title</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editData.title || ''}
                                    onChange={(e) => handleEditChange('title', e.target.value)}
                                    className="w-full text-2xl font-extrabold text-gray-900 border-2 border-indigo-300 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 bg-indigo-50/50"
                                />
                            ) : (
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{room.title}</h1>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                            <FaMapMarkerAlt className="text-indigo-500" />
                            {editMode ? (
                                <div className="flex gap-2 flex-wrap flex-1">
                                    {['street', 'city', 'state', 'country'].map((f) => (
                                        <input key={f} type="text" value={editData.address?.[f] || ''} onChange={(e) => handleAddressChange(f, e.target.value)}
                                            placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                                            className="flex-1 min-w-24 px-3 py-1.5 border-2 border-indigo-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 bg-indigo-50/50" />
                                    ))}
                                </div>
                            ) : (
                                <span>{[room.address?.street, room.address?.city, room.address?.state, room.address?.country].filter(Boolean).join(', ')}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                                { label: 'Bedrooms', field: 'bedrooms', icon: <FaBed className="text-indigo-400 mb-1" size={20} /> },
                                { label: 'Bathrooms', field: 'bathrooms', icon: <FaBath className="text-teal-400 mb-1" size={20} /> },
                                { label: 'Sq. Feet', field: 'squareFeet', icon: <FaRulerCombined className="text-purple-400 mb-1" size={18} /> },
                            ].map(({ label, field, icon }) => (
                                <div key={field} className="bg-gray-50 rounded-xl p-4 text-center">
                                    {icon}
                                    {editMode ? (
                                        <input type="number" value={editData[field] || ''} onChange={(e) => handleEditChange(field, e.target.value)}
                                            className="w-full text-center text-lg font-bold text-gray-900 border border-indigo-300 rounded-lg py-1 focus:outline-none focus:border-indigo-500 bg-white" />
                                    ) : (
                                        <p className="text-xl font-bold text-gray-900">{room[field] || '—'}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                            {editMode ? (
                                <textarea rows={4} value={editData.description || ''} onChange={(e) => handleEditChange('description', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-indigo-500 bg-indigo-50/50 resize-none" />
                            ) : (
                                <p className="text-gray-600 leading-relaxed text-sm">{room.description || 'No description provided.'}</p>
                            )}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Amenities</h3>
                        {editMode ? (
                            <div className="flex flex-wrap gap-2">
                                {allAmenities.map((a) => {
                                    const active = (editData.amenities || []).includes(a);
                                    return (
                                        <button key={a} type="button" onClick={() => toggleAmenity(a)}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                                            {active ? <FaCheckCircle size={12} /> : <FaTimes size={12} className="opacity-40" />} {a}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {(room.amenities || []).length === 0 ? (
                                    <p className="text-gray-400 text-sm">No amenities listed</p>
                                ) : (
                                    room.amenities.map((a, i) => (
                                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-sm font-medium">
                                            <FaCheckCircle size={11} className="text-indigo-500" /> {a}
                                        </span>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-5">

                    {/* Location Map */}
                    {!editMode && room.location && typeof room.location.latitude === 'number' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                                <FaMap className="text-indigo-500" size={14} />
                                <span className="font-bold text-gray-800 text-sm">Location</span>
                                <span className="ml-auto text-xs text-gray-400 font-medium">
                                    {[room.address?.city, room.address?.state].filter(Boolean).join(', ')}
                                </span>
                            </div>
                            <div style={{ height: '260px' }}>
                                <MapComponent
                                    defaultCenter={{ lat: room.location.latitude, lng: room.location.longitude }}
                                    rooms={[room]}
                                    showRooms={true}
                                    hoveredRoomId={room._id || room.id}
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20">
                        <div className="flex items-end gap-2 mb-1">
                            {editMode ? (
                                <div className="w-full">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Monthly Rent (₹)</label>
                                    <input
                                        type="number"
                                        value={editData.price || ''}
                                        onChange={(e) => handleEditChange('price', e.target.value)}
                                        className="w-full text-3xl font-black text-indigo-700 border-2 border-indigo-300 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 bg-indigo-50/50"
                                    />
                                </div>
                            ) : (
                                <>
                                    <span className="text-4xl font-black text-indigo-700">₹{room.price?.toLocaleString()}</span>
                                    <span className="text-gray-400 font-medium mb-1">/month</span>
                                </>
                            )}
                        </div>

                        {!editMode && <p className="text-xs text-gray-400 mb-5">Utilities may be extra</p>}

                        {editMode && (
                            <div className="mt-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Available From</label>
                                <input type="date" value={toDateStr(editData.availableFrom)}
                                    onChange={(e) => handleEditChange('availableFrom', e.target.value)}
                                    className="w-full px-3 py-2.5 border-2 border-indigo-300 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-indigo-50/50" />
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-5 mt-4">
                            {isOwner ? (
                                /* OWNER PANEL */
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-800 text-sm">🔑 Manage Your Listing</h4>
                                    <div className="bg-indigo-50 rounded-xl p-3 text-sm text-indigo-700 border border-indigo-200">
                                        <p className="font-semibold mb-1">Status</p>
                                        {editMode ? (
                                            <select value={editData.availability ? 'true' : 'false'}
                                                onChange={(e) => handleEditChange('availability', e.target.value === 'true')}
                                                className="w-full px-2 py-1.5 rounded-lg border border-indigo-300 bg-white text-sm font-medium focus:outline-none">
                                                <option value="true">✅ Available for Rent</option>
                                                <option value="false">❌ Mark as Rented</option>
                                            </select>
                                        ) : (
                                            <span className={`font-bold ${room.availability ? 'text-green-600' : 'text-red-500'}`}>
                                                {room.availability ? '✅ Available for rent' : '❌ Currently rented out'}
                                            </span>
                                        )}
                                    </div>
                                    {!editMode && (
                                        <>
                                            <button onClick={() => setEditMode(true)}
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md">
                                                <FaEdit /> Edit This Listing
                                            </button>
                                            <Link to="/my-rooms"
                                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all">
                                                View All My Listings
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* TENANT PANEL */
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-800">Interested in this room?</h4>
                                    <div className="text-sm text-gray-600 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <FaCheckCircle className="text-green-500" size={14} />
                                            <span>Verified listing</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaCheckCircle className="text-green-500" size={14} />
                                            <span>Direct owner contact</span>
                                        </div>
                                    </div>
                                    {isAuthenticated ? (
                                        <button
                                            onClick={() => setShowContactModal(true)}
                                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                        >
                                            <FaPhone size={13} /> Contact Owner
                                        </button>
                                    ) : (
                                        <Link to="/login"
                                            className="block w-full py-3.5 text-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg">
                                            Sign In to Contact Owner
                                        </Link>
                                    )}
                                    <Link to="/" className="block w-full py-2.5 text-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all">
                                        Browse More Rooms
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetails;
