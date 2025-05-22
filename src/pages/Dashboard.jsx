import React, { useState, useEffect } from 'react';
import { FiSettings, FiUser, FiX, FiHome, FiBell, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PreferencesForm from '../components/PreferencesForm';
import NewsList from '../components/NewsList';
import AlertHistory from '../components/AlertHistory';

export default function Dashboard() {
  const [email, setEmail] = useState('');
  const [showPrefs, setShowPrefs] = useState(false);
  const [activeTab, setActiveTab] = useState('news');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simulate unread alerts count (replace with real data from your API)
  useEffect(() => {
    if (!email) return;
    const interval = setInterval(() => {
      setUnreadCount(prev => Math.min(prev + Math.floor(Math.random() * 2), 5));
    }, 30000);
    return () => clearInterval(interval);
  }, [email]);

  const handleSignOut = () => {
    setEmail('');
    setShowPrefs(false);
    setActiveTab('news');
    toast.success('Signed out successfully');
  };

  const tabComponents = {
    news: <NewsList />,
    alerts: <AlertHistory email={email} />,
    preferences: <PreferencesForm email={email} onUpdate={() => {
      setShowPrefs(false);
      setActiveTab('news');
    }} />
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <FiHome className="text-blue-600" size={24} />
              <h1 className="text-2xl font-bold text-gray-800">News Pulse</h1>
            </div>
          </div>
          
          {email ? (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setActiveTab('alerts')}
                  className="p-1 text-gray-600 hover:text-blue-600 transition-colors relative"
                >
                  <FiBell size={22} />
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-gray-700 font-medium">{email}</span>
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                  title="Sign out"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && email && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white shadow-md md:hidden overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => { setActiveTab('news'); setIsMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                  activeTab === 'news' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiHome className="mr-3" />
                News Feed
              </button>
              <button
                onClick={() => { setActiveTab('alerts'); setIsMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                  activeTab === 'alerts' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiBell className="mr-3" />
                My Alerts
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setActiveTab('preferences'); setShowPrefs(true); setIsMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg ${
                  activeTab === 'preferences' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSettings className="mr-3" />
                Preferences
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <FiLogOut className="mr-3" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!email ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-white rounded-xl shadow-sm overflow-hidden p-8 border border-gray-100"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to News Pulse</h2>
              <p className="text-gray-600">Get real-time news alerts tailored to your interests</p>
            </div>
            <form 
              onSubmit={e => { e.preventDefault(); setEmail(e.target.email.value); }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Continue
              </button>
            </form>
          </motion.div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-8 border border-gray-100">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'news' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FiHome className="mr-3" />
                    News Feed
                  </button>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'alerts' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FiBell className="mr-3" />
                    My Alerts
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('preferences');
                      setShowPrefs(true);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === 'preferences' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FiSettings className="mr-3" />
                    Preferences
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {tabComponents[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} News Pulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}