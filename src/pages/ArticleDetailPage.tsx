import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Calendar, 
  Clock, 
  Eye,
  User,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string;
  reading_time: number;
  view_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  published_at: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    bio: string;
  };
  tags: string[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (article && user) {
      checkLikeStatus();
      checkBookmarkStatus();
    }
  }, [article, user]);

  useEffect(() => {
    if (article) {
      fetchComments();
    }
  }, [article]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(id, username, display_name, avatar_url, bio)
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        navigate('/');
        return;
      }

      setArticle(data);
      
      // Increment view count
      await supabase
        .from('articles')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);
        
    } catch (error) {
      console.error('Error fetching article:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!article) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(username, display_name, avatar_url)
        `)
        .eq('article_id', article.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkLikeStatus = async () => {
    if (!user || !article) return;

    try {
      const { data, error } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', article.id)
        .eq('user_id', user.id)
        .single();

      setIsLiked(!!data);
    } catch (error) {
      // No like found, which is fine
    }
  };

  const checkBookmarkStatus = async () => {
    // TODO: Implement bookmark functionality when bookmarks table is added
    setIsBookmarked(false);
  };

  const handleLike = async () => {
    if (!user || !article) return;

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        setArticle(prev => prev ? { ...prev, likes_count: prev.likes_count - 1 } : null);
      } else {
        // Like
        await supabase
          .from('article_likes')
          .insert({
            article_id: article.id,
            user_id: user.id
          });
        
        setIsLiked(true);
        setArticle(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !article || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: article.id,
          author_id: user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          author:profiles(username, display_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        return;
      }

      setComments(prev => [data, ...prev]);
      setNewComment('');
      setArticle(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Article not found</h1>
          <Link to="/" className="text-amber-600 hover:text-amber-700">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={article.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author.display_name)}&background=f59e0b&color=fff`}
                alt={article.author.display_name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <Link
                  to={`/profile/${article.author.username}`}
                  className="text-amber-100 hover:text-amber-300 font-medium"
                >
                  {article.author.display_name}
                </Link>
                <div className="flex items-center text-neutral-400 text-sm space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(article.published_at), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.reading_time} min read
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {article.view_count} views
                  </span>
                </div>
              </div>
            </div>
            
            <button className="text-neutral-400 hover:text-amber-300 transition-colors">
              <MoreHorizontal className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="text-4xl font-bold text-neutral-800 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Cover Image */}
        {article.cover_image && (
          <div className="mb-8">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none text-neutral-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between py-8 border-t border-neutral-200 mt-12">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{article.likes_count}</span>
            </button>
            
            <div className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg">
              <MessageCircle className="h-5 w-5" />
              <span>{article.comments_count}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
            
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <h3 className="text-2xl font-bold text-neutral-800 mb-6">
            Comments ({article.comments_count})
          </h3>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex space-x-4">
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.display_name || user.email)}&background=f59e0b&color=fff`}
                  alt="Your avatar"
                  className="h-10 w-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-neutral-100 rounded-lg text-center">
              <p className="text-neutral-600 mb-2">Please sign in to leave a comment</p>
              <Link
                to="/auth"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <img
                    src={comment.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.display_name)}&background=f59e0b&color=fff`}
                    alt={comment.author.display_name}
                    className="h-10 w-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          to={`/profile/${comment.author.username}`}
                          className="font-medium text-neutral-800 hover:text-amber-600"
                        >
                          {comment.author.display_name}
                        </Link>
                        <span className="text-sm text-neutral-500">
                          {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>
                      <p className="text-neutral-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
