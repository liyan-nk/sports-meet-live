import type { PosterCropState } from '../types/poster';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CropFrameDimensions {
  width: number;
  height: number;
}

/**
 * Calculates effective unscaled dimensions taking rotation (0, 90, 180, 270) into account.
 */
export function getEffectiveImageDimensions(
  img: ImageDimensions,
  rotation: number
): ImageDimensions {
  const isRotated = rotation === 90 || rotation === 270;
  return {
    width: isRotated ? img.height : img.width,
    height: isRotated ? img.width : img.height,
  };
}

/**
 * Calculates the exact minimum scale required to COMPLETELY COVER the crop frame.
 * S_min = max(cropWidth / effWidth, cropHeight / effHeight)
 */
export function calculateMinCoverScale(
  img: ImageDimensions,
  cropFrame: CropFrameDimensions,
  rotation: number = 0
): number {
  if (!img.width || !img.height || !cropFrame.width || !cropFrame.height) {
    return 1;
  }
  const eff = getEffectiveImageDimensions(img, rotation);
  const scaleX = cropFrame.width / eff.width;
  const scaleY = cropFrame.height / eff.height;
  return Math.max(scaleX, scaleY);
}

/**
 * Calculates maximum allowed translation limits (X_max, Y_max) at the current scale.
 * Image Bounds >= Crop Frame Bounds at all times.
 * X_max = (effWidth * scale - cropWidth) / 2
 * Y_max = (effHeight * scale - cropHeight) / 2
 */
export function calculatePanBounds(
  img: ImageDimensions,
  cropFrame: CropFrameDimensions,
  scale: number,
  rotation: number = 0
): { maxTranslateX: number; maxTranslateY: number } {
  const eff = getEffectiveImageDimensions(img, rotation);
  const scaledW = eff.width * scale;
  const scaledH = eff.height * scale;

  const maxTranslateX = Math.max(0, (scaledW - cropFrame.width) / 2);
  const maxTranslateY = Math.max(0, (scaledH - cropFrame.height) / 2);

  return { maxTranslateX, maxTranslateY };
}

/**
 * Strictly clamps translation (translateX, translateY) to guarantee that the crop frame
 * remains 100% COVERED by the image with ZERO blank space.
 */
export function clampTranslation(
  translateX: number,
  translateY: number,
  img: ImageDimensions,
  cropFrame: CropFrameDimensions,
  scale: number,
  rotation: number = 0
): { translateX: number; translateY: number } {
  const { maxTranslateX, maxTranslateY } = calculatePanBounds(img, cropFrame, scale, rotation);
  return {
    translateX: Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX)),
    translateY: Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY)),
  };
}

/**
 * Creates or updates a PosterCropState guaranteeing that scale >= minCoverScale
 * and translation is clamped to valid bounds.
 */
export function createValidCropState(
  img: ImageDimensions,
  cropFrame: CropFrameDimensions,
  params?: {
    zoomRatio?: number;   // 1.0 (100% min cover) to 3.0 (300%)
    translateX?: number;
    translateY?: number;
    rotation?: number;
  }
): PosterCropState {
  const rotation = params?.rotation || 0;
  const minScale = calculateMinCoverScale(img, cropFrame, rotation);
  const zoomRatio = Math.max(1, params?.zoomRatio || 1);
  const scale = minScale * zoomRatio;

  const initialTx = params?.translateX ?? 0;
  const initialTy = params?.translateY ?? 0;

  const { translateX, translateY } = clampTranslation(
    initialTx,
    initialTy,
    img,
    cropFrame,
    scale,
    rotation
  );

  return {
    scale,
    translateX,
    translateY,
    rotation,
    zoomRatio,
    cropWidth: cropFrame.width,
    cropHeight: cropFrame.height,
    imageWidth: img.width,
    imageHeight: img.height,
  };
}

/**
 * Derives the HTML5 Canvas source slice (sx, sy, sw, sh) from a PosterCropState.
 */
export function getCanvasSourceRect(
  cropState: PosterCropState
): { sx: number; sy: number; sw: number; sh: number } {
  const { scale, translateX, translateY, rotation, cropWidth, cropHeight, imageWidth, imageHeight } = cropState;
  const eff = getEffectiveImageDimensions({ width: imageWidth, height: imageHeight }, rotation);

  const sw = cropWidth / scale;
  const sh = cropHeight / scale;

  // Center alignment minus scale-adjusted translation
  let sx = (eff.width - sw) / 2 - translateX / scale;
  let sy = (eff.height - sh) / 2 - translateY / scale;

  // Additional safety clamping
  sx = Math.max(0, Math.min(eff.width - sw, sx));
  sy = Math.max(0, Math.min(eff.height - sh, sy));

  return { sx, sy, sw, sh };
}
