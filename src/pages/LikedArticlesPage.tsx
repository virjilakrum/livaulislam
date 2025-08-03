import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export function LikedArticlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchLikedArticles();
  }, [user, navigate]);

  const fetchLikedArticles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('article_likes')
        .select(`
          article_id,
          articles!inner(
            *,
            author:profiles(username, display_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching liked articles:', error);
        return;
      }

      // Transform the data to match our Article interface
      const transformedArticles = data?.map((like: any) => ({
        ...like.articles,
        author: like.articles.author || {
          username: 'unknown',
          display_name: 'Unknown Author',
          avatar_url: ''
        }
      })) || [];

      setLikedArticles(transformedArticles);
    } catch (error) {
      console.error('Error fetching liked articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeUpdate = (articleId: string, newLikesCount: number) => {
    // Update the likes count for the specific article
    setLikedArticles(prev => 
      prev.map(article => 
        article.id === articleId 
          ? { ...article, likes_count: newLikesCount }
          : article
      )
    );

    // If the article was unliked (newLikesCount decreased), we might want to remove it
    // from the liked articles list after a short delay
    setTimeout(() => {
      setLikedArticles(prev => 
        prev.filter(article => article.id !== articleId)
      );
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
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
          
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-amber-100">Liked Articles</h1>
              <p className="text-neutral-400 mt-2">
                Articles you've liked ({likedArticles.length})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {likedArticles.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">No liked articles yet</h2>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              Start exploring and liking articles to build your personal collection of favorite reads.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span>Discover Articles</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {likedArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
