import React, { useEffect, useRef, useState } from 'react';
import type { PosterFormData } from '../../types/poster';
import { renderPosterToCanvas, exportPosterAsPng } from '../../services/posterCanvasRenderer';
import { Download, Sparkles, AlertCircle, CheckCircle, Eye } from 'lucide-react';

interface PosterPreviewProps {
  formData: PosterFormData;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({ formData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderPosterToCanvas(canvasRef.current, formData).catch(err => {
        console.error('Canvas render error:', err);
      });
    }
  }, [formData]);

  const handleGenerate = async () => {
    if (!formData.name.trim()) {
      setErrorMsg('Please enter an athlete or team name before generating.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMsg(null);

      const blob = await exportPosterAsPng(formData);
      
      if (generatedBlobUrl) {
        URL.revokeObjectURL(generatedBlobUrl);
      }

      const blobUrl = URL.createObjectURL(blob);
      setGeneratedBlobUrl(blobUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate poster PNG');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedBlobUrl) return;
    const sanitizedName = (formData.name.trim() || 'Result').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Sports_Meet_2026_${sanitizedName}_Poster.png`;
    
    const link = document.createElement('a');
    link.href = generatedBlobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-extrabold text-slate-900">Live Poster Preview</h2>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600">
          1080 × 1350 (4:5)
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Canvas Container (4:5 Aspect Ratio Box) */}
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-md aspect-[4/5] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-xs font-extrabold text-white hover:bg-blue-700 active:scale-98 disabled:opacity-50 transition-all shadow-xs"
        >
          <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating High-Res PNG...' : 'Generate Poster PNG'}</span>
        </button>

        {generatedBlobUrl && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>High-resolution 1080x1350 PNG ready for download</span>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white hover:bg-emerald-700 active:scale-98 transition-colors shadow-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download PNG Poster</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
