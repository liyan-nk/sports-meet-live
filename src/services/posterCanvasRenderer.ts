import type { PosterFormData } from '../types/poster';
import { DUMMY_BRANDING, POSTER_TEMPLATES } from '../config/posterTheme';
import { createValidCropState, getCanvasSourceRect } from '../utils/cropMath';

/**
 * Loads an HTMLImageElement from a URL or ObjectURL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for remote HTTP/HTTPS URLs (blob: and data: URLs break if crossOrigin is set)
    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image for poster from ${src.substring(0, 30)}...: ${err}`));
    img.src = src;
  });
}

/**
 * Native HTML5 Canvas Poster Renderer (Target Output: 1080 x 1350 px, 4:5 ratio)
 */
export async function renderPosterToCanvas(
  canvas: HTMLCanvasElement,
  formData: PosterFormData
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const template = POSTER_TEMPLATES.find(t => t.id === formData.templateId) || POSTER_TEMPLATES[0];
  const width = template.width;   // 1080
  const height = template.height; // 1350

  canvas.width = width;
  canvas.height = height;

  // Position colors
  const posColor =
    formData.position === 1 ? template.theme.accentGold :
    formData.position === 2 ? template.theme.accentSilver :
    formData.position === 3 ? template.theme.accentBronze : '#475569';

  const posLabel =
    formData.position === 1 ? '1ST PLACE' :
    formData.position === 2 ? '2ND PLACE' :
    formData.position === 3 ? '3RD PLACE' : '4TH PLACE';

  // 1. Background
  ctx.fillStyle = template.theme.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Gradient background glow
  const bgGradient = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, 800);
  bgGradient.addColorStop(0, '#1E293B');
  bgGradient.addColorStop(1, template.theme.backgroundColor);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Template specific background accents
  if (template.id === 'template-victory') {
    // Diagonal slash geometric background
    ctx.fillStyle = posColor + '15'; // 15% opacity hex
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.7, 0);
    ctx.lineTo(width * 0.3, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }

  // 2. Header Branding
  ctx.textAlign = 'center';
  
  // Tagline / Category
  ctx.fillStyle = posColor;
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText(DUMMY_BRANDING.subTitle.toUpperCase(), width / 2, 70);

  // Main Header Title
  ctx.fillStyle = template.theme.textColor;
  ctx.font = '900 56px Impact, "Arial Black", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(DUMMY_BRANDING.mainTitle, width / 2, 130);

  // Header Decorative Line
  ctx.strokeStyle = posColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 120, 150);
  ctx.lineTo(width / 2 + 120, 150);
  ctx.stroke();

  // 3. Photo Box Frame
  const photoX = 90;
  const photoY = 180;
  const photoW = width - photoX * 2; // 900
  const photoH = 670;

  // Background for photo box
  ctx.fillStyle = template.theme.cardBgColor;
  ctx.fillRect(photoX, photoY, photoW, photoH);

  // Render Uploaded Image if available (Aspect Ratio Cover Mode with Clamped Crop)
  if (formData.imageUrl) {
    try {
      const img = await loadImage(formData.imageUrl);
      
      const imgDims = { width: img.width, height: img.height };
      const frameDims = { width: photoW, height: photoH };

      // Ensure valid crop state for the current frame dimensions and image
      const cropState = createValidCropState(imgDims, frameDims, {
        zoomRatio: formData.crop?.zoomRatio || 1,
        translateX: formData.crop?.translateX || 0,
        translateY: formData.crop?.translateY || 0,
        rotation: formData.crop?.rotation || 0,
      });

      const { sx, sy, sw, sh } = getCanvasSourceRect(cropState);

      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoW, photoH);
      ctx.clip();

      if (cropState.rotation !== 0) {
        const centerX = photoX + photoW / 2;
        const centerY = photoY + photoH / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((cropState.rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
      ctx.restore();
    } catch {
      // Fallback if image fails to render
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('PHOTO PREVIEW UNAVAILABLE', width / 2, photoY + photoH / 2);
    }
  } else {
    // Placeholder photo graphic
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = template.theme.mutedTextColor;
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('NO PHOTO UPLOADED', width / 2, photoY + photoH / 2 - 10);
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('Upload an image to see live poster preview', width / 2, photoY + photoH / 2 + 30);
  }

  // Photo Frame Border
  ctx.strokeStyle = posColor;
  ctx.lineWidth = 8;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // Corner Accent Brackets
  const bracketSize = 30;
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#FFFFFF';
  // Top-left
  ctx.beginPath();
  ctx.moveTo(photoX - 10, photoY + bracketSize);
  ctx.lineTo(photoX - 10, photoY - 10);
  ctx.lineTo(photoX + bracketSize, photoY - 10);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(photoX + photoW - bracketSize, photoY - 10);
  ctx.lineTo(photoX + photoW + 10, photoY - 10);
  ctx.lineTo(photoX + photoW + 10, photoY + bracketSize);
  ctx.stroke();

  // 4. Position Banner Callout
  const bannerY = photoY + photoH + 20;
  const bannerH = 90;

  // Banner background
  ctx.fillStyle = posColor;
  ctx.fillRect(photoX, bannerY, photoW, bannerH);

  // Position Text inside banner
  ctx.fillStyle = formData.position === 2 ? '#0F172A' : '#0F172A';
  ctx.font = '900 58px Impact, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(posLabel, width / 2, bannerY + 66);

  // 5. Participant / Team Name
  const nameY = bannerY + bannerH + 80;
  const displayName = formData.name.trim() ? formData.name.trim().toUpperCase() : (formData.type === 'team' ? 'TEAM NAME' : 'ATHLETE NAME');
  
  ctx.fillStyle = template.theme.textColor;
  ctx.font = '900 64px Impact, "Arial Black", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(displayName, width / 2, nameY);

  // Subtitle (Type indicator)
  ctx.fillStyle = template.theme.mutedTextColor;
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(formData.type === 'team' ? 'TEAM CHAMPIONSHIP RESULT' : 'INDIVIDUAL ATHLETE RESULT', width / 2, nameY + 32);

  // 6. Event Name
  const eventY = nameY + 95;
  const displayEvent = formData.eventName.trim() ? formData.eventName.trim().toUpperCase() : 'EVENT NAME';

  // Event Pill Container
  const eventPillW = Math.max(380, displayEvent.length * 28);
  const eventPillH = 60;
  const eventPillX = width / 2 - eventPillW / 2;

  ctx.fillStyle = template.theme.cardBgColor;
  ctx.beginPath();
  ctx.roundRect(eventPillX, eventY - 42, eventPillW, eventPillH, 30);
  ctx.fill();
  ctx.strokeStyle = posColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = posColor;
  ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(displayEvent, width / 2, eventY);

  // 7. Footer Section
  const footerY = height - 50;

  // Footer Line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, footerY - 30);
  ctx.lineTo(width - 90, footerY - 30);
  ctx.stroke();

  ctx.fillStyle = template.theme.mutedTextColor;
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(DUMMY_BRANDING.footerText, width / 2, footerY);
}

/**
 * Renders poster to a high-resolution Blob for PNG download
 */
export async function exportPosterAsPng(formData: PosterFormData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  await renderPosterToCanvas(canvas, formData);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate PNG image blob'));
    }, 'image/png', 1.0);
  });
}
