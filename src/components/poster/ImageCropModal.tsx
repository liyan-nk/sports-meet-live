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

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      setImgDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (isOpen) {
      setZoomRatio(cropConfig?.zoomRatio || 1);
      setTranslateX(cropConfig?.translateX || 0);
      setTranslateY(cropConfig?.translateY || 0);
      setRotation(cropConfig?.rotation || 0);
    }
  }, [isOpen, cropConfig]);

  const effDims = imgDims ? getEffectiveImageDimensions(imgDims, rotation) : null;
  const minScale = imgDims ? calculateMinCoverScale(imgDims, cropFrame, rotation) : 1;
  const currentScale = minScale * zoomRatio;

  const updateClampedTranslation = useCallback((tx: number, ty: number, scaleVal: number, rotVal: number) => {
    if (!imgDims) return;
    const clamped = clampTranslation(tx, ty, imgDims, cropFrame, scaleVal, rotVal);
    setTranslateX(clamped.translateX);
    setTranslateY(clamped.translateY);
  }, [imgDims, cropFrame]);

  useEffect(() => {
    if (imgDims) {
      updateClampedTranslation(translateX, translateY, currentScale, rotation);
    }
  }, [zoomRatio, rotation, imgDims, translateX, translateY, currentScale, updateClampedTranslation]);

  if (!isOpen) return null;

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

  const displayW = effDims ? effDims.width * currentScale : 0;
  const displayH = effDims ? effDims.height * currentScale : 0;

  const percentX = (translateX / cropFrame.width) * 100;
  const percentY = (translateY / cropFrame.height) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl flex flex-col max-h-[94vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Adjust Photo View & Crop</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 mt-2 gap-1">
          <span>Pan and zoom the photo. Everything inside the frame will be rendered in the poster.</span>
          {imgDims && (
            <span className="font-mono text-blue-700 font-bold text-[11px] shrink-0">
              {imgDims.width}×{imgDims.height}px
            </span>
          )}
        </div>

        {/* Fixed Crop Viewport Frame */}
        <div className="my-4 relative">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative mx-auto w-full max-w-[460px] aspect-[900/670] overflow-hidden rounded-xl border-2 border-blue-600 bg-slate-950 cursor-grab select-none shadow-md touch-none ${
              isDragging ? 'cursor-grabbing border-blue-500 ring-4 ring-blue-500/20' : ''
            }`}
          >
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

            {/* Grid Overlay */}
            <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-3 grid-rows-3 border border-white/30">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-white/20" />
              <div className="border-r border-white/20" />
              <div />
            </div>

            <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-bold text-white border border-slate-700 backdrop-blur-md shadow-xs">
              <Move className="h-3.5 w-3.5 text-blue-400" />
              <span>Drag photo inside frame</span>
            </div>
            
            <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700">
              {cropFrame.width}×{cropFrame.height}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <ZoomIn className="h-3.5 w-3.5 text-blue-600" /> Zoom Level
              </span>
              <span className="font-mono text-blue-700 font-extrabold">{Math.round(zoomRatio * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoomRatio(prev => Math.max(1, parseFloat((prev - 0.1).toFixed(2))))}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
                title="Zoom out"
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
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoomRatio(prev => Math.min(3, parseFloat((prev + 0.1).toFixed(2))))}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-600">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('top')}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                Top
              </button>
              <button
                type="button"
                onClick={() => applyPreset('center')}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                Center
              </button>
              <button
                type="button"
                onClick={() => applyPreset('bottom')}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
              >
                Bottom
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RotateCw className="h-3.5 w-3.5 text-blue-600" />
                <span>Rotate {rotation}°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 mt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="h-11 flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 text-xs font-extrabold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>{isInitialUpload ? 'Apply & Save Crop' : 'Apply Crop'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
