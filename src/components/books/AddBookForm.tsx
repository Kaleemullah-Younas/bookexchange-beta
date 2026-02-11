'use client';

import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';

interface AddBookFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CONDITION_OPTIONS = [
  { value: 'NEW', label: 'New', description: 'Brand new, never read' },
  { value: 'LIKE_NEW', label: 'Like New', description: 'Minimal signs of use' },
  {
    value: 'VERY_GOOD',
    label: 'Very Good',
    description: 'Minor wear, no markings',
  },
  { value: 'GOOD', label: 'Good', description: 'Some wear, may have markings' },
  {
    value: 'ACCEPTABLE',
    label: 'Acceptable',
    description: 'Readable, noticeable wear',
  },
] as const;

interface UploadedImage {
  url: string;
  publicId: string;
}

export function AddBookForm({ onSuccess, onCancel }: AddBookFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    condition: '' as (typeof CONDITION_OPTIONS)[number]['value'] | '',
    location: '',
    images: [] as UploadedImage[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const createBook = trpc.book.create.useMutation({
    onSuccess: () => {
      utils.book.getAll.invalidate();
      utils.book.getMyBooks.invalidate();
      onSuccess?.();
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - formData.images.length;
    if (remainingSlots <= 0) {
      setErrors({ ...errors, images: 'Maximum 5 images allowed' });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    setUploadProgress(new Array(filesToUpload.length).fill(0));
    setErrors({ ...errors, images: '' });

    const uploadedImages: UploadedImage[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          images: `${file.name}: Invalid file type. Use JPEG, PNG, WebP, or GIF.`,
        });
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({
          ...errors,
          images: `${file.name}: File too large. Maximum size is 10MB.`,
        });
        continue;
      }

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();
        uploadedImages.push({
          url: data.url,
          publicId: data.publicId,
        });

        // Update progress
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[i] = 100;
          return newProgress;
        });
      } catch (error) {
        console.error('Upload error:', error);
        setErrors({
          ...errors,
          images:
            error instanceof Error ? error.message : 'Failed to upload image',
        });
      }
    }

    if (uploadedImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
    }

    setIsUploading(false);
    setUploadProgress([]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0 && fileInputRef.current) {
      // Create a new DataTransfer to set the files
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach(file => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;

      // Trigger the change handler manually
      handleFileSelect({
        target: { files: dataTransfer.files },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.condition) newErrors.condition = 'Please select a condition';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.images.length === 0)
      newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    createBook.mutate({
      title: formData.title.trim(),
      author: formData.author.trim(),
      description: formData.description.trim() || undefined,
      condition:
        formData.condition as (typeof CONDITION_OPTIONS)[number]['value'],
      location: formData.location.trim(),
      images: formData.images.map(img => img.url),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Book Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${
            errors.title ? 'border-destructive' : 'border-border'
          } text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200`}
          placeholder="Enter the book title"
        />
        {errors.title && (
          <p className="mt-1.5 text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Author */}
      <div>
        <label
          htmlFor="author"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Author <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="author"
          value={formData.author}
          onChange={e => setFormData({ ...formData, author: e.target.value })}
          className={`w-full px-4 py-3 rounded-xl bg-secondary/50 border ${
            errors.author ? 'border-destructive' : 'border-border'
          } text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200`}
          placeholder="Enter the author's name"
        />
        {errors.author && (
          <p className="mt-1.5 text-sm text-destructive">{errors.author}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={e =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200 resize-none"
          placeholder="Add a brief description about the book..."
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Condition <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CONDITION_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFormData({ ...formData, condition: option.value })
              }
              className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                formData.condition === option.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-border/80 hover:bg-secondary/30'
              }`}
            >
              <span
                className={`block text-sm font-medium ${
                  formData.condition === option.value
                    ? 'text-accent'
                    : 'text-foreground'
                }`}
              >
                {option.label}
              </span>
              <span className="block text-[11px] text-muted-foreground mt-0.5 leading-tight">
                {option.description}
              </span>
              {formData.condition === option.value && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-4 h-4 text-accent"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        {errors.condition && (
          <p className="mt-2 text-sm text-destructive">{errors.condition}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Location <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={e =>
              setFormData({ ...formData, location: e.target.value })
            }
            className={`w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border ${
              errors.location ? 'border-destructive' : 'border-border'
            } text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200`}
            placeholder="City, State or Neighborhood"
          />
        </div>
        {errors.location && (
          <p className="mt-1.5 text-sm text-destructive">{errors.location}</p>
        )}
      </div>

      {/* Images Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Book Images <span className="text-destructive">*</span>
          <span className="text-muted-foreground font-normal ml-1">
            (up to 5)
          </span>
        </label>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            isUploading
              ? 'border-accent bg-accent/5'
              : errors.images
              ? 'border-destructive bg-destructive/5'
              : 'border-border hover:border-accent/50 hover:bg-secondary/30'
          } ${
            formData.images.length >= 5
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          onClick={() =>
            formData.images.length < 5 && fileInputRef.current?.click()
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={formData.images.length >= 5 || isUploading}
          />

          {isUploading ? (
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10">
                <svg
                  className="w-6 h-6 text-accent animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-accent">
                Uploading images...
              </p>
              <div className="flex justify-center gap-1">
                {uploadProgress.map((progress, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      progress === 100 ? 'bg-accent' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                <svg
                  className="w-6 h-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {formData.images.length >= 5
                  ? 'Maximum images reached'
                  : 'Drop images here or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP or GIF • Max 10MB each
              </p>
            </>
          )}
        </div>

        {/* Image Preview Grid */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
            {formData.images.map((image, index) => (
              <div
                key={image.publicId}
                className="relative aspect-square rounded-xl overflow-hidden bg-muted group ring-2 ring-transparent hover:ring-accent/30 transition-all"
              >
                <img
                  src={image.url}
                  alt={`Book image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-destructive"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-1 text-[10px] font-semibold bg-accent text-accent-foreground rounded-md">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {errors.images && (
          <p className="mt-2 text-sm text-destructive">{errors.images}</p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: The first image will be used as the cover photo
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary/50 transition-all duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={createBook.isPending || isUploading}
          className="flex-1 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {createBook.isPending ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding Book...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              List Book for Exchange
            </>
          )}
        </button>
      </div>

      {createBook.isError && (
        <p className="text-sm text-destructive text-center">
          {createBook.error.message || 'Failed to add book. Please try again.'}
        </p>
      )}
    </form>
  );
}
