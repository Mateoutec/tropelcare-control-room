import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TropelsPage } from '../features/tropels/TropelsPage';
import { SignalDetailPage } from '../features/signals/SignalDetailPage';
import { SignalFeedPage } from '../features/signals/SignalFeedPage';
import { SectorsPage } from '../features/sectors/SectorsPage';
import { SectorStoryPage } from '../features/sectors/SectorStoryPage';
import { AppLayout } from '../routes/AppLayout';

export const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tropels" element={<TropelsPage />} />
        <Route path="/signals" element={<SignalFeedPage />} />
        <Route path="/signals/:id" element={<SignalDetailPage />} />
        <Route path="/sectors" element={<SectorsPage />} />
        <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);
