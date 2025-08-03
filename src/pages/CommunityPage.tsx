import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  UserPlus, 
  UserCheck, 
  BookOpen, 
  Heart, 
  MessageCircle,
  Crown,
  Star,
  Activity,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface CommunityStats {
  total_users: number;
  total_articles: number;
  total_likes: number;
  total_comments: number;
}

interface TrendingTopic {
  tag: string;
  count: number;
}

interface SuggestedUser {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  followers_count: number;
  article_count: number;
}

interface TopAuthor {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  followers_count: number;
  article_count: number;
  total_likes: number;
}

interface RecentActivity {
  id: string;
  type: 'article' | 'like' | 'comment' | 'follow';
  user: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  article?: {
    title: string;
    slug: string;
  };
  target_user?: {
    username: string;
    display_name: string;
  };
  created_at: string;
}

export function CommunityPage() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<CommunityStats>({
    total_users: 0,
    total_articles: 0,
    total_likes: 0,
    total_comments: 0
  });
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [topAuthors, setTopAuthors] = useState<TopAuthor[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'following' | 'trending'>('discover');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunityData();
    if (user) {
      fetchFollowingUsers();
    }
  }, [user]);

  const fetchCommunityData = async () => {
    try {
      // Fetch community stats
      const { data: statsData, error: statsError } = await supabase.rpc('get_community_stats');
      if (!statsError && statsData) {
        setStats(statsData);
      }

      // Fetch trending topics
      const { data: topicsData, error: topicsError } = await supabase.rpc('get_trending_topics', { limit_param: 8 });
      if (!topicsError && topicsData) {
        setTrendingTopics(topicsData);
      }

      // Fetch suggested users
      if (user) {
        const { data: suggestedData, error: suggestedError } = await supabase.rpc('get_suggested_users', { 
          user_id: user.id, 
          limit_param: 6 
        });
        if (!suggestedError && suggestedData) {
          setSuggestedUsers(suggestedData);
        }
      }

      // Fetch top authors
      const { data: authorsData, error: authorsError } = await supabase
        .from('profiles')
        .select(`
          *,
          article_count:articles(count),
          total_likes:articles(likes_count)
        `)
        .order('followers_count', { ascending: false })
        .limit(5);

      if (!authorsError && authorsData) {
        const transformedAuthors = authorsData.map(author => ({
          ...author,
          article_count: author.article_count?.[0]?.count || 0,
          total_likes: author.total_likes?.reduce((sum: number, article: any) => sum + (article.likes_count || 0), 0) || 0
        }));
        setTopAuthors(transformedAuthors);
      }

      // Fetch recent activity (simplified version)
      const { data: activityData, error: activityError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          created_at,
          author:profiles(username, display_name, avatar_url)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!activityError && activityData) {
        const activities: RecentActivity[] = activityData.map(article => ({
          id: article.id,
          type: 'article' as const,
          user: article.author,
          article: {
            title: article.title,
            slug: article.slug
          },
          created_at: article.created_at
        }));
        setRecentActivity(activities);
      }

    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowingUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!error && data) {
        setFollowingUsers(new Set(data.map(follow => follow.following_id)));
      }
    } catch (error) {
      console.error('Error fetching following users:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      if (followingUsers.has(userId)) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });
        
        setFollowingUsers(prev => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-neutral-900 to-black border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-amber-100 flex items-center">
                <Users className="h-8 w-8 mr-3" />
                Community
              </h1>
              <p className="text-neutral-400 mt-2">Discover amazing writers and connect with fellow readers</p>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community..."
                className="w-80 pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-neutral-700/50 rounded-lg text-amber-100 placeholder-neutral-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
              <Users className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-100">{stats.total_users.toLocaleString()}</div>
              <div className="text-neutral-400 text-sm">Writers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
              <BookOpen className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-100">{stats.total_articles.toLocaleString()}</div>
              <div className="text-neutral-400 text-sm">Articles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
              <Heart className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-100">{stats.total_likes.toLocaleString()}</div>
              <div className="text-neutral-400 text-sm">Likes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 text-center">
              <MessageCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-100">{stats.total_comments.toLocaleString()}</div>
              <div className="text-neutral-400 text-sm">Comments</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 border border-neutral-200 w-fit">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-amber-100 text-amber-800'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-amber-100 text-amber-800'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Trending
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('following')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              Following
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <>
                {/* Suggested Users */}
                {user && suggestedUsers.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                    <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Suggested for You
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestedUsers.map((suggestedUser) => (
                        <div key={suggestedUser.id} className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-lg">
                          <img
                            src={suggestedUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(suggestedUser.display_name)}&background=f59e0b&color=fff`}
                            alt={suggestedUser.display_name}
                            className="h-12 w-12 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/profile/${suggestedUser.username}`}
                              className="font-semibold text-neutral-900 hover:text-amber-600 block truncate"
                            >
                              {suggestedUser.display_name}
                            </Link>
                            <p className="text-neutral-600 text-sm">@{suggestedUser.username}</p>
                            {suggestedUser.bio && (
                              <p className="text-neutral-700 text-sm mt-1 line-clamp-2">{suggestedUser.bio}</p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-3 text-xs text-neutral-600">
                                <span>{suggestedUser.followers_count} followers</span>
                                <span>{suggestedUser.article_count} articles</span>
                              </div>
                              <button
                                onClick={() => handleFollow(suggestedUser.id)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  followingUsers.has(suggestedUser.id)
                                    ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                                    : 'bg-amber-600 text-white hover:bg-amber-700'
                                }`}
                              >
                                {followingUsers.has(suggestedUser.id) ? (
                                  <>
                                    <UserCheck className="h-3 w-3 inline mr-1" />
                                    Following
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-3 w-3 inline mr-1" />
                                    Follow
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                  <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-neutral-50 rounded-lg transition-colors">
                        <img
                          src={activity.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user.display_name)}&background=f59e0b&color=fff`}
                          alt={activity.user.display_name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/profile/${activity.user.username}`}
                              className="font-medium text-neutral-900 hover:text-amber-600"
                            >
                              {activity.user.display_name}
                            </Link>
                            <span className="text-neutral-600">published</span>
                            {activity.article && (
                              <Link
                                to={`/article/${activity.article.slug}`}
                                className="text-amber-600 hover:text-amber-700 font-medium"
                              >
                                {activity.article.title}
                              </Link>
                            )}
                          </div>
                          <p className="text-neutral-500 text-sm mt-1">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Trending Tab */}
            {activeTab === 'trending' && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending Topics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {trendingTopics.map((topic, index) => (
                    <Link
                      key={topic.tag}
                      to={`/search?q=${encodeURIComponent(topic.tag)}`}
                      className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-amber-800">#{topic.tag}</span>
                        {index < 3 && <Crown className="h-4 w-4 text-amber-600" />}
                      </div>
                      <p className="text-amber-700 text-sm">{topic.count} articles</p>
                      <ArrowRight className="h-4 w-4 text-amber-600 mt-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && user && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center">
                  <UserCheck className="h-5 w-5 mr-2" />
                  People You Follow
                </h2>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">Activity from people you follow will appear here.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Authors */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Top Authors
              </h3>
              <div className="space-y-4">
                {topAuthors.map((author, index) => (
                  <div key={author.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 relative">
                      <img
                        src={author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.display_name)}&background=f59e0b&color=fff`}
                        alt={author.display_name}
                        className="h-10 w-10 rounded-full"
                      />
                      {index < 3 && (
                        <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          'bg-amber-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${author.username}`}
                        className="font-medium text-neutral-900 hover:text-amber-600 block truncate"
                      >
                        {author.display_name}
                      </Link>
                      <div className="flex items-center space-x-2 text-xs text-neutral-600">
                        <span>{author.followers_count} followers</span>
                        <span>•</span>
                        <span>{author.article_count} articles</span>
                      </div>
                    </div>
                    {user && user.id !== author.id && (
                      <button
                        onClick={() => handleFollow(author.id)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          followingUsers.has(author.id)
                            ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                            : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                      >
                        {followingUsers.has(author.id) ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/write"
                  className="flex items-center space-x-3 p-3 bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Write Article</span>
                </Link>
                <Link
                  to="/search"
                  className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Search className="h-5 w-5" />
                  <span>Explore Content</span>
                </Link>
                {user && (
                  <Link
                    to={`/profile/${user.user_metadata?.username || 'me'}`}
                    className="flex items-center space-x-3 p-3 bg-purple-50 text-purple-800 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Users className="h-5 w-5" />
                    <span>My Profile</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
