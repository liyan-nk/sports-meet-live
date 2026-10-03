import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PosterFormData, PosterPosition, PosterCropState } from '../../types/poster';
import type { SportsEvent } from '../../types/models';
import { POSTER_TEMPLATES } from '../../config/posterTheme';
import { eventRepository } from '../../data/repositories';
import { Upload, X, User, Users, Award, Image as ImageIcon, AlertCircle, Crop } from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';
import { createValidCropState } from '../../utils/cropMath';

interface PosterFormProps {
  formData: PosterFormData;
  onChange: (updated: Partial<PosterFormData>) => void;
}

export const PosterForm: React.FC<PosterFormProps> = ({ formData, onChange }) => {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEvents = useCallback(async () => {
    try {
      const eventList = await eventRepository.getEvents();
      setEvents(eventList);
      if (eventList.length > 0 && !formData.eventName) {
        onChange({ eventName: eventList[0].name });
      }
    } catch {
      // Allow fallback
    }
  }, [formData.eventName, onChange]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<{ file: File | null; url: string } | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFileError(null);
    if (!file) return;

    const isImageMime = file.type ? file.type.startsWith('image/') : false;
    const isImageExt = /\.(jpe?g|png|webp|avif|heic|gif|bmp|tiff|svg)$/i.test(file.name);

    if (!isImageMime && !isImageExt) {
      setFileError('Invalid file format. Please upload an image file (JPG, PNG, WebP, etc.).');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setFileError('File size is too large (max 30MB).');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPendingUpload({ file, url: objectUrl });
    setIsCropModalOpen(true);
  };

  const handleUrlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFileError(null);
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      setFileError('Please enter a valid image URL.');
      return;
    }

    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('data:image/')) {
      setFileError('URL must begin with http://, https://, or data:image/');
      return;
    }

    setPendingUpload({ file: null, url: trimmed });
    setIsCropModalOpen(true);
  };

  const handleCropSave = (crop: PosterCropState) => {
    if (pendingUpload) {
      if (formData.imageUrl && formData.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(formData.imageUrl);
      }
      onChange({
        imageFile: pendingUpload.file,
        imageUrl: pendingUpload.url,
        crop,
      });
      setPendingUpload(null);
    } else {
      onChange({ crop });
    }
    setIsCropModalOpen(false);
  };

  const handleCropClose = () => {
    if (pendingUpload) {
      if (pendingUpload.url.startsWith('blob:')) {
        URL.revokeObjectURL(pendingUpload.url);
      }
      setPendingUpload(null);
    }
    setIsCropModalOpen(false);
  };

  const handleRemovePhoto = () => {
    if (formData.imageUrl && formData.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.imageUrl);
    }
    onChange({
      imageFile: null,
      imageUrl: null,
    });
    setImageUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (formData.imageUrl) return;
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const item = e.clipboardData.files[0];
        if (item.type.startsWith('image/')) {
          handleFileSelect(item);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [formData.imageUrl]);

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-extrabold text-slate-900">Poster Configuration</h2>
        <p className="text-xs text-slate-500">
          Configure athlete photo, placement details, and visual template.
        </p>
      </div>

      {/* 1. Result Type */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          1. Result Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ type: 'individual' })}
            className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all ${
              formData.type === 'individual'
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Individual</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ type: 'team' })}
            className={`flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all ${
              formData.type === 'team'
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Team</span>
          </button>
        </div>
      </div>

      {/* 2. Photo Upload */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Upload {formData.type === 'team' ? 'Team Photo' : 'Athlete Photo'}
          </label>
          
          {!formData.imageUrl && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
              <button
                type="button"
                onClick={() => { setUploadMode('file'); setFileError(null); }}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  uploadMode === 'file' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setUploadMode('url'); setFileError(null); }}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  uploadMode === 'url' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Image URL
              </button>
            </div>
          )}
        </div>

        {fileError && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{fileError}</span>
          </div>
        )}

        {!formData.imageUrl ? (
          uploadMode === 'file' ? (
            <label
              htmlFor="poster-photo-input"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-1.5 group-hover:scale-105 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">
                Click to upload, drag & drop, or paste (Ctrl+V)
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Supports JPG, PNG, WebP, AVIF, HEIC
              </span>
              <input
                id="poster-photo-input"
                ref={fileInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.heic,.gif,.bmp"
                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
                className="sr-only"
              />
            </label>
          ) : (
            <form onSubmit={handleUrlSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Load
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Uploaded athlete preview"
                  className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-slate-900 truncate">
                    {formData.imageFile ? formData.imageFile.name : (formData.imageUrl.startsWith('http') ? 'Web Image URL' : 'Uploaded Photo')}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    Ready for render {formData.crop && formData.crop.zoomRatio > 1 ? `(${Math.round(formData.crop.zoomRatio * 100)}% zoom)` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                  title="Adjust crop area"
                >
                  <Crop className="h-3.5 w-3.5" />
                  <span>Crop</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Zoom Slider */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-slate-600 shrink-0 font-bold text-[11px]">Zoom:</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={formData.crop?.zoomRatio || 1}
                  onChange={(e) => {
                    if (formData.crop) {
                      const newZoomRatio = parseFloat(e.target.value);
                      const updated = createValidCropState(
                        { width: formData.crop.imageWidth, height: formData.crop.imageHeight },
                        { width: formData.crop.cropWidth, height: formData.crop.cropHeight },
                        {
                          zoomRatio: newZoomRatio,
                          translateX: formData.crop.translateX,
                          translateY: formData.crop.translateY,
                          rotation: formData.crop.rotation,
                        }
                      );
                      onChange({ crop: updated });
                    }
                  }}
                  className="flex-1 accent-blue-600 cursor-pointer"
                />
                <span className="text-blue-700 font-mono font-bold w-10 text-right">{Math.round((formData.crop?.zoomRatio || 1) * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Crop Adjustment Modal */}
        {(pendingUpload?.url || formData.imageUrl) && (
          <ImageCropModal
            isOpen={isCropModalOpen}
            imageUrl={pendingUpload ? pendingUpload.url : (formData.imageUrl || '')}
            cropConfig={formData.crop}
            isInitialUpload={Boolean(pendingUpload)}
            onClose={handleCropClose}
            onSave={handleCropSave}
          />
        )}
      </div>

      {/* 3. Name Field */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          3. {formData.type === 'team' ? 'Team Name' : 'Athlete Name'}
        </label>
        <input
          type="text"
          placeholder={formData.type === 'team' ? 'e.g. Vertex' : 'e.g. Liyan (S3 CSE)'}
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
          required
        />
      </div>

      {/* 4. Event Selector */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          4. Event Name
        </label>
        <div className="space-y-2">
          {events.length > 0 && (
            <select
              value={formData.eventName}
              onChange={(e) => onChange({ eventName: e.target.value })}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none shadow-xs"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.name}>
                  {ev.name} ({ev.category})
                </option>
              ))}
              <option value="Custom Event...">+ Custom Event Name...</option>
            </select>
          )}

          {(events.length === 0 || formData.eventName === 'Custom Event...') && (
            <input
              type="text"
              placeholder="e.g. 100M Men, Football"
              value={formData.eventName === 'Custom Event...' ? '' : formData.eventName}
              onChange={(e) => onChange({ eventName: e.target.value })}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none shadow-xs"
              required
            />
          )}
        </div>
      </div>

      {/* 5. Placement Position */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          5. Placement Position
        </label>
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as PosterPosition[]).map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => onChange({ position: pos })}
              className={`flex items-center justify-center gap-1 h-11 rounded-xl border text-xs font-bold transition-all ${
                formData.position === pos
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>{pos === 1 ? '1st' : pos === 2 ? '2nd' : pos === 3 ? '3rd' : '4th'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Template Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          6. Select Poster Template
        </label>
        <div className="grid grid-cols-2 gap-3">
          {POSTER_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onChange({ templateId: tmpl.id })}
              className={`rounded-xl border p-3 text-left transition-all ${
                formData.templateId === tmpl.id
                  ? 'border-blue-600 bg-blue-50/50 text-slate-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{tmpl.name}</span>
                <ImageIcon className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                {tmpl.description}
              </p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
