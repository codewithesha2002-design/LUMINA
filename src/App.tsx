/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  DashboardView, 
  LogView, 
  InsightsView, 
  DiscoverView, 
  TopBar, 
  BottomNav,
  CalendarView,
  OnboardingView,
  SettingsView,
  SanctumView,
  NotificationCenter,
  InsightModal,
  HistoryModal,
  MorningGreeting
} from './components/Views.tsx';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('cycle');
  const [isDark, setIsDark] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('lumina_onboarding_complete');
  });
  const [user, setUser] = useState<{name: string; email: string; avatar: string; healthSync?: any}>(() => {
    const saved = localStorage.getItem('lumina_user');
    return saved ? JSON.parse(saved) : { name: 'Soul', email: '', avatar: '' };
  });
  const [cycleParams, setCycleParams] = useState(() => {
    const saved = localStorage.getItem('lumina_cycle_params');
    return saved ? JSON.parse(saved) : {
      cycleLength: 28,
      periodLength: 5,
      lutealLength: 14,
      lastPeriodDate: '2026-04-08'
    };
  });
  const [loggedSymptoms, setLoggedSymptoms] = useState<string[]>(['Bloating']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Modals state
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  // Expose setters globally for deep interactions
  useEffect(() => {
    (window as any).setInsightModal = setShowInsight;
    (window as any).setHistoryModal = setShowHistory;
    
    // Session Restoration - REMOVED GMAIL AUTH
    const restoreSession = async () => {
      // Logic handled via localStorage in initializers
    };

    restoreSession();
    
    // Check if permission is already granted
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }

    // Show greeting after onboarding or on start
    const hasSeenGreetingToday = localStorage.getItem('lastGreetingDate') === new Date().toDateString();
    if (!hasSeenGreetingToday) {
      // We will show it once onboarding is done
    }
  }, []);

  useEffect(() => {
    // Only attempt to show the greeting if onboarding is finished and authentication is complete
    if (!showOnboarding) {
       const today = new Date().toDateString();
       const hasSeenGreetingToday = localStorage.getItem('lastGreetingDate') === today;
       
       if (!hasSeenGreetingToday) {
         // The greeting only appears when the user is settled on the main 'cycle' tab
         // This ensures it doesn't interrupt other setup tasks or sub-views
         if (activeTab === 'cycle') {
           const timer = setTimeout(() => setShowGreeting(true), 2500);
           return () => clearTimeout(timer);
         }
       }
    }
  }, [showOnboarding, activeTab]);

  const handleDismissGreeting = () => {
    setShowGreeting(false);
    localStorage.setItem('lastGreetingDate', new Date().toDateString());
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification("Lumina Sanctum", { 
            body: "Welcome to Lumina! Your mindful cycle notifications are now active. ✨",
            icon: user.avatar 
          });
        } else {
          alert("Please enable notification permissions in your browser settings to receive alerts.");
        }
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const activeColor = isDark ? '#c5c5d2' : '#8a486f';

  const handleOnboardingComplete = (userData: { name: string; email?: string; avatar: string; cycleLength: number; periodLength: number; lutealLength: number; lastPeriodDate: string }) => {
    const newUser = { name: userData.name, email: userData.email || '', avatar: userData.avatar };
    const newParams = {
      cycleLength: userData.cycleLength,
      periodLength: userData.periodLength,
      lutealLength: userData.lutealLength,
      lastPeriodDate: userData.lastPeriodDate
    };
    
    setUser(newUser);
    setCycleParams(newParams);
    
    localStorage.setItem('lumina_user', JSON.stringify(newUser));
    localStorage.setItem('lumina_cycle_params', JSON.stringify(newParams));
    localStorage.setItem('lumina_onboarding_complete', 'true');
    
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen pb-32">
      <AnimatePresence mode="wait">
        {showOnboarding && (
          <motion.div 
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <OnboardingView onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <SettingsView 
            onClose={() => setShowSettings(false)} 
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={toggleNotifications}
            cycleParams={cycleParams}
            setCycleParams={setCycleParams}
            user={user}
            setUser={setUser}
          />
        )}
        {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
        {showInsight && (
          <InsightModal 
            onClose={() => setShowInsight(false)} 
            user={user}
            cycleParams={cycleParams}
            loggedSymptoms={loggedSymptoms}
          />
        )}
        {showHistory && <HistoryModal onClose={() => setShowHistory(false)} cycleParams={cycleParams} />}
        {showGreeting && activeTab === 'cycle' && (
          <MorningGreeting userName={user.name} onClose={handleDismissGreeting} />
        )}
      </AnimatePresence>

      {!showOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <TopBar 
            title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
            isDark={isDark} 
            toggleTheme={toggleTheme} 
            onSettings={() => setShowSettings(true)}
            onNotifications={() => setShowNotifications(true)}
            user={user}
          />
          
          <main className="pt-24 px-6 max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'cycle' && (
                <motion.div key="cycle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <DashboardView 
                    isDark={isDark} 
                    userName={user.name} 
                    loggedSymptoms={loggedSymptoms} 
                    cycleParams={cycleParams}
                  />
                </motion.div>
              )}
              {activeTab === 'log' && (
                <motion.div key="log" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                  <LogView symptoms={loggedSymptoms} setSymptoms={setLoggedSymptoms} cycleParams={cycleParams} />
                </motion.div>
              )}
              {activeTab === 'insights' && (
                <motion.div key="insights" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <InsightsView 
                    user={user}
                    cycleParams={cycleParams}
                    loggedSymptoms={loggedSymptoms}
                  />
                </motion.div>
              )}
              {activeTab === 'discover' && (
                <motion.div key="discover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <DiscoverView />
                </motion.div>
              )}
              {activeTab === 'calendar' && (
                <motion.div key="calendar" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                  <CalendarView cycleParams={cycleParams} />
                </motion.div>
              )}
              {activeTab === 'sanctum' && (
                <motion.div key="sanctum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <SanctumView user={user} setUser={setUser} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            activeColor={activeColor}
          />

          {activeTab === 'cycle' && (
            <motion.button 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab('calendar')}
              className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-40"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
