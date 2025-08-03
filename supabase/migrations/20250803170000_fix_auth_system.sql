/*
  # Fix Auth System
  
  This migration fixes:
  1. Auto profile creation on user signup
  2. Username-based login system
  3. Missing RPC functions
  4. Auth triggers
*/

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_base text;
  username_final text;
  counter integer := 1;
BEGIN
  -- Generate username from email
  username_base := split_part(NEW.email, '@', 1);
  username_base := regexp_replace(username_base, '[^a-zA-Z0-9]', '', 'g');
  username_base := lower(username_base);
  
  -- Ensure username is unique
  username_final := username_base;
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = username_final) LOOP
    username_final := username_base || counter::text;
    counter := counter + 1;
  END LOOP;
  
  -- Create profile
  INSERT INTO profiles (
    id,
    username,
    display_name,
    bio,
    avatar_url,
    website,
    twitter,
    linkedin,
    location,
    followers_count,
    following_count
  ) VALUES (
    NEW.id,
    username_final,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    '',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    '',
    '',
    '',
    '',
    0,
    0
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to get user email by ID (for auth system)
CREATE OR REPLACE FUNCTION get_user_email_by_id(user_id uuid)
RETURNS text AS $$
DECLARE
  user_email text;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to authenticate with username
CREATE OR REPLACE FUNCTION authenticate_user(username_or_email text, password_text text)
RETURNS json AS $$
DECLARE
  user_record auth.users%ROWTYPE;
  profile_record profiles%ROWTYPE;
  result json;
BEGIN
  -- Try to find user by email first
  SELECT * INTO user_record
  FROM auth.users
  WHERE email = username_or_email
  AND email_confirmed_at IS NOT NULL;
  
  -- If not found by email, try by username
  IF user_record.id IS NULL THEN
    SELECT u.* INTO user_record
    FROM auth.users u
    JOIN profiles p ON u.id = p.id
    WHERE p.username = username_or_email
    AND u.email_confirmed_at IS NOT NULL;
  END IF;
  
  -- If user found, get profile
  IF user_record.id IS NOT NULL THEN
    SELECT * INTO profile_record
    FROM profiles
    WHERE id = user_record.id;
    
    result := json_build_object(
      'user', row_to_json(user_record),
      'profile', row_to_json(profile_record)
    );
  ELSE
    result := json_build_object('error', 'User not found');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user profile by username
CREATE OR REPLACE FUNCTION get_profile_by_username(username_param text)
RETURNS json AS $$
DECLARE
  profile_record profiles%ROWTYPE;
  result json;
BEGIN
  SELECT * INTO profile_record
  FROM profiles
  WHERE username = username_param;
  
  IF profile_record.id IS NOT NULL THEN
    result := row_to_json(profile_record);
  ELSE
    result := json_build_object('error', 'Profile not found');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check username availability
CREATE OR REPLACE FUNCTION check_username_availability(username_param text)
RETURNS boolean AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles WHERE username = username_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update username
CREATE OR REPLACE FUNCTION update_username(user_id uuid, new_username text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Check if username is available
  IF NOT check_username_availability(new_username) THEN
    result := json_build_object('error', 'Username already taken');
    RETURN result;
  END IF;
  
  -- Update username
  UPDATE profiles
  SET username = new_username, updated_at = NOW()
  WHERE id = user_id;
  
  IF FOUND THEN
    result := json_build_object('success', true, 'username', new_username);
  ELSE
    result := json_build_object('error', 'Profile not found');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get community stats
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS json AS $$
DECLARE
  total_users integer;
  total_articles integer;
  total_likes integer;
  total_comments integer;
  result json;
BEGIN
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO total_articles FROM articles WHERE published = true;
  SELECT COUNT(*) INTO total_likes FROM article_likes;
  SELECT COUNT(*) INTO total_comments FROM comments;
  
  result := json_build_object(
    'total_users', total_users,
    'total_articles', total_articles,
    'total_likes', total_likes,
    'total_comments', total_comments
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get trending topics
CREATE OR REPLACE FUNCTION get_trending_topics(limit_param integer DEFAULT 10)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  WITH tag_counts AS (
    SELECT 
      unnest(tags) as tag,
      COUNT(*) as count
    FROM articles 
    WHERE published = true 
    AND created_at > NOW() - INTERVAL '30 days'
    GROUP BY unnest(tags)
    ORDER BY count DESC
    LIMIT limit_param
  )
  SELECT json_agg(
    json_build_object(
      'tag', tag,
      'count', count
    )
  ) INTO result
  FROM tag_counts;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get suggested users to follow
CREATE OR REPLACE FUNCTION get_suggested_users(user_id uuid, limit_param integer DEFAULT 5)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  WITH suggested AS (
    SELECT 
      p.*,
      (
        SELECT COUNT(*) 
        FROM articles a 
        WHERE a.author_id = p.id AND a.published = true
      ) as article_count
    FROM profiles p
    WHERE p.id != user_id
    AND p.id NOT IN (
      SELECT following_id 
      FROM follows 
      WHERE follower_id = user_id
    )
    ORDER BY p.followers_count DESC, article_count DESC
    LIMIT limit_param
  )
  SELECT json_agg(
    json_build_object(
      'id', id,
      'username', username,
      'display_name', display_name,
      'bio', bio,
      'avatar_url', avatar_url,
      'followers_count', followers_count,
      'article_count', article_count
    )
  ) INTO result
  FROM suggested;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_email_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_profile_by_username(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_username_availability(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_username(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_trending_topics(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_suggested_users(uuid, integer) TO authenticated;
