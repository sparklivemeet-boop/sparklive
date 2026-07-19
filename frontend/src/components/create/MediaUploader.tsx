'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Video, X, FileWarning, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { apiUpload } from '@/lib/apiClient';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
  progress: number;
  uploading: boolean;
  uploadedUrl?: string;
  error?: string;
}

interface MediaUploaderProps {
  onMediaChange: (media: MediaFile[]) => void;
  maxFiles?: number;
  className?: string;
}

export default function MediaUploader({ onMediaChange, maxFiles = 10, className }: MediaUploaderProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const updateFiles = useCallback((files: MediaFile[]) => {
    setMediaFiles(files);
    onMediaChange(files);
  }, [onMediaChange]);

  const validateFile = (file: File): string | null => {
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      if (file.size > MAX_IMAGE_SIZE) return `Image exceeds ${MAX_IMAGE_SIZE / 1024 / 1024}MB limit`;
    } else if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      if (file.size > MAX_FILE_SIZE) return `Video exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`;
    } else {
      return 'Unsupported file type. Please upload images or videos.';
    }
    return null;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const newFiles: MediaFile[] = [];
    const existingCount = mediaFiles.length;

    for (let i = 0; i < files.length; i++) {
      if (existingCount + newFiles.length >= maxFiles) break;
      const file = files[i];
      const error = validateFile(file);
      const type = ACCEPTED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video';

      newFiles.push({
        id: `media_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        type,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        progress: 0,
        uploading: false,
        error: error ?? undefined,
      });

      // Start real upload
      uploadFileToServer(newFiles[newFiles.length - 1]);
    }

    const updated = [...mediaFiles, ...newFiles];
    updateFiles(updated);
  }, [mediaFiles, maxFiles, updateFiles]);

  const uploadFileToServer = async (mediaFile: MediaFile) => {
    const fd = new FormData();
    fd.append('file', mediaFile.file);

    setMediaFiles((prev) =>
      prev.map((f) =>
        f.id === mediaFile.id ? { ...f, uploading: true, progress: 0 } : f
      )
    );

    try {
      const result = await apiUpload<{ url: string }>('/api/upload', fd, token ?? undefined);
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaFile.id
            ? { ...f, progress: 100, uploading: false, uploadedUrl: result.url }
            : f
        )
      );
    } catch (err) {
      setMediaFiles((prev) =>
        prev.map((f) =>
          f.id === mediaFile.id
            ? { ...f, uploading: false, error: err instanceof Error ? err.message : 'Upload failed' }
            : f
        )
      );
    }
  };

  const removeFile = useCallback((id: string) => {
    setMediaFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      const updated = prev.filter((f) => f.id !== id);
      onMediaChange(updated);
      return updated;
    });
  }, [onMediaChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }, [processFiles]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200',
          isDragging
            ? 'border-[#ff007f] bg-[#ff007f]/5 shadow-[0_0_30px_rgba(255,0,127,0.1)]'
            : 'border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]'
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload media files"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(',')}
          multiple
          className="hidden"
          onChange={handleFileSelect}
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center transition-all',
            isDragging ? 'bg-[#ff007f]/20 scale-110' : 'bg-white/[0.05]'
          )}>
            <Upload size={22} className={isDragging ? 'text-[#ff007f]' : 'text-gray-400'} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isDragging ? 'Drop files here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Images (jpg, png, webp) up to 15MB &bull; Videos (mp4, webm) up to 50MB
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-white/[0.04] px-2.5 py-1 rounded-full">
              <Image size={11} /> Photo
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-white/[0.04] px-2.5 py-1 rounded-full">
              <Video size={11} /> Video
            </span>
          </div>
        </div>
      </div>

      {/* Media previews */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {mediaFiles.map((media) => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border',
                  media.error ? 'border-red-500/30' : 'border-white/[0.06]'
                )}
              >
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Error badge */}
                {media.error && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/80 text-white text-[9px] px-2 py-0.5 rounded-full">
                    <FileWarning size={10} />
                    Error
                  </div>
                )}

                {/* File type badge */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  {media.type === 'image' ? <Image size={10} /> : <Video size={10} />}
                  {media.type === 'image' ? 'Photo' : 'Video'}
                </div>

                {/* Progress bar */}
                {media.uploading && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.1]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc]"
                      initial={{ width: 0 }}
                      animate={{ width: `${media.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Completed indicator */}
                {media.progress === 100 && !media.error && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500/80 text-white text-[9px] px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} />
                    Ready
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(media.id); }}
                  className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-black/80 transition"
                  aria-label={`Remove ${media.name}`}
                >
                  <X size={12} />
                </button>

                {/* File name */}
                <div className="absolute bottom-8 left-2 right-2">
                  <p className="text-[10px] text-white/70 truncate drop-shadow-lg">
                    {media.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload all complete message */}
      {mediaFiles.length > 0 && mediaFiles.every((f) => f.progress === 100 && !f.error) && (
        <p className="text-[11px] text-emerald-400/80 text-center">
          {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''} uploaded successfully
        </p>
      )}
    </div>
  );
}

export type { MediaFile };