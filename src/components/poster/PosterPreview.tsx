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

  // Live Canvas Render on Form Data Change
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
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-amber-500" />
          <h2 className="font-sports text-xl text-white">LIVE POSTER PREVIEW</h2>
        </div>
        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 border border-slate-700">
          1080 × 1350 (4:5)
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Canvas Container (4:5 Aspect Ratio Box) */}
      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-slate-800 bg-black shadow-2xl aspect-[4/5] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="h-full w-full object-contain"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3.5 font-sports text-base text-slate-950 hover:bg-amber-400 active:scale-98 disabled:opacity-50 transition-all shadow-lg"
        >
          <Sparkles className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'GENERATING HIGH-RES PNG...' : 'GENERATE POSTER'}</span>
        </button>

        {generatedBlobUrl && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>High-resolution 1080x1350 PNG ready for download</span>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-sports text-base text-slate-950 hover:bg-emerald-400 active:scale-98 transition-colors shadow-md"
            >
              <Download className="h-5 w-5" />
              <span>DOWNLOAD PNG</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
