/*
  # Add Count Columns and Triggers
  
  This migration adds:
  1. Count columns to articles and profiles tables
  2. Trigger functions to automatically update counts
  3. Triggers for automatic count updates
  4. Notifications table
  5. Initial count calculations for existing data
*/

-- Add count columns to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0;

-- Add count columns to profiles table  
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- Create function to update article likes count
CREATE OR REPLACE FUNCTION update_article_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update article comments count
CREATE OR REPLACE FUNCTION update_article_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update profile follow counts
CREATE OR REPLACE FUNCTION update_profile_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increase follower count for the user being followed
    UPDATE profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    -- Increase following count for the user who is following
    UPDATE profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease follower count for the user being unfollowed
    UPDATE profiles 
    SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
    
    -- Decrease following count for the user who is unfollowing
    UPDATE profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_article_likes_count ON article_likes;
CREATE TRIGGER trigger_update_article_likes_count
  AFTER INSERT OR DELETE ON article_likes
  FOR EACH ROW EXECUTE FUNCTION update_article_likes_count();

DROP TRIGGER IF EXISTS trigger_update_article_comments_count ON comments;
CREATE TRIGGER trigger_update_article_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_article_comments_count();

DROP TRIGGER IF EXISTS trigger_update_profile_follow_counts ON follows;
CREATE TRIGGER trigger_update_profile_follow_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_profile_follow_counts();

-- Calculate and update existing counts
-- Update article likes count
UPDATE articles 
SET likes_count = (
  SELECT COUNT(*) 
  FROM article_likes 
  WHERE article_likes.article_id = articles.id
);

-- Update article comments count
UPDATE articles 
SET comments_count = (
  SELECT COUNT(*) 
  FROM comments 
  WHERE comments.article_id = articles.id
);

-- Update profile followers count
UPDATE profiles 
SET followers_count = (
  SELECT COUNT(*) 
  FROM follows 
  WHERE follows.following_id = profiles.id
);

-- Update profile following count
UPDATE profiles 
SET following_count = (
  SELECT COUNT(*) 
  FROM follows 
  WHERE follows.follower_id = profiles.id
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'like', 'comment', 'follow', 'article_published'
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}', -- Additional data like article_id, from_user_id etc.
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
