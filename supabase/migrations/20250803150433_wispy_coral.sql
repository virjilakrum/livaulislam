/*
  # Livaulislam Writing Platform Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `display_name` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `website` (text)
      - `twitter` (text)
      - `linkedin` (text)
      - `location` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `cover_image` (text)
      - `author_id` (uuid, references profiles)
      - `published` (boolean)
      - `featured` (boolean)
      - `tags` (text array)
      - `reading_time` (integer)
      - `view_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `published_at` (timestamp)
    
    - `follows`
      - `id` (uuid, primary key)
      - `follower_id` (uuid, references profiles)
      - `following_id` (uuid, references profiles)
      - `created_at` (timestamp)
    
    - `article_likes`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references articles)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)
    
    - `comments`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references articles)
      - `author_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for published content
    - Author-only write access for articles and profiles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  website text DEFAULT '',
  twitter text DEFAULT '',
  linkedin text DEFAULT '',
  location text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text DEFAULT '',
  cover_image text DEFAULT '',
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  reading_time integer DEFAULT 0,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create article_likes table
CREATE TABLE IF NOT EXISTS article_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Authors can insert their own articles"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own articles"
  ON articles FOR DELETE
  USING (auth.uid() = author_id);

-- Follows policies
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Article likes policies
CREATE POLICY "Anyone can view likes"
  ON article_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like articles"
  ON article_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike articles"
  ON article_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS articles_author_id_idx ON articles(author_id);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published);
CREATE INDEX IF NOT EXISTS articles_featured_idx ON articles(featured);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles(published_at);
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
CREATE INDEX IF NOT EXISTS article_likes_article_id_idx ON article_likes(article_id);
CREATE INDEX IF NOT EXISTS comments_article_id_idx ON comments(article_id);

-- Function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();