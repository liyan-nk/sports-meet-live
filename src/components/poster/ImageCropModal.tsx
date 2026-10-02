import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PosterCropState } from '../../types/poster';
import {
  calculateMinCoverScale,
  calculatePanBounds,
  clampTranslation,
  createValidCropState,
  getEffectiveImageDimensions,
} from '../../utils/cropMath';
import { Crop, ZoomIn, ZoomOut, RotateCw, RefreshCw, X, Check, Move } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  cropConfig?: PosterCropState;
  cropFrame?: { width: number; height: number };
  onClose: () => void;
  onSave: (crop: PosterCropState) => void;
  isInitialUpload?: boolean;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageUrl,
  cropConfig,
  cropFrame = { width: 900, height: 670 },
  onClose,
  onSave,
  isInitialUpload = false,
}) => {
  const [imgDims, setImgDims] = useState<{ width: number; height: number } | null>(null);
  const [zoomRatio, setZoomRatio] = useState<number>(cropConfig?.zoomRatio || 1);
  const [translateX, setTranslateX] = useState<number>(cropConfig?.translateX || 0);
  const [translateY, setTranslateY] = useState<number>(cropConfig?.translateY || 0);
  const [rotation, setRotation] = useState<number>(cropConfig?.rotation || 0);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startTx: number; startTy: number }>({
    x: 0,
    y: 0,
    startTx: 0,
    startTy: 0,
  });

  // Load natural dimensions of uploaded image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      setImgDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Synchronize state when opening modal or changing props
  useEffect(() => {
    if (isOpen) {
      setZoomRatio(cropConfig?.zoomRatio || 1);
      setTranslateX(cropConfig?.translateX || 0);
      setTranslateY(cropConfig?.translateY || 0);
      setRotation(cropConfig?.rotation || 0);
    }
  }, [isOpen, cropConfig]);

  // Derived calculations
  const effDims = imgDims ? getEffectiveImageDimensions(imgDims, rotation) : null;
  const minScale = imgDims ? calculateMinCoverScale(imgDims, cropFrame, rotation) : 1;
  const currentScale = minScale * zoomRatio;

  // Helper to safely set clamped translation
  const updateClampedTranslation = useCallback((tx: number, ty: number, scaleVal: number, rotVal: number) => {
    if (!imgDims) return;
    const clamped = clampTranslation(tx, ty, imgDims, cropFrame, scaleVal, rotVal);
    setTranslateX(clamped.translateX);
    setTranslateY(clamped.translateY);
  }, [imgDims, cropFrame]);

  // When zoom or rotation changes, ensure translation is instantly clamped
  useEffect(() => {
    if (imgDims) {
      updateClampedTranslation(translateX, translateY, currentScale, rotation);
    }
  }, [zoomRatio, rotation, imgDims, translateX, translateY, currentScale, updateClampedTranslation]);

  if (!isOpen) return null;

  // Pointer dragging handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTx: translateX,
      startTy: translateY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !imgDims) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Direct 1:1 displacement mapping scaled by crop viewport ratio
    // Assume crop viewport box display width is approx 440px vs 900px canvas frame
    const displayFactor = cropFrame.width / 440;
    const newTx = dragStartRef.current.startTx + (dx * displayFactor);
    const newTy = dragStartRef.current.startTy + (dy * displayFactor);

    updateClampedTranslation(newTx, newTy, currentScale, rotation);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setIsDragging(false);
    }
  };

  const handleReset = () => {
    setZoomRatio(1);
    setTranslateX(0);
    setTranslateY(0);
    setRotation(0);
  };

  const handleRotate = () => {
    const newRot = (rotation + 90) % 360;
    setRotation(newRot);
    if (imgDims) {
      const newMinScale = calculateMinCoverScale(imgDims, cropFrame, newRot);
      const newScale = newMinScale * zoomRatio;
      updateClampedTranslation(translateX, translateY, newScale, newRot);
    }
  };

  const handleApply = () => {
    if (!imgDims) {
      onClose();
      return;
    }
    const cropState = createValidCropState(imgDims, cropFrame, {
      zoomRatio,
      translateX,
      translateY,
      rotation,
    });
    onSave(cropState);
  };

  // Presets
  const applyPreset = (preset: 'center' | 'top' | 'bottom' | 'left' | 'right') => {
    if (!imgDims) return;
    const { maxTranslateX, maxTranslateY } = calculatePanBounds(imgDims, cropFrame, currentScale, rotation);
    switch (preset) {
      case 'center':
        setTranslateX(0);
        setTranslateY(0);
        break;
      case 'top':
        setTranslateX(0);
        setTranslateY(-maxTranslateY);
        break;
      case 'bottom':
        setTranslateX(0);
        setTranslateY(maxTranslateY);
        break;
      case 'left':
        setTranslateX(-maxTranslateX);
        setTranslateY(0);
        break;
      case 'right':
        setTranslateX(maxTranslateX);
        setTranslateY(0);
        break;
    }
  };

  // DOM Display transform calculations
  const displayW = effDims ? effDims.width * currentScale : 0;
  const displayH = effDims ? effDims.height * currentScale : 0;

  // Percentage offsets relative to viewport box for CSS translate
  const percentX = (translateX / cropFrame.width) * 100;
  const percentY = (translateY / cropFrame.height) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[94vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-amber-500" />
            <h2 className="font-sports text-xl text-white">ADJUST PHOTO CROP</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 mt-2 gap-1">
          <span>Move and zoom the photo to choose what appears in the poster. Everything inside the frame will appear in the poster.</span>
          {imgDims && (
            <span className="font-mono text-amber-400 text-[11px] shrink-0">
              Original: {imgDims.width}×{imgDims.height}px
            </span>
          )}
        </div>

        {/* Fixed Crop Viewport Frame (Guaranteed 100% Covered) */}
        <div className="my-4 relative">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative mx-auto w-full max-w-[460px] aspect-[900/670] overflow-hidden rounded-xl border-2 border-amber-400 bg-slate-950 cursor-grab select-none shadow-2xl touch-none ${
              isDragging ? 'cursor-grabbing border-amber-300 ring-4 ring-amber-500/30' : ''
            }`}
          >
            {/* Scaled & Clamped Image Element */}
            {imgDims && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate(${percentX}%, ${percentY}%) rotate(${rotation}deg)`,
                }}
              >
                <img
                  src={imageUrl}
                  alt="Poster crop preview"
                  className="max-w-none pointer-events-none"
                  style={{
                    width: `${(displayW / cropFrame.width) * 100}%`,
                    height: `${(displayH / cropFrame.height) * 100}%`,
                    objectFit: 'fill',
                  }}
                />
              </div>
            )}

            {/* Rule of Thirds Guide Grid Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-3 grid-rows-3 border border-amber-400/40">
              <div className="border-r border-b border-amber-400/30" />
              <div className="border-r border-b border-amber-400/30" />
              <div className="border-b border-amber-400/30" />
              <div className="border-r border-b border-amber-400/30" />
              <div className="border-r border-b border-amber-400/30" />
              <div className="border-b border-amber-400/30" />
              <div className="border-r border-amber-400/30" />
              <div className="border-r border-amber-400/30" />
              <div />
            </div>

            {/* Drag helper indicator */}
            <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-md bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-amber-400 border border-amber-500/40 backdrop-blur-md shadow-md">
              <Move className="h-3.5 w-3.5" />
              <span>Drag photo to align inside frame</span>
            </div>
            
            <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-800">
              Poster Frame ({cropFrame.width}×{cropFrame.height})
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          
          {/* Zoom Slider (Minimum value = 100% = Minimum Cover Scale) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <ZoomIn className="h-3.5 w-3.5 text-amber-400" /> Zoom Level
              </span>
              <span className="font-mono text-amber-400 font-bold">{Math.round(zoomRatio * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoomRatio(prev => Math.max(1, parseFloat((prev - 0.1).toFixed(2))))}
                className="rounded bg-slate-800 p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Zoom out to cover scale"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={zoomRatio}
                onChange={(e) => setZoomRatio(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoomRatio(prev => Math.min(3, parseFloat((prev + 0.1).toFixed(2))))}
                className="rounded bg-slate-800 p-1.5 text-slate-300 hover:text-white transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Presets & Utility Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('top')}
                className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:text-amber-400 transition-colors"
              >
                Top / Head
              </button>
              <button
                type="button"
                onClick={() => applyPreset('center')}
                className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:text-amber-400 transition-colors"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => applyPreset('bottom')}
                className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:text-amber-400 transition-colors"
              >
                Bottom
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
                title="Rotate 90 degrees"
              >
                <RotateCw className="h-3.5 w-3.5 text-amber-400" />
                <span>Rotate {rotation}°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                title="Reset crop to minimum cover"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 font-sports text-sm text-slate-950 hover:bg-amber-400 transition-colors shadow-lg font-bold"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>{isInitialUpload ? 'APPLY CROP & UPLOAD' : 'APPLY CROP'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
