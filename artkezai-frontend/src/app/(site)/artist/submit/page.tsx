'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, ImagePlus } from 'lucide-react';
import {
  useSubmitPainting,
  useUpdatePainting,
  useUploadImage,
  useCategories,
  useMediums,
  useCountries,
  usePaintingById,
} from '@/lib/hooks/usePaintings';
import { useAuthStore } from '@/lib/store/authStore';
import { SubmitPaintingRequest } from '@/types';
import WorkspacePageHeader from '@/components/workspace/WorkspacePageHeader';
import ArtworkFormSection from '@/components/workspace/ArtworkFormSection';
import toast from 'react-hot-toast';

const emptyForm: SubmitPaintingRequest = {
  title: '',
  description: '',
  price: 0,
  currency: 'USD',
  mediumId: 0,
  categoryId: 0,
  countryId: 0,
  widthCm: 0,
  heightCm: 0,
  yearCreated: new Date().getFullYear(),
  orientation: 'Landscape',
};

export default function SubmitPaintingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id') || undefined;
  const isEditMode = !!editId;
  const { user } = useAuthStore();

  const { data: categories = [] } = useCategories();
  const { data: mediums = [] } = useMediums();
  const { data: countries = [] } = useCountries();

  const {
    data: existingPainting,
    isLoading: isLoadingPainting,
    isError: isPaintingLoadError,
  } = usePaintingById(editId);

  const { mutateAsync: submitPainting, isPending: isSubmitting } = useSubmitPainting();
  const { mutateAsync: updatePainting, isPending: isUpdating } = useUpdatePainting();
  const { mutateAsync: uploadImage } = useUploadImage();

  const [formData, setFormData] = useState<SubmitPaintingRequest>(emptyForm);
  const [hasPrefilled, setHasPrefilled] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Additive UI-only state — does not alter the create→upload sequencing below.
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const isBusy = isSubmitting || isUpdating || uploadProgress !== null;

  // Prefill the form once the existing painting AND the reference country list
  // (needed to resolve countryId from countryCode — the detail endpoint returns
  // country name/code, not the numeric id used for editing) have both loaded.
  useEffect(() => {
    if (!isEditMode || hasPrefilled || !existingPainting || countries.length === 0) {
      return;
    }

    const matchedCountry = countries.find((c) => c.code === existingPainting.countryCode);

    setFormData({
      title: existingPainting.title,
      description: existingPainting.description || '',
      price: existingPainting.price,
      currency: existingPainting.currency,
      mediumId: Number(existingPainting.mediumId) || 0,
      categoryId: Number(existingPainting.categoryId) || 0,
      countryId: matchedCountry ? Number(matchedCountry.id) : 0,
      widthCm: existingPainting.width || 0,
      heightCm: existingPainting.height || 0,
      yearCreated: existingPainting.yearCreated || new Date().getFullYear(),
      orientation: existingPainting.orientation || 'Landscape',
    });
    setHasPrefilled(true);
  }, [isEditMode, hasPrefilled, existingPainting, countries]);

  // artist.id round-trips as a JSON number even though the frontend type says
  // string, and user.id is stored as String(userId) — compare as strings so
  // the real owner isn't wrongly denied.
  const isOwner =
    !isEditMode || !existingPainting || !user || String(existingPainting.artist?.id) === String(user.id);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'mediumId' || name === 'categoryId' || name === 'countryId' ||
        name === 'widthCm' || name === 'heightCm' || name === 'yearCreated'
        ? Number(value)
        : value,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    if (fieldErrors.images) {
      setFieldErrors((prev) => ({ ...prev, images: '' }));
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formData.title) errors.title = 'Title is required.';
    if (!formData.categoryId) errors.categoryId = 'Select a category.';
    if (!formData.mediumId) errors.mediumId = 'Select a medium.';
    if (!formData.countryId) errors.countryId = 'Select a country of origin.';
    if (!formData.price || formData.price <= 0) errors.price = 'Enter a price greater than 0.';
    // Create mode requires at least one image; edit mode already has existing
    // images on the painting, so new ones here are optional additions.
    if (!isEditMode && selectedFiles.length === 0) {
      errors.images = 'Upload at least one image of the artwork.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please review the highlighted fields.');
      return;
    }

    if (isEditMode) {
      try {
        await updatePainting({ paintingId: editId as string, data: formData });

        if (selectedFiles.length > 0) {
          setUploadProgress({ current: 0, total: selectedFiles.length });
          let uploaded = 0;
          for (const file of selectedFiles) {
            await uploadImage({ paintingId: editId as string, file });
            uploaded += 1;
            setUploadProgress({ current: uploaded, total: selectedFiles.length });
          }
        }

        router.push('/artist/listings');
      } catch {
        // Mutation hooks surface the request-specific error toast.
      } finally {
        setUploadProgress(null);
      }
      return;
    }

    try {
      const painting = await submitPainting(formData);

      setUploadProgress({ current: 0, total: selectedFiles.length });
      let uploaded = 0;
      for (const file of selectedFiles) {
        await uploadImage({ paintingId: painting.id, file });
        uploaded += 1;
        setUploadProgress({ current: uploaded, total: selectedFiles.length });
      }

      toast.success('Painting submitted successfully!');
      router.push('/artist/listings');
    } catch {
      // Mutation hooks surface the request-specific error toast.
    } finally {
      setUploadProgress(null);
    }
  };

  // Deliberate loading state — never flash an empty create form while the
  // existing artwork is still being fetched/prefilled in edit mode.
  if (isEditMode && (isLoadingPainting || (!hasPrefilled && !isPaintingLoadError))) {
    return (
      <div>
        <WorkspacePageHeader eyebrow="Artist Workspace" title="Edit Artwork" />
        <div className="bg-white rounded-lg shadow p-16 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="font-inter text-sm text-gray-600">Loading your artwork…</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isPaintingLoadError) {
    return (
      <div>
        <WorkspacePageHeader eyebrow="Artist Workspace" title="Edit Artwork" />
        <div className="bg-[#fbe4e4] border border-[#f3c9c9] rounded-lg p-6">
          <p className="text-[#9c1f1f]">
            We couldn&apos;t load this painting. It may not exist, or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  if (isEditMode && !isOwner) {
    return (
      <div>
        <WorkspacePageHeader eyebrow="Artist Workspace" title="Edit Artwork" />
        <div className="bg-[#fbe4e4] border border-[#f3c9c9] rounded-lg p-6">
          <p className="text-[#9c1f1f]">You don&apos;t have permission to edit this painting.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <WorkspacePageHeader
        eyebrow="Artist Workspace"
        title={isEditMode ? 'Edit Artwork' : 'Submit a Painting'}
        description={
          isEditMode
            ? 'Update the details of this artwork. Existing images are preserved.'
            : "Prepare your work for curatorial review — every detail here shapes how it's presented in the gallery."
        }
      />

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 sm:p-8 max-w-3xl">
        <ArtworkFormSection
          title="Artwork Identity"
          description="The title and story collectors will see."
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Painting Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="input w-full"
              disabled={isBusy}
              placeholder="e.g. Amber Reverie"
            />
            {fieldErrors.title && <p className="text-xs text-[#9c1f1f] mt-1.5">{fieldErrors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className="input resize-none w-full"
              disabled={isBusy}
              placeholder="Tell the story of your painting..."
            />
          </div>
        </ArtworkFormSection>

        <ArtworkFormSection
          title="Artwork Imagery"
          description={
            isEditMode
              ? 'Existing images stay as they are; anything added here is appended.'
              : 'The first image becomes the cover shown throughout the gallery.'
          }
        >
          <div>
            {isEditMode && existingPainting && existingPainting.allImages.length > 0 && (
              <div className="mb-5">
                <p className="font-inter text-xs text-gray-500 mb-2">
                  {existingPainting.allImages.length} existing image
                  {existingPainting.allImages.length === 1 ? '' : 's'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {existingPainting.allImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-workspace">
                      <img src={img.url} alt={existingPainting.title} className="w-full h-full object-cover" />
                      {img.isPrimary && (
                        <span className="absolute top-2 left-2 badge badge-primary">Cover</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent transition">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                {isEditMode ? 'Add more images (optional)' : 'Drag and drop images or click to select'}
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                disabled={isBusy}
              />
              <label htmlFor="file-input">
                <button
                  type="button"
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="btn btn-secondary"
                  disabled={isBusy}
                >
                  Choose Files
                </button>
              </label>
            </div>
            {fieldErrors.images && <p className="text-xs text-[#9c1f1f] mt-1.5">{fieldErrors.images}</p>}

            {previewUrls.length > 0 && (
              <>
                <p className="font-inter text-xs text-gray-500 mt-4 mb-2">
                  {previewUrls.length} new image{previewUrls.length === 1 ? '' : 's'} selected
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-workspace">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      {idx === 0 && !isEditMode && (
                        <span className="absolute top-2 left-2 badge badge-primary">Cover</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        disabled={isBusy}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {previewUrls.length === 0 && !fieldErrors.images && !isEditMode && (
              <p className="flex items-center gap-2 font-inter text-xs text-gray-400 mt-3">
                <ImagePlus size={14} /> No images selected yet.
              </p>
            )}
          </div>
        </ArtworkFormSection>

        <ArtworkFormSection
          title="Details & Dimensions"
          description="Physical specifications, optional but helpful to collectors."
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
              <input
                type="number"
                name="widthCm"
                value={formData.widthCm}
                onChange={handleInputChange}
                className="input w-full"
                disabled={isBusy}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <input
                type="number"
                name="heightCm"
                value={formData.heightCm}
                onChange={handleInputChange}
                className="input w-full"
                disabled={isBusy}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year Created</label>
              <input
                type="number"
                name="yearCreated"
                value={formData.yearCreated}
                onChange={handleInputChange}
                className="input w-full"
                disabled={isBusy}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
              <select
                name="orientation"
                value={formData.orientation}
                onChange={handleInputChange}
                className="select w-full"
                disabled={isBusy}
              >
                <option>Portrait</option>
                <option>Landscape</option>
                <option>Square</option>
              </select>
            </div>
          </div>
        </ArtworkFormSection>

        <ArtworkFormSection
          title="Classification"
          description="How this work is discovered and filtered in the gallery."
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-accent">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="select w-full"
                disabled={isBusy}
              >
                <option value={0}>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.categoryId && <p className="text-xs text-[#9c1f1f] mt-1.5">{fieldErrors.categoryId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medium <span className="text-accent">*</span>
              </label>
              <select
                name="mediumId"
                value={formData.mediumId}
                onChange={handleInputChange}
                className="select w-full"
                disabled={isBusy}
              >
                <option value={0}>Select medium</option>
                {mediums.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.name}
                  </option>
                ))}
              </select>
              {fieldErrors.mediumId && <p className="text-xs text-[#9c1f1f] mt-1.5">{fieldErrors.mediumId}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country of Origin <span className="text-accent">*</span>
            </label>
            <select
              name="countryId"
              value={formData.countryId}
              onChange={handleInputChange}
              className="select w-full"
              disabled={isBusy}
            >
              <option value={0}>Select country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {fieldErrors.countryId && <p className="text-xs text-[#9c1f1f] mt-1.5">{fieldErrors.countryId}</p>}
          </div>
        </ArtworkFormSection>

        <ArtworkFormSection title="Pricing" description="Set the listing price collectors will see.">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price <span className="text-accent">*</span>
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                {formData.currency}
              </span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                className="input w-full pl-14"
                disabled={isBusy}
              />
            </div>
            {fieldErrors.price && <p className="text-xs text-[#9c1f1f] mt-1.5">{fieldErrors.price}</p>}
          </div>
        </ArtworkFormSection>

        {uploadProgress && (
          <p className="font-inter text-sm text-gray-600 mb-4">
            Uploading image {uploadProgress.current} of {uploadProgress.total}…
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline flex-1"
            disabled={isBusy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 disabled:opacity-50"
            disabled={isBusy}
          >
            {uploadProgress
              ? 'Uploading images…'
              : isSubmitting || isUpdating
              ? isEditMode
                ? 'Saving…'
                : 'Submitting…'
              : isEditMode
              ? 'Save Changes'
              : 'Submit Painting'}
          </button>
        </div>
      </form>
    </div>
  );
}
