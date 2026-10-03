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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">POSTER GENERATOR</h1>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-950 border border-amber-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-700" /> High-Res PNG
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Admin: {user.email}</span>
        </div>
      </div>

      {/* Two Column Layout (Form + Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6">
          <PosterForm
            formData={formData}
            onChange={handleFormChange}
          />
        </div>

        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <PosterPreview
            formData={formData}
          />
        </div>
      </div>
    </div>
  );
};
