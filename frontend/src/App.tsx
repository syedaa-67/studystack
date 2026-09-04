import { Routes, Route, Outlet, useParams } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GroupDetail from './pages/GroupDetail';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import { StudyDashboard } from './components/dashboard/StudyDashboard';

// Helper wrapper to safely pass group ID from React Router params to StudyDashboard
function StudyDashboardWrapper() {
  const { id } = useParams<{ id: string }>();
  return <StudyDashboard groupId={id || ''} />;
}

// Top-level container wrapper for authenticated application views
function MainLayout() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-background">
      <Routes>
        {/* Full-width Auth Pages (No container constraint) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Constrained App Pages (Wrapped in max-w-7xl layout container) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:id/dashboard" element={<StudyDashboardWrapper />} />
          <Route path="/groups/:id/analytics" element={<AnalyticsPage />} />
          <Route path="/groups/:id/calendar" element={<CalendarPage />} />
          <Route path="/analytics/:id" element={<AnalyticsPage />} />
          <Route path="/dashboard/:id" element={<StudyDashboardWrapper />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
