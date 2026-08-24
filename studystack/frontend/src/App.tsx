import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GroupDetail from "./pages/GroupDetail";
import AnalyticsPage from "./pages/AnalyticsPage";
import GroupDashboardPage from "./pages/GroupDashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/groups/:id/analytics" element={<AnalyticsPage />} />
        <Route path="/groups/:id/dashboard" element={<GroupDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
