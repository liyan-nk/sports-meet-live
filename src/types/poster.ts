export type PosterType = 'individual' | 'team';
export type PosterPosition = 1 | 2 | 3 | 4;

export interface PosterCropState {
  scale: number;        // Absolute scale factor S >= minScale
  translateX: number;   // Horizontal offset in canvas px relative to frame center
  translateY: number;   // Vertical offset in canvas px relative to frame center
  rotation: number;     // 0, 90, 180, 270 degrees
  zoomRatio: number;    // Relative zoom multiplier (1.0 = 100% min cover)
  cropWidth: number;    // Target crop frame width (e.g. 900)
  cropHeight: number;   // Target crop frame height (e.g. 670)
  imageWidth: number;   // Original natural image width
  imageHeight: number;  // Original natural image height
}

export interface PosterFormData {
  type: PosterType;
  name: string;
  eventName: string;
  position: PosterPosition;
  templateId: string;
  imageFile: File | null;
  imageUrl: string | null;
  crop?: PosterCropState;
}

export interface PosterTemplateConfig {
  id: string;
  name: string;
  description: string;
  width: number;  // 1080
  height: number; // 1350
  theme: {
    backgroundColor: string;
    cardBgColor: string;
    accentGold: string;
    accentSilver: string;
    accentBronze: string;
    textColor: string;
    mutedTextColor: string;
    borderStyle: 'classic' | 'modern';
  };
}
