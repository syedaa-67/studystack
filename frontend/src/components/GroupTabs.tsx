import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';
import NotificationBell from './NotificationBell';

interface Props {
  groupId: number | string;
  groupName: string;
  subject: string;
}

export default function GroupTabs({ groupId, groupName, subject }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { label: "Overview", path: `/groups/${groupId}` },
    { label: "Live Dashboard", path: `/groups/${groupId}/dashboard` },
    { label: "Analytics", path: `/groups/${groupId}/analytics` },
    { label: "Calendar", path: `/groups/${groupId}/calendar` },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="mb-8 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          Study<span style={{ color: 'var(--accent-yellow)' }}>Stack</span>
        </h1>
        <div className="flex items-center gap-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <ThemeSwitcher />
          <NotificationBell />
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 text-sm rounded-lg border min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', background: 'transparent' }}
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm rounded-lg border min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', background: 'transparent' }}
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <span className="bg-yellow-400 text-slate-900 text-xs font-semibold w-fit px-3 py-1 rounded-full min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {subject}
        </span>
        <h2 className="text-2xl font-bold min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{groupName}</h2>
      </div>
      <div className="flex gap-2 border-b border-white/10 pb-0 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition border-b-2 ${
                active
                  ? "text-yellow-400 border-yellow-400 bg-white/5"
                  : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
