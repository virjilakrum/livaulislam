import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  MapPin, 
  Globe, 
  Twitter, 
  Linkedin, 
  Calendar,
  Users,
  BookOpen,
  Heart,
  Settings,
  Camera,
  Mail,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ArticleCard } from '../components/ArticleCard';
import { EditProfileModal } from '../components/EditProfileModal';

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  website: string;
  twitter: string;
  linkedin: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  reading_time: number;
  view_count: number;
  created_at: string;
  published_at: string;
  published: boolean;
  tags: string[];
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface ProfileStats {
  articlesCount: number;
  publishedArticlesCount: number;
  followersCount: number;
  followingCount: number;
  totalViews: number;
  totalLikes: number;
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, profile: currentUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    articlesCount: 0,
    publishedArticlesCount: 0,
    followersCount: 0,
    followingCount: 0,
    totalViews: 0,
    totalLikes: 0
  });
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const isOwnProfile = currentUserProfile?.username === username;

  useEffect(() => {
    console.log('ProfilePage mounted, username:', username);
    
    if (!username) {
      console.log('No username provided');
      setError('Username not provided');
      setLoading(false);
      return;
    }
    
    if (username) {
      fetchProfile();
    } else {
      setLoading(false);
      setError('Username parameter is missing');
    }
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchArticles();
      if (user && !isOwnProfile) {
        checkFollowStatus();
      }
    }
  }, [profile, activeTab, user, isOwnProfile]);

  const fetchProfile = async () => {
    if (!username) {
      setError('Username not provided');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching profile for username:', username);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .limit(1);

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }
      
      if (!profileData || profileData.length === 0) {
        console.log('No profile found for username:', username);
        setError('Profile not found');
        return;
      }

      const profileInfo = profileData[0];
      setProfile(profileInfo);
      console.log('Profile loaded:', profileInfo);

      // Fetch stats
      await fetchStats(profileInfo.id);
      
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (profileId: string) => {
    try {
      console.log('Fetching stats for profile ID:', profileId);

      // Get articles count
      const { count: articlesCount, error: articlesError } = await supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profileId);

      if (articlesError) {
        console.error('Articles count error:', articlesError);
      }

      // Get published articles count
      const { count: publishedCount, error: publishedError } = await supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', profileId)
        .eq('published', true);

      if (publishedError) {
        console.error('Published count error:', publishedError);
      }

      // Get followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', profileId);

      if (followersError) {
        console.error('Followers count error:', followersError);
      }

      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', profileId);

      if (followingError) {
        console.error('Following count error:', followingError);
      }

      // Get total views
      const { data: viewsData, error: viewsError } = await supabase
        .from('articles')
        .select('view_count')
        .eq('author_id', profileId)
        .eq('published', true);

      let totalViews = 0;
      if (!viewsError && viewsData && Array.isArray(viewsData)) {
        totalViews = viewsData.reduce((sum, article) => sum + (article.view_count || 0), 0);
      }

      // Get total likes
      const { count: totalLikes, error: likesError } = await supabase
        .from('article_likes')
        .select('id', { count: 'exact', head: true })
        .in('article_id', 
          await supabase
            .from('articles')
            .select('id')
            .eq('author_id', profileId)
            .eq('published', true)
            .then(({ data }) => data?.map(article => article.id) || [])
        );

      setStats({
        articlesCount: articlesCount || 0,
        publishedArticlesCount: publishedCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        totalViews,
        totalLikes: totalLikes || 0
      });

      console.log('Stats loaded:', {
        articlesCount,
        publishedCount,
        followersCount,
        followingCount,
        totalViews,
        totalLikes
      });

    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchArticles = async () => {
    if (!profile) {
      console.log('No profile available for articles fetch');
      setArticlesLoading(false);
      return;
    }
    
    if (!username) {
      console.log('No username available for articles fetch');
      setArticlesLoading(false);
      return;
    }
    
    if (!profile) {
      console.log('No profile available for articles fetch');
      setArticlesLoading(false);
      return;
    }
    
    try {
      setArticlesLoading(true);
      console.log('Fetching articles for profile:', profile.id, 'tab:', activeTab);
      
      let query = supabase
        .from('articles')
        .select(`
          *,
          profiles!articles_author_id_fkey(username, display_name, avatar_url)
        `)
        .eq('author_id', profile.id);

      // Apply filters based on tab and ownership
      if (isOwnProfile) {
        query = activeTab === 'published' 
          ? query.eq('published', true)
          : query.eq('published', false);
      } else {
        query = query.eq('published', true);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Articles fetch error:', error);
        setArticles([]);
        return;
      }
      
      if (!data || !Array.isArray(data)) {
        console.log('No articles data or not an array:', data);
        setArticles([]);
        return;
      }
      
      // Transform data to match expected format
      const transformedArticles = data.map(article => ({
        ...article,
        author: article.profiles || {
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url || ''
        }
      }));
      
      setArticles(transformedArticles);
      console.log('Articles loaded:', transformedArticles.length);
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .limit(1);

      if (error) {
        console.error('Follow status error:', error);
        return;
      }
      
      setIsFollowing(data && data.length > 0);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user || !profile || isFollowLoading) return;

    try {
      setIsFollowLoading(true);

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        if (error) throw error;
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          });

        if (error) throw error;
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      alert('Error updating follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile();
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Profile Not Found</h2>
          <p className="text-neutral-600 mb-6">{error || 'The requested profile could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium border-2 border-black transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: '#000000' }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="rounded-lg shadow-sm p-8 mb-8 border-2 border-black" style={{ backgroundColor: '#FEF7ED' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-32 h-32 rounded-full border-2 border-black object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-2 border-black flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}>
                  <User className="w-16 h-16 text-black" />
                </div>
              )}
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-2 -right-2 p-2 rounded-full border-2 border-black shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: '#FEF7ED' }}
                >
                  <Camera className="w-4 h-4 text-black" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-black mb-2">{profile.display_name}</h1>
                  <p className="text-lg text-neutral-600">@{profile.username}</p>
                </div>
                
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-black font-medium transition-all duration-300 hover:shadow-lg"
                      style={{ backgroundColor: '#FEF7ED', color: '#000000' }}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : user ? (
                    <button
                      onClick={handleFollow}
                      disabled={isFollowLoading}
                      className={`px-6 py-2 rounded-lg font-medium border-2 border-black transition-all duration-300 hover:shadow-lg disabled:opacity-50 ${
                        isFollowing 
                          ? 'bg-black text-white hover:bg-neutral-800'
                          : 'text-black'
                      }`}
                      style={!isFollowing ? { backgroundColor: '#FEF7ED' } : {}}
                    >
                      {isFollowLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-black mb-4 leading-relaxed">{profile.bio}</p>
              )}

              {/* Profile Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 mb-4">
                {profile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-black hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{profile.website}</span>
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-black hover:underline"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>@{profile.twitter}</span>
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-black hover:underline"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>{profile.linkedin}</span>
                  </a>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{stats.publishedArticlesCount}</div>
                  <div className="text-sm text-neutral-600">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{stats.followersCount}</div>
                  <div className="text-sm text-neutral-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{stats.followingCount}</div>
                  <div className="text-sm text-neutral-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{stats.totalViews.toLocaleString()}</div>
                  <div className="text-sm text-neutral-600">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{stats.totalLikes}</div>
                  <div className="text-sm text-neutral-600">Total Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        {isOwnProfile && (
          <div className="flex space-x-1 p-1 rounded-lg border-2 border-black mb-8" style={{ backgroundColor: '#FEF7ED' }}>
            <button
              onClick={() => setActiveTab('published')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === 'published'
                  ? 'bg-black text-white shadow-lg'
                  : 'text-black hover:bg-black hover:bg-opacity-10'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Published ({stats.publishedArticlesCount})</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                activeTab === 'drafts'
                  ? 'bg-black text-white shadow-lg'
                  : 'text-black hover:bg-black hover:bg-opacity-10'
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Drafts ({stats.articlesCount - stats.publishedArticlesCount})</span>
              </span>
            </button>
          </div>
        )}

        {/* Articles */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">
            {isOwnProfile 
              ? (activeTab === 'published' ? 'Published Articles' : 'Draft Articles')
              : 'Published Articles'
            }
          </h2>
          
          {articlesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading articles...</p>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div key={article.id} className="border-2 border-black rounded-lg overflow-hidden" style={{ backgroundColor: '#FEF7ED' }}>
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg border-2 border-black" style={{ backgroundColor: '#FEF7ED' }}>
              <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                {isOwnProfile 
                  ? (activeTab === 'published' ? 'No published articles yet' : 'No drafts yet')
                  : 'No articles published yet'
                }
              </h3>
              <p className="text-neutral-600 mb-4">
                {isOwnProfile 
                  ? (activeTab === 'published' 
                    ? 'Start writing and publish your first article!'
                    : 'Create your first draft and start writing!')
                  : `${profile.display_name} hasn't published any articles yet.`
                }
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/write')}
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium border-2 border-black transition-all duration-300 hover:shadow-lg"
                >
                  {activeTab === 'published' ? 'Write Your First Article' : 'Create Draft'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}