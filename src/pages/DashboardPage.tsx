import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Edit3, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Settings,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followers: number;
  following: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  published: boolean;
  view_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  published_at: string | null;
}

export function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    followers: 0,
    following: 0
  });
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch user's articles
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (articlesError) {
        console.error('Error fetching articles:', articlesError);
        return;
      }

      // Calculate stats
      const totalArticles = articles?.length || 0;
      const totalViews = articles?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;
      const totalLikes = articles?.reduce((sum, article) => sum + (article.likes_count || 0), 0) || 0;
      const totalComments = articles?.reduce((sum, article) => sum + (article.comments_count || 0), 0) || 0;

      setStats({
        totalArticles,
        totalViews,
        totalLikes,
        totalComments,
        followers: profile?.followers_count || 0,
        following: profile?.following_count || 0
      });

      // Set recent articles (last 5)
      setRecentArticles(articles?.slice(0, 5) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-neutral-900 to-black border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-100">Dashboard</h1>
              <p className="text-neutral-400 mt-2">Welcome back, {profile.display_name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/write"
                className="flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                <span>New Article</span>
              </Link>
              <Link
                to={`/profile/${profile.username}`}
                className="flex items-center space-x-2 bg-neutral-700 text-amber-100 px-6 py-3 rounded-lg hover:bg-neutral-600 transition-colors"
              >
                <Eye className="h-5 w-5" />
                <span>View Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Articles</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalArticles}</p>
              </div>
              <BookOpen className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Views</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Likes</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalLikes}</p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Comments</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalComments}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Followers</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.followers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Following</p>
                <p className="text-3xl font-bold text-neutral-900">{stats.following}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900">Recent Articles</h2>
                  <Link
                    to="/write"
                    className="text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Write New Article
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {recentArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-4">You haven't written any articles yet.</p>
                    <Link
                      to="/write"
                      className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>Write Your First Article</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentArticles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 mb-1">{article.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              article.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {article.published ? 'Published' : 'Draft'}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(article.created_at), 'MMM d, yyyy')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{article.view_count}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Heart className="h-4 w-4" />
                              <span>{article.likes_count}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/write?edit=${article.id}`}
                            className="p-2 text-neutral-600 hover:text-amber-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          {article.published && (
                            <Link
                              to={`/article/${article.slug}`}
                              className="p-2 text-neutral-600 hover:text-blue-600 transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/write"
                  className="flex items-center space-x-3 p-3 bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Write New Article</span>
                </Link>
                <Link
                  to={`/profile/${profile.username}`}
                  className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-5 w-5" />
                  <span>View Public Profile</span>
                </Link>
                <button className="flex items-center space-x-3 p-3 bg-neutral-50 text-neutral-800 rounded-lg hover:bg-neutral-100 transition-colors w-full">
                  <Settings className="h-5 w-5" />
                  <span>Account Settings</span>
                </button>
                <button className="flex items-center space-x-3 p-3 bg-purple-50 text-purple-800 rounded-lg hover:bg-purple-100 transition-colors w-full">
                  <BarChart3 className="h-5 w-5" />
                  <span>Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
