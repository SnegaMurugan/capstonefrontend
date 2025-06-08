import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FiExternalLink, 
  FiClock, 
  FiBookmark, 
  FiShare2,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function NewsList({ category, userEmail }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const categoryColors = {
    business: 'bg-blue-100 text-blue-800',
    technology: 'bg-purple-100 text-purple-800',
    sports: 'bg-green-100 text-green-800',
    health: 'bg-red-100 text-red-800',
    entertainment: 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800'
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://newsapp-backend-jmqv.onrender.com/api/news?category=${category || ''}`
      );
      setNews(res.data);
      
      if (userEmail) {
        const bookmarksRes = await axios.get(
          `http://localhost:5000/api/users/bookmarks?email=${userEmail}`
        );
        const bookmarkIds = new Set(bookmarksRes.data.map(b => b.articleId));
        setBookmarkedIds(bookmarkIds);
      }
    } catch (err) {
      setError('Failed to load news. Please try again later.');
      console.error('Error fetching news:', err);
      toast.error('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category, userEmail]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const handleBookmark = async (articleId) => {
    if (!userEmail) {
      toast.info('Please sign in to bookmark articles');
      return;
    }
    
    try {
      const isBookmarked = bookmarkedIds.has(articleId);
      const endpoint = isBookmarked ? 'remove-bookmark' : 'add-bookmark';
      
      await axios.post(`http://localhost:5000/api/users/${endpoint}`, {
        email: userEmail,
        articleId
      });

      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        isBookmarked ? newSet.delete(articleId) : newSet.add(articleId);
        return newSet;
      });

      toast.success(
        isBookmarked 
          ? 'Article removed from bookmarks' 
          : 'Article added to bookmarks'
      );
    } catch (err) {
      console.error('Error updating bookmark:', err);
      toast.error('Failed to update bookmark. Please try again.');
    }
  };

  const handleShare = async (url) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this news article',
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.info('Link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        toast.error('Failed to share article');
      }
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center space-y-3">
          <FiAlertCircle className="text-red-400 text-4xl" />
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} News` : 'Latest News'}
          </h2>
          {!loading && news.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Showing {news.length} {news.length === 1 ? 'article' : 'articles'}
            </p>
          )}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
            loading || refreshing
              ? 'bg-gray-100 text-gray-400'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <Skeleton height={180} className="rounded-b-none" />
              <div className="p-4">
                <Skeleton height={24} width="40%" className="mb-3" />
                <Skeleton count={2} className="mb-2" />
                <Skeleton height={16} width="60%" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <FiAlertCircle className="mx-auto text-gray-400 text-4xl mb-3" />
          <p className="text-gray-500 font-medium">No news articles found</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center mx-auto"
          >
            <FiRefreshCw className="mr-2" />
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map(article => (
            <div 
              key={article._id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
            >
              {article.imageUrl && (
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.height = '0';
                    }}
                  />
                  {article.category && (
                    <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${
                      categoryColors[article.category] || categoryColors.default
                    }`}>
                      {article.category}
                    </span>
                  )}
                </div>
              )}
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {article.source}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBookmark(article._id)}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                        bookmarkedIds.has(article._id) 
                          ? 'text-yellow-500' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      aria-label={bookmarkedIds.has(article._id) ? "Remove bookmark" : "Bookmark this"}
                    >
                      <FiBookmark size={18} fill={bookmarkedIds.has(article._id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleShare(article.url)}
                      className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-colors"
                      aria-label="Share article"
                    >
                      <FiShare2 size={18} />
                    </button>
                  </div>
                </div>
                
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-semibold text-gray-800 hover:text-blue-600 mb-2 transition-colors line-clamp-2"
                >
                  {article.title}
                </a>
                
                {article.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.description}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-gray-500">
                  <FiClock className="mr-1.5" size={14} />
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}