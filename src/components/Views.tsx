/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, LayoutDashboard, PenLine, Search, Bell, Menu, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Droplets, Heart, Smile, Zap, Wind, Moon, Plus, Sparkles, MessageCircle, Share2, Info, Activity, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface ComponentProps {
  setActiveTab: (tab: string) => void;
  isDark: boolean;
}

// --- CONSTANTS ---

const PHASES_DATA = {
  MENSTRUATION: { 
    color: '#991b1b', // Dark Red
    label: 'Menstruation', 
    icon: Droplets, 
    description: 'Release & Renewal',
    hormone: 'Low Estrogen & Progesterone',
    biomarker: 'Uterine lining shedding',
    glow: 'rgba(153, 27, 27, 0.3)'
  },
  FOLLICULAR: { 
    color: '#f97316', // Orange
    label: 'Follicular', 
    icon: Wind, 
    description: 'Rising Energy',
    hormone: 'Rising Estrogen & FSH',
    biomarker: 'Follicle development',
    glow: 'rgba(249, 115, 22, 0.3)'
  },
  OVULATION: { 
    color: '#a78bfa', // Light Purple
    label: 'Ovulation', 
    icon: Sparkles, 
    description: 'High Fertility',
    hormone: 'LH Surge & Estrogen Peak',
    biomarker: 'Egg release',
    glow: 'rgba(167, 139, 250, 0.3)'
  },
  LUTEAL: { 
    color: '#dc2626', // Red
    label: 'Luteal', 
    icon: Moon, 
    description: 'Calm Reflection',
    hormone: 'Progesterone Dominant',
    biomarker: 'Corpus luteum formation',
    glow: 'rgba(220, 38, 38, 0.3)'
  },
} as const;

type PhaseKey = keyof typeof PHASES_DATA;

const PHASES = {
  ...PHASES_DATA,
  get: (day: number, params: { cycleLength: number; periodLength: number; lutealLength: number } = { cycleLength: 28, periodLength: 5, lutealLength: 14 }) => {
    const { cycleLength, periodLength, lutealLength } = params;
    const normalizedDay = ((day - 1) % cycleLength) + 1;
    const ovulationDay = cycleLength - lutealLength || 14;
    
    let key: PhaseKey;
    if (normalizedDay <= periodLength) key = 'MENSTRUATION';
    else if (normalizedDay < ovulationDay) key = 'FOLLICULAR';
    else if (normalizedDay === ovulationDay) key = 'OVULATION';
    else key = 'LUTEAL';
    return { ...PHASES_DATA[key], key };
  }
};

const MORNING_GREETINGS = [
  "Is it just your follicular phase, or are you always this radiant? ✨",
  "Your smile is the only caffeine I need this morning. ☕️",
  "Even the stars are jealous of your inner glow today. 🌟",
  "Just a morning reminder: you're doing amazing, sweet Lumina. ❤️",
  "If beauty were a cycle phase, you’d be in peak ovulation forever. 🌸",
  "Waking up knowing you're out there makes the world a bit softer. ✨",
  "You've got that 'ready to conquer the world' energy today. Go get 'em! 💪",
  "Current forecast: 100% chance of you being absolutely breathtaking. 🌤️",
  "Your vibe today? Absolutely magical. Don't let anyone dim your sparkle. ✨",
  "Just checking in to say you're precious and I'm glad you're here. 🍵",
  "You're like a sunrise—warm, beautiful, and the best part of the day. ☀️",
  "I was going to say something sweet, but you're already the sweetest thing here. 🍯",
  "Your energy is more contagious than a laugh. Keep shining, babe. ✨",
  "Just a reminder that you're a masterpiece in progress. 🎨",
  "Is there an LH surge, or are you just naturally magnetic today? 🧲"
];

const MorningGreeting = ({ userName, onClose }: { userName: string; onClose: () => void }) => {
  const greeting = useMemo(() => {
    const today = new Date();
    const index = (today.getDate() + today.getMonth()) % MORNING_GREETINGS.length;
    return MORNING_GREETINGS[index];
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed bottom-24 left-6 right-6 z-[100] glass-card p-6 rounded-[32px] shadow-2xl border border-primary/20 bg-white/90 backdrop-blur-xl"
    >
      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Heart className="text-primary fill-primary/20 animate-pulse" size={28} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">Morning Whispers</p>
          <p className="text-sm font-serif italic text-on-surface leading-snug">
            "{greeting}"
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-primary/5 rounded-full transition-colors opacity-40 hover:opacity-100">
          <Plus className="rotate-45" size={20} />
        </button>
      </div>
    </motion.div>
  );
};

const avatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aiden&backgroundColor=b6e3f4,ffdfbf,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Brook&backgroundColor=b6e3f4,ffdfbf,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey&backgroundColor=b6e3f4,ffdfbf,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Danni&backgroundColor=b6e3f4,ffdfbf,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emmi&backgroundColor=b6e3f4,ffdfbf,d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Flori&backgroundColor=b6e3f4,ffdfbf,d1d4f9',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Soul1&backgroundColor=f1f5f9',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Soul2&backgroundColor=f1f5f9',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Soul3&backgroundColor=f1f5f9',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Soul4&backgroundColor=f1f5f9',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Spirit1&backgroundColor=fef2f2',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Spirit2&backgroundColor=fffbeb',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Spirit3&backgroundColor=f0f9ff',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Spirit4&backgroundColor=f5f3ff',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=Happy1&backgroundColor=fdf2f8',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=Happy2&backgroundColor=ecfdf5',
];

interface SanctuaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

const SanctuaryImage = ({ src, alt, ...props }: SanctuaryImageProps) => {
  return <img src={src} alt={alt} referrerPolicy="no-referrer" {...props} />;
};


// --- SHARED COMPONENTS ---

const TopBar = ({ title, isDark, toggleTheme, onSettings, onNotifications, user }: { 
  title: string; 
  isDark: boolean; 
  toggleTheme: () => void;
  onSettings: () => void;
  onNotifications: () => void;
  user: { name: string; avatar: string };
}) => (
  <header className="fixed top-0 left-0 right-0 z-50 glass-card px-6 py-4 flex justify-between items-center h-18">
    <div className="flex items-center gap-3">
      <button 
        onClick={onSettings}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors shadow-inner"
      >
        <SanctuaryImage 
          src={user.avatar} 
          alt="Profile" 
          className="w-full h-full"
        />
      </button>
      <div className="flex flex-col -space-y-1">
        <span className="serif-italic text-2xl text-primary tracking-wide leading-none">Lumina</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 pl-1">{user.name}</span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button onClick={toggleTheme} className="p-2 text-primary/60 hover:text-primary transition-colors">
        {isDark ? <Sparkles size={20} /> : <Moon size={20} />}
      </button>
      <button onClick={onNotifications} className="p-2 text-primary/60 hover:text-primary transition-colors relative">
        <Bell size={20} />
        <span className="absolute top-1 right-1 w-2 h-2 bg-period rounded-full border border-white" />
      </button>
    </div>
  </header>
);

const SettingsView = ({ onClose, notificationsEnabled, onToggleNotifications, cycleParams, setCycleParams, user, setUser }: { 
  onClose: () => void; 
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  cycleParams: { cycleLength: number; periodLength: number; lutealLength: number };
  setCycleParams: React.Dispatch<React.SetStateAction<{ cycleLength: number; periodLength: number; lutealLength: number }>>;
  user: any;
  setUser: (u: any) => void;
}) => {
  const [actualPermission, setActualPermission] = useState<NotificationPermission>('default');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  useEffect(() => {
    if ('Notification' in window) {
      setActualPermission(Notification.permission);
    }
  }, []);

  const handleNameSave = async () => {
    const updatedUser = { ...user, name: tempName };
    setUser(updatedUser);
    setEditingName(false);
    
    // Persist to server
    try {
      const token = localStorage.getItem('lumina_token');
      if (token) {
        await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: tempName })
        });
      }
    } catch (err) {
      console.error("Failed to persist name change:", err);
    }
  };

  const handleAvatarChange = async (avatar: string) => {
    const updatedUser = { ...user, avatar };
    setUser(updatedUser);
    
    // Persist to server
    try {
      const token = localStorage.getItem('lumina_token');
      if (token) {
        await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ avatar })
        });
      }
    } catch (err) {
      console.error("Failed to persist avatar change:", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[110] bg-background p-6 flex flex-col pt-24 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl text-primary serif-italic">Sanctuary Settings</h2>
        <button onClick={onClose} className="p-2 glass-card rounded-full"><Plus className="rotate-45" /></button>
      </div>

      <div className="space-y-8 pb-24">
        {/* Profile Section */}
        <div className="glass-card p-6 rounded-[2.5rem] mt-4 border border-white/10 space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary/20">
                <SanctuaryImage src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <span className="text-[8px] text-white font-bold uppercase tracking-widest text-center px-2">Change Vessel</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/60">Divine Identity</label>
              {editingName ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={e => setTempName(e.target.value)}
                    autoFocus
                    className="bg-transparent border-b border-primary text-xl serif-italic outline-none w-full"
                    onBlur={handleNameSave}
                    onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                  />
                  <button onClick={handleNameSave} className="text-primary"><Heart size={16} fill="currentColor" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group px-0" onClick={() => setEditingName(true)}>
                  <h3 className="text-2xl serif-italic text-primary">{user.name}</h3>
                  <button className="opacity-0 group-hover:opacity-40 transition-opacity"><Heart size={14} /></button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40 text-center block">Radiate a New Frequency</label>
             <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar -mx-2 px-2">
                {avatars.map((av, idx) => (
                  <motion.button 
                    key={idx} 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAvatarChange(av)}
                    className={`shrink-0 w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${user.avatar === av ? 'border-primary ring-4 ring-primary/10 scale-105' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                  >
                    <SanctuaryImage src={av} alt="Avatar option" className="w-full h-full rounded-[0.9rem] object-cover bg-white/5" />
                  </motion.button>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 ml-4 font-sans">Rhythm Tuning</h4>
          <div className="space-y-6">
            {[
              { label: 'Average Cycle Length', field: 'cycleLength', min: 21, max: 45, unit: 'Days' },
              { label: 'Period Duration', field: 'periodLength', min: 2, max: 10, unit: 'Days' },
              { label: 'Luteal Phase Length', field: 'lutealLength', min: 10, max: 16, unit: 'Days' },
            ].map(item => (
              <div key={item.field} className="glass-card p-6 rounded-3xl space-y-3 border border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-sans">{item.label}</label>
                  <span className="text-primary font-serif text-xl italic">{cycleParams[item.field as keyof typeof cycleParams]} {item.unit}</span>
                </div>
                <input 
                  type="range" 
                  min={item.min} 
                  max={item.max} 
                  value={cycleParams[item.field as keyof typeof cycleParams]}
                  onChange={(e) => setCycleParams({ ...cycleParams, [item.field]: parseInt(e.target.value) })}
                  onMouseUp={() => {
                    const token = localStorage.getItem('lumina_token');
                    if (token) {
                      fetch('/api/auth/update-profile', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ [item.field]: cycleParams[item.field as keyof typeof cycleParams] })
                      });
                    }
                  }}
                  onTouchEnd={() => {
                    const token = localStorage.getItem('lumina_token');
                    if (token) {
                      fetch('/api/auth/update-profile', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ [item.field]: cycleParams[item.field as keyof typeof cycleParams] })
                      });
                    }
                  }}
                  className="w-full accent-primary h-2 bg-surface-container/50 rounded-full appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-[2rem] flex justify-between items-center border border-white/10 shadow-sm">
           <div className="space-y-1">
             <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 font-sans">Push Notifications</label>
             <p className="text-[9px] opacity-40 uppercase tracking-[0.1em] font-sans">
               {actualPermission === 'denied' ? "Blocked by Device gate" : "Celestial alerts & reminders"}
             </p>
           </div>
           <button 
            onClick={onToggleNotifications}
            disabled={actualPermission === 'denied'}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${notificationsEnabled ? 'bg-primary' : 'bg-surface-container'} ${actualPermission === 'denied' ? 'opacity-30 cursor-not-allowed' : ''}`}
           >
             <motion.div 
              animate={{ x: notificationsEnabled ? 24 : 0 }}
              className="w-6 h-6 bg-white rounded-full shadow-sm" 
             />
           </button>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6">
        <button onClick={onClose} className="w-full py-5 rounded-full bg-primary text-white font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
          Seal Sanctuary
        </button>
      </div>
    </motion.div>
  );
};

const NotificationCenter = ({ onClose }: { onClose: () => void }) => {
  const triggerSample = (type: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      alert("Please enable notifications in Settings first! ✨");
      return;
    }

    const payloads: Record<string, { title: string; body: string }> = {
      period: { title: "Cycle Alert", body: "Your period is predicted to start in 2 days. 🌸" },
      wellness: { title: "Wellness Tip", body: "Luteal phase starts soon. Prioritize warm, grounding foods today. 🍵" },
      reminder: { title: "Daily Ritual", body: "Don't forget to log your symptoms for more accurate insights! ✍️" }
    };

    const p = payloads[type as keyof typeof payloads];
    new Notification(p.title, { body: p.body });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-0 z-[120] bg-background/95 backdrop-blur-md p-6 pt-24 overflow-y-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onClose} className="p-2 glass-card rounded-full"><ChevronLeft /></button>
        <h2 className="text-2xl text-primary serif-italic">Notifications</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Recent Activity</p>
          {[
            { title: 'Hydration Reminder', msg: 'Your skin is glowing! Keep it up with more water today.', time: '2m ago' },
            { title: 'Cycle Prediction', msg: 'Your ovulation window begins in 2 days.', time: '1h ago' }
          ].map((n, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl border-l-4 border-primary">
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{n.title}</p>
              <p className="text-sm opacity-80 mb-2">{n.msg}</p>
              <span className="text-[10px] opacity-40">{n.time}</span>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-primary/10">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Try Notifications</p>
          <div className="grid grid-cols-1 gap-3">
             <button 
              onClick={() => triggerSample('period')}
              className="flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-primary/5 transition-colors"
             >
               <span className="text-sm font-medium">Test: Period Alert</span>
               <Bell size={16} className="text-primary" />
             </button>
             <button 
              onClick={() => triggerSample('wellness')}
              className="flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-primary/5 transition-colors"
             >
               <span className="text-sm font-medium">Test: Wellness Tip</span>
               <Sparkles size={16} className="text-secondary" />
             </button>
             <button 
              onClick={() => triggerSample('reminder')}
              className="flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-primary/5 transition-colors"
             >
               <span className="text-sm font-medium">Test: Daily Reminder</span>
               <PenLine size={16} className="text-accent" />
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InsightModal = ({ onClose, user, cycleParams, loggedSymptoms }: { onClose: () => void; user: any; cycleParams: any; loggedSymptoms: string[] }) => {
  const [insight, setInsight] = useState<{ title: string; content: string; tags: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const lastDate = new Date(user.lastPeriodDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const currentPhase = PHASES.get(diffDays, cycleParams).label;

        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, cycleParams, loggedSymptoms, currentPhase })
        });
        const data = await response.json();
        setInsight(data);
      } catch (error) {
        console.error("Failed to fetch AI insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [user.lastPeriodDate, JSON.stringify(cycleParams), JSON.stringify(loggedSymptoms)]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[130] bg-background p-6 pt-24 overflow-y-auto"
    >
      <button onClick={onClose} className="absolute top-6 right-6 p-2 glass-card rounded-full z-10"><Plus className="rotate-45" /></button>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="text-primary/20"
          >
            <Sparkles size={48} strokeWidth={1} />
          </motion.div>
          <p className="text-sm font-serif italic text-primary/60">Reading your sacred rhythm...</p>
        </div>
      ) : insight ? (
        <div className="space-y-8 pb-12">
          <div className="relative h-72 rounded-[32px] overflow-hidden group">
            <SanctuaryImage 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800&fm=webp" 
              alt="Insight Visual"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex gap-2 mb-3">
                {insight.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-white border border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-3xl text-white serif-italic leading-tight">{insight.title}</h2>
            </div>
          </div>

          <div className="space-y-6 px-2">
            <div className="prose prose-pink opacity-80 text-md leading-relaxed font-serif italic whitespace-pre-wrap">
              {insight.content}
            </div>
            
            <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
              <p className="text-[11px] text-center leading-relaxed text-primary/60 italic">
                AI insights are generated based on your biological flow to provide holistic guidance. Always trust your intuition and consult experts for medical needs.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <p className="text-xl serif-italic text-primary">The Sanctuary is quiet.</p>
          <p className="text-sm opacity-60">Unable to generate insight at this moment.</p>
          <button onClick={onClose} className="px-8 py-3 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-widest text-xs">Return</button>
        </div>
      )}
    </motion.div>
  );
};

const HistoryModal = ({ onClose, cycleParams }: { onClose: () => void; cycleParams: { cycleLength: number; periodLength: number } }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed inset-0 z-[140] bg-background p-6 pt-24"
  >
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-3xl text-primary serif-italic">Cycle History</h2>
      <button onClick={onClose} className="p-2 glass-card rounded-full"><Plus className="rotate-45" /></button>
    </div>
    <div className="space-y-4">
      {['January', 'December', 'November', 'October'].map((m, i) => (
        <div key={m} className="glass-card p-6 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40">{m}</p>
            <p className="text-lg font-serif">{cycleParams.cycleLength} Days Cycle</p>
          </div>
          <span className="text-primary font-bold">{cycleParams.periodLength} Days Period</span>
        </div>
      ))}
    </div>
  </motion.div>
);

const BottomNav = ({ activeTab, activeColor, setActiveTab }: { activeTab: string; activeColor: string; setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'cycle', label: 'Cycle', icon: LayoutDashboard },
    { id: 'log', label: 'Log', icon: PenLine },
    { id: 'sanctum', label: 'Sanctum', icon: Activity },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'discover', label: 'Discover', icon: Search },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card px-4 pb-8 pt-3 flex justify-around items-center rounded-t-3xl border-t border-white/30">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-50'}`}
            style={{ color: isActive ? activeColor : 'inherit' }}
          >
            <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// --- VIEWS ---

const DashboardView = ({ isDark, userName, loggedSymptoms = [], cycleParams }: { 
  isDark: boolean; 
  userName: string; 
  loggedSymptoms?: string[];
  cycleParams: { cycleLength: number; periodLength: number; lutealLength: number; lastPeriodDate: string };
}) => {
  const calculateCycleDay = (targetDate: Date, startDateStr: string, cycleLength: number) => {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diffInMs = target.getTime() - start.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays < 0) return ((diffInDays % cycleLength) + cycleLength) % cycleLength + 1;
    return (diffInDays % cycleLength) + 1;
  };

  const currentDay = calculateCycleDay(new Date(), cycleParams.lastPeriodDate, cycleParams.cycleLength);
  const phase = PHASES.get(currentDay, cycleParams);
  const phaseKey = phase.key;
  const PhaseIcon = phase.icon;

  const dynamicInsight = useMemo(() => {
    const hasCramps = loggedSymptoms.includes('Cramps');
    const hasFatigue = loggedSymptoms.includes('Fatigue');
    const hasBloating = loggedSymptoms.includes('Bloating');

    if (phaseKey === 'MENSTRUATION') {
      if (hasCramps) return "During the early follicular/menstrual phase, prostaglandins trigger uterine contractions. Heat therapy and anti-inflammatory nutrients are scientifically proven to help.";
      return "Estrogen is at its lowest. Focus on iron-rich foods to support the loss of red blood cells during your flow.";
    }
    if (phaseKey === 'FOLLICULAR') {
      if (hasFatigue) return "While FSH is rising to stimulate follicles, metabolic shifts can cause temporary dips. Gentle movement supports circulation without overtaxing.";
      return "Estrogen levels are climbing, thickening the uterine lining and boosting seretonin. It's a prime window for complex cognitive tasks and new experiences.";
    }
    if (phaseKey === 'OVULATION') {
      return "A surge in Luteinizing Hormone (LH) triggers egg release. You're in your peak fertile window; estrogen and testosterone are also high, maximizing social energy.";
    }
    if (phaseKey === 'LUTEAL') {
      if (hasBloating) return "Progesterone peaks midway through this phase, which can slow digestion and cause fluid retention. Magnesium and hydration support this shift.";
      return "The corpus luteum is producing progesterone, preparing the body for potential pregnancy or a new cycle. Prioritize sleep as your core temperature slightly rises.";
    }
    return "The menstrual cycle is a complex bio-feedback loop coordinated by the hypothalamus, pituitary gland, and ovaries.";
  }, [phaseKey, loggedSymptoms]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="space-y-1">
         <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Good Morning</span>
         <h2 className="text-3xl serif-italic text-primary">Sweet {userName}</h2>
      </header>

      <section className="flex flex-col items-center py-2">
        <div className="relative w-72 h-72 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="50%" cy="50%" r="48%" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-surface-container opacity-30" />
            <motion.circle 
              cx="50%" cy="50%" r="48%" fill="transparent" 
              stroke={phase.color} 
              strokeWidth={12} 
              strokeDasharray="1000" 
              strokeDashoffset={1000 - (1000 * (currentDay / cycleParams.cycleLength))} 
              strokeLinecap="round"
              initial={{ strokeDashoffset: 1000 }}
              animate={{ strokeDashoffset: 1000 - (1000 * (currentDay / cycleParams.cycleLength)) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 8px ${phase.glow})` }}
            />
          </svg>
          <div className="text-center space-y-2 relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-1"
              style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
            >
              <PhaseIcon size={24} />
            </motion.div>
            <span className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: phase.color }}>Day {currentDay}</span>
            <h2 className="text-4xl text-on-surface font-serif italic">{phase.label}</h2>
            <div className="flex flex-col gap-0.5 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{phase.hormone}</span>
              <span className="text-[8px] opacity-40 uppercase tracking-tighter">{phase.biomarker}</span>
            </div>
            <p className="text-sm opacity-60 italic">{phase.description}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-32">
          <Droplets className="text-primary" size={24} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Next Period</p>
            <p className="text-xl font-serif">{cycleParams.cycleLength - currentDay} Days</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-32">
          <Wind className="text-secondary" size={24} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Cycle Length</p>
            <p className="text-xl font-serif">{cycleParams.cycleLength} Days</p>
          </div>
        </div>
      </div>

      <section className="glass-card p-8 rounded-[40px] bg-gradient-to-br from-primary/5 to-secondary/5 border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Sparkles className="text-primary/20" size={32} />
        </div>
        <div className="flex items-center gap-3 text-primary mb-4">
          <h3 className="font-bold uppercase tracking-[0.2em] text-[10px]">Daily Insight</h3>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex-1 space-y-3">
            <p className="font-serif italic text-xl leading-snug text-primary">{dynamicInsight}</p>
            <button 
              onClick={() => (window as any).setInsightModal(true)}
              className="text-xs font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-5 py-2.5 rounded-full hover:bg-primary/20 transition-all active:scale-95"
            >
              Read More
            </button>
          </div>
          <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 rotate-3 transition-transform hover:rotate-0">
            <SanctuaryImage 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200&fm=webp" 
              alt="Yoga" 
              className="w-full h-full" 
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const LogView = ({ symptoms, setSymptoms, cycleParams }: { symptoms: string[]; setSymptoms: React.Dispatch<React.SetStateAction<string[]>>; cycleParams?: { cycleLength: number; periodLength: number; lutealLength: number; lastPeriodDate: string } }) => {
  const [selectedFlow, setSelectedFlow] = useState<string | null>('Light');
  const [selectedMood, setSelectedMood] = useState<number>(2);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);

  const allSymptoms = ['Cramps', 'Fatigue', 'Acne', 'Bloating', 'Headache', 'Backache', 'Nausea', 'Tender Breasts', 'Insomnia', 'Anxiety', 'Sugar Cravings', 'Night Sweats'];
  const initialSymptoms = allSymptoms.slice(0, 5);
  const displaySymptoms = showAllSymptoms ? allSymptoms : initialSymptoms;

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowAnalysis(true);
    }, 1500);
  };

  const getAnalysisMessage = () => {
    if (!cycleParams) return "Your hormones are transitioning. Prioritize hydration and light movement.";
    
    // Mock logic for "intelligence"
    const start = new Date(cycleParams.lastPeriodDate);
    start.setHours(0,0,0,0);
    const target = new Date();
    target.setHours(0,0,0,0);
    const diffInMs = target.getTime() - start.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const currentDay = ((diffInDays % cycleParams.cycleLength) + cycleParams.cycleLength) % cycleParams.cycleLength + 1;
    
    const phase = PHASES.get(currentDay, cycleParams || { cycleLength: 28, periodLength: 5, lutealLength: 14 });
    const phaseKey = phase.key;
    
    if (phaseKey === 'MENSTRUATION') {
      return `Menstruation is a time for deep renewal. Focus on warmth.`;
    }
    if (phaseKey === 'OVULATION') {
      return `Ovulation brings radiant energy!`;
    }
    return `Your cycle is a natural rhythm. Trust your inner tides today.`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-10 pb-12"
    >
      <header className="text-center space-y-2">
        <h2 className="text-3xl text-primary serif-italic">Daily Reflection</h2>
        <p className="text-on-surface-variant opacity-70">Check in with your inner tides</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xl serif-italic">Period Flow</h3>
        <div className="grid grid-cols-4 gap-3">
          {['None', 'Light', 'Medium', 'Heavy'].map((flow) => (
            <button 
              key={flow} 
              onClick={() => setSelectedFlow(flow)}
              className={`flex flex-col items-center gap-3 p-4 glass-card rounded-2xl transition-all duration-500 ${selectedFlow === flow ? 'ring-2 ring-primary bg-primary/10 scale-105' : 'opacity-60'}`}
            >
              <Droplets size={24} className={selectedFlow === flow ? 'text-primary fill-primary' : 'text-on-surface-variant'} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{flow}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl serif-italic">Current Mood</h3>
        <div className="flex justify-between items-center bg-surface-container/50 py-5 px-6 rounded-3xl border border-white/10">
          {['😊', '😔', '😐', '😡', '😴'].map((emoji, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedMood(i)}
              className={`text-4xl transition-all duration-500 hover:scale-125 ${selectedMood === i ? 'scale-125 drop-shadow-[0_0_15px_rgba(var(--color-primary),0.3)]' : 'opacity-30 grayscale'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-primary">
          {['Happy', 'Moody', 'Neutral', 'Angry', 'Tired'][selectedMood]}
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl serif-italic">Physical Symptoms</h3>
        <div className="flex flex-wrap gap-2">
          {displaySymptoms.map((sym) => {
            const isSelected = symptoms.includes(sym);
            return (
              <button 
                key={sym} 
                onClick={() => setSymptoms(prev => isSelected ? prev.filter(s => s !== sym) : [...prev, sym])}
                className={`px-5 py-3 rounded-full text-xs font-bold transition-all duration-300 ${isSelected ? 'bg-primary text-white shadow-lg scale-105' : 'bg-surface-container/50 hover:bg-primary/10 opacity-70'}`}
              >
                {sym}
              </button>
            );
          })}
          {!showAllSymptoms && (
            <button 
              onClick={() => setShowAllSymptoms(true)}
              className="px-5 py-3 rounded-full text-xs font-bold bg-primary/5 text-primary border border-primary/20"
            >
              + More
            </button>
          )}
        </div>
      </section>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-5 rounded-full bg-primary text-white font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {isSaving ? (
            <motion.div 
              key="saving"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="flex items-center justify-center gap-2"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Sparkles size={18} />
              </motion.div>
              Aligning Tides...
            </motion.div>
          ) : (
            <motion.span 
              key="save"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
            >
              Save Daily Log
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showAnalysis && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
              onClick={() => setShowAnalysis(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="glass-card w-full max-w-lg p-8 rounded-[40px] space-y-6 z-10 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
              
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-primary-container/30 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Moon className="text-primary fill-primary/20" size={32} />
                </div>
                <h2 className="text-3xl text-primary serif-italic">Celestial Analysis</h2>
                <p className="text-on-surface-variant opacity-70">Insights for your current phase</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-white/20 rounded-3xl border border-white/10 space-y-2 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-40">Monthly Tide</p>
                  <p className="text-lg font-serif italic text-primary">"Your flow is syncronized with the Crescent Moon. A time for gentle release and inward reflection."</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                    <Zap className="text-primary" size={20} />
                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">Rising Energy</span>
                  </div>
                  <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
                    <Heart className="text-secondary" size={20} />
                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">High Vitality</span>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                   <p className="text-xs leading-relaxed opacity-80 text-center">
                     {getAnalysisMessage()}
                   </p>
                </div>
              </div>

              <button 
                onClick={() => setShowAnalysis(false)}
                className="w-full py-4 rounded-full bg-primary text-white font-bold uppercase tracking-widest shadow-lg"
              >
                Blessed Be
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InsightsView = ({ user, cycleParams, loggedSymptoms }: { user: any; cycleParams: any; loggedSymptoms: string[] }) => {
  const [forecast, setForecast] = useState<{ title: string; content: string; tags: string[] } | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(true);
  const [selectedInsightsSymptoms, setSelectedInsightsSymptoms] = useState<string[]>(['Cramps', 'Mood']);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const lastDate = new Date(user.lastPeriodDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const currentPhase = PHASES.get(diffDays, cycleParams).label;

        const response = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, cycleParams, loggedSymptoms, currentPhase })
        });
        const data = await response.json();
        setForecast(data);
      } catch (error) {
        console.error("Forecast fetch failed:", error);
      } finally {
        setLoadingForecast(false);
      }
    };
    fetchForecast();
  }, [JSON.stringify(loggedSymptoms)]);
  
  const avgCycle = cycleParams.cycleLength;
  
  const symptomsList = [
    { id: 'Cramps', label: 'Cramps', color: '#8a486f' },
    { id: 'Fatigue', label: 'Fatigue', color: '#6b7280' },
    { id: 'Mood', label: 'Mood', color: '#d97706' },
    { id: 'Bloating', label: 'Bloating', color: '#2563eb' },
    { id: 'Headache', label: 'Headache', color: '#b91c1c' },
  ];

  const trendData = useMemo(() => [
    { day: 'Day 1', Cramps: 80, Fatigue: 40, Mood: 20, Bloating: 30, Headache: 10 },
    { day: 'Day 5', Cramps: 60, Fatigue: 70, Mood: 40, Bloating: 20, Headache: 5 },
    { day: 'Day 10', Cramps: 20, Fatigue: 30, Mood: 80, Bloating: 10, Headache: 0 },
    { day: 'Day 14', Cramps: 5, Fatigue: 20, Mood: 95, Bloating: 5, Headache: 0 },
    { day: 'Day 20', Cramps: 10, Fatigue: 40, Mood: 60, Bloating: 40, Headache: 20 },
    { day: 'Day 25', Cramps: 40, Fatigue: 60, Mood: 30, Bloating: 70, Headache: 50 },
    { day: 'Day 28', Cramps: 90, Fatigue: 80, Mood: 10, Bloating: 90, Headache: 80 },
  ], []);

  const toggleSymptom = (id: string) => {
    setSelectedInsightsSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-12"
    >
      <header className="space-y-2">
        <h2 className="text-3xl text-primary serif-italic">Your Insights</h2>
        <p className="text-on-surface-variant opacity-70">Discover the internal rhythms of your sanctuary.</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xl serif-italic">Celestial Forecast</h3>
        <div className="glass-card p-8 rounded-[40px] bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <Sparkles className="text-primary" size={48} />
          </div>
          
          {loadingForecast ? (
            <div className="flex flex-col items-center py-12 space-y-4">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                 <Loader2 className="text-primary animate-spin" size={32} />
               </motion.div>
               <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary/40">Aligning with the stars...</p>
            </div>
          ) : forecast ? (
            <div className="space-y-6">
               <div className="space-y-2">
                 <div className="flex gap-2">
                   {forecast.tags?.map(tag => (
                     <span key={tag} className="text-[8px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                       {tag}
                     </span>
                   ))}
                 </div>
                 <h4 className="text-2xl text-primary serif-italic">{forecast.title}</h4>
               </div>
               <p className="text-sm italic opacity-70 leading-relaxed line-clamp-3">
                 {forecast.content}
               </p>
               <button 
                onClick={() => (window as any).setInsightModal(true)}
                className="w-full py-4 rounded-2xl bg-primary/10 text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-primary transition-all hover:text-white"
               >
                 View Full Initiation
               </button>
            </div>
          ) : (
            <p className="text-center py-12 opacity-40 italic">The stars are clouded today.</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xl serif-italic">Past Cycles</h3>
          <button 
            onClick={() => (window as any).setHistoryModal(true)}
            className="text-xs font-bold uppercase tracking-widest text-primary hover:underline transition-all"
          >
            View history
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {['JANUARY', 'DECEMBER', 'NOVEMBER'].map((month, i) => (
            <div key={month} className="flex-shrink-0 w-48 p-6 glass-card rounded-[32px] space-y-4 border border-white/10">
              <span className="text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase">{month}</span>
              <div className="space-y-1">
                <p className="text-4xl font-serif text-primary italic leading-none">{i === 0 ? avgCycle : i === 1 ? '31' : '29'}</p>
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Days Total</p>
              </div>
              <div className="h-1.5 bg-surface-container/50 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: i === 0 ? '60%' : '80%' }}
                    className="h-full bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.5)]"
                  />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
         <div className="flex justify-between items-center">
          <h3 className="text-xl serif-italic">Symptom Trends</h3>
          <div className="flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
            <Activity size={12} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Last {avgCycle} Days</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-[40px] border border-white/20 bg-gradient-to-b from-white/10 to-transparent">
          <div className="flex flex-wrap gap-2 mb-8">
            {symptomsList.map(s => {
              const isSelected = selectedInsightsSymptoms.includes(s.id);
              return (
                <button 
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${isSelected ? 'bg-primary text-white shadow-lg scale-105' : 'bg-surface-container/30 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? 'white' : s.color }} />
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {symptomsList.map(s => (
                    <linearGradient key={s.id} id={`color${s.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={s.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={s.color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'rgba(0,0,0,0.4)', fontWeight: 'bold' }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }} 
                />
                {selectedInsightsSymptoms.map(id => (
                  <Area 
                    key={id}
                    type="monotone" 
                    dataKey={id} 
                    stroke={symptomsList.find(s => s.id === id)?.color} 
                    fillOpacity={1} 
                    fill={`url(#color${id})`} 
                    strokeWidth={3}
                    animationDuration={1500}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="glass-card p-6 rounded-[32px] space-y-3 border border-white/10 bg-primary/5">
             <div className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center shadow-inner">
               <Zap className="text-primary" size={20} />
             </div>
             <div>
                <p className="text-3xl font-serif text-primary italic leading-none">{avgCycle || 29.4}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Avg. Cycle length</p>
             </div>
           </div>
           <div className="glass-card p-6 rounded-[32px] space-y-3 border border-white/10 bg-secondary/5">
             <div className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center shadow-inner">
               <Wind className="text-secondary" size={20} />
             </div>
             <div>
                <p className="text-3xl font-serif text-secondary italic leading-none">6</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1">Day variation</p>
             </div>
           </div>
        </div>
      </section>
    </motion.div>
  );
};

const DiscoverView = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  
  const dailyContent = useMemo(() => {
    const articles = [
      { id: 1, title: "Seed Cycling for Hormone Balance", tag: "Nutrition", img: `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800&fm=webp`, desc: "Learn how pumpkin, flax, sesame, and sunflower seeds can support your phases.", content: "Seed cycling is a gentle yet powerful way to support your hormonal health. By rotating specific seeds throughout your cycle, you provide your body with the nutrients it needs to balance estrogen and progesterone naturally.\n\nDuring the Follicular phase, focus on flax and pumpkin seeds. These are rich in phytoestrogens and zinc. In the Luteal phase, switch to sesame and sunflower seeds for their vitamin E and selenium and natural hormone support." },
      { id: 2, title: "Yin Yoga for Menstrual Ease", tag: "Movement", img: `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800&fm=webp`, desc: "Gentle stretches and long holds to release tension in the hips and lower back.", content: "Yin Yoga focuses on the deep connective tissues of the body. During your period, it's essential to move with kindness. These three poses—Butterfly, Child's Pose, and Reclined Squat—are designed to alleviate pelvic congestion and soothe the nervous system.\n\nRemember to breathe into the belly and allow gravity to do the work. This isn't about pushing; it's about yielding." },
      { id: 3, title: "The Power of Rest and Reflection", tag: "Mindfulness", img: `https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800&fm=webp`, desc: "Embracing your 'Inner Winter' as a time for intuitive deep work.", content: "Your cycle is a personal compass. The menstruation phase, or 'Inner Winter', is a time when the veil between your conscious and subconscious is thinnest. This is prime time for journaling, dreaming, and setting intentions for the upcoming cycle.\n\nGive yourself permission to do less. In the stillness, you'll find the clarity you need for the next spring of your life." },
      { id: 4, title: "The Biological Blueprint of Your Cycle", tag: "Rituals", img: `https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800&fm=webp`, desc: "A deep dive into the hormones and physiology that drive your rhythm.", content: "Understanding the biological mechanisms of your cycle empowers you to work with your body, not against it.\n\n1. Menstrual Phase (Day 1-5): Triggered by a drop in progesterone, the uterine lining (endometrium) shed. Estrogen is at its baseline, which is why you may feel like retracting inward.\n\n2. Follicular Phase (Day 1-13): The hypothalamus signals the pituitary to release Follicle-Stimulating Hormone (FSH). Ovaries produce follicles, which secrete estrogen, stimulating the regrowth of the uterine lining.\n\n3. Ovulatory Phase (Day 14): A surge in Luteinizing Hormone (LH) causes the most mature follicle to rupture and release an egg. This 24-hour window is the only time pregnancy can occur, though the 'fertile window' includes the days leading up to it due to sperm longevity.\n\n4. Luteal Phase (Day 15-28): The ruptured follicle becomes the corpus luteum, secreting progesterone. This hormone stabilizes the uterine lining. If no fertilization occurs, progesterone drops, triggering the next period." },
      { id: 5, title: "Digital Detox for Better Sleep", tag: "Rituals", img: `https://images.unsplash.com/photo-1582733315330-de94107171d1?auto=format&fit=crop&q=80&w=800&fm=webp`, desc: "Protect your melatonin during the luteal phase with mindful screentime.", content: "As your body prepares for its next phase, quality sleep becomes paramount. Blue light from screens can disrupt your natural circadian rhythm, leading to increased anxiety during the Luteal phase.\n\nTry a 'Sunset Scurry': put all devices away 1 hour before bed. Light a candle, read a physical book, and let your eyes rest. Your morning self will thank you for the restorative rest." }
    ];
    return articles;
  }, []);

  const categories = ['All', 'Nutrition', 'Movement', 'Mindfulness', 'Rituals'];

  const handleShare = async (e: React.MouseEvent, article: any) => {
    e.stopPropagation();
    const shareData = {
      title: article.title,
      text: article.desc,
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${article.title}\n${article.desc}\n${window.location.origin}`);
        alert("Sanctuary link copied to clipboard! ✨");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  if (showChat) {
    return <CommunityChatView onClose={() => setShowChat(false)} />;
  }

  if (selectedArticle) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-20">
        <div className="flex justify-between items-center pr-2">
          <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] bg-primary/5 px-4 py-2 rounded-full">
            <ChevronLeft size={14} /> Back to feed
          </button>
          <button 
            onClick={(e) => handleShare(e, selectedArticle)}
            className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
          >
            <Share2 size={16} />
          </button>
        </div>
        <div className="relative group">
          <SanctuaryImage 
            src={selectedArticle.img} 
            alt={selectedArticle.title}
            className="w-full h-72 rounded-[40px] shadow-2xl" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-[40px]" />
        </div>
        <div className="space-y-4 px-2">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold tracking-[0.2em] text-primary bg-primary/10 px-4 py-1.5 rounded-full uppercase">{selectedArticle.tag}</span>
             <span className="text-[10px] font-bold tracking-[0.2em] opacity-30 uppercase">5 MIN READ</span>
          </div>
          <h2 className="text-4xl serif-italic text-primary leading-tight">{selectedArticle.title}</h2>
          <div className="prose prose-pink opacity-80 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {selectedArticle.content}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <header className="space-y-1 text-center">
         <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Today's Wisdom</span>
         <h2 className="text-3xl serif-italic text-primary">Discover Sanctuary</h2>
      </header>

      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-surface-container/50 opacity-60 hover:opacity-100 hover:bg-primary/5'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {dailyContent
          .filter(item => activeCategory === 'All' || item.tag === activeCategory)
          .map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedArticle(item)}
              className="group glass-card rounded-[40px] overflow-hidden border border-white/20 active:scale-[0.98] transition-all cursor-pointer hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="relative h-60 overflow-hidden bg-primary/5">
                <SanctuaryImage 
                  src={`${item.img}&w=600&q=75&fm=webp`} 
                  alt={item.title} 
                  className="w-full h-full transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold tracking-[0.2em] text-primary border border-primary/10 shadow-sm">
                    {item.tag.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-8 space-y-3">
                <h3 className="text-2xl font-serif text-primary italic leading-tight group-hover:text-primary-variant transition-colors">{item.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed line-clamp-2">{item.desc}</p>
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] opacity-80">
                    Enter Article <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  <button 
                    onClick={(e) => handleShare(e, item)}
                    className="p-3 rounded-full bg-primary/5 text-primary/60 hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                    title="Share wisdom"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </div>

      <section className="glass-card p-8 rounded-[40px] bg-primary/5 border border-primary/10 text-center space-y-4">
        <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
           <MessageCircle className="text-primary" size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl serif-italic text-primary">Community Circle</h3>
          <p className="text-xs opacity-60">Join 2.4k others in today's discussion about cycle-syncing rituals.</p>
        </div>
        <button 
          onClick={() => setShowChat(true)}
          className="w-full py-4 rounded-full bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
        >
          Join Conversation
        </button>
      </section>
    </motion.div>
  );
};

const CommunityChatView = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Luna ✨', text: 'Has anyone tried the new raspberry leaf tea ritual?', time: '2:15 PM', isSelf: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna', reactions: ['🍵'] },
    { id: 2, user: 'Aria 🌸', text: 'I just started! It feels so grounding during the luteal phase.', time: '2:18 PM', isSelf: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria', reactions: ['✨', '❤️'] },
    { id: 3, user: 'You', text: 'That sounds lovely. Every cycle is a new journey!', time: '2:20 PM', isSelf: true, avatar: '', reactions: [] },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeReactionId, setActiveReactionId] = useState<number | null>(null);

  const getAIResponse = async (userMsg: string) => {
    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      
      const data = await response.json();
      const aiText = data.text || "I'm here for you, girlie! ✨";
      
      const identities = [
        { name: 'Sage 🌿', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sage' },
        { name: 'Ivy 🍃', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy' },
        { name: 'Celeste 🌙', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Celeste' }
      ];
      const identity = identities[Math.floor(Math.random() * identities.length)];

      setMessages(prev => [...prev, {
        id: Date.now(),
        user: identity.name,
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
        avatar: identity.avatar,
        reactions: []
      }]);
    } catch (error) {
      console.error("Chat API Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const addReaction = (msgId: number, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = m.reactions || [];
        return { ...m, reactions: reactions.includes(emoji) ? reactions.filter(r => r !== emoji) : [...reactions, emoji] };
      }
      return m;
    }));
    setActiveReactionId(null);
  };

  const sendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { id: Date.now(), user: 'You', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSelf: true, avatar: '', reactions: [] }]);
    setInput('');
    
    setTimeout(() => {
      getAIResponse(userMsg);
    }, 1200);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-[150] bg-background flex flex-col">
      <header className="p-6 glass-card flex items-center gap-4 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <button onClick={onClose} className="p-2 glass-card rounded-full"><ChevronLeft /></button>
        <div>
          <h2 className="text-xl serif-italic text-primary">Community Circle</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] uppercase font-bold opacity-40">242 Girlies Online</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col bg-gradient-to-b from-primary/5 to-transparent">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-end gap-3 ${m.isSelf ? 'flex-row-reverse self-end' : 'self-start'}`}>
            {!m.isSelf && (
              <SanctuaryImage 
                src={m.avatar} 
                alt={m.user} 
                className="w-9 h-9 rounded-full bg-primary/10 shadow-sm" 
              />
            )}
            <div className="flex flex-col group relative">
              <div 
                onDoubleClick={() => setActiveReactionId(m.id)}
                className={`max-w-[100%] p-4 rounded-[24px] text-sm leading-relaxed relative ${m.isSelf ? 'bg-primary text-white rounded-br-none shadow-xl shadow-primary/20' : 'glass-card rounded-bl-none shadow-sm'}`}
              >
                {!m.isSelf && <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1.5 flex items-center gap-2">{m.user} <span className="opacity-30">• FRIEND</span></p>}
                <p>{m.text}</p>
                <p className={`text-[8px] mt-1.5 opacity-40 text-right font-bold tracking-widest ${m.isSelf ? 'text-white/60' : ''}`}>{m.time}</p>

                {/* Reactions Badge */}
                {m.reactions && m.reactions.length > 0 && (
                  <div className={`absolute -bottom-3 flex gap-1 ${m.isSelf ? 'left-0' : 'right-0'}`}>
                    {m.reactions.map(r => (
                      <span key={r} className="bg-white px-2 py-0.5 rounded-full text-[10px] shadow-sm border border-primary/10">{r}</span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Reaction Picker Trigger */}
              <button 
                onClick={() => setActiveReactionId(activeReactionId === m.id ? null : m.id)}
                className={`mt-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest text-primary hover:underline ${m.isSelf ? 'text-left' : 'text-right'}`}
              >
                React
              </button>

              {/* Popup Picker */}
              <AnimatePresence>
                {activeReactionId === m.id && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className={`absolute z-10 -top-12 flex gap-2 p-2 glass-card rounded-full shadow-2xl border border-primary/20 ${m.isSelf ? 'left-0' : 'right-0'}`}
                  >
                    {['✨', '❤️', '🌸', '🍵', '💪'].map(emoji => (
                      <button 
                        key={emoji} 
                        onClick={() => addReaction(m.id, emoji)}
                        className="hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="self-start flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 italic ml-12 animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            Someone is typing magical thoughts...
          </div>
        )}
      </div>

      <form onSubmit={sendMsg} className="p-6 glass-card flex gap-3 bg-white/80 backdrop-blur-lg border-t border-white/20">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Share your wisdom..."
          className="flex-1 px-6 py-4 rounded-full bg-surface-container/30 border-none outline-none ring-2 ring-primary/5 focus:ring-primary/20 transition-all text-sm font-medium"
        />
        <button type="submit" disabled={isTyping} className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 active:scale-95 transition-transform disabled:opacity-50">
          <Share2 size={20} className="rotate-90" />
        </button>
      </form>
    </motion.div>
  );
};

const CalendarView = ({ cycleParams }: { cycleParams: { cycleLength: number; periodLength: number; lutealLength: number; lastPeriodDate: string } }) => {
    const [days, setDays] = useState<{ day: number; date: Date }[]>([]);
    const [showGuide, setShowGuide] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const lastDay = new Date(year, month + 1, 0);
        
        const d = [];
        for (let i = 1; i <= lastDay.getDate(); i++) {
            d.push({ day: i, date: new Date(year, month, i) });
        }
        setDays(d);
    }, [currentMonth]);

    const calculateCycleDay = (targetDate: Date, startDateStr: string, cycleLength: number) => {
        const start = new Date(startDateStr);
        start.setHours(0, 0, 0, 0);
        const target = new Date(targetDate);
        target.setHours(0, 0, 0, 0);
        const diffInMs = target.getTime() - start.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const day = ((diffInDays % cycleLength) + cycleLength) % cycleLength + 1;
        return day;
    };

    const getCycleDay = (date: Date) => {
        return calculateCycleDay(date, cycleParams.lastPeriodDate, cycleParams.cycleLength);
    };

    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const year = currentMonth.getFullYear();

    const changeMonth = (offset: number) => {
        const next = new Date(currentMonth);
        next.setMonth(next.getMonth() + offset);
        setCurrentMonth(next);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
    };

    const selectedCycleDay = getCycleDay(selectedDate);
    const selectedPhase = PHASES.get(selectedCycleDay, cycleParams);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate Next Milestones
    const milestones = useMemo(() => {
        const nextPeriodStart = new Date(cycleParams.lastPeriodDate);
        const diffToToday = today.getTime() - nextPeriodStart.getTime();
        const cyclesSinceStart = Math.floor(diffToToday / (cycleParams.cycleLength * 86400000)) + 1;
        
        const nextPeriod = new Date(nextPeriodStart.getTime() + cyclesSinceStart * cycleParams.cycleLength * 86400000);
        const nextOvulation = new Date(nextPeriod.getTime() - cycleParams.lutealLength * 86400000);
        
        // If nextOvulation is in the past relative to today, it's for the current cycle
        if (nextOvulation < today) {
            // This logic is a bit simplified, but good for UX
        }

        return {
            period: nextPeriod,
            ovulation: nextOvulation,
            fertileStart: new Date(nextOvulation.getTime() - 5 * 86400000)
        };
    }, [cycleParams, today]);

    // "Fluctuation" logic helper
    const isPredictedTransition = (cycleDay: number, targetDay: number, range = 1) => {
        // Adds a +/- range day "soft" boundary for predictions to account for fluctuations
        return cycleDay >= targetDay - range && cycleDay <= targetDay + range;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12 w-full max-w-lg mx-auto"
        >
            <header className="flex flex-col gap-6 px-2">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Sacred Cycle</p>
                        <motion.h2 
                            key={monthName}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl serif-italic tracking-tight text-primary"
                        >
                            {monthName} <span className="opacity-20 font-sans not-italic text-2xl">{year}</span>
                        </motion.h2>
                    </div>
                    <div className="flex bg-surface-container/30 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md gap-1 shadow-sm">
                        <button 
                            onClick={() => changeMonth(-1)}
                            className="p-2 hover:bg-primary/10 rounded-xl transition-all active:scale-90 text-primary/60 hover:text-primary"
                            title="Previous Month"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={goToToday}
                            className="px-4 py-2 hover:bg-primary/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-primary/60 hover:text-primary"
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => changeMonth(1)}
                            className="p-2 hover:bg-primary/10 rounded-xl transition-all active:scale-90 text-primary/60 hover:text-primary"
                            title="Next Month"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Milestone Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card p-4 rounded-[24px] border border-white/10 bg-white/20">
                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1">Next Period</p>
                        <div className="flex items-center gap-2">
                           <Droplets size={14} className="text-period" />
                           <p className="text-sm font-serif">{milestones.period.toLocaleDateString('default', { month: 'short', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-[24px] border border-white/10 bg-white/20">
                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40 mb-1">Next Ovulation</p>
                        <div className="flex items-center gap-2">
                           <Sparkles size={14} className="text-yellow-500" />
                           <p className="text-sm font-serif">{milestones.ovulation.toLocaleDateString('default', { month: 'short', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="glass-card p-6 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden bg-white/40 backdrop-blur-xl">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <span key={`${d}-${i}`} className="text-center text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">{d}</span>
                    ))}
                </div>
                <motion.div 
                    layout
                    className="grid grid-cols-7 gap-y-5 gap-x-1 sm:gap-x-2"
                >
                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }, (_, i) => (
                        <div key={`empty-${i}`} className="aspect-square opacity-0 flex items-center justify-center text-[10px]"></div>
                    ))}
                    {days.map((d, idx) => {
                        const cycleDay = getCycleDay(d.date);
                        const phase = PHASES.get(cycleDay, cycleParams);
                        const isToday = d.day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
                        const isSelected = selectedDate.getDate() === d.day && selectedDate.getMonth() === d.date.getMonth() && selectedDate.getFullYear() === d.date.getFullYear();
                        const isFuture = d.date > today;

                        const ovulationDay = cycleParams.cycleLength - cycleParams.lutealLength;
                        const isOvulationIndicator = cycleDay === ovulationDay;
                        const isOvulationWindow = isPredictedTransition(cycleDay, ovulationDay, 1);
                        const isFertile = cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay;
                        const isPeriodStart = cycleDay === 1;
                        const isPeriod = cycleDay <= cycleParams.periodLength;

                        return (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                                key={d.day} 
                                className="flex flex-col items-center gap-1.5 relative group cursor-pointer" 
                                onClick={() => setSelectedDate(d.date)}
                            >
                                <button className={`w-8 h-8 sm:w-10 sm:h-10 text-[11px] rounded-full flex items-center justify-center transition-all relative z-10 
                                    ${isSelected ? 'scale-110 shadow-lg font-bold' : 'hover:scale-105'} 
                                    ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                    style={{ 
                                        backgroundColor: isSelected ? phase.color : (isPeriod ? `${PHASES_DATA.MENSTRUATION.color}20` : `${phase.color}40`),
                                        color: isSelected ? 'white' : 'inherit',
                                        border: isSelected ? 'none' : (isPeriodStart ? `2px solid ${PHASES_DATA.MENSTRUATION.color}` : (isFuture ? `1px dashed ${phase.color}30` : `1px solid ${phase.color}50`)),
                                        boxShadow: isOvulationWindow && !isSelected ? `inset 0 0 8px ${PHASES_DATA.OVULATION.color}40` : 'none'
                                    }}
                                >
                                    {d.day}
                                </button>
                                <div className="flex gap-0.5 mt-0.5">
                                    <div 
                                        className={`w-1 h-1 rounded-full transition-all duration-500 ${isSelected ? 'scale-150' : ''}`} 
                                        style={{ backgroundColor: phase.color, opacity: isSelected ? 1 : 0.4 }} 
                                    />
                                    {isFertile && !isSelected && (
                                        <div className="w-1 h-1 rounded-full bg-secondary animate-pulse" />
                                    )}
                                </div>
                                {isOvulationIndicator && (
                                  <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 0.75 }}
                                    className="absolute -top-1 -right-1 z-20 text-yellow-500 bg-white rounded-full p-0.5 shadow-sm"
                                  >
                                    <Sparkles size={10} />
                                  </motion.div>
                                )}
                                {isPeriodStart && (
                                    <div className="absolute -top-1 -left-1 z-20 text-period">
                                        <Droplets size={10} className="fill-period" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
                
                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center gap-1.5 opacity-40">
                        <Droplets size={10} className="text-period" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Period Start</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                        <Sparkles size={10} className="text-yellow-500" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Ovulation</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Fertile Window</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                        <div className="w-2 h-2 rounded-full border border-dashed border-primary" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Predicted</span>
                    </div>
                </div>
            </section>

            <motion.section 
                key={selectedDate.toDateString()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 rounded-[32px] border border-white/10 shadow-xl space-y-4"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                            {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <h3 className="text-2xl serif-italic text-primary">Day {selectedCycleDay} — {selectedPhase.label}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest">
                                {selectedDate.toDateString() === today.toDateString() ? 'Today' : (selectedDate > today ? 'Predicted' : 'Past')}
                            </span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${selectedPhase.color}15`, color: selectedPhase.color }}>
                        <selectedPhase.icon size={24} />
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container/20 border border-white/5">
                    <p className="text-sm opacity-60 italic leading-relaxed">
                        {selectedPhase.description}. {selectedPhase.key === 'OVULATION' ? "Your fertile window is at its peak." : "Listen to your body's natural rhythm."}
                    </p>
                </div>
            </motion.section>

            <section className="space-y-6">
                <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className="w-full flex justify-between items-center px-2 group cursor-pointer"
                >
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 group-hover:opacity-60 transition-opacity">Cycle Wisdom Guide</h3>
                        <p className="text-[10px] opacity-30 mt-1 uppercase tracking-widest text-left">Understanding your biological seasons</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/10 opacity-40 group-hover:opacity-100 transition-all">
                        {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </button>
                
                <AnimatePresence>
                    {showGuide && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-3"
                        >
                            {Object.values(PHASES_DATA).map((p) => {
                                const Icon = p.icon;
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileHover={{ scale: 1.01 }}
                                        key={p.label} 
                                        className="glass-card p-5 rounded-[32px] border border-white/10 bg-white/30 backdrop-blur-sm relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Icon size={48} />
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-xl serif-italic" style={{ color: p.color }}>{p.label}</p>
                                                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-30">{p.description}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-1">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Main Hormones</p>
                                                        <p className="text-[10px] font-medium leading-tight opacity-70">{p.hormone}</p>
                                                    </div>
                                                    <div className="space-y-0.5 text-right">
                                                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Biomarker</p>
                                                        <p className="text-[10px] font-medium leading-tight opacity-70">{p.biomarker}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </motion.div>
    );
};

// --- ONBOARDING / SIGN UP ---

const OnboardingView = ({ onComplete }: { onComplete: (userData: { name: string; email: string; avatar: string; cycleLength: number; periodLength: number; lutealLength: number; lastPeriodDate: string }) => void }) => {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Profile Name, 3: Last Period, 4: Avatar
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lumina&backgroundColor=b6e3f4,ffdfbf,d1d4f9&mood=happy&top=bigHair,bob',
    cycleLength: 28,
    periodLength: 5,
    lutealLength: 14,
    lastPeriodDate: '',
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 4) {
      onComplete({ 
        ...userData,
        lastPeriodDate: userData.lastPeriodDate || new Date().toISOString().split('T')[0]
      });
    } else setStep(step + 1);
  };

  const sparkles = Array.from({ length: 12 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#a58f89] flex flex-col items-center p-6 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[140px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-secondary/15 blur-[140px]" 
        />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {sparkles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0], 
              scale: [0, 1, 0.5],
              x: [0, (Math.random() * 600 - 300)],
              y: [0, (Math.random() * 1000 - 500)],
            }}
            transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: i * 0.5 }}
            className="absolute left-1/2 top-1/2 text-primary/40"
          >
            <Sparkles size={12 + (i % 4) * 6} strokeWidth={0.5} />
          </motion.div>
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            className="w-full space-y-10 text-center px-4"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div 
                animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="relative inline-block"
              >
                <div className="w-28 h-28 bg-white/5 backdrop-blur-xl rounded-[40px] mx-auto flex items-center justify-center p-5 border border-primary/10 shadow-2xl overflow-hidden group">
                  {step === 4 ? (
                    <div className="relative w-full h-full">
                       <SanctuaryImage src={userData.avatar} alt="Avatar Preview" className="w-full h-full rounded-3xl object-cover" />
                       <motion.div layoutId="avatar-glow" className="absolute inset-0 bg-primary/20 blur-xl scale-75 -z-10" />
                    </div>
                  ) : (
                    <div className="relative">
                      <Heart className="text-primary fill-primary/10" size={48} strokeWidth={1} />
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="absolute -top-6 -right-6 text-primary"
                      >
                        <Sparkles size={20} />
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
              
              <div className="space-y-3">
                <h1 className="text-4xl text-primary serif-italic leading-tight tracking-tight">
                  {step === 1 && "Start Your Journey"}
                  {step === 2 && (userData.name ? `Greetings, ${userData.name}` : "Identify Your Entity")}
                  {step === 3 && (userData.name ? `${userData.name}, Sacred Rhythm` : "The Biological Blueprint")}
                  {step === 4 && "Your Digital Vessel"}
                </h1>
                <p className="text-on-surface-variant/60 leading-relaxed font-sans text-sm max-w-[300px] mx-auto italic">
                  {step === 1 && "Enter a mindful space dedicated to your cycle, your health, and your spirit."}
                  {step === 2 && "Share your identity with the sanctuary to personalize your experience."}
                  {step === 3 && "By sharing your last menstruation date, Lumina can align with your internal tides."}
                  {step === 4 && "Select an avatar that resonates with your current energetic frequency."}
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full space-y-6">
              {step === 1 && (
                <div className="space-y-8">
                  <button 
                    onClick={() => setStep(2)}
                    className="group relative w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.3em] text-xs shadow-2xl shadow-primary/30 overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <span className="relative z-10">Step Into Lumina</span>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
                    <input 
                      type="text" placeholder="Your Name" value={userData.name}
                      onChange={e => setUserData({...userData, name: e.target.value})}
                      className="w-full px-8 py-6 rounded-[2.5rem] bg-white/50 backdrop-blur-md border border-primary/10 outline-none focus:border-primary text-center text-xl font-serif italic shadow-sm"
                      required
                    />
                    <button type="submit" className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95">
                      Continue Initiation
                    </button>
                  </form>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className="relative group p-4 bg-white/40 backdrop-blur-xl rounded-[3rem] border border-primary/5 shadow-inner transition-all hover:bg-white/60">
                      <input 
                        type="date" value={userData.lastPeriodDate}
                        onChange={e => setUserData({...userData, lastPeriodDate: e.target.value})}
                        className="w-full px-12 py-6 bg-transparent outline-none text-center text-xl transition-all font-serif italic cursor-pointer appearance-none"
                        required
                      />
                    </div>
                    <div className="p-6 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                       <p className="text-[11px] text-center text-primary/60 font-serif italic">
                        "Your biological clock is a sacred mechanism. Even a soft approximation allows Lumina to begin its alignment with your internal tides."
                       </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleNext} disabled={!userData.lastPeriodDate}
                    className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
                  >
                    Sync Rhythm
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <div 
                    className="grid grid-cols-4 gap-4 overflow-y-auto px-2 py-2 hide-scrollbar mx-auto"
                    style={{ fontSize: '14px', lineHeight: '22px', marginBottom: '20px', height: '272.2px', width: '293.2px' }}
                  >
                    {avatars.map((av, idx) => (
                      <motion.button 
                        key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setUserData({...userData, avatar: av})}
                        className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${userData.avatar === av ? 'ring-2 ring-primary shadow-lg scale-105 z-10' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}
                      >
                        <SanctuaryImage src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                  <button onClick={handleNext} className="w-full h-16 rounded-full bg-primary text-white font-bold uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95">
                    Enter Sanctuary
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="w-full p-8 flex flex-col items-center z-10 mt-auto">
        <div className="flex items-center gap-4 opacity-20">
          <span className="text-[10px] font-bold uppercase tracking-[1em] text-primary whitespace-nowrap">Sanctuary of Lumina</span>
        </div>
      </footer>
    </div>
  );
};

// --- APP COMPONENT ---

export default function App() {
  const [activeTab, setActiveTab] = (window as any).activeTabState || ['cycle', (val: string) => {(window as any).activeTabState[0] = val;}]; 
  // Just use regular state, top level React patterns are better
  const [activeView, setActiveView] = (window as any).useState ? (window as any).useState('cycle') : ['cycle', () => {}];

  return null; // This was just a scaffold, let's write the real one in App.tsx
}

import { healthSyncService, HealthSample } from '../services/healthSyncService';

const SanctumView = ({ user, setUser }: { user: any; setUser: (u: any) => void }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus("Summoning Data...");
    try {
      const result = await healthSyncService.requestSync();
      if (result.success && result.samples) {
        setSyncStatus(`Syncing ${result.samples.length} Ritual Records...`);
        const syncResponse = await healthSyncService.uploadSyncData(result.platform, result.samples);
        if (syncResponse.success) {
          setUser(syncResponse.user);
          setSyncStatus("Ritual Complete ✨");
        }
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("Interrupted Connection");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const lastSyncDate = user.healthSync?.lastSync 
    ? new Date(user.healthSync.lastSync).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : 'Never';

  return (
    <div className="space-y-8 pb-32">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif italic text-primary">Health Sanctum</h2>
        <p className="text-sm text-muted-foreground italic">Synchronize your body's digital wisdom.</p>
      </div>

      <div className="glass-card rounded-[2rem] p-8 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto ring-1 ring-primary/10">
          <Activity className={`w-12 h-12 text-primary ${isSyncing ? 'animate-pulse' : ''}`} />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-medium tracking-tight">iOS HealthKit Sync</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            Status: {user.healthSync?.enabled ? 'Connected' : 'Disconnected'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-primary/5">
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Last Ritual</p>
            <p className="text-sm font-medium">{lastSyncDate}</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Platform</p>
            <p className="text-sm font-medium capitalize">{user.healthSync?.platform || 'None'}</p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full py-5 rounded-full bg-primary text-white font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSyncing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{syncStatus}</span>
            </>
          ) : (
            <>
              <span>{user.healthSync?.enabled ? 'Sync Now' : 'Connect HealthKit'}</span>
            </>
          )}
        </button>

        {syncStatus && !isSyncing && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-primary font-bold italic"
          >
            {syncStatus}
          </motion.p>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 ml-4">Sacred Dimensions</h4>
        {[
          { label: 'Menstrual Cycle', status: 'Reading & Writing', icon: Droplets },
          { label: 'Symptoms & Mood', status: 'Reading', icon: Heart },
          { label: 'Predictions', status: 'Writing', icon: Sparkles },
        ].map((item, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                <item.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">{item.status}</p>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${user.healthSync?.enabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-muted'}`} />
          </div>
        ))}
      </div>

      <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-8 italic">
        Lumina requests permissions only to provide holistic insights. We never sell your sacred biological data.
      </p>
    </div>
  );
};

export { 
  DashboardView, 
  LogView, 
  InsightsView, 
  DiscoverView, 
  CalendarView, 
  SanctumView,
  TopBar, 
  BottomNav, 
  OnboardingView,
  SettingsView,
  NotificationCenter,
  InsightModal,
  HistoryModal,
  MorningGreeting
};
