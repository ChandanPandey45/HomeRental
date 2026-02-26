import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI, uploadAPI } from '../../services/api';
import { toast } from 'react-toastify';
import MapComponent from '../Map/MapComponent';
import { FaHome, FaInfoCircle, FaMapMarkedAlt, FaListUl, FaCheckCircle, FaCalendarAlt, FaCamera, FaDollarSign, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const CreateRoom = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    amenities: [],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    location: {
      latitude: null,
      longitude: null
    },
    availableFrom: '',
    rules: {
      maxOccupants: '',
      petPolicy: 'not-allowed'
    }
  });

  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // ── Image state ──
  const [uploadedImages, setUploadedImages] = useState([]); // [{ url, name }]
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const amenitiesOptions = [
    'WiFi', 'Parking', 'Air Conditioning', 'Heating', 'Kitchen',
    'Washer', 'Dryer', 'Dishwasher', 'Gym', 'Pool', 'Patio',
    'Balcony', 'Furnace', 'TV Cable', 'Pet Friendly',
    'Security System', 'Elevator', 'Doorman'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation({ lat: location.lat, lng: location.lng });

    // Auto-fill address details from reverse geocoding
    const addr = location.address || {};

    setFormData((prev) => ({
      ...prev,
      location: {
        latitude: location.lat,
        longitude: location.lng
      },
      address: {
        street: addr.road || addr.pedestrian || addr.suburb || '',
        city: location.city !== 'Your Location' ? location.city : '',
        state: addr.state || '',
        zipCode: addr.postcode || '',
        country: addr.country || ''
      }
    }));
  };

  // ── Upload handler ──
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImages(true);
    const results = [];

    for (const file of files) {
      try {
        const res = await uploadAPI.uploadRoomImage(file);
        results.push({ url: res.data.imageUrl, name: file.name });
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploadedImages((prev) => [...prev, ...results]);
    setUploadingImages(false);
    // reset file input so same file can be re-picked
    e.target.value = '';
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    try {
      setLoading(true);
      const imageUrls = uploadedImages.map((img) => img.url);
      const submitData = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        squareFeet: Number(formData.squareFeet),
        coverImage: imageUrls[0],
        images: imageUrls
      };

      await roomAPI.createRoom(submitData);
      toast.success('Room created successfully!');
      navigate('/my-rooms');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create room';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 font-sans">
      <div className="w-full px-4 sm:px-8 lg:px-12">

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
            <FaHome className="text-3xl text-indigo-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">List Your Space</h1>
          <p className="mt-3 text-xl text-gray-500 max-w-2xl mx-auto">
            Fill out the details below to publish your room to thousands of renters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center">
              <FaInfoCircle className="text-indigo-500 mr-3" size={20} />
              <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
            </div>
            <div className="p-6 md:p-8 space-y-6">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Luxury 1-Bedroom Apartment in Downtown"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Highlight the best features of your space..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm resize-none"
                />
              </div>

              {/* ── Multi-image upload ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaCamera className="inline mr-2 text-gray-400" />
                  Room Photos <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-400">(first image = cover photo)</span>
                </label>

                {/* Drop zone / picker */}
                <div
                  onClick={() => !uploadingImages && fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${uploadingImages ? 'border-indigo-300 bg-indigo-50 cursor-not-allowed' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploadingImages}
                  />
                  {uploadingImages ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      <p className="text-sm text-indigo-600 font-medium">Uploading images…</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FaCloudUploadAlt className="text-4xl text-gray-400" />
                      <p className="text-sm font-semibold text-gray-600">Click to upload images</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5 MB each — select multiple at once</p>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className={`relative rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}>
                        <img src={img.url} alt={img.name} className="w-full h-24 object-cover" />
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-[10px] font-bold text-center py-0.5">
                            COVER
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-all"
                        >
                          <FaTimes size={9} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaDollarSign className="inline mr-1 text-gray-400" /> Monthly Rent <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-semibold">₹</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="e.g. 15000"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} required min="0" placeholder="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm text-center" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} required min="0" placeholder="1" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm text-center" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sq.Ft</label>
                    <input type="number" name="squareFeet" value={formData.squareFeet} onChange={handleInputChange} required min="0" placeholder="750" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm text-center" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Address & Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center">
                <FaMapMarkedAlt className="text-teal-500 mr-3" size={20} />
                <h2 className="text-xl font-bold text-gray-800">Location Details</h2>
              </div>
              {!selectedLocation && <span className="text-xs font-bold bg-amber-100 text-amber-700 py-1 px-3 rounded-full">Map selection required</span>}
              {selectedLocation && <span className="text-xs font-bold bg-teal-100 text-teal-700 py-1 px-3 rounded-full flex items-center"><FaCheckCircle className="mr-1" /> Location Set</span>}
            </div>

            <div className="flex flex-col md:flex-row border-b border-gray-100">
              {/* Map Portion */}
              <div className="w-full md:w-1/2 p-4 bg-gray-50 border-r border-gray-100">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-gray-700">Pinpoint your address</p>
                  <p className="text-xs text-gray-500 mb-3">Click on the map precisely where your property is located.</p>
                </div>
                <div className="h-[350px] rounded-xl overflow-hidden shadow-inner border border-gray-200 relative">
                  <MapComponent
                    defaultCenter={selectedLocation || { lat: 40.7128, lng: -74.0060 }}
                    onLocationSelect={handleLocationSelect}
                    showRooms={false}
                  />
                </div>
              </div>

              {/* Address Form Portion */}
              <div className="w-full md:w-1/2 p-6 md:p-8 space-y-5 flex flex-col justify-center">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Street Address</label>
                  <input type="text" name="address.street" value={formData.address.street} onChange={handleInputChange} placeholder="123 Main St, Apt 4B" className="w-full px-4 py-2 border-b-2 border-gray-200 focus:border-indigo-500 outline-none transition-colors bg-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                    <input type="text" name="address.city" value={formData.address.city} onChange={handleInputChange} placeholder="Mumbai" className="w-full px-4 py-2 border-b-2 border-gray-200 focus:border-indigo-500 outline-none transition-colors bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State/Province</label>
                    <input type="text" name="address.state" value={formData.address.state} onChange={handleInputChange} placeholder="MH" className="w-full px-4 py-2 border-b-2 border-gray-200 focus:border-indigo-500 outline-none transition-colors bg-transparent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Zip Code</label>
                    <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleInputChange} placeholder="400001" className="w-full px-4 py-2 border-b-2 border-gray-200 focus:border-indigo-500 outline-none transition-colors bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
                    <input type="text" name="address.country" value={formData.address.country} onChange={handleInputChange} placeholder="India" className="w-full px-4 py-2 border-b-2 border-gray-200 focus:border-indigo-500 outline-none transition-colors bg-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Amenities & Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Amenities */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center">
                <FaListUl className="text-purple-500 mr-3" size={18} />
                <h2 className="text-xl font-bold text-gray-800">Amenities</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesOptions.map((amenity) => {
                    const isSelected = formData.amenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200' : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 flex-shrink-0 transition-colors ${isSelected ? 'bg-indigo-600' : 'bg-white border-2 border-gray-300'}`}>
                          {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{amenity}</span>
                        <input type="checkbox" className="hidden" checked={isSelected} onChange={() => handleAmenityChange(amenity)} />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rules & Dates */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center">
                <FaCalendarAlt className="text-pink-500 mr-3" size={18} />
                <h2 className="text-xl font-bold text-gray-800">Policies</h2>
              </div>
              <div className="p-6 space-y-6 flex-grow">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Occupants</label>
                  <input type="number" name="rules.maxOccupants" value={formData.rules.maxOccupants} onChange={handleInputChange} min="1" placeholder="e.g. 2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Policy</label>
                  <div className="relative">
                    <select name="rules.petPolicy" value={formData.rules.petPolicy} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm appearance-none font-medium text-gray-700">
                      <option value="not-allowed">No Pets Allowed 🚫</option>
                      <option value="small-only">Small Pets Only 🐈</option>
                      <option value="allowed">All Pets Allowed 🐕</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Available From <span className="text-red-500">*</span></label>
                  <input type="date" name="availableFrom" value={formData.availableFrom} onChange={handleInputChange} required className="w-full px-4 py-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm font-semibold" />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 pb-12 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/my-rooms')}
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg"
            >
              {loading ? (
                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Publishing...</>
              ) : (
                <><FaCheckCircle className="mr-2" /> Publish Listing</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
