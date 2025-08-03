import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { ArticleCard } from '../components/ArticleCard';
import { TrendingUp, Star, Clock, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  reading_time: number;
  view_count: number;
  created_at: string;
  published_at: string;
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  likes_count?: number;
  comments_count?: number;
}

export function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLikeUpdate = (articleId: string, newLikesCount: number) => {
    // Update featured articles
    setFeaturedArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, likes_count: newLikesCount }
          : article
      )
    );

    // Update recent articles
    setRecentArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, likes_count: newLikesCount }
          : article
      )
    );

    // Update trending articles
    setTrendingArticles(prev =>
      prev.map(article =>
        article.id === articleId
          ? { ...article, likes_count: newLikesCount }
          : article
      )
    );
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      console.log('Fetching articles...');
      
      // Fetch featured articles
      const { data: featured, error: featuredError } = await supabase
        .from('articles')
        .select(`
          *,
          profiles!articles_author_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (featuredError) {
        console.error('Featured articles error:', featuredError);
      }

      // Fetch recent articles
      const { data: recent, error: recentError } = await supabase
        .from('articles')
        .select(`
          *,
          profiles!articles_author_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(6);

      if (recentError) {
        console.error('Recent articles error:', recentError);
      }

      // Fetch trending articles (by view count)
      const { data: trending, error: trendingError } = await supabase
        .from('articles')
        .select(`
          *,
          profiles!articles_author_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('view_count', { ascending: false })
        .limit(4);

      if (trendingError) {
        console.error('Trending articles error:', trendingError);
      }

      // Transform data to match expected format
      const transformArticles = (articles: any[]) => {
        return articles?.map(article => ({
          ...article,
          author: article.profiles || {
            username: 'unknown',
            display_name: 'Unknown Author',
            avatar_url: ''
          }
        })) || [];
      };

      setFeaturedArticles(transformArticles(featured || []));
      setRecentArticles(transformArticles(recent || []));
      setTrendingArticles(transformArticles(trending || []));
      
      console.log('Articles fetched successfully');
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Set empty arrays in case of error to stop loading
      setFeaturedArticles([]);
      setRecentArticles([]);
      setTrendingArticles([]);
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center space-x-2 mb-8">
              <Star className="h-6 w-6 text-amber-600" />
              <h2 className="text-3xl font-bold" style={{ color: '#000000' }}>Featured Stories</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  featured
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Articles */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-8">
              <h2 className="text-3xl font-bold" style={{ color: '#000000' }}>Latest Stories</h2>
            </div>
            {recentArticles.length > 0 ? (
              <div className="space-y-8">
                {recentArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onLikeUpdate={handleLikeUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-stone-200">
                <p className="text-neutral-600">No articles published yet. Be the first to share your story!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Trending Articles */}
            <div className="rounded-lg shadow-sm border border-stone-200 p-6" style={{ backgroundColor: '#FEF7ED' }}>
              <div className="flex items-center space-x-2 mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Trending</h3>
              </div>
              {trendingArticles.length > 0 ? (
                <div className="space-y-4">
                  {trendingArticles.map((article, index) => (
                    <div key={article.id} className="flex items-start space-x-3">
                      <span className="text-2xl font-bold text-amber-600 leading-none">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900 line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        <p className="text-sm text-neutral-600">
                          By {article.author.display_name} • {article.view_count} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-600 text-sm">No trending articles yet.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}