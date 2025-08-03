import React, { useState, useEffect } from 'react';
import { Search, Filter, Tag, TrendingUp, Clock, Heart } from 'lucide-react';
import { ArticleCard } from '../components/ArticleCard';
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
  tags: string[];
  author: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  likes_count?: number;
  comments_count?: number;
}

export function DiscoverPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterAndSortArticles();
  }, [articles, searchQuery, selectedTag, sortBy]);

  const fetchArticles = async () => {
    try {
      console.log('Fetching discover articles...');
      
      const { data: articlesData, error } = await supabase
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
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Discover articles error:', error);
        setArticles([]);
        setAllTags([]);
        return;
      }

      // Transform data to match expected format
      const transformedArticles = articlesData?.map(article => ({
        ...article,
        author: article.profiles || {
          username: 'unknown',
          display_name: 'Unknown Author',
          avatar_url: ''
        }
      })) || [];
      
      setArticles(transformedArticles);
      
      // Extract all unique tags
      const tags = new Set<string>();
      transformedArticles.forEach(article => {
        article.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(Array.from(tags));
      
      console.log('Discover articles fetched successfully');
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      setAllTags([]);
    } finally {
      setLoading(false);
      console.log('Discover loading finished');
    }
  };

  const filterAndSortArticles = () => {
    let filtered = [...articles];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(article =>
        article.tags?.includes(selectedTag)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.view_count - a.view_count);
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime());
        break;
    }

    setFilteredArticles(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Discovering amazing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000000' }}>
            Discover Amazing Stories
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Explore a curated collection of articles from talented writers across all topics and genres.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black"
              />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="pl-10 pr-8 py-3 border border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black bg-white min-w-[150px]"
              >
                <option value="">All Topics</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 border border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black bg-white min-w-[120px]"
              >
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedTag) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-stone-200">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-amber-600 hover:text-amber-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                  Topic: {selectedTag}
                  <button
                    onClick={() => setSelectedTag('')}
                    className="ml-2 text-amber-600 hover:text-amber-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-neutral-600">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
          </p>
          
          <div className="flex items-center space-x-2 text-sm text-neutral-500">
            {sortBy === 'latest' && <Clock className="h-4 w-4" />}
            {sortBy === 'popular' && <TrendingUp className="h-4 w-4" />}
            <span className="capitalize">Sorted by {sortBy}</span>
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No articles found</h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('');
                setSortBy('latest');
              }}
              className="btn-modern btn-primary-modern"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}