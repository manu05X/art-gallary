'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import { useSubmitPainting, useUploadImage, useCategories, useMediums, useCountries } from '@/lib/hooks/usePaintings';
import { SubmitPaintingRequest } from '@/types';
import toast from 'react-hot-toast';

export default function SubmitPaintingPage() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: mediums = [] } = useMediums();
  const { data: countries = [] } = useCountries();

  const { mutate: submitPainting, isPending: isSubmitting } = useSubmitPainting();
  const { mutate: uploadImage, isPending: isUploading } = useUploadImage();

  const [formData, setFormData] = useState<SubmitPaintingRequest>({
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    mediumId: '',
    categoryId: '',
    country: '',
    width: 0,
    height: 0,
    yearCreated: new Date().getFullYear(),
    orientation: 'Landscape',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'width' || name === 'height' || name === 'yearCreated'
        ? Number(value)
        : value,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

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

    if (!formData.title || !formData.categoryId || !formData.mediumId || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    submitPainting(formData, {
      onSuccess: async (painting) => {
        for (const file of selectedFiles) {
          await uploadImage({ paintingId: painting.id, file });
        }
        toast.success('Painting submitted successfully!');
        router.push('/artist/listings');
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-brand mb-6">Submit a Painting</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Painting Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="input"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="input resize-none"
            disabled={isSubmitting}
            placeholder="Tell the story of your painting..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="select"
              disabled={isSubmitting}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medium <span className="text-red-600">*</span>
            </label>
            <select
              name="mediumId"
              value={formData.mediumId}
              onChange={handleInputChange}
              required
              className="select"
              disabled={isSubmitting}
            >
              <option value="">Select medium</option>
              {mediums.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width (cm)
            </label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleInputChange}
              className="input"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              className="input"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Created
            </label>
            <input
              type="number"
              name="yearCreated"
              value={formData.yearCreated}
              onChange={handleInputChange}
              className="input"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orientation
            </label>
            <select
              name="orientation"
              value={formData.orientation}
              onChange={handleInputChange}
              className="select"
              disabled={isSubmitting}
            >
              <option>Portrait</option>
              <option>Landscape</option>
              <option>Square</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country <span className="text-red-600">*</span>
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="select"
              disabled={isSubmitting}
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (USD) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              required
              className="input"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Images <span className="text-red-600">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent transition">
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-4">Drag and drop images or click to select</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={isSubmitting}
            />
            <label htmlFor="file-input">
              <button
                type="button"
                onClick={() => document.getElementById('file-input')?.click()}
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Choose Files
              </button>
            </label>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-1 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Painting'}
          </button>
        </div>
      </form>
    </div>
  );
}
