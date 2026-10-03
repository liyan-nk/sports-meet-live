import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import type { PosterFormData, PosterType, PosterPosition } from '../types/poster';
import { POSTER_TEMPLATES } from '../config/posterTheme';
import { PosterForm } from '../components/poster/PosterForm';
import { PosterPreview } from '../components/poster/PosterPreview';
import { ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

export const PosterGeneratorPage: React.FC = () => {
  const { user, isAuthorizedAdmin, isLoading: isAuthLoading } = useAuth();
  const [searchParams] = useSearchParams();

  // Form state initialized directly from URL search params if prefilled
  const [formData, setFormData] = useState<PosterFormData>(() => ({
    type: (searchParams.get('type') as PosterType) || 'individual',
    name: searchParams.get('name') || '',
    eventName: searchParams.get('eventName') || '',
    position: (parseInt(searchParams.get('position') || '1', 10) as PosterPosition) || 1,
    templateId: POSTER_TEMPLATES[0].id,
    imageFile: null,
    imageUrl: null,
  }));

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Security Guard: Redirect unauthorized users to /admin/login
  if (!user || !isAuthorizedAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleFormChange = (updated: Partial<PosterFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updated,
    }));
  };

  return (
    <div className="space-y-5">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Poster Generator</h1>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900 border border-amber-300 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> 1080×1350 PNG
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Admin: {user.email}</span>
        </div>
      </div>

      {/* Two Column Layout (Form + Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Top: Form */}
        <div className="lg:col-span-6">
          <PosterForm
            formData={formData}
            onChange={handleFormChange}
          />
        </div>

        {/* Right / Bottom: Live Preview */}
        <div className="lg:col-span-6 lg:sticky lg:top-20">
          <PosterPreview
            formData={formData}
          />
        </div>

      </div>

    </div>
  );
};
