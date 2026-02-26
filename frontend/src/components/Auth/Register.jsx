import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash, FaHome, FaArrowRight, FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tenant'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await register(formData);
      toast.success('Account created successfully!');
      if (formData.role === 'roomOwner') {
        navigate('/create-room');
      } else {
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-indigo-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-indigo-200 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaHome className="text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Room<span className="text-indigo-300">Finder</span>
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white mb-2">Create account</h1>
            <p className="text-indigo-300 text-sm">Join thousands finding their perfect space</p>
          </div>

          {/* Role Toggle */}
          <div className="mb-6">
            <p className={labelClass}>I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, role: 'tenant' }))}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 font-semibold text-sm transition-all ${formData.role === 'tenant'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 border-white/15 text-indigo-300 hover:border-white/30'
                  }`}
              >
                <FaHome size={20} />
                Tenant
                <span className="text-xs font-normal opacity-80">Looking for a room</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, role: 'roomOwner' }))}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 font-semibold text-sm transition-all ${formData.role === 'roomOwner'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 border-white/15 text-indigo-300 hover:border-white/30'
                  }`}
              >
                <FaBuilding size={20} />
                Room Owner
                <span className="text-xs font-normal opacity-80">Listing a property</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={13} />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={13} />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={14} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className={inputClass} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Phone <span className="text-indigo-400/70 font-normal">(optional)</span></label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={13} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className={inputClass} />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={13} />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 chars" className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors">
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={13} />
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Repeat password" className={`${inputClass} pr-10`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white transition-colors">
                    {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>Create Account <FaArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-indigo-300/80 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-300 hover:text-white font-bold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
