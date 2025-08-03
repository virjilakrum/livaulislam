import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, MessageCircle, User } from 'lucide-react';
import { format } from 'date-fns';

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
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const cardClasses = featured
    ? 'bg-gradient-to-br from-amber-50 to-stone-100 border-2 border-amber-200 shadow-xl'
    : 'bg-stone-50 border border-stone-200 hover:shadow-lg';

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
            {article.likes_count !== undefined && (
              <span className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{article.likes_count}</span>
              </span>
            )}
            {article.comments_count !== undefined && (
              <span className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{article.comments_count}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}