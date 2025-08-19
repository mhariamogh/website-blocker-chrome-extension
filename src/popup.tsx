import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { PopupHome } from './components/PopupHome';
import { SettingsPage } from './components/SettingsPage';

// Main App component with navigation and Chrome storage
function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'settings'>('home');
  const [appData, setAppData] = useState({
    websites: ['instagram.com', 'twitter.com', 'facebook.com', 'youtube.com'],
    schedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00'
    },
    isBlocking: true
  });

  // Load data from Chrome storage on startup
  useEffect(() => {
    chrome.storage.sync.get(['websites', 'schedule', 'isBlocking']).then((data) => {
      if (data.websites || data.schedule || data.isBlocking !== undefined) {
        setAppData({
          websites: data.websites || appData.websites,
          schedule: data.schedule || appData.schedule,
          isBlocking: data.isBlocking !== undefined ? data.isBlocking : appData.isBlocking
        });
      }
    });
  }, []);

  const handleNavigateToSettings = () => {
    setCurrentPage('settings');
  };

  const handleNavigateBack = () => {
    setCurrentPage('home');
  };

  const handleSaveSettings = (data: { websites: string[]; schedule: { days: string[]; startTime: string; endTime: string; } }) => {
    const newAppData = {
      ...appData,
      websites: data.websites,
      schedule: data.schedule
    };
    
    setAppData(newAppData);
    
    // Save to Chrome storage
    chrome.storage.sync.set({
      websites: data.websites,
      schedule: data.schedule
    });
    
    // Tell background script to update blocking rules
    chrome.runtime.sendMessage({ action: 'updateBlocking' });
    
    setCurrentPage('home'); // Navigate back to home after saving
  };

  const handleToggleBlocking = (enabled: boolean) => {
    const newAppData = { ...appData, isBlocking: enabled };
    setAppData(newAppData);
    
    // Save to Chrome storage
    chrome.storage.sync.set({ isBlocking: enabled });
    
    // Tell background script to update blocking rules
    chrome.runtime.sendMessage({ action: 'updateBlocking' });
  };

  if (currentPage === 'settings') {
    return (
      <SettingsPage
        onNavigateBack={handleNavigateBack}
        onSave={handleSaveSettings}
        initialData={appData}
      />
    );
  }

  return (
    <PopupHome 
      onNavigateToSettings={handleNavigateToSettings}
      blockedWebsites={appData.websites}
      schedule={appData.schedule}
      isBlocking={appData.isBlocking}
      onToggleBlocking={handleToggleBlocking}
    />
  );
}

// Render the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}