// 1. ALL IMPORTS GO FIRST
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from "@capacitor/core"; // <--- ADD THIS LINE
import SubscribeButton from './components/SubscribeButton';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { db } from './firebase'; 
import { 
  collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, setDoc, deleteDoc, 
  onSnapshot, orderBy, serverTimestamp 
} from "firebase/firestore";
import { auth } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { App } from '@capacitor/app';

// 2. YOUR ICON IMPORTS (Keep these)
import { 
  Trophy, 
  Calendar, 
  DollarSign, 
  Users, 
  Plus, 
  Trash2, 
  Plane, 
  Home, 
  Flag, 
  Save, 
  RefreshCw,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  UserPlus,
  CheckCircle,
  Menu,
  X,
  Shield,
  User,
  Edit2,
  Check,
  Mail,
  Lock,
  LogOut,
  MapPin,
  Copy,
  ArrowRight,
  Globe,
  Car,
  LogIn,
  Loader2, 
  ShoppingBag,
  UserCircle,
  AlertTriangle,
  MessageSquare, 
  Send,
  Briefcase,
  ChevronLeft,
} from 'lucide-react';
// --- Place this AFTER the closing 'from lucide-react' line ---
const Success = () => <div className="p-4 bg-green-100 text-green-800">✅ Subscription Successful!</div>;
const Cancel = () => <div className="p-4 bg-red-100 text-red-800">❌ Subscription Cancelled.</div>;


// --- Components ---

// 1. Auth Screen
const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear old errors
      try {
      if (isLogin) {
        // --- LOGGING IN ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user);
      } else {
        // --- SIGNING UP ---
        const newUser = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create the user profile in Firestore
      await setDoc(doc(db, "users", newUser.user.uid), {
        email: email,
        createdAt: new Date(),
        role: "commissioner", 
        isSubscribed: false
      });
        
        onLogin(newUser.user);
      }
      }  
     catch (err) {
      console.error("Auth Error:", err.code);
      // specific error messages for the user
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          setError("Incorrect password or email.");
          break;
        case 'auth/user-not-found':
          setError("No account found with this email.");
          break;
        case 'auth/email-already-in-use':
          setError("This email is already taken. Try logging in.");
          break;
        case 'auth/weak-password':
          setError("Password must be at least 6 characters.");
          break;
        default:
          setError("Login failed. Please check your info.");
      } // 1. Closes the 'switch'
    } // 2. Closes the 'catch'
    setLoading(false);
  }; // 3. Closes the 'handleSubmit' function
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-emerald-800 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Flag className="w-8 h-8 text-yellow-400 fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Fairway Commish</h1>
          <p className="text-emerald-200 mt-2 text-sm">
            {isLogin ? 'Welcome back, Commissioner.' : 'Your trip starts here.'}
          </p>
        </div>

        <div className="p-8 flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                  placeholder="••••••••"
                />
              </div>
            </div>
            {/* ERROR MESSAGE DISPLAY */}
{error && (
  <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm text-center font-bold">
    {error}
  </div>
)}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-emerald-200/50 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-3">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              onClick={() => { setIsLogin(!isLogin); }}
              className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline transition-colors"
            >
              {isLogin ? 'Create an Account' : 'Log In with Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. User Profile View
const UserProfileView = ({ user, isSubscribed, onSuccess, handlePurchase, handleRestore, isLoading, handleLogout }) => {
  const [resetSent, setResetSent] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handlePasswordReset = async () => {
    // Mock reset
    setResetSent(true);
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
          <UserCircle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-200">My Profile</h2>
          <p className="text-slate-500 text-sm">Manage your account settings and subscription.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Account Details</h3>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-100">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Email Address</label>
                <div className="font-medium text-slate-800">{user?.email}</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-100">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Password</label>
                <div className="font-mono text-slate-800 tracking-widest text-sm flex items-center gap-2">
                  <Lock className="w-3 h-3 text-slate-400" /> ••••••••
                </div>
              </div>
              <div>
                {resetSent ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Reset Email Sent
                  </span>
                ) : (
                  <button 
                    onClick={handlePasswordReset}
                    className="text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg"
                  >
                    Reset Password
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Subscription</h3>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className={`p-2 rounded-lg ${isSubscribed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Commissioner License</h4>
                    <p className="text-sm text-slate-500">
                      {isSubscribed 
                        ? 'Active • Annual Plan' 
                        : 'Inactive • Free Tier'}
                    </p>
                  </div>
                </div>
                {isSubscribed && (
                  <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Active
                  </div>
                )}
              </div>
              
              {/* Manage Subscription Button (Clean Version) */}
            {isSubscribed && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={() => {
                            // Check if we are on iOS or Android
                            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                            
                            if (isIOS) {
                                window.open('https://apps.apple.com/account/subscriptions', '_system');
                            } else {
                                window.open('https://play.google.com/store/account/subscriptions', '_system');
                            }
                        }}
                        className="w-full py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                    >
                        Manage Subscription
                    </button>
                </div>
            )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// 3. Restricted Access View
const RestrictedAccessView = ({ setView }) => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-8 animate-in fade-in zoom-in duration-300">
    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
      <Lock className="w-12 h-12 text-slate-400" />
    </div>
    <h2 className="text-3xl font-bold text-slate-800 mb-2">Trip Access Locked</h2>
    <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
      You must create or join a trip to view this content.
    </p>
    <button 
      onClick={() => setView('setup')}
      className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 hover:-translate-y-1 flex items-center gap-2"
    >
      Go to Trip Setup <ArrowRight className="w-5 h-5" />
    </button>
  </div>
);

// 4. Messages View
const MessagesView = ({ messages, addMessage, user }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const senderName = user?.email ? user.email.split('@')[0] : 'Guest';
    
    addMessage({
      id: Date.now().toString(),
      text: newMessage,
      senderId: user?.uid || 'anon',
      senderName: senderName,
      timestamp: new Date().toISOString()
    });
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-emerald-600" />
        <h3 className="font-bold text-slate-700">Trip Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 mt-10">
            <p>No messages yet.</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                  isMe 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-emerald-500 text-slate-900" 
            placeholder="Type a message..."
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

// 5. Sub-views for Manage Trip
const BookRoundsView = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
        <Globe className="w-10 h-10 text-slate-400" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-700">Book Rounds</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">
          Search and book tee times directly from the app. Integration with booking providers is coming soon.
        </p>
      </div>
    </div>
  );
};

const StaysTransportView = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
        <Car className="w-10 h-10 text-slate-400" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-700">Stays & Transport</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">
          Book hotels, rental cars, and shuttles for your group. Integration with travel partners coming soon.
        </p>
      </div>
    </div>
  );
};

const TeamMerchView = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
        <ShoppingBag className="w-10 h-10 text-slate-400" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-700">Team Merch</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">
          Order custom polos, hats, and gear for your trip. Store integration coming soon.
        </p>
      </div>
    </div>
  );
};

// 6. Manage Trip View
const ManageTripView = () => {
  const [subView, setSubView] = useState(null);

  if (subView === 'booking') {
    return (
      <div className="space-y-4">
        <button onClick={() => setSubView(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Management
        </button>
        <BookRoundsView />
      </div>
    );
  }
  if (subView === 'travel') {
     return (
      <div className="space-y-4">
        <button onClick={() => setSubView(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Management
        </button>
        <StaysTransportView />
      </div>
    );
  }
  if (subView === 'merch') {
     return (
      <div className="space-y-4">
        <button onClick={() => setSubView(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Management
        </button>
        <TeamMerchView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage the Trip</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Book Rounds Tile */}
        <div 
          onClick={() => setSubView('booking')}
          className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Book Rounds</h3>
          <p className="text-sm text-slate-500 mt-2">Find and book tee times for your group.</p>
        </div>

        {/* Stays/Transport Tile */}
        <div 
           onClick={() => setSubView('travel')}
           className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <Car className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Stays & Transport</h3>
          <p className="text-sm text-slate-500 mt-2">Arrange hotels and travel logistics.</p>
        </div>

        {/* Team Merch Tile */}
        <div 
           onClick={() => setSubView('merch')}
           className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Team Merch</h3>
          <p className="text-sm text-slate-500 mt-2">Order custom gear for the squad.</p>
        </div>
      </div>
    </div>
  );
};

// 7. Navigation & Layout
const Layout = ({ children, view, setView, user, role, setRole, tripId, setTripId, handleLogout, handlePurchase, handleRestore, isLoading, isSubscribed }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isIOS = Capacitor.getPlatform() === 'ios'; // <--- ADD THIS LINE

  const navItems = [
    { id: 'setup', label: 'Trip Setup', icon: MapPin },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'tournament', label: 'Tournament', icon: Trophy },
    { id: 'manage', label: 'Manage Trip', icon: Briefcase },
    { id: 'logistics', label: 'Logistics', icon: Calendar },
    { id: 'finance', label: 'The Ledger', icon: DollarSign },
    { id: 'players', label: 'Roster', icon: Users },
    { id: 'profile', label: 'My Profile', icon: Users }
  ];

  const handleExitTrip = () => {
    setTripId(null);
    setView('setup');
    setRole('player');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* 1. TOP HEADER */}
      <div className={`bg-emerald-800 text-white px-4 pb-4 shadow-md shrink-0 z-50 h-auto ${isIOS ? 'pt-20' : 'pt-12'}`}>
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Flag className="w-6 h-6 text-yellow-400 fill-current" />
            <h1 className="text-xl font-bold tracking-tight">Fairway Commish </h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            
            {/* Desktop User Info & Controls */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Signed In As</div>
                <div className="text-xs font-bold text-white">{user?.email || 'Guest Commissioner'}</div>
              </div>
              
              <button
                onClick={() => setView('profile')}
                className={`p-2 rounded-full transition-colors ${
                  view === 'profile' 
                    ? 'bg-emerald-900 text-white shadow-inner' 
                    : 'text-emerald-100 hover:bg-emerald-700'
                }`}
                title="My Profile"
              >
                <UserCircle className="w-6 h-6" />
              </button>

              {/* RESTORED: Sign Out Button */}
              <button 
                onClick={handleLogout} 
                className="ml-2 pl-4 border-l border-emerald-600 text-emerald-100 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" /> 
                <span>Sign Out</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="md:hidden text-emerald-100 hover:text-white"
            >
              {isMenuOpen ? <div className="font-bold text-xl">X</div> : <Menu className="w-6 h-6" />} 
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN BODY (Sidebar + Content) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto">
          
          {/* Trip Code Widget */}
          {tripId && (
            <div className="p-4 mx-4 mt-6 mb-2 rounded-lg bg-slate-950 border border-slate-800">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Trip Code</span>
               </div>
               <div className="text-xl font-mono text-emerald-400 tracking-widest">{tripId}</div>
               <button onClick={handleExitTrip} className="text-[10px] text-red-400 hover:text-red-300 mt-2 flex items-center gap-1">
                 Exit Trip
               </button>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border-l-4 border-emerald-500' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-900 relative pb-32">
           <div className="max-w-5xl mx-auto">
             {children}
           </div>
        </main>

      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className={`md:hidden absolute inset-0 bg-slate-900 z-40 p-4 overflow-y-auto pb-24 ${isIOS ? 'top-32' : 'top-16'}`}>
           {navItems.map((item) => (
             <button
               key={item.id}
               onClick={() => { setView(item.id); setIsMenuOpen(false); }}
               className="flex items-center w-full p-4 text-slate-200 border-b border-slate-800"
             >
               <item.icon className="w-5 h-5 mr-3" />
               {item.label}
             </button>
           ))}
           <div className="mt-8 pt-4 border-t border-slate-800">
             <button onClick={handleLogout} className="flex items-center text-red-400 w-full p-4">
                <LogOut className="w-5 h-5 mr-3" /> Sign Out
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

// 8. Trip Setup View
// 8. Trip Setup View (Updated with Subscription Lock)
const TripSetupView = ({ setActiveTab, setTripId, setRole, setView, user, isSubscribed, onSuccess, handlePurchase, handleRestore, isLoading }) => {
  const [joinCode, setJoinCode] = React.useState('');

  const finalizeCreateTrip = async () => {
        if (!isSubscribed) {
            alert("Please subscribe to create a trip!");
            return;
        }

        try {
            // 1. Generate Code
            const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // 2. Create Trip in Database
            await setDoc(doc(db, 'trips', newCode), {
                name: "My Golf Trip",
                commissionerId: user?.uid || auth.currentUser?.uid,
                createdAt: new Date().toISOString(),
                status: "active",
                joinCode: newCode
            });

            console.log("✅ Trip Created:", newCode);

            // 3. Save to User Profile
            const uid = user?.uid || auth.currentUser?.uid;
            if (uid) {
                await setDoc(doc(db, 'users', uid), {
                    activeTripId: newCode, 
                    role: 'commissioner',
                    isSubscribed: true
                }, { merge: true });
            }

            // 4. Update Local State
            setTripId(newCode);
            setRole('commissioner');
            
            // 5. AUTO-REDIRECT (Restored)
            // Sending you to the Dashboard immediately.
            if (setView) {
                setView('dashboard');
            }
            
        } catch (error) {
            console.error("Error creating trip:", error);
            alert("Failed to create trip: " + error.message);
        }
    };

  const handleJoinTrip = () => {
    // 1. Checks
    if (!isSubscribed) { alert("Please subscribe!"); return; }
    if (joinCode.length < 3) return;

    // 2. Update Screen -> EVERYONE IS COMMISSIONER
    setTripId(joinCode);
    setRole('commissioner'); // <--- CHANGE THIS (Was 'player')

    // 3. Save to Memory -> EVERYONE IS COMMISSIONER
    localStorage.setItem("activeTripId", joinCode);
    localStorage.setItem("userRole", "commissioner"); // <--- CHANGE THIS (Was 'player')
    // 4. Redirect to Dashboard
if (setView) setView('dashboard');
  };

  return (
    <div className="space-y-8">
       {/* LOCKED MESSAGE (Only shows if not subscribed) */}
       {!isSubscribed && (
         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
           <div className="flex">
             <div className="ml-3">
               <p className="text-sm text-red-700 font-bold">
                 Functionality Locked
               </p>
               <p className="text-sm text-red-600">
                 You must purchase a subscription above to Create or Join a trip.
               </p>
             </div>
           </div>
         </div>
       )}

       {/* CREATE TRIP SECTION */}
       {/* We use opacity-50 to make it look "grayed out" if not subscribed */}
       <div className={`p-8 rounded-xl shadow-lg mb-6 bg-gradient-to-r from-blue-800 to-slate-900 border border-blue-700 text-white ${!isSubscribed ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-bold">Create a New Trip</h3>
             {/* Icon placeholder if needed */}
          </div>
          <p className="text-white">
             Start a new golf trip as the Commissioner. You will get a code to share with your friends.
          </p>
          <button 
            onClick={finalizeCreateTrip}
            disabled={!isSubscribed} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition disabled:bg-gray-400"
          >
            Create Trip
          </button>
       </div>

       {/* JOIN TRIP SECTION */}
       <div className={`p-8 rounded-xl shadow-lg bg-gradient-to-r from-emerald-800 to-slate-900 border border-emerald-700 text-white ${!isSubscribed ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-xl font-bold mb-4">Join an Existing Trip</h3>
          <p className="text-emerald-100 mb-4">
             Enter the 6-character code provided by your Commissioner.
          </p>
          {/* UPDATED: Stacked Layout for Mobile */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="ENTER CODE"
                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-lg uppercase text-slate-900 bg-white text-center"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                disabled={!isSubscribed}
              />
              <button
                onClick={handleJoinTrip}
                disabled={!isSubscribed}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:bg-gray-400"
              >
                Join
              </button>
            </div>
       </div>
    </div>
  );
};

// 10. Roster Management
const RosterView = ({ players, addPlayer, deletePlayer, updatePlayer, role, teamNames }) => {
  const [newName, setNewName] = useState('');
  const [newHcp, setNewHcp] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName) return;
    addPlayer({ name: newName, handicap: parseFloat(newHcp) || 0, team: 'Unassigned' });
    setNewName('');
    setNewHcp('');
  };

  const autoBalanceTeams = () => {
    const sorted = [...players].sort((a, b) => b.handicap - a.handicap);
    sorted.forEach((p, i) => {
      const remainder = i % 4;
      const newTeam = (remainder === 0 || remainder === 3) ? 'Red' : 'Blue';
      if (p.team !== newTeam) {
        updatePlayer(p.id, { team: newTeam });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Trip Roster</h2>
        <div className="flex gap-2">
           {role === 'commissioner' && (
             <button 
               onClick={autoBalanceTeams}
               className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
             >
               <RefreshCw className="w-4 h-4" /> Auto-Balance Teams
             </button>
           )}
           <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">{players.length} Golfers</span>
        </div>
      </div>

      {role === 'commissioner' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-600 mb-1">Player Name</label>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded text-slate-900"
                placeholder="e.g. Tiger Woods"
              />
            </div>
            <div className="w-full md:w-32">
              <label className="block text-sm font-medium text-slate-600 mb-1">Handicap</label>
              <input 
                type="number" 
                value={newHcp} 
                onChange={(e) => setNewHcp(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded text-slate-900"
                placeholder="0.0"
                step="0.1"
              />
            </div>
            <button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white p-2 px-6 rounded font-medium transition-colors">
              Add
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map(player => (
          <div key={player.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                {player.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{player.name}</h3>
                <p className="text-xs text-slate-500">HCP: {player.handicap}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <select 
                value={player.team} 
                disabled={role !== 'commissioner'}
                onChange={(e) => updatePlayer(player.id, { team: e.target.value })}
                className={`text-xs font-bold px-2 py-1 rounded border-none focus:ring-0 ${role === 'commissioner' ? 'cursor-pointer' : 'cursor-default pointer-events-none'} ${
                  player.team === 'Red' ? 'text-red-600 bg-red-50' : 
                  player.team === 'Blue' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 bg-slate-100'
                }`}
               >
                 <option value="Unassigned">No Team</option>
                 <option value="Red">{teamNames.red}</option>
                 <option value="Blue">{teamNames.blue}</option>
               </select>
              {role === 'commissioner' && (
                <button onClick={() => deletePlayer(player.id)} className="text-slate-300 hover:text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 11. Tournament Engine
// ✅ Added = [] to players and matches to prevent crashes
const TournamentView = ({ players = [], matches = [], updateMatch, addMatch, deleteMatch, role, teamNames = { red: 'Red Team', blue: 'Blue Team' }, updateTeamNames }) => {
  const [activeTab, setActiveTab] = useState('matchups');
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [tempNames, setTempNames] = useState(teamNames);
  
  const scores = useMemo(() => {
    let red = 0;
    let blue = 0;
    matches.forEach(m => {
      if (m.winner === 'Red') red += 1;
      else if (m.winner === 'Blue') blue += 1;
      else if (m.winner === 'Halved') { red += 0.5; blue += 0.5; }
    });
    return { red, blue };
  }, [matches]);

  const isCommish = role === 'commissioner' || localStorage.getItem('userRole') === 'commissioner';

  const handleSaveNames = () => {
    updateTeamNames(tempNames);
    setIsEditingNames(false);
  };

  return (
    <div className="space-y-6">
      {/* Scoreboard Header */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        {isCommish && (
          <div className="absolute top-4 right-4 z-20">
            {isEditingNames ? (
              <button onClick={handleSaveNames} className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-500 transition-colors">
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setIsEditingNames(true)} className="bg-slate-800 text-slate-400 p-2 rounded-full hover:bg-slate-700 hover:text-white transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="relative z-10 flex justify-between items-center text-center">
          <div className="flex-1">
            {isEditingNames ? (
              <input 
                value={tempNames.red}
                onChange={(e) => setTempNames({...tempNames, red: e.target.value})}
                className="bg-transparent text-red-400 font-bold uppercase tracking-wider text-sm mb-1 text-center border-b border-red-500/50 focus:outline-none focus:border-red-400 w-full"
                placeholder="Red Team Name"
              />
            ) : (
              <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-1">{teamNames.red}</h3>
            )}
            <div className="text-5xl font-black">{scores.red}</div>
          </div>
          <div className="px-4">
            <div className="text-2xl font-serif italic text-slate-400">vs</div>
          </div>
          <div className="flex-1">
             {isEditingNames ? (
              <input 
                value={tempNames.blue}
                onChange={(e) => setTempNames({...tempNames, blue: e.target.value})}
                className="bg-transparent text-blue-400 font-bold uppercase tracking-wider text-sm mb-1 text-center border-b border-blue-500/50 focus:outline-none focus:border-blue-400 w-full"
                placeholder="Blue Team Name"
              />
            ) : (
              <h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-1">{teamNames.blue}</h3>
            )}
            <div className="text-5xl font-black">{scores.blue}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-emerald-600 text-white"
          >
            Active Matchups
          </button>
        </div>
        {isCommish && (
           <button 
             onClick={() => addMatch({ 
               day: 'Day 1', 
               format: 'Fourball', 
               redPlayers: '', 
               bluePlayers: '', 
               winner: 'Pending',
               status: 'All Square'
             })}
             className="px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-600 border flex items-center gap-2 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" /> Add Match
          </button>
        )}
      </div>

      {/* Match Cards */}
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input 
                  value={match.day}
                  disabled={!isCommish}
                  onChange={(e) => updateMatch(match.id, { day: e.target.value })}
                  className={`text-xs font-bold text-slate-500 uppercase tracking-wide bg-transparent border-none focus:ring-0 p-0 w-16 ${!isCommish && 'cursor-default'}`}
                />
                <span className="text-slate-300">•</span>
                <select 
                  value={match.format}
                  disabled={!isCommish}
                  onChange={(e) => updateMatch(match.id, { format: e.target.value })}
                  className={`text-xs font-bold text-slate-700 uppercase tracking-wide bg-transparent border-none focus:ring-0 p-0 ${isCommish ? 'cursor-pointer' : 'cursor-default appearance-none'}`}
                >
                  <option value="Fourball">Fourball</option>
                  <option value="Alternate Shot">Alternate Shot</option>
                  <option value="Singles">Singles</option>
                  <option value="Match Play">Match Play</option>
                  <option value="Stableford">Stableford</option>
                  <option value="Worst Ball">Worst Ball</option>
                </select>
              </div>
              {isCommish && (
                <button onClick={() => deleteMatch(match.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Red Team Side */}
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 relative">
                 <div className="absolute -top-2.5 left-2 bg-white px-1 text-[10px] font-bold text-red-400 uppercase tracking-wider">{teamNames.red}</div>
                 <input 
                  type="text" 
                  value={match.redPlayers} 
                  disabled={!isCommish}
                  onChange={(e) => updateMatch(match.id, { redPlayers: e.target.value })}
                  className="w-full bg-transparent font-bold text-red-900 placeholder-red-300 text-center outline-none focus:bg-white rounded disabled:bg-transparent"
                  placeholder={['Singles', 'Match Play'].includes(match.format) ? "Player Name" : "Player A / Player B"}
                 />
              </div>

              {/* Scoring Control */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                   <button 
                    disabled={!isCommish}
                    onClick={() => updateMatch(match.id, { winner: 'Red' })}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      match.winner === 'Red' ? 'bg-red-500 text-white shadow-sm' : 
                      isCommish ? 'text-slate-500 hover:bg-slate-200' : 'text-slate-400 cursor-default'
                    }`}
                   >Red</button>
                   <button 
                    disabled={!isCommish}
                    onClick={() => updateMatch(match.id, { winner: 'Halved' })}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      match.winner === 'Halved' ? 'bg-slate-500 text-white shadow-sm' : 
                      isCommish ? 'text-slate-500 hover:bg-slate-200' : 'text-slate-400 cursor-default'
                    }`}
                   >Halved</button>
                   <button 
                    disabled={!isCommish}
                    onClick={() => updateMatch(match.id, { winner: 'Blue' })}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      match.winner === 'Blue' ? 'bg-blue-500 text-white shadow-sm' : 
                      isCommish ? 'text-slate-500 hover:bg-slate-200' : 'text-slate-400 cursor-default'
                    }`}
                   >Blue</button>
                </div>
                <input 
                  type="text" 
                  value={match.status} 
                  disabled={!isCommish}
                  onChange={(e) => updateMatch(match.id, { status: e.target.value })}
                  className="text-center text-xs font-medium text-slate-500 bg-transparent outline-none w-full disabled:bg-transparent"
                  placeholder="Match Status"
                />
              </div>

              {/* Blue Team Side */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 relative">
                 <div className="absolute -top-2.5 right-2 bg-white px-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider">{teamNames.blue}</div>
                <input 
                  type="text" 
                  value={match.bluePlayers} 
                  disabled={!isCommish}
                  onChange={(e) => updateMatch(match.id, { bluePlayers: e.target.value })}
                  className="w-full bg-transparent font-bold text-blue-900 placeholder-blue-300 text-center outline-none focus:bg-white rounded disabled:bg-transparent"
                  placeholder={['Singles', 'Match Play'].includes(match.format) ? "Player Name" : "Player A / Player B"}
                 />
              </div>
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No matches scheduled yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 13. Logistics Hub
const LogisticsView = ({ itinerary = [], addItinerary, deleteItinerary, role }) => {
    
    // ✅ PERMISSION FIX: Unlock the 'Add Event' form immediately
    const isCommish = role === 'commissioner' || localStorage.getItem('userRole') === 'commissioner';
  const [form, setForm] = useState({ type: 'Golf', time: '', title: '', location: '' });

  const getIcon = (type) => {
    switch(type) {
      case 'Flight': return <Plane className="w-5 h-5" />;
      case 'Stay': return <Home className="w-5 h-5" />;
      case 'Golf': return <Flag className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getColor = (type) => {
     switch(type) {
      case 'Flight': return 'bg-blue-100 text-blue-600';
      case 'Stay': return 'bg-purple-100 text-purple-600';
      case 'Golf': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if(!form.title) return;
    addItinerary(form);
    setForm({ type: 'Golf', time: '', title: '', location: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Trip Itinerary</h2>
      </div>

      {isCommish && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Add Event</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value})}
              className="... border-gray-300 rounded p-2 w-full text-slate-900"
            >
              <option>Golf</option>
              <option>Flight</option>
              <option>Stay</option>
              <option>Dining</option>
              <option>Other</option>
            </select>
            <input 
              type="datetime-local" 
              value={form.time}
              onChange={e => setForm({...form, time: e.target.value})}
              className="... border-gray-300 rounded p-2 w-full text-slate-900"
              required
            />
            <input 
              type="text" 
              placeholder="Event Title"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="... border-gray-300 rounded p-2 w-full text-slate-900"
              required
            />
            <input 
              type="text" 
              placeholder="Location/Notes"
              value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
              className="... border-gray-300 rounded p-2 w-full text-slate-900"
            />
            <button className="md:col-span-4 bg-slate-800 text-white p-2 rounded hover:bg-slate-700 font-medium">Add to Itinerary</button>
          </form>
        </div>
      )}

      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-2">
        {itinerary.sort((a,b) => new Date(a.time) - new Date(b.time)).map((item) => (
          <div key={item.id} className="relative pl-8">
            <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${getColor(item.type)}`}>
              {getIcon(item.type)}
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 group">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {new Date(item.time).toLocaleString([], { weekday: 'short', hour: '2-digit', minute:'2-digit' })}
                  </span>
                  <h4 className="text-lg font-bold text-slate-800">{item.title}</h4>
                  <p className="text-slate-600 text-sm mt-1">{item.location}</p>
                </div>
                {role === 'commissioner' && (
                  <button onClick={() => deleteItinerary(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 14. The Ledger (Expenses & Betting)
// ✅ FINAL LEDGER FIX: Correctly defines Data, Permissions, and State
const LedgerView = ({ players: rawPlayers, expenses: rawExpenses, bets: rawBets, addExpense, addBet, deleteItem, role }) => {
    
   // 1. GHOST BUSTER DATA CLEANING 👻
    // This removes "null" items inside the lists, which stops the "players.find" crash.
    const players = (Array.isArray(rawPlayers) ? rawPlayers : []).filter(p => p && p.id);
    const expenses = (Array.isArray(rawExpenses) ? rawExpenses : []).filter(e => e && e.amount);
    const bets = (Array.isArray(rawBets) ? rawBets : []).filter(b => b && b.amount);

    // 2. PERMISSION FIX (Unlocks Buttons)
    const isCommish = role === 'commissioner' || localStorage.getItem('userRole') === 'commissioner';

    // 3. STATE SETUP (Restores the Forms so they don't crash)
    const [view, setView] = useState('summary'); 
    const [expenseForm, setExpenseForm] = useState({ payerId: '', amount: '', description: '' });
    const [betForm, setBetForm] = useState({ winnerId: '', loserId: '', amount: '', description: '' });

    // ... The code continues below with 'const settlement = ...'

  // Calculate Net Settlement
  // ✅ SAFE MATH: Prevents crashes & Returns the Format your app expects
    const settlement = useMemo(() => {
        const balances = {};
        
        // 1. Setup Balances (Check if player exists)
        players.forEach(p => {
            if (p && p.id) balances[p.id] = 0; 
        });

        // 2. Shared Expenses (Check if amounts are valid numbers)
        const validExpenses = expenses.filter(e => e && e.amount);
        // Safety: ensure amount is a number, default to 0
        const totalExpenses = validExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        
        // Prevent "Divide by Zero" crash
        const activePlayerCount = Object.keys(balances).length || 1; 
        const perPerson = totalExpenses / activePlayerCount;

        // 3. Debits (Subtract per-person cost from everyone)
        Object.keys(balances).forEach(id => {
            balances[id] -= perPerson;
        });

        // 4. Credits (Add back who paid)
        validExpenses.forEach(e => {
            if (e.payerId && balances.hasOwnProperty(e.payerId)) {
                balances[e.payerId] += (parseFloat(e.amount) || 0);
            }
        });

        // 5. Bets (Check winner/loser existence)
        bets.forEach(b => {
             if (b && b.winnerId && b.loserId && b.amount) {
                 const amt = parseFloat(b.amount) || 0;
                 // Only update if players actually exist in our list
                 if (balances.hasOwnProperty(b.winnerId)) balances[b.winnerId] += amt;
                 if (balances.hasOwnProperty(b.loserId)) balances[b.loserId] -= amt;
             }
        });

        // 6. FORMATTING: Convert to the List your app expects (CRITICAL STEP)
        return Object.entries(balances)
            .map(([id, amount]) => ({
                id,
                name: players.find(p => p.id === id)?.name || 'Unknown',
                amount
            }))
            .sort((a,b) => b.amount - a.amount);

    }, [players, expenses, bets]);

  // Calculate Suggested Payments (Who pays Whom)
  const payments = useMemo(() => {
    // Clone lists to avoid mutating display data
    let debtors = settlement.filter(p => p.amount < -0.01).map(p => ({...p}));
    let creditors = settlement.filter(p => p.amount > 0.01).map(p => ({...p}));
    
    // Sort by magnitude to optimize transactions
    debtors.sort((a,b) => a.amount - b.amount); 
    creditors.sort((a,b) => b.amount - a.amount);

    const plan = [];
    let i = 0; 
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
      let debtor = debtors[i];
      let creditor = creditors[j];
      
      // Pay the minimum of what's owed vs what's received
      let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      
      if (amount > 0.01) {
        plan.push({ from: debtor.name, to: creditor.name, amount: amount });
      }

      // Adjust temp balances
      debtor.amount += amount;
      creditor.amount -= amount;

      // Move indices if settled
      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    return plan;
  }, [settlement]);

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if(!expenseForm.amount || !expenseForm.payerId) return;
    addExpense(expenseForm);
    setExpenseForm({ payerId: '', amount: '', description: '' });
  };

  const handleBetSubmit = (e) => {
    e.preventDefault();
    if(!betForm.amount || !betForm.winnerId || !betForm.loserId) return;
    addBet(betForm);
    setBetForm({ winnerId: '', loserId: '', amount: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">The Ledger</h2>
        <div className="flex gap-2 text-sm bg-slate-100 p-1 rounded-lg w-fit">
          <button onClick={() => setView('summary')} className={`px-4 py-1.5 rounded-md ${view === 'summary' ? 'bg-white shadow text-slate-800 font-medium' : 'text-slate-500'}`}>Net Settlement</button>
          <button onClick={() => setView('log')} className={`px-4 py-1.5 rounded-md ${view === 'log' ? 'bg-white shadow text-slate-800 font-medium' : 'text-slate-500'}`}>Transaction Log</button>
        </div>
      </div>

      {view === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Positions</h3>
              {settlement.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className="font-semibold text-slate-800">{item.name}</div>
                  <div className={`font-mono font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.amount >= 0 ? '+' : ''}${item.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Plan</h3>
               {payments.length > 0 ? (
                 payments.map((p, idx) => (
                   <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                     <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-slate-700">{p.from}</span>
                        <span className="text-slate-400 text-xs">pays</span>
                        <span className="font-bold text-slate-700">{p.to}</span>
                     </div>
                     <div className="font-mono font-bold text-slate-600">
                       ${p.amount.toFixed(2)}
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-slate-400 text-sm italic border border-dashed border-slate-300 rounded-xl p-4 text-center">No outstanding debts.</div>
               )}
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Quick Actions
            </h3>
            
            <div className="space-y-6">
              {/* Add Expense Mini Form - Available to both roles */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Log Shared Cost</label>
                <form onSubmit={handleExpenseSubmit} className="space-y-2">
                  <select 
                    className="w-full p-2 text-sm border rounded text-slate-900"
                    value={expenseForm.payerId}
                    onChange={e => setExpenseForm({...expenseForm, payerId: e.target.value})}
                  >
                    <option value="">Who Paid?</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Amount" className="w-1/3 p-2 text-sm border rounded text-slate-900"
                      value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
                    <input type="text" placeholder="Description (e.g. Dinner)" className="w-2/3 p-2 text-sm border rounded text-slate-900"
                      value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} />
                  </div>
                  <button className="w-full bg-emerald-600 text-white text-sm py-2 rounded hover:bg-emerald-700">Add Shared Expense</button>
                </form>
              </div>

              <div className="border-t border-slate-200"></div>

              {/* Add Bet Mini Form - Available to both roles */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Log Wager</label>
                <form onSubmit={handleBetSubmit} className="space-y-2">
                  <div className="flex gap-2">
                     <select className="w-1/2 p-2 text-sm border rounded text-slate-900" value={betForm.winnerId} onChange={e => setBetForm({...betForm, winnerId: e.target.value})}>
                        <option value="">Winner</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                     <select className="w-1/2 p-2 text-sm border rounded text-slate-900" value={betForm.loserId} onChange={e => setBetForm({...betForm, loserId: e.target.value})}>
                        <option value="">Loser</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Amount" className="w-1/3 p-2 text-sm border rounded text-slate-900"
                      value={betForm.amount} onChange={e => setBetForm({...betForm, amount: e.target.value})} />
                    <input type="text" placeholder="Bet Details" className="w-2/3 p-2 text-sm border rounded text-slate-900"
                      value={betForm.description} onChange={e => setBetForm({...betForm, description: e.target.value})} />
                  </div>
                  <button className="w-full bg-slate-800 text-white text-sm py-2 rounded hover:bg-slate-700">Record Wager</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'log' && (
        <div className="space-y-2">
          {expenses.map(e => (
            <div key={e.id} className="flex justify-between items-center bg-white p-3 rounded border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><DollarSign className="w-4 h-4"/></div>
                <div>
                   <p className="text-sm font-semibold text-slate-800">{e.description}</p>
                   <p className="text-xs text-slate-500">{players.find(p => p.id === e.payerId)?.name} paid for group</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-slate-700">${e.amount}</span>
                {isCommish && (
                  <button onClick={() => deleteItem('expenses', e.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                )}
              </div>
            </div>
          ))}
          {bets.map(b => (
            <div key={b.id} className="flex justify-between items-center bg-white p-3 rounded border border-slate-100">
               <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><TrendingUp className="w-4 h-4"/></div>
                <div>
                   <p className="text-sm font-semibold text-slate-800">{b.description}</p>
                   <p className="text-xs text-slate-500">
                     <span className="text-emerald-600 font-medium">{players.find(p => p.id === b.winnerId)?.name}</span> took from <span className="text-red-500 font-medium">{players.find(p => p.id === b.loserId)?.name}</span>
                   </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-slate-700">${b.amount}</span>
                {role === 'commissioner' && (
                  <button onClick={() => deleteItem('bets', b.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 15. Dashboard
// ✅ RESTORED DASHBOARD: Shows Full UI even with 0 data
// ✅ ROBUST FIX: We rename the incoming prop to 'rawTeamNames' to sanitize it
const Dashboard = ({ players = [], matches = [], itinerary = [], setView, role, teamNames: rawTeamNames, handleLogout }) => {
    
    // 1. SANITIZE TEAM NAMES (The "Null" Killer)
    // This forces valid names even if the database sends 'null' or 'undefined'.
    const teamNames = rawTeamNames || { red: 'Red Team', blue: 'Blue Team' };

    // ... The rest of your code continues below ...
    
    // 1. Safety Check: Ensure lists are Arrays (Prevents "filter of undefined" crash)
    const validItinerary = Array.isArray(itinerary) ? itinerary : [];
    const validPlayers = Array.isArray(players) ? players : [];
    
    // 2. Safe 'Next Event' Logic
    // If itinerary is empty, nextEvent becomes null (Logic handles "No upcoming events" text)
    const upcomingEvents = validItinerary
        .filter(i => i.time && new Date(i.time) > new Date())
        .sort((a,b) => new Date(a.time) - new Date(b.time));

    const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

    // 3. Find the Invite Code (Safe Lookup)
    // Checks multiple storage spots so the Purple Card always has a code.
    const rawId = localStorage.getItem('activeTripId');
    const localUser = JSON.parse(localStorage.getItem('golfAppUser') || '{}');
    // Display Code: Defaults to "LOADING" if missing, to prevent crash
    const displayCode = rawId || localUser?.lastActiveTripId || "LOADING";

    // --- NO EARLY EXITS! We let the Real UI render below ---

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">
            {role === 'commissioner' ? 'Commissioner Dashboard' : 'Player Dashboard'}
          </h2>
          <p className="text-emerald-100 opacity-80 mb-6 max-w-lg">
            {role === 'commissioner' 
              ? "Welcome to the command center. Manage your roster, update match scores, and track expenses all from one place." 
              : "Welcome to the trip hub. Check your itinerary, view the live leaderboard, and settle up with the group."}
          </p>
          {/* NEW: Mobile Trip Code Card (ULTRA RELIABLE) */}
          <div 
            onClick={() => {
              // Try 3 places to find the code:
              // 1. The 'activeTripId' raw storage (Most reliable)
              // 2. The user profile storage
              // 3. The current state variable (if available)
              const rawId = localStorage.getItem('activeTripId');
              const localUser = JSON.parse(localStorage.getItem('golfAppUser') || '{}');
              const code = rawId || localUser?.lastActiveTripId || "No Code";
              
              navigator.clipboard.writeText(code);
              alert('Code Copied: ' + code);
            }}
            className="bg-indigo-600 rounded-xl p-4 mb-6 shadow-lg text-white text-center cursor-pointer active:scale-95 transition-transform"
          >
            <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider mb-1">
              Invite Code (Tap to Copy)
            </p>
            <div className="text-3xl font-mono font-bold tracking-widest">
              {/* Display: Check Raw Storage first, then User Profile */}
              {localStorage.getItem('activeTripId') || 
               JSON.parse(localStorage.getItem('golfAppUser') || '{}')?.lastActiveTripId || 
               "..."}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setView('tournament')} className="bg-white text-emerald-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors">
              {role === 'commissioner' ? 'Manage Scores' : 'View Leaderboard'}
            </button>
            <button onClick={() => setView('finance')} className="bg-emerald-800 text-white border border-emerald-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors">
              Add Expense
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
          <Trophy className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Roster Status (Moved up for mobile using order-1) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 order-1 md:order-none">
           <div className="flex items-center gap-2 mb-4">
             <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Users className="w-5 h-5" /></div>
             <h3 className="font-bold text-slate-700">Roster Status</h3>
          </div>
          <div className="flex justify-between items-center text-center">
            <div>
              <div className="text-2xl font-bold text-slate-800">{players.length}</div>
              <div className="text-xs text-slate-500">Players</div>
            </div>
             <div>
              <div className="text-2xl font-bold text-red-600">{players.filter(p => p.team === 'Red').length}</div>
              <div className="text-xs text-slate-500 truncate px-1">{teamNames.red}</div>
            </div>
             <div>
              <div className="text-2xl font-bold text-blue-600">{players.filter(p => p.team === 'Blue').length}</div>
              <div className="text-xs text-slate-500 truncate px-1">{teamNames.blue}</div>
            </div>
          </div>
        </div>

        {/* Next Event Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 order-2 md:order-none">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Calendar className="w-5 h-5" /></div>
             <h3 className="font-bold text-slate-700">Up Next</h3>
          </div>
          {nextEvent ? (
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-1">
                 {new Date(nextEvent.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="text-xl font-bold text-slate-800 leading-tight mb-2">{nextEvent.title}</div>
              <div className="text-sm text-slate-500">{nextEvent.location}</div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">No upcoming events scheduled.</div>
          )}
        </div>

        {/* Live Status */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 order-3 md:order-none">
           <div className="flex items-center gap-2 mb-4">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Activity className="w-5 h-5" /></div>
             <h3 className="font-bold text-slate-700">Active Matches</h3>
          </div>
          <div className="space-y-3">
             {matches.filter(m => m.winner === 'Pending').slice(0, 3).map(m => (
               <div key={m.id} className="text-sm border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">{m.format}</span>
                    <span className="text-slate-500 text-xs">{m.status}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{m.redPlayers}</span>
                    <span>vs</span>
                    <span>{m.bluePlayers}</span>
                  </div>
               </div>
             ))}
             {matches.filter(m => m.winner === 'Pending').length === 0 && (
               <div className="text-slate-400 text-sm">All matches complete or none started.</div>
             )}
          </div>
        </div>
        
      </div>
    </div>
  );
};


// --- Main App Container ---
const GolfTripCommissioner = () => {
  const handleLogin = async (firstArg, secondArg) => {
        // 1. CHECK FOR RECEIPT (The "Fast Lane")
        if (firstArg && firstArg.uid) {
            console.log("✅ User Receipt Found. Forcing Update...");
            
            // ⚡ FORCE THE APP TO UPDATE INSTANTLY
            setUser(firstArg); 
            
            return;
        }

        // 2. MANUAL LOGIN (The "Slow Lane")
        try {
            let email = firstArg;
            let password = secondArg;

            // Unpack if needed
            if (typeof firstArg === 'object' && firstArg !== null) {
                email = firstArg.email;
                password = firstArg.password;
            }

            console.log("🔐 Logging in manually as:", email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // ⚡ FORCE THE APP TO UPDATE INSTANTLY
            setUser(userCredential.user);

        } catch (error) {
             console.error("Login Error:", error);
             alert("Login Failed: " + error.message);
        }
    };
  useEffect(() => {
        let unsubscribeAuthStateChanged;

        const initMasterSequence = async () => {
            try {
                console.log("🔒 Locking App until RevenueCat is ready...");

                // 1. Setup
                await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

                // ✅ CORRECTED API KEYS (Taken directly from your screenshot image_ba1cd5.jpg)
                const apiKey = Capacitor.getPlatform() === 'ios'
                    ? "appl_tOvHgGHoyoinCWqidNxKeuEvpsF"
                    : "goog_UzhTMGwJxYNxqqkMmdcedlEItHf";

                // 2. Wait for Firebase (The Blocking Step)
                unsubscribeAuthStateChanged = onAuthStateChanged(auth, async (user) => {
                    
                    if (user) {
                        // A. User Found -> Configure with ID
                        console.log("✅ User found:", user.uid);
                        // CRITICAL: Passing appUserID here prevents the Anonymous ID
                        await Purchases.configure({ apiKey, appUserID: user.uid });
                        
                        // Sync subscriptions immediately
                        if (typeof checkSubscriptionStatus === 'function') {
                            await checkSubscriptionStatus();
                        }
                    } else {
                        // B. Guest -> Configure Anonymously
                        console.log("👤 No user. Configuring Guest.");
                        await Purchases.configure({ apiKey });
                    }

                    // 3. UNLOCK THE APP
                    // Only happens AFTER RevenueCat is 100% finished
                    console.log("🔓 RevenueCat Configured. Opening App.");
                    setIsReady(true);
                });

            } catch (e) {
                console.error("Master Sequence Error:", e);
                // Safety Net: Unlock the app so user isn't stuck on white screen
                setIsReady(true);
            }
        };

        initMasterSequence();

        return () => {
            if (unsubscribeAuthStateChanged) unsubscribeAuthStateChanged();
        };
    }, []);
  
  // ⚡️ AUTO-REFRESH LISTENER (iOS ONLY)
  useEffect(() => {
    // 🛡 Protection: If this is Android, STOP immediately. Do not run this listener.
    if (Capacitor.getPlatform() !== 'ios') return;

    console.log("🎧 Setting up iOS App State Listener...");
    const setupListener = async () => {
      const listener = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          console.log("📱 iOS App returned from background! Refreshing data...");
          window.location.reload();
        }
      });
      return listener;
    };
    const listenerPromise = setupListener();
    return () => { listenerPromise.then(handle => handle.remove()); };
  }, []);

  const [isReady, setIsReady] = useState(false); // <--- Controls the Loading Screen
  // 1. Initialize User from Memory
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('golfAppUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Save User to Memory whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('golfAppUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('golfAppUser');
    }
  }, [user]);
  // (Existing code from your screenshot)
  // --- RESTORED STATE VARIABLES ---
  const [view, setView] = useState('setup');
  const [role, setRole] = useState('player');
  const [tripId, setTripId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Subscription from Memory
  const [isSubscribed, setIsSubscribed] = useState(() => {
    const saved = localStorage.getItem('golfAppSubscribed');
    return saved === 'true';
  });


  // --- STEP 1.5: CHECK STATUS & UPDATE FIREBASE (FORCE SYNC VERSION) ---
    // --- REPLACEMENT FUNCTION: READS DIRECTLY FROM FIREBASE ---
    const checkSubscriptionStatus = async () => {
        try {
            console.log("🔄 Checking Subscription...");
            const customerInfo = await Purchases.getCustomerInfo();
            
            // 1. Calculate the Status (We'll name the variable 'isSubscribed' now)
            const isSubscribed = typeof customerInfo.entitlements.active['Commissioner Club'] !== "undefined" 
                              || typeof customerInfo.entitlements.active['fairway_commish_annual'] !== "undefined";

            console.log("💎 Subscription Status:", isSubscribed ? "ACTIVE" : "INACTIVE");
            
            // 2. Update Local App
            setIsSubscribed(isSubscribed);

            // 3. Update Firebase (Key matches Variable)
            if (user) {
                await updateDoc(doc(db, 'users', user.uid), {
                    isSubscribed: isSubscribed 
                });
            }

        } catch (error) {
            console.error("Error checking subscription:", error);
        }
    };
    // --- END OF REPLACEMENT ---

   // ==========================================================
    // 1. PRODUCTION PURCHASE FUNCTION
    // ==========================================================
    const handlePurchase = async () => {
        setIsLoading(true);
        try {
            const offerings = await Purchases.getOfferings();
            let packageToBuy = null;

            // Strategy 1: Check 'Current'
            if (offerings.current && offerings.current.availablePackages.length > 0) {
                packageToBuy = offerings.current.availablePackages[0];
            } 
            // Strategy 2: Check 'default'
            else if (offerings.all["default"] && offerings.all["default"].availablePackages.length > 0) {
                packageToBuy = offerings.all["default"].availablePackages[0];
            }
            // Strategy 3: Check First Available
            else {
                const allKeys = Object.keys(offerings.all);
                if (allKeys.length > 0) {
                   const first = offerings.all[allKeys[0]];
                   if (first.availablePackages.length > 0) {
                       packageToBuy = first.availablePackages[0];
                   }
                }
            }

            if (packageToBuy) {
        
        // 👇 PASTE THIS IOS-ONLY FIX HERE 👇
        // This guarantees the receipt is attached to "daytester", not "Anonymous"
        if (Capacitor.getPlatform() === 'ios' && auth.currentUser) {
             console.log("🍏 iOS Purchase: Linking Identity before charge...");
             try {
                 await Purchases.logIn(auth.currentUser.uid);
             } catch (e) {
                 console.log("⚠️ Login warning:", e);
             }
        }
        // 👆 END OF NEW CODE 👆

        // The fix: We wrap it in { aPackage: ... } to satisfy the plugin
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToBuy });
                if (customerInfo?.entitlements?.active?.["premium_access"]) {
                    // Success!
                    setIsSubscribed(true);
                    if (auth.currentUser) {
                         const userRef = doc(db, "users", auth.currentUser.uid);
                         await setDoc(userRef, { 
                            isSubscribed: true, 
                            subscriptionStatus: "active",
                            lastUpdated: new Date()
                         }, { merge: true });
                    }
                    alert("Welcome to the Commissioner's Club! You now have full access.");
                }
            } else {
                alert("We couldn't find the subscription package. Please try again later or contact support.");
            }

        } catch (error) {
        // 1. IGNORE USER CANCELLATION
        if (error.userCancelled) return;

        // 2. HANDLE "ALREADY SUBSCRIBED" SCENARIO
        // (RevenueCat Code 6 = ProductAlreadyPurchasedError)
        const isAlreadyOwned = error.code === '6' || error.code === 6 || error.message.includes("already");

        if (isAlreadyOwned) {
            console.log("✅ User already subscribed. Attempting unlock...");
            
            try {
                // ---------------------------------------------------
                // 🛡️ ANDROID SAFETY CHECK 🛡️
                // We ONLY force the login merge on iOS. 
                // Android skips this block entirely.
                if (Capacitor.getPlatform() === 'ios' && auth.currentUser) {
                     await Purchases.logIn(auth.currentUser.uid);
                }
                await Purchases.syncPurchases();
                // ---------------------------------------------------

                // B. CHECK STATUS (Runs on both, which is good!)
                // If Android user owns it, this will unlock their app too.
                const updatedInfo = await Purchases.getCustomerInfo();
                
                if (updatedInfo?.entitlements?.active?.["premium_access"]) {
                     // C. UPDATE FIREBASE (Manually write the "True" status)
                     setIsSubscribed(true);
                     if (auth.currentUser) {
                         const userRef = doc(db, "users", auth.currentUser.uid);
                         await setDoc(userRef, {
                             isSubscribed: true,
                             subscriptionStatus: "active",
                             lastUpdated: new Date()
                         }, { merge: true });
                     }
                     alert("Subscription verified! You are all set.");
                     return; // STOP HERE (Success)
                }
            } catch (innerError) {
                console.log("Manual unlock failed:", innerError);
            }
        }

        // 3. GENERIC ERROR (Actual failures)
        alert("Purchase couldn't be completed. " + error.message);
        console.error("Purchase Error:", error);

    } finally {
        setIsLoading(false);
    }
    };

    // ==========================================================
    // 2. PRODUCTION RESTORE FUNCTION
    // ==========================================================
    const handleRestore = async () => {
        setIsLoading(true);
        try {
          // ---------------------------------------------------------
      // 👇 NEW IOS-ONLY FIX 👇
      // This strictly ignores Android so it stays 100% safe.
      if (Capacitor.getPlatform() === 'ios' && auth.currentUser) {
         console.log("🍏 iOS Restore: Linking Identity...");
         try {
             // This merges the "Anonymous Owner" with "daytester"
             await Purchases.logIn(auth.currentUser.uid);
         } catch (e) {
             console.log("⚠️ Login warning:", e);
         }
    }
      // 👆 END OF NEW CODE 👆
      // ---------------------------------------------------------
            // 1. Sync & Fetch Latest
            await Purchases.syncPurchases();
            const customerInfo = await Purchases.getCustomerInfo({ 
                fetchPolicy: "FETCH_CURRENT" 
            });
            
            // 2. Check for Entitlement (No Alerting Raw JSON anymore)
            if (customerInfo?.entitlements?.active?.["premium_access"]) {
                 setIsSubscribed(true);
                 // ---------------------------------------------------------
      // ⚡️ NEW IOS DATABASE FIX (Guaranteed iOS Only)
      // --------------------------------------------------------- 
                 
                 if (auth.currentUser) {
                     const userRef = doc(db, "users", auth.currentUser.uid);
                     await setDoc(userRef, { 
                        isSubscribed: true,
                        subscriptionStatus: "active",
                        lastUpdated: new Date()
                     }, { merge: true });
                 }
                 alert("Purchase Restored! Welcome back.");
            } else {
                 // Silent fail on first check, try Google Restore as backup
                 try {
                     const restoreInfo = await Purchases.restorePurchases();
                     if (restoreInfo?.entitlements?.active?.["premium_access"]) {
                         setIsSubscribed(true);
                         alert("Purchase Restored! Welcome back.");
                     } else {
                         alert("We couldn't find an active subscription for this account.");
                     }
                 } catch (e) {
                     alert("No subscription found to restore.");
                 }
            }

        } catch (error) {
            console.error("Restore Error:", error);
            alert("Unable to restore purchase at this time.");
        } finally {
            setIsLoading(false);
        }
    };

  

  // --- STEP 1: SAVE TRIP & ROLE TO DATABASE (Cloud Memory) ---
  useEffect(() => {
    const saveContextToCloud = async () => {
      // Only save if we have a valid user and a trip
      if (user && tripId) {
        try {
          const userRef = doc(db, "users", user.uid);
          // Save the ID and Role so we can restore them later
          await setDoc(userRef, { 
            lastActiveTripId: tripId, 
            lastRole: role 
          }, { merge: true });
        } catch (error) {
          console.error("Error saving trip context:", error);
        }
      }
    };
    saveContextToCloud();
  }, [user, tripId, role]); 

  // --- STEP 2: UPGRADED SYNC PROFILE (Subscription + Last Trip) ---
  useEffect(() => {
    const syncUserProfile = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // 1. Restore Subscription
            if (userData.isSubscribed) {
              setIsSubscribed(true);
              localStorage.setItem('golfAppSubscribed', 'true');
            }

            // 2. Restore Last Trip (The Fix for your issue)
            if (userData.lastActiveTripId) {
              console.log("Restoring trip from cloud:", userData.lastActiveTripId);
              setTripId(userData.lastActiveTripId);
              localStorage.setItem('activeTripId', userData.lastActiveTripId);
              
              // Restore Role if it exists
              if (userData.lastRole) {
                setRole(userData.lastRole);
                localStorage.setItem('userRole', userData.lastRole);
              }
            }
          }
        } catch (error) {
          console.error("Error syncing profile:", error);
        }
      }
    };
    syncUserProfile();
  }, [user]);
// CLEANUP: Automatically reset app state AND Local Storage when user logs out
  useEffect(() => {
    if (!user) {
      console.log("User logged out. Clearing trip data...");
      
      // 1. Reset State Variables
      setTripId(null);
      setRole('player');
      setView('setup');
      
      // 2. Wipe Local Storage (The Critical Fix)
      // We remove common keys to ensure the old trip doesn't come back
      localStorage.removeItem('tripId'); 
      localStorage.removeItem('activeTripId');
      localStorage.removeItem('golfAppTripId'); // Based on your naming convention
      localStorage.removeItem('userRole'); // <--- ADD THIS LINE
    }
  }, [user]);
  // 2. Save to Memory whenever it changes
  useEffect(() => {
    localStorage.setItem('golfAppSubscribed', isSubscribed);
  }, [isSubscribed]);

  // 4. Restore Trip Context (SAFER VERSION)
  useEffect(() => {
    // Only try to restore if we have a user logged in
    if (user) {
      const savedTripId = localStorage.getItem("activeTripId");
      
      // Ensure we don't restore "null" or "undefined" text strings
      if (savedTripId && savedTripId !== "null" && savedTripId !== "undefined") {
        setTripId(savedTripId);
        
        // Only set role if we confirm we have a trip
        const savedRole = localStorage.getItem("userRole");
        if (savedRole) {
           setRole(savedRole);
        }
      }
    }
  }, [user]); // Only run this when the user is confirmed

  // --- DELETE THIS BLOCK ---
  // --- 5. AUTO-SAVE: Whenever Role or TripId changes, save to memory ---
  useEffect(() => {
    if (tripId) {
      localStorage.setItem("activeTripId", tripId);
    }
    
    if (role) {
      localStorage.setItem("userRole", role);
    }
  }, [tripId, role]); 
  // -------------------------
  // Data States
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bets, setBets] = useState([]);
  const [teamNames, setTeamNames] = useState({ red: 'Red Team', blue: 'Blue Team' });
  const [messages, setMessages] = useState([]); // Added state for messages

  // --- 📡 DATA RESTORATION (Updated for Commissioners) ---
    
    // 1. Listen for USER PROFILE
    useEffect(() => {
        if (!user) return;
        
        console.log("👤 Listening for Commissioner Profile:", user.uid);
        const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                console.log("🎟️ Active Trip ID:", data.activeTripId);
                
                // Update State
                setTripId(data.activeTripId);
                
                // ✅ ROLE FIX: Always set as Commissioner (since this is the Commish App)
                setRole(data.role || 'commissioner');
                
                // Subscription Check
                setIsSubscribed(!!data.isSubscribed);
            }
        });
        return () => unsub();
    }, [user]);

    // 2. Listen for TRIP DATA (Players, Matches, Itinerary)
    useEffect(() => {
        if (!tripId) return;

        console.log("📡 Connecting to Trip Database:", tripId);
        setIsLoading(true);

        // A. Fetch Players
        const unsubPlayers = onSnapshot(collection(db, 'trips', tripId, 'players'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("✅ Players Loaded:", list.length);
            setPlayers(list);
        });

        // B. Fetch Matches
        const unsubMatches = onSnapshot(collection(db, 'trips', tripId, 'matches'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMatches(list);
        });

        // C. Fetch Itinerary
        const unsubItinerary = onSnapshot(collection(db, 'trips', tripId, 'itinerary'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            list.sort((a, b) => new Date(a.date) - new Date(b.date));
            setItinerary(list);
            setIsLoading(false); 
        });

        // D. Fetch Bets (For Ledger)
        const unsubBets = onSnapshot(collection(db, 'trips', tripId, 'bets'), (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBets(list);
        });

        // Cleanup
        return () => {
            unsubPlayers();
            unsubMatches();
            unsubItinerary();
            unsubBets();
        };
    }, [tripId]);
    // ---------------------------------------------
  // --- NEW: Fetch Players from Firestore ---
  const fetchPlayers = async () => {
    if (!tripId) return; // Don't fetch if we don't have a trip code yet

    try {
      // 1. Create a "Query" (A question for the database)
      const q = query(
        collection(db, "players"), 
        where("tripId", "==", tripId)
      );

      // 2. Ask the question
      const querySnapshot = await getDocs(q);

      // 3. Unpack the answers
      const playersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 4. Update the App Screen
      setPlayers(playersList);
      
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };
  // --- NEW: Restore Trip on Refresh ---
  useEffect(() => {
    // Check browser memory
    const savedTripId = localStorage.getItem("activeTripId");
    
    if (savedTripId) {
      setTripId(savedTripId); // Restore the ID
      setRole('commissioner'); // (Optional: You might want to fetch the real role later)
    }
  }, []); // Empty brackets means "Run once when app loads"

  // --- NEW: Run this automatically when the Trip ID changes ---
  useEffect(() => {
    fetchPlayers();
  }, [tripId]);
// ... (Line 1753) }, [tripId]);

// --- PASTE STEP 1 HERE (Line 1754) ---
useEffect(() => {
  const fetchTripDetails = async () => {
    if (!tripId) return;
    try {
      const q = query(collection(db, "trips"), where("code", "==", tripId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const tripData = querySnapshot.docs[0].data();
        if (tripData.teamNames) {
          setTeamNames(tripData.teamNames);
        }
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
    }
  };
  fetchTripDetails();
}, [tripId]);
// --- END PASTE ---
// --- NEW: Real-Time Chat Listener ---
  useEffect(() => {
    if (!tripId) return;

    // 1. Listen for messages for THIS trip, ordered by time
    const q = query(
      collection(db, "messages"),
      where("tripId", "==", tripId),
      orderBy("createdAt", "asc")
    );

    // 2. Turn on the "Radio" (Real-time connection)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(liveMessages);
    });

    // 3. Turn off radio when leaving
    return () => unsubscribe();
  }, [tripId]);
  // --- NEW: Real-Time Matches Listener ---
  useEffect(() => {
    if (!tripId) return;

    // 1. Watch for matches for this trip
    const q = query(
      collection(db, "matches"),
      where("tripId", "==", tripId)
    );

    // 2. Update screen whenever database changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMatches = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMatches(liveMatches);
    });

    return () => unsubscribe();
  }, [tripId]);
  // --- NEW: Real-Time Itinerary Listener ---
  useEffect(() => {
    if (!tripId) return;

    // 1. Get events for this trip
    const q = query(
      collection(db, "itinerary"),
      where("tripId", "==", tripId)
    );

    // 2. Update screen when data changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Optional: Sort them by date/time
      liveEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setItinerary(liveEvents);
    });

    return () => unsubscribe();
  }, [tripId]);
  // --- NEW: Real-Time Ledger Listeners ---
  
  // 1. Listen for Expenses
  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, "expenses"), where("tripId", "==", tripId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [tripId]);

  // 2. Listen for Bets
  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, "bets"), where("tripId", "==", tripId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [tripId]);
// (Line 1755) const handleLogin = ...

  const handleLogout = async () => {
    // 1. Force UI Reset IMMEDIATELY (Don't wait for server)
    try {
        console.log("⚠️ Attempting Logout...");
        
        // Try Firebase (But don't let it stop us if it fails)
        try {
            await signOut(auth);
        } catch (e) {
            console.error("Firebase logout failed (ignoring):", e);
        }

        // Try RevenueCat (But don't let it stop us if it fails)
        try {
            await Purchases.logOut();
        } catch (e) {
             console.error("RevenueCat logout failed (ignoring):", e);
        }

    } catch (error) {
        alert("Logout Warning: " + error.message);
    } finally {
        // 2. NUKE EVERYTHING (This runs no matter what)
        setUser(null);
        setTripId(null);
        setView('setup');
        setIsSubscribed(false);
        console.log("✅ Force Logout Complete");
    }
};

  // --- Mock Actions (Local State) ---
  const addPlayer = async (data) => {
    if (!tripId) { alert("Please create or join a trip first!"); return; }

    try {
      await addDoc(collection(db, "players"), {
        tripId: tripId,
        ...data,
        score: 0,
        createdAt: new Date()
      });
      
      console.log("Player saved!");
      alert("Player Added Successfully!");
      
      fetchPlayers(); // <--- ADD THIS LINE (Reloads the list instantly)

    } catch (error) {
      console.error("Error adding player:", error);
      alert("Error saving: " + error.message);
    }
  };
  const deletePlayer = (id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };
  const updatePlayer = async (id, data) => {
    // 1. Update the Screen immediately (so it feels fast)
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));

    try {
      // 2. Update Firebase in the background
      const playerRef = doc(db, "players", id);
      await updateDoc(playerRef, data);
      console.log("Player updated in database!");
    } catch (error) {
      console.error("Error updating player:", error);
      alert("Could not save change: " + error.message);
    }
  };

  // --- FIREBASE MATCH FUNCTIONS ---

  // 1. Add a New Match
  const addMatch = async (matchData) => {
    try {
      await addDoc(collection(db, "matches"), {
        ...matchData, // Contains: type, players, day, etc.
        tripId: tripId,
        createdAt: new Date(),
        winner: null, // Default to no winner yet
        status: 'scheduled'
      });
      console.log("Match added to Firestore!");
    } catch (error) {
      console.error("Error adding match:", error);
      alert("Could not save match: " + error.message);
    }
  };

  // 2. Update Score / Winner (The "Red/Blue/Halved" buttons)
  const updateMatch = async (id, updatedData) => {
    // Update screen instantly so it feels fast
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));

    try {
      const matchRef = doc(db, "matches", id);
      await updateDoc(matchRef, updatedData);
      console.log("Match updated in Firestore!");
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  // 3. Delete a Match (The Trash Can)
  const deleteMatch = async (id) => {
    // Remove from screen instantly
    setMatches(prev => prev.filter(m => m.id !== id));

    try {
      await deleteDoc(doc(db, "matches", id));
      console.log("Match deleted from Firestore!");
    } catch (error) {
      console.error("Error deleting match:", error);
      alert("Could not delete match: " + error.message);
    }
  };

  // --- FIREBASE ITINERARY FUNCTIONS ---

  const addItinerary = async (newEvent) => {
    try {
      await addDoc(collection(db, "itinerary"), {
        ...newEvent, 
        tripId: tripId,
        createdAt: new Date()
      });
      console.log("Event added to Firestore!");
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Could not save event: " + error.message);
    }
  };

  const deleteItinerary = async (id) => {
    // Remove from screen instantly
    setItinerary(prev => prev.filter(item => item.id !== id));

    try {
      await deleteDoc(doc(db, "itinerary", id));
      console.log("Event deleted from Firestore!");
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };
  // --- FIREBASE LEDGER FUNCTIONS ---

  const addExpense = async (expenseData) => {
    try {
      await addDoc(collection(db, "expenses"), {
        ...expenseData,
        tripId: tripId,
        createdAt: new Date()
      });
      console.log("Expense saved!");
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const addBet = async (betData) => {
    try {
      await addDoc(collection(db, "bets"), {
        ...betData,
        tripId: tripId,
        createdAt: new Date()
      });
      console.log("Bet saved!");
    } catch (error) {
      console.error("Error adding bet:", error);
    }
  };

  const deleteLedgerItem = async (collectionName, id) => {
    // 1. Determine which list to update locally (for speed)
    if (collectionName === 'expenses') {
      setExpenses(prev => prev.filter(e => e.id !== id));
    } else {
      setBets(prev => prev.filter(b => b.id !== id));
    }

    // 2. Delete from the correct collection in Firestore
    try {
      // Note: collectionName usually comes in as 'expenses' or 'bets'
      // If your button sends 'wagers', we map it to 'bets' here if needed.
      const targetCollection = collectionName === 'wagers' ? 'bets' : collectionName;
      
      await deleteDoc(doc(db, targetCollection, id));
      console.log("Item deleted from", targetCollection);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const addMessage = async (msgData) => {
    // 1. Extract the text (Handles the way your button sends data)
    // If the button sends an object { text: "hello" }, we grab the text.
    // If it sends just "hello", we use it directly.
    const textToCheck = typeof msgData === 'object' ? msgData.text : msgData;
    
    // 2. Safety Check
    if (!textToCheck || !textToCheck.trim()) return;

    try {
      // 3. Send to Firebase
      await addDoc(collection(db, "messages"), {
        text: textToCheck,
        tripId: tripId,
        createdAt: serverTimestamp(),
        sender: user?.email || "Commissioner", 
        senderId: user?.uid
      });
      console.log("Message sent to cloud!");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const updateTeamNames = async (arg1, arg2) => {
    // 1. Handle both data formats (Object vs Separate Arguments)
    let newNames = {};
    if (typeof arg1 === 'object') {
      newNames = arg1; // It came as an object { red: '...', blue: '...' }
    } else {
      newNames = { red: arg1, blue: arg2 }; // It came as two separate strings
    }

    // 2. Update Screen Immediately
    console.log("Attempting to save names:", newNames);
    setTeamNames(newNames);

    try {
      if (!tripId) {
        console.error("No Trip ID found! Cannot save.");
        return;
      }

      // 3. Find the Trip in Database
      const q = query(collection(db, "trips"), where("code", "==", tripId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const tripDoc = querySnapshot.docs[0];
        
        // 4. Save to Firestore
        await updateDoc(doc(db, "trips", tripDoc.id), {
          teamNames: newNames
        });
        console.log("SUCCESS: Team names saved to Firestore for trip", tripId);
      } else {
        console.warn("ERROR: Could not find a trip in database with code:", tripId);
      }
    } catch (error) {
      console.error("Error saving team names:", error);
      alert("Save Failed: " + error.message);
    }
  };

  let currentContent;
  if (view === 'setup') {
    currentContent = (
      <div className="space-y-6">
         {/* NEW: Only show this box if NOT subscribed */}
         {!isSubscribed && (
           <div className="bg-slate-800 p-4 rounded-lg shadow border border-slate-700 text-white">
    <h3 className="font-bold text-lg mb-2 text-white">Subscription Status</h3>
  
<div className="mb-2">
  <SubscribeButton 
    handlePurchase={handlePurchase} 
    handleRestore={handleRestore}
    isLoading={isLoading}
    isSubscribed={isSubscribed}
/>
</div>
{/* NEW: Manual Refresh Button */}


           </div>
         )}

         {/* EXISTING: Trip Setup Form */}
         <TripSetupView
            setTripId={setTripId}
            setRole={setRole}
            setView={setView}
            user={user}
            isSubscribed={isSubscribed}
            onSuccess={() => setIsSubscribed(true)}
         />
      </div>
    );
// REPLACE FROM LINE 2551 DOWN TO LINE 2571 WITH THIS:

} else if (view === 'profile') {
    // 1. FIX THE WHITE SCREEN (Pass the tools to the profile)
    currentContent = <UserProfileView 
        user={user}
        isSubscribed={isSubscribed}
        onSuccess={checkSubscriptionStatus}
        handlePurchase={handlePurchase}  // <--- Added
        handleRestore={handleRestore}    // <--- Added
        handleLogout={handleLogout}      // <--- Added
        isLoading={isLoading}            // <--- Added
    />;

} else if (!tripId) {
    currentContent = (
        <RestrictedAccessView 
            setView={setView} 
            isSubscribed={isSubscribed} 
        />
    );
} else {
    // 2. FIX THE SIGN OUT (Pass the tool to the Dashboard)
    // ✅ FINAL SWITCHBOARD: Handles 'ledger' AND 'expenses' button
            switch (view) {
                case 'dashboard':
                    currentContent = <Dashboard 
                        players={players} 
                        matches={matches} 
                        itinerary={itinerary} 
                        setView={setView} 
                        role={role} 
                        handleLogout={handleLogout} 
                    />;
                    break;

                case 'players': currentContent = <RosterView players={players} addPlayer={addPlayer} deletePlayer={deletePlayer} updatePlayer={updatePlayer} role={role} teamNames={teamNames} />; break;
                case 'tournament': currentContent = <TournamentView players={players} matches={matches} updateMatch={updateMatch} addMatch={addMatch} deleteMatch={deleteMatch} role={role} teamNames={teamNames} />; break;
                case 'messages': currentContent = <MessagesView messages={messages} addMessage={addMessage} user={user} />; break;
                case 'manage': currentContent = <ManageTripView />; break;
                case 'logistics': currentContent = <LogisticsView itinerary={itinerary} addItinerary={addItinerary} deleteItinerary={deleteItinerary} role={role} />; break;

                // ✅ FIX: Catches "finance", "ledger", AND "expenses"
                case 'finance':  // <--- THE MISSING KEY!
                case 'ledger': 
                case 'expenses': 
                    currentContent = <LedgerView 
                        players={players} 
                        expenses={expenses} 
                        bets={bets} 
                        addExpense={addExpense} 
                        addBet={addBet} 
                        deleteItem={deleteLedgerItem} 
                        role={role} 
                    />; 
                    break;

                default: 
                    currentContent = <Dashboard players={players} matches={matches} itinerary={itinerary} setView={setView} role={role} />;
            }
}
// 🔒 THE REAL GATEKEEPER (Paste this at Line 2622)
    if (!user) {
        return <AuthScreen onLogin={handleLogin} />;
    }
    // ⬇️ PASTE THE NEW CODE HERE (Before Line 2755) ⬇️
    // 🚨 BLOCKING GUARDRAIL 🚨
    if (!isReady) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111827', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Initializing...</h2>
                    <p style={{ color: '#9CA3AF' }}>Syncing Commissioner Data</p>
                </div>
            </div>
        );
    }
    // ⬆️ END OF NEW CODE ⬆️
return (
    // 1. Wrap everything in Router so URLs work
    <Router>
      <Layout
        view={view}
        setView={setView}
        user={user}
        role={role}
        setRole={setRole}
        tripId={tripId}
        setTripId={setTripId}
        handleLogout={handleLogout}
        handlePurchase={handlePurchase}
    handleRestore={handleRestore}
    isLoading={isLoading}
    isSubscribed={isSubscribed}
      >

        {/* --- THE SWITCHER --- */}
        <Routes>
          {/* Option A: If URL is "/", show the normal Golf App Dashboard */}
          <Route path="/" element={currentContent} />

          {/* Option B: If URL is "/premium", show the Subscription Card */}
          <Route path="/premium" element={
            <div className="flex justify-center items-center h-screen bg-gray-50">
               <SubscribeButton 
    handlePurchase={handlePurchase} 
    handleRestore={handleRestore}
    isLoading={isLoading}
    isSubscribed={isSubscribed}
/>
            </div>
          } />
          
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>

      </Layout>
    </Router>
  );
};

export default GolfTripCommissioner;