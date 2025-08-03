import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, MessageCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
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

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  onLikeUpdate?: (articleId: string, newLikesCount: number) => void;
}

export function ArticleCard({ article, featured = false, onLikeUpdate }: ArticleCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  const cardClasses = featured
    ? 'bg-gradient-to-br from-amber-50 to-stone-100 border-2 border-amber-200 shadow-xl'
    : 'bg-stone-50 border border-stone-200 hover:shadow-lg';

  useEffect(() => {
    if (user && article.id) {
      checkLikeStatus();
    }
  }, [user, article.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLikesCount(article.likes_count || 0);
  }, [article.likes_count]);

  const checkLikeStatus = async () => {
    if (!user || !article.id) return;

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
      setIsLiked(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking like button
    e.stopPropagation();

    if (!user || !article.id || isLiking) return;

    setIsLiking(true);
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);

        setIsLiked(false);
        const newCount = likesCount - 1;
        setLikesCount(newCount);
        onLikeUpdate?.(article.id, newCount);
      } else {
        // Like
        await supabase
          .from('article_likes')
          .insert({
            article_id: article.id,
            user_id: user.id
          });

        setIsLiked(true);
        const newCount = likesCount + 1;
        setLikesCount(newCount);
        onLikeUpdate?.(article.id, newCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className={`rounded-lg overflow-hidden transition-all duration-300 ${cardClasses}`}>
      {article.cover_image && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Link to={`/profile/${article.author.username}`} className="flex items-center space-x-2 group">
            {article.author.avatar_url ? (
              <img
                src={article.author.avatar_url}
                alt={article.author.display_name}
                className="h-10 w-10 rounded-full border-2 border-amber-200"
              />
            ) : (
              <User className="h-10 w-10 p-2 bg-neutral-200 rounded-full border-2 border-amber-200" />
            )}
            <div>
              <p className="font-semibold text-neutral-900 group-hover:text-amber-800 transition-colors">
                {article.author.display_name}
              </p>
              <p className="text-sm text-neutral-600">@{article.author.username}</p>
            </div>
          </Link>
        </div>

        <Link to={`/article/${article.slug}`} className="block group">
          <h2 className={`font-bold text-neutral-900 group-hover:text-amber-800 transition-colors mb-3 ${featured ? 'text-2xl' : 'text-xl'}`}>
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-neutral-700 mb-4 line-clamp-3">
              {article.excerpt}
            </p>
          )}
        </Link>

        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{article.reading_time} min read</span>
            </span>
            <span>{format(new Date(article.published_at || article.created_at), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`flex items-center space-x-1 transition-colors ${
                user
                  ? isLiked
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-neutral-600 hover:text-red-600'
                  : 'text-neutral-400 cursor-not-allowed'
              }`}
              title={!user ? 'Sign in to like articles' : isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {article.comments_count !== undefined && (
              <Link
                to={`/article/${article.slug}#comments`}
                className="flex items-center space-x-1 text-neutral-600 hover:text-amber-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{article.comments_count}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}