import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  MapPin, 
  Phone, 
  Navigation, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  Heart,
  Zap,
  Lock,
  Menu,
  X,
  ArrowRight,
  Car,
  Bike,
  Bus,
  Footprints,
  MoreHorizontal,
  ArrowRightLeft,
  Clock,
  Info,
  Search,
  Layers,
  FileText,
  Plus,
  CheckCircle,
  Map as MapIcon,
  Eye,
  Trash2,
  Camera,
  Upload,
  User,
  ShieldAlert,
  Activity,
  ShieldCheck,
  Maximize,
  Minus,
  Mail,
  CheckCircle2,
  UserX,
  Globe,
  Moon,
  ArrowLeft,
  Send,
  AlertTriangle,
  PlusCircle,
  Calendar,
  XCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Fix for default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ... components ...

const Logo = ({ className, size = "text-3xl" }: { className?: string, size?: string }) => (
  <div className={cn("flex items-center gap-4", className)}>
    <div className="india-map-logo w-12 h-12" />
    <div className={cn("tracking-tighter flex flex-col md:flex-row md:items-baseline md:gap-3", size)}>
      <span className="font-hindi font-black text-white logo-swoosh text-5xl md:text-6xl">निर्भय</span>
      <span className="font-anton text-orange-500 tracking-widest uppercase text-4xl md:text-5xl">Navigator</span>
    </div>
  </div>
);

const LandingPage = ({ onEnter }: { onEnter: () => void }) => {
  const features = [
    { icon: Shield, title: "Smart SOS", desc: "Instant alerts to contacts & authorities" },
    { icon: Navigation, title: "Safe Route", desc: "AI-guided paths through secure areas" },
    { icon: Zap, title: "Risk Analysis", desc: "Real-time comparison of route safety" },
    { icon: AlertCircle, title: "Report Incident", desc: "Directly report safety issues to authorities" }
  ];

  return (
    <div className="min-h-screen starry-bg flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mb-12"
      >
        <Logo size="text-7xl md:text-9xl" className="flex-col gap-6" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-12"
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="glass p-6 rounded-2xl hover:bg-white/10 transition-all group cursor-default"
          >
            <f.icon className="w-10 h-10 text-orange-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">{f.title}</h3>
            <p className="text-white/50 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onEnter}
        className="px-12 py-4 rounded-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold text-xl neon-glow-purple flex items-center gap-3 group"
      >
        Get Started
        <ArrowRight className="group-hover:translate-x-2 transition-transform" />
      </motion.button>
    </div>
  );
};

const AuthPage = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'authority'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setError('Supabase configuration is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables in the Settings menu.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        console.log("Logged in user:", user);
        
        // Ensure profile exists on login (fallback for old users)
        if (user) {
          const { data: existingProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          if (!existingProfile) {
            console.log("Profile missing, creating with role:", role);
            await supabase.from('profiles').insert({ id: user.id, role: role, full_name: email.split('@')[0] });
          } else {
            console.log("Existing profile role:", existingProfile.role);
          }
        }
        
        await onAuthSuccess();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { role }
          }
        });
        if (signUpError) throw signUpError;
        
        if (data.user) {
          // Create profile with role
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id, 
              role, 
              full_name: email.split('@')[0],
              updated_at: new Date().toISOString()
            });
          
          if (profileError) {
            console.error("Profile creation error:", profileError);
            setError("Account created but profile sync failed. Please contact support.");
          }

          if (data.session) {
            await onAuthSuccess();
          } else {
            setMessage('Account created! Please check your email for a confirmation link.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[120px] rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="glass-card p-8 sm:p-12 rounded-[40px] border border-white/10 shadow-2xl bg-white/[0.02] backdrop-blur-3xl">
          <div className="text-center mb-10">
            <Logo className="justify-center mb-8" size="text-5xl" />
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              {isLogin ? (role === 'authority' ? 'Authority Portal' : 'Welcome Back') : 'Join the Shield'}
            </h2>
            <p className="text-white/40 text-sm font-medium">
              {isLogin ? 'Secure access to your safety companion' : 'Create an account to stay protected'}
            </p>
          </div>

          {!isConfigured && (
            <div className="mb-8 p-5 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm leading-relaxed">
              <div className="font-bold mb-1 flex items-center gap-2 text-base">
                <AlertCircle className="w-5 h-5" /> Configuration Required
              </div>
              Please add your Supabase URL and Anon Key in the <b>Settings</b> menu to enable authentication.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Select Your Role</label>
              <div className="flex gap-3 p-1.5 bg-white/5 rounded-[24px] border border-white/5">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={cn(
                    "flex-1 py-4 rounded-[18px] text-sm font-bold transition-all duration-500 flex items-center justify-center gap-2",
                    role === 'user' 
                      ? "bg-white text-black shadow-xl" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <User className="w-4 h-4" />
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setRole('authority')}
                  className={cn(
                    "flex-1 py-4 rounded-[18px] text-sm font-bold transition-all duration-500 flex items-center justify-center gap-2",
                    role === 'authority' 
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/20" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Authority
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all duration-500 placeholder:text-white/10 text-white font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all duration-500 placeholder:text-white/10 text-white font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs font-medium bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-xs font-medium bg-green-500/10 p-4 rounded-2xl border border-green-500/20 flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {message}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className={cn(
                "w-full py-5 rounded-[24px] font-bold text-lg transition-all duration-500 disabled:opacity-50 mt-4 relative overflow-hidden group",
                role === 'authority'
                  ? "bg-red-600 text-white shadow-2xl shadow-red-600/20" 
                  : "bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-2xl shadow-orange-500/20"
              )}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-sm font-semibold text-white/40 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? (
                <>
                  New to Nirbhay? <span className="text-orange-500 hover:underline">Create an account</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="text-orange-500 hover:underline">Sign in instead</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ReportIncidentScreen = ({ onBack }: { onBack: () => void }) => {
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'harassment', label: 'Harassment', icon: UserX, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'stalking', label: 'Stalking', icon: Eye, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'suspicious', label: 'Suspicious', icon: ShieldAlert, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 'cyber', label: 'Cyber Threat', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'unsafe', label: 'Unsafe Area', icon: Moon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'theft', label: 'Theft', icon: Zap, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
    { id: 'others', label: 'Others', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-500/10' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return alert("Please select a category");
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message.includes('refresh_token_not_found') || 
            userError.message.includes('Invalid Refresh Token') ||
            userError.message.includes('Refresh Token Not Found')) {
          await supabase.auth.signOut();
          alert("Your session has expired. Please log in again.");
          return;
        }
        throw userError;
      }
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('reports').insert([{
        user_id: user.id,
        category,
        description,
        location_name: location,
        pincode,
        status: 'pending'
      }]);

      if (error) throw error;

      alert("Report submitted successfully! Your report is being verified and will improve safety mapping.");
      onBack();
    } catch (err: any) {
      console.error("Report error:", err);
      alert("Failed to submit report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <header className="mb-12">
          <button 
            onClick={onBack} 
            className="mb-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center w-12 h-12"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Report Incident</h1>
          <p className="text-white/40 text-lg font-medium">Your contribution helps build a safer community for everyone.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Select Category</h3>
              <span className="text-[10px] bg-red-600/20 text-red-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Required</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-4 p-6 rounded-[32px] transition-all duration-500 border-2 group",
                    category === cat.id 
                      ? "bg-white border-white text-black scale-[1.05] shadow-2xl shadow-white/10" 
                      : "bg-white/[0.03] border-transparent text-white/40 hover:bg-white/[0.06] hover:border-white/10"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                    category === cat.id ? "bg-black text-white" : cn(cat.bg, cat.color)
                  )}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-center leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Incident Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened? Be as specific as possible..."
                className="w-full bg-white/5 border border-white/10 rounded-[32px] px-8 py-6 focus:outline-none focus:border-white/30 transition-all min-h-[180px] resize-none text-white placeholder:text-white/10 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Location / Area</label>
                <div className="relative group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. MG Road, Sector 12"
                    className="w-full bg-white/5 border border-white/10 rounded-[24px] pl-14 pr-6 py-5 focus:outline-none focus:border-white/30 transition-all text-white placeholder:text-white/10 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 110001"
                  className="w-full bg-white/5 border border-white/10 rounded-[24px] px-8 py-5 focus:outline-none focus:border-white/30 transition-all text-white placeholder:text-white/10 font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Evidence (Optional)</label>
              <div className="w-full h-40 border-2 border-dashed border-white/10 rounded-[40px] flex flex-col items-center justify-center gap-4 text-white/20 hover:bg-white/[0.03] hover:border-white/20 cursor-pointer transition-all group">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold tracking-tight">Add Photos or Video</span>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-white text-black rounded-[32px] font-black text-xl shadow-2xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Report
                <Send className="w-6 h-6" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const AuthorityDashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'verification' | 'risk'>('verification');
  const [loading, setLoading] = useState(false);
  
  // Form states for Risk Update
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('low');
  const [crimeType, setCrimeType] = useState('');

  const areas = ['Shegaon', 'Adsul', 'Alsana', 'Jalamb', 'Nagzari', 'Janori', 'Takli Viro'];
  const riskLevels = [
    { id: 'low', label: 'Safe' },
    { id: 'medium', label: 'Risky' },
    { id: 'high', label: 'Highly Risky' }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setReports(data);
    } catch (err: any) {
      if (err.message === 'Failed to fetch') return;
      console.error('Error fetching reports:', err);
    }
  };

  const updateReportStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', id);
    if (!error) fetchReports();
  };

  const handleUpdateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea) return alert("Please select an area");
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message.includes('refresh_token_not_found') || 
            userError.message.includes('Invalid Refresh Token') ||
            userError.message.includes('Refresh Token Not Found')) {
          await supabase.auth.signOut();
          alert("Your session has expired. Please log in again.");
          return;
        }
        throw userError;
      }
      const { error } = await supabase.from('area_risk').upsert([{
        authority_id: user?.id,
        area_name: selectedArea,
        risk_level: selectedRisk,
        last_crime_type: crimeType || 'General Update',
        updated_at: new Date().toISOString()
      }], { onConflict: 'area_name' });
      
      if (error) throw error;
      const riskLabel = riskLevels.find(r => r.id === selectedRisk)?.label || selectedRisk;
      alert(`Risk level for ${selectedArea} updated to ${riskLabel}!`);
      setCrimeType('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck className="w-3 h-3" />
              Nirbhay Navigator - Authority Portal
            </div>
            <h1 className="text-6xl font-black tracking-tight leading-none">
              Command <span className="text-red-600">Center</span>
            </h1>
            <p className="text-white/40 text-lg font-medium max-w-md">Real-time safety administration and incident management dashboard.</p>
          </div>

          <div className="flex gap-2 p-2 bg-white/[0.03] rounded-[32px] border border-white/5 backdrop-blur-xl">
            {[
              { id: 'verification', label: 'Crime Verification', icon: CheckCircle2 },
              { id: 'risk', label: 'Update Area Risk', icon: AlertTriangle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-[24px] text-sm font-bold transition-all duration-500",
                  activeTab === tab.id 
                    ? "bg-white text-black shadow-2xl shadow-white/10" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    Pending Verifications
                  </h2>
                  <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{reports.length} Total Reports</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {reports.length === 0 ? (
                    <div className="p-20 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/20">
                      <FileText className="w-16 h-16 mb-4" />
                      <p className="text-xl font-bold">No reports found</p>
                    </div>
                  ) : (
                    reports.map((report) => (
                      <motion.div 
                        key={report.id} 
                        layout
                        className="group bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-[40px] p-8 transition-all duration-500"
                      >
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                          <div className="space-y-6 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                ID: {report.id.slice(0, 8)}
                              </span>
                              <span className="px-4 py-1.5 rounded-full bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-600/20">
                                {report.category}
                              </span>
                              <span className={cn(
                                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                report.status === 'verified' ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                                report.status === 'rejected' ? "bg-slate-500/10 text-slate-500 border-slate-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                              )}>
                                {report.status}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold tracking-tight mb-2">{report.location_name} {report.pincode && <span className="text-white/20">({report.pincode})</span>}</h3>
                              <p className="text-white/40 text-lg leading-relaxed">{report.description}</p>
                            </div>
                            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                <User className="w-3 h-3" />
                                {report.user_id.slice(0, 8)}...
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                <Calendar className="w-3 h-3" />
                                {new Date(report.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex lg:flex-col items-center justify-center gap-3">
                            {report.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateReportStatus(report.id, 'verified')}
                                  className="w-full lg:w-40 py-4 bg-green-600 hover:bg-green-500 text-white rounded-[20px] font-bold text-sm transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Verify
                                </button>
                                <button
                                  onClick={() => updateReportStatus(report.id, 'rejected')}
                                  className="w-full lg:w-40 py-4 bg-white/5 hover:bg-white/10 text-white rounded-[20px] font-bold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" /> Reject
                                </button>
                              </>
                            )}
                            {report.status === 'verified' && (
                              <div className="flex items-center gap-2 text-green-500 font-bold">
                                <CheckCircle2 className="w-5 h-5" /> Verified
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

          {activeTab === 'risk' && (
            <div className="max-w-2xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/50 border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl"
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Update Area Risk</h2>
                    <p className="text-white/40 text-sm">Modify safety levels for specific jurisdictions</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateRisk} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Select Area</label>
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 focus:outline-none focus:border-orange-500/50 transition-all appearance-none text-white font-medium cursor-pointer"
                    >
                      <option value="" disabled className="bg-slate-900">Choose an area...</option>
                      {areas.map(area => (
                        <option key={area} value={area} className="bg-slate-900">{area}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Risk Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {riskLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setSelectedRisk(level.id)}
                          className={cn(
                            "py-4 rounded-[20px] text-xs font-bold transition-all border border-white/5",
                            selectedRisk === level.id 
                              ? "bg-white text-black shadow-xl" 
                              : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Additional Context (Optional)</label>
                    <input
                      type="text"
                      value={crimeType}
                      onChange={(e) => setCrimeType(e.target.value)}
                      placeholder="e.g. Recent theft reports, Poor lighting"
                      className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-5 focus:outline-none focus:border-orange-500/50 transition-all text-white font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-[24px] font-bold text-lg shadow-2xl shadow-orange-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Update Risk Level
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const Navbar = ({ onOpenContacts, onLogout }: { onOpenContacts: () => void, onLogout: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Safe Route', id: 'safe-route' },
    { name: 'Police Map', id: 'police-map' },
    { name: 'Emergency', id: 'emergency' },
    { name: 'Report', id: 'report' }
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4",
      isScrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Logo />
        </motion.div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          {navItems.map((item, i) => (
            <motion.button
              key={item.name}
              onClick={() => scrollTo(item.id)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="hover:text-white transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
            </motion.button>
          ))}
          <button onClick={onOpenContacts} className="hover:text-white transition-colors flex items-center gap-2">
            <Users className="w-4 h-4" /> Contacts
          </button>
        </div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onLogout}
          className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-semibold text-red-400 hover:text-red-300"
        >
          Logout
          <X className="w-4 h-4" />
        </motion.button>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navItems.map((item) => (
                <button key={item.name} onClick={() => scrollTo(item.id)} className="text-lg font-medium py-2 border-b border-white/5 text-left">{item.name}</button>
              ))}
              <button onClick={onOpenContacts} className="text-lg font-medium py-2 border-b border-white/5 text-left">Contacts</button>
              <button onClick={() => scrollTo('safe-route')} className="w-full py-4 mt-4 rounded-xl bg-orange-600 font-bold">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const HeroSection = ({ onTriggerSOS, user }: { onTriggerSOS: () => void, user: any }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Animated Background */}
      <div className="hero-bg-container">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        
        {/* Parallax City Elements */}
        <motion.div style={{ y: y1 }} className="absolute bottom-0 w-full h-[60vh] opacity-30 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 600V450L100 400L250 480L400 350L600 420L800 300L1000 450L1200 380L1440 450V600H0Z" fill="url(#city-grad)" />
              <defs>
                <linearGradient id="city-grad" x1="720" y1="300" x2="720" y2="600" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a855f7" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#050505" />
                </linearGradient>
              </defs>
           </svg>
        </motion.div>

        {/* Animated Girl Silhouette */}
        <motion.div 
          className="girl-silhouette"
          animate={{ 
            y: [0, -10, 0],
            filter: ["drop-shadow(0 0 15px rgba(236, 72, 153, 0.3))", "drop-shadow(0 0 25px rgba(236, 72, 153, 0.6))", "drop-shadow(0 0 15px rgba(236, 72, 153, 0.3))"]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img 
            src="https://cdn.pixabay.com/photo/2021/09/14/11/35/girl-6623761_1280.png" 
            alt="Girl Walking" 
            className="w-full h-full object-contain opacity-80 mix-blend-screen"
            referrerPolicy="no-referrer"
          />
          {/* Glow Aura */}
          <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
        </motion.div>

        {/* Floating UI Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-[30%] left-[15%] glass p-4 rounded-2xl flex items-center gap-3 neon-glow-purple"
        >
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Live Location</div>
            <div className="text-xs font-semibold">Downtown, 5th Ave</div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[45%] right-[15%] glass p-4 rounded-2xl flex items-center gap-3 neon-glow-pink"
        >
          <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Protection</div>
            <div className="text-xs font-semibold">Active & Encrypted</div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {user && (
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
              Welcome back, <span className="text-white font-bold">{user.email}</span>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3" /> AI-Powered Safety System
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9] mb-8">
            Your Safety. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-500">Always On.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Experience the future of personal protection. <span className="font-hindi font-bold text-white">निर्भय</span> <span className="font-anton text-orange-500 uppercase tracking-wider">Navigator</span> uses advanced AI to predict risks, 
            guide you through safe routes, and connect you with help instantly.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('safe-route')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-green-600 text-white font-bold text-lg neon-glow-purple flex items-center gap-3 group"
            >
              Activate Protection
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <button 
              onClick={() => document.getElementById('emergency')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-3"
            >
              Watch Demo
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      {/* SOS Floating Button */}
      <motion.div 
        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.button
          onClick={onTriggerSOS}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9, rotate: 5 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(220, 38, 38, 0.4)",
              "0 0 60px rgba(220, 38, 38, 0.8)",
              "0 0 20px rgba(220, 38, 38, 0.4)"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)] relative group border-4 border-white/20"
        >
          <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-30"></div>
          <span className="text-white font-black text-2xl tracking-tighter drop-shadow-lg">SOS</span>
        </motion.button>
      </motion.div>
    </section>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass p-8 rounded-[32px] relative overflow-hidden group"
  >
    <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 transition-opacity group-hover:opacity-40", color)}></div>
    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", color.replace('blur', 'bg'))}>
      <Icon className="text-white w-7 h-7" />
    </div>
    <h3 className="text-2xl font-display font-bold mb-4">{title}</h3>
    <p className="text-white/50 leading-relaxed">{desc}</p>
  </motion.div>
);

const SafeRouteSection = () => {
  const [origin, setOrigin] = useState('Your location');
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMode, setActiveMode] = useState('bike');
  const [safeRoute, setSafeRoute] = useState<[number, number][]>([]);
  const [riskRoute, setRiskRoute] = useState<[number, number][]>([]);
  const [routeDetails, setRouteDetails] = useState<{
    safe: { distance: string, time: string, score: number },
    risk: { distance: string, time: string, score: number }
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<'safe' | 'risk' | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setOrigin('Current Location');
          setIsLocating(false);
          
          // If we have a destination, recalculate routes
          if (destination && destination !== 'Locating...') {
            // We need the destination coords. If we don't have them easily, 
            // we'll just wait for the user to select again or we could store them.
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          alert("Could not get your location. Please ensure location permissions are granted.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      alert("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search-location?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (!res.ok || data.error) {
        // PositionStack errors are often JSON strings wrapped in our proxy error
        let errorMessage = data.error;
        if (typeof data.error === 'string' && data.error.includes('PositionStack API error:')) {
          try {
            const jsonStr = data.error.replace('PositionStack API error: ', '');
            const parsed = JSON.parse(jsonStr);
            errorMessage = parsed.error?.message || errorMessage;
          } catch (e) {
            // Fallback to original string if parsing fails
          }
        }
        throw new Error(errorMessage || `Search failed with status ${res.status}`);
      }
      setSearchResults(data.data || []);
    } catch (err: any) {
      console.error("Search failed:", err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = (query: string) => {
    setDestination(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(query);
      }, 500); // 500ms debounce
    } else {
      setSearchResults([]);
    }
  };

  const calculateSafetyScore = (isSafe: boolean) => {
    return isSafe ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 30) + 30;
  };

  const selectDestination = (res: any) => {
    setDestination(res.label);
    setSearchResults([]);
    
    const dest: [number, number] = [res.latitude, res.longitude];
    const start: [number, number] = userLocation || [28.6139, 77.2090];
    setMapCenter(dest);
    fetchRealRoutes(start, dest);
  };

  const fetchRealRoutes = async (start: [number, number], end: [number, number]) => {
    try {
      // OSRM expects [lng, lat]
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&alternatives=true`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const routes = data.routes;
        
        // Route 1 (Fastest/Main) -> Safe
        const safeCoords = routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
        setSafeRoute(safeCoords);
        
        // Route 2 (Alternative) -> Risk (or simulate if no alternative)
        let riskCoords: [number, number][] = [];
        let riskDist = 0;
        let riskDur = 0;

        if (routes.length > 1) {
          riskCoords = routes[1].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          riskDist = routes[1].distance;
          riskDur = routes[1].duration;
        } else {
          // If no alternative, create a slightly offset one by adding a waypoint
          const midLat = (start[0] + end[0]) / 2;
          const midLng = (start[1] + end[1]) / 2;
          const offsetLat = midLat + (Math.random() > 0.5 ? 0.005 : -0.005);
          const offsetLng = midLng + (Math.random() > 0.5 ? 0.005 : -0.005);
          
          const altUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${offsetLng},${offsetLat};${end[1]},${end[0]}?overview=full&geometries=geojson`;
          const altRes = await fetch(altUrl);
          const altData = await altRes.json();
          if (altData.code === 'Ok') {
            riskCoords = altData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
            riskDist = altData.routes[0].distance;
            riskDur = altData.routes[0].duration;
          } else {
            // Fallback to simple line if even that fails
            riskCoords = [start, [offsetLat, offsetLng], end];
            riskDist = routes[0].distance * 1.1;
            riskDur = routes[0].duration * 1.2;
          }
        }
        setRiskRoute(riskCoords);

        // Call backend for safety analysis
        const analysisRes = await fetch('/api/safe-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routes: [
              { type: 'safe', distance: routes[0].distance, duration: routes[0].duration },
              { type: 'risk', distance: riskDist, duration: riskDur }
            ]
          })
        });
        const analysisData = await analysisRes.json();
        const analyzed = analysisData.routes;

        setRouteDetails({
          safe: { 
            distance: (routes[0].distance / 1000).toFixed(1) + ' km', 
            time: Math.round(routes[0].duration / 60) + ' min', 
            score: analyzed[0].safetyScore 
          },
          risk: { 
            distance: (riskDist / 1000).toFixed(1) + ' km', 
            time: Math.round(riskDur / 60) + ' min', 
            score: analyzed[1].safetyScore 
          }
        });
      }
    } catch (err) {
      console.error("Routing failed:", err);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setDestination('Locating...');
        try {
          const res = await fetch(`/api/search-location?query=${lat},${lng}`);
          const data = await res.json();
          if (data.data && data.data.length > 0) {
            const label = data.data[0].label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setDestination(label);
            selectDestination({ latitude: lat, longitude: lng, label });
          } else {
            const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setDestination(label);
            selectDestination({ latitude: lat, longitude: lng, label });
          }
        } catch (err) {
          const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setDestination(label);
          selectDestination({ latitude: lat, longitude: lng, label });
        }
      },
    });
    return null;
  };

  const RecenterMap = ({ pos }: { pos: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(pos, 13);
    }, [pos]);
    return null;
  };

  const modes = [
    { id: 'best', icon: Navigation, label: 'Best' },
    { id: 'car', icon: Car, label: '4h 37m' },
    { id: 'bike', icon: Bike, label: '4h 50m' },
    { id: 'bus', icon: Bus, label: '3 days' },
    { id: 'walk', icon: Footprints, label: '' },
  ];

  return (
    <section id="safe-route" className="h-screen w-full relative flex overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 400 : 0 }}
        className="bg-white text-black h-full relative flex flex-col shadow-2xl z-[1000] overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {modes.map((mode) => (
                  <button 
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 min-w-[60px] transition-all",
                      activeMode === mode.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full transition-all",
                      activeMode === mode.id ? "bg-blue-100" : "bg-transparent"
                    )}>
                      <mode.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium">{mode.label || mode.id}</span>
                    {activeMode === mode.id && <div className="h-0.5 w-full bg-blue-600 mt-1 rounded-full" />}
                  </button>
                ))}
             </div>
             <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
               <X className="w-5 h-5 text-gray-500" />
             </button>
          </div>

          <div className="space-y-3 relative">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <div className="w-2 h-2 rounded-full border-2 border-gray-400" />
              <input 
                type="text" 
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full"
                placeholder="Your location"
              />
              <Search className="w-4 h-4 text-blue-500" />
            </div>
            
            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-gray-200 border-l border-dashed border-gray-400" />

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-blue-200">
              <MapPin className="w-4 h-4 text-red-500" />
              <input 
                type="text" 
                value={destination}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm w-full"
                placeholder="Choose destination (min 3 chars)..."
              />
              <button className="p-1 hover:bg-gray-200 rounded-lg">
                <ArrowRightLeft className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-xl rounded-xl border border-gray-100 z-[1100] max-h-60 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <button 
                    key={i}
                    onClick={() => selectDestination(res)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm border-b border-gray-50 last:border-0 flex items-center gap-3"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{res.label}</span>
                  </button>
                ))}
              </div>
            )}

            <button 
              className="flex items-center gap-3 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
              onClick={() => alert("Click anywhere on the map to set your destination.")}
            >
              <div className="w-5 h-5 rounded-full border-2 border-blue-300 flex items-center justify-center">
                <span className="text-xs">+</span>
              </div>
              Locate destination on map
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between text-blue-600 text-sm font-medium">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg" onClick={getCurrentLocation}>
              <MapPin className="w-4 h-4" /> Use Current Location
            </button>
            <button className="hover:underline">Options</button>
          </div>

          {routeDetails ? (
            <div className="space-y-4">
              {/* Safe Route Card */}
              <div 
                onClick={() => setSelectedRoute('safe')}
                className={cn(
                  "p-4 rounded-2xl border-2 relative overflow-hidden group cursor-pointer transition-all shadow-lg",
                  selectedRoute === 'safe' ? "border-green-500 bg-green-50" : "border-gray-100 bg-white hover:border-green-200"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", selectedRoute === 'safe' ? "bg-green-100" : "bg-gray-100")}>
                      <Shield className={cn("w-5 h-5", selectedRoute === 'safe' ? "text-green-600" : "text-gray-400")} />
                    </div>
                    <div>
                      <span className="font-bold text-lg block">Safe Route 🟢</span>
                      <span className="text-xs text-green-700 font-bold">{routeDetails.safe.score}% Safety Score</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold text-lg">{routeDetails.safe.time}</div>
                    <div className="text-gray-500 text-xs">{routeDetails.safe.distance}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4">Optimized for well-lit streets and high community presence.</p>
                <div className="flex gap-4 text-green-600 text-sm font-bold">
                  <button className="hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedRoute('safe'); }}>Select Route</button>
                  <button className="hover:underline" onClick={(e) => { e.stopPropagation(); alert("This route follows main roads with high visibility."); }}>Details</button>
                </div>
              </div>

              {/* Risk Route Card */}
              <div 
                onClick={() => setSelectedRoute('risk')}
                className={cn(
                  "p-4 rounded-2xl border-2 relative overflow-hidden group cursor-pointer transition-all shadow-md",
                  selectedRoute === 'risk' ? "border-red-500 bg-red-50" : "border-gray-100 bg-white hover:border-red-200"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", selectedRoute === 'risk' ? "bg-red-100" : "bg-gray-100")}>
                      <AlertCircle className={cn("w-5 h-5", selectedRoute === 'risk' ? "text-red-600" : "text-gray-400")} />
                    </div>
                    <div>
                      <span className="font-bold text-lg block">Risk Route 🔴</span>
                      <span className="text-xs text-red-700 font-bold">{100 - routeDetails.risk.score}% Risk Level</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-bold text-lg">{routeDetails.risk.time}</div>
                    <div className="text-gray-500 text-xs">{routeDetails.risk.distance}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4">Shorter path but passes through low-lit or isolated areas.</p>
                <div className="flex gap-4 text-red-600 text-sm font-bold">
                  <button className="hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedRoute('risk'); }}>Avoid Route</button>
                  <button className="hover:underline" onClick={(e) => { e.stopPropagation(); alert("This route includes shortcuts through isolated areas."); }}>Why Risk?</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
               <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center text-center py-12">
                  <Navigation className="w-12 h-12 text-gray-300 mb-4 animate-bounce" />
                  <p className="text-gray-500 text-sm font-medium">Enter a destination to compare <br/> safety routes</p>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] text-gray-500 leading-tight">
              New! Continue your trip, tap the notification on your phone to get directions
            </p>
            <button className="p-1 hover:bg-gray-200 rounded-full shrink-0">
              <X className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Map Area */}
      <div className="flex-1 relative h-full">
        {/* Top Search Bar (Floating) */}
        <div className="absolute top-6 left-6 z-[500] flex gap-2">
           {!isSidebarOpen && (
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-3 bg-white rounded-xl shadow-xl hover:bg-gray-50 transition-all border border-gray-100"
             >
               <Menu className="w-6 h-6 text-gray-700" />
             </button>
           )}
           <div className="flex items-center gap-2 bg-white rounded-full shadow-2xl px-4 py-2 border border-gray-100 min-w-[300px]">
             <Search className="w-5 h-5 text-gray-400" />
             <input type="text" placeholder="Search along the route..." className="bg-transparent border-none focus:ring-0 text-sm w-full" />
             <div className="h-6 w-px bg-gray-200 mx-2" />
             <div className="flex gap-2">
               {['Hotels', 'Gas', 'EV charging'].map(tag => (
                 <button key={tag} className="px-3 py-1 rounded-full border border-gray-200 text-xs font-medium hover:bg-gray-50 whitespace-nowrap">
                   {tag}
                 </button>
               ))}
             </div>
           </div>
        </div>

        <MapContainer 
          center={mapCenter} 
          zoom={12} 
          style={{ height: '100%', width: '100%', background: '#e5e7eb' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <RecenterMap pos={mapCenter} />
          <MapEvents />

          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {safeRoute.length > 0 && (
            <>
              {/* Safe Route Glow */}
              <Polyline 
                positions={safeRoute} 
                pathOptions={{ color: '#22c55e', weight: 12, opacity: selectedRoute === 'safe' ? 0.4 : 0.1, lineJoin: 'round' }} 
              />
              <Polyline 
                positions={safeRoute} 
                pathOptions={{ color: '#22c55e', weight: 6, opacity: selectedRoute === 'safe' ? 1 : 0.6, lineJoin: 'round' }} 
              />
              <Marker position={safeRoute[safeRoute.length - 1]}>
                <Popup>
                  <div className="text-black font-bold">Destination</div>
                  <div className="text-green-600 text-xs font-bold">Safety Score: {routeDetails?.safe.score}%</div>
                </Popup>
              </Marker>
            </>
          )}

          {riskRoute.length > 0 && (
            <>
              {/* Risk Route Glow */}
              <Polyline 
                positions={riskRoute} 
                pathOptions={{ color: '#ef4444', weight: 12, opacity: selectedRoute === 'risk' ? 0.4 : 0.1, lineJoin: 'round', dashArray: '10, 10' }} 
              />
              <Polyline 
                positions={riskRoute} 
                pathOptions={{ color: '#ef4444', weight: 6, opacity: selectedRoute === 'risk' ? 1 : 0.6, lineJoin: 'round', dashArray: '10, 10' }} 
              />
            </>
          )}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute bottom-10 right-6 z-[500] flex flex-col gap-2">
           <button 
             onClick={getCurrentLocation}
             disabled={isLocating}
             className={cn(
               "p-3 bg-white rounded-xl shadow-xl hover:bg-gray-50 border border-gray-100 transition-all",
               isLocating && "animate-pulse"
             )}
             title="Locate Me"
           >
             <Navigation className={cn("w-6 h-6", isLocating ? "text-blue-400" : "text-blue-600")} />
           </button>
           <button className="p-3 bg-white rounded-xl shadow-xl hover:bg-gray-50 border border-gray-100">
             <Layers className="w-6 h-6 text-gray-700" />
           </button>
           <div className="flex flex-col bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
             <button className="p-3 hover:bg-gray-50 border-b border-gray-100 text-xl font-bold">+</button>
             <button className="p-3 hover:bg-gray-50 text-xl font-bold">−</button>
           </div>
        </div>

        {/* Safety Legend */}
        {routeDetails && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[500] flex gap-4">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-green-200 flex items-center gap-3"
            >
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold text-gray-800">Safe Route: {routeDetails.safe.score}%</span>
            </motion.div>
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-red-200 flex items-center gap-3"
            >
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-bold text-gray-800">Risk Route: {100 - routeDetails.risk.score}% Risk</span>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

const EmergencyFlow = () => {
  const steps = [
    { icon: AlertCircle, label: "SOS Triggered", color: "bg-red-500" },
    { icon: Phone, label: "Emergency Call", color: "bg-orange-500" },
    { icon: Users, label: "Contacts Notified", color: "bg-purple-500" },
    { icon: MapPin, label: "Live Tracking", color: "bg-green-500" }
  ];

  return (
    <section id="emergency" className="py-32 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-20">
          Instant Response. <span className="text-red-500">Zero Delay.</span>
        </h2>

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-12">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-purple-500 to-green-500 hidden md:block opacity-20"></div>
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl", step.color)}>
                <step.icon className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-xl font-bold">{step.label}</h4>
              <p className="text-white/40 text-sm mt-2">Automated & Encrypted</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ZoomControl = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  return (
    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
      <button 
        onClick={() => map.zoomIn()}
        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl transition-all active:scale-95"
        title="Zoom In"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl transition-all active:scale-95"
        title="Zoom Out"
      >
        <Minus className="w-6 h-6 text-white" />
      </button>
      <button 
        onClick={() => map.flyTo(center, 14)}
        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl transition-all active:scale-95"
        title="Reset View"
      >
        <Maximize className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

const LocateControl = () => {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-6 z-[1000]">
      <button 
        onClick={() => {
          map.locate().on('locationfound', (e) => {
            map.flyTo(e.latlng, 16);
          });
        }}
        className="p-3 bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-2xl transition-all active:scale-95 group"
        title="Locate Me"
      >
        <Navigation className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};

const areaCoords: { [key: string]: [number, number] } = {
  'Shegaon': [20.7993, 76.6906],
  'Adsul': [20.8150, 76.7100],
  'Alsana': [20.7850, 76.6700],
  'Jalamb': [20.8300, 76.6200],
  'Nagzari': [20.7600, 76.7300],
  'Janori': [20.8400, 76.7000],
  'Takli Viro': [20.7500, 76.6500]
};

const PoliceMapSection = () => {
  const shegaonCenter: [number, number] = [20.7993, 76.6906];
  const [areaRisks, setAreaRisks] = useState<any[]>([]);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const { data, error } = await supabase.from('area_risk').select('*');
        if (error) throw error;
        if (data) setAreaRisks(data);
      } catch (err) {
        console.error('Error fetching area risks:', err);
      }
    };
    fetchRisks();
  }, []);

  const policeStations = [
    {
      id: 1,
      name: "Shegaon City Police Station",
      position: [20.7993, 76.6906] as [number, number],
      address: "Near Railway Station, Shegaon, Maharashtra 444203",
      phone: "07265252010",
      areas: [
        "Shegaon City", "Rokdiya Nagar", "Gajanan Maharaj Temple Area", 
        "Railway Station Area", "Main Market", "Shivaji Chowk", "Venkatesh Nagar"
      ],
      radius: 2000 
    },
    {
      id: 2,
      name: "Shegaon Rural Police Station",
      position: [20.8050, 76.6850] as [number, number],
      address: "Khamgaon Road, Shegaon, Maharashtra 444203",
      phone: "07265252011",
      areas: [
        "Jalamb", "Alasna", "Adsul", "Nagzari", "Janori", 
        "Jawala", "Takli Viro", "Zadegaon", "Sagoda", "Kherda"
      ],
      radius: 5000 
    }
  ];

  const policeIcon = new L.DivIcon({
    html: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
           </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });

  return (
    <section id="police-map" className="py-32 px-6 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <ShieldCheck className="w-3 h-3" /> Police Coverage Map
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-8 leading-none"
          >
            Nirbhay Navigator - <br />
            <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Police Coverage Map</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Real-time visualization of police jurisdiction and coverage areas in Shegaon. 
            Ensuring rapid response and community safety.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Legend & Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="glass p-6 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold mb-6">Map Legend</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500/40" />
                  <span className="text-sm font-medium text-white/70">Police Coverage Area</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/70">Police Station</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-500/30 border-2 border-red-500/50" />
                  <span className="text-sm font-medium text-white/70">High Risk Zone</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-orange-500/30 border-2 border-orange-500/50" />
                  <span className="text-sm font-medium text-white/70">Risky Zone</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-500/30 border-2 border-green-500/50" />
                  <span className="text-sm font-medium text-white/70">Safe Zone</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold mb-4">Quick Info</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                The map displays active police stations and their approximate jurisdiction areas. 
                Click on a marker to see contact details and covered regions.
              </p>
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1">
                  <Phone className="w-3 h-3" /> Emergency Helpline
                </div>
                <div className="text-xl font-black text-white tracking-tighter">112 / 100</div>
              </div>
            </div>
          </motion.div>

          {/* Map Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 h-[600px] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative z-10"
          >
            <MapContainer 
              center={shegaonCenter} 
              zoom={14} 
              className="w-full h-full"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              <LocateControl />
              <ZoomControl center={shegaonCenter} />
              
              {/* Risk Areas from Authority Updates */}
              {areaRisks.map((risk) => {
                const coords = areaCoords[risk.area_name];
                if (!coords) return null;
                const color = risk.risk_level === 'high' ? '#ef4444' : risk.risk_level === 'medium' ? '#f59e0b' : '#10b981';
                return (
                  <Circle
                    key={risk.id}
                    center={coords}
                    radius={1000}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.3 }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[150px]">
                        <h3 className="font-bold text-lg border-b border-gray-100 pb-1 mb-2">{risk.area_name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn("w-2 h-2 rounded-full", risk.risk_level === 'high' ? "bg-red-500" : risk.risk_level === 'medium' ? "bg-orange-500" : "bg-green-500")} />
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                            {risk.risk_level === 'high' ? 'Highly Risky' : risk.risk_level === 'medium' ? 'Risky' : 'Safe'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 italic leading-tight">"{risk.last_crime_type}"</p>
                        <p className="text-[8px] text-gray-400 mt-2 uppercase tracking-tighter">Updated: {new Date(risk.updated_at).toLocaleDateString()}</p>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}

              {policeStations.map(station => (
                <React.Fragment key={station.id}>
                  <Marker position={station.position} icon={policeIcon}>
                    <Popup className="custom-popup">
                      <div className="p-4 min-w-[250px] bg-slate-900 text-white rounded-2xl">
                        <h4 className="text-lg font-bold mb-2 text-blue-400">{station.name}</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-white/40 shrink-0 mt-1" />
                            <p className="text-xs text-white/70">{station.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-white/40 shrink-0" />
                            <p className="text-xs font-bold text-white">{station.phone}</p>
                          </div>
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Jurisdiction Area</span>
                            <div className="flex flex-wrap gap-1">
                              {station.areas.map((area, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white/5 rounded-md text-[9px] text-white/60 border border-white/5">
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle 
                    center={station.position} 
                    radius={station.radius} 
                    pathOptions={{ 
                      fillColor: '#3b82f6', 
                      fillOpacity: 0.15, 
                      color: '#3b82f6', 
                      weight: 2, 
                      dashArray: '5, 10' 
                    }} 
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-20 px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
      <Logo />

      <div className="flex flex-col items-center md:items-start gap-4">
        <div className="text-white/40 text-sm font-medium text-center md:text-left">
          <p className="mb-1">Developed by:</p>
          <p className="text-white/60">1. Ashwin Arun Kurekar</p>
          <p className="text-white/60">2. Dolly Diwate</p>
          <p className="text-white/60">3. Raman Ollala</p>
          <p className="mt-2 text-orange-500/80">ashwinkurekarofficial1@gmail.com</p>
        </div>
      </div>

      <div className="flex gap-8 text-white/40 text-sm font-medium">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Contact Us</a>
      </div>

      <div className="flex gap-4">
        {[Zap, Heart, Shield].map((Icon, i) => (
          <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">
            <Icon className="w-5 h-5 text-white/60" />
          </div>
        ))}
      </div>
    </div>
    <div className="text-center text-white/20 text-xs mt-12">
      © 2026 <span className="font-hindi font-bold">निर्भय</span> <span className="font-anton uppercase tracking-widest">Navigator</span> Safety Systems. All rights reserved.
    </div>
  </footer>
);

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  priority: number;
  created_at: string;
};

// ... inside App component ...
export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', priority: 1 });
  const [escalationStatus, setEscalationStatus] = useState<'none' | 'contacts' | 'police'>('none');

  useEffect(() => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!isConfigured) {
      setUser(null);
      setIsProfileLoading(false);
      return;
    }

    checkUser();
    
    // Listen for auth state changes to keep UI in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (_event === 'SIGNED_OUT') {
        setProfile(null);
        setShowLanding(true);
        setShowAuth(false);
      } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchContacts();
    } else {
      setProfile(null);
    }
  }, [user]);

  const checkUser = async () => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!isConfigured) {
      setUser(null);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        if (error.message.includes('refresh_token_not_found') || 
            error.message.includes('Invalid Refresh Token') ||
            error.message.includes('Refresh Token Not Found') ||
            error.message.includes('Auth session missing')) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          return;
        }
        throw error;
      }
      setUser(user);
      if (user) {
        await fetchProfile(user.id);
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      if (err.message !== 'Failed to fetch' && !err.message.includes('Auth session missing')) {
        console.error('Error checking user session:', err);
      }
      setUser(null);
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onAuthSuccess = async () => {
    await checkUser();
  };

  const fetchProfile = async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) setProfile(data);
    } catch (err: any) {
      if (err.message !== 'Failed to fetch') {
        console.error('Error fetching profile:', err);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setShowLanding(true);
    setShowAuth(false);
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      if (data) setContacts(data);
    } catch (err) {
      console.log("Using local storage for contacts fallback");
      const localContacts = localStorage.getItem('emergency_contacts');
      if (localContacts) setContacts(JSON.parse(localContacts));
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contacts.length >= 5) return alert("Maximum 5 contacts allowed");
    
    const newContactData = {
      ...newContact,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        if (userError.message.includes('refresh_token_not_found') || 
            userError.message.includes('Invalid Refresh Token') ||
            userError.message.includes('Refresh Token Not Found')) {
          await supabase.auth.signOut();
          alert("Your session has expired. Please log in again.");
          return;
        }
        throw userError;
      }
      if (user) {
        const { error } = await supabase.from('emergency_contacts').insert([
          { ...newContact, user_id: user.id }
        ]);
        if (error) throw error;
      } else {
        // Fallback to local storage if not logged in
        const updatedContacts = [...contacts, newContactData];
        localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
      }
      
      setNewContact({ name: '', phone: '', priority: contacts.length + 1 });
      fetchContacts();
    } catch (err) {
      const updatedContacts = [...contacts, newContactData];
      localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
      setNewContact({ name: '', phone: '', priority: contacts.length + 1 });
      fetchContacts();
    }
  };

  const triggerSOS = async () => {
    setIsEmergencyActive(true);
    setEscalationStatus('contacts');
    
    // 1. Vibration feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // 2. Sound alert (Simulated)
    const audio = new Audio('https://www.soundjay.com/buttons/beep-01a.mp3');
    audio.play().catch(e => console.log("Audio play blocked"));

    // 3. Initiate Phone Call to Primary Contact
    if (contacts && contacts.length > 0) {
      const primaryContact = contacts[0]; // Already sorted by priority in fetchContacts
      
      // Small delay to allow vibration/sound to start
      setTimeout(() => {
        window.location.href = `tel:${primaryContact.phone}`;
      }, 500);
    } else {
      // Fallback to local storage check
      const localContacts = localStorage.getItem('emergency_contacts');
      if (localContacts) {
        const parsed = JSON.parse(localContacts);
        if (parsed.length > 0) {
          const sorted = parsed.sort((a: any, b: any) => a.priority - b.priority);
          window.location.href = `tel:${sorted[0].phone}`;
        } else {
          alert("No emergency contacts found. Please add contacts in settings to enable direct calling.");
        }
      } else {
        alert("No emergency contacts found. Please add contacts in settings to enable direct calling.");
      }
    }

    // 4. Get current location and trigger backend
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          if (userError.message.includes('refresh_token_not_found') || 
              userError.message.includes('Invalid Refresh Token') ||
              userError.message.includes('Refresh Token Not Found')) {
            await supabase.auth.signOut();
            alert("Your session has expired. Please log in again.");
            return;
          }
          throw userError;
        }

        const res = await fetch('/api/trigger-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: { lat: latitude, lng: longitude },
            userId: user?.id,
            message: "EMERGENCY: I am in danger. Please help!",
            contacts: contacts // Send current contacts to backend
          })
        });
        
        const data = await res.json();
        if (data.success) {
          console.log("SOS Alerts initiated");
        }

        // 4. Escalation Logic (Simulated timeout if no response)
        setTimeout(() => {
          if (isEmergencyActive) {
            setEscalationStatus('police');
            alert("Escalating to nearest Police Station...");
            // In a real app, we would call Google Places API here to find nearest police station
          }
        }, 30000); // 30 seconds for contacts to respond

      } catch (err) {
        console.error("SOS Trigger failed:", err);
      }
    });
  };

  return (
    <div className={cn("min-h-screen selection:bg-orange-500/30 transition-colors duration-1000", isEmergencyActive ? "bg-red-950/40" : "bg-black")}>
      <AnimatePresence mode="wait">
        {showLanding && !user ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onEnter={() => {
              setShowLanding(false);
              setShowAuth(true);
            }} />
          </motion.div>
        ) : isProfileLoading ? (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : showAuth && !user ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AuthPage onAuthSuccess={onAuthSuccess} />
          </motion.div>
        ) : showReport ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <ReportIncidentScreen onBack={() => setShowReport(false)} />
          </motion.div>
        ) : profile?.role === 'authority' ? (
          <motion.div
            key="authority"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar onOpenContacts={() => setShowContactsModal(true)} onLogout={handleLogout} />
            <AuthorityDashboard />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Navbar onOpenContacts={() => setShowContactsModal(true)} onLogout={handleLogout} />
            
            {/* Emergency Status Indicator */}
            <AnimatePresence>
              {isEmergencyActive && (
                <motion.div 
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  exit={{ y: -100 }}
                  className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full bg-red-600 text-white font-bold flex flex-col items-center gap-2 shadow-2xl border border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
                    EMERGENCY STATUS: {escalationStatus.toUpperCase()} ALERT ACTIVE
                  </div>
                  <button 
                    onClick={() => setIsEmergencyActive(false)} 
                    className="px-6 py-1 bg-green-600 hover:bg-green-500 rounded-full text-sm transition-colors flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" /> I'm Safe
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <HeroSection onTriggerSOS={triggerSOS} user={user} />
            
            <section id="protection" className="py-32 px-6">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                  icon={Shield}
                  title="Active Shield"
                  desc="Continuous monitoring of your surroundings using AI to detect anomalies in your environment."
                  color="bg-purple-500 blur-[80px]"
                />
                <FeatureCard 
                  icon={Navigation}
                  title="Safe Routing"
                  desc="Dynamic navigation that prioritizes well-lit, populated, and low-crime areas for your journey."
                  color="bg-blue-500 blur-[80px]"
                />
                <FeatureCard 
                  icon={Zap}
                  title="Instant SOS"
                  desc="A single tap triggers a multi-channel alert system to your contacts and local emergency services."
                  color="bg-pink-500 blur-[80px]"
                />
              </div>
            </section>

            <SafeRouteSection />
            <PoliceMapSection />
            <EmergencyFlow />
            
            <section id="report" className="py-32 px-6 bg-slate-950">
              <div className="max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest mb-6">
                  <AlertCircle className="w-3 h-3" /> Incident Reporting
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mb-8 leading-none">
                  See something? <br />
                  <span className="text-red-500">Report it.</span>
                </h2>
                <p className="text-white/50 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                  Your reports help authorities and other users stay safe. Every report is verified and used to update our live risk mapping.
                </p>
                <button 
                  onClick={() => setShowReport(true)}
                  className="px-12 py-5 bg-red-600 hover:bg-red-700 rounded-full font-bold text-xl shadow-2xl shadow-red-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
                >
                  <Plus className="w-6 h-6" /> Report an Incident
                </button>
              </div>
            </section>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Contacts Modal */}
      <AnimatePresence>
        {showContactsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass w-full max-w-md p-8 rounded-[32px] border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-display font-bold">Emergency Contacts</h3>
                  <p className="text-xs text-white/40 mt-1">Add up to 5 priority contacts</p>
                  <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-[10px] text-yellow-500 leading-tight">
                      <span className="font-bold">Note:</span> If using a Twilio Trial account, you must verify these numbers in your Twilio Console first.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowContactsModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {contacts.length < 5 && (
                <form onSubmit={handleAddContact} className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Name"
                      value={newContact.name}
                      onChange={e => setNewContact({...newContact, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                      required
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone"
                      value={newContact.phone}
                      onChange={e => setNewContact({...newContact, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-xs text-white/40">Priority (1-5):</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5"
                      value={newContact.priority}
                      onChange={e => setNewContact({...newContact, priority: parseInt(e.target.value)})}
                      className="w-20 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
                    />
                    <button type="submit" className="flex-1 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 transition-colors">
                      Add
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {contacts.map(contact => (
                  <div key={contact.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-purple-400">
                        #{contact.priority}
                      </div>
                      <div>
                        <div className="font-bold">{contact.name}</div>
                        <div className="text-xs text-white/40">{contact.phone}</div>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          const { error } = await supabase.from('emergency_contacts').delete().eq('id', contact.id);
                          if (error) throw error;
                        } catch (err) {
                          const updatedContacts = contacts.filter(c => c.id !== contact.id);
                          localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
                        }
                        fetchContacts();
                      }}
                      className="text-red-500 hover:text-red-400 p-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
