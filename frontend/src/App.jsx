import { auth, provider } from './firebase';
import {
  signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, updateProfile, signOut, onAuthStateChanged
} from 'firebase/auth';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Send, User, Bot, Loader2,
  LogOut, Search, Sun, Moon, Paperclip, Mail, Lock, Menu, X, AlertCircle,
  Calendar, CheckCircle, BrainCircuit, ChevronDown, Sparkles,
  Stethoscope, Video, ThumbsUp, MessageCircle, Share2, Home,
  FolderHeart, AlertTriangle, Pill, Phone, HeartHandshake, Calculator,
  Trophy, Footprints, Droplets, Heart, Check, Play, Pause, RotateCcw,
  Download, QrCode, FileText, ShoppingCart, Trash2, Plus, Minus,
  CircleGauge, MapPin, Sparkle, UsersRound, BriefcaseBusiness,
  MessageSquareText, Activity, Flame, BedDouble, Volume2,
  ShieldCheck, Printer, Clock
} from 'lucide-react';

// ── API Base URL ────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ── Viewport Hook ───────────────────────────────────────────────────────
function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));
  useEffect(() => {
    let raf;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return width;
}

// ── Global Toast System ─────────────────────────────────────────────────
function toast(message, tone = 'default') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hc-toast', { detail: { message, tone } }));
  }
}

function ToastHost({ isDarkMode }) {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, ...e.detail }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    };
    window.addEventListener('hc-toast', handler);
    return () => window.removeEventListener('hc-toast', handler);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              pointerEvents: 'auto', padding: '12px 22px', borderRadius: 16,
              background: isDarkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)',
              color: isDarkMode ? '#ffffff' : '#0f172a',
              border: `1px solid ${t.tone === 'error' ? 'rgba(239,68,68,0.4)' : isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)'}`,
              boxShadow: isDarkMode ? '0 16px 45px -10px rgba(0,0,0,0.6)' : '0 16px 45px -10px rgba(15,23,42,0.12)',
              fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10,
              backdropFilter: 'blur(24px)', maxWidth: '88vw',
            }}
          >
            {t.tone === 'error' ? (
              <AlertCircle size={17} color="#f87171" style={{ flexShrink: 0 }} />
            ) : (
              <CheckCircle size={17} color="#34d399" style={{ flexShrink: 0 }} />
            )}
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Deterministic PRNG Helper ───────────────────────────────────────────
function _seededRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// ── Global Styles ───────────────────────────────────────────────────────
const GlobalStyles = ({ isDarkMode }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800;900&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      overscroll-behavior: none;
      scroll-behavior: smooth;
    }
    body {
      background: ${isDarkMode ? '#070d1e' : '#f8fafc'};
      color: ${isDarkMode ? '#ffffff' : '#0f172a'};
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s ease;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: ${isDarkMode ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.18)'};
      border-radius: 999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)'};
    }
    .text-gradient-hero {
      background: linear-gradient(135deg, #60a5fa 0%, #34d399 50%, #818cf8 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .text-gradient-warm {
      background: linear-gradient(135deg, #f472b6 0%, #fb923c 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .text-gradient-cool {
      background: linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulseDot { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }
    @keyframes floatCard { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
    @keyframes floatOrb1 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(60px, 40px) scale(1.1); }
      100% { transform: translate(-30px, 70px) scale(0.95); }
    }
    @keyframes floatOrb2 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-70px, -50px) scale(1.15); }
      100% { transform: translate(40px, 30px) scale(0.9); }
    }
    @keyframes floatOrb3 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(40px, -40px) scale(1.08); }
      100% { transform: translate(-50px, 20px) scale(0.92); }
    }
    @keyframes pulseLine {
      0% { stroke-dashoffset: 1200; opacity: 0; }
      15% { opacity: 1; }
      85% { opacity: 1; }
      100% { stroke-dashoffset: -1200; opacity: 0; }
    }
    .hc-pulse-path {
      animation: pulseLine 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }
    .hc-glass {
      background: ${isDarkMode ? 'rgba(11, 20, 42, 0.78)' : 'rgba(255, 255, 255, 0.88)'};
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'};
      box-shadow: ${isDarkMode ? '0 16px 40px -12px rgba(0,0,0,0.5), 0 0 1px 1px rgba(255,255,255,0.04)' : '0 16px 40px -12px rgba(15, 23, 42, 0.07), 0 1px 3px rgba(0, 0, 0, 0.04)'};
      color: ${isDarkMode ? '#ffffff' : '#0f172a'};
    }
    .hc-scroll-panel {
      scrollbar-width: thin;
      scrollbar-color: ${isDarkMode ? 'rgba(255,255,255,0.18) transparent' : 'rgba(15,23,42,0.18) transparent'};
    }
    @media (max-width: 768px) {
      .hc-scroll-panel { padding: 18px 14px 110px !important; }
      .side-scroll-rail { display: none !important; }
    }
  `}</style>
);

// ── Ultra-smooth Modern Animated Background (100% Theme Reactive, No Three.js/DNA issues) ──
function ModernAnimatedBackground({ isDarkMode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: isDarkMode
          ? 'radial-gradient(ellipse at 50% 20%, #0d1733 0%, #070d1e 55%, #030612 100%)'
          : 'radial-gradient(ellipse at 50% 20%, #eff6ff 0%, #f8fafc 60%, #e2e8f0 100%)',
        transition: 'background 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Ambient Floating Gradient Blur Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '12%',
          width: '52vw',
          height: '52vw',
          maxWidth: '720px',
          maxHeight: '720px',
          borderRadius: '50%',
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(59, 130, 246, 0.04) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(59, 130, 246, 0.03) 50%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'floatOrb1 20s infinite alternate ease-in-out',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '32%',
          right: '-6%',
          width: '46vw',
          height: '46vw',
          maxWidth: '650px',
          maxHeight: '650px',
          borderRadius: '50%',
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.04) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.03) 50%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'floatOrb2 25s infinite alternate ease-in-out',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: '25%',
          width: '55vw',
          height: '55vw',
          maxWidth: '800px',
          maxHeight: '800px',
          borderRadius: '50%',
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.13) 0%, rgba(99, 102, 241, 0.03) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.02) 50%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'floatOrb3 22s infinite alternate ease-in-out',
        }}
      />

      {/* Subtle Clinical Tech Grid Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: isDarkMode
            ? 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)'
            : 'linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 45%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 40%, transparent 80%)',
        }}
      />

      {/* Gentle ECG Pulse Wave Line */}
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: '16%',
          left: 0,
          width: '100%',
          height: '70px',
          opacity: isDarkMode ? 0.14 : 0.09,
        }}
      >
        <path
          d="M0,60 L380,60 L410,35 L430,85 L450,20 L470,95 L490,55 L510,65 L530,60 L1200,60"
          fill="none"
          stroke="url(#pulseGrad)"
          strokeWidth="2.5"
          strokeDasharray="1200"
          className="hc-pulse-path"
        />
        <defs>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
            <stop offset="40%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="60%" stopColor="#60a5fa" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ── User Avatar Component ───────────────────────────────────────────────
function initialsAvatarDataUri(name = 'User') {
  const initials = (name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map(p => p[0]?.toUpperCase() || '').join('') || '?';
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  const c1 = `hsl(${hue}, 70%, 55%)`;
  const c2 = `hsl(${(hue + 55) % 360}, 70%, 42%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
    <rect width="160" height="160" rx="80" fill="url(#g)"/>
    <text x="50%" y="54%" font-family="Inter, sans-serif" font-size="64" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function UserAvatar({ src, name = 'User', size = 40, style, ...rest }) {
  const [loadError, setLoadError] = useState(false);
  const fallback = useMemo(() => initialsAvatarDataUri(name), [name]);
  const avatarSrc = !loadError && src ? src : fallback;

  return (
    <img
      key={src || name}
      src={avatarSrc}
      alt={name}
      onError={() => setLoadError(true)}
      referrerPolicy="no-referrer"
      style={{
        width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexShrink: 0, ...style
      }}
      {...rest}
    />
  );
}

// ── UI Helpers ──────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`hc-glass ${className}`}
      style={{
        borderRadius: '22px', padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s, background 0.3s, border-color 0.3s',
        ...style
      }}
    >
      {children}
    </div>
  );
}

function TypingDots({ color = '#3b82f6' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 0' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7, height: 7, borderRadius: '50%', background: color,
            display: 'inline-block',
            animation: `pulseDot 1.4s infinite ease-in-out both`,
            animationDelay: `${i * 0.18}s`
          }}
        />
      ))}
    </div>
  );
}

function InputField({ icon, style, isDark = true, ...props }) {
  return (
    <div style={{ position: 'relative', marginBottom: '14px', ...style }}>
      {icon && (
        <span style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: isDark ? 'rgba(148,163,184,0.65)' : 'rgba(100,116,139,0.7)', zIndex: 1
        }}>
          {icon}
        </span>
      )}
      <input
        style={{
          width: '100%', height: '48px',
          background: isDark ? 'rgba(0,0,0,0.45)' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.14)'}`,
          borderRadius: '14px', color: isDark ? '#ffffff' : '#0f172a',
          padding: icon ? '0 16px 0 46px' : '0 16px',
          fontSize: '14px', outline: 'none', transition: 'border-color 0.2s, background 0.2s',
          fontFamily: 'inherit',
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.03)'
        }}
        {...props}
      />
    </div>
  );
}
// ── Cinematic Landing Page ──────────────────────────────────────────────
function CinematicLanding({ onLogin, onGuestLogin, scrollProgressRef, isDarkMode, setIsDarkMode }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (scrollProgressRef) scrollProgressRef.current = v;
  });

  const s1Opacity = useTransform(scrollYProgress, [0, 0.18, 0.25], [1, 1, 0]);
  const s1Y = useTransform(scrollYProgress, [0, 0.25], [0, -80]);

  const s2Opacity = useTransform(scrollYProgress, [0.22, 0.35, 0.5, 0.6], [0, 1, 1, 0]);
  const s2Y = useTransform(scrollYProgress, [0.22, 0.35], [60, 0]);

  const s3Opacity = useTransform(scrollYProgress, [0.55, 0.68, 0.8, 0.88], [0, 1, 1, 0]);
  const s3Y = useTransform(scrollYProgress, [0.55, 0.68], [60, 0]);

  const s4Opacity = useTransform(scrollYProgress, [0.82, 1], [0, 1]);
  const s4Y = useTransform(scrollYProgress, [0.82, 1], [60, 0]);

  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(255,255,255,0.68)' : '#475569';
  const textMuted = isDarkMode ? 'rgba(255,255,255,0.45)' : '#64748b';
  const cardBg = isDarkMode ? 'rgba(11, 20, 44, 0.88)' : 'rgba(255, 255, 255, 0.94)';
  const cardBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)';
  const cardShadow = isDarkMode ? '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px rgba(59,130,246,0.15)' : '0 25px 60px -15px rgba(15,23,42,0.12), 0 0 40px rgba(59,130,246,0.06)';

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      if (!auth || !provider) {
        toast("Firebase Auth is in Demo Mode. Entering as Verified Guest...", "default");
        onGuestLogin();
        return;
      }
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') return;
      if (error.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by browser. Please allow popups or use Guest Mode.');
        return;
      }
      setAuthError(error.message?.replace('Firebase: ', '') || 'Google sign-in encountered an issue. Try Guest Mode.');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMsg('');
    setIsAuthLoading(true);

    try {
      if (!auth) {
        toast("Firebase not configured. Launching instant guest demo!", "default");
        onGuestLogin();
        return;
      }

      if (isLoginMode) {
        if (!email || !password) throw new Error("Please enter both email and password.");
        await signInWithEmailAndPassword(auth, email, password);
        onLogin();
      } else {
        if (!fullName || !email || !password || !confirmPassword) throw new Error("Please fill all required fields.");
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: fullName });

        try {
          localStorage.setItem(`hc_profile_${cred.user.uid}`, JSON.stringify({ dob, gender, fullName }));
        } catch { /* storage full */ }

        try {
          await sendEmailVerification(cred.user);
        } catch { /* ignore verification fail */ }

        setSuccessMsg("Account created successfully! Signing in...");
        setTimeout(() => onLogin(), 1000);
      }
    } catch (error) {
      setAuthError(error.message?.replace("Firebase: ", "") || "Authentication failed.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '440vh' }}>
      {/* ── Floating Landing Navbar (Theme Toggle + Quick Demo) ── */}
      <nav style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: '1080px', height: 56,
        background: isDarkMode ? 'rgba(11, 20, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(28px) saturate(180%)',
        border: `1px solid ${cardBorder}`, borderRadius: 999,
        padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 100, boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(15,23,42,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'grid', placeItems: 'center', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
            <BrainCircuit size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em', color: textPrimary }}>
            HealthCatch <span style={{ color: '#3b82f6' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live AI Status Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            borderRadius: 99, background: isDarkMode ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)',
            color: '#10b981', fontSize: 11, fontWeight: 800
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulseDot 1.5s infinite' }} />
            <span>Gemini 3.5 AI Ready</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: `1px solid ${cardBorder}`,
              background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
              color: isDarkMode ? '#fde047' : '#64748b', cursor: 'pointer', display: 'grid', placeItems: 'center',
              transition: 'transform 0.2s'
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Quick Demo Button */}
          <button
            onClick={onGuestLogin}
            style={{
              padding: '7px 16px', borderRadius: 99, border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff',
              fontSize: 12.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 14px rgba(59,130,246,0.35)'
            }}
          >
            <Sparkles size={14} /> Launch Demo
          </button>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <motion.div style={{ opacity: s1Opacity, y: s1Y, position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <div style={{ maxWidth: '860px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: 28 }}>
            <BrainCircuit size={17} color="#60a5fa" />
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#60a5fa' }}>HEALTHCATCH AI 2.0</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 7vw, 84px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '24px', fontFamily: "'Space Grotesk', sans-serif" }}>
            <span style={{ color: textPrimary }}>Your Health.</span><br />
            <span className="text-gradient-hero">Decoded by AI.</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 20px)', color: textSecondary, maxWidth: '580px', margin: '0 auto 36px', lineHeight: 1.65 }}>
            The empathetic clinical companion combining real-time behavioral insights, smart challenges, and multimodal AI medical guidance.
          </p>
        </div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: textMuted }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 800 }}>Scroll down or tap to explore</span>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>

      {/* SECTION 2: VALUES & CAPABILITIES */}
      <motion.div style={{ opacity: s2Opacity, y: s2Y, position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.03em', maxWidth: '780px', fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>
          Every heartbeat tells a story.<br />We help you <span className="text-gradient-warm">understand it.</span>
        </h2>
        <p style={{ fontSize: '16px', color: textSecondary, maxWidth: '540px', margin: '18px auto 32px', lineHeight: 1.65 }}>
          From daily hydration habits to clinical symptom assessment, HealthCatch keeps you empowered without medical overwhelm.
        </p>

        {/* 3 Pillar Preview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, width: '100%', maxWidth: '860px', pointerEvents: 'auto' }}>
          {[
            { icon: <Activity size={22} color="#3b82f6" />, title: 'Real-Time Vitals', desc: 'Continuous tracking of hydration, steps, mood, and sleep cycles.' },
            { icon: <CircleGauge size={22} color="#10b981" />, title: 'Digital Health Passport', desc: 'Secure, portable medical identity card with emergency responder QR.' },
            { icon: <Sparkle size={22} color="#a855f7" />, title: 'Multimodal AI Triage', desc: 'Clinical guidance, prescription review, and 4-7-8 nervous system pacing.' },
          ].map((c, i) => (
            <GlassCard key={i} style={{ padding: '22px', textAlign: 'left' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                {c.icon}
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: textPrimary }}>{c.title}</h4>
              <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.55 }}>{c.desc}</p>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* SECTION 3: INTELLIGENCE */}
      <motion.div style={{ opacity: s3Opacity, y: s3Y, position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 54px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '20px', fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>
          Powered by <span className="text-gradient-cool">clinical intelligence.</span>
        </h2>
        <p style={{ fontSize: '16px', color: textSecondary, maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.65 }}>
          Multimodal vision models analyze lab reports and prescriptions, while behavioral coaches pace your daily goals with evidence-based habits.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Gemini 3.5 Flash Powered', 'Validated Emergency Red-Flags', 'HIPAA-Aligned Privacy', 'Offline Clinical Fallback'].map((tag) => (
            <span key={tag} style={{ padding: '6px 16px', borderRadius: 99, background: isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)', fontSize: 12, fontWeight: 800 }}>
              ✓ {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* SECTION 4: AUTH CARD */}
      <motion.div style={{ opacity: s4Opacity, y: s4Y, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'auto' }}>
        <div style={{
          width: '100%', maxWidth: '440px', background: cardBg,
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid ${cardBorder}`, borderRadius: '28px',
          padding: '36px 30px', boxShadow: cardShadow, color: textPrimary,
          transition: 'background 0.3s, border-color 0.3s'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: '13px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'grid', placeItems: 'center', boxShadow: '0 0 25px rgba(59,130,246,0.4)' }}>
              <BrainCircuit size={22} color="#fff" />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>HealthCatch AI</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', marginBottom: '6px', fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ textAlign: 'center', fontSize: '13px', color: textSecondary, marginBottom: 20 }}>
            {isLoginMode ? 'Access your private health passport & AI coach' : 'Join thousands improving their health journey'}
          </p>

          {authError && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '12.5px', textAlign: 'center' }}>
              {authError}
            </div>
          )}
          {successMsg && (
            <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#34d399', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '12.5px', textAlign: 'center' }}>
              <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {!isLoginMode && (
              <>
                <InputField isDark={isDarkMode} icon={<User size={16} />} type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <div style={{ display: 'flex', gap: 10 }}>
                  <InputField isDark={isDarkMode} icon={<Calendar size={16} />} type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={{ flex: 1 }} />
                  <div style={{ position: 'relative', flex: 1, marginBottom: '14px' }}>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{
                        width: '100%', height: '48px',
                        background: isDarkMode ? 'rgba(0,0,0,0.45)' : '#ffffff',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.14)'}`,
                        borderRadius: '14px',
                        color: textPrimary, padding: '0 14px',
                        fontSize: '13px', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="unspecified">Gender: Other</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <InputField isDark={isDarkMode} icon={<Mail size={16} />} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <InputField isDark={isDarkMode} icon={<Lock size={16} />} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {!isLoginMode && (
              <InputField isDark={isDarkMode} icon={<Lock size={16} />} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              style={{
                width: '100%', height: '48px', borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff',
                fontSize: '14.5px', fontWeight: 800, cursor: 'pointer', marginTop: '4px',
                boxShadow: '0 6px 20px -4px rgba(59,130,246,0.45)'
              }}
            >
              {isAuthLoading ? <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto' }} /> : (isLoginMode ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Quick Demo Mode Button */}
          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              onClick={onGuestLogin}
              style={{
                width: '100%', height: '44px', borderRadius: '14px',
                background: isDarkMode ? 'rgba(59,130,246,0.14)' : 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#3b82f6', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <Sparkles size={16} /> Explore as Guest (Instant Demo)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', gap: 12 }}>
            <div style={{ flex: 1, height: '1px', background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }} />
            <span style={{ fontSize: '11px', color: textMuted, fontWeight: 700 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%', height: '46px', borderRadius: '14px',
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.14)'}`,
              color: textPrimary, fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: 17, height: 17 }} /> Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: textMuted }}>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); setSuccessMsg(''); }}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 800, cursor: 'pointer' }}
            >
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
// ── MODALS & SUB-COMPONENTS ─────────────────────────────────────────────

function AppointmentBookingModal({ doctor, onClose, onConfirm, isDarkMode }) {
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [slot, setSlot] = useState('10:00 AM');
  const [type, setType] = useState('video');
  const [reason, setReason] = useState('');

  const slots = ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'];
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(255,255,255,0.65)' : '#475569';
  const modalBg = isDarkMode ? '#0f172a' : '#ffffff';
  const borderCol = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)';
  const inputBg = isDarkMode ? '#1e293b' : '#f8fafc';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: '16px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        style={{
          width: '100%', maxWidth: 480, background: modalBg, borderRadius: 24, padding: 28,
          border: `1px solid ${borderCol}`, boxShadow: '0 25px 60px rgba(0,0,0,0.4)', color: textPrimary
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', letterSpacing: '0.08em', textTransform: 'uppercase' }}>APPOINTMENT BOOKING</span>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{doctor.name}</h3>
            <p style={{ fontSize: 12, color: textSecondary }}>{doctor.spec} · {doctor.fee}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 6 }}>Select Consultation Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', height: 44, borderRadius: 12, border: `1px solid ${borderCol}`, background: inputBg, color: textPrimary, padding: '0 14px', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 8 }}>Available Time Slot</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {slots.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                style={{
                  padding: '9px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  border: slot === s ? '2px solid #3b82f6' : `1px solid ${borderCol}`,
                  background: slot === s ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: slot === s ? '#3b82f6' : textPrimary
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 8 }}>Consultation Mode</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setType('video')}
              style={{
                flex: 1, padding: 10, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: type === 'video' ? '2px solid #10b981' : `1px solid ${borderCol}`,
                background: type === 'video' ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: type === 'video' ? '#10b981' : textPrimary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <Video size={16} /> Video Call
            </button>
            <button
              type="button"
              onClick={() => setType('clinic')}
              style={{
                flex: 1, padding: 10, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: type === 'clinic' ? '2px solid #3b82f6' : `1px solid ${borderCol}`,
                background: type === 'clinic' ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: type === 'clinic' ? '#3b82f6' : textPrimary,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <Stethoscope size={16} /> In Clinic
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 6 }}>Reason for Visit (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Routine blood pressure check, persistent fatigue"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${borderCol}`, background: inputBg, color: textPrimary, padding: '0 14px', outline: 'none', fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 44, borderRadius: 12, border: `1px solid ${borderCol}`, background: 'transparent', color: textPrimary, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => onConfirm({ doctorId: doctor.id, doctorName: doctor.name, date, slot, type, reason })}
            style={{ flex: 2, height: 44, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
          >
            Confirm Booking
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TelehealthVideoRoomModal({ doctor, onClose, onSaveSummary }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (onSaveSummary) {
      onSaveSummary({
        id: `v-sum-${Date.now()}`,
        name: `Clinical_Summary_${doctor?.name?.replace(/\s+/g, '_') || 'Doctor'}.pdf`,
        date: new Date().toISOString().split('T')[0],
        category: 'Prescriptions',
        size: '512 KB'
      });
    }
    toast("Telehealth session completed. Consultation summary saved to Medical Vault! 📋");
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#020617', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{ height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulseDot 1.5s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ENCRYPTED TELEHEALTH ROOM</span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>· {formatTime(callDuration)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Consulting with: <strong style={{ color: '#fff' }}>{doctor?.name || 'Dr. Amit Patel'}</strong></span>
        </div>
      </div>

      {/* Main Video & Notes Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.6fr)', gap: 16, padding: 20 }}>
        {/* Remote Doctor Feed */}
        <div style={{ position: 'relative', background: '#0f172a', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', boxShadow: '0 0 50px rgba(59,130,246,0.35)' }}>
              <Stethoscope size={50} color="#fff" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{doctor?.name || 'Dr. Amit Patel'}</h3>
            <p style={{ color: '#60a5fa', fontSize: 14, marginTop: 4 }}>{doctor?.spec || 'Specialist'}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: 12, fontWeight: 700, marginTop: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> Audio & Video Stream Active
            </div>
          </div>

          {/* Self PiP */}
          <div style={{
            position: 'absolute', bottom: 20, right: 20, width: 160, height: 110,
            borderRadius: 16, background: '#1e293b', border: '2px solid rgba(255,255,255,0.2)',
            overflow: 'hidden', display: 'grid', placeItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            {isVideoOff ? (
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Camera Off</span>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <User size={24} color="#60a5fa" style={{ margin: '0 auto 4px' }} />
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>You (Patient)</span>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Consultation Notes Sidebar */}
        <div style={{ background: 'rgba(15,23,42,0.92)', borderRadius: 24, padding: 22, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#60a5fa" /> Live Clinical Consultation Notes
          </h4>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.35)', borderRadius: 16, padding: 16, fontSize: 13, lineHeight: 1.65, color: '#cbd5e1' }}>
            <p><strong>Chief Assessment:</strong> Routine vitals & metabolic wellness review.</p>
            <p style={{ marginTop: 10 }}><strong>Physician Remarks:</strong> Blood pressure stability is within standard physiological parameters (118/76 mmHg). Step activity and hydration goals are well maintained.</p>
            <p style={{ marginTop: 10 }}><strong>Prescribed Guidance:</strong></p>
            <ul style={{ paddingLeft: 18, marginTop: 4 }}>
              <li>Continue 2.5–3.0 L daily hydration routine.</li>
              <li>Maintain 30 min daily aerobic cardio pacing.</li>
              <li>Follow up in 4 weeks or as symptoms dictate.</li>
            </ul>
          </div>
          <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 'rgba(59,130,246,0.12)', color: '#93c5fd', fontSize: 12 }}>
            🔒 End-to-end encrypted under clinical telehealth privacy standards.
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div style={{ height: 80, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.95)' }}>
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          <Phone size={20} />
        </button>
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', background: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          title={isVideoOff ? 'Start Camera' : 'Stop Camera'}
        >
          <Video size={20} />
        </button>
        <button
          onClick={handleEndCall}
          style={{ padding: '0 28px', height: 50, borderRadius: 25, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          End Consultation
        </button>
      </div>
    </div>
  );
}

function ShoppingCartDrawer({ cart, onClose, onUpdateQty, onRemove, onCheckout, isDarkMode }) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const drawerBg = isDarkMode ? '#0f172a' : '#ffffff';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(255,255,255,0.65)' : '#475569';
  const borderCol = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end' }}>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        style={{ width: '100%', maxWidth: 440, height: '100%', background: drawerBg, boxShadow: '-10px 0 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', color: textPrimary }}
      >
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={20} color="#3b82f6" />
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Health Market Cart</h3>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontWeight: 800 }}>
              {cart.reduce((a, b) => a + b.qty, 0)} items
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: textSecondary }}>
              <ShoppingCart size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 15, fontWeight: 700 }}>Your cart is empty</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Explore verified health supplements and diagnostic devices.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 16, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)', border: `1px solid ${borderCol}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'grid', placeItems: 'center', color: '#3b82f6', flexShrink: 0 }}>
                  <Pill size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                  <p style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{item.shop}</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#10b981', marginTop: 4 }}>₹{item.price * item.qty}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}><Trash2 size={15} /></button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDarkMode ? '#1e293b' : '#e2e8f0', borderRadius: 8, padding: '2px 4px' }}>
                    <button onClick={() => onUpdateQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textPrimary }}><Minus size={12} /></button>
                    <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textPrimary }}><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: 20, borderTop: `1px solid ${borderCol}`, background: isDarkMode ? 'rgba(15,23,42,0.95)' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: textSecondary, marginBottom: 6 }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: textSecondary, marginBottom: 12 }}>
              <span>Estimated 5% GST & Shipping</span>
              <span>₹{tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, marginBottom: 18 }}>
              <span>Total</span>
              <span style={{ color: '#10b981' }}>₹{total}</span>
            </div>
            <button
              onClick={onCheckout}
              style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(59,130,246,0.4)' }}
            >
              Confirm & Checkout
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SOSModal({ onClose, isDarkMode }) {
  const modalBg = isDarkMode ? '#0f172a' : '#ffffff';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(255,255,255,0.65)' : '#475569';
  const borderCol = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)';

  const lines = [
    { country: 'National Emergency', num: '112', desc: 'Police, Fire, All Medical emergencies' },
    { country: 'Ambulance Direct', num: '108 / 102', desc: 'Government immediate emergency transit' },
    { country: 'Tele-MANAS Mental Health', num: '14416', desc: 'Government 24/7 toll-free crisis support' },
    { country: 'KIRAN Mental Health', num: '1800-599-0019', desc: 'National mental counseling line' },
    { country: 'US/Canada Crisis Lifeline', num: '988', desc: 'Call or text suicide & crisis hotline' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ width: '100%', maxWidth: 460, background: modalBg, borderRadius: 24, padding: 26, border: '1px solid rgba(239,68,68,0.3)', color: textPrimary, boxShadow: '0 25px 60px rgba(239,68,68,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'grid', placeItems: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900 }}>Emergency Crisis Hotlines</h3>
              <p style={{ fontSize: 11, color: textSecondary }}>Tap any hotline to dial immediately</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {lines.map((l, i) => (
            <a
              key={i}
              href={`tel:${l.num.replace(/[^0-9]/g, '')}`}
              onClick={() => toast(`Calling ${l.num}...`)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px', borderRadius: 14, textDecoration: 'none',
                background: isDarkMode ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${borderCol}`
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: textPrimary }}>{l.country}</p>
                <p style={{ fontSize: 11, color: textSecondary }}>{l.desc}</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#ef4444', padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.15)' }}>
                {l.num}
              </span>
            </a>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{ width: '100%', height: 42, borderRadius: 12, border: 'none', background: 'rgba(15,23,42,0.1)', color: textPrimary, fontWeight: 700, cursor: 'pointer' }}
        >
          Close Emergency Dialog
        </button>
      </motion.div>
    </div>
  );
}

function AddMedicationModal({ onClose, onAdd, isDarkMode }) {
  const [name, setName] = useState('');
  const [time, setTime] = useState('Morning (08:00 AM)');
  const modalBg = isDarkMode ? '#0f172a' : '#ffffff';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(255,255,255,0.65)' : '#475569';
  const borderCol = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)';
  const inputBg = isDarkMode ? '#1e293b' : '#f8fafc';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 16 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ width: '100%', maxWidth: 420, background: modalBg, borderRadius: 22, padding: 24, border: `1px solid ${borderCol}`, color: textPrimary }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>Add Medication</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Medication / Supplement Name</label>
          <input
            type="text"
            placeholder="e.g. Omega-3 1000mg, Metformin 500mg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${borderCol}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none' }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Schedule / Timing</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${borderCol}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none', cursor: 'pointer' }}
          >
            <option>Morning (08:00 AM)</option>
            <option>With Lunch (01:00 PM)</option>
            <option>Evening (06:00 PM)</option>
            <option>Before Bed (10:00 PM)</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${borderCol}`, background: 'transparent', color: textPrimary, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => {
              if (name.trim()) {
                onAdd({ id: Date.now(), name: name.trim(), time, taken: false });
                onClose();
              }
            }}
            disabled={!name.trim()}
            style={{ flex: 1, height: 42, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: name.trim() ? 1 : 0.5 }}
          >
            Save Dose
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CommentsDrawer({ post, onClose, onAddComment, isDarkMode }) {
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([
    { id: 1, user: 'Dr. Sneha Roy', text: 'Terrific consistency! Keep pacing your heart rate zones.', time: '10m ago' },
    { id: 2, user: 'Alex Morgan', text: 'Hydration before morning cardio makes all the difference.', time: '5m ago' }
  ]);

  const modalBg = isDarkMode ? '#0f172a' : '#ffffff';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(255,255,255,0.65)' : '#475569';
  const borderCol = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end' }}>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        style={{ width: '100%', maxWidth: 420, height: '100%', background: modalBg, display: 'flex', flexDirection: 'column', color: textPrimary, boxShadow: '-10px 0 40px rgba(0,0,0,0.3)' }}
      >
        <div style={{ padding: '20px', borderBottom: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 800 }}>Comments ({commentsList.length})</h4>
            <p style={{ fontSize: 11, color: textSecondary }}>Post by {post?.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {commentsList.map(c => (
            <div key={c.id} style={{ padding: 12, borderRadius: 14, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)', border: `1px solid ${borderCol}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 800 }}>{c.user}</span>
                <span style={{ fontSize: 10, color: textSecondary }}>{c.time}</span>
              </div>
              <p style={{ fontSize: 12.5, color: textSecondary }}>{c.text}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: 16, borderTop: `1px solid ${borderCol}`, display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Write a supportive reply..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && commentText.trim()) {
                setCommentsList([...commentsList, { id: Date.now(), user: 'You', text: commentText.trim(), time: 'Just now' }]);
                if (onAddComment) onAddComment();
                setCommentText('');
              }
            }}
            style={{ flex: 1, height: 40, borderRadius: 10, border: `1px solid ${borderCol}`, background: isDarkMode ? '#1e293b' : '#f8fafc', color: textPrimary, padding: '0 12px', outline: 'none', fontSize: 12.5 }}
          />
          <button
            onClick={() => {
              if (commentText.trim()) {
                setCommentsList([...commentsList, { id: Date.now(), user: 'You', text: commentText.trim(), time: 'Just now' }]);
                if (onAddComment) onAddComment();
                setCommentText('');
              }
            }}
            style={{ padding: '0 16px', height: 40, borderRadius: 10, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
          >
            Reply
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── MOCK DATA LISTS ─────────────────────────────────────────────────────
const MOCK_DOCTORS_LIST = [
  { id: 1, name: 'Dr. Amit Patel', spec: 'Cardiologist', rating: '4.9/5', available: 'Available Now', fee: '₹800', exp: '14 yrs exp', clinic: 'Metro Heart Centre, Kolkata' },
  { id: 2, name: 'Dr. Sneha Roy', spec: 'Clinical Psychologist', rating: '5.0/5', available: 'Next Slot: 2:00 PM', fee: '₹1,200', exp: '10 yrs exp', clinic: 'MindCare Clinic, Salt Lake' },
  { id: 3, name: 'Dr. Rajesh Sharma', spec: 'General Physician', rating: '4.8/5', available: 'Available Today', fee: '₹500', exp: '18 yrs exp', clinic: 'City Health Hospital, Howrah' },
  { id: 4, name: 'Dr. Priya Sengupta', spec: 'Dermatologist', rating: '4.9/5', available: 'Next Slot: Tomorrow', fee: '₹750', exp: '8 yrs exp', clinic: 'Apollo Skin Centre' },
  { id: 5, name: 'Dr. Vikram Malhotra', spec: 'Orthopedic Surgeon', rating: '4.9/5', available: 'Next Slot: 4:30 PM', fee: '₹950', exp: '16 yrs exp', clinic: 'Fortis Bone & Joint, Delhi' },
  { id: 6, name: 'Dr. Ananya Roy', spec: 'Pediatric Specialist', rating: '5.0/5', available: 'Available Today', fee: '₹700', exp: '12 yrs exp', clinic: 'Children\'s Care Clinic, Kolkata' }
];

const INITIAL_MARKET_ITEMS = [
  { id: 'item-1', title: 'Multivitamin Complex + Zinc', category: 'supplements', desc: 'Promotes sustained metabolic energy & natural immune defense.', price: 450, shop: 'Apollo Pharmacy', inStock: true },
  { id: 'item-2', title: 'Omega 3 Triple Strength Fish Oil', category: 'supplements', desc: 'Rich in EPA & DHA to support joint flexibility & cardiac function.', price: 899, shop: 'Wellness Medico', inStock: true },
  { id: 'item-3', title: 'Digital Arm Blood Pressure Monitor', category: 'devices', desc: 'Clinically validated accurate oscillometric measurement.', price: 1799, shop: 'HealthTech Diagnostics', inStock: true },
  { id: 'item-4', title: 'Herbal Chamomile Sleep Tea', category: 'wellness', desc: 'Organic whole-flower tea to calm evening nervous system.', price: 340, shop: 'AyurVeda Organic Stores', inStock: true },
  { id: 'item-5', title: 'Ergonomic Memory Foam Lumbar Support', category: 'devices', desc: 'Orthopedic posture support for desk work & spinal relief.', price: 1250, shop: 'ErgoLife India', inStock: true },
  { id: 'item-6', title: 'Electrolyte Hydration Tabs (Berry)', category: 'supplements', desc: 'Fast-absorbing magnesium, potassium & sodium effervescent tablets.', price: 299, shop: 'FitFuel Nutrition', inStock: true },
  { id: 'item-7', title: 'Fingertip OLED Pulse Oximeter', category: 'devices', desc: 'Instant SpO2 oxygen saturation and pulse rate monitor.', price: 850, shop: 'PulseMed India', inStock: true },
  { id: 'item-8', title: 'First Aid Trauma Emergency Kit', category: 'wellness', desc: 'Comprehensive antiseptic bandages, burn gel, and splints.', price: 620, shop: 'CarePlus Direct', inStock: true }
];
// ── Authenticated App (Super-App Experience) ─────────────────────────────
function AuthenticatedApp({ onLogout, isDarkMode, setIsDarkMode }) {
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // User Profile
  const [userName, setUserName] = useState(() => {
    return auth?.currentUser?.displayName || 'Alex Morgan';
  });
  const [userEmail] = useState(() => {
    return auth?.currentUser?.email || 'alex.morgan@healthcatch.ai';
  });
  const [userPhoto] = useState(() => {
    return auth?.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;
  });
  const [userAge, setUserAge] = useState(28);
  const [userBloodGroup, setUserBloodGroup] = useState('O Positive (O+)');
  const [userEmergencyContact, setUserEmergencyContact] = useState('+91 98765 43210');
  const [userTargetSteps, setUserTargetSteps] = useState(10000);
  const [userTargetWater, setUserTargetWater] = useState(3.0);

  // Health Metrics & Dashboard State
  const [waterGlasses, setWaterGlasses] = useState(8); // 8 x 250ml = 2.0L
  const [dailySteps, setDailySteps] = useState(7420);
  const [todayMood, setTodayMood] = useState('Great');
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality] = useState(88); // %
  const [activeCalories, setActiveCalories] = useState(540); // kcal

  const [medications, setMedications] = useState([
    { id: 1, name: 'Vitamin D3 (1000 IU)', time: 'Morning with food', taken: true },
    { id: 2, name: 'Omega-3 Fish Oil (1000mg)', time: 'With Lunch', taken: true },
    { id: 3, name: 'Magnesium Glycinate (200mg)', time: 'Before bed', taken: false }
  ]);
  const [allergies, setAllergies] = useState(['Penicillin', 'Peanuts', 'Dust Mites']);
  const [newAllergyInput, setNewAllergyInput] = useState('');

  // Challenges State
  const [challenges, setChallenges] = useState([
    { id: 'c1', title: '10K Steps Daily', goal: 10000, current: 7420, xp: 120, joined: true, icon: '🏃' },
    { id: 'c2', title: 'Hydration Hero (3L/day)', goal: 3000, current: 2000, xp: 80, joined: true, icon: '💧' },
    { id: 'c3', title: '7-Day Sugar Detox', goal: 7, current: 4, xp: 200, joined: true, icon: '🥗' },
    { id: 'c4', title: 'Mindful 4-7-8 Breathing', goal: 10, current: 10, xp: 60, joined: true, icon: '🧘' },
    { id: 'c5', title: '8-Hour Restorative Sleep', goal: 8, current: 7.5, xp: 90, joined: true, icon: '🌙' },
    { id: 'c6', title: '30m Aerobic Cardio', goal: 30, current: 25, xp: 110, joined: false, icon: '⚡' }
  ]);
  const [userXP, setUserXP] = useState(850);
  const [claimedChallenges, setClaimedChallenges] = useState({ c4: true });

  // Cart & Market State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState('all');
  const [marketSearch, setMarketSearch] = useState('');

  // Doctors & Telehealth Booking State
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [activeVideoCallDoctor, setActiveVideoCallDoctor] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorSpecFilter, setDoctorSpecFilter] = useState('All');
  const [bookedAppointments, setBookedAppointments] = useState([
    { doctorId: 1, doctorName: 'Dr. Amit Patel', date: 'Tomorrow', slot: '11:00 AM', type: 'video', reason: 'Routine cardiovascular check' }
  ]);

  // Medical Vault State
  const [vaultDocuments, setVaultDocuments] = useState([
    { id: 'v1', name: 'Comprehensive_Blood_Panel_2026.pdf', date: '2026-10-14', category: 'Lab Reports', size: '1.4 MB' },
    { id: 'v2', name: 'Prescription_Dr_Amit_Patel.pdf', date: '2026-09-28', category: 'Prescriptions', size: '420 KB' },
    { id: 'v3', name: 'COVID_Booster_Vaccination_Record.pdf', date: '2026-06-11', category: 'Vaccines', size: '280 KB' },
    { id: 'v4', name: 'Cardiac_ECG_Telemetry_Report.pdf', date: '2026-08-02', category: 'Lab Reports', size: '2.1 MB' }
  ]);
  const [vaultCategory, setVaultCategory] = useState('All');
  const [vaultSearch, setVaultSearch] = useState('');
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Lab Reports');

  // Social Feed State
  const [feedPosts, setFeedPosts] = useState([
    { id: 1, name: 'Ankita Halder', time: '12m ago', text: 'Crushed my 10,000 steps streak for the 14th day in a row! Taking short 5-minute movement breaks between calls truly works miracles for energy levels. 🏃✨', likes: 29, liked: false, comments: 5, category: 'Fitness' },
    { id: 2, name: 'Dr. Sneha Roy', time: '2h ago', text: 'Reminder for everyone working desk jobs: 4-7-8 breathing downregulates the sympathetic fight-or-flight nervous system in less than 90 seconds. Try it before your next stressful presentation.', likes: 65, liked: true, comments: 12, category: 'Mental Health' },
    { id: 3, name: 'Rahul Bose', time: '5h ago', text: 'Switched from sugary afternoon coffee to warm herbal chamomile tea and electrolyte water. My afternoon brain fog is completely gone! 🍵💡', likes: 42, liked: false, comments: 8, category: 'Nutrition' }
  ]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Fitness');
  const [feedFilterTab, setFeedFilterTab] = useState('For You');
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);

  // Chatbot State (Direct live Gemini API integration)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am HealthCatch AI, powered by Gemini clinical intelligence. How are your vitals and how can I support your wellness journey today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState('general');
  const [chatFile, setChatFile] = useState(null);
  const chatEndRef = useRef(null);

  // Breathing Guide State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale (4s)');
  const [breathCountdown, setBreathCountdown] = useState(4);
  const [breathCyclesCompleted, setBreathCyclesCompleted] = useState(0);

  // AI Sleep Soundscape State
  const [activeSoundscape, setActiveSoundscape] = useState('Rain');
  const [isPlayingSoundscape, setIsPlayingSoundscape] = useState(false);

  // Symptom Triage Tool State
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomDays, setSymptomDays] = useState(2);
  const [symptomSeverity, setSymptomSeverity] = useState(5);
  const [hasFever, setHasFever] = useState(false);
  const [hasChestPain, setHasChestPain] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [isTriaging, setIsTriaging] = useState(false);

  // Health Metrics Calculator State
  const [metricsWeight, setMetricsWeight] = useState(70);
  const [metricsHeight, setMetricsHeight] = useState(175);
  const [metricsAge, setMetricsAge] = useState(28);
  const [metricsGender, setMetricsGender] = useState('male');
  const [metricsActivity, setMetricsActivity] = useState('moderate');
  const [metricsResult, setMetricsResult] = useState(null);
  const [isCalculatingMetrics, setIsCalculatingMetrics] = useState(false);

  // Groups & Jobs & Donors State
  const [joinedGroups, setJoinedGroups] = useState({ g2: true, g3: true });
  const [appliedJobs, setAppliedJobs] = useState({});
  const [donorFilterBlood, setDonorFilterBlood] = useState('All');
  const [donorSearchCity, setDonorSearchCity] = useState('');

  // Direct Messaging State
  const [activeChatContact, setActiveChatContact] = useState('Dr. Amit Patel');
  const [dmInput, setDmInput] = useState('');
  const [conversations, setConversations] = useState({
    'Dr. Amit Patel': [
      { sender: 'them', text: 'Good morning Alex! I reviewed your latest heart rate data from HealthCatch. Your resting HR is optimal at 62 bpm. Keep up the cardio routine! 💪', time: '09:15 AM' },
      { sender: 'me', text: 'Thank you Doctor! Should I continue the morning brisk walk or add some HIIT?', time: '09:20 AM' },
      { sender: 'them', text: 'Your BP readings look great (118/76). I would recommend adding 2 days of moderate HIIT per week, starting with 20 minutes.', time: '09:25 AM' }
    ],
    'Dr. Sneha Roy': [
      { sender: 'them', text: 'Hi Alex! Remember to take your 10-minute digital detox before sleeping tonight.', time: 'Yesterday' }
    ]
  });

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  // UI Theme Colors
  const panelBg = isDarkMode ? 'rgba(11, 20, 42, 0.78)' : 'rgba(255, 255, 255, 0.88)';
  const panelBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.65)' : '#475569';
  const textMuted = isDarkMode ? 'rgba(255, 255, 255, 0.45)' : '#64748b';
  const inputBg = isDarkMode ? 'rgba(0, 0, 0, 0.45)' : '#ffffff';
  const inputBorder = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.14)';

  // ── Navigation handler ────────────────────────────────────────────────
  const handleNav = (tab) => {
    setActiveTab(tab);
    if (isMobile || isTablet) setSidebarOpen(false);
  };

  // ── Breathing guide timer ─────────────────────────────────────────────
  useEffect(() => {
    if (!isBreathingActive) return;
    const interval = setInterval(() => {
      setBreathCountdown((prev) => {
        if (prev > 1) return prev - 1;
        if (breathPhase.startsWith('Inhale')) {
          setBreathPhase('Hold (7s)');
          return 7;
        } else if (breathPhase.startsWith('Hold')) {
          setBreathPhase('Exhale (8s)');
          return 8;
        } else {
          setBreathCyclesCompleted(c => c + 1);
          setBreathPhase('Inhale (4s)');
          return 4;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhase]);

  // ── Auto scroll chat ──────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // ── Multimodal Chat Send Message (Live Backend Gemini API) ─────────────
  const handleSendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text && !chatFile) return;

    const userMsg = { sender: 'user', text: text || (chatFile ? `Attached: ${chatFile.name}` : '') };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    const formData = new FormData();
    formData.append('message', text);
    formData.append('mode', chatMode);
    if (chatFile) formData.append('file', chatFile);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply || "I am here to support your journey." }]);
      setChatFile(null);
    } catch {
      // Offline fallback
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Thank you for sharing. Reflecting on "${text.slice(0, 50)}...": Remember that consistent small actions, adequate hydration (target 2.5–3.0L), and deep parasympathetic breathing compound into vibrant well-being. (HealthCatch Clinical Engine Active).`
        }
      ]);
      setChatFile(null);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── Cart Handlers ─────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    toast(`Added "${product.title}" to Cart`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
    toast("Item removed from cart");
  };

  // ── Symptom Assessment Wizard ─────────────────────────────────────────
  const runSymptomTriage = async () => {
    if (!symptomInput.trim()) {
      toast("Please describe your symptoms first", "error");
      return;
    }
    setIsTriaging(true);
    try {
      const formData = new FormData();
      formData.append('symptom_description', symptomInput);
      formData.append('duration_days', symptomDays.toString());
      formData.append('severity_1_to_10', symptomSeverity.toString());
      formData.append('has_fever', hasFever ? 'true' : 'false');
      formData.append('has_chest_pain', hasChestPain ? 'true' : 'false');

      const res = await fetch(`${API_BASE}/api/symptom-triage`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setTriageResult(data);
      } else {
        throw new Error();
      }
    } catch {
      const isUrgent = symptomSeverity >= 7 || symptomDays >= 4 || hasChestPain;
      setTriageResult({
        tier: isUrgent ? "URGENT_CARE" : "HOME_OBSERVATION",
        urgency: isUrgent ? "Doctor Consultation Recommended Within 24 Hours" : "Mild / Rest & Hydration Recommended",
        risk_score: isUrgent ? 8 : 3,
        recommendation: isUrgent
          ? "Your reported symptoms warrant an urgent evaluation by a medical professional."
          : "Stay well hydrated, monitor body temperature, and rest. If symptoms persist beyond 72 hours, consult a clinic."
      });
    } finally {
      setIsTriaging(false);
    }
  };

  // ── Health Metrics Calculator ─────────────────────────────────────────
  const runCalculateMetrics = async () => {
    setIsCalculatingMetrics(true);
    try {
      const formData = new FormData();
      formData.append('weight_kg', metricsWeight.toString());
      formData.append('height_cm', metricsHeight.toString());
      formData.append('age', metricsAge.toString());
      formData.append('gender', metricsGender);
      formData.append('activity_level', metricsActivity);

      const res = await fetch(`${API_BASE}/api/health-metrics`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setMetricsResult(data);
      } else {
        throw new Error();
      }
    } catch {
      // Client calculation fallback
      const hm = metricsHeight / 100;
      const bmi = Math.round((metricsWeight / (hm * hm)) * 10) / 10;
      const bmr = Math.round(10 * metricsWeight + 6.25 * metricsHeight - 5 * metricsAge + 5);
      const maxHr = 220 - metricsAge;
      setMetricsResult({
        bmi,
        bmi_category: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal (Healthy Weight)' : 'Overweight',
        bmr_calories: bmr,
        tdee_calories: Math.round(bmr * 1.55),
        daily_water_liters: Math.round(metricsWeight * 0.035 * 10) / 10,
        max_heart_rate: maxHr,
        fat_burn_zone: `${Math.round(maxHr * 0.5)} - ${Math.round(maxHr * 0.7)} bpm`,
        aerobic_zone: `${Math.round(maxHr * 0.7)} - ${Math.round(maxHr * 0.85)} bpm`
      });
    } finally {
      setIsCalculatingMetrics(false);
    }
  };
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <header style={{
        height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: isDarkMode ? 'rgba(8, 14, 30, 0.88)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(30px) saturate(180%)',
        borderBottom: `1px solid ${panelBorder}`, zIndex: 50, flexShrink: 0,
        boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(15,23,42,0.04)'
      }}>
        {/* Left Logo & Drawer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {(isMobile || isTablet) && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', color: textPrimary, cursor: 'pointer', padding: 4 }}
              title="Toggle Menu"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}

          <div
            onClick={() => handleNav('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'grid', placeItems: 'center', boxShadow: '0 0 18px rgba(59,130,246,0.35)' }}>
              <BrainCircuit size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em', color: textPrimary }}>
              HealthCatch <span style={{ color: '#3b82f6' }}>AI</span>
            </span>
          </div>
        </div>

        {/* Center Primary Tab Navigation Pills (Desktop & Tablet) */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)', padding: '4px', borderRadius: 999, border: `1px solid ${panelBorder}` }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
              { id: 'chat', label: 'AI Chat', icon: <MessageSquare size={14} /> },
              { id: 'coach', label: 'AI Coach', icon: <Sparkle size={14} /> },
              { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={14} /> },
              { id: 'tools', label: 'Utilities', icon: <Calculator size={14} /> },
              { id: 'market', label: 'Market', icon: <Pill size={14} /> }
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNav(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999,
                    border: 'none', background: active ? 'linear-gradient(135deg, #3b82f6, #10b981)' : 'transparent',
                    color: active ? '#fff' : textSecondary, fontSize: '13px', fontWeight: active ? 800 : 600,
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: active ? '0 4px 14px rgba(59,130,246,0.35)' : 'none'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions: SOS, Cart, Theme Toggle, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Emergency SOS Button */}
          <button
            onClick={() => setIsSOSOpen(true)}
            style={{
              padding: '6px 12px', borderRadius: 99, border: '1px solid rgba(239,68,68,0.35)',
              background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: 12, fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <AlertTriangle size={14} /> SOS
          </button>

          {/* Cart Pill */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative', width: 38, height: 38, borderRadius: 12, border: `1px solid ${panelBorder}`,
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
              color: textPrimary, display: 'grid', placeItems: 'center', cursor: 'pointer'
            }}
            title="Shopping Cart"
          >
            <ShoppingCart size={17} />
            {cart.length > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3, width: 18, height: 18, borderRadius: '50%',
                background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center'
              }}>
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              width: 38, height: 38, borderRadius: 12, border: `1px solid ${panelBorder}`,
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
              color: isDarkMode ? '#fde047' : '#64748b', display: 'grid', placeItems: 'center', cursor: 'pointer'
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Profile Avatar Pill */}
          <div
            onClick={() => handleNav('profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px',
              borderRadius: 999, border: `1px solid ${panelBorder}`, cursor: 'pointer',
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'
            }}
            title="View Profile"
          >
            <UserAvatar src={userPhoto} name={userName} size={30} />
            {!isMobile && (
              <span style={{ fontSize: '13px', fontWeight: 700, color: textPrimary, maxWidth: 90, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userName.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER (Sidebar + Scroll Area) ─────────────── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left Sidebar Drawer */}
        <aside style={{
          width: 250, borderRight: `1px solid ${panelBorder}`,
          background: isDarkMode ? 'rgba(8, 14, 30, 0.95)' : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(35px)', display: 'flex', flexDirection: 'column',
          position: (isMobile || isTablet) ? 'fixed' : 'relative',
          top: (isMobile || isTablet) ? 64 : 0, bottom: 0, left: 0,
          zIndex: (isMobile || isTablet) ? 60 : 10,
          transform: (isMobile || isTablet) ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        }}>
          <div className="hc-scroll-panel" style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 12px 4px' }}>CORE WELLNESS</p>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
              { id: 'identity', label: 'Health Passport', icon: <CircleGauge size={16} /> },
              { id: 'coach', label: 'AI Health Coach', icon: <Sparkle size={16} /> },
              { id: 'challenges', label: 'Smart Challenges', icon: <Trophy size={16} /> }
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', borderRadius: 12,
                    border: 'none', background: active ? (isDarkMode ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)') : 'transparent',
                    color: active ? '#3b82f6' : textPrimary, fontWeight: active ? 800 : 600,
                    fontSize: '13.5px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                  }}
                >
                  <span style={{ color: active ? '#3b82f6' : textSecondary }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}

            <p style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '14px 12px 4px' }}>CLINICAL & CARE</p>
            {[
              { id: 'doctors', label: 'Consult Specialists', icon: <Stethoscope size={16} /> },
              { id: 'chat', label: 'AI Health Chatbot', icon: <MessageSquare size={16} /> },
              { id: 'vault', label: 'Medical Vault', icon: <FolderHeart size={16} /> },
              { id: 'tools', label: 'Clinical Utilities', icon: <Calculator size={16} /> },
              { id: 'donors', label: 'Emergency Donors', icon: <HeartHandshake size={16} /> }
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', borderRadius: 12,
                    border: 'none', background: active ? (isDarkMode ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)') : 'transparent',
                    color: active ? '#3b82f6' : textPrimary, fontWeight: active ? 800 : 600,
                    fontSize: '13.5px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                  }}
                >
                  <span style={{ color: active ? '#3b82f6' : textSecondary }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}

            <p style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '14px 12px 4px' }}>COMMUNITY & ECOSYSTEM</p>
            {[
              { id: 'home', label: 'Health Circle Feed', icon: <Home size={16} /> },
              { id: 'groups', label: 'Health Groups', icon: <UsersRound size={16} /> },
              { id: 'market', label: 'Health Marketplace', icon: <Pill size={16} /> },
              { id: 'jobs', label: 'Healthcare Careers', icon: <BriefcaseBusiness size={16} /> },
              { id: 'messaging', label: 'Direct Messages', icon: <MessageSquareText size={16} /> },
              { id: 'profile', label: 'Settings & Profile', icon: <User size={16} /> }
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', borderRadius: 12,
                    border: 'none', background: active ? (isDarkMode ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)') : 'transparent',
                    color: active ? '#3b82f6' : textPrimary, fontWeight: active ? 800 : 600,
                    fontSize: '13.5px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                  }}
                >
                  <span style={{ color: active ? '#3b82f6' : textSecondary }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Logout */}
          <div style={{ padding: 14, borderTop: `1px solid ${panelBorder}` }}>
            <button
              onClick={() => {
                if (auth) { signOut(auth).catch(() => {}); }
                onLogout();
              }}
              style={{
                width: '100%', padding: '9px', borderRadius: 10, border: `1px solid ${panelBorder}`,
                background: 'transparent', color: textSecondary, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Center / Main Scrollable Stage */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            {/* 1. DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  {/* Greeting & Score Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                        <Sparkles size={16} /> WELLNESS OVERVIEW
                      </div>
                      <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: textPrimary }}>
                        {(() => { const h = new Date().getHours(); return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'; })()}, <span className="text-gradient-hero">{userName.split(' ')[0]}</span> 👋
                      </h1>
                      <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })} · Your vitals and metabolic targets are trending 14% higher than last week.
                      </p>
                    </div>

                    {/* Health Score Pill Card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 20, background: panelBg, border: `1px solid ${panelBorder}`, backdropFilter: 'blur(30px)' }}>
                      <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'conic-gradient(#10b981 78%, rgba(148,163,184,0.15) 0)', display: 'grid', placeItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: isDarkMode ? '#0f172a' : '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16, color: '#10b981' }}>
                          78
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: textSecondary, textTransform: 'uppercase' }}>Health Score</p>
                        <p style={{ fontSize: 17, fontWeight: 900, color: textPrimary }}>Optimal Range</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Row */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                    {[
                      { label: '💬 AI Doctor Chat', tab: 'chat', color: '#3b82f6' },
                      { label: '👨‍⚕️ Book Specialist', tab: 'doctors', color: '#10b981' },
                      { label: '🩺 Symptom Triage', tab: 'tools', color: '#f59e0b' },
                      { label: '📁 Medical Vault', tab: 'vault', color: '#a855f7' },
                      { label: '🏆 Challenges', tab: 'challenges', color: '#ec4899' },
                      { label: '🛒 Marketplace', tab: 'market', color: '#06b6d4' },
                    ].map(a => (
                      <button
                        key={a.tab}
                        onClick={() => handleNav(a.tab)}
                        style={{
                          padding: '9px 18px', borderRadius: 99, border: `1px solid ${a.color}35`,
                          background: `${a.color}15`, color: a.color, fontSize: 13, fontWeight: 800,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                          transition: 'transform 0.15s, background 0.15s'
                        }}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>

                  {/* Vitals & Trackers Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {/* Water Tracker Widget */}
                    <GlassCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'grid', placeItems: 'center' }}>
                          <Droplets size={18} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                          {(waterGlasses * 0.25).toFixed(1)} / {userTargetWater.toFixed(1)} L
                        </span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 800 }}>Hydration Intake</h4>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 2, marginBottom: 12 }}>{waterGlasses} of 12 glasses logged today</p>
                      <div style={{ height: 6, borderRadius: 99, background: 'rgba(148,163,184,0.15)', overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ width: `${Math.min(100, (waterGlasses / 12) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => { setWaterGlasses(v => Math.min(16, v + 1)); toast("Logged +1 Glass (250ml) 💧"); }}
                          style={{ flex: 1, padding: 8, borderRadius: 10, border: 'none', background: 'rgba(59,130,246,0.12)', color: '#3b82f6', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                        >
                          +1 Glass (250ml)
                        </button>
                        <button
                          onClick={() => setWaterGlasses(0)}
                          style={{ padding: '8px 12px', borderRadius: 10, border: `1px solid ${panelBorder}`, background: 'transparent', color: textSecondary, fontSize: 12, cursor: 'pointer' }}
                          title="Reset daily water"
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                    </GlassCard>

                    {/* Steps Counter Widget */}
                    <GlassCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'grid', placeItems: 'center' }}>
                          <Footprints size={18} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                          {Math.round((dailySteps / userTargetSteps) * 100)}% Goal
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h4 style={{ fontSize: 14, fontWeight: 800 }}>Daily Activity</h4>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#f97316', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Flame size={12} /> {activeCalories} kcal
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 2, marginBottom: 12 }}>{dailySteps.toLocaleString()} / {userTargetSteps.toLocaleString()} steps</p>
                      <div style={{ height: 6, borderRadius: 99, background: 'rgba(148,163,184,0.15)', overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ width: `${Math.min(100, (dailySteps / userTargetSteps) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
                      </div>
                      <button
                        onClick={() => { setDailySteps(v => Math.min(30000, v + 500)); setActiveCalories(c => c + 25); toast("Logged +500 steps 🏃"); }}
                        style={{ width: '100%', padding: 8, borderRadius: 10, border: 'none', background: 'rgba(16,185,129,0.12)', color: '#10b981', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                      >
                        +500 Steps
                      </button>
                    </GlassCard>

                    {/* Sleep Duration & Quality Widget */}
                    <GlassCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(129,140,248,0.12)', color: '#818cf8', display: 'grid', placeItems: 'center' }}>
                          <BedDouble size={18} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 99, background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>
                          {sleepQuality}% Optimal
                        </span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 800 }}>Sleep Recovery</h4>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 2, marginBottom: 12 }}>{sleepHours}h logged · Deep REM 22%</p>
                      <div style={{ height: 6, borderRadius: 99, background: 'rgba(148,163,184,0.15)', overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #818cf8, #a855f7)' }} />
                      </div>
                      <button
                        onClick={() => { setSleepHours(h => (h >= 10 ? 6 : Math.round((h + 0.5) * 10) / 10)); toast("Sleep log updated 🌙"); }}
                        style={{ width: '100%', padding: 8, borderRadius: 10, border: 'none', background: 'rgba(129,140,248,0.12)', color: '#818cf8', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                      >
                        +30m Sleep
                      </button>
                    </GlassCard>

                    {/* Mood Check-In Widget */}
                    <GlassCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168,85,247,0.12)', color: '#a855f7', display: 'grid', placeItems: 'center' }}>
                          <Heart size={18} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#a855f7' }}>{todayMood}</span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 800 }}>Mood Check-In</h4>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 2, marginBottom: 12 }}>How does your mind feel right now?</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                        {['Great', 'Good', 'Neutral', 'Down', 'Stressed'].map(m => (
                          <button
                            key={m}
                            onClick={() => { setTodayMood(m); toast(`Mood updated to ${m}`); }}
                            style={{
                              flex: 1, padding: '7px 2px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                              border: todayMood === m ? '2px solid #a855f7' : `1px solid ${panelBorder}`,
                              background: todayMood === m ? 'rgba(168,85,247,0.15)' : 'transparent',
                              color: textPrimary, cursor: 'pointer'
                            }}
                          >
                            {m === 'Great' ? '😄' : m === 'Good' ? '😊' : m === 'Neutral' ? '😐' : m === 'Down' ? '😔' : '😣'}
                          </button>
                        ))}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Upcoming Appointments Banner */}
                  {bookedAppointments.length > 0 && (
                    <GlassCard style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.06))', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={18} color="#10b981" />
                          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Upcoming Doctor Consultations</h3>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 800 }}>{bookedAppointments.length}</span>
                        </div>
                        <button onClick={() => handleNav('doctors')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View All →</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {bookedAppointments.slice(0, 3).map((apt, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)', border: `1px solid ${panelBorder}` }}>
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 800 }}>{apt.doctorName}</p>
                              <p style={{ fontSize: 11, color: textSecondary, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}><Clock size={12} color="#10b981" /> {apt.date} at {apt.slot} · {apt.type === 'video' ? '📹 Video Room' : '🏥 In-Clinic'} {apt.reason && `· "${apt.reason}"`}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>Confirmed</span>
                              {apt.type === 'video' && (
                                <button
                                  onClick={() => setActiveVideoCallDoctor({ name: apt.doctorName, spec: 'Specialist' })}
                                  style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                                >
                                  Join Video
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Medication Reminders & Quick Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 20, marginBottom: 20 }}>
                    {/* Medication Schedule */}
                    <GlassCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Pill size={18} color="#3b82f6" />
                          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Today's Medications & Supplements</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>
                            {medications.filter(m => m.taken).length}/{medications.length} TAKEN
                          </span>
                          <button
                            onClick={() => setIsAddMedOpen(true)}
                            style={{ padding: '4px 10px', borderRadius: 8, border: `1px solid ${panelBorder}`, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {medications.map(med => (
                          <div
                            key={med.id}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 14px', borderRadius: 14,
                              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
                              border: `1px solid ${panelBorder}`
                            }}
                          >
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 700, textDecoration: med.taken ? 'line-through' : 'none', opacity: med.taken ? 0.7 : 1 }}>{med.name}</p>
                              <p style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{med.time}</p>
                            </div>
                            <button
                              onClick={() => {
                                setMedications(prev => prev.map(m => m.id === med.id ? { ...m, taken: !m.taken } : m));
                                toast(med.taken ? `Marked ${med.name} as pending` : `Completed dose of ${med.name}! 💊`);
                              }}
                              style={{
                                width: 34, height: 34, borderRadius: 10, border: 'none',
                                background: med.taken ? '#10b981' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.06)'),
                                color: med.taken ? '#fff' : textSecondary, cursor: 'pointer', display: 'grid', placeItems: 'center'
                              }}
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Quick Clinical Consult Banner */}
                    <GlassCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.08))', borderColor: 'rgba(59,130,246,0.2)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                          <Stethoscope size={16} /> INSTANT TELEHEALTH
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 900 }}>Need a Doctor Right Now?</h3>
                        <p style={{ fontSize: 13, color: textSecondary, marginTop: 6, lineHeight: 1.55 }}>
                          Connect with board-certified general physicians, cardiologists, and psychologists within minutes.
                        </p>
                      </div>
                      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                        <button
                          onClick={() => { setActiveVideoCallDoctor(MOCK_DOCTORS_LIST[0]); }}
                          style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          <Video size={16} /> Join Waiting Room
                        </button>
                        <button
                          onClick={() => handleNav('doctors')}
                          style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${panelBorder}`, background: 'transparent', color: textPrimary, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Browse Doctors
                        </button>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Weekly Wellness Trend Chart */}
                  <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800 }}>Weekly Activity & Vitals Trend</h3>
                        <p style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>Consistent 7-day tracking pattern</p>
                      </div>
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 800, background: 'rgba(16,185,129,0.12)', padding: '4px 10px', borderRadius: 99 }}>+14% vs Last Week</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 110, padding: '0 4px' }}>
                      {[
                        { day: 'Mon', pct: 68, val: '6.8k' },
                        { day: 'Tue', pct: 82, val: '8.2k' },
                        { day: 'Wed', pct: 74, val: '7.4k' },
                        { day: 'Thu', pct: 92, val: '9.2k' },
                        { day: 'Fri', pct: 60, val: '6.0k' },
                        { day: 'Sat', pct: 96, val: '9.6k' },
                        { day: 'Sun', pct: 74, val: '7.4k' },
                      ].map((d) => (
                        <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 9.5, color: textMuted }}>{d.val}</span>
                          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                              style={{ width: '100%', maxWidth: 28, height: `${d.pct}px`, background: 'linear-gradient(180deg, #3b82f6, #10b981)', borderRadius: '6px 6px 0 0', minHeight: 6 }}
                            />
                          </div>
                          <span style={{ fontSize: 10, color: textSecondary, fontWeight: 700, marginTop: 4 }}>{d.day}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* 2. HEALTH PASSPORT / IDENTITY */}
            {activeTab === 'identity' && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      <CircleGauge size={16} /> DIGITAL PASSPORT
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Your Digital Health Identity</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                      A secure, portable biometric health summary for emergencies, clinicians, and lifestyle records.
                    </p>
                  </div>

                  {/* 3D-Styled Holographic Card with Front/Back Toggle */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: 24, marginBottom: 28 }}>
                    <div style={{
                      borderRadius: 24, padding: 28,
                      background: cardFlipped
                        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
                        : 'linear-gradient(135deg, #1e3a8a 0%, #065f46 100%)',
                      color: '#fff', boxShadow: '0 20px 50px rgba(16,185,129,0.25)', position: 'relative', overflow: 'hidden',
                      transition: 'background 0.4s'
                    }}>
                      <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <BrainCircuit size={24} color="#60a5fa" />
                          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.05em' }}>HEALTHCATCH ID {cardFlipped ? '(CLINICAL BACK)' : ''}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setCardFlipped(!cardFlipped)}
                            style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 99, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', cursor: 'pointer' }}
                          >
                            Flip {cardFlipped ? 'Front' : 'Back'}
                          </button>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={12} color="#34d399" /> VERIFIED ACTIVE</span>
                        </div>
                      </div>

                      {!cardFlipped ? (
                        <>
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
                            <UserAvatar src={userPhoto} name={userName} size={64} style={{ border: '3px solid rgba(255,255,255,0.3)' }} />
                            <div>
                              <h3 style={{ fontSize: 22, fontWeight: 900 }}>{userName}</h3>
                              <p style={{ fontSize: 12, opacity: 0.85 }}>ID: #HC-9482-AI · Age: {userAge}</p>
                              <p style={{ fontSize: 12, opacity: 0.85 }}>Blood Type: <strong style={{ color: '#fca5a5' }}>{userBloodGroup}</strong></p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                            <div><p style={{ fontSize: 10, opacity: 0.7 }}>ORGAN DONOR</p><p style={{ fontSize: 12, fontWeight: 800 }}>Registered Yes</p></div>
                            <div><p style={{ fontSize: 10, opacity: 0.7 }}>EMERGENCY CONTACT</p><p style={{ fontSize: 12, fontWeight: 800 }}>{userEmergencyContact}</p></div>
                            <div><p style={{ fontSize: 10, opacity: 0.7 }}>MEMBERSHIP</p><p style={{ fontSize: 12, fontWeight: 800 }}>Level 7 Champion</p></div>
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '8px 0' }}>
                          <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Medical Record & Insurance Notes</h4>
                          <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>• Primary Provider: Apollo Telehealth Network (#AP-849)</p>
                          <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>• Insurance: Star Health Care Gold (Policy #SH-48201-WB)</p>
                          <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.6 }}>• Known Flags: {allergies.join(', ')}</p>
                          <p style={{ fontSize: 11, opacity: 0.7, marginTop: 12 }}>Authorized for emergency paramedic retrieval under digital consent protocol.</p>
                        </div>
                      )}
                    </div>

                    {/* QR Code Quick First Responder Card */}
                    <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 28 }}>
                      <div style={{ padding: 12, background: '#fff', borderRadius: 16, boxShadow: '0 8px 25px rgba(0,0,0,0.15)', marginBottom: 14 }}>
                        <QrCode size={110} color="#0f172a" />
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 800 }}>Emergency Responder QR</h4>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 4, maxWidth: 260 }}>
                        Paramedics scan in clinical emergencies to review blood group, known allergies, and primary contact.
                      </p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button
                          onClick={() => toast("Digital Health Passport downloaded as secure PDF 📥")}
                          style={{ padding: '9px 14px', borderRadius: 12, border: `1px solid ${panelBorder}`, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <Download size={14} /> Download PDF
                        </button>
                        <button
                          onClick={() => { window.print?.(); toast("Sent ID Card to printer 🖨️"); }}
                          style={{ padding: '9px 14px', borderRadius: 12, border: `1px solid ${panelBorder}`, background: 'transparent', color: textPrimary, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <Printer size={14} /> Print
                        </button>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Allergy & Pre-existing condition Manager */}
                  <GlassCard>
                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Medical Flags & Known Allergies</h3>
                    <p style={{ fontSize: 13, color: textSecondary, marginBottom: 16 }}>Critical alerts visible to doctors and prescribing algorithms before issuing medications.</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {allergies.map(a => (
                        <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
                          <AlertTriangle size={12} /> {a}
                          <button
                            onClick={() => { setAllergies(al => al.filter(x => x !== a)); toast(`Removed allergy: ${a}`); }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 10, maxWidth: 440 }}>
                      <input
                        type="text"
                        placeholder="Add allergy (e.g. Aspirin, Latex, Shellfish)..."
                        value={newAllergyInput}
                        onChange={(e) => setNewAllergyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newAllergyInput.trim()) {
                            setAllergies(a => [...a, newAllergyInput.trim()]);
                            setNewAllergyInput('');
                            toast("Added allergy alert");
                          }
                        }}
                        style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 14px', outline: 'none', fontSize: 13 }}
                      />
                      <button
                        onClick={() => {
                          if (newAllergyInput.trim()) {
                            setAllergies(a => [...a, newAllergyInput.trim()]);
                            setNewAllergyInput('');
                            toast("Added allergy alert");
                          }
                        }}
                        style={{ padding: '0 18px', height: 42, borderRadius: 12, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                      >
                        Add
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* 3. AI HEALTH COACH */}
            {activeTab === 'coach' && (
              <motion.div
                key="coach"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      <Sparkle size={16} /> CONTINUOUS AI COACH
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Mind & Body Performance Guide</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                      Evidence-based micro-actions designed to reduce stress, stabilize nervous tone, and preserve consistency.
                    </p>
                  </div>

                  {/* Guided 4-7-8 Breathing Pacer */}
                  <GlassCard style={{ marginBottom: 24, textAlign: 'center', padding: '36px 20px' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>Interactive 4-7-8 Nervous System Pacer</h3>
                    <p style={{ fontSize: 13, color: textSecondary, maxWidth: 520, margin: '0 auto 24px' }}>
                      Follow the visual orb rhythm: Inhale deeply for 4s, Hold gently for 7s, and Exhale smoothly for 8s to calm the sympathetic nervous tone.
                    </p>

                    <div style={{ display: 'grid', placeItems: 'center', minHeight: 200, marginBottom: 20 }}>
                      <motion.div
                        animate={{
                          scale: isBreathingActive
                            ? (breathPhase.startsWith('Inhale') ? 1.45 : breathPhase.startsWith('Hold') ? 1.45 : 1.0)
                            : 1.0
                        }}
                        transition={{
                          duration: breathPhase.startsWith('Inhale') ? 4 : breathPhase.startsWith('Hold') ? 0 : 8,
                          ease: 'easeInOut'
                        }}
                        style={{
                          width: 140, height: 140, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                          display: 'grid', placeItems: 'center', color: '#fff',
                          boxShadow: '0 0 60px rgba(59,130,246,0.45)', cursor: 'pointer'
                        }}
                        onClick={() => setIsBreathingActive(!isBreathingActive)}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{breathPhase.split(' ')[0]}</p>
                          <p style={{ fontSize: 34, fontWeight: 900, marginTop: 2 }}>{breathCountdown}s</p>
                        </div>
                      </motion.div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                      <button
                        onClick={() => setIsBreathingActive(!isBreathingActive)}
                        style={{
                          padding: '12px 28px', borderRadius: 99, border: 'none',
                          background: isBreathingActive ? '#ef4444' : 'linear-gradient(135deg,#3b82f6,#10b981)',
                          color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                        }}
                      >
                        {isBreathingActive ? <Pause size={16} /> : <Play size={16} />}
                        {isBreathingActive ? 'Pause Exercise' : 'Start 4-7-8 Breathing'}
                      </button>
                      <span style={{ fontSize: 13, color: textSecondary, fontWeight: 600 }}>
                        Cycles completed: <strong style={{ color: textPrimary }}>{breathCyclesCompleted}</strong>
                      </span>
                    </div>
                  </GlassCard>

                  {/* AI Ambient Sleep Soundscape Player */}
                  <GlassCard style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Volume2 size={18} color="#818cf8" />
                        <h3 style={{ fontSize: 16, fontWeight: 800 }}>AI Ambient Sleep & Focus Soundscapes</h3>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#818cf8' }}>{isPlayingSoundscape ? '● Audio Active' : 'Paused'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                      {[
                        { id: 'Rain', label: 'Rain on Leaves', icon: '🌧️', tone: 'Deep Rest' },
                        { id: 'Ocean', label: 'Pacific Ocean Waves', icon: '🌊', tone: 'Calm Nervous Tone' },
                        { id: 'Forest', label: 'Pine Forest Dawn', icon: '🌲', tone: 'Focus & Meditation' },
                        { id: 'Delta', label: '432Hz Delta Sleep', icon: '🧘', tone: 'Deep Delta Sleep' },
                      ].map(track => (
                        <div
                          key={track.id}
                          onClick={() => { setActiveSoundscape(track.id); setIsPlayingSoundscape(true); toast(`Playing ${track.label}`); }}
                          style={{
                            padding: 14, borderRadius: 14, cursor: 'pointer',
                            background: activeSoundscape === track.id ? 'rgba(129,140,248,0.15)' : (isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)'),
                            border: activeSoundscape === track.id ? '2px solid #818cf8' : `1px solid ${panelBorder}`
                          }}
                        >
                          <div style={{ fontSize: 24, marginBottom: 6 }}>{track.icon}</div>
                          <h4 style={{ fontSize: 13.5, fontWeight: 800 }}>{track.label}</h4>
                          <p style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{track.tone}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)' }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Active Track: <strong>{activeSoundscape}</strong></span>
                      <button
                        onClick={() => { setIsPlayingSoundscape(!isPlayingSoundscape); toast(isPlayingSoundscape ? 'Audio paused' : `Audio resumed`); }}
                        style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#818cf8', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                      >
                        {isPlayingSoundscape ? 'Pause' : 'Play Soundscape'}
                      </button>
                    </div>
                  </GlassCard>

                  {/* Daily Personalized Micro-Habit Checklist */}
                  <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800 }}>Coach Micro-Habit Action Plan</h3>
                      <button onClick={() => handleNav('chat')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                        Ask AI Coach →
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                      {[
                        { title: 'Morning Sunlight (10 mins)', detail: 'Resets circadian rhythm and sets cortisol anchor for the day.', time: '08:00 AM', xp: 40 },
                        { title: 'Post-Lunch 15m Walk', detail: 'Blunts blood glucose spike by up to 22% after meals.', time: '01:30 PM', xp: 50 },
                        { title: 'Digital Sunset (30m Before Bed)', detail: 'Reduces blue spectrum light suppression of natural melatonin.', time: '10:30 PM', xp: 60 },
                        { title: 'Electrolyte Mineral Replenishment', detail: 'Replenishes magnesium to calm neuromuscular spasms.', time: '04:00 PM', xp: 30 }
                      ].map((item, idx) => (
                        <div key={idx} style={{ padding: 16, borderRadius: 16, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)', border: `1px solid ${panelBorder}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: 99 }}>{item.time}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b' }}>+{item.xp} XP</span>
                          </div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, margin: '8px 0 4px' }}>{item.title}</h4>
                          <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* 4. SMART CHALLENGES & LEADERBOARDS */}
            {activeTab === 'challenges' && (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      <Trophy size={16} /> BEHAVIORAL GAMIFICATION
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Smart Challenges & Leaderboard</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                      Form lasting neural habits through micro-commitments, unlock tier badges, and inspire peers.
                    </p>
                  </div>

                  {/* Level & XP Overview Banner */}
                  <div style={{ padding: 24, borderRadius: 22, background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(16,185,129,0.1))', border: '1px solid rgba(59,130,246,0.25)', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase' }}>CURRENT RANK</span>
                        <h3 style={{ fontSize: 24, fontWeight: 900, color: textPrimary }}>Level 7 Health Champion</h3>
                        <p style={{ fontSize: 13, color: textSecondary, marginTop: 2 }}>{userXP} total XP earned · 150 XP to Level 8 Master</p>
                      </div>
                      <div style={{ width: 220 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
                          <span>Level 7</span>
                          <span>Level 8 (1,000 XP)</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 99, background: 'rgba(148,163,184,0.2)', overflow: 'hidden' }}>
                          <div style={{ width: `${(userXP / 1000) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Challenges Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {challenges.map(c => {
                      const pct = Math.min(100, Math.round((c.current / c.goal) * 100));
                      const isComplete = pct >= 100;
                      const isClaimed = claimedChallenges[c.id];

                      return (
                        <GlassCard key={c.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              <span style={{ fontSize: 28 }}>{c.icon}</span>
                              <div>
                                <h4 style={{ fontSize: 15, fontWeight: 800 }}>{c.title}</h4>
                                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800 }}>+{c.xp} XP</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setChallenges(prev => prev.map(ch => ch.id === c.id ? { ...ch, joined: !ch.joined } : ch));
                                toast(c.joined ? `Left challenge: ${c.title}` : `Joined challenge: ${c.title}! 🎯`);
                              }}
                              style={{
                                padding: '4px 10px', borderRadius: 8, border: 'none',
                                background: c.joined ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                                color: c.joined ? '#10b981' : '#3b82f6', fontSize: 11, fontWeight: 800, cursor: 'pointer'
                              }}
                            >
                              {c.joined ? 'Active' : 'Join'}
                            </button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: textSecondary, marginBottom: 6 }}>
                            <span>Progress</span>
                            <span>{pct}% ({c.current}/{c.goal})</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 99, background: 'rgba(148,163,184,0.15)', overflow: 'hidden', marginBottom: 12 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: isComplete ? '#10b981' : '#3b82f6' }} />
                          </div>
                          {isComplete && (
                            <button
                              onClick={() => {
                                if (!isClaimed) {
                                  setUserXP(x => x + c.xp);
                                  setClaimedChallenges(p => ({ ...p, [c.id]: true }));
                                  toast(`Claimed +${c.xp} XP! 🎉`);
                                }
                              }}
                              style={{
                                width: '100%', padding: '6px', borderRadius: 8, border: 'none',
                                background: isClaimed ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg,#3b82f6,#10b981)',
                                color: isClaimed ? '#10b981' : '#fff', fontSize: 11.5, fontWeight: 800, cursor: isClaimed ? 'default' : 'pointer'
                              }}
                            >
                              {isClaimed ? '✓ Claimed' : `Claim +${c.xp} XP`}
                            </button>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>

                  {/* Leaderboard Table */}
                  <GlassCard>
                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>HealthCatch Community Leaderboard</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { rank: 1, name: 'Ankita Halder', xp: 1420, streak: '24 days', badge: '🥇 Gold Elite' },
                        { rank: 2, name: 'Dr. Sneha Roy', xp: 1280, streak: '18 days', badge: '🥈 Silver Master' },
                        { rank: 3, name: 'Alex Morgan (You)', xp: userXP, streak: '14 days', badge: '🥉 Bronze Champion' },
                        { rank: 4, name: 'Rahul Bose', xp: 790, streak: '9 days', badge: 'Pacesetter' },
                        { rank: 5, name: 'Priya Sengupta', xp: 680, streak: '7 days', badge: 'Active Starter' },
                      ].map(user => (
                        <div
                          key={user.rank}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: 14,
                            background: user.name.includes('(You)') ? (isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)') : 'transparent',
                            border: `1px solid ${panelBorder}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 14, fontWeight: 900, width: 20, color: textSecondary }}>#{user.rank}</span>
                            <UserAvatar name={user.name.replace(' (You)', '')} size={36} />
                            <div>
                              <p style={{ fontSize: 13.5, fontWeight: 800 }}>{user.name}</p>
                              <p style={{ fontSize: 11, color: textSecondary }}>{user.badge} · 🔥 {user.streak}</p>
                            </div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#10b981' }}>{user.xp} XP</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* 5. CONSULT DOCTORS */}
            {activeTab === 'doctors' && (
              <motion.div
                key="doctors"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      <Stethoscope size={16} /> CERTIFIED PRACTITIONERS
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Consult Certified Medical Specialists</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                      Schedule video consultations or clinic visits with board-certified physicians, psychologists, and specialists.
                    </p>
                  </div>

                  {/* Filter Pills and Search */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                      <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                      <input
                        type="text"
                        placeholder="Search by doctor name or specialty..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 14px 0 42px', outline: 'none', fontSize: 13 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['All', 'Cardiologist', 'Clinical Psychologist', 'General Physician', 'Dermatologist'].map(spec => (
                        <button
                          key={spec}
                          onClick={() => setDoctorSpecFilter(spec)}
                          style={{
                            padding: '8px 14px', borderRadius: 99, border: `1px solid ${panelBorder}`,
                            background: doctorSpecFilter === spec ? '#3b82f6' : 'transparent',
                            color: doctorSpecFilter === spec ? '#fff' : textSecondary, fontSize: 12, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
                    {MOCK_DOCTORS_LIST
                      .filter(d => (doctorSpecFilter === 'All' || d.spec.toLowerCase().includes(doctorSpecFilter.toLowerCase())) && (!doctorSearch || d.name.toLowerCase().includes(doctorSearch.toLowerCase()) || d.spec.toLowerCase().includes(doctorSearch.toLowerCase())))
                      .map(doc => (
                        <GlassCard key={doc.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <UserAvatar name={doc.name} size={50} />
                                <div>
                                  <h4 style={{ fontSize: 16, fontWeight: 800 }}>{doc.name}</h4>
                                  <p style={{ fontSize: 12, color: '#3b82f6', fontWeight: 700 }}>{doc.spec}</p>
                                </div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                                ★ {doc.rating}
                              </span>
                            </div>

                            <p style={{ fontSize: 12, color: textSecondary, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} color="#3b82f6" /> {doc.clinic}</p>
                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: textSecondary, marginBottom: 16 }}>
                              <span>🎓 {doc.exp}</span>
                              <span style={{ fontWeight: 800, color: '#10b981' }}>{doc.fee} / consult</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => setSelectedDoctorForBooking(doc)}
                              style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}
                            >
                              Book Appointment
                            </button>
                            <button
                              onClick={() => setActiveVideoCallDoctor(doc)}
                              style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${panelBorder}`, background: 'transparent', color: textPrimary, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Video size={14} /> Video
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. MULTIMODAL AI CHATBOT (POWERED BY LIVE GEMINI API) */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 32px 110px', maxWidth: 940, margin: '0 auto', width: '100%' }}
              >
                {/* Chat Header & Mode Switcher */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      <BrainCircuit size={15} /> GEMINI 3.5 MULTIMODAL AI
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Clinical Intelligence Assistant</h2>
                  </div>

                  {/* Mode Pills */}
                  <div style={{ display: 'flex', gap: 6, background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)', padding: 4, borderRadius: 99, border: `1px solid ${panelBorder}` }}>
                    {[
                      { id: 'general', label: 'General' },
                      { id: 'symptoms', label: 'Symptoms' },
                      { id: 'mental_health', label: 'Counselor' },
                      { id: 'nutrition', label: 'Nutrition' },
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setChatMode(m.id)}
                        style={{
                          padding: '6px 12px', borderRadius: 99, border: 'none',
                          background: chatMode === m.id ? 'linear-gradient(135deg,#3b82f6,#10b981)' : 'transparent',
                          color: chatMode === m.id ? '#fff' : textSecondary, fontSize: 11.5, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Prompt Chips */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 12 }}>
                  {[
                    "Explain my 118/76 blood pressure reading",
                    "How to stop morning brain fog?",
                    "Safe hydration plan for 10K steps",
                    "What does elevated neutrophils in blood test mean?"
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setChatInput(p)}
                      style={{
                        padding: '6px 12px', borderRadius: 99, border: `1px solid ${panelBorder}`,
                        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)',
                        color: textSecondary, fontSize: 11.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                      }}
                    >
                      💡 {p}
                    </button>
                  ))}
                </div>

                {/* Messages Scroll Area */}
                <GlassCard style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
                      {msg.sender === 'bot' && (
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
                          <Bot size={18} />
                        </div>
                      )}
                      <div
                        style={{
                          maxWidth: '78%', padding: '12px 16px', borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: msg.sender === 'user' ? 'linear-gradient(135deg,#3b82f6,#10b981)' : (isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)'),
                          color: msg.sender === 'user' ? '#fff' : textPrimary, fontSize: 13.5, lineHeight: 1.6, border: `1px solid ${panelBorder}`,
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
                        <Bot size={18} />
                      </div>
                      <div style={{ padding: '12px 18px', borderRadius: '18px 18px 18px 4px', background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)', border: `1px solid ${panelBorder}` }}>
                        <TypingDots color="#3b82f6" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </GlassCard>

                {/* Input Bar & Attachment */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label
                    style={{
                      width: 44, height: 44, borderRadius: 12, border: `1px solid ${inputBorder}`,
                      background: inputBg, color: chatFile ? '#10b981' : textSecondary,
                      display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0
                    }}
                    title={chatFile ? chatFile.name : 'Attach Medical Image or PDF'}
                  >
                    <Paperclip size={18} />
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setChatFile(e.target.files[0]);
                          toast(`Attached file: ${e.target.files[0].name}`);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="Ask HealthCatch AI anything about symptoms, diet, vitals..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                    style={{ flex: 1, height: 46, borderRadius: 14, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 16px', outline: 'none', fontSize: 13.5 }}
                  />

                  <button
                    onClick={handleSendChatMessage}
                    disabled={isChatLoading || (!chatInput.trim() && !chatFile)}
                    style={{
                      padding: '0 20px', height: 46, borderRadius: 14, border: 'none',
                      background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff',
                      fontSize: 13.5, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      opacity: (chatInput.trim() || chatFile) ? 1 : 0.5
                    }}
                  >
                    <Send size={16} /> Send
                  </button>
                </div>
              </motion.div>
            )}

            {/* 7. MEDICAL VAULT */}
            {activeTab === 'vault' && (
              <motion.div
                key="vault"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 26 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                        <FolderHeart size={16} /> ENCRYPTED REPOSITORY
                      </div>
                      <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Medical Document Vault</h2>
                      <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                        Zero-knowledge encrypted cloud storage for your blood panels, diagnostic reports, and physician prescriptions.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddDocOpen(true)}
                      style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={16} /> Upload Document
                    </button>
                  </div>

                  {/* Filter & Search */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                      <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                      <input
                        type="text"
                        placeholder="Search records by name..."
                        value={vaultSearch}
                        onChange={(e) => setVaultSearch(e.target.value)}
                        style={{ width: '100%', height: 40, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 14px 0 40px', outline: 'none', fontSize: 13 }}
                      />
                    </div>
                    {['All', 'Lab Reports', 'Prescriptions', 'Vaccines'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setVaultCategory(cat)}
                        style={{
                          padding: '7px 14px', borderRadius: 99, border: `1px solid ${panelBorder}`,
                          background: vaultCategory === cat ? '#3b82f6' : 'transparent',
                          color: vaultCategory === cat ? '#fff' : textSecondary, fontSize: 12, fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Documents List */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {vaultDocuments
                      .filter(d => (vaultCategory === 'All' || d.category === vaultCategory) && (!vaultSearch || d.name.toLowerCase().includes(vaultSearch.toLowerCase())))
                      .map(doc => (
                        <GlassCard key={doc.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'grid', placeItems: 'center' }}>
                              <FileText size={20} />
                            </div>
                            <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                              {doc.category}
                            </span>
                          </div>
                          <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</h4>
                          <p style={{ fontSize: 11, color: textSecondary, marginBottom: 14 }}>{doc.date} · {doc.size}</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => toast(`Downloaded ${doc.name} 📥`)}
                              style={{ flex: 1, padding: 8, borderRadius: 10, border: `1px solid ${panelBorder}`, background: 'transparent', color: textPrimary, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            >
                              <Download size={13} /> Download
                            </button>
                            <button
                              onClick={() => {
                                setVaultDocuments(prev => prev.filter(d => d.id !== doc.id));
                                toast(`Deleted ${doc.name}`);
                              }}
                              style={{ padding: '8px 10px', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                  </div>

                  {/* Add Document Modal */}
                  {isAddDocOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 16 }}>
                      <div style={{ width: '100%', maxWidth: 420, background: isDarkMode ? '#0f172a' : '#fff', borderRadius: 22, padding: 24, border: `1px solid ${panelBorder}`, color: textPrimary }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 800 }}>Upload Health Document</h3>
                          <button onClick={() => setIsAddDocOpen(false)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer' }}><X size={18} /></button>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Document Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Lipid_Panel_Nov2026.pdf"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none' }}
                          />
                        </div>
                        <div style={{ marginBottom: 18 }}>
                          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Category</label>
                          <select
                            value={newDocCategory}
                            onChange={(e) => setNewDocCategory(e.target.value)}
                            style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none', cursor: 'pointer' }}
                          >
                            <option>Lab Reports</option>
                            <option>Prescriptions</option>
                            <option>Vaccines</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => setIsAddDocOpen(false)} style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${panelBorder}`, background: 'transparent', color: textPrimary, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                          <button
                            onClick={() => {
                              if (newDocName.trim()) {
                                setVaultDocuments(prev => [
                                  { id: `v-${Date.now()}`, name: newDocName.trim(), date: new Date().toISOString().split('T')[0], category: newDocCategory, size: '780 KB' },
                                  ...prev
                                ]);
                                setNewDocName('');
                                setIsAddDocOpen(false);
                                toast("Uploaded document to Medical Vault");
                              }
                            }}
                            disabled={!newDocName.trim()}
                            style={{ flex: 1, height: 42, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: newDocName.trim() ? 1 : 0.5 }}
                          >
                            Save Document
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 8. CLINICAL UTILITIES & CALCULATORS */}
            {activeTab === 'tools' && (
              <motion.div
                key="tools"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      <Calculator size={16} /> EVIDENCE-BASED TOOLS
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Clinical Calculators & Triage</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                      Validated algorithms for metabolic basal rates, BMI classification, target cardiac zones, and emergency triage.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, marginBottom: 28 }}>
                    {/* Tool 1: AI Symptom Triage Wizard */}
                    <GlassCard>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#ef4444', display: 'grid', placeItems: 'center' }}>
                          <AlertTriangle size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 800 }}>AI Symptom Triage Wizard</h3>
                          <p style={{ fontSize: 11, color: textSecondary }}>Validated clinical urgency assessment</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Describe your symptom(s)</label>
                          <input
                            type="text"
                            placeholder="e.g. Throbbing frontal headache with mild light sensitivity"
                            value={symptomInput}
                            onChange={(e) => setSymptomInput(e.target.value)}
                            style={{ width: '100%', height: 40, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none', fontSize: 13 }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Duration: {symptomDays} days</label>
                            <input
                              type="range" min="1" max="14" value={symptomDays}
                              onChange={(e) => setSymptomDays(Number(e.target.value))}
                              style={{ width: '100%', accentColor: '#3b82f6' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Severity: {symptomSeverity}/10</label>
                            <input
                              type="range" min="1" max="10" value={symptomSeverity}
                              onChange={(e) => setSymptomSeverity(Number(e.target.value))}
                              style={{ width: '100%', accentColor: '#ef4444' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 14 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={hasFever} onChange={(e) => setHasFever(e.target.checked)} style={{ accentColor: '#ef4444' }} /> Has Fever
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                            <input type="checkbox" checked={hasChestPain} onChange={(e) => setHasChestPain(e.target.checked)} style={{ accentColor: '#ef4444' }} /> Chest Tightness
                          </label>
                        </div>

                        <button
                          onClick={runSymptomTriage}
                          disabled={isTriaging}
                          style={{ width: '100%', height: 42, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#ef4444,#f59e0b)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
                        >
                          {isTriaging ? 'Analyzing Symptoms...' : 'Evaluate Urgency'}
                        </button>
                      </div>

                      {triageResult && (
                        <div style={{ padding: 14, borderRadius: 14, background: triageResult.tier === 'EMERGENCY' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)', border: `1px solid ${panelBorder}` }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: triageResult.tier === 'EMERGENCY' ? '#ef4444' : '#10b981' }}>{triageResult.tier}</span>
                          <p style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>{triageResult.urgency}</p>
                          <p style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>{triageResult.recommendation}</p>
                        </div>
                      )}
                    </GlassCard>

                    {/* Tool 2: Health Metrics & Metabolic Calculator */}
                    <GlassCard>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'grid', placeItems: 'center' }}>
                          <Calculator size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Metabolic & Vitals Calculator</h3>
                          <p style={{ fontSize: 11, color: textSecondary }}>Computes BMI, BMR, TDEE & Cardio zones</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 2 }}>Weight (kg)</label>
                          <input type="number" value={metricsWeight} onChange={(e) => setMetricsWeight(Number(e.target.value))} style={{ width: '100%', height: 38, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 10px', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 2 }}>Height (cm)</label>
                          <input type="number" value={metricsHeight} onChange={(e) => setMetricsHeight(Number(e.target.value))} style={{ width: '100%', height: 38, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 10px', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 2 }}>Age</label>
                          <input type="number" value={metricsAge} onChange={(e) => setMetricsAge(Number(e.target.value))} style={{ width: '100%', height: 38, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 10px', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 2 }}>Gender</label>
                          <select value={metricsGender} onChange={(e) => setMetricsGender(e.target.value)} style={{ width: '100%', height: 38, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 10px', outline: 'none', cursor: 'pointer' }}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="unspecified">Other</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 2 }}>Activity Level</label>
                          <select value={metricsActivity} onChange={(e) => setMetricsActivity(e.target.value)} style={{ width: '100%', height: 38, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 10px', outline: 'none', cursor: 'pointer' }}>
                            <option value="sedentary">Sedentary (Little or no exercise)</option>
                            <option value="light">Light (Exercise 1-3 times/week)</option>
                            <option value="moderate">Moderate (Exercise 4-5 times/week)</option>
                            <option value="active">Active (Daily intensive exercise)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={runCalculateMetrics}
                        disabled={isCalculatingMetrics}
                        style={{ width: '100%', height: 40, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', marginBottom: 14 }}
                      >
                        {isCalculatingMetrics ? 'Calculating...' : 'Compute Metrics'}
                      </button>

                      {metricsResult && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: 12, borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)', border: `1px solid ${panelBorder}` }}>
                          <div><p style={{ fontSize: 10, color: textSecondary }}>BMI</p><p style={{ fontSize: 14, fontWeight: 900 }}>{metricsResult.bmi} ({metricsResult.bmi_category})</p></div>
                          <div><p style={{ fontSize: 10, color: textSecondary }}>BMR</p><p style={{ fontSize: 14, fontWeight: 900 }}>{metricsResult.bmr_calories} kcal</p></div>
                          <div><p style={{ fontSize: 10, color: textSecondary }}>TDEE (Daily Burn)</p><p style={{ fontSize: 14, fontWeight: 900 }}>{metricsResult.tdee_calories} kcal</p></div>
                          <div><p style={{ fontSize: 10, color: textSecondary }}>Target Hydration</p><p style={{ fontSize: 14, fontWeight: 900 }}>{metricsResult.daily_water_liters} L/day</p></div>
                        </div>
                      )}
                    </GlassCard>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 9. HEALTH MARKETPLACE */}
            {activeTab === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                        <Pill size={16} /> VERIFIED PHARMACY & WELLNESS
                      </div>
                      <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>HealthCatch Marketplace</h2>
                      <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                        Clinically curated supplements, orthopedic devices, and wellness essentials delivered to your door.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCartOpen(true)}
                      style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <ShoppingCart size={16} /> View Cart ({cart.reduce((a, b) => a + b.qty, 0)})
                    </button>
                  </div>

                  {/* Filter & Search */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                      <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                      <input
                        type="text"
                        placeholder="Search products or supplements..."
                        value={marketSearch}
                        onChange={(e) => setMarketSearch(e.target.value)}
                        style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 14px 0 40px', outline: 'none', fontSize: 13 }}
                      />
                    </div>
                    {['all', 'supplements', 'devices', 'wellness'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setMarketFilter(cat)}
                        style={{
                          padding: '8px 16px', borderRadius: 99, border: `1px solid ${panelBorder}`,
                          background: marketFilter === cat ? '#3b82f6' : 'transparent',
                          color: marketFilter === cat ? '#fff' : textSecondary, fontSize: 12, fontWeight: 800, cursor: 'pointer', textTransform: 'capitalize'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Products Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                    {INITIAL_MARKET_ITEMS
                      .filter(i => (marketFilter === 'all' || i.category === marketFilter) && (!marketSearch || i.title.toLowerCase().includes(marketSearch.toLowerCase())))
                      .map(item => (
                        <GlassCard key={item.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
                              <Pill size={22} />
                            </div>
                            <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{item.title}</h4>
                            <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5, marginBottom: 12 }}>{item.desc}</p>
                            <p style={{ fontSize: 11, color: textSecondary }}>Sold by: <strong>{item.shop}</strong></p>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: `1px solid ${panelBorder}` }}>
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>₹{item.price}</span>
                            <button
                              onClick={() => addToCart(item)}
                              style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 10. SOCIAL FEED / HEALTH CIRCLE */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                      <Home size={15} /> COMMUNITY FEED
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Health Circle Feed</h2>
                    <p style={{ color: textSecondary, fontSize: 13, marginTop: 2 }}>Real stories, recovery journeys, and verified clinical tips.</p>

                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      {['For You', 'Following', 'Trending', 'Clinical Tips'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setFeedFilterTab(tab)}
                          style={{
                            padding: '7px 16px', borderRadius: 99, border: `1px solid ${panelBorder}`,
                            background: feedFilterTab === tab ? 'linear-gradient(135deg,#3b82f6,#10b981)' : 'transparent',
                            color: feedFilterTab === tab ? '#fff' : textSecondary, fontSize: 12.5, fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Post Composer */}
                  <GlassCard style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <UserAvatar src={userPhoto} name={userName} size={42} />
                      <input
                        type="text"
                        placeholder="Share a milestone, workout achievement, or question..."
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newPostText.trim()) {
                            const newPost = {
                              id: Date.now(),
                              name: userName,
                              time: 'Just now',
                              text: newPostText.trim(),
                              likes: 1,
                              liked: true,
                              comments: 0,
                              category: newPostCategory
                            };
                            setFeedPosts([newPost, ...feedPosts]);
                            setNewPostText('');
                            toast("Post shared with your Health Circle! 🚀");
                          }
                        }}
                        style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 16px', outline: 'none', fontSize: 13.5 }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['Fitness', 'Mental Health', 'Nutrition', 'Recovery'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setNewPostCategory(cat)}
                            style={{
                              padding: '4px 10px', borderRadius: 99, border: `1px solid ${panelBorder}`,
                              background: newPostCategory === cat ? 'rgba(59,130,246,0.15)' : 'transparent',
                              color: newPostCategory === cat ? '#3b82f6' : textSecondary, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            #{cat}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          if (newPostText.trim()) {
                            const newPost = {
                              id: Date.now(),
                              name: userName,
                              time: 'Just now',
                              text: newPostText.trim(),
                              likes: 1,
                              liked: true,
                              comments: 0,
                              category: newPostCategory
                            };
                            setFeedPosts([newPost, ...feedPosts]);
                            setNewPostText('');
                            toast("Post shared with your Health Circle! 🚀");
                          }
                        }}
                        disabled={!newPostText.trim()}
                        style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 800, fontSize: 13, cursor: newPostText.trim() ? 'pointer' : 'default', opacity: newPostText.trim() ? 1 : 0.4 }}
                      >
                        Publish
                      </button>
                    </div>
                  </GlassCard>

                  {/* Posts List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {feedPosts.map(post => (
                      <GlassCard key={post.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <UserAvatar name={post.name} size={40} />
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 800 }}>{post.name}</p>
                              <p style={{ fontSize: 11, color: textSecondary }}>{post.time} · #{post.category}</p>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{post.text}</p>
                        <div style={{ display: 'flex', gap: 24, borderTop: `1px solid ${panelBorder}`, paddingTop: 12 }}>
                          <button
                            onClick={() => {
                              setFeedPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: post.liked ? '#3b82f6' : textSecondary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                          >
                            <ThumbsUp size={16} fill={post.liked ? '#3b82f6' : 'none'} /> {post.likes}
                          </button>
                          <button
                            onClick={() => setActiveCommentsPost(post)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: textSecondary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                          >
                            <MessageCircle size={16} /> {post.comments}
                          </button>
                          <button
                            onClick={() => { navigator.clipboard?.writeText(window.location.href); toast("Post link copied to clipboard 🔗"); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: textSecondary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                          >
                            <Share2 size={16} /> Share
                          </button>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 11. HEALTH GROUPS */}
            {activeTab === 'groups' && (
              <motion.div key="groups" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="hc-scroll-panel" style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}>
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}><UsersRound size={16} /> ACTION COMMUNITIES</div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Health Groups</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>Join communities that match your health goals and get collective motivation.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
                    {[
                      { id: 'g1', name: 'Diabetes Warriors', emoji: '🩸', members: 2847, joined: false, desc: 'Managing type 1 & 2 diabetes through diet, exercise, and peer support. Monitored by endocrinologists.', challenge: '30-Day Low Glycemic Diet', category: 'Chronic Care' },
                      { id: 'g2', name: 'Morning Yoga Circle', emoji: '🧘', members: 5612, joined: true, desc: 'Daily 20-minute guided yoga sessions for flexibility, calm, and mindful breathing. All levels welcome.', challenge: 'Sunrise Flow 7-Day Streak', category: 'Fitness' },
                      { id: 'g3', name: 'Mental Wellness Tribe', emoji: '🧠', members: 3920, joined: true, desc: 'Safe space for discussing anxiety, depression, and burnout recovery. Facilitated by licensed psychologists.', challenge: 'Gratitude Journal 14 Days', category: 'Mental Health' },
                      { id: 'g4', name: 'Heart Health Heroes', emoji: '❤️', members: 1234, joined: false, desc: 'Cardio recovery, hypertension management, and cardiac rehab support group for survivors and caregivers.', challenge: 'Walk 5K Daily for 30 Days', category: 'Cardiac Care' },
                      { id: 'g5', name: 'Nutrition Nerds', emoji: '🥗', members: 4441, joined: false, desc: 'Science-backed nutritional guidance, meal prep ideas, and macro tracking with registered dietitians.', challenge: 'Sugar-Free October', category: 'Nutrition' },
                      { id: 'g6', name: 'Sleep Optimization Lab', emoji: '🌙', members: 2088, joined: false, desc: 'Fix insomnia, improve sleep quality, and master chronobiology with sleep science experts.', challenge: '10-Day Sleep Hygiene Reset', category: 'Sleep Health' },
                    ].map(g => {
                      const gJoined = joinedGroups[g.id] ?? g.joined;
                      return (
                        <GlassCard key={g.id} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.1)', fontSize: 24, display: 'grid', placeItems: 'center' }}>{g.emoji}</div>
                              <div>
                                <h4 style={{ fontSize: 15, fontWeight: 800 }}>{g.name}</h4>
                                <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 99 }}>{g.category}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setJoinedGroups(prev => ({ ...prev, [g.id]: !gJoined }));
                                toast(gJoined ? `Left ${g.name}` : `Joined ${g.name}! 🎉`);
                              }}
                              style={{ padding: '7px 14px', borderRadius: 10, border: gJoined ? '1px solid rgba(239,68,68,0.3)' : 'none', background: gJoined ? 'rgba(239,68,68,0.08)' : 'linear-gradient(135deg,#3b82f6,#10b981)', color: gJoined ? '#ef4444' : '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}
                            >
                              {gJoined ? 'Leave' : 'Join'}
                            </button>
                          </div>
                          <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.55, marginBottom: 14, flex: 1 }}>{g.desc}</p>
                          <div style={{ padding: '10px 12px', borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)', border: `1px solid ${panelBorder}` }}>
                            <p style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', marginBottom: 2 }}>🏆 Active Challenge</p>
                            <p style={{ fontSize: 12, fontWeight: 700 }}>{g.challenge}</p>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                            <span style={{ fontSize: 11, color: textSecondary }}>{g.members.toLocaleString()} members</span>
                            {gJoined && <span style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>✓ Member</span>}
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 12. HEALTHCARE CAREERS */}
            {activeTab === 'jobs' && (
              <motion.div key="jobs" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="hc-scroll-panel" style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}>
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}><BriefcaseBusiness size={16} /> HEALTHCARE CAREERS</div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Healthcare Jobs Board</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>Curated clinical and healthcare technology roles from verified Indian healthcare employers.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { id: 'j1', title: 'Senior Clinical Psychologist', org: 'Apollo Mental Health Institute', location: 'Kolkata, WB', type: 'Full-Time', salary: '₹12–18 LPA', skills: ['CBT', 'DBT', 'Clinical Assessment'], urgent: true, posted: '2 days ago' },
                      { id: 'j2', title: 'Cardiologist – Interventional', org: 'Fortis Heart Institute', location: 'Delhi NCR', type: 'Full-Time', salary: '₹35–55 LPA', skills: ['PTCA', 'Echocardiography', 'Cath Lab'], urgent: false, posted: '5 days ago' },
                      { id: 'j3', title: 'Health Data Scientist', org: 'HealthTech AI Pvt Ltd', location: 'Remote / Bengaluru', type: 'Remote', salary: '₹18–28 LPA', skills: ['Python', 'ML', 'FHIR', 'Healthcare Analytics'], urgent: false, posted: '1 week ago' },
                      { id: 'j4', title: 'Registered Dietitian & Nutritionist', org: 'Max Super Specialty Hospital', location: 'Mumbai, MH', type: 'Part-Time', salary: '₹6–10 LPA', skills: ['Clinical Nutrition', 'Renal Diet', 'Oncology Diet'], urgent: true, posted: '3 days ago' },
                      { id: 'j5', title: 'Telemedicine Platform Engineer', org: 'HealthCatch AI (Us!)', location: 'Fully Remote', type: 'Remote', salary: '₹20–32 LPA', skills: ['React', 'FastAPI', 'WebRTC', 'HIPAA Security'], urgent: false, posted: 'Just now' },
                    ].map(job => {
                      const isApplied = appliedJobs[job.id];
                      return (
                        <GlassCard key={job.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <h4 style={{ fontSize: 16, fontWeight: 800 }}>{job.title}</h4>
                                {job.urgent && <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>URGENT HIRE</span>}
                              </div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>{job.org}</p>
                              <div style={{ display: 'flex', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 12, color: textSecondary }}>📍 {job.location}</span>
                                <span style={{ fontSize: 12, color: textSecondary }}>⏰ {job.type}</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>{job.salary}</span>
                                <span style={{ fontSize: 12, color: textSecondary }}>Posted {job.posted}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                                {job.skills.map(s => (
                                  <span key={s} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{s}</span>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (!isApplied) {
                                  setAppliedJobs(prev => ({ ...prev, [job.id]: true }));
                                  toast(`Applied to ${job.title} at ${job.org}! 🎯`);
                                }
                              }}
                              style={{ padding: '10px 22px', borderRadius: 12, border: isApplied ? `1px solid ${panelBorder}` : 'none', background: isApplied ? 'transparent' : 'linear-gradient(135deg,#3b82f6,#10b981)', color: isApplied ? textSecondary : '#fff', fontWeight: 800, fontSize: 13, cursor: isApplied ? 'default' : 'pointer', flexShrink: 0 }}
                            >
                              {isApplied ? '✓ Applied' : 'Apply Now'}
                            </button>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 13. EMERGENCY BLOOD DONORS */}
            {activeTab === 'donors' && (
              <motion.div key="donors" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="hc-scroll-panel" style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}>
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}><HeartHandshake size={16} /> EMERGENCY BLOOD NETWORK</div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Emergency Donor Network</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>Find verified blood donors and plasma donors near you in real-time medical emergencies.</p>
                  </div>

                  {/* Filters */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                      <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                      <input
                        type="text"
                        placeholder="Search by city or area..."
                        value={donorSearchCity}
                        onChange={(e) => setDonorSearchCity(e.target.value)}
                        style={{ width: '100%', height: 40, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 14px 0 40px', outline: 'none', fontSize: 13 }}
                      />
                    </div>
                    {['All', 'O+', 'O-', 'A+', 'B+', 'AB+'].map(bg => (
                      <button
                        key={bg}
                        onClick={() => setDonorFilterBlood(bg)}
                        style={{
                          padding: '7px 14px', borderRadius: 99, border: `1px solid ${panelBorder}`,
                          background: donorFilterBlood === bg ? '#ef4444' : 'transparent',
                          color: donorFilterBlood === bg ? '#fff' : textSecondary, fontSize: 12, fontWeight: 800, cursor: 'pointer'
                        }}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {[
                      { name: 'Rohit Sharma', blood: 'O+', city: 'Kolkata, WB', lastDonated: 'Aug 2026', available: true, donations: 12 },
                      { name: 'Priya Ghosh', blood: 'A-', city: 'Salt Lake, Kolkata', lastDonated: 'Sep 2026', available: true, donations: 7 },
                      { name: 'Amit Das', blood: 'B+', city: 'Howrah, WB', lastDonated: 'Jul 2026', available: false, donations: 4 },
                      { name: 'Sunita Mehra', blood: 'AB+', city: 'Dum Dum, Kolkata', lastDonated: 'Oct 2026', available: true, donations: 20 },
                      { name: 'Kiran Verma', blood: 'O-', city: 'Barasat, WB', lastDonated: 'Nov 2026', available: true, donations: 15 },
                      { name: 'Debapriya Sen', blood: 'A+', city: 'Jadavpur, Kolkata', lastDonated: 'Sep 2026', available: true, donations: 9 },
                    ]
                      .filter(d => (donorFilterBlood === 'All' || d.blood === donorFilterBlood) && (!donorSearchCity || d.city.toLowerCase().includes(donorSearchCity.toLowerCase())))
                      .map((d, i) => (
                        <GlassCard key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <UserAvatar name={d.name} size={46} />
                              <div>
                                <h4 style={{ fontSize: 14, fontWeight: 800 }}>{d.name}</h4>
                                <p style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>📍 {d.city}</p>
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.12)', display: 'grid', placeItems: 'center' }}>
                              <span style={{ fontSize: 16, fontWeight: 900, color: '#ef4444' }}>{d.blood}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: textSecondary, marginBottom: 12 }}>
                            <span>🩸 {d.donations} donations</span>
                            <span>Last: {d.lastDonated}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99, background: d.available ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.1)', color: d.available ? '#10b981' : textSecondary }}>
                              {d.available ? '✓ Available Now' : 'Unavailable'}
                            </span>
                            <button
                              onClick={() => toast(d.available ? `Emergency contact dispatched for ${d.name} 🚨` : 'Donor currently unavailable')}
                              style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: d.available ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.1)', color: d.available ? '#ef4444' : textSecondary, fontSize: 12, fontWeight: 800, cursor: d.available ? 'pointer' : 'default' }}
                            >
                              {d.available ? '🚨 Request' : 'Offline'}
                            </button>
                          </div>
                        </GlassCard>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 14. DIRECT MESSAGING */}
            {activeTab === 'messaging' && (
              <motion.div key="messaging" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="hc-scroll-panel" style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}>
                <div style={{ maxWidth: 940, margin: '0 auto' }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}><MessageSquareText size={16} /> DIRECT MESSAGES</div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Health Conversations</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>Encrypted peer-to-peer health conversations with verified doctors and wellness coaches.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.4fr) minmax(0, 1fr)', gap: 16, minHeight: 520 }}>
                    {/* Contact List */}
                    <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                      <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${panelBorder}` }}>
                        <input type="text" placeholder="Search conversations..." style={{ width: '100%', height: 38, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none', fontSize: 13 }} />
                      </div>
                      {[
                        { name: 'Dr. Amit Patel', last: 'Your BP readings look great!', time: '2m', unread: 2, online: true },
                        { name: 'Dr. Sneha Roy', last: 'Remember your 10m digital detox', time: '1h', unread: 0, online: true },
                        { name: 'Ankita Halder', last: 'Congrats on the 10K streak! 🎉', time: '3h', unread: 1, online: false },
                        { name: 'Wellness Coach AI', last: 'Your weekly report is ready', time: '1d', unread: 0, online: true },
                      ].map((c, i) => (
                        <div
                          key={i}
                          onClick={() => { setActiveChatContact(c.name); toast(`Switched to conversation with ${c.name}`); }}
                          style={{
                            display: 'flex', gap: 10, padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${panelBorder}`,
                            background: activeChatContact === c.name ? (isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)') : 'transparent'
                          }}
                        >
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <UserAvatar name={c.name} size={42} />
                            {c.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: '#10b981', border: `2px solid ${isDarkMode ? '#0f172a' : '#fff'}` }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                              <span style={{ fontSize: 10, color: textSecondary, flexShrink: 0 }}>{c.time}</span>
                            </div>
                            <p style={{ fontSize: 11.5, color: textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{c.last}</p>
                          </div>
                          {c.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 800, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{c.unread}</div>}
                        </div>
                      ))}
                    </GlassCard>

                    {/* Chat Window */}
                    <GlassCard style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${panelBorder}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <UserAvatar name={activeChatContact} size={38} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 800 }}>{activeChatContact}</p>
                          <p style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>● Online · Encrypted Peer Channel</p>
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                        {(conversations[activeChatContact] || [
                          { sender: 'them', text: `Hello! How can I assist you today?`, time: 'Just now' }
                        ]).map((msg, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: msg.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.sender === 'me' ? 'linear-gradient(135deg,#3b82f6,#10b981)' : (isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)'), color: msg.sender === 'me' ? '#fff' : textPrimary, fontSize: 13.5, lineHeight: 1.5 }}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '12px 16px', borderTop: `1px solid ${panelBorder}`, display: 'flex', gap: 10 }}>
                        <input
                          type="text"
                          placeholder="Type an encrypted message..."
                          value={dmInput}
                          onChange={(e) => setDmInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && dmInput.trim()) {
                              setConversations(prev => ({
                                ...prev,
                                [activeChatContact]: [...(prev[activeChatContact] || []), { sender: 'me', text: dmInput.trim(), time: 'Just now' }]
                              }));
                              setDmInput('');
                              toast('Message sent 🔒');
                            }
                          }}
                          style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 14px', outline: 'none', fontSize: 13 }}
                        />
                        <button
                          onClick={() => {
                            if (dmInput.trim()) {
                              setConversations(prev => ({
                                ...prev,
                                [activeChatContact]: [...(prev[activeChatContact] || []), { sender: 'me', text: dmInput.trim(), time: 'Just now' }]
                              }));
                              setDmInput('');
                              toast('Message sent 🔒');
                            }
                          }}
                          style={{ padding: '0 18px', height: 42, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13 }}
                        >
                          <Send size={15} /> Send
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 15. PROFILE & SETTINGS */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 760, margin: '0 auto' }}>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}><User size={16} /> USER PREFERENCES</div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Personal Profile & Targets</h2>
                  </div>

                  <GlassCard style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20 }}>
                      <UserAvatar src={userPhoto} name={userName} size={76} style={{ border: '3px solid #3b82f6' }} />
                      <div>
                        <h2 style={{ fontSize: 24, fontWeight: 900 }}>{userName}</h2>
                        <p style={{ color: textSecondary, fontSize: 13 }}>{userEmail}</p>
                        <p style={{ color: '#10b981', fontSize: 12, fontWeight: 800, marginTop: 4 }}>Level 7 Health Champion · {userXP} XP</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Display Name</label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Age</label>
                        <input
                          type="number"
                          value={userAge}
                          onChange={(e) => setUserAge(Number(e.target.value))}
                          style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Blood Group</label>
                        <input
                          type="text"
                          value={userBloodGroup}
                          onChange={(e) => setUserBloodGroup(e.target.value)}
                          style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Emergency Contact Phone</label>
                        <input
                          type="text"
                          value={userEmergencyContact}
                          onChange={(e) => setUserEmergencyContact(e.target.value)}
                          style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Daily Target Steps</label>
                        <input
                          type="number"
                          value={userTargetSteps}
                          onChange={(e) => setUserTargetSteps(Number(e.target.value))}
                          style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 4 }}>Daily Target Hydration (Liters)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={userTargetWater}
                          onChange={(e) => setUserTargetWater(Number(e.target.value))}
                          style={{ width: '100%', height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => toast("Profile settings updated successfully! ✅")}
                        style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                      >
                        Save Preferences
                      </button>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        style={{ padding: '10px 20px', borderRadius: 12, border: `1px solid ${panelBorder}`, background: 'transparent', color: textPrimary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                      >
                        {isDarkMode ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ──────────────────────────────── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: 62,
          background: isDarkMode ? 'rgba(8, 14, 30, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(30px)', borderTop: `1px solid ${panelBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 50
        }}>
          {[
            { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={19} /> },
            { id: 'coach', label: 'Coach', icon: <Sparkle size={19} /> },
            { id: 'chat', label: 'AI Chat', icon: <MessageSquare size={19} /> },
            { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={19} /> },
            { id: 'market', label: 'Market', icon: <Pill size={19} /> }
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNav(tab.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  background: 'none', border: 'none', color: active ? '#3b82f6' : textSecondary,
                  fontSize: 10.5, fontWeight: active ? 800 : 600, cursor: 'pointer'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* ── MODALS (Booking, Telehealth, Shopping Cart, SOS, Add Med, Comments) ── */}
      <AnimatePresence>
        {selectedDoctorForBooking && (
          <AppointmentBookingModal
            doctor={selectedDoctorForBooking}
            isDarkMode={isDarkMode}
            onClose={() => setSelectedDoctorForBooking(null)}
            onConfirm={(appData) => {
              setBookedAppointments(prev => [appData, ...prev]);
              setSelectedDoctorForBooking(null);
              toast(`Appointment confirmed with ${appData.doctorName} for ${appData.date} at ${appData.slot}! 📅`);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeVideoCallDoctor && (
          <TelehealthVideoRoomModal
            doctor={activeVideoCallDoctor}
            onClose={() => setActiveVideoCallDoctor(null)}
            onSaveSummary={(doc) => setVaultDocuments(prev => [doc, ...prev])}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <ShoppingCartDrawer
            cart={cart}
            isDarkMode={isDarkMode}
            onClose={() => setIsCartOpen(false)}
            onUpdateQty={updateCartQty}
            onRemove={removeFromCart}
            onCheckout={() => {
              setIsCartOpen(false);
              setCart([]);
              toast("Order placed successfully! Tracking ID #HC-ORD-8492 📦");
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSOSOpen && (
          <SOSModal
            onClose={() => setIsSOSOpen(false)}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddMedOpen && (
          <AddMedicationModal
            onClose={() => setIsAddMedOpen(false)}
            isDarkMode={isDarkMode}
            onAdd={(med) => {
              setMedications(prev => [...prev, med]);
              toast(`Added ${med.name} to medication checklist 💊`);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeCommentsPost && (
          <CommentsDrawer
            post={activeCommentsPost}
            isDarkMode={isDarkMode}
            onClose={() => setActiveCommentsPost(null)}
            onAddComment={() => {
              setFeedPosts(prev => prev.map(p => p.id === activeCommentsPost.id ? { ...p, comments: p.comments + 1 } : p));
              toast("Comment published! 💬");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ROOT APP COMPONENT ──────────────────────────────────────────────────
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('hc_theme');
      if (stored === 'light') return false;
      if (stored === 'dark') return true;
    } catch { /* ignore */ }
    return true; // Default to sleek dark mode
  });
  const [isAuthReady, setIsAuthReady] = useState(() => !auth);
  const scrollProgressRef = useRef(0);

  // Sync theme changes to localStorage
  const handleToggleTheme = (val) => {
    setIsDarkMode(val);
    try {
      localStorage.setItem('hc_theme', val ? 'dark' : 'light');
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDarkMode ? '#070d1e' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a',
      }}>
        <Loader2 size={36} className="animate-spin" color="#3b82f6" />
      </div>
    );
  }

  return (
    <>
      <GlobalStyles isDarkMode={isDarkMode} />
      <ModernAnimatedBackground isDarkMode={isDarkMode} />
      <ToastHost isDarkMode={isDarkMode} />

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <CinematicLanding
              onLogin={() => setIsLoggedIn(true)}
              onGuestLogin={() => setIsLoggedIn(true)}
              scrollProgressRef={scrollProgressRef}
              isDarkMode={isDarkMode}
              setIsDarkMode={handleToggleTheme}
            />
          </motion.div>
        ) : (
          <motion.div key="superapp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <AuthenticatedApp
              onLogout={() => setIsLoggedIn(false)}
              isDarkMode={isDarkMode}
              setIsDarkMode={handleToggleTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
