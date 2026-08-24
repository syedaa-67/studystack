import { Link, useLocation } from "react-router-dom";

interface Props {
  groupId: number | string;
  groupName: string;
  subject: string;
}

export default function GroupTabs({ groupId, groupName, subject }: Props) {
  const location = useLocation();

  const tabs = [
    { label: "Overview", path: `/groups/${groupId}` },
    { label: "Live Dashboard", path: `/groups/${groupId}/dashboard` },
    { label: "Analytics", path: `/groups/${groupId}/analytics` },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-yellow-400 text-slate-900 text-xs font-semibold w-fit px-3 py-1 rounded-full">
          {subject}
        </span>
        <h1 className="text-2xl font-bold">{groupName}</h1>
      </div>
      <div className="flex gap-2 border-b border-white/10 pb-0">
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
