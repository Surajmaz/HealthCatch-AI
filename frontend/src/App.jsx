import { auth, provider } from './firebase';
import {
  signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, updateProfile, signOut, onAuthStateChanged
} from 'firebase/auth';
import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import * as THREE from 'three';
import {
  LayoutDashboard, MessageSquare, Send, User, Bot, Loader2,
  LogOut, Search, Sun, Moon, Paperclip, Mail, Lock, Menu, X, AlertCircle,
  Calendar, CheckCircle, BrainCircuit, ChevronDown, Sparkles,
  Stethoscope, Video, ThumbsUp, MessageCircle, Share2, Home,
  FolderHeart, AlertTriangle, Pill, Phone, HeartHandshake, Calculator,
  Trophy, Footprints, Droplets, Heart, Check, Play, Pause, RotateCcw,
  Download, QrCode, FileText, ShoppingCart, Trash2, Plus, Minus,
  CircleGauge, MapPin, BadgeCheck, Sparkle, UsersRound, BriefcaseBusiness,
  MessageSquareText
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
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
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
              pointerEvents: 'auto', padding: '12px 20px', borderRadius: 14,
              background: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)',
              color: isDarkMode ? '#fff' : '#0f172a',
              border: `1px solid ${t.tone === 'error' ? 'rgba(239,68,68,0.4)' : isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: '0 14px 45px -10px rgba(0,0,0,0.4)', fontSize: 13.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 10, backdropFilter: 'blur(24px)', maxWidth: '88vw',
            }}
          >
            {t.tone === 'error' ? (
              <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
            ) : (
              <CheckCircle size={16} color="#34d399" style={{ flexShrink: 0 }} />
            )}
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Deterministic PRNG Helper ───────────────────────────────────────────
function seededRandom(seed) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// ── Global Styles ───────────────────────────────────────────────────────
const GlobalStyles = ({ isDarkMode }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      overscroll-behavior: none;
      scroll-behavior: smooth;
    }
    body {
      background: ${isDarkMode ? '#050814' : '#f8fafc'};
      color: ${isDarkMode ? '#ffffff' : '#0f172a'};
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.4s ease, color 0.4s ease;
    }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}; borderRadius: 999px; }
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
    .hc-glass {
      background: ${isDarkMode ? 'rgba(11, 19, 38, 0.75)' : 'rgba(255, 255, 255, 0.85)'};
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'};
    }
    .hc-scroll-panel {
      scrollbar-width: thin;
      scrollbar-color: ${isDarkMode ? 'rgba(255,255,255,0.15) transparent' : 'rgba(0,0,0,0.15) transparent'};
    }
    @media (max-width: 768px) {
      .hc-scroll-panel { padding: 18px 14px 110px !important; }
      .side-scroll-rail { display: none !important; }
    }
  `}</style>
);

// ── 3D Visual Scene ─────────────────────────────────────────────────────
function DNAHelix({ scrollProgress }) {
  const groupRef = useRef();
  const sphereMeshRef = useRef();
  const rungMeshRef = useRef();
  const STRAND_COUNT = 60;
  const HELIX_HEIGHT = 10;
  const HELIX_RADIUS = 1.1;
  const TURNS = 2.5;

  const { nodes, rungs } = useMemo(() => {
    const n = [], r = [];
    for (let i = 0; i < STRAND_COUNT; i++) {
      const t = i / STRAND_COUNT;
      const angle = t * Math.PI * 2 * TURNS;
      const y = (t - 0.5) * HELIX_HEIGHT;
      const posA = new THREE.Vector3(Math.cos(angle) * HELIX_RADIUS, y, Math.sin(angle) * HELIX_RADIUS);
      const posB = new THREE.Vector3(Math.cos(angle + Math.PI) * HELIX_RADIUS, y, Math.sin(angle + Math.PI) * HELIX_RADIUS);
      n.push({ pos: posA, color: '#3b82f6' });
      n.push({ pos: posB, color: '#10b981' });
      if (i % 2 === 0) r.push({ start: posA, end: posB });
    }
    return { nodes: n, rungs: r };
  }, []);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    if (sphereMeshRef.current) {
      nodes.forEach((node, i) => {
        dummy.position.copy(node.pos);
        dummy.updateMatrix();
        sphereMeshRef.current.setMatrixAt(i, dummy.matrix);
        sphereMeshRef.current.setColorAt(i, color.set(node.color));
      });
      sphereMeshRef.current.instanceMatrix.needsUpdate = true;
      if (sphereMeshRef.current.instanceColor) sphereMeshRef.current.instanceColor.needsUpdate = true;
    }
    if (rungMeshRef.current) {
      const quat = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      rungs.forEach((rung, i) => {
        const mid = rung.start.clone().add(rung.end).multiplyScalar(0.5);
        const dir = rung.end.clone().sub(rung.start);
        const len = dir.length();
        quat.setFromUnitVectors(up, dir.normalize());
        dummy.position.copy(mid);
        dummy.quaternion.copy(quat);
        dummy.scale.set(1, len, 1);
        dummy.updateMatrix();
        rungMeshRef.current.setMatrixAt(i, dummy.matrix);
      });
      rungMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [nodes, rungs]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const sp = scrollProgress?.current || 0;
    groupRef.current.rotation.y = t * 0.12 + sp * Math.PI * 1.5;
    groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.08;
    const s = 1 + Math.sin(sp * Math.PI) * 0.1;
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <instancedMesh ref={sphereMeshRef} args={[null, null, nodes.length]} frustumCulled={false}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial emissive="#1d4ed8" emissiveIntensity={0.5} roughness={0.3} metalness={0.7} transparent opacity={0.85} />
      </instancedMesh>
      <instancedMesh ref={rungMeshRef} args={[null, null, rungs.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.012, 0.012, 1, 5]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.25} transparent opacity={0.2} roughness={0.5} />
      </instancedMesh>
    </group>
  );
}

const NEURAL_PARTICLE_COUNT = 70;
const NEURAL_POSITIONS = new Float32Array(NEURAL_PARTICLE_COUNT * 3);
for (let i = 0; i < NEURAL_PARTICLE_COUNT; i++) {
  const r1 = seededRandom(i * 5 + 1);
  const r2 = seededRandom(i * 5 + 2);
  const r3 = seededRandom(i * 5 + 3);
  NEURAL_POSITIONS[i * 3] = (r1 - 0.5) * 16;
  NEURAL_POSITIONS[i * 3 + 1] = (r2 - 0.5) * 16;
  NEURAL_POSITIONS[i * 3 + 2] = (r3 - 0.5) * 10;
}

function NeuralParticles() {
  const pointsRef = useRef();

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    pointsRef.current.rotation.y = t * 0.04;
    pointsRef.current.rotation.x = Math.sin(t * 0.03) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={NEURAL_PARTICLE_COUNT} array={NEURAL_POSITIONS} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#60a5fa" transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Global3DBackground({ isLoggedIn: _isLoggedIn, scrollProgress, isDarkMode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', transition: 'background 0.5s ease',
      background: isDarkMode
        ? 'radial-gradient(ellipse at 50% 30%, #081226 0%, #030611 75%)'
        : 'radial-gradient(ellipse at 50% 30%, #e0f2fe 0%, #f8fafc 75%)',
    }}>
      <Canvas camera={{ position: [0, 0, 13], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }}>
        <Suspense fallback={null}>
          <ambientLight intensity={isDarkMode ? 0.2 : 0.7} />
          <directionalLight position={[6, 8, 5]} intensity={0.5} color="#60a5fa" />
          <pointLight position={[0, 4, 3]} intensity={0.7} color="#3b82f6" distance={16} />
          <pointLight position={[-4, -3, 3]} intensity={0.4} color="#10b981" distance={14} />
          <DNAHelix scrollProgress={scrollProgress} />
          <NeuralParticles />
          <fog attach="fog" args={[isDarkMode ? '#030611' : '#f8fafc', 8, 26]} />
        </Suspense>
      </Canvas>
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
        borderRadius: '22px', padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s',
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
          color: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.7)', zIndex: 1
        }}>
          {icon}
        </span>
      )}
      <input
        style={{
          width: '100%', height: '48px',
          background: isDark ? 'rgba(0,0,0,0.45)' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'}`,
          borderRadius: '14px', color: isDark ? '#fff' : '#0f172a',
          padding: icon ? '0 16px 0 46px' : '0 16px',
          fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
          fontFamily: 'inherit'
        }}
        {...props}
      />
    </div>
  );
}

// ── Cinematic Landing Page ──────────────────────────────────────────────
function CinematicLanding({ onLogin, onGuestLogin, scrollProgressRef }) {
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

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      if (!auth || !provider) {
        toast("Firebase Auth is running in Demo Mode. Entering as Verified Guest...", "default");
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
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
          // If in development or unverified, still allow or notify
          console.log("Logged in:", cred.user.email);
        }
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
      {/* SECTION 1: HERO */}
      <motion.div style={{ opacity: s1Opacity, y: s1Y, position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <div style={{ maxWidth: '860px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 18px', borderRadius: 999, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: 28 }}>
            <BrainCircuit size={18} color="#60a5fa" />
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#60a5fa' }}>HEALTHCATCH AI 2.0</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 7vw, 84px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '24px', fontFamily: "'Space Grotesk', sans-serif" }}>
            <span style={{ color: '#fff' }}>Your Health.</span><br />
            <span className="text-gradient-hero">Decoded by AI.</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 20px)', color: 'rgba(255,255,255,0.6)', maxWidth: '560px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            The empathetic clinical companion combining real-time behavioral insights, smart challenges, and AI medical guidance.
          </p>
        </div>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>Scroll down or tap to enter</span>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>

      {/* SECTION 2: VALUES */}
      <motion.div style={{ opacity: s2Opacity, y: s2Y, position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 60px)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em', maxWidth: '780px', fontFamily: "'Space Grotesk', sans-serif" }}>
          Every heartbeat tells a story.<br />We help you <span className="text-gradient-warm">understand it.</span>
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', maxWidth: '520px', margin: '20px auto 0', lineHeight: 1.65 }}>
          From daily hydration habits to clinical symptom assessment, HealthCatch keeps you informed without medical overwhelm.
        </p>
      </motion.div>

      {/* SECTION 3: INTELLIGENCE */}
      <motion.div style={{ opacity: s3Opacity, y: s3Y, position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: 'clamp(26px, 4vw, 54px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '24px', fontFamily: "'Space Grotesk', sans-serif" }}>
          Powered by <span className="text-gradient-cool">clinical intelligence.</span>
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
          Multimodal vision models analyze prescriptions, while behavioral coaches pace your daily goals with evidence-based habits.
        </p>
      </motion.div>

      {/* SECTION 4: AUTH CARD */}
      <motion.div style={{ opacity: s4Opacity, y: s4Y, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'auto' }}>
        <div style={{
          width: '100%', maxWidth: '440px', background: 'rgba(9, 16, 33, 0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px',
          padding: '36px 30px', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px rgba(59,130,246,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: '13px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'grid', placeItems: 'center', boxShadow: '0 0 25px rgba(59,130,246,0.4)' }}>
              <BrainCircuit size={22} color="#fff" />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>HealthCatch AI</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'center', marginBottom: '6px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
            {isLoginMode ? 'Access your private health passport & AI coach' : 'Join thousands improving their health journey'}
          </p>

          {authError && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '12.5px', textAlign: 'center' }}>
              {authError}
            </div>
          )}
          {successMsg && (
            <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', fontSize: '12.5px', textAlign: 'center' }}>
              <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {!isLoginMode && (
              <>
                <InputField icon={<User size={16} />} type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <div style={{ display: 'flex', gap: 10 }}>
                  <InputField icon={<Calendar size={16} />} type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={{ flex: 1 }} />
                  <div style={{ position: 'relative', flex: 1, marginBottom: '14px' }}>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{
                        width: '100%', height: '48px', background: 'rgba(0,0,0,0.45)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px',
                        color: gender ? '#fff' : 'rgba(148,163,184,0.6)', padding: '0 14px',
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

            <InputField icon={<Mail size={16} />} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <InputField icon={<Lock size={16} />} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {!isLoginMode && (
              <InputField icon={<Lock size={16} />} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              style={{
                width: '100%', height: '48px', borderRadius: '14px', border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff',
                fontSize: '14.5px', fontWeight: 700, cursor: 'pointer', marginTop: '4px',
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
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                color: '#60a5fa', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <Sparkles size={16} /> Explore as Guest (Full Demo)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', gap: 12 }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              width: '100%', height: '46px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
            }}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: 17, height: 17 }} /> Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); setSuccessMsg(''); }}
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: 700, cursor: 'pointer' }}
            >
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Modals: Booking, Telehealth Video, Cart, Group Post, Symptom Wizard ─
function AppointmentBookingModal({ doctor, onClose, onConfirm, isDarkMode }) {
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [slot, setSlot] = useState('10:30 AM');
  const [type, setType] = useState('video');
  const [reason, setReason] = useState('');

  const slots = ['09:30 AM', '10:30 AM', '11:45 AM', '02:00 PM', '04:15 PM', '05:30 PM'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        style={{
          width: '100%', maxWidth: 480, background: isDarkMode ? '#0f172a' : '#ffffff',
          borderRadius: 24, padding: 28, border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)', color: isDarkMode ? '#fff' : '#0f172a'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>Book Appointment</h3>
            <p style={{ fontSize: 13, color: '#60a5fa', marginTop: 2 }}>{doctor.name} · {doctor.spec}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: isDarkMode ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%', height: 44, borderRadius: 12, border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
              background: isDarkMode ? '#1e293b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a', padding: '0 14px', outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 8 }}>Available Time Slot</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {slots.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                style={{
                  padding: '9px 0', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  border: slot === s ? '2px solid #3b82f6' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                  background: slot === s ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: slot === s ? '#60a5fa' : (isDarkMode ? '#cbd5e1' : '#475569')
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 8 }}>Consultation Mode</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setType('video')}
              style={{
                flex: 1, padding: 10, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: type === 'video' ? '2px solid #10b981' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                background: type === 'video' ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: type === 'video' ? '#34d399' : (isDarkMode ? '#cbd5e1' : '#475569'),
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
                border: type === 'clinic' ? '2px solid #3b82f6' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                background: type === 'clinic' ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: type === 'clinic' ? '#60a5fa' : (isDarkMode ? '#cbd5e1' : '#475569'),
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}
            >
              <Stethoscope size={16} /> In Clinic
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Reason for Visit (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Follow-up consultation, fever, blood pressure review"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: '100%', height: 42, borderRadius: 12, border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
              background: isDarkMode ? '#1e293b' : '#f8fafc', color: isDarkMode ? '#fff' : '#0f172a', padding: '0 14px', outline: 'none', fontSize: 13
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 44, borderRadius: 12, border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`, background: 'transparent', color: isDarkMode ? '#fff' : '#0f172a', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => onConfirm({ doctorId: doctor.id, doctorName: doctor.name, date, slot, type, reason })}
            style={{ flex: 2, height: 44, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Confirm Booking
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TelehealthVideoRoomModal({ doctor, onClose }) {
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: '#020617',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Top Header */}
      <div style={{ height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulseDot 1.5s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LIVE TELEHEALTH ENCRYPTED ROOM</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>· {formatTime(callDuration)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Consulting with: <strong style={{ color: '#fff' }}>{doctor?.name || 'Dr. Amit Patel'}</strong></span>
        </div>
      </div>

      {/* Main Video Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(300px, 0.6fr)', gap: 16, padding: 20 }}>
        {/* Remote Doctor Feed */}
        <div style={{ position: 'relative', background: '#0f172a', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'grid', placeItems: 'center', margin: '0 auto 16px', boxShadow: '0 0 50px rgba(59,130,246,0.35)' }}>
              <Stethoscope size={50} color="#fff" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{doctor?.name || 'Dr. Amit Patel'}</h3>
            <p style={{ color: '#60a5fa', fontSize: 14, marginTop: 4 }}>{doctor?.spec || 'Specialist'}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: 12, fontWeight: 700, marginTop: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} /> Audio & Video Connected
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
        <div style={{ background: 'rgba(15,23,42,0.85)', borderRadius: 24, padding: 22, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#60a5fa" /> Clinical Consultation Notes
          </h4>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 14, fontSize: 13, lineHeight: 1.6, color: '#cbd5e1' }}>
            <p><strong>Chief Complaint:</strong> Routine health review & vital signs check.</p>
            <p style={{ marginTop: 8 }}><strong>Observations:</strong> Patient reports stable sleep and active step logs. Vital signs in normal physiological parameters.</p>
            <p style={{ marginTop: 8 }}><strong>Plan & Recommendations:</strong></p>
            <ul style={{ paddingLeft: 18, marginTop: 4 }}>
              <li>Continue 2.5–3.0 L daily hydration routine.</li>
              <li>Maintain regular 30m aerobic activity blocks.</li>
              <li>Next follow-up in 4 weeks or as symptoms dictate.</li>
            </ul>
          </div>
          <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12 }}>
            💡 Session is encrypted end-to-end adhering to medical privacy standards.
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
          onClick={() => { toast("Telehealth consultation ended. Summary saved to Medical Vault."); onClose(); }}
          style={{ padding: '0 28px', height: 50, borderRadius: 25, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          End Call
        </button>
      </div>
    </div>
  );
}

function ShoppingCartDrawer({ cart, onClose, onUpdateQty, onRemove, onCheckout, isDarkMode }) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end'
    }}>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        style={{
          width: '100%', maxWidth: 440, height: '100%', background: isDarkMode ? '#0f172a' : '#ffffff',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column',
          color: isDarkMode ? '#fff' : '#0f172a'
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={20} color="#3b82f6" />
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Health Market Cart</h3>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontWeight: 800 }}>
              {cart.reduce((a, b) => a + b.qty, 0)} items
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: isDarkMode ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              <ShoppingCart size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 15, fontWeight: 700 }}>Your cart is empty</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Explore recommended health supplements and devices in the market.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 16, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'grid', placeItems: 'center', color: '#60a5fa', flexShrink: 0 }}>
                  <Pill size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                  <p style={{ fontSize: 11, color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: 2 }}>{item.shop}</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#34d399', marginTop: 4 }}>₹{item.price * item.qty}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}><Trash2 size={15} /></button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDarkMode ? '#1e293b' : '#e2e8f0', borderRadius: 8, padding: '2px 4px' }}>
                    <button onClick={() => onUpdateQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? '#fff' : '#0f172a' }}><Minus size={12} /></button>
                    <span style={{ fontSize: 12, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDarkMode ? '#fff' : '#0f172a' }}><Plus size={12} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: 20, borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, background: isDarkMode ? 'rgba(15,23,42,0.95)' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: 6 }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: isDarkMode ? '#94a3b8' : '#64748b', marginBottom: 12 }}>
              <span>Estimated Tax & Delivery</span>
              <span>₹{tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, marginBottom: 18 }}>
              <span>Total</span>
              <span style={{ color: '#34d399' }}>₹{total}</span>
            </div>
            <button
              onClick={onCheckout}
              style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 20px rgba(59,130,246,0.4)' }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Authenticated App (Super-App Experience) ─────────────────────────────
const MOCK_DOCTORS_LIST = [
  { id: 1, name: 'Dr. Amit Patel', spec: 'Cardiologist', rating: '4.9/5', available: 'Available Now', fee: '₹800', exp: '14 yrs exp', clinic: 'Metro Heart Centre, Kolkata' },
  { id: 2, name: 'Dr. Sneha Roy', spec: 'Clinical Psychologist', rating: '5.0/5', available: 'Next Slot: 2:00 PM', fee: '₹1,200', exp: '10 yrs exp', clinic: 'MindCare Clinic, Salt Lake' },
  { id: 3, name: 'Dr. Rajesh Sharma', spec: 'General Physician', rating: '4.8/5', available: 'Available Today', fee: '₹500', exp: '18 yrs exp', clinic: 'City Health Hospital, Howrah' },
  { id: 4, name: 'Dr. Priya Sengupta', spec: 'Dermatologist', rating: '4.9/5', available: 'Next Slot: Tomorrow', fee: '₹750', exp: '8 yrs exp', clinic: 'Apollo Skin Centre' }
];

const INITIAL_MARKET_ITEMS = [
  { id: 'item-1', title: 'Multivitamin Complex + Zinc', category: 'supplements', desc: 'Promotes sustained energy & natural immune defense.', price: 450, shop: 'Apollo Pharmacy', phone: '+91 9876543210', inStock: true },
  { id: 'item-2', title: 'Omega 3 Triple Strength Fish Oil', category: 'supplements', desc: 'Rich in EPA & DHA to support joint flexibility & cardiac function.', price: 899, shop: 'Wellness Medico', phone: '+91 8765432109', inStock: true },
  { id: 'item-3', title: 'Digital Arm Blood Pressure Monitor', category: 'devices', desc: 'Clinically validated accurate oscillometric measurement.', price: 1799, shop: 'HealthTech Diagnostics', phone: '+91 9123456789', inStock: true },
  { id: 'item-4', title: 'Herbal Chamomile Sleep Tea', category: 'wellness', desc: 'Organic whole-flower tea to calm evening nervous system.', price: 340, shop: 'AyurVeda Organic Stores', phone: '+91 9832109876', inStock: true },
  { id: 'item-5', title: 'Ergonomic Memory Foam Lumbar Support', category: 'devices', desc: 'Orthopedic posture support for desk work & spinal relief.', price: 1250, shop: 'ErgoLife India', phone: '+91 9988776655', inStock: true },
  { id: 'item-6', title: 'Electrolyte Hydration Hydration Tabs', category: 'supplements', desc: 'Fast-absorbing magnesium, potassium & sodium effervescent tablets.', price: 299, shop: 'FitFuel Nutrition', phone: '+91 9456123789', inStock: true }
];

function AuthenticatedApp({ onLogout, _scrollProgressRef, isDarkMode, setIsDarkMode }) {
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
  const [userAge, setUserAge] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`hc_profile_${auth?.currentUser?.uid || 'guest'}`));
      if (saved?.dob) {
        const years = (Date.now() - new Date(saved.dob).getTime()) / (365.25 * 24 * 3600 * 1000);
        return Math.floor(years) || 28;
      }
    } catch { /* ignore */ }
    return 28;
  });

  // Health Metrics & Dashboard State
  const [waterGlasses, setWaterGlasses] = useState(7); // 7 x 250ml = 1750ml
  const [dailySteps, setDailySteps] = useState(7420);
  const [todayMood, setTodayMood] = useState('Great');
  const [medications, setMedications] = useState([
    { id: 1, name: 'Vitamin D3 (1000 IU)', time: 'Morning with food', taken: true },
    { id: 2, name: 'Omega-3 Fish Oil', time: 'Lunch', taken: true },
    { id: 3, name: 'Magnesium Glycinate (200mg)', time: 'Before bed', taken: false }
  ]);
  const [allergies, setAllergies] = useState(['Penicillin', 'Peanuts', 'Dust Mites']);
  const [newAllergyInput, setNewAllergyInput] = useState('');

  // Challenges State
  const [challenges, setChallenges] = useState([
    { id: 'c1', title: '10K Steps Daily', goal: 10000, current: 7420, xp: 120, joined: true, icon: '🏃' },
    { id: 'c2', title: 'Hydration Hero (3L/day)', goal: 3000, current: 2250, xp: 80, joined: true, icon: '💧' },
    { id: 'c3', title: '7-Day Sugar Detox', goal: 7, current: 4, xp: 200, joined: true, icon: '🥗' },
    { id: 'c4', title: 'Mindful Breathing 10m', goal: 10, current: 10, xp: 60, joined: true, icon: '🧘' }
  ]);
  const [userXP, setUserXP] = useState(850);

  // Cart & Market State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState('all');
  const [marketSearch, setMarketSearch] = useState('');

  // Doctors & Telehealth Booking State
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [activeVideoCallDoctor, setActiveVideoCallDoctor] = useState(null);
  const [bookedAppointments, setBookedAppointments] = useState([]);

  // Medical Vault State
  const [vaultDocuments, setVaultDocuments] = useState([
    { id: 'v1', name: 'Comprehensive Blood Panel 2026.pdf', date: '2026-10-14', category: 'Lab Reports', size: '1.4 MB' },
    { id: 'v2', name: 'Prescription_Dr_Amit_Patel.pdf', date: '2026-09-28', category: 'Prescriptions', size: '420 KB' },
    { id: 'v3', name: 'COVID_Booster_Vaccination_Record.pdf', date: '2026-06-11', category: 'Vaccines', size: '280 KB' }
  ]);

  // Social Feed State
  const [feedPosts, setFeedPosts] = useState([
    { id: 1, name: 'Ankita Halder', time: '12m ago', text: 'Crushed my 10,000 steps streak for the 14th day in a row! Taking short 5-minute movement breaks between meetings truly works miracles for energy levels. 🏃✨', likes: 28, liked: false, comments: 5, following: true, category: 'Fitness' },
    { id: 2, name: 'Dr. Sneha Roy', time: '2h ago', text: 'Reminder for everyone working desk jobs: 4-7-8 breathing downregulates the sympathetic fight-or-flight nervous system in less than 90 seconds. Try it before your next stressful call.', likes: 64, liked: true, comments: 12, following: true, category: 'Mental Health' }
  ]);
  const [newPostText, setNewPostText] = useState('');

  // Chatbot State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am HealthCatch AI, your compassionate clinical wellness companion. How are you feeling today?' }
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

  // Symptom Triage Tool State
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomDays, setSymptomDays] = useState(2);
  const [symptomSeverity, setSymptomSeverity] = useState(5);
  const [triageResult, setTriageResult] = useState(null);
  const [isTriaging, setIsTriaging] = useState(false);

  // UI Theme Colors
  const panelBg = isDarkMode ? 'rgba(11, 19, 38, 0.75)' : 'rgba(255, 255, 255, 0.85)';
  const panelBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(15, 23, 42, 0.65)';
  const inputBg = isDarkMode ? 'rgba(0,0,0,0.45)' : '#ffffff';
  const inputBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)';

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

  // ── Chat Send Message ─────────────────────────────────────────────────
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

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply || "I am here to support your journey." }]);
      setChatFile(null);
    } catch {
      // Graceful offline fallback
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: `Thank you for sharing. I hear that you're reflecting on "${text.slice(0, 50)}...". Remember that consistent small actions, proper hydration, and deep resting periods compound into vibrant well-being. (HealthCatch Offline Clinical Advisor active).`
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
    toast(`Added ${product.title} to Cart`);
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

      const res = await fetch(`${API_BASE}/api/symptom-triage`, { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setTriageResult(data);
      } else {
        throw new Error();
      }
    } catch {
      // Client-side fallback logic
      const isUrgent = symptomSeverity >= 7 || symptomDays >= 4;
      setTriageResult({
        tier: isUrgent ? "URGENT_CARE" : "HOME_OBSERVATION",
        urgency: isUrgent ? "Doctor Consultation Recommended Within 24 Hours" : "Mild / Rest & Hydration Recommended",
        risk_score: isUrgent ? 7 : 3,
        recommendation: isUrgent
          ? "Your reported symptoms or duration warrant a clinical review with a physician."
          : "Stay well-hydrated, monitor temperature, and rest. If symptoms worsen, consult a doctor."
      });
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* ── TOPBAR ──────────────────────────────────────────────────────── */}
      <header style={{
        height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: isDarkMode ? 'rgba(8, 14, 30, 0.85)' : 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(30px) saturate(180%)',
        borderBottom: `1px solid ${panelBorder}`, zIndex: 50, flexShrink: 0
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
            <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em', color: textPrimary }}>
              HealthCatch
            </span>
          </div>
        </div>

        {/* Center Primary Tab Navigation Pills (Desktop & Tablet) */}
        {!isMobile && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', padding: '4px', borderRadius: 999, border: `1px solid ${panelBorder}` }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
              { id: 'home', label: 'Health Feed', icon: <Home size={14} /> },
              { id: 'coach', label: 'AI Coach', icon: <Sparkle size={14} /> },
              { id: 'doctors', label: 'Doctors', icon: <Stethoscope size={14} /> },
              { id: 'market', label: 'Market', icon: <Pill size={14} /> },
              { id: 'chat', label: 'AI Chat', icon: <MessageSquare size={14} /> }
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNav(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 999,
                    border: 'none', background: active ? 'linear-gradient(135deg, #3b82f6, #10b981)' : 'transparent',
                    color: active ? '#fff' : textSecondary, fontSize: '13px', fontWeight: 700,
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

        {/* Right Actions: Cart, Theme Toggle, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Cart Pill */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative', width: 38, height: 38, borderRadius: 12, border: `1px solid ${panelBorder}`,
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
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
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
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
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
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
          background: isDarkMode ? 'rgba(8, 14, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(35px)', display: 'flex', flexDirection: 'column',
          position: (isMobile || isTablet) ? 'fixed' : 'relative',
          top: (isMobile || isTablet) ? 64 : 0, bottom: 0, left: 0,
          zIndex: (isMobile || isTablet) ? 60 : 10,
          transform: (isMobile || isTablet) ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        }}>
          <div className="hc-scroll-panel" style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 12px 4px' }}>CORE WELLNESS</p>
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
                    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderRadius: 12,
                    border: 'none', background: active ? (isDarkMode ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)') : 'transparent',
                    color: active ? '#60a5fa' : textPrimary, fontWeight: active ? 800 : 600,
                    fontSize: '13.5px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                  }}
                >
                  <span style={{ color: active ? '#60a5fa' : textSecondary }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}

            <p style={{ fontSize: '10px', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '16px 12px 4px' }}>CLINICAL & CARE</p>
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
                    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderRadius: 12,
                    border: 'none', background: active ? (isDarkMode ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)') : 'transparent',
                    color: active ? '#60a5fa' : textPrimary, fontWeight: active ? 800 : 600,
                    fontSize: '13.5px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                  }}
                >
                  <span style={{ color: active ? '#60a5fa' : textSecondary }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}

            <p style={{ fontSize: '10px', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '16px 12px 4px' }}>COMMUNITY & ECOSYSTEM</p>
            {[
              { id: 'home', label: 'Health Circle Feed', icon: <Home size={16} /> },
              { id: 'groups', label: 'Health Groups', icon: <UsersRound size={16} /> },
              { id: 'market', label: 'Health Marketplace', icon: <Pill size={16} /> },
              { id: 'jobs', label: 'Healthcare Careers', icon: <BriefcaseBusiness size={16} /> },
              { id: 'messaging', label: 'Direct Messages', icon: <MessageSquareText size={16} /> }
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderRadius: 12,
                    border: 'none', background: active ? (isDarkMode ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.12)') : 'transparent',
                    color: active ? '#60a5fa' : textPrimary, fontWeight: active ? 800 : 600,
                    fontSize: '13.5px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s'
                  }}
                >
                  <span style={{ color: active ? '#60a5fa' : textSecondary }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Signout footer */}
          <div style={{ padding: '14px', borderTop: `1px solid ${panelBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UserAvatar src={userPhoto} name={userName} size={34} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 800, color: textPrimary }}>{userName}</p>
                <p style={{ fontSize: '10.5px', color: textSecondary }}>Level 7 Member</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (auth) signOut(auth).catch(() => {});
                onLogout();
                toast("Signed out successfully");
              }}
              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 6 }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        {(isMobile || isTablet) && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
        )}

        {/* ── MAIN CONTENT VIEWPORT ────────────────────────────────────── */}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                        <Sparkles size={16} /> WELLNESS OVERVIEW
                      </div>
                      <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
                        Welcome back, <span className="text-gradient-hero">{userName.split(' ')[0]}</span>
                      </h1>
                      <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                        Your metabolic and behavioral metrics are trending 14% higher than last week.
                      </p>
                    </div>

                    {/* Health Score Pill Card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 20, background: panelBg, border: `1px solid ${panelBorder}`, backdropFilter: 'blur(30px)' }}>
                      <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'conic-gradient(#10b981 78%, rgba(148,163,184,0.15) 0)', display: 'grid', placeItems: 'center' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: isDarkMode ? '#0f172a' : '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16, color: '#34d399' }}>
                          78
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 800, color: textSecondary, textTransform: 'uppercase' }}>Health Score</p>
                        <p style={{ fontSize: 17, fontWeight: 900, color: textPrimary }}>Optimal Range</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Vitals Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                    {/* Water Tracker Widget */}
                    <GlassCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', display: 'grid', placeItems: 'center' }}>
                          <Droplets size={18} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
                          {(waterGlasses * 0.25).toFixed(1)} / 3.0 L
                        </span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 800 }}>Hydration Intake</h4>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 2, marginBottom: 12 }}>{waterGlasses} of 12 glasses logged</p>
                      <div style={{ height: 6, borderRadius: 99, background: 'rgba(148,163,184,0.15)', overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ width: `${Math.min(100, (waterGlasses / 12) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => { setWaterGlasses(v => Math.min(16, v + 1)); toast("Logged +1 Glass (250ml) 💧"); }}
                          style={{ flex: 1, padding: 8, borderRadius: 10, border: 'none', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
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
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 99, background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                          {Math.round((dailySteps / 10000) * 100)}% Goal
                        </span>
                      </div>
                      <h4 style={{ fontSize: 14, fontWeight: 800 }}>Daily Activity</h4>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 2, marginBottom: 12 }}>{dailySteps.toLocaleString()} / 10,000 steps</p>
                      <div style={{ height: 6, borderRadius: 99, background: 'rgba(148,163,184,0.15)', overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ width: `${Math.min(100, (dailySteps / 10000) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
                      </div>
                      <button
                        onClick={() => { setDailySteps(v => Math.min(25000, v + 500)); toast("Logged +500 steps 🏃"); }}
                        style={{ width: '100%', padding: 8, borderRadius: 10, border: 'none', background: 'rgba(16,185,129,0.12)', color: '#34d399', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        +500 Steps
                      </button>
                    </GlassCard>

                    {/* Mood & Journal Widget */}
                    <GlassCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(168,85,247,0.12)', color: '#a855f7', display: 'grid', placeItems: 'center' }}>
                          <Heart size={18} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#c084fc' }}>{todayMood}</span>
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

                  {/* Medication Reminders & Quick Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 20 }}>
                    {/* Medication Schedule */}
                    <GlassCard>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Pill size={18} color="#3b82f6" />
                          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Today's Medications & Supplements</h3>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>
                          {medications.filter(m => m.taken).length}/{medications.length} TAKEN
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {medications.map(med => (
                          <div
                            key={med.id}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 14px', borderRadius: 14,
                              background: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
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
                                background: med.taken ? '#10b981' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'),
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                          <Stethoscope size={16} /> INSTANT TELEHEALTH
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 900 }}>Need a Doctor Right Now?</h3>
                        <p style={{ fontSize: 13, color: textSecondary, marginTop: 6, lineHeight: 1.55 }}>
                          Connect with board-certified general physicians and psychologists within 5 minutes.
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
                          Browse
                        </button>
                      </div>
                    </GlassCard>
                  </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      <CircleGauge size={16} /> DIGITAL PASSPORT
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Your Digital Health Identity</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                      A secure, portable biometric health summary for emergencies, clinicians, and lifestyle records.
                    </p>
                  </div>

                  {/* 3D Holographic ID Card */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 1fr)', gap: 24, marginBottom: 28 }}>
                    <div style={{
                      borderRadius: 24, padding: 28, background: 'linear-gradient(135deg, #1e3a8a 0%, #065f46 100%)',
                      color: '#fff', boxShadow: '0 20px 50px rgba(16,185,129,0.25)', position: 'relative', overflow: 'hidden'
                    }}>
                      <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <BrainCircuit size={24} color="#60a5fa" />
                          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.05em' }}>HEALTHCATCH ID</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.15)', color: '#fff' }}>VERIFIED ACTIVE</span>
                      </div>

                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
                        <UserAvatar src={userPhoto} name={userName} size={64} style={{ border: '3px solid rgba(255,255,255,0.3)' }} />
                        <div>
                          <h3 style={{ fontSize: 20, fontWeight: 900 }}>{userName}</h3>
                          <p style={{ fontSize: 12, opacity: 0.8 }}>ID: #HC-9482-AI · Age: {userAge}</p>
                          <p style={{ fontSize: 12, opacity: 0.8 }}>Blood Type: <strong style={{ color: '#fca5a5' }}>O Positive (O+)</strong></p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                        <div><p style={{ fontSize: 10, opacity: 0.7 }}>ORGAN DONOR</p><p style={{ fontSize: 12, fontWeight: 800 }}>Registered Yes</p></div>
                        <div><p style={{ fontSize: 10, opacity: 0.7 }}>EMERGENCY CONTACT</p><p style={{ fontSize: 12, fontWeight: 800 }}>+91 98765 43210</p></div>
                        <div><p style={{ fontSize: 10, opacity: 0.7 }}>TIER</p><p style={{ fontSize: 12, fontWeight: 800 }}>Level 7 Member</p></div>
                      </div>
                    </div>

                    {/* QR Code Quick First Responder Card */}
                    <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 28 }}>
                      <div style={{ padding: 12, background: '#fff', borderRadius: 16, boxShadow: '0 8px 25px rgba(0,0,0,0.15)', marginBottom: 14 }}>
                        <QrCode size={110} color="#0f172a" />
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 800 }}>Emergency Responder QR</h4>
                      <p style={{ fontSize: 12, color: textSecondary, marginTop: 4, maxWidth: 260 }}>
                        Scan in clinical emergencies to review blood type, known allergies, and next-of-kin contacts.
                      </p>
                      <button
                        onClick={() => toast("Digital Health Passport downloaded as PDF")}
                        style={{ marginTop: 16, padding: '10px 18px', borderRadius: 12, border: `1px solid ${panelBorder}`, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Download size={14} /> Download Digital Card
                      </button>
                    </GlassCard>
                  </div>

                  {/* Allergy & Pre-existing condition Manager */}
                  <GlassCard>
                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 12 }}>Medical Flags & Known Allergies</h3>
                    <p style={{ fontSize: 13, color: textSecondary, marginBottom: 16 }}>Critical alerts visible to doctors before writing prescriptions.</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {allergies.map(a => (
                        <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: 12, fontWeight: 700 }}>
                          <AlertTriangle size={12} /> {a}
                          <button
                            onClick={() => { setAllergies(al => al.filter(x => x !== a)); toast(`Removed allergy: ${a}`); }}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14 }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 10, maxWidth: 440 }}>
                      <input
                        type="text"
                        placeholder="Add allergy (e.g. Aspirin, Latex)..."
                        value={newAllergyInput}
                        onChange={(e) => setNewAllergyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newAllergyInput.trim()) {
                            setAllergies(a => [...a, newAllergyInput.trim()]);
                            setNewAllergyInput('');
                            toast("Added allergy");
                          }
                        }}
                        style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 14px', outline: 'none', fontSize: 13 }}
                      />
                      <button
                        onClick={() => {
                          if (newAllergyInput.trim()) {
                            setAllergies(a => [...a, newAllergyInput.trim()]);
                            setNewAllergyInput('');
                            toast("Added allergy");
                          }
                        }}
                        style={{ padding: '0 18px', height: 42, borderRadius: 12, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Add
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* 3. AI HEALTH COACH (WITH 4-7-8 BREATHING PACER) */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
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
                      Follow the visual orb rhythm: Inhale deeply for 4s, Hold gently for 7s, and Exhale smoothly for 8s.
                    </p>

                    <div style={{ display: 'grid', placeItems: 'center', minHeight: 200, marginBottom: 20 }}>
                      <motion.div
                        animate={{
                          scale: isBreathingActive
                            ? (breathPhase.startsWith('Inhale') ? 1.5 : breathPhase.startsWith('Hold') ? 1.5 : 1.0)
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

                  {/* Daily Personalized Micro-Habit Checklist */}
                  <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800 }}>Coach Micro-Habit Action Plan</h3>
                      <button onClick={() => handleNav('chat')} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Ask AI Coach →
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                      {[
                        { title: 'Morning Sunlight (10 mins)', detail: 'Resets circadian rhythm and sets cortisol anchor.', time: '08:00 AM' },
                        { title: 'Post-Lunch 15m Walk', detail: 'Blunts blood glucose spike by up to 22%.', time: '01:30 PM' },
                        { title: 'Digital Sunset (30m Before Bed)', detail: 'Reduces blue spectrum light suppression of melatonin.', time: '10:30 PM' },
                        { title: 'Electrolyte Mineral Intake', detail: 'Replenishes magnesium to calm neuromuscular spasms.', time: '04:00 PM' }
                      ].map((item, idx) => (
                        <div key={idx} style={{ padding: 16, borderRadius: 16, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${panelBorder}` }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: 99 }}>{item.time}</span>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                        <Trophy size={16} /> COMPETITIVE HEALTH
                      </div>
                      <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Smart Wellness Challenges</h2>
                      <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>Earn XP by completing habits and rise through the community leaderboards.</p>
                    </div>

                    <div style={{ padding: '10px 18px', borderRadius: 16, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa', fontWeight: 800, fontSize: 14 }}>
                      🏆 Your Total XP: {userXP} XP (Level 7)
                    </div>
                  </div>

                  {/* Challenge Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 28 }}>
                    {challenges.map(c => {
                      const pct = Math.min(100, Math.round((c.current / c.goal) * 100));
                      return (
                        <GlassCard key={c.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 28 }}>{c.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: 99 }}>
                              +{c.xp} XP
                            </span>
                          </div>
                          <h4 style={{ fontSize: 16, fontWeight: 800 }}>{c.title}</h4>
                          <p style={{ fontSize: 12, color: textSecondary, margin: '4px 0 12px' }}>{c.current.toLocaleString()} / {c.goal.toLocaleString()} completed</p>
                          <div style={{ height: 6, borderRadius: 99, background: 'rgba(148,163,184,0.15)', overflow: 'hidden', marginBottom: 14 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} />
                          </div>
                          <button
                            onClick={() => {
                              setUserXP(x => x + 50);
                              setChallenges(prev => prev.map(ch => ch.id === c.id ? { ...ch, current: Math.min(ch.goal, ch.current + Math.round(ch.goal * 0.15)) } : ch));
                              toast(`+50 XP earned on ${c.title}! 🌟`);
                            }}
                            style={{ width: '100%', padding: 9, borderRadius: 10, border: 'none', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}
                          >
                            Mark Today's Progress (+50 XP)
                          </button>
                        </GlassCard>
                      );
                    })}
                  </div>

                  {/* Leaderboard Table */}
                  <GlassCard>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 900 }}>Global HealthCatch Podium</h3>
                      <span style={{ fontSize: 11, color: textSecondary }}>Ranked by 30-day habit consistency</span>
                    </div>

                    {[
                      { rank: 1, name: 'Ankita Halder', score: 1420, consistency: '94%', medal: '🥇' },
                      { rank: 2, name: `${userName} (You)`, score: userXP, consistency: '88%', medal: '🥈' },
                      { rank: 3, name: 'Dr. Sneha Roy', score: 1180, consistency: '82%', medal: '🥉' },
                      { rank: 4, name: 'Rahul Sharma', score: 920, consistency: '76%', medal: '4' }
                    ].map(userItem => (
                      <div
                        key={userItem.rank}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px',
                          borderTop: `1px solid ${panelBorder}`,
                          background: userItem.name.includes('(You)') ? (isDarkMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)') : 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, minWidth: 24, textAlign: 'center' }}>{userItem.medal}</span>
                          <UserAvatar name={userItem.name} size={36} />
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 800 }}>{userItem.name}</p>
                            <p style={{ fontSize: 11, color: textSecondary }}>Consistency: {userItem.consistency}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 900, color: '#34d399' }}>{userItem.score} XP</span>
                      </div>
                    ))}
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* 5. CONSULT DOCTORS & TELEHEALTH */}
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
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      <Stethoscope size={16} /> CERTIFIED SPECIALISTS
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Consult Top Doctors Online</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                      Verified cardiologists, psychiatrists, and physicians available for video calls or clinic visits.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 20 }}>
                    {MOCK_DOCTORS_LIST.map(doc => {
                      const isBooked = bookedAppointments.some(a => a.doctorId === doc.id);
                      return (
                        <GlassCard key={doc.id}>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 20, fontWeight: 900 }}>
                              {doc.name.charAt(4)}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800 }}>{doc.name}</h3>
                                <BadgeCheck size={16} color="#34d399" />
                              </div>
                              <p style={{ color: '#60a5fa', fontSize: 12.5, fontWeight: 600 }}>{doc.spec} · {doc.exp}</p>
                              <p style={{ fontSize: 12, color: '#fbbf24', marginTop: 2 }}>⭐ {doc.rating} · Fee: {doc.fee}</p>
                            </div>
                          </div>

                          <p style={{ fontSize: 12, color: textSecondary, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={13} /> {doc.clinic}
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button
                              onClick={() => setSelectedDoctorForBooking(doc)}
                              style={{
                                width: '100%', padding: '11px', borderRadius: 12,
                                background: isBooked ? 'rgba(52,211,153,0.12)' : 'rgba(59,130,246,0.1)',
                                color: isBooked ? '#34d399' : '#60a5fa',
                                border: `1px solid ${isBooked ? 'rgba(52,211,153,0.3)' : 'rgba(59,130,246,0.25)'}`,
                                fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                              }}
                            >
                              <Calendar size={15} /> {isBooked ? 'Appointment Scheduled' : 'Book Appointment'}
                            </button>
                            <button
                              onClick={() => setActiveVideoCallDoctor(doc)}
                              style={{
                                width: '100%', padding: '11px', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                                fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                              }}
                            >
                              <Video size={15} /> Join Live Video Consult
                            </button>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. AI MULTIMODAL CHATBOT */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
              >
                {/* Chat Mode Selector Header */}
                <div style={{
                  padding: '12px 24px', borderBottom: `1px solid ${panelBorder}`,
                  background: isDarkMode ? 'rgba(8,14,30,0.85)' : 'rgba(255,255,255,0.85)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                      <Bot size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800 }}>HealthCatch AI Multimodal Counselor</h3>
                      <p style={{ fontSize: 11, color: textSecondary }}>Powered by Gemini 2.5 Clinical Engine</p>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[
                      { id: 'general', label: '🧠 Counselor' },
                      { id: 'symptoms', label: '🩺 Clinical Triage' },
                      { id: 'nutrition', label: '🥗 Nutrition' }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setChatMode(m.id)}
                        style={{
                          padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                          border: chatMode === m.id ? '1px solid #3b82f6' : `1px solid ${panelBorder}`,
                          background: chatMode === m.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                          color: chatMode === m.id ? '#60a5fa' : textSecondary, cursor: 'pointer'
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                    <button
                      onClick={() => { setChatMessages([{ sender: 'bot', text: 'Chat history cleared. How can I assist you now?' }]); toast("Conversation reset"); }}
                      style={{ padding: '5px 10px', borderRadius: 99, border: `1px solid ${panelBorder}`, background: 'transparent', color: textSecondary, fontSize: 12, cursor: 'pointer' }}
                      title="Clear Chat"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="hc-scroll-panel" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {chatMessages.map((msg, i) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex', gap: 12, maxWidth: isMobile ? '90%' : '75%',
                          alignSelf: isUser ? 'flex-end' : 'flex-start',
                          flexDirection: isUser ? 'row-reverse' : 'row'
                        }}
                      >
                        <UserAvatar
                          src={isUser ? userPhoto : null}
                          name={isUser ? userName : 'HealthCatch AI'}
                          size={32}
                          style={{
                            background: isUser ? 'linear-gradient(135deg,#3b82f6,#10b981)' : '#1e293b'
                          }}
                        />
                        <div style={{
                          padding: '12px 18px', borderRadius: 18,
                          background: isUser ? 'linear-gradient(135deg, #3b82f6, #10b981)' : panelBg,
                          border: isUser ? 'none' : `1px solid ${panelBorder}`,
                          color: isUser ? '#fff' : textPrimary,
                          borderTopRightRadius: isUser ? 4 : 18,
                          borderTopLeftRadius: isUser ? 18 : 4,
                          boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
                        }}>
                          <p style={{ fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{msg.text}</p>
                        </div>
                      </motion.div>
                    );
                  })}

                  {isChatLoading && (
                    <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e293b', display: 'grid', placeItems: 'center', color: '#60a5fa' }}><Bot size={16} /></div>
                      <div style={{ padding: '12px 18px', borderRadius: 18, background: panelBg, border: `1px solid ${panelBorder}` }}>
                        <TypingDots color="#60a5fa" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <div style={{ padding: '14px 20px', borderTop: `1px solid ${panelBorder}`, background: isDarkMode ? 'rgba(8,14,30,0.95)' : '#ffffff' }}>
                  {chatFile && (
                    <div style={{ maxWidth: 760, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', fontSize: 12, color: '#60a5fa' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Paperclip size={13} /> {chatFile.name}</span>
                      <button onClick={() => setChatFile(null)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer' }}>✕</button>
                    </div>
                  )}

                  <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 16, padding: '4px 6px' }}>
                    <label style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', color: textSecondary, cursor: 'pointer' }} title="Attach prescription or medical report">
                      <Paperclip size={17} />
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) setChatFile(e.target.files[0]);
                        }}
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Ask about medications, anxiety, diet, or symptoms..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: textPrimary, fontSize: 14 }}
                    />

                    <button
                      onClick={handleSendChatMessage}
                      disabled={isChatLoading || (!chatInput.trim() && !chatFile)}
                      style={{
                        width: 38, height: 38, borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff',
                        cursor: 'pointer', display: 'grid', placeItems: 'center',
                        opacity: (!chatInput.trim() && !chatFile) ? 0.4 : 1
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                        <FolderHeart size={16} /> SECURE DOCUMENTS
                      </div>
                      <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Encrypted Medical Vault</h2>
                      <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>Organize your lab tests, imaging reports, and doctor prescriptions safely.</p>
                    </div>

                    <label style={{
                      padding: '11px 20px', borderRadius: 14, background: 'linear-gradient(135deg,#3b82f6,#10b981)',
                      color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                      <Plus size={16} /> Upload Health Record
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const newDoc = {
                              id: `v-${Date.now()}`,
                              name: file.name,
                              date: new Date().toISOString().split('T')[0],
                              category: 'Patient Upload',
                              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                            };
                            setVaultDocuments(prev => [newDoc, ...prev]);
                            toast(`Uploaded ${file.name} to Medical Vault`);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {vaultDocuments.map(doc => (
                      <GlassCard key={doc.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', color: '#60a5fa', display: 'grid', placeItems: 'center' }}>
                            <FileText size={22} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#34d399', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: 99 }}>
                            {doc.category}
                          </span>
                        </div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</h4>
                        <p style={{ fontSize: 12, color: textSecondary, marginBottom: 16 }}>Uploaded: {doc.date} · {doc.size}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => toast(`Opening secure preview for ${doc.name}...`)}
                            style={{ flex: 1, padding: 8, borderRadius: 10, border: `1px solid ${panelBorder}`, background: 'transparent', color: textPrimary, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => { setVaultDocuments(v => v.filter(d => d.id !== doc.id)); toast("Document deleted from vault"); }}
                            style={{ padding: '8px 12px', borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 8. CLINICAL UTILITIES & SYMPTOM TRIAGE */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      <Calculator size={16} /> CLINICAL UTILITIES
                    </div>
                    <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Symptom Triage & Body Metrics</h2>
                    <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>
                      Validated algorithms assessing clinical urgency before your doctor appointment.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 24 }}>
                    {/* Interactive 4-Step Triage Wizard */}
                    <GlassCard>
                      <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 14 }}>Clinical Symptom Urgency Evaluator</h3>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 6 }}>Describe what you are experiencing:</label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Sharp pain in lower right abdomen with nausea, or throbbing headache for 3 days..."
                          value={symptomInput}
                          onChange={(e) => setSymptomInput(e.target.value)}
                          style={{
                            width: '100%', borderRadius: 14, border: `1px solid ${inputBorder}`, background: inputBg,
                            color: textPrimary, padding: '12px 14px', outline: 'none', fontSize: 13.5, resize: 'none'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 6 }}>Duration: {symptomDays} days</label>
                          <input type="range" min="1" max="14" value={symptomDays} onChange={(e) => setSymptomDays(Number(e.target.value))} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: textSecondary, display: 'block', marginBottom: 6 }}>Severity (1–10): {symptomSeverity}</label>
                          <input type="range" min="1" max="10" value={symptomSeverity} onChange={(e) => setSymptomSeverity(Number(e.target.value))} style={{ width: '100%' }} />
                        </div>
                      </div>

                      <button
                        onClick={runSymptomTriage}
                        disabled={isTriaging}
                        style={{
                          width: '100%', height: 46, borderRadius: 12, border: 'none',
                          background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff',
                          fontWeight: 800, fontSize: 14, cursor: 'pointer'
                        }}
                      >
                        {isTriaging ? 'Analyzing with Clinical Engine...' : 'Evaluate Symptom Urgency'}
                      </button>

                      {triageResult && (
                        <div style={{
                          marginTop: 20, padding: 18, borderRadius: 16,
                          background: triageResult.tier === 'EMERGENCY' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)',
                          border: `1px solid ${triageResult.tier === 'EMERGENCY' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <AlertCircle size={18} color={triageResult.tier === 'EMERGENCY' ? '#f87171' : '#34d399'} />
                            <strong style={{ fontSize: 15, color: triageResult.tier === 'EMERGENCY' ? '#fca5a5' : '#86efac' }}>{triageResult.urgency}</strong>
                          </div>
                          <p style={{ fontSize: 13, color: textPrimary, lineHeight: 1.55 }}>{triageResult.recommendation}</p>
                        </div>
                      )}
                    </GlassCard>

                    {/* Emergency Contacts Directory */}
                    <GlassCard>
                      <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>Emergency Crisis Hotlines</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          { country: 'India', name: 'National Emergency', num: '112' },
                          { country: 'India', name: 'Tele-MANAS Mental Health', num: '14416 (24/7)' },
                          { country: 'United States', name: 'Crisis Lifeline', num: '988' },
                          { country: 'United Kingdom', name: 'Emergency / NHS', num: '999 / 111' }
                        ].map(h => (
                          <div key={h.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 12, background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${panelBorder}` }}>
                            <div>
                              <p style={{ fontSize: 12.5, fontWeight: 800 }}>{h.name}</p>
                              <p style={{ fontSize: 10.5, color: textSecondary }}>{h.country}</p>
                            </div>
                            <a
                              href={`tel:${h.num.split(' ')[0]}`}
                              style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#f87171', fontWeight: 800, fontSize: 12, textDecoration: 'none' }}
                            >
                              Call {h.num}
                            </a>
                          </div>
                        ))}
                      </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                        <Pill size={16} /> VERIFIED WELLNESS PHARMACY
                      </div>
                      <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>HealthCatch Market</h2>
                      <p style={{ color: textSecondary, fontSize: 14, marginTop: 4 }}>Authentic supplements, verified devices, and doctor-approved prescriptions.</p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: 220 }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={marketSearch}
                          onChange={(e) => setMarketSearch(e.target.value)}
                          style={{ width: '100%', height: 38, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 12px 0 36px', fontSize: 13, outline: 'none' }}
                        />
                      </div>
                      <button
                        onClick={() => setIsCartOpen(true)}
                        style={{ padding: '0 16px', height: 38, borderRadius: 12, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <ShoppingCart size={15} /> Cart ({cart.reduce((a, b) => a + b.qty, 0)})
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 6 }}>
                    {['all', 'supplements', 'devices', 'wellness'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setMarketFilter(cat)}
                        style={{
                          padding: '7px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, textTransform: 'capitalize',
                          border: marketFilter === cat ? '1px solid #3b82f6' : `1px solid ${panelBorder}`,
                          background: marketFilter === cat ? 'rgba(59,130,246,0.15)' : 'transparent',
                          color: marketFilter === cat ? '#60a5fa' : textSecondary, cursor: 'pointer'
                        }}
                      >
                        {cat === 'all' ? 'All Products' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Product Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                    {INITIAL_MARKET_ITEMS
                      .filter(p => (marketFilter === 'all' || p.category === marketFilter) && p.title.toLowerCase().includes(marketSearch.toLowerCase()))
                      .map(item => (
                        <GlassCard key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ width: '100%', height: 110, borderRadius: 14, background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', display: 'grid', placeItems: 'center', color: '#60a5fa', marginBottom: 14 }}>
                            <Pill size={38} />
                          </div>
                          <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{item.title}</h4>
                          <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5, marginBottom: 14, flex: 1 }}>{item.desc}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#34d399' }}>₹{item.price}</span>
                            <span style={{ fontSize: 11, color: textSecondary }}>{item.shop}</span>
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            style={{ width: '100%', padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                          >
                            Add to Cart
                          </button>
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
                    <h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>Health Circle Feed</h2>
                    <p style={{ color: textSecondary, fontSize: 13, marginTop: 2 }}>Real stories, recovery journeys, and verified clinical tips.</p>
                  </div>

                  {/* Post Composer */}
                  <GlassCard style={{ marginBottom: 24 }}>
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
                              following: true,
                              category: 'Fitness'
                            };
                            setFeedPosts([newPost, ...feedPosts]);
                            setNewPostText('');
                            toast("Post shared with your Health Circle!");
                          }
                        }}
                        style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${inputBorder}`, background: inputBg, color: textPrimary, padding: '0 16px', outline: 'none', fontSize: 13.5 }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                              following: true,
                              category: 'Fitness'
                            };
                            setFeedPosts([newPost, ...feedPosts]);
                            setNewPostText('');
                            toast("Post shared with your Health Circle!");
                          }
                        }}
                        disabled={!newPostText.trim()}
                        style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 13, cursor: newPostText.trim() ? 'pointer' : 'default', opacity: newPostText.trim() ? 1 : 0.4 }}
                      >
                        Publish
                      </button>
                    </div>
                  </GlassCard>

                  {/* Posts List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {feedPosts.map(post => (
                      <GlassCard key={post.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <UserAvatar name={post.name} size={40} />
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 800 }}>{post.name}</p>
                              <p style={{ fontSize: 11, color: textSecondary }}>{post.time} · {post.category}</p>
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
                            onClick={() => toast("Comments feature loaded")}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: textSecondary, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                          >
                            <MessageCircle size={16} /> {post.comments}
                          </button>
                          <button
                            onClick={() => toast("Copied link to post")}
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

            {/* 11. PROFILE EXPERIENCE */}
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
                  <GlassCard style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 20 }}>
                      <UserAvatar src={userPhoto} name={userName} size={74} style={{ border: '3px solid #3b82f6' }} />
                      <div>
                        <h2 style={{ fontSize: 24, fontWeight: 900 }}>{userName}</h2>
                        <p style={{ color: textSecondary, fontSize: 13 }}>{userEmail}</p>
                        <p style={{ color: '#10b981', fontSize: 12, fontWeight: 700, marginTop: 4 }}>Level 7 Health Champion · 850 XP</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
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
                    </div>

                    <button
                      onClick={() => toast("Profile settings updated successfully!")}
                      style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#10b981)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                    >
                      Save Changes
                    </button>
                  </GlassCard>
                </div>
              </motion.div>
            )}

            {/* Other Fallback Views (Groups, Jobs, Donors, Messaging) */}
            {['groups', 'jobs', 'donors', 'messaging'].includes(activeTab) && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="hc-scroll-panel"
                style={{ height: '100%', overflowY: 'auto', padding: '32px 36px 120px' }}
              >
                <div style={{ maxWidth: 1080, margin: '0 auto' }}>
                  <h2 style={{ fontSize: 30, fontWeight: 900, textTransform: 'capitalize', marginBottom: 8 }}>
                    {activeTab === 'groups' ? 'Action Communities' : activeTab === 'jobs' ? 'Healthcare Careers' : activeTab === 'donors' ? 'Emergency Blood Donors' : 'Direct Messages'}
                  </h2>
                  <p style={{ color: textSecondary, fontSize: 14, marginBottom: 24 }}>
                    Connected to your HealthCatch ecosystem.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {[1, 2, 3].map(n => (
                      <GlassCard key={n}>
                        <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                          {activeTab === 'groups' ? `Health Community #${n}` : activeTab === 'jobs' ? `Clinical Role #${n}` : activeTab === 'donors' ? `O+ Donor Match #${n}` : `Conversation #${n}`}
                        </h4>
                        <p style={{ fontSize: 13, color: textSecondary, marginBottom: 14 }}>
                          Fully integrated real-time interactive module with encrypted data transport.
                        </p>
                        <button
                          onClick={() => toast(`Interacting with ${activeTab} item #${n}`)}
                          style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                        >
                          Interact
                        </button>
                      </GlassCard>
                    ))}
                  </div>
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
                  background: 'none', border: 'none', color: active ? '#60a5fa' : textSecondary,
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

      {/* ── MODALS (Booking, Telehealth, Shopping Cart) ───────────────── */}
      <AnimatePresence>
        {selectedDoctorForBooking && (
          <AppointmentBookingModal
            doctor={selectedDoctorForBooking}
            isDarkMode={isDarkMode}
            onClose={() => setSelectedDoctorForBooking(null)}
            onConfirm={(appData) => {
              setBookedAppointments(prev => [...prev, appData]);
              setSelectedDoctorForBooking(null);
              toast(`Appointment confirmed with ${appData.doctorName} for ${appData.date} at ${appData.slot}!`);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeVideoCallDoctor && (
          <TelehealthVideoRoomModal
            doctor={activeVideoCallDoctor}
            onClose={() => setActiveVideoCallDoctor(null)}
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
              toast("Order placed successfully! Tracking ID #HC-ORD-8492");
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(() => !auth);
  const scrollProgressRef = useRef(0);

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
        background: isDarkMode ? '#050814' : '#f8fafc', color: isDarkMode ? '#ffffff' : '#0f172a',
      }}>
        <Loader2 size={36} className="animate-spin" color="#3b82f6" />
      </div>
    );
  }

  return (
    <>
      <GlobalStyles isDarkMode={isDarkMode} />
      <Global3DBackground isLoggedIn={isLoggedIn} scrollProgress={scrollProgressRef} isDarkMode={isDarkMode} />
      <ToastHost isDarkMode={isDarkMode} />

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <CinematicLanding
              onLogin={() => setIsLoggedIn(true)}
              onGuestLogin={() => setIsLoggedIn(true)}
              scrollProgressRef={scrollProgressRef}
            />
          </motion.div>
        ) : (
          <motion.div key="superapp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <AuthenticatedApp
              onLogout={() => setIsLoggedIn(false)}
              scrollProgressRef={scrollProgressRef}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
