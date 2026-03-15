'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import toast from 'react-hot-toast';

export default function ArtistProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    country: user?.country || '',
    story: '',
    instagram: '',
    website: '',
    twitter: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        setUser({
          ...user,
          bio: formData.bio,
          country: formData.country,
        });
      }
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand">Artist Profile & Story</h1>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="input resize-none"
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{formData.bio || 'No bio added yet.'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            {isEditing ? (
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input"
              />
            ) : (
              <p className="text-gray-800">{formData.country || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Artist Story</label>
          {isEditing ? (
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows={6}
              placeholder="Tell your story..."
              className="input resize-none"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{formData.story || 'No story added yet.'}</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-brand mb-4">Social Links</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              {isEditing ? (
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className="input"
                />
              ) : (
                <p className="text-gray-800">
                  {formData.instagram ? (
                    <a href={formData.instagram} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {formData.instagram}
                    </a>
                  ) : (
                    'Not added'
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="input"
                />
              ) : (
                <p className="text-gray-800">
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {formData.website}
                    </a>
                  ) : (
                    'Not added'
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
              {isEditing ? (
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                  className="input"
                />
              ) : (
                <p className="text-gray-800">
                  {formData.twitter ? (
                    <a href={formData.twitter} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {formData.twitter}
                    </a>
                  ) : (
                    'Not added'
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
