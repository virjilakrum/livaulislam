import React, { useState } from 'react';
import { X, Save, User, Globe, MapPin, Twitter, Linkedin, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  website: string;
  twitter: string;
  linkedin: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditProfileModal({ profile, onClose, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    display_name: profile.display_name,
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    website: profile.website || '',
    twitter: profile.twitter || '',
    linkedin: profile.linkedin || '',
    location: profile.location || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clean up social media handles (remove @ if present)
      const cleanData = {
        ...formData,
        twitter: formData.twitter.replace('@', ''),
        linkedin: formData.linkedin,
        website: formData.website.trim(),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(cleanData)
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onUpdate();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl rounded-lg shadow-2xl border-2 border-black" style={{ backgroundColor: '#FEF7ED' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black">
          <h2 className="text-2xl font-bold text-black">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border-2 border-black transition-all duration-300 hover:shadow-lg"
            style={{ backgroundColor: '#FEF7ED' }}
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg border-2 border-red-500" style={{ backgroundColor: '#FEF7ED' }}>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-black mb-2">
                Display Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black"
                  style={{ backgroundColor: '#FEF7ED' }}
                  placeholder="Your display name"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-black mb-2">
                Bio
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-neutral-400 h-5 w-5" />
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black resize-none"
                  style={{ backgroundColor: '#FEF7ED' }}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">{formData.bio.length}/500 characters</p>
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium text-black mb-2">
                Avatar URL
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <input
                  type="url"
                  id="avatar_url"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black"
                  style={{ backgroundColor: '#FEF7ED' }}
                  placeholder="https://your-avatar-url.com/image.jpg"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-black mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black"
                  style={{ backgroundColor: '#FEF7ED' }}
                  placeholder="Your location"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-black mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black"
                  style={{ backgroundColor: '#FEF7ED' }}
                  placeholder="https://your-website.com"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Twitter */}
              <div>
                <label htmlFor="twitter" className="block text-sm font-medium text-black mb-2">
                  Twitter Username
                </label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black"
                    style={{ backgroundColor: '#FEF7ED' }}
                    placeholder="username"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-black mb-2">
                  LinkedIn Username
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                  <input
                    type="text"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-black"
                    style={{ backgroundColor: '#FEF7ED' }}
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 pt-6 mt-6 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg border-2 border-black font-medium transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: '#FEF7ED', color: '#000000' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg font-medium border-2 border-black transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}