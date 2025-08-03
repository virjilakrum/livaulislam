import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Filter, BookOpen, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ArticleCard } from '../components/ArticleCard';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  reading_time: number;
  view_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  published_at: string;
  tags: string[];
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  followers_count: number;
  following_count: number;
}

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [articles, setArticles] = useState<Article[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'authors'>('articles');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'popularity'>('relevance');

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setArticles([]);
      setProfiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Search articles
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(username, display_name, avatar_url)
        `)
        .eq('published', true)
        .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
        .order(
          sortBy === 'date' ? 'published_at' : 
          sortBy === 'popularity' ? 'view_count' : 'created_at', 
          { ascending: false }
        )
        .limit(20);

      if (articleError) {
        console.error('Error searching articles:', articleError);
      }

      // Search profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`)
        .limit(10);

      if (profileError) {
        console.error('Error searching profiles:', profileError);
      }

      // Transform article data
      const transformedArticles = articleData?.map(article => ({
        ...article,
        author: article.author || {
          username: 'unknown',
          display_name: 'Unknown Author',
          avatar_url: ''
        }
      })) || [];

      setArticles(transformedArticles);
      setProfiles(profileData || []);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLikeUpdate = (articleId: string, newLikesCount: number) => {
    setArticles(prev => 
      prev.map(article => 
        article.id === articleId 
          ? { ...article, likes_count: newLikesCount }
          : article
      )
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-neutral-900 to-black border-b border-neutral-800/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-amber-100 hover:text-amber-300 transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <div className="flex items-center space-x-3 mb-6">
            <Search className="h-8 w-8 text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold text-amber-100">Search Results</h1>
              {query && (
                <p className="text-neutral-400 mt-2">
                  Results for "{query}"
                </p>
              )}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, authors, or topics..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-neutral-700/50 rounded-lg text-amber-100 placeholder-neutral-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
            />
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!query ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">Search for articles and authors</h2>
            <p className="text-neutral-600 max-w-md mx-auto">
              Enter keywords, topics, or author names to find relevant content.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs and Filters */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex space-x-1 bg-white rounded-lg p-1 border border-neutral-200">
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'articles'
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  Articles ({articles.length})
                </button>
                <button
                  onClick={() => setActiveTab('authors')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'authors'
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  Authors ({profiles.length})
                </button>
              </div>

              {activeTab === 'articles' && (
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-neutral-600" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="date">Most Recent</option>
                    <option value="popularity">Most Popular</option>
                  </select>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <>
                {/* Articles Tab */}
                {activeTab === 'articles' && (
                  <div>
                    {articles.length === 0 ? (
                      <div className="text-center py-16">
                        <BookOpen className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-neutral-800 mb-4">No articles found</h3>
                        <p className="text-neutral-600">
                          Try adjusting your search terms or browse our latest articles.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {articles.map((article) => (
                          <ArticleCard 
                            key={article.id} 
                            article={article} 
                            onLikeUpdate={handleLikeUpdate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Authors Tab */}
                {activeTab === 'authors' && (
                  <div>
                    {profiles.length === 0 ? (
                      <div className="text-center py-16">
                        <User className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-neutral-800 mb-4">No authors found</h3>
                        <p className="text-neutral-600">
                          Try adjusting your search terms to find authors.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profiles.map((profile) => (
                          <div key={profile.id} className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-start space-x-4">
                              <img
                                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name)}&background=f59e0b&color=fff`}
                                alt={profile.display_name}
                                className="h-16 w-16 rounded-full"
                              />
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-neutral-900 mb-1">
                                  {profile.display_name}
                                </h3>
                                <p className="text-neutral-600 mb-2">@{profile.username}</p>
                                {profile.bio && (
                                  <p className="text-neutral-700 text-sm mb-3 line-clamp-2">
                                    {profile.bio}
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                                  <span>{profile.followers_count} followers</span>
                                  <span>{profile.following_count} following</span>
                                </div>
                                <button
                                  onClick={() => navigate(`/profile/${profile.username}`)}
                                  className="mt-3 text-amber-600 hover:text-amber-700 font-medium text-sm"
                                >
                                  View Profile →
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
