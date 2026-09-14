'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import WorkspacePageHeader from '@/components/workspace/WorkspacePageHeader';
import ArtworkFormSection from '@/components/workspace/ArtworkFormSection';
import { useMyArtistProfile, useUpdateMyProfile, useUploadProfilePhoto } from '@/lib/hooks/useArtists';
import { useCountries } from '@/lib/hooks/usePaintings';
import toast from 'react-hot-toast';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ArtistProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useMyArtistProfile();
  const { data: countries = [] } = useCountries();
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateMyProfile();
  const { mutateAsync: uploadPhoto, isPending: isUploadingPhoto } = useUploadProfilePhoto();

  const [isEditing, setIsEditing] = useState(false);
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    story: '',
    websiteUrl: '',
    instagram: '',
    countryId: 0,
  });

  // Prefill once the real profile has loaded — never let the form render
  // empty/default values before the backend response arrives.
  useEffect(() => {
    if (!profile || hasPrefilled) return;
    const matchedCountry = countries.find((c) => c.name === profile.countryName);
    setFormData({
      displayName: profile.displayName,
      bio: profile.bio || '',
      story: profile.story || '',
      websiteUrl: profile.websiteUrl || '',
      instagram: profile.instagram || '',
      countryId: matchedCountry ? Number(matchedCountry.id) : 0,
    });
    setHasPrefilled(true);
  }, [profile, hasPrefilled, countries]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'countryId' ? Number(value) : value }));
  };

  const handleCancel = () => {
    if (profile) {
      const matchedCountry = countries.find((c) => c.name === profile.countryName);
      setFormData({
        displayName: profile.displayName,
        bio: profile.bio || '',
        story: profile.story || '',
        websiteUrl: profile.websiteUrl || '',
        instagram: profile.instagram || '',
        countryId: matchedCountry ? Number(matchedCountry.id) : 0,
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      toast.error('Display name cannot be blank.');
      return;
    }

    try {
      await updateProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        story: formData.story,
        websiteUrl: formData.websiteUrl,
        instagram: formData.instagram,
        countryId: formData.countryId || undefined,
      });
      setIsEditing(false);
    } catch {
      // Error toast handled in the mutation hook.
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadPhoto(file);
    } catch {
      // Error toast handled in the mutation hook.
    } finally {
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto mb-4" />
        <p className="font-inter text-sm text-gray-600">Loading your profile…</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="bg-white rounded-lg shadow p-16 text-center">
        <p className="font-playfair text-xl text-brand mb-2">Couldn&apos;t load your profile</p>
        <p className="font-inter text-sm text-gray-600 mb-6">Please try again.</p>
        <button onClick={() => refetch()} className="btn btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <WorkspacePageHeader
          eyebrow="Artist Workspace"
          title="Profile & Story"
          description="This is what collectors see on your public artist page."
          action={
            !isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                Edit
              </button>
            )
          }
        />

        {/* Photo */}
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-workspace border border-workspace-border flex items-center justify-center flex-shrink-0">
            {profile.profilePhotoUrl ? (
              <Image src={profile.profilePhotoUrl} alt={profile.displayName} fill className="object-cover" />
            ) : (
              <span className="font-playfair text-xl text-accent">{initials(profile.displayName)}</span>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
              disabled={isUploadingPhoto}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="btn btn-outline inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Camera size={15} />
              {isUploadingPhoto ? 'Uploading…' : 'Change Photo'}
            </button>
            <p className="font-inter text-xs text-gray-500 mt-2">Shown on your public artist page.</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <ArtworkFormSection title="Identity" description="Your public name and country of origin.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name <span className="text-accent">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="input w-full"
                />
              ) : (
                <p className="text-gray-800">{formData.displayName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              {isEditing ? (
                <select
                  name="countryId"
                  value={formData.countryId}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="select w-full"
                >
                  <option value={0}>Select country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800">{profile.countryName || 'Not specified'}</p>
              )}
            </div>
          </div>
        </ArtworkFormSection>

        <ArtworkFormSection title="Bio" description="A short introduction shown alongside your work.">
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              disabled={isSaving}
              className="input resize-none w-full"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{formData.bio || 'No bio added yet.'}</p>
          )}
        </ArtworkFormSection>

        <ArtworkFormSection title="Artist Story" description="A longer story, shown on your public profile page.">
          {isEditing ? (
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows={6}
              placeholder="Tell your story..."
              disabled={isSaving}
              className="input resize-none w-full"
            />
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{formData.story || 'No story added yet.'}</p>
          )}
        </ArtworkFormSection>

        <ArtworkFormSection title="Social Links" description="Optional links shown on your public profile.">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              {isEditing ? (
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="yourhandle or https://instagram.com/yourhandle"
                  disabled={isSaving}
                  className="input w-full"
                />
              ) : (
                <p className="text-gray-800">{formData.instagram || 'Not added'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              {isEditing ? (
                <input
                  type="url"
                  name="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  disabled={isSaving}
                  className="input w-full"
                />
              ) : formData.websiteUrl ? (
                <a href={formData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {formData.websiteUrl}
                </a>
              ) : (
                <p className="text-gray-800">Not added</p>
              )}
            </div>
          </div>
        </ArtworkFormSection>

        {isEditing && (
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button onClick={handleCancel} disabled={isSaving} className="btn btn-outline disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="btn btn-primary disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
