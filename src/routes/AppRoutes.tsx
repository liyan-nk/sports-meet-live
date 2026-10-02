import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { StandingsPage } from '../pages/StandingsPage';
import { EventsPage } from '../pages/EventsPage';
import { ResultsPage } from '../pages/ResultsPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminAdminsPage } from '../pages/AdminAdminsPage';
import { PosterGeneratorPage } from '../pages/PosterGeneratorPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<StandingsPage />} />
        <Route path="/standings" element={<Navigate to="/" replace />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/admins" element={<AdminAdminsPage />} />
        <Route path="/admin/posters" element={<PosterGeneratorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
};
