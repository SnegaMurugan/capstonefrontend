import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiClock, 
  FiExternalLink, 
  FiBookmark, 
  FiShare2, 
  FiSearch, 
  FiX,
  FiFilter,
  FiAlertCircle
} from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AlertHistory = ({ email }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAlert, setExpandedAlert] = useState(null);

  useEffect(() => {
    if (!email) return;
    
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://newsapp-backend-jmqv.onrender.com/api/news?email=${email}`);
        setAlerts(res.data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        toast.error('Failed to load alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [email]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.category === filter;
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alert.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleBookmark = async (alertId) => {
    try {
      await axios.post(`https://newsapp-backend-jmqv.onrender.com/api/news/bookmark`, { 
        email, 
        alertId 
      });
      setAlerts(alerts.map(alert => 
        alert._id === alertId ? { ...alert, bookmarked: !alert.bookmarked } : alert
      ));
      toast.success(
        alerts.find(a => a._id === alertId).bookmarked 
          ? 'Removed from bookmarks' 
          : 'Added to bookmarks'
      );
    } catch (error) {
      console.error("Error bookmarking:", error);
      toast.error('Failed to update bookmark. Please try again.');
    }
  };

  const handleShare = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => toast.info('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const toggleExpandAlert = (alertId) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  const categoryColors = {
    business: 'bg-blue-100 text-blue-800',
    technology: 'bg-purple-100 text-purple-800',
    sports: 'bg-green-100 text-green-800',
    health: 'bg-red-100 text-red-800',
    entertainment: 'bg-yellow-100 text-yellow-800',
  };

  if (!email) return (
    <div className="p-6 text-center bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col items-center justify-center space-y-3">
        <FiAlertCircle className="text-gray-400 text-4xl" />
        <p className="text-gray-600 font-medium">Please enter your email to view alert history</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your News Alerts</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'} found
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search alerts..."
              className="pl-10 pr-10 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="appearance-none pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="business">Business</option>
              <option value="technology">Technology</option>
              <option value="sports">Sports</option>
              <option value="health">Health</option>
              <option value="entertainment">Entertainment</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border border-gray-100 rounded-lg">
              <Skeleton height={24} width="70%" />
              <Skeleton height={16} width="90%" className="mt-3" />
              <Skeleton height={16} width="40%" className="mt-3" />
              <div className="flex mt-4">
                <Skeleton height={32} width={32} circle className="mr-2" />
                <Skeleton height={32} width={32} circle />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiAlertCircle className="mx-auto text-gray-400 text-4xl mb-3" />
          <p className="text-gray-500 font-medium">No alerts found matching your criteria</p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div 
              key={alert._id} 
              className={`p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-all duration-200 ${expandedAlert === alert._id ? 'bg-gray-50' : ''}`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {alert.imageUrl && (
                  <div className="sm:w-1/4 flex-shrink-0">
                    <img 
                      src={alert.imageUrl} 
                      alt={alert.title} 
                      className="rounded-lg w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => toggleExpandAlert(alert._id)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className={`flex-1 ${!alert.imageUrl ? 'sm:pl-0' : ''}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${categoryColors[alert.category] || 'bg-gray-100 text-gray-800'}`}>
                          {alert.category}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <FiClock className="mr-1" size={12} />
                          {new Date(alert.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <h3 
                        className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => toggleExpandAlert(alert._id)}
                      >
                        {alert.title}
                      </h3>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleBookmark(alert._id)}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${alert.bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        aria-label={alert.bookmarked ? "Remove bookmark" : "Bookmark this"}
                      >
                        <FiBookmark size={18} fill={alert.bookmarked ? 'currentColor' : 'none'} />
                      </button>
                      <button 
                        className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-colors"
                        aria-label="Share"
                        onClick={() => handleShare(alert.url)}
                      >
                        <FiShare2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {(expandedAlert === alert._id || !alert.description) && (
                    <>
                      {alert.description && (
                        <p className="mt-3 text-gray-600 whitespace-pre-line">
                          {alert.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {alert.source}
                        </span>
                        <a 
                          href={alert.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm flex items-center text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                          Read full story <FiExternalLink className="ml-1" size={14} />
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertHistory;