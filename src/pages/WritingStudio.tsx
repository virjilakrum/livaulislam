import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, Eye, Send, Image, Tag, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export function WritingStudio() {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('edit');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (articleId) {
      fetchArticle(articleId);
    }
  }, [user, articleId, navigate]);

  const fetchArticle = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('author_id', user?.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching article:', error);
        navigate('/write');
        return;
      }
      
      if (!data) {
        console.error('Article not found');
        navigate('/write');
        return;
      }

      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt);
      setCoverImage(data.cover_image);
      setTags(data.tags || []);
      setIsEditing(true);
    } catch (error) {
      console.error('Error fetching article:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async (publish = false) => {
    if (!user || !profile || !title.trim() || !content.trim()) return;

    const isSaving = publish ? setPublishing : setSaving;
    isSaving(true);

    try {
      const slug = generateSlug(title);
      const readingTime = calculateReadingTime(content);
      
      const articleData = {
        title,
        slug,
        content,
        excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        cover_image: coverImage,
        author_id: user.id,
        tags,
        reading_time: readingTime,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };

      if (isEditing && articleId) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select()
          .single();

        if (error) throw error;
        
        if (publish) {
          navigate(`/article/${data.slug}`);
          return;
        }
      }

      if (publish) {
        navigate(`/article/${slug}`);
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      alert('Error saving article: ' + error.message);
    } finally {
      isSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image'],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Please sign in to access the writing studio.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>
              {isEditing ? 'Edit Article' : 'Writing Studio'}
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !title.trim() || !content.trim()}
                className="btn-modern btn-secondary-modern flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={publishing || !title.trim() || !content.trim()}
                className="btn-modern btn-primary-modern flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span>{publishing ? 'Publishing...' : 'Publish'}</span>
              </button>
            </div>
          </div>

          {/* Article Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                Article Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title..."
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-neutral-700 mb-2">
                Cover Image URL
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <input
                  id="coverImage"
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-neutral-700 mb-2">
                Article Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Brief description of your article (optional - will be auto-generated if empty)"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tags (up to 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-amber-600 hover:text-amber-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {tags.length < 5 && (
                <div className="flex">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-l-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-amber-600 text-white rounded-r-lg hover:bg-amber-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
          <div className="border-b border-stone-200 p-4">
            <h2 className="text-lg font-semibold text-neutral-900">Content *</h2>
          </div>
          <div className="h-96">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Start writing your story..."
              className="h-full"
            />
          </div>
        </div>

        {/* Preview Note */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Writing Tips</h3>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li>• Use a compelling title that captures the essence of your article</li>
                <li>• Add relevant tags to help readers discover your content</li>
                <li>• Include a cover image to make your article more visually appealing</li>
                <li>• Save your work regularly to avoid losing progress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}