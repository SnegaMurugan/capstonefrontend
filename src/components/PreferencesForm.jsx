import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiBell, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const categories = [
  { value: 'general', label: 'General', icon: '🌐' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'science', label: 'Science', icon: '🔬' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'technology', label: 'Technology', icon: '💻' },
];

const notificationMethods = [
  { id: 'email', label: 'Email', icon: '✉️', color: 'bg-blue-100 border-blue-200' },
  { id: 'push', label: 'Push Notifications', icon: '📱', color: 'bg-purple-100 border-purple-200' },
  { id: 'both', label: 'Both', icon: '🔔', color: 'bg-green-100 border-green-200' },
];

const frequencyOptions = [
  { 
    value: 'immediate', 
    label: 'Instant Alerts', 
    desc: 'Get alerts as soon as news breaks',
    icon: '⚡',
    color: 'bg-red-100 border-red-200'
  },
  { 
    value: 'hourly', 
    label: 'Hourly Digest', 
    desc: 'Get a summary every hour',
    icon: '⏱️',
    color: 'bg-yellow-100 border-yellow-200'
  },
  { 
    value: 'daily', 
    label: 'Daily Digest', 
    desc: 'Get a summary once per day',
    icon: '📅',
    color: 'bg-blue-100 border-blue-200'
  },
];

export default function PreferencesForm({ email, onUpdate }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [frequency, setFrequency] = useState('immediate');
  const [notificationMethod, setNotificationMethod] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!email) return;
      try {
        setIsFetching(true);
        const response = await axios.get(`http://localhost:5000/api/users/preferences?email=${email}`);
        if (response.data) {
          setUserPreferences(response.data);
          setSelectedCategories(response.data.categories || []);
          setFrequency(response.data.frequency || 'immediate');
          setNotificationMethod(response.data.notificationMethod || 'email');
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
        toast.error('Failed to load preferences. Please try again.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchPreferences();
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedCategories.length === 0) {
      toast.warning('Please select at least one news category');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users/subscribe', {
        email,
        categories: selectedCategories,
        frequency,
        notificationMethod
      });
      toast.success('Preferences saved successfully!');
      onUpdate();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (!email) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center space-y-3">
          <FiBell className="text-gray-400 text-4xl" />
          <p className="text-gray-600 font-medium">Please sign in to manage your preferences</p>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-center space-x-3">
          <FiLoader className="animate-spin text-gray-400" size={24} />
          <span className="text-gray-500">Loading your preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-8">
        <div className="p-3 rounded-full bg-blue-50 text-blue-500 mr-4">
          <FiBell size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notification Preferences</h2>
          <p className="text-gray-500">Customize how you receive news alerts</p>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800">News Categories</h3>
          <span className="text-sm text-gray-500">
            {selectedCategories.length} selected
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => toggleCategory(cat.value)}
              className={`flex items-center p-3 rounded-xl border transition-all ${
                selectedCategories.includes(cat.value)
                  ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-700'
              }`}
            >
              <span className="text-lg mr-2">{cat.icon}</span>
              <span className="font-medium text-left flex-1">{cat.label}</span>
              {selectedCategories.includes(cat.value) && (
                <FiCheckCircle className="ml-2 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-5">Notification Frequency</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {frequencyOptions.map((option) => (
            <label key={option.value} className="block">
              <input
                type="radio"
                className="hidden"
                checked={frequency === option.value}
                onChange={() => setFrequency(option.value)}
              />
              <div className={`p-5 rounded-xl border cursor-pointer transition-all h-full ${
                frequency === option.value
                  ? `${option.color} border-opacity-100 shadow-sm`
                  : 'border-gray-200 hover:border-blue-200'
              }`}>
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{option.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{option.label}</h4>
                    <p className="mt-1 text-sm text-gray-600">{option.desc}</p>
                  </div>
                </div>
                <div className={`mt-3 h-1 w-full rounded-full ${
                  frequency === option.value ? 'bg-blue-500' : 'bg-transparent'
                }`}></div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-5">Delivery Method</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {notificationMethods.map((method) => (
            <label key={method.id} className="block">
              <input
                type="radio"
                className="hidden"
                checked={notificationMethod === method.id}
                onChange={() => setNotificationMethod(method.id)}
              />
              <div className={`p-5 rounded-xl border cursor-pointer transition-all h-full ${
                notificationMethod === method.id
                  ? `${method.color} border-opacity-100 shadow-sm`
                  : 'border-gray-200 hover:border-blue-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <span className="font-semibold text-gray-800">{method.label}</span>
                </div>
                <div className={`mt-3 h-1 w-full rounded-full ${
                  notificationMethod === method.id ? 'bg-blue-500' : 'bg-transparent'
                }`}></div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-xl text-white font-medium shadow-sm ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } transition-all`}
        >
          {isLoading ? (
            <>
              <FiLoader className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </form>
  );
}