import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import GroupDetail from './pages/GroupDetail';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import { StudyDashboard } from './components/dashboard/StudyDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/groups/:id/dashboard" element={<StudyDashboard groupId={window.location.pathname.split('/')[2]} />} />
      <Route path="/groups/:id/analytics" element={<AnalyticsPage />} />
      <Route path="/groups/:id/calendar" element={<CalendarPage />} />
      <Route path="/analytics/:id" element={<AnalyticsPage />} />
      <Route path="/dashboard/:id" element={<StudyDashboard groupId={window.location.pathname.split('/')[2]} />} />
    </Routes>
  );
}

export default App;
