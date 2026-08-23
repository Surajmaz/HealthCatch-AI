import { auth, provider } from './firebase';
import {
  signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  sendEmailVerification, updateProfile, signOut
} from 'firebase/auth';
import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import * as THREE from 'three';
import {
  LayoutDashboard, MessageSquare, HeartPulse, Settings, Send, User, Bot, Loader2,
  LogOut, Search, Sun, Moon, Bell, Paperclip, Mail, Lock,
  Calendar, Users, CheckCircle, BrainCircuit, ChevronDown, Sparkles,
  Stethoscope, Video, ThumbsUp, MessageCircle, Share2, UserPlus, Image as ImageIcon, Camera, Home,
  HelpCircle, ShoppingBag, Target, FolderHeart, 
  Globe, Grid, AlertTriangle, Pill, Phone, Bookmark, CalendarHeart, HeartHandshake, Calculator,
  Activity, Trophy, ShieldCheck, BriefcaseBusiness, UserCheck, TrendingUp, Droplets, Footprints,
  Award, Target as TargetIcon, CircleGauge, Clock3, MapPin, BadgeCheck, Heart, Plus, ArrowUpRight,
  MessageSquareText, Dumbbell, Utensils, BedDouble, Sparkle, UsersRound, Stethoscope as StethoscopeIcon
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   §1  GLOBAL STYLES
   ═══════════════════════════════════════════════════════════════ */
const GlobalStyles = ({ isDarkMode }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html {
      scroll-behavior: smooth;
      overscroll-behavior-y: none;
    }
    html, body {
      overscroll-behavior: none;
    }
    body {
      background: ${isDarkMode ? '#000000' : '#f8fafc'};
      color: ${isDarkMode ? '#ffffff' : '#0f172a'};
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.5s ease, color 0.5s ease;
    }
    ::-webkit-scrollbar { width: 0px; background: transparent; }
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
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════
   §2  3D SCENE — DNA DOUBLE HELIX + NEURAL PARTICLES
   ═══════════════════════════════════════════════════════════════ */
function DNAHelix({ scrollProgress }) {
  const groupRef = useRef();
  const STRAND_COUNT = 80;
  const HELIX_HEIGHT = 12;
  const HELIX_RADIUS = 1.2;
  const TURNS = 3;

  const { strandA, strandB, rungs } = useMemo(() => {
    const a = [], b = [], r = [];
    for (let i = 0; i < STRAND_COUNT; i++) {
      const t = i / STRAND_COUNT;
      const angle = t * Math.PI * 2 * TURNS;
      const y = (t - 0.5) * HELIX_HEIGHT;

      a.push({ pos: [Math.cos(angle) * HELIX_RADIUS, y, Math.sin(angle) * HELIX_RADIUS], phase: t });
      b.push({ pos: [Math.cos(angle + Math.PI) * HELIX_RADIUS, y, Math.sin(angle + Math.PI) * HELIX_RADIUS], phase: t });

      if (i % 2 === 0) {
        r.push({
          start: [Math.cos(angle) * HELIX_RADIUS, y, Math.sin(angle) * HELIX_RADIUS],
          end: [Math.cos(angle + Math.PI) * HELIX_RADIUS, y, Math.sin(angle + Math.PI) * HELIX_RADIUS],
          phase: t,
        });
      }
    }
    return { strandA: a, strandB: b, rungs: r };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const sp = scrollProgress.current;
    groupRef.current.rotation.y = t * 0.15 + sp * Math.PI * 2;
    groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.1;
    const s = 1 + Math.sin(sp * Math.PI) * 0.15;
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {strandA.map((node, i) => <DNASphere key={`a-${i}`} position={node.pos} phase={node.phase} color="#3b82f6" emissive="#1d4ed8" />)}
      {strandB.map((node, i) => <DNASphere key={`b-${i}`} position={node.pos} phase={node.phase} color="#10b981" emissive="#047857" />)}
      {rungs.map((rung, i) => <DNARung key={`r-${i}`} start={rung.start} end={rung.end} phase={rung.phase} />)}
    </group>
  );
}

function DNASphere({ position, phase, color, emissive }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 2 + phase * 20) * 0.3;
    ref.current.scale.setScalar(pulse);
    ref.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 3 + phase * 15) * 0.3;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} transparent opacity={0.9} />
    </mesh>
  );
}

function DNARung({ start, end, phase }) {
  const ref = useRef();
  const { midpoint, quaternion, length } = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    const dir = e.clone().sub(s);
    const len = dir.length();
    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { midpoint: [mid.x, mid.y, mid.z], quaternion: quat, length: len };
  }, [start, end]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 2 + phase * 12) * 0.1;
  });

  return (
    <mesh ref={ref} position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.015, 0.015, length, 6]} />
      <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.3} transparent opacity={0.2} roughness={0.5} />
    </mesh>
  );
}

function NeuralParticles({ scrollProgress, count = 100 }) {
  const pointsRef = useRef();
  const linesRef = useRef();
  const frameSkipRef = useRef(true);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10],
        vel: [(Math.random() - 0.5) * 0.003, (Math.random() - 0.5) * 0.003, (Math.random() - 0.5) * 0.002],
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const linePositions = useMemo(() => new Float32Array(count * count * 6), [count]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.pos[0] += p.vel[0] + Math.sin(t * 0.3 + p.phase) * 0.002;
      p.pos[1] += p.vel[1] + Math.cos(t * 0.2 + p.phase) * 0.002;
      p.pos[2] += p.vel[2];

      for (let axis = 0; axis < 3; axis++) {
        const limit = axis < 2 ? 8 : 5;
        if (p.pos[axis] > limit) p.pos[axis] = -limit;
        if (p.pos[axis] < -limit) p.pos[axis] = limit;
      }
      positions[i * 3] = p.pos[0]; positions[i * 3 + 1] = p.pos[1]; positions[i * 3 + 2] = p.pos[2];
    }

    if (pointsRef.current) { pointsRef.current.geometry.attributes.position.needsUpdate = true; }

    // Skip the O(n²) line-connection pass on every other frame — it's the most
    // expensive part of this scene and halving its frequency is not visible to the
    // eye (lines just drift a bit) but meaningfully cuts frame time.
    frameSkipRef.current = !frameSkipRef.current;
    if (frameSkipRef.current) {
      let lineIdx = 0; const CONNECTION_DIST_SQ = 2.5 * 2.5; const MAX_LINES = 300; let lineCount = 0;
      for (let i = 0; i < count && lineCount < MAX_LINES; i++) {
        for (let j = i + 1; j < count && lineCount < MAX_LINES; j++) {
          const dx = particles[i].pos[0] - particles[j].pos[0], dy = particles[i].pos[1] - particles[j].pos[1], dz = particles[i].pos[2] - particles[j].pos[2];
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < CONNECTION_DIST_SQ) {
            linePositions[lineIdx++] = particles[i].pos[0]; linePositions[lineIdx++] = particles[i].pos[1]; linePositions[lineIdx++] = particles[i].pos[2];
            linePositions[lineIdx++] = particles[j].pos[0]; linePositions[lineIdx++] = particles[j].pos[1]; linePositions[lineIdx++] = particles[j].pos[2];
            lineCount++;
          }
        }
      }
      // Mutate the SAME buffer/attribute in place instead of allocating a new
      // Float32Array + BufferAttribute every frame (the old code did this at 60fps,
      // which meant constant GC pressure and was the biggest cause of jank/lag on
      // the site since this component is mounted behind every single page).
      if (linesRef.current) {
        linesRef.current.geometry.attributes.position.needsUpdate = true;
        linesRef.current.geometry.setDrawRange(0, lineCount * 2);
      }
    }
    if (pointsRef.current) pointsRef.current.rotation.y = scrollProgress.current * Math.PI * 0.5;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={0.05} color="#60a5fa" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} /></bufferGeometry>
        <lineBasicMaterial color="#60a5fa" transparent opacity={0.06} depthWrite={false} />
      </lineSegments>
    </>
  );
}

function AmbientGlow({ isDarkMode }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.material.opacity = isDarkMode ? 0.04 + Math.sin(t * 0.5) * 0.02 : 0;
    ref.current.scale.setScalar(3 + Math.sin(t * 0.3) * 0.4);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.04} depthWrite={false} side={THREE.BackSide} />
    </mesh>
  );
}

function CameraRig({ isLoggedIn }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 14));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (isLoggedIn) { targetPos.current.set(6, 2, 12); targetLookAt.current.set(-1, 0, 0); } 
    else { targetPos.current.set(0, 0, 14); targetLookAt.current.set(0, 0, 0); }
  }, [isLoggedIn]);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.02);
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    const targetDir = targetLookAt.current.clone().sub(camera.position).normalize();
    currentLookAt.lerp(targetDir, 0.02);
    camera.lookAt(camera.position.x + currentLookAt.x, camera.position.y + currentLookAt.y, camera.position.z + currentLookAt.z);
  });
  return null;
}

function SceneLights({ isDarkMode }) {
  return (
    <>
      <ambientLight intensity={isDarkMode ? 0.08 : 0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} color="#60a5fa" />
      <directionalLight position={[-5, -3, 3]} intensity={0.3} color="#34d399" />
      <pointLight position={[0, 4, 2]} intensity={0.8} color="#3b82f6" distance={15} decay={2} />
      <pointLight position={[-3, -4, 4]} intensity={0.4} color="#10b981" distance={12} decay={2} />
      <pointLight position={[4, 0, -3]} intensity={0.3} color="#8b5cf6" distance={10} decay={2} />
    </>
  );
}

function Global3DBackground({ isLoggedIn, scrollProgress, isDarkMode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, transition: 'background 0.5s ease',
      background: isDarkMode ? 'radial-gradient(ellipse at 50% 40%, #06101f 0%, #000000 70%)' : 'radial-gradient(ellipse at 50% 40%, #e0f2fe 0%, #f8fafc 70%)',
    }}>
      <Canvas camera={{ position: [0, 0, 14], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} style={{ pointerEvents: 'none' }}>
        <Suspense fallback={null}>
          <SceneLights isDarkMode={isDarkMode} />
          <CameraRig isLoggedIn={isLoggedIn} />
          <DNAHelix scrollProgress={scrollProgress} />
          <NeuralParticles key={isDarkMode ? 'dark' : 'light'} scrollProgress={scrollProgress} count={isDarkMode ? 100 : 50} />
          <AmbientGlow isDarkMode={isDarkMode} />
          <fog attach="fog" args={[isDarkMode ? '#000000' : '#f8fafc', 10, 28]} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   §3  REUSABLE UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function InputField({ icon, style, isDark = true, ...props }) {
  const [focused, setFocused] = useState(false);
  const bg = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)';
  const border = focused ? '#60a5fa' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)');
  const textC = isDark ? '#fff' : '#0f172a';
  
  return (
    <div style={{ position: 'relative', marginBottom: '14px', ...style }}>
      <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focused ? '#60a5fa' : 'rgba(148,163,184,0.5)', transition: 'color 0.25s', zIndex: 1, pointerEvents: 'none' }}>
        {icon}
      </div>
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={{ width: '100%', height: '50px', background: bg, border: `1px solid ${border}`, borderRadius: '14px', color: textC, padding: '0 16px 0 48px', fontSize: '14px', outline: 'none', transition: 'all 0.25s', fontFamily: "'Inter', sans-serif", boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none' }}
      />
    </div>
  );
}

function SidebarBtn({ icon, label, tab, active, set, isDark }) {
  const isActive = active === tab;
  return (
    <button
      onClick={() => set(tab)}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 20px', borderRadius: '14px', border: 'none', width: '100%', background: isActive ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent', color: isActive ? '#fff' : (isDark ? 'rgba(148,163,184,0.65)' : 'rgba(71,85,105,0.8)'), fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.25s', textAlign: 'left', fontFamily: "'Inter', sans-serif", boxShadow: isActive ? '0 4px 24px -6px rgba(59,130,246,0.35)' : 'none' }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = isDark ? '#fff' : '#000'; } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isDark ? 'rgba(148,163,184,0.65)' : 'rgba(71,85,105,0.8)'; } }}
    >
      {icon} {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   §4  CINEMATIC LANDING (Unauthenticated)
   ═══════════════════════════════════════════════════════════════ */
function CinematicLanding({ onLogin, scrollProgressRef }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [fullName, setFullName] = useState(''); const [dob, setDob] = useState(''); const [gender, setGender] = useState('');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(''); const [successMsg, setSuccessMsg] = useState(''); const [isAuthLoading, setIsAuthLoading] = useState(false);

  const { scrollYProgress } = useScroll();
  useMotionValueEvent(scrollYProgress, "change", (v) => { scrollProgressRef.current = v; });

  // NOTE: these breakpoints are scaled (×1.25) versus the original version so that
  // the login card (s4) reaches full view exactly at scrollYProgress === 1, i.e.
  // exactly when the user hits the bottom of the page. Previously s4 finished at
  // 0.80 while the container allowed scrolling all the way to 1.0, which left a
  // "dead zone" of empty scroll after the login card where the 3D background was
  // visible behind it. Now there's nothing left to scroll once the card is in view.
  const s1Opacity = useTransform(scrollYProgress, [0, 0.15, 0.225], [1, 1, 0]);
  const s1Y = useTransform(scrollYProgress, [0, 0.225], [0, -100]);
  const s1Scale = useTransform(scrollYProgress, [0, 0.225], [1, 0.88]);
  const s1Blur = useTransform(scrollYProgress, [0.15, 0.225], [0, 16]);

  const s2Opacity = useTransform(scrollYProgress, [0.1875, 0.325, 0.475, 0.55], [0, 1, 1, 0]);
  const s2Y = useTransform(scrollYProgress, [0.1875, 0.325], [70, 0]);
  const s2Blur = useTransform(scrollYProgress, [0.475, 0.55], [0, 16]);

  const s3Opacity = useTransform(scrollYProgress, [0.5, 0.625, 0.775, 0.85], [0, 1, 1, 0]);
  const s3Y = useTransform(scrollYProgress, [0.5, 0.625], [70, 0]);
  const s3Blur = useTransform(scrollYProgress, [0.775, 0.85], [0, 16]);

  const s4Opacity = useTransform(scrollYProgress, [0.8125, 1], [0, 1]);
  const s4Y = useTransform(scrollYProgress, [0.8125, 1], [80, 0]);
  const s4Scale = useTransform(scrollYProgress, [0.8125, 1], [0.92, 1]);

  const handleGoogleLogin = async () => { try { setAuthError(''); await signInWithPopup(auth, provider); onLogin(); } catch { setAuthError("Google Login Failed!"); } };

  const handleAuthSubmit = async (e) => {
    e.preventDefault(); setAuthError(''); setSuccessMsg(''); setIsAuthLoading(true);
    try {
      if (isLoginMode) {
        if (!email || !password) throw new Error("Please enter email and password.");
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) { await signOut(auth); throw new Error("Please verify your email first! Check your inbox."); }
        onLogin();
      } else {
        if (!fullName || !dob || !gender || !email || !password || !confirmPassword) throw new Error("Fill all fields.");
        if (password !== confirmPassword) throw new Error("Passwords do not match!");
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: fullName });
        await sendEmailVerification(cred.user);
        await signOut(auth);
        setSuccessMsg("Account created! Check your email to verify before logging in.");
        setIsLoginMode(true); setPassword(''); setConfirmPassword('');
      }
    } catch (error) { setAuthError(error.message.replace("Firebase: ", "")); } finally { setIsAuthLoading(false); }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, height: '480vh' }}>
      <motion.div style={{ opacity: s1Opacity, y: s1Y, scale: s1Scale, filter: useTransform(s1Blur, v => `blur(${v}px)`), position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '36px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px rgba(59,130,246,0.35), 0 0 100px rgba(16,185,129,0.15)' }}>
              <BrainCircuit size={26} color="#fff" />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}>HealthCatch</span>
          </div>
          <h1 style={{ fontSize: 'clamp(38px, 7.5vw, 88px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.045em', marginBottom: '28px', fontFamily: "'Space Grotesk', sans-serif", textShadow: '0 0 80px rgba(96,165,250,0.2)' }}>
            <span style={{ color: '#fff' }}>Your Health.</span><br /><span className="text-gradient-hero">Decoded by AI.</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.8vw, 20px)', color: 'rgba(255,255,255,0.35)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>
            Meet the AI-powered wellness companion that listens, understands, and guides your mental & physical health journey.
          </p>
        </motion.div>
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.2)' }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600 }}>Scroll to explore</span><ChevronDown size={18} />
        </motion.div>
      </motion.div>

      <motion.div style={{ opacity: s2Opacity, y: s2Y, filter: useTransform(s2Blur, v => `blur(${v}px)`), position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 58px)', fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.03em', maxWidth: '750px', fontFamily: "'Space Grotesk', sans-serif", textShadow: '0 0 60px rgba(96,165,250,0.15)' }}>Every heartbeat tells a story.<br />We help you <span className="text-gradient-warm">understand it.</span></h2>
      </motion.div>

      <motion.div style={{ opacity: s3Opacity, y: s3Y, filter: useTransform(s3Blur, v => `blur(${v}px)`), position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', pointerEvents: 'none' }}>
        <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '48px', textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>Powered by <span className="text-gradient-cool">intelligence.</span></h2>
      </motion.div>

      <motion.div style={{ opacity: s4Opacity, y: s4Y, scale: s4Scale, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', pointerEvents: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '460px', background: 'rgba(8, 15, 30, 0.6)', backdropFilter: 'blur(60px) saturate(200%)', WebkitBackdropFilter: 'blur(60px) saturate(200%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '30px', padding: '44px 36px', boxShadow: '0 0 100px -30px rgba(59,130,246,0.2), 0 40px 80px -30px rgba(0,0,0,0.7)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59,130,246,0.3)' }}><BrainCircuit size={20} color="#fff" /></div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>HealthCatch</span>
            </div>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '4px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>
          
          {authError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '11px 16px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px', textAlign: 'center' }}>{authError}</div>}
          {successMsg && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#86efac', padding: '11px 16px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px', textAlign: 'center' }}><CheckCircle size={15} style={{display:'inline', verticalAlign:'middle'}}/> {successMsg}</div>}

          <form onSubmit={handleAuthSubmit} style={{marginTop: '20px'}}>
            <AnimatePresence mode="wait">
              {!isLoginMode && (
                <motion.div key="signup" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <InputField icon={<User size={17} />} type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} isDark={true} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <InputField icon={<Calendar size={17} />} type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={{ flex: 1 }} isDark={true} />
                    <div style={{ position: 'relative', flex: 1, marginBottom: '14px' }}>
                      <Users size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.5)', zIndex: 1 }} />
                      <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', height: '50px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', color: gender ? '#fff' : 'rgba(148,163,184,0.5)', padding: '0 16px 0 48px', fontSize: '14px', outline: 'none', appearance: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                        <option value="" disabled>Gender</option>
                        <option value="male" style={{ background: '#0f172a' }}>Male</option>
                        <option value="female" style={{ background: '#0f172a' }}>Female</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <InputField icon={<Mail size={17} />} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} isDark={true} />
            <InputField icon={<Lock size={17} />} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} isDark={true} />
            <AnimatePresence>
              {!isLoginMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <InputField icon={<Lock size={17} />} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} isDark={true} />
                </motion.div>
              )}
            </AnimatePresence>
            <button type="submit" disabled={isAuthLoading} style={{ width: '100%', height: '50px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff', fontSize: '14.5px', fontWeight: 700, cursor: 'pointer', marginTop: '6px', transition: 'all 0.3s' }}>
              {isAuthLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', gap: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <button onClick={handleGoogleLogin} style={{ width: '100%', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', color: '#fff', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: 18, height: 18 }} /> Continue with Google
          </button>
          <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: 700, cursor: 'pointer' }}>
              {isLoginMode ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   §4.5  HEALTHCATCH DIFFERENTIATION LAYER
   These components sit on top of the existing dashboard and turn
   HealthCatch into a Health Identity + Coach + Community ecosystem.
   Existing legacy sections are intentionally preserved.
   ═══════════════════════════════════════════════════════════════ */

function FeatureHeader({ icon, eyebrow, title, description, textPrimary, textSecondary }) {
  return (
    <div style={{ marginBottom: '26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px', color: '#60a5fa', fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
        {icon}
        {eyebrow}
      </div>
      <h2 style={{ fontSize: '34px', fontWeight: 900, lineHeight: 1.1, marginBottom: '10px', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
      <p style={{ color: textSecondary, maxWidth: '760px', lineHeight: 1.65, fontSize: '14px' }}>{description}</p>
    </div>
  );
}

function GlassCard({ children, style = {}, panelBg, panelBorder }) {
  return (
    <div style={{ background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: '22px', backdropFilter: 'blur(35px)', WebkitBackdropFilter: 'blur(35px)', ...style }}>
      {children}
    </div>
  );
}

function HealthScorePanel({ panelBg, panelBorder, textPrimary, textSecondary }) {
  const metrics = [
    { label: 'Activity', value: 78, icon: <Activity size={16} /> },
    { label: 'Consistency', value: 86, icon: <TrendingUp size={16} /> },
    { label: 'Hydration', value: 64, icon: <Droplets size={16} /> },
    { label: 'Sleep', value: 72, icon: <BedDouble size={16} /> },
  ];

  return (
    <GlassCard panelBg={panelBg} panelBorder={panelBorder} style={{ padding: '26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'center', marginBottom: '22px' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Health Behaviour Score</p>
          <h3 style={{ fontSize: '28px', fontWeight: 900, marginTop: '6px' }}>78<span style={{ fontSize: '14px', color: textSecondary }}> / 100</span></h3>
          <p style={{ color: textSecondary, fontSize: '12px', marginTop: '5px' }}>Based on recent lifestyle activity—not a medical diagnosis.</p>
        </div>
        <div style={{ width: '78px', height: '78px', borderRadius: '50%', background: 'conic-gradient(#3b82f6 78%, rgba(148,163,184,0.15) 0)', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: panelBg, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '20px' }}>78</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        {metrics.map(metric => (
          <div key={metric.label} style={{ padding: '15px', borderRadius: '16px', background: 'rgba(59,130,246,0.06)', border: `1px solid ${panelBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '11px' }}>
              <span style={{ color: '#60a5fa' }}>{metric.icon}</span>
              <span style={{ fontWeight: 800, fontSize: '13px' }}>{metric.value}%</span>
            </div>
            <p style={{ fontSize: '12px', color: textSecondary, marginBottom: '8px' }}>{metric.label}</p>
            <div style={{ height: '6px', borderRadius: '99px', background: 'rgba(148,163,184,0.12)', overflow: 'hidden' }}>
              <div style={{ width: `${metric.value}%`, height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg,#3b82f6,#10b981)' }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function HealthIdentityPanel({ userName, userEmail, userPhoto, onOpenProfile, panelBg, panelBorder, textPrimary, textSecondary }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', position: 'absolute', inset: 0, padding: '40px 36px 120px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <FeatureHeader icon={<CircleGauge size={15} />} eyebrow="Health Identity" title="Your Digital Health Identity" description="A private wellness identity that connects behaviour, goals, achievements and trusted professionals without turning your public profile into a medical record." textPrimary={textPrimary} textSecondary={textSecondary} />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, .95fr)', gap: '22px', alignItems: 'start' }}>
          <GlassCard panelBg={panelBg} panelBorder={panelBorder} style={{ padding: '26px' }}>
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '25px' }}>
              <img src={userPhoto} alt="Profile" style={{ width: '84px', height: '84px', borderRadius: '50%', border: '3px solid rgba(59,130,246,0.45)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '23px', fontWeight: 900 }}>{userName}</h3>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 9px', borderRadius: '999px', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '10px', fontWeight: 800 }}><ShieldCheck size={12}/> HEALTH ID ACTIVE</span>
                </div>
                <p style={{ color: textSecondary, fontSize: '13px', marginTop: '4px' }}>{userEmail}</p>
                <p style={{ color: textSecondary, fontSize: '12px', marginTop: '7px' }}>Goal: Improve daily energy & fitness consistency</p>
              </div>
              <button onClick={onOpenProfile} style={{ padding: '9px 13px', borderRadius: '11px', border: `1px solid ${panelBorder}`, background: 'transparent', color: textPrimary, cursor: 'pointer', fontWeight: 700 }}>Edit</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[['Level','7'],['Challenges','12'],['Connections','42'],['Streak','9d']].map(([label,value]) => (
                <div key={label} style={{ padding: '16px 12px', borderRadius: '15px', background: 'rgba(255,255,255,0.025)', border: `1px solid ${panelBorder}`, textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: 900 }}>{value}</p>
                  <p style={{ fontSize: '10.5px', color: textSecondary, marginTop: '4px' }}>{label}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <HealthScorePanel panelBg={panelBg} panelBorder={panelBorder} textPrimary={textPrimary} textSecondary={textSecondary} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '18px', marginTop: '20px' }}>
          {[
            { icon:<Award size={19}/>, title:'Achievements', text:'12 health achievements unlocked.' },
            { icon:<Dumbbell size={19}/>, title:'Current Goal', text:'Build a consistent movement routine.' },
            { icon:<UsersRound size={19}/>, title:'Trusted Circle', text:'3 professionals + 42 connections.' },
            { icon:<ShieldCheck size={19}/>, title:'Privacy', text:'Sensitive medical data stays private by design.' },
          ].map(item => (
            <GlassCard key={item.title} panelBg={panelBg} panelBorder={panelBorder} style={{ padding: '20px' }}>
              <div style={{ color:'#60a5fa', marginBottom:'12px' }}>{item.icon}</div>
              <h4 style={{ fontSize:'15px', fontWeight:800, marginBottom:'5px' }}>{item.title}</h4>
              <p style={{ color:textSecondary, fontSize:'12px', lineHeight:1.6 }}>{item.text}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIHealthCoachPanel({ onOpenChat, panelBg, panelBorder, textPrimary, textSecondary }) {
  const insights = [
    { icon:<Footprints size={17}/>, title:'Activity', value:'7,120 steps', detail:'18% above your 7-day average' },
    { icon:<Droplets size={17}/>, title:'Hydration', value:'2.1 / 3.0 L', detail:'One more 450ml goal block today' },
    { icon:<BedDouble size={17}/>, title:'Sleep', value:'7h 12m', detail:'Stable this week; keep your bedtime consistent' },
  ];

  return (
    <div style={{ height:'100%', overflowY:'auto', position:'absolute', inset:0, padding:'40px 36px 120px' }}>
      <div style={{ maxWidth:'1080px', margin:'0 auto' }}>
        <FeatureHeader icon={<Sparkle size={15}/>} eyebrow="AI Health Coach" title="From chatbot to continuous coach" description="Your AI layer should turn health data into small, explainable actions. It should coach behaviour—not diagnose disease." textPrimary={textPrimary} textSecondary={textSecondary} />

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.35fr) minmax(280px,.65fr)', gap:'22px', alignItems:'start' }}>
          <GlassCard panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'26px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:42, height:42, borderRadius:'13px', background:'linear-gradient(135deg,#3b82f6,#10b981)', display:'grid', placeItems:'center' }}><Bot size={20} color="#fff"/></div>
                <div><h3 style={{ fontSize:'18px', fontWeight:900 }}>Today’s Coach Brief</h3><p style={{ color:textSecondary, fontSize:'11px', marginTop:'3px' }}>Generated from your recent wellness activity</p></div>
              </div>
              <span style={{ fontSize:'10px', padding:'5px 9px', borderRadius:'999px', background:'rgba(16,185,129,.1)', color:'#34d399', fontWeight:800 }}>BEHAVIOUR MODE</span>
            </div>

            <div style={{ display:'grid', gap:'11px' }}>
              {insights.map(item => (
                <div key={item.title} style={{ display:'flex', gap:'13px', alignItems:'center', padding:'15px', borderRadius:'16px', background:'rgba(255,255,255,.025)', border:`1px solid ${panelBorder}` }}>
                  <div style={{ color:'#60a5fa', width:36, height:36, borderRadius:'11px', display:'grid', placeItems:'center', background:'rgba(59,130,246,.1)' }}>{item.icon}</div>
                  <div style={{ flex:1 }}><p style={{ fontSize:'11px', color:textSecondary }}>{item.title}</p><p style={{ fontSize:'15px', fontWeight:800, marginTop:'3px' }}>{item.value}</p></div>
                  <p style={{ maxWidth:'240px', textAlign:'right', color:textSecondary, fontSize:'11px', lineHeight:1.5 }}>{item.detail}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop:'18px', padding:'18px', borderRadius:'16px', background:'linear-gradient(135deg,rgba(59,130,246,.09),rgba(16,185,129,.06))', border:'1px solid rgba(59,130,246,.14)' }}>
              <p style={{ fontSize:'12px', color:textSecondary, marginBottom:'8px' }}>Recommended next action</p>
              <h4 style={{ fontSize:'16px', fontWeight:800, marginBottom:'5px' }}>Finish one short movement block today.</h4>
              <p style={{ fontSize:'12px', color:textSecondary, lineHeight:1.6 }}>Your consistency is stronger than your raw activity. The coach is prioritising habit stability over chasing a bigger number.</p>
              <button onClick={onOpenChat} style={{ marginTop:'12px', padding:'10px 15px', borderRadius:'11px', border:'none', background:'linear-gradient(135deg,#3b82f6,#10b981)', color:'#fff', fontWeight:800, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'7px' }}><MessageSquareText size={15}/> Ask the AI Coach</button>
            </div>
          </GlassCard>

          <GlassCard panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'16px' }}><CircleGauge size={18} color="#34d399"/><h3 style={{ fontSize:'17px', fontWeight:900 }}>Coach Rules</h3></div>
            {[['1','Listen','Learns from your logs, goals and conversations.'],['2','Explain','Shows why a recommendation was selected.'],['3','Act','Turns advice into tiny tasks and reminders.'],['4','Escalate','Suggests professional care when appropriate.']].map(([n,title,text]) => (
              <div key={n} style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
                <div style={{ width:24, height:24, borderRadius:'50%', display:'grid', placeItems:'center', background:'rgba(59,130,246,.12)', color:'#60a5fa', fontWeight:900, fontSize:'11px', flexShrink:0 }}>{n}</div>
                <div><p style={{ fontSize:'12px', fontWeight:800 }}>{title}</p><p style={{ fontSize:'11px', color:textSecondary, lineHeight:1.5, marginTop:'3px' }}>{text}</p></div>
              </div>
            ))}
            <div style={{ marginTop:'5px', padding:'12px', borderRadius:'13px', background:'rgba(245,158,11,.07)', border:'1px solid rgba(245,158,11,.15)', color:'#fbbf24', fontSize:'10.5px', lineHeight:1.5 }}>AI guidance is informational. It is not a diagnosis, prescription or emergency service.</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function SmartChallengesPanel({ userPhoto, panelBg, panelBorder, textPrimary, textSecondary }) {
  const [water, setWater] = useState(2);
  const [steps, setSteps] = useState(7120);
  const goal = 10000;
  const stepPct = Math.min(100, Math.round((steps / goal) * 100));

  const competitors = [
    { name:'You', score:850, consistency:84, color:'#3b82f6', photo:userPhoto },
    { name:'Ankita Halder', score:940, consistency:91, color:'#10b981', photo:'https://api.dicebear.com/7.x/avataaars/svg?seed=Ankita%20Halder' },
    { name:'Rahul Sharma', score:720, consistency:71, color:'#f43f5e', photo:'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul%20Sharma' },
  ];

  return (
    <div style={{ height:'100%', overflowY:'auto', position:'absolute', inset:0, padding:'40px 36px 120px' }}>
      <div style={{ maxWidth:'1080px', margin:'0 auto' }}>
        <FeatureHeader icon={<Trophy size={15}/>} eyebrow="Smart Challenges" title="Compete on progress, not just numbers" description="The HealthCatch challenge engine rewards performance, consistency and improvement so one lucky high-activity day does not decide the winner." textPrimary={textPrimary} textSecondary={textSecondary} />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px', marginBottom:'22px' }}>
          <GlassCard panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}><span style={{ fontSize:'25px' }}>💧</span><span style={{ fontSize:'10px', padding:'5px 9px', borderRadius:'999px', background:'rgba(59,130,246,.1)', color:'#60a5fa', fontWeight:800 }}>{water} / 3 L</span></div>
            <h4 style={{ fontSize:'15px', fontWeight:800 }}>Hydration Streak</h4><p style={{ color:textSecondary, fontSize:'11px', lineHeight:1.5, margin:'5px 0 14px' }}>Daily target tracked as a habit—not a medical prescription.</p>
            <button onClick={() => setWater(v => Math.min(3,v+1))} disabled={water>=3} style={{ width:'100%', padding:'9px', borderRadius:'10px', border:'1px solid rgba(59,130,246,.25)', background:'rgba(59,130,246,.08)', color:'#60a5fa', fontWeight:700, cursor:water>=3?'not-allowed':'pointer', opacity:water>=3?.5:1 }}>Mark +1 Glass</button>
          </GlassCard>

          <GlassCard panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}><span style={{ fontSize:'25px' }}>🏃</span><span style={{ fontSize:'10px', padding:'5px 9px', borderRadius:'999px', background:'rgba(16,185,129,.1)', color:'#34d399', fontWeight:800 }}>{steps.toLocaleString()} / 10K</span></div>
            <h4 style={{ fontSize:'15px', fontWeight:800 }}>10K Step Challenge</h4><p style={{ color:textSecondary, fontSize:'11px', lineHeight:1.5, margin:'5px 0 14px' }}>Update your progress to simulate the challenge flow.</p>
            <div style={{ height:'8px', borderRadius:'99px', background:'rgba(148,163,184,.12)', overflow:'hidden', marginBottom:'12px' }}><div style={{ width:`${stepPct}%`, height:'100%', background:'linear-gradient(90deg,#3b82f6,#10b981)' }}/></div>
            <button onClick={() => setSteps(v => Math.min(goal,v+500))} disabled={steps>=goal} style={{ width:'100%', padding:'9px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#3b82f6,#10b981)', color:'#fff', fontWeight:800, cursor:steps>=goal?'not-allowed':'pointer', opacity:steps>=goal?.5:1 }}>Log +500 Steps</button>
          </GlassCard>
        </div>

        <GlassCard panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'22px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' }}><div><h3 style={{ fontSize:'18px', fontWeight:900 }}>AI Judged Leaderboard</h3><p style={{ color:textSecondary, fontSize:'11px', marginTop:'4px' }}>Score = performance 40% + consistency 30% + goal completion 20% + improvement 10%.</p></div><span style={{ fontSize:'10px', fontWeight:800, color:'#34d399' }}>LIVE RULES</span></div>
          {competitors.map((person,index) => (
            <div key={person.name} style={{ display:'grid', gridTemplateColumns:'34px minmax(150px,1fr) 120px 90px', gap:'12px', alignItems:'center', padding:'15px 0', borderTop:index===0?'none':`1px solid ${panelBorder}` }}>
              <div style={{ width:30, height:30, borderRadius:'10px', display:'grid', placeItems:'center', background:'rgba(59,130,246,.08)', color:person.color, fontWeight:900 }}>{index+1}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}><img src={person.photo} alt={person.name} style={{ width:36, height:36, borderRadius:'50%' }}/><div><p style={{ fontWeight:800, fontSize:'12px' }}>{person.name}</p><p style={{ color:textSecondary, fontSize:'10px' }}>Consistency {person.consistency}%</p></div></div>
              <div><div style={{ height:7, borderRadius:'99px', background:'rgba(148,163,184,.12)', overflow:'hidden' }}><div style={{ width:`${person.consistency}%`, height:'100%', background:person.color }}/></div></div>
              <div style={{ textAlign:'right', fontWeight:900, color:person.color }}>{person.score}</div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

function HealthGroupsPanel({ panelBg, panelBorder, textPrimary, textSecondary }) {
  const groups = [
    { title:'Diabetes Care', members:'12.4K', expert:'Dr. Sneha Roy', challenge:'7-Day Low Sugar Habit' },
    { title:'Yoga & Mobility', members:'8.1K', expert:'Coach Aisha', challenge:'10-Min Mobility Streak' },
    { title:'Mental Wellness', members:'19.2K', expert:'Clinical Team', challenge:'Daily Check-In' },
    { title:'Healthy Students', members:'6.7K', expert:'Student Mentors', challenge:'Exam Stress Reset' },
  ];

  return (
    <div style={{ height:'100%', overflowY:'auto', position:'absolute', inset:0, padding:'40px 36px 120px' }}>
      <div style={{ maxWidth:'1080px', margin:'0 auto' }}>
        <FeatureHeader icon={<UsersRound size={15}/>} eyebrow="Action Communities" title="Groups that turn discussion into action" description="HealthCatch groups combine community discussion, expert presence, AI-assisted summaries and measurable challenges." textPrimary={textPrimary} textSecondary={textSecondary} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px' }}>
          {groups.map(group => (
            <GlassCard key={group.title} panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:'8px', alignItems:'start', marginBottom:'15px' }}><div style={{ width:42, height:42, borderRadius:'13px', display:'grid', placeItems:'center', background:'rgba(59,130,246,.1)', color:'#60a5fa' }}><Users size={19}/></div><span style={{ fontSize:'10px', color:'#34d399', fontWeight:800 }}>ACTIVE</span></div>
              <h3 style={{ fontSize:'16px', fontWeight:900 }}>{group.title}</h3>
              <p style={{ color:textSecondary, fontSize:'11px', marginTop:'5px' }}>{group.members} members · Expert: {group.expert}</p>
              <div style={{ marginTop:'14px', padding:'12px', borderRadius:'13px', background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.12)' }}><p style={{ fontSize:'10px', color:textSecondary }}>Current challenge</p><p style={{ fontSize:'12px', fontWeight:800, marginTop:'3px' }}>{group.challenge}</p></div>
              <div style={{ display:'flex', gap:'8px', marginTop:'13px' }}><button style={{ flex:1, padding:'9px', borderRadius:'10px', background:'#3b82f6', color:'#fff', border:'none', fontWeight:700, cursor:'pointer' }}>Join Group</button><button style={{ width:42, borderRadius:'10px', border:`1px solid ${panelBorder}`, background:'transparent', color:textPrimary, cursor:'pointer' }} title="Open group"><ArrowUpRight size={15}/></button></div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfessionalNetworkPanel({ panelBg, panelBorder, textPrimary, textSecondary, onOpenDoctors }) {
  const professionals = [
    { name:'Dr. Amit Patel', role:'Cardiologist', org:'Metro Heart Centre', verified:true, hiring:true },
    { name:'Dr. Sneha Roy', role:'Clinical Psychologist', org:'MindCare Clinic', verified:true, hiring:false },
    { name:'Riya Sen', role:'Medical Student', org:'JIS University', verified:false, hiring:false },
    { name:'Nurse Arpita Das', role:'Registered Nurse', org:'City Hospital', verified:true, hiring:true },
  ];

  return (
    <div style={{ height:'100%', overflowY:'auto', position:'absolute', inset:0, padding:'40px 36px 120px' }}>
      <div style={{ maxWidth:'1080px', margin:'0 auto' }}>
        <FeatureHeader icon={<UserCheck size={15}/>} eyebrow="Professional Network" title="Healthcare careers + trusted identities" description="Doctors, nurses and students get professional profiles, verification signals, mentorship and relevant jobs—without mixing public social identity with confidential patient data." textPrimary={textPrimary} textSecondary={textSecondary} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))', gap:'16px' }}>
          {professionals.map(person => (
            <GlassCard key={person.name} panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}><div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#10b981)', display:'grid', placeItems:'center', color:'#fff', fontWeight:900 }}>{person.name.charAt(0)}</div><div style={{ minWidth:0 }}><div style={{ display:'flex', alignItems:'center', gap:'6px' }}><h4 style={{ fontSize:'14px', fontWeight:900 }}>{person.name}</h4>{person.verified && <BadgeCheck size={14} color="#34d399"/>}</div><p style={{ fontSize:'11px', color:textSecondary }}>{person.role}</p></div></div>
              <p style={{ color:textSecondary, fontSize:'11px', display:'flex', alignItems:'center', gap:'6px' }}><MapPin size={12}/>{person.org}</p>
              <div style={{ display:'flex', gap:'7px', flexWrap:'wrap', margin:'14px 0' }}><span style={{ padding:'5px 8px', borderRadius:'999px', background:'rgba(59,130,246,.08)', color:'#60a5fa', fontSize:'9.5px', fontWeight:800 }}>{person.verified?'Verified identity':'Student profile'}</span>{person.hiring && <span style={{ padding:'5px 8px', borderRadius:'999px', background:'rgba(16,185,129,.08)', color:'#34d399', fontSize:'9.5px', fontWeight:800 }}>Hiring</span>}</div>
              <button onClick={person.role.includes('Cardiologist')||person.role.includes('Psychologist') ? onOpenDoctors : undefined} style={{ width:'100%', padding:'9px', borderRadius:'10px', border:`1px solid ${panelBorder}`, background:'transparent', color:textPrimary, fontWeight:700, cursor:'pointer' }}>{person.hiring ? 'View profile & opportunity' : 'View professional profile'}</button>
            </GlassCard>
          ))}
        </div>

        <GlassCard panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'22px', marginTop:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:'14px', alignItems:'center', marginBottom:'15px' }}><div><h3 style={{ fontSize:'18px', fontWeight:900 }}>Featured Health Jobs</h3><p style={{ color:textSecondary, fontSize:'11px', marginTop:'4px' }}>Career discovery designed specifically for healthcare roles.</p></div><button style={{ padding:'8px 12px', borderRadius:'10px', border:'1px solid rgba(59,130,246,.22)', background:'rgba(59,130,246,.07)', color:'#60a5fa', fontWeight:800, cursor:'pointer' }}>Browse all jobs</button></div>
          {[['Resident Medical Officer','Kolkata · Full-time','Apollo Partner Clinic'],['Clinical Intern','Kolkata · Internship','MindCare Network'],['Nursing Associate','Howrah · Full-time','City Hospital']].map(([role,location,org],i)=>(
            <div key={role} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'14px', padding:'14px 0', borderTop:i===0?'none':`1px solid ${panelBorder}` }}><div><p style={{ fontSize:'12px', fontWeight:800 }}>{role}</p><p style={{ color:textSecondary, fontSize:'10.5px', marginTop:'4px' }}>{org} · {location}</p></div><button style={{ padding:'8px 11px', borderRadius:'10px', background:'transparent', border:`1px solid ${panelBorder}`, color:textPrimary, fontWeight:700, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'5px' }}>Details <ArrowUpRight size={13}/></button></div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

function HealthJobsPanel({ panelBg, panelBorder, textPrimary, textSecondary }) {
  const jobs = [
    ['Resident Medical Officer','Full-time','Kolkata','Apollo Partner Clinic'],
    ['Clinical Psychology Intern','Internship','Kolkata','MindCare Network'],
    ['Staff Nurse','Full-time','Howrah','City Hospital'],
    ['Medical Content Reviewer','Remote','India','Health Learning Lab'],
  ];
  return (
    <div style={{ height:'100%', overflowY:'auto', position:'absolute', inset:0, padding:'40px 36px 120px' }}>
      <div style={{ maxWidth:'1080px', margin:'0 auto' }}>
        <FeatureHeader icon={<BriefcaseBusiness size={15}/>} eyebrow="Healthcare Careers" title="Jobs, internships & mentorship" description="A dedicated career layer for doctors, nurses, allied professionals and medical students." textPrimary={textPrimary} textSecondary={textSecondary} />
        <div style={{ display:'grid', gap:'12px' }}>
          {jobs.map(([role,type,place,org],i)=>(
            <GlassCard key={role} panelBg={panelBg} panelBorder={panelBorder} style={{ padding:'20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'13px', minWidth:0 }}><div style={{ width:44,height:44,borderRadius:'13px',display:'grid',placeItems:'center',background:'rgba(59,130,246,.09)',color:'#60a5fa',flexShrink:0 }}><BriefcaseBusiness size={18}/></div><div><h3 style={{ fontSize:'14px',fontWeight:900 }}>{role}</h3><p style={{ fontSize:'10.5px',color:textSecondary,marginTop:'4px' }}>{org} · {place} · {type}</p></div></div>
              <div style={{ display:'flex', gap:'7px' }}><span style={{ padding:'6px 8px',borderRadius:'999px',background:'rgba(16,185,129,.07)',color:'#34d399',fontSize:'9.5px',fontWeight:800 }}>MATCH 92%</span><button style={{ padding:'8px 12px',borderRadius:'10px',background:'#3b82f6',border:'none',color:'#fff',fontWeight:800,cursor:'pointer' }}>View</button></div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   §5  AUTHENTICATED SUPER-APP DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
const MOCK_POSTS = [
  { id: 1, name: 'Dr. Sarah Jenkins', time: '2 hours ago', text: 'Daily reminder: 30 minutes of brisk walking can reduce anxiety by 40%. Keep moving! 🚶‍♀️💪', likes: 124, comments: 18 },
  { id: 2, name: 'Rahul Sharma', time: '5 hours ago', text: 'Just completed my first 5K run! Never thought I could do it. Thanks to the community for the support. 🏅', img: 'https://images.unsplash.com/photo-1552674605-15c2145eba11?auto=format&fit=crop&w=600&q=80', likes: 342, comments: 56 }
];

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Amit Patel', spec: 'Cardiologist', rating: '4.9/5', available: 'Available Now' },
  { id: 2, name: 'Dr. Sneha Roy', spec: 'Clinical Psychologist', rating: '5.0/5', available: 'Next Slot: 2:00 PM' }
];


/* ═══════════════════════════════════════════════════════════════
   §5A  P2P MESSAGING + HEALTH MENU DEMO PAGES + PROFILE ACTIVITY
   These additions are isolated from the legacy functions below.
   The existing AI Chatbot remains available from the sidebar.
   ═══════════════════════════════════════════════════════════════ */
const P2P_CONTACTS = [
  { id: 'rahul', name: 'Rahul Sharma', role: 'Health Enthusiast', status: 'Online', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', verified: false },
  { id: 'sayan', name: 'Sayan Gupta', role: 'Fitness Buddy', status: 'Active 8m ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sayan', verified: false },
  { id: 'jis-bihari', name: 'Jis Bihari', role: 'Medical Student', status: 'Active 1h ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jis%20Bihari', verified: true },
  { id: 'amit-patel', name: 'Dr. Amit Patel', role: 'Cardiologist', status: 'Available', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dr%20Amit%20Patel', verified: true },
  { id: 'sneha-roy', name: 'Dr. Sneha Roy', role: 'Clinical Psychologist', status: 'Available 2:00 PM', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dr%20Sneha%20Roy', verified: true }
];

const INITIAL_P2P_THREADS = {
  rahul: [
    { sender: 'them', text: 'Hey! Did you join the 10K Steps challenge?', time: '10:14 AM' },
    { sender: 'me', text: 'Yes! I am already at 7,120 steps today.', time: '10:17 AM' },
    { sender: 'them', text: 'Nice. Let’s finish it together tonight. 💪', time: '10:18 AM' }
  ],
  sayan: [
    { sender: 'them', text: 'Are we still doing the evening walk?', time: 'Yesterday' },
    { sender: 'me', text: 'Absolutely. 7:30 PM works.', time: 'Yesterday' }
  ],
  'jis-bihari': [
    { sender: 'them', text: 'I found an interesting healthcare internship opening.', time: 'Tue' },
    { sender: 'me', text: 'Send me the details when you get time.', time: 'Tue' }
  ],
  'amit-patel': [
    { sender: 'them', text: 'Hello. How can I help you today?', time: 'Mon' }
  ],
  'sneha-roy': [
    { sender: 'them', text: 'You can message me here before your consultation.', time: 'Sun' }
  ]
};

function P2PMessagingPanel({ userPhoto, userName, panelBg, panelBorder, textPrimary, textSecondary, inputBg, inputBorder, isDarkMode }) {
  const [selectedContact, setSelectedContact] = useState(P2P_CONTACTS[0]);
  const [threads, setThreads] = useState(INITIAL_P2P_THREADS);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');

  const visibleContacts = P2P_CONTACTS.filter(contact =>
    `${contact.name} ${contact.role}`.toLowerCase().includes(search.toLowerCase())
  );
  const currentMessages = threads[selectedContact.id] || [];

  const sendMessage = () => {
    const message = draft.trim();
    if (!message) return;
    setThreads(prev => ({
      ...prev,
      [selectedContact.id]: [
        ...(prev[selectedContact.id] || []),
        { sender: 'me', text: message, time: 'Just now' }
      ]
    }));
    setDraft('');
  };

  return (
    <motion.div key="messaging" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } }} initial="initial" animate="animate" exit="exit" style={{ height: '100%', position: 'absolute', inset: 0, display: 'flex', overflow: 'hidden' }}>
      <aside style={{ width: '330px', minWidth: '330px', borderRight: `1px solid ${panelBorder}`, background: panelBg, backdropFilter: 'blur(35px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: `1px solid ${panelBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div><p style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em' }}>Messages</p><h2 style={{ fontSize: '24px', fontWeight: 900, marginTop: '4px' }}>Inbox</h2></div>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(59,130,246,.1)', display: 'grid', placeItems: 'center', color: '#60a5fa' }}><MessageSquareText size={19}/></div>
          </div>
          <div style={{ position: 'relative' }}><Search size={15} style={{ position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:textSecondary }}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations..." style={{ width:'100%',height:40,borderRadius:12,border:`1px solid ${inputBorder}`,background:inputBg,color:textPrimary,padding:'0 12px 0 38px',outline:'none' }}/></div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {visibleContacts.map(contact => {
            const last = (threads[contact.id] || []).at(-1);
            const active = selectedContact.id === contact.id;
            return <button key={contact.id} onClick={()=>setSelectedContact(contact)} style={{ width:'100%',display:'flex',gap:11,alignItems:'center',padding:'13px 12px',border:'none',borderRadius:14,background:active?'rgba(59,130,246,.12)':'transparent',color:textPrimary,cursor:'pointer',textAlign:'left' }}>
              <div style={{ position:'relative' }}><img src={contact.avatar} alt={contact.name} style={{ width:46,height:46,borderRadius:'50%' }}/><span style={{ position:'absolute',right:1,bottom:1,width:10,height:10,borderRadius:'50%',background:contact.status==='Online'||contact.status==='Available'?'#22c55e':'#94a3b8',border:`2px solid ${isDarkMode?'#0f172a':'#fff'}` }}/></div>
              <div style={{ minWidth:0,flex:1 }}><div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><p style={{fontSize:13.5,fontWeight:800,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{contact.name} {contact.verified && <BadgeCheck size={12} color="#34d399" style={{verticalAlign:'-1px'}}/>}</p><span style={{fontSize:9.5,color:textSecondary}}>P2P</span></div><p style={{fontSize:10.5,color:textSecondary,marginTop:3}}>{last?.text || contact.role}</p></div>
            </button>;
          })}
        </div>
      </aside>

      <section style={{ flex: 1, minWidth: 0, display:'flex',flexDirection:'column',background:isDarkMode?'rgba(0,0,0,.16)':'rgba(255,255,255,.25)' }}>
        <div style={{ height:76,padding:'0 24px',borderBottom:`1px solid ${panelBorder}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:panelBg,backdropFilter:'blur(35px)' }}>
          <div style={{display:'flex',alignItems:'center',gap:12}}><img src={selectedContact.avatar} alt={selectedContact.name} style={{width:44,height:44,borderRadius:'50%'}}/><div><div style={{display:'flex',alignItems:'center',gap:6}}><h3 style={{fontSize:15,fontWeight:900}}>{selectedContact.name}</h3>{selectedContact.verified && <BadgeCheck size={14} color="#34d399"/>}</div><p style={{fontSize:10.5,color:textSecondary,marginTop:3}}>{selectedContact.role} · {selectedContact.status}</p></div></div>
          <div style={{display:'flex',gap:8}}><button title="Voice call" style={{width:36,height:36,borderRadius:10,border:`1px solid ${panelBorder}`,background:'transparent',color:textSecondary,cursor:'pointer'}}><Phone size={15}/></button><button title="Video call" style={{width:36,height:36,borderRadius:10,border:`1px solid ${panelBorder}`,background:'transparent',color:textSecondary,cursor:'pointer'}}><Video size={15}/></button></div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'28px',display:'flex',flexDirection:'column',gap:12}}>
          <div style={{alignSelf:'center',padding:'6px 10px',borderRadius:99,background:'rgba(148,163,184,.08)',color:textSecondary,fontSize:9.5}}>End-to-end chat demo · {selectedContact.name}</div>
          {currentMessages.map((msg, index)=><motion.div key={index} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{display:'flex',gap:9,alignItems:'flex-end',alignSelf:msg.sender==='me'?'flex-end':'flex-start',maxWidth:'72%',flexDirection:msg.sender==='me'?'row-reverse':'row'}}>
            {msg.sender!=='me' && <img src={selectedContact.avatar} alt="" style={{width:30,height:30,borderRadius:'50%'}}/>}
            {msg.sender==='me' && <img src={userPhoto} alt={userName} style={{width:30,height:30,borderRadius:'50%'}}/>}
            <div><div style={{padding:'12px 15px',borderRadius:msg.sender==='me'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:msg.sender==='me'?'linear-gradient(135deg,#3b82f6,#10b981)':panelBg,border:msg.sender==='me'?'none':`1px solid ${panelBorder}`,color:'#fff'}}><p style={{fontSize:13,lineHeight:1.55,color:msg.sender==='me'?'#fff':textPrimary}}>{msg.text}</p></div><p style={{fontSize:9,color:textSecondary,marginTop:4,textAlign:msg.sender==='me'?'right':'left'}}>{msg.time}</p></div>
          </motion.div>)}
        </div>

        <div style={{padding:'15px 20px',borderTop:`1px solid ${panelBorder}`,background:panelBg,backdropFilter:'blur(35px)'}}>
          <div style={{maxWidth:900,margin:'0 auto',display:'flex',alignItems:'center',gap:8,padding:6,borderRadius:16,border:`1px solid ${inputBorder}`,background:inputBg}}>
            <button style={{width:40,height:40,border:'none',background:'transparent',color:textSecondary,cursor:'pointer'}}><Paperclip size={17}/></button>
            <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder={`Message ${selectedContact.name}...`} style={{flex:1,border:'none',outline:'none',background:'transparent',color:textPrimary,fontSize:13.5}}/>
            <button onClick={sendMessage} style={{width:40,height:40,border:'none',borderRadius:11,background:'linear-gradient(135deg,#3b82f6,#10b981)',color:'#fff',cursor:'pointer'}}><Send size={15}/></button>
          </div>
          <p style={{textAlign:'center',fontSize:9,color:textSecondary,marginTop:7}}>P2P messaging interface • Firebase realtime sync can be connected next</p>
        </div>
      </section>
    </motion.div>
  );
}

function HealthUtilityDemoPage({ type, panelBg, panelBorder, textPrimary, textSecondary, inputBg, inputBorder, isDarkMode }) {
  const config = {
    vault: { icon:<FolderHeart size={22}/>, title:'Medical Vault', eyebrow:'Private Health Records', desc:'A secure space to organize reports, prescriptions and important health documents.', cards:[['Recent Report','Blood Test · 18 Aug 2026','Uploaded'],['Prescription','Dr. Amit Patel · 15 Aug 2026','Active'],['Health Summary','Wellness Overview · 10 Aug 2026','Updated']] },
    events: { icon:<CalendarHeart size={22}/>, title:'Health Events', eyebrow:'Appointments & Activities', desc:'Keep consultations, wellness sessions and health challenges together.', cards:[['Doctor Appointment','Cardiology · Tomorrow · 11:30 AM','Confirmed'],['10K Challenge','Ends this Sunday','72% complete'],['Community Q&A','Mental Wellness · Friday · 7 PM','Registered']] },
    saved: { icon:<Bookmark size={22}/>, title:'Saved Items', eyebrow:'Your Health Library', desc:'Articles, videos, posts and resources you decided to revisit later.', cards:[['Saved Article','How consistent sleep improves recovery','Read later'],['Saved Post','5-minute mobility routine','Health Groups'],['Saved Video','Beginner breathing exercise','8 min']] },
    donors: { icon:<HeartHandshake size={22}/>, title:'Find Donors', eyebrow:'Community Support', desc:'Demo discovery experience for blood and emergency donor connections.', cards:[['A+ Donors','3 verified nearby matches','Available'],['O+ Donors','8 community matches','Available'],['Emergency Network','Trusted contacts & hospitals','Protected']] },
    tools: { icon:<Calculator size={22}/>, title:'AI Health Tools', eyebrow:'Everyday Health Utilities', desc:'A toolkit for tracking behaviour, understanding trends and preparing better questions for professionals.', cards:[['Health Score','Behaviour-based wellness score','Open'],['Goal Planner','Build a weekly routine','Open'],['Question Builder','Prepare for a doctor visit','Open']] }
  }[type];
  return <motion.div key={type} variants={{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20}}} initial="initial" animate="animate" exit="exit" style={{height:'100%',overflowY:'auto',position:'absolute',inset:0,padding:'40px 36px 120px'}}>
    <div style={{maxWidth:1050,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,color:'#60a5fa',fontSize:11,fontWeight:800,letterSpacing:'.13em',textTransform:'uppercase',marginBottom:10}}>{config.icon}{config.eyebrow}</div>
      <h2 style={{fontSize:34,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:9}}>{config.title}</h2>
      <p style={{maxWidth:760,color:textSecondary,fontSize:14,lineHeight:1.65,marginBottom:25}}>{config.desc}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:16}}>{config.cards.map(([title,desc,status])=><div key={title} style={{background:panelBg,border:`1px solid ${panelBorder}`,borderRadius:20,padding:22,backdropFilter:'blur(35px)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><div style={{width:42,height:42,borderRadius:13,background:'rgba(59,130,246,.1)',display:'grid',placeItems:'center',color:'#60a5fa'}}>{config.icon}</div><span style={{fontSize:9.5,fontWeight:800,color:'#34d399',background:'rgba(16,185,129,.08)',padding:'5px 8px',borderRadius:99}}>{status}</span></div><h3 style={{fontSize:16,fontWeight:900,marginBottom:6}}>{title}</h3><p style={{fontSize:12,color:textSecondary,lineHeight:1.55}}>{desc}</p><button style={{marginTop:18,width:'100%',padding:10,borderRadius:11,border:`1px solid ${panelBorder}`,background:'transparent',color:textPrimary,fontWeight:700,cursor:'pointer'}}>Open Demo</button></div>)}</div>
      <div style={{marginTop:20,padding:18,borderRadius:18,border:`1px solid ${panelBorder}`,background:'rgba(59,130,246,.05)'}}><p style={{fontSize:11,color:textSecondary,lineHeight:1.6}}><strong style={{color:textPrimary}}>Demo status:</strong> This page is intentionally frontend-first. Real documents, appointments, donor matching and AI tools should be connected to authenticated Firebase data before production use.</p></div>
    </div>
  </motion.div>;
}

function ProfileExperiencePanel({ userName, userEmail, userPhoto, panelBg, panelBorder, textPrimary, textSecondary, inputBg, inputBorder }) {
  const activities = [
    ['Completed 10K Steps Challenge', 'Today · +120 XP', <Trophy size={16}/>],
    ['Joined Diabetes Care community', 'Yesterday · Health Groups', <UsersRound size={16}/>],
    ['Saved a recovery guide', '2 days ago · Saved Items', <Bookmark size={16}/>],
    ['Consulted Dr. Amit Patel', '4 days ago · Healthcare', <Stethoscope size={16}/>]
  ];
  return <motion.div key="profile" variants={{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:-20}}} initial="initial" animate="animate" exit="exit" style={{height:'100%',overflowY:'auto',position:'absolute',inset:0,padding:'36px 36px 120px'}}>
    <div style={{maxWidth:1050,margin:'0 auto'}}>
      <div style={{background:panelBg,border:`1px solid ${panelBorder}`,borderRadius:24,overflow:'hidden',backdropFilter:'blur(35px)'}}>
        <div style={{height:150,background:'linear-gradient(135deg,#172554,#0f766e,#1e3a8a)',position:'relative'}}><div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 80% 20%,rgba(96,165,250,.25),transparent 35%)'}}/></div>
        <div style={{padding:'0 28px 28px',marginTop:-52}}>
          <img src={userPhoto} alt="Profile" style={{width:104,height:104,borderRadius:'50%',border:`5px solid ${isDarkModeBg(panelBg)}`,objectFit:'cover'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:20,marginTop:14,flexWrap:'wrap'}}><div><div style={{display:'flex',alignItems:'center',gap:8}}><h2 style={{fontSize:27,fontWeight:900}}>{userName}</h2><BadgeCheck size={18} color="#34d399"/></div><p style={{fontSize:13,color:textSecondary,marginTop:4}}>{userEmail}</p><p style={{fontSize:12,color:textSecondary,marginTop:7}}>Health-conscious user · Digital Health Identity Level 7</p></div><button style={{padding:'10px 15px',borderRadius:11,border:'1px solid #3b82f6',background:'transparent',color:'#60a5fa',fontWeight:800,cursor:'pointer'}}>Edit Profile</button></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:24}}>{[['Health Score','78'],['Connections','42'],['Challenges','12'],['Streak','9 days']].map(([a,b])=><div key={a} style={{padding:16,borderRadius:15,background:'rgba(255,255,255,.025)',border:`1px solid ${panelBorder}`}}><p style={{fontSize:10,color:textSecondary}}>{a}</p><p style={{fontSize:21,fontWeight:900,marginTop:6}}>{b}</p></div>)}</div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.15fr .85fr',gap:18,marginTop:18}}>
        <div style={{background:panelBg,border:`1px solid ${panelBorder}`,borderRadius:22,padding:22,backdropFilter:'blur(35px)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:15}}><div><p style={{fontSize:10,color:'#60a5fa',fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase'}}>Profile Timeline</p><h3 style={{fontSize:19,fontWeight:900,marginTop:4}}>Recent Activities</h3></div><Activity size={18} color="#60a5fa"/></div>{activities.map(([title,meta,icon],i)=><div key={title} style={{display:'flex',gap:12,padding:'14px 0',borderTop:i===0?'none':`1px solid ${panelBorder}`}}><div style={{width:36,height:36,borderRadius:11,display:'grid',placeItems:'center',background:'rgba(59,130,246,.1)',color:'#60a5fa'}}>{icon}</div><div><p style={{fontSize:12.5,fontWeight:800}}>{title}</p><p style={{fontSize:10.5,color:textSecondary,marginTop:4}}>{meta}</p></div></div>)}</div>
        <div style={{background:panelBg,border:`1px solid ${panelBorder}`,borderRadius:22,padding:22,backdropFilter:'blur(35px)'}}><h3 style={{fontSize:19,fontWeight:900,marginBottom:15}}>Status Snapshot</h3>{[['Current Goal','Improve consistency'],['Best Habit','Walking'],['Community Level','Active'],['Privacy','Protected']].map(([a,b])=><div key={a} style={{padding:'13px 0',borderTop:`1px solid ${panelBorder}`}}><p style={{fontSize:10,color:textSecondary}}>{a}</p><p style={{fontSize:13,fontWeight:800,marginTop:3}}>{b}</p></div>)}<div style={{marginTop:12,padding:13,borderRadius:13,background:'rgba(16,185,129,.06)',border:'1px solid rgba(16,185,129,.12)'}}><p style={{fontSize:11,color:'#34d399',fontWeight:800}}>PROFILE HEALTH</p><p style={{fontSize:11,color:textSecondary,lineHeight:1.55,marginTop:4}}>Your public profile focuses on goals, achievements and community—not sensitive medical records.</p></div></div>
      </div>
    </div>
  </motion.div>;
}

function isDarkModeBg(panelBg) {
  return panelBg.includes('8, 15, 30') ? '#08101f' : '#ffffff';
}

function AuthenticatedApp({ onLogout, scrollProgressRef, isDarkMode, setIsDarkMode }) {
  const [activeTab, setActiveTab] = useState('home'); 
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showHealthMenu, setShowHealthMenu] = useState(false); // <--- New State for Health Menu Dropdown
  const [messages, setMessages] = useState([{ sender: 'ai', text: "Hello! I'm your HealthCatch AI Counselor. How are you feeling today?" }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [healthMode, setHealthMode] = useState('wellness');
  const [globalSearch, setGlobalSearch] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const profilePicRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => { scrollProgressRef.current = 0; }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading, activeTab]);

  // Global Click Listener for Dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setShowHealthMenu(false); // <--- Added here
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() && !selectedFile) return;
    const userMessage = { sender: 'user', text: input || (selectedFile ? `Uploaded: ${selectedFile.name}` : '') };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages); setIsLoading(true);

    const formData = new FormData();
    formData.append("message", input);
    if (selectedFile) formData.append("file", selectedFile);
    setInput(''); setSelectedFile(null);

    // Abort the request after 35s instead of letting it hang forever and leaving
    // the "thinking" spinner stuck on screen if the backend/AI provider is slow.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', { method: 'POST', body: formData, signal: controller.signal });
      const data = await response.json();
      setMessages([...newMessages, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      const text = err.name === 'AbortError' ? "That's taking longer than expected. Please try again." : "Sorry, network issue. Please try again.";
      setMessages([...newMessages, { sender: 'ai', text }]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const user = auth.currentUser;
  const userName = user?.displayName || "Wellness User";
  const userEmail = user?.email || "No email provided"; 
  const userPhoto = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;

  const panelBg = isDarkMode ? 'rgba(8, 15, 30, 0.55)' : 'rgba(255, 255, 255, 0.7)';
  const panelBorder = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(148,163,184,0.7)' : 'rgba(71,85,105,0.7)';
  const inputBg = isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)';
  const inputBorder = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)';

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', height: '100vh', overflow: 'hidden', color: textPrimary }}>
      {/* ── SIDEBAR ── */}
      <motion.div initial={{ x: -280 }} animate={{ x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ width: '256px', display: 'flex', flexDirection: 'column', background: panelBg, backdropFilter: 'blur(50px)', borderRight: `1px solid ${panelBorder}` }}>
        <div style={{ padding: '28px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={17} color="#fff" />
            </div>
            <span style={{ fontSize: '17px', fontWeight: 800, color: '#60a5fa', fontFamily: "'Space Grotesk', sans-serif" }}>HealthCatch</span>
          </div>

          <div style={{ background: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: `1px solid ${panelBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '3px solid #3b82f6', marginBottom: '10px' }}>
               <img src={userPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: textPrimary }}>{userName}</h3>
            <p style={{ fontSize: '11px', color: textSecondary, marginTop: '2px', padding: '0 4px' }}>Aspiring Wellness Journey</p>
            <div style={{ width: '100%', height: '1px', background: panelBorder, margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '12px' }}>
              <span style={{ color: textSecondary }}>Connections</span>
              <span style={{ color: '#3b82f6', fontWeight: 600 }}>42</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <SidebarBtn icon={<LayoutDashboard size={17} />} label="Dashboard" tab="dashboard" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
            <SidebarBtn icon={<CircleGauge size={17} />} label="Health Identity" tab="identity" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
            <SidebarBtn icon={<Sparkle size={17} />} label="AI Health Coach" tab="coach" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
            <SidebarBtn icon={<Trophy size={17} />} label="Smart Challenges" tab="smart-challenges" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
            <SidebarBtn icon={<UsersRound size={17} />} label="Health Groups" tab="health-groups" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
            <SidebarBtn icon={<UserCheck size={17} />} label="Professional Network" tab="professionals" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
            <SidebarBtn icon={<BriefcaseBusiness size={17} />} label="Healthcare Jobs" tab="jobs" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
            <SidebarBtn icon={<Stethoscope size={17} />} label="Consult Doctors" tab="doctors" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
            <SidebarBtn icon={<MessageSquare size={17} />} label="AI Chatbot" tab="chat" active={activeTab} set={setActiveTab} isDark={isDarkMode} />
          </div>
        </div>
      </motion.div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Topbar */}
        <motion.div initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} style={{ height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: `1px solid ${panelBorder}`, background: panelBg, backdropFilter: 'blur(50px)', position: 'relative', zIndex: 50 }}>
          
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
            <input type="text" placeholder="Search people, doctors, groups, jobs..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '11px', background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, padding: '0 14px 0 40px', outline: 'none' }} />
          </div>

          {/* Center: Top Navigation Icons */}
          <div style={{ display: 'flex', justifyContent: 'center', flex: 1, gap: '15px' }}>
            <button title="Home" onClick={() => setActiveTab('home')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: activeTab === 'home' ? '#3b82f6' : textSecondary, borderBottom: activeTab === 'home' ? '3px solid #3b82f6' : '3px solid transparent', padding: '10px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <Home size={26} />
            </button>
            <button title="Health Circle" onClick={() => setActiveTab('network')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: activeTab === 'network' ? '#3b82f6' : textSecondary, borderBottom: activeTab === 'network' ? '3px solid #3b82f6' : '3px solid transparent', padding: '10px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <Users size={26} />
            </button>
            <button title="Health Market" onClick={() => setActiveTab('market')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: activeTab === 'market' ? '#3b82f6' : textSecondary, borderBottom: activeTab === 'market' ? '3px solid #3b82f6' : '3px solid transparent', padding: '10px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <ShoppingBag size={26} />
            </button>
            <button title="Challenges" onClick={() => setActiveTab('smart-challenges')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: activeTab === 'smart-challenges' ? '#3b82f6' : textSecondary, borderBottom: activeTab === 'smart-challenges' ? '3px solid #3b82f6' : '3px solid transparent', padding: '10px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <Target size={26} />
            </button>
            <button title="Groups" onClick={() => setActiveTab('health-groups')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: activeTab === 'health-groups' ? '#3b82f6' : textSecondary, borderBottom: activeTab === 'health-groups' ? '3px solid #3b82f6' : '3px solid transparent', padding: '10px 30px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <Globe size={26} />
            </button>
          </div>

          {/* Right: Icons & Profile Menu */}
          <div ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button title="Messaging" onClick={() => setActiveTab('messaging')} style={{ width: 36, height: 36, borderRadius: '10px', background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', color: textSecondary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <MessageCircle size={16} />
            </button>

            {/* NEW: Health Menu (9-dot style) */}
            <div style={{ position: 'relative' }}>
              <button title="Health Menu" onClick={() => { setShowHealthMenu(!showHealthMenu); setShowNotifications(false); setShowProfileMenu(false); }} style={{ width: 36, height: 36, borderRadius: '10px', background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', color: textSecondary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <Grid size={16} />
              </button>
              <AnimatePresence>
                {showHealthMenu && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} style={{ position: 'absolute', right: 0, top: '48px', width: '320px', borderRadius: '16px', background: isDarkMode ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)', border: `1px solid ${panelBorder}`, backdropFilter: 'blur(40px)', zIndex: 100, overflow: 'hidden', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6)' }}>
                    <div style={{ padding: '16px', borderBottom: `1px solid ${panelBorder}` }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Health Menu</h3>
                    </div>
                    <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { icon: <FolderHeart size={20}/>, label: 'Medical Vault', tab: 'vault' },
                        { icon: <CalendarHeart size={20}/>, label: 'Events', tab: 'events' },
                        { icon: <Bookmark size={20}/>, label: 'Saved Items', tab: 'saved' },
                        { icon: <HeartHandshake size={20}/>, label: 'Find Donors', tab: 'donors' },
                        { icon: <Calculator size={20}/>, label: 'AI Tools', tab: 'tools' }
                      ].map((item, idx) => (
                        <button key={idx} onClick={() => { setActiveTab(item.tab); setShowHealthMenu(false); }} style={{ background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${panelBorder}`, borderRadius: '12px', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: textPrimary, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(59,130,246,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background=isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}>
                          <div style={{ color: '#3b82f6' }}>{item.icon}</div>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ position: 'relative' }}>
              <button title="Notifications" onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); setShowHealthMenu(false); }} style={{ width: 36, height: 36, borderRadius: '10px', background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', color: textSecondary, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Bell size={16} /><span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: '#ef4444', borderRadius: '50%' }} />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} style={{ position: 'absolute', right: 0, top: '48px', width: '280px', borderRadius: '16px', background: isDarkMode ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)', border: `1px solid ${panelBorder}`, backdropFilter: 'blur(40px)', zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: `1px solid ${panelBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '13px' }}>
                      <span>Notifications</span><span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '20px' }}>New</span>
                    </div>
                    <div style={{ padding: '14px 18px' }}>
                      <p style={{ fontSize: '12.5px', fontWeight: 600 }}>Welcome to HealthCatch!</p>
                      <p style={{ fontSize: '11.5px', color: textSecondary, marginTop: '4px' }}>Your AI wellness journey begins now.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ position: 'relative' }}>
              <div onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); setShowHealthMenu(false); }} style={{ width: 36, height: 36, borderRadius: '10px', overflow: 'hidden', border: '2px solid rgba(59,130,246,0.4)', cursor: 'pointer' }}>
                <img src={userPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} style={{ position: 'absolute', right: 0, top: '48px', width: '280px', borderRadius: '16px', background: isDarkMode ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)', border: `1px solid ${panelBorder}`, backdropFilter: 'blur(40px)', zIndex: 100, overflow: 'hidden', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.6)' }}>
                    <div style={{ padding: '16px', borderBottom: `1px solid ${panelBorder}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <img src={userPhoto} alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '15px' }}>{userName}</p>
                          <p style={{ fontSize: '12px', color: textSecondary }}>Aspiring Wellness</p>
                        </div>
                      </div>
                      <button onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }} style={{ width: '100%', padding: '6px 0', borderRadius: '20px', border: `1px solid #3b82f6`, background: 'transparent', color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e)=>e.currentTarget.style.background='rgba(59,130,246,0.1)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        View Profile
                      </button>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }} onMouseEnter={(e)=>e.currentTarget.style.background=isDarkMode?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        <Settings size={18} color={textSecondary} /> Settings & Privacy
                      </button>
                      <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }} onMouseEnter={(e)=>e.currentTarget.style.background=isDarkMode?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        <HelpCircle size={18} color={textSecondary} /> Help & Support
                      </button>
                      <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }} onMouseEnter={(e)=>e.currentTarget.style.background=isDarkMode?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           {isDarkMode ? <Moon size={18} color={textSecondary} /> : <Sun size={18} color={textSecondary} />} 
                           Display & Accessibility
                        </div>
                      </button>
                      <button onClick={() => signOut(auth).then(onLogout)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }} onMouseEnter={(e)=>e.currentTarget.style.background=isDarkMode?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        <LogOut size={18} color={textSecondary} /> Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Pages Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            
            {/* HEALTH MARKET */}
            {activeTab === 'market' && (
              <motion.div key="market" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ height: '100%', overflowY: 'auto', position: 'absolute', inset: 0, padding: '40px 36px 120px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                  
                  {/* Disclaimer Warning */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px 20px', borderRadius: '16px', marginBottom: '30px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '13.5px', color: '#fca5a5', lineHeight: 1.5 }}>
                      <strong>Disclaimer:</strong> This marketplace is for informational purposes only. The purchase and consumption of any medication or supplement are solely your responsibility. Always consult a registered practitioner.
                    </p>
                  </div>

                  <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '30px', fontFamily: "'Space Grotesk', sans-serif" }}>Health Market</h2>

                  {/* Market Category: AI Recommended */}
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={20} color="#3b82f6" /> AI Recommended for You</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                      {[
                        { title: 'Multivitamin Complex', desc: 'Based on your recent fatigue log.', price: '450', shop: 'Apollo Pharmacy', phone: '+91 9876543210' },
                        { title: 'Omega 3 Fish Oil', desc: 'To support joint health.', price: '899', shop: 'Wellness Medico', phone: '+91 8765432109' }
                      ].map((item, i) => (
                        <div key={i} style={{ background: panelBg, padding: '20px', borderRadius: '20px', border: `1px solid ${panelBorder}`, backdropFilter: 'blur(40px)' }}>
                          <div style={{ width: '100%', height: '120px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pill size={40} color="#60a5fa" /></div>
                          <h4 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{item.title}</h4>
                          <p style={{ fontSize: '12.5px', color: textSecondary, marginBottom: '12px' }}>{item.desc}</p>
                          <p style={{ fontSize: '20px', fontWeight: 800, color: '#34d399', marginBottom: '16px' }}>₹{item.price}</p>
                          <div style={{ borderTop: `1px solid ${panelBorder}`, paddingTop: '12px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600 }}>{item.shop}</p>
                            <p style={{ fontSize: '11.5px', color: textSecondary, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}><Phone size={12} /> {item.phone}</p>
                          </div>
                          <button style={{ width: '100%', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', padding: '12px', borderRadius: '12px', marginTop: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Buy Now</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Category: Doctor Prescribed */}
                  <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Stethoscope size={20} color="#10b981" /> Prescribed by Your Doctors</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                      {[
                        { title: 'Paracetamol 500mg', desc: 'Prescribed by Dr. Amit Patel', price: '45', shop: 'Frank Ross Pharmacy', phone: '+91 7654321098' },
                      ].map((item, i) => (
                        <div key={i} style={{ background: panelBg, padding: '20px', borderRadius: '20px', border: `1px solid ${panelBorder}`, backdropFilter: 'blur(40px)' }}>
                          <div style={{ width: '100%', height: '120px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pill size={40} color="#10b981" /></div>
                          <h4 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{item.title}</h4>
                          <p style={{ fontSize: '12.5px', color: textSecondary, marginBottom: '12px' }}>{item.desc}</p>
                          <p style={{ fontSize: '20px', fontWeight: 800, color: '#34d399', marginBottom: '16px' }}>₹{item.price}</p>
                          <div style={{ borderTop: `1px solid ${panelBorder}`, paddingTop: '12px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600 }}>{item.shop}</p>
                            <p style={{ fontSize: '11.5px', color: textSecondary, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}><Phone size={12} /> {item.phone}</p>
                          </div>
                          <button style={{ width: '100%', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', padding: '12px', borderRadius: '12px', marginTop: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>Buy Now</button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ height: '100%', overflowY: 'auto', position: 'absolute', inset: 0, padding: '40px 36px 120px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Sparkles size={22} color="#3b82f6" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase' }}>Dashboard</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 900, marginBottom: '8px', fontFamily: "'Space Grotesk', sans-serif" }}>Welcome back, <span className="text-gradient-hero">{userName.split(' ')[0]}</span></h2>
                  <p style={{ fontSize: '15px', color: textSecondary, marginBottom: '40px' }}>Your mind. Your journey. Let's explore today.</p>

                  <div style={{ display: 'flex', gap: '18px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    <motion.div style={{ flex: '1 1 220px', padding: '28px 24px', borderRadius: '22px', background: panelBg, backdropFilter: 'blur(40px)', border: `1px solid ${panelBorder}` }}>
                      <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: textSecondary, marginBottom: '14px' }}>Mood Score</h3>
                      <p style={{ fontSize: '38px', fontWeight: 900, color: '#34d399', fontFamily: "'Space Grotesk', sans-serif" }}>7.2 <span style={{ fontSize: '14px', color: textSecondary }}>/ 10</span></p>
                    </motion.div>
                    <motion.div style={{ flex: '1 1 220px', padding: '28px 24px', borderRadius: '22px', background: panelBg, backdropFilter: 'blur(40px)', border: `1px solid ${panelBorder}` }}>
                      <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: textSecondary, marginBottom: '14px' }}>Assessments</h3>
                      <p style={{ fontSize: '38px', fontWeight: 900, color: '#60a5fa', fontFamily: "'Space Grotesk', sans-serif" }}>3 <span style={{ fontSize: '14px', color: textSecondary }}>Completed</span></p>
                    </motion.div>
                    <motion.div style={{ flex: '1 1 220px', padding: '28px 24px', borderRadius: '22px', background: panelBg, backdropFilter: 'blur(40px)', border: `1px solid ${panelBorder}` }}>
                      <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: textSecondary, marginBottom: '14px' }}>Community</h3>
                      <p style={{ fontSize: '38px', fontWeight: 900, color: '#a78bfa', fontFamily: "'Space Grotesk', sans-serif" }}>12 <span style={{ fontSize: '14px', color: textSecondary }}>Posts</span></p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* HOME / SOCIAL FEED */}
            {activeTab === 'home' && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ height: '100%', overflowY: 'auto', position: 'absolute', inset: 0, padding: '40px 36px 120px' }}>
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px', fontFamily: "'Space Grotesk', sans-serif" }}>Home Feed</h2>
                  
                  <div style={{ background: panelBg, padding: '24px', borderRadius: '24px', border: `1px solid ${panelBorder}`, marginBottom: '30px', backdropFilter: 'blur(40px)' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <img src={userPhoto} alt="User" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #3b82f6' }} />
                      <input type="text" placeholder="Share your health journey, tips or ask a question..." style={{ flex: 1, background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '20px', padding: '0 20px', color: textPrimary, outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingLeft: '60px' }}>
                      <button style={{ background: 'none', border: 'none', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}><ImageIcon size={18} /> Photo/Video</button>
                      <button style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Post</button>
                    </div>
                  </div>

                  {MOCK_POSTS.map(post => (
                    <div key={post.id} style={{ background: panelBg, padding: '24px', borderRadius: '24px', border: `1px solid ${panelBorder}`, marginBottom: '24px', backdropFilter: 'blur(40px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>{post.name.charAt(0)}</div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '15px' }}>{post.name}</p>
                            <p style={{ fontSize: '12.5px', color: textSecondary }}>{post.time}</p>
                          </div>
                        </div>
                        <button style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'none', padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer' }}><UserPlus size={16} /> Follow</button>
                      </div>
                      <p style={{ lineHeight: 1.6, marginBottom: '16px', fontSize: '15px' }}>{post.text}</p>
                      {post.img && <img src={post.img} alt="Post" style={{ width: '100%', borderRadius: '16px', marginBottom: '16px' }} />}
                      <div style={{ display: 'flex', gap: '24px', borderTop: `1px solid ${panelBorder}`, paddingTop: '16px', color: textSecondary }}>
                        <button style={{ background: 'none', border: 'none', color: textSecondary, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}><ThumbsUp size={18} /> {post.likes}</button>
                        <button style={{ background: 'none', border: 'none', color: textSecondary, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}><MessageCircle size={18} /> {post.comments}</button>
                        <button style={{ background: 'none', border: 'none', color: textSecondary, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}><Share2 size={18} /> Share</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* HEALTH CIRCLE (FRIENDS / CONNECTIONS FEED) */}
            {activeTab === 'network' && (
              <motion.div key="network" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ height: '100%', overflowY: 'auto', position: 'absolute', inset: 0, padding: '30px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                  
                  <div style={{ width: '280px', flexShrink: 0, background: panelBg, borderRadius: '24px', padding: '24px', border: `1px solid ${panelBorder}`, height: 'fit-content', backdropFilter: 'blur(40px)' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '20px', fontFamily: "'Space Grotesk', sans-serif" }}>Health Circle</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['Friend requests', 'Suggestions', 'All friends', 'Connections', 'Following & followers', 'Groups', 'Events', 'Doctors Section', 'Patients Section'].map((item, i) => (
                        <button key={i} style={{ background: i === 0 ? 'rgba(59,130,246,0.1)' : 'transparent', border: 'none', color: i === 0 ? '#3b82f6' : textPrimary, padding: '12px 16px', borderRadius: '12px', textAlign: 'left', fontWeight: i === 0 ? 700 : 500, cursor: 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {item} {i === 0 && <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>3</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ background: panelBg, borderRadius: '24px', padding: '30px', border: `1px solid ${panelBorder}`, backdropFilter: 'blur(40px)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>People you may know / Requests</h2>
                        <span style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>See all</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {[
                          { id: 1, name: 'Samyajit Khan', role: 'CSE Student', extra: '3 mutual friends', type: 'request' },
                          { id: 2, name: 'Ankita Halder', role: 'Health Enthusiast', extra: 'Followed by 2K', type: 'request' },
                          { id: 3, name: 'Dr. Radha Krishna', role: 'Cardiologist', extra: '15 connections', type: 'suggest' },
                          { id: 4, name: 'Soumabrata M.', role: 'Business Analyst', extra: 'Open to connect', type: 'suggest' },
                        ].map(person => (
                          <div key={person.id} style={{ background: isDarkMode ? 'rgba(0,0,0,0.4)' : '#ffffff', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${panelBorder}`, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '80px', background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)' }}></div>
                            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <div style={{ width: 70, height: 70, borderRadius: '50%', border: `4px solid ${isDarkMode ? '#0f172a' : '#fff'}`, background: '#cbd5e1', margin: '-35px auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} alt={person.name} style={{ width: '100%', height: '100%' }} />
                              </div>
                              <h4 style={{ fontSize: '16px', fontWeight: 700, textAlign: 'center', marginBottom: '4px' }}>{person.name}</h4>
                              <p style={{ fontSize: '12px', color: textSecondary, textAlign: 'center', marginBottom: '6px', fontWeight: 500 }}>{person.role}</p>
                              <p style={{ fontSize: '11px', color: textSecondary, textAlign: 'center', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Users size={12} /> {person.extra}
                              </p>
                              
                              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {person.type === 'request' ? (
                                  <>
                                    <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>Confirm</button>
                                    <button style={{ background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: textPrimary, border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>Delete</button>
                                  </>
                                ) : (
                                  <button style={{ background: 'transparent', color: '#3b82f6', border: '2px solid #3b82f6', padding: '8px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}>Connect</button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DOCTORS & APPOINTMENTS */}
            {activeTab === 'doctors' && (
              <motion.div key="doctors" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ height: '100%', overflowY: 'auto', position: 'absolute', inset: 0, padding: '40px 36px 120px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px', fontFamily: "'Space Grotesk', sans-serif" }}>Consult Top Specialists</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {MOCK_DOCTORS.map(doc => (
                      <div key={doc.id} style={{ background: panelBg, padding: '28px', borderRadius: '24px', border: `1px solid ${panelBorder}`, backdropFilter: 'blur(40px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>{doc.name.charAt(4)}</div>
                          <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{doc.name}</h3>
                            <p style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{doc.spec}</p>
                            <p style={{ color: '#fbbf24', fontSize: '13.5px', marginTop: '4px', fontWeight: 600 }}>⭐ {doc.rating}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <button style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: `1px solid rgba(59,130,246,0.3)`, padding: '14px', borderRadius: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Calendar size={18} /> Book Appointment
                          </button>
                          <button style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                            <Video size={18} /> Join Video Call
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI CHATBOT */}
            {activeTab === 'chat' && (
              <motion.div key="chat" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'absolute', inset: 0 }}>
                <div style={{ flex: 1, padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', scrollbarWidth: 'none' }}>
                  {messages.map((msg, index) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={index} style={{ display: 'flex', gap: '12px', maxWidth: '70%', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '11px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.sender === 'user' ? 'linear-gradient(135deg, #3b82f6, #10b981)' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'), color: msg.sender === 'user' ? '#fff' : textSecondary, border: msg.sender === 'user' ? 'none' : `1px solid ${panelBorder}` }}>
                        {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                      </div>
                      <div style={{ padding: '14px 18px', borderRadius: '16px', background: msg.sender === 'user' ? 'linear-gradient(135deg, #3b82f6, #10b981)' : panelBg, border: msg.sender === 'user' ? 'none' : `1px solid ${panelBorder}`, color: msg.sender === 'user' ? '#fff' : textPrimary, borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px', borderTopLeftRadius: msg.sender === 'user' ? '16px' : '4px', backdropFilter: msg.sender === 'user' ? 'none' : 'blur(30px)' }}>
                        <p style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '11px', background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${panelBorder}` }}><Bot size={15} style={{ color: textSecondary }} /></div>
                      <div style={{ padding: '14px 22px', borderRadius: '16px', borderTopLeftRadius: '4px', background: panelBg, border: `1px solid ${panelBorder}`, backdropFilter: 'blur(30px)' }}>
                        <Loader2 size={16} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div style={{ padding: '18px 28px', borderTop: `1px solid ${panelBorder}`, background: panelBg, backdropFilter: 'blur(50px)' }}>
                  {selectedFile && (
                    <div style={{ maxWidth: '700px', margin: '0 auto 10px', padding: '10px 16px', borderRadius: '14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Paperclip size={14} /> {selectedFile.name}</span>
                      <button onClick={() => setSelectedFile(null)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', fontSize: '14px' }}>✕</button>
                    </div>
                  )}
                  <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', borderRadius: '18px', background: inputBg, border: `1px solid ${inputBorder}` }}>
                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files[0] && setSelectedFile(e.target.files[0])} style={{ display: 'none' }} accept=".pdf, image/*" />
                    <button onClick={() => fileInputRef.current.click()} style={{ width: 42, height: 42, borderRadius: '12px', border: 'none', background: 'transparent', color: textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Paperclip size={18} /></button>
                    <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Message HealthCatch AI..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: textPrimary, fontSize: '14.5px', fontFamily: "'Inter', sans-serif" }} />
                    <button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !selectedFile)} style={{ width: 42, height: 42, borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #10b981)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (isLoading || (!input.trim() && !selectedFile)) ? 0.4 : 1, transition: 'opacity 0.2s', boxShadow: '0 4px 16px -4px rgba(59,130,246,0.4)' }}><Send size={16} style={{ marginLeft: '2px' }} /></button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* NEW HEALTHCATCH DIFFERENTIATORS */}
            {activeTab === 'identity' && (
              <motion.div key="identity" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <HealthIdentityPanel
                  userName={userName}
                  userEmail={userEmail}
                  userPhoto={userPhoto}
                  onOpenProfile={() => setActiveTab('profile')}
                  panelBg={panelBg}
                  panelBorder={panelBorder}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                />
              </motion.div>
            )}

            {activeTab === 'coach' && (
              <motion.div key="coach" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <AIHealthCoachPanel onOpenChat={() => setActiveTab('chat')} panelBg={panelBg} panelBorder={panelBorder} textPrimary={textPrimary} textSecondary={textSecondary} />
              </motion.div>
            )}

            {activeTab === 'smart-challenges' && (
              <motion.div key="smart-challenges" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <SmartChallengesPanel userPhoto={userPhoto} panelBg={panelBg} panelBorder={panelBorder} textPrimary={textPrimary} textSecondary={textSecondary} />
              </motion.div>
            )}

            {activeTab === 'health-groups' && (
              <motion.div key="health-groups" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <HealthGroupsPanel panelBg={panelBg} panelBorder={panelBorder} textPrimary={textPrimary} textSecondary={textSecondary} />
              </motion.div>
            )}

            {activeTab === 'professionals' && (
              <motion.div key="professionals" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <ProfessionalNetworkPanel panelBg={panelBg} panelBorder={panelBorder} textPrimary={textPrimary} textSecondary={textSecondary} onOpenDoctors={() => setActiveTab('doctors')} />
              </motion.div>
            )}

            {activeTab === 'jobs' && (
              <motion.div key="jobs" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <HealthJobsPanel panelBg={panelBg} panelBorder={panelBorder} textPrimary={textPrimary} textSecondary={textSecondary} />
              </motion.div>
            )}

            {/* ENHANCED: P2P messaging + Health Menu demo pages + richer profile */}
            {activeTab === 'messaging' && (
              <P2PMessagingPanel
                userPhoto={userPhoto}
                userName={userName}
                panelBg={panelBg}
                panelBorder={panelBorder}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                inputBg={inputBg}
                inputBorder={inputBorder}
                isDarkMode={isDarkMode}
              />
            )}

            {['vault', 'events', 'saved', 'donors', 'tools'].includes(activeTab) && (
              <HealthUtilityDemoPage
                type={activeTab}
                panelBg={panelBg}
                panelBorder={panelBorder}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                inputBg={inputBg}
                inputBorder={inputBorder}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileExperiencePanel
                userName={userName}
                userEmail={userEmail}
                userPhoto={userPhoto}
                panelBg={panelBg}
                panelBorder={panelBorder}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                inputBg={inputBg}
                inputBorder={inputBorder}
              />
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   §6  ROOT APP
   ═══════════════════════════════════════════════════════════════ */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const scrollProgressRef = useRef(0);

  return (
    <>
      <GlobalStyles isDarkMode={isDarkMode} />
      <Global3DBackground isLoggedIn={isLoggedIn} scrollProgress={scrollProgressRef} isDarkMode={isDarkMode} />

      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <CinematicLanding onLogin={() => setIsLoggedIn(true)} scrollProgressRef={scrollProgressRef} />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <AuthenticatedApp onLogout={() => setIsLoggedIn(false)} scrollProgressRef={scrollProgressRef} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;