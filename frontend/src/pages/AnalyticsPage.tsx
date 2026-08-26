import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAnalytics } from "../api/analytics";
import api from "../api/client";
import GroupTabs from "../components/GroupTabs";
import type { AnalyticsResponse } from "../api/analytics";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const BRAND = "#FBBF24";
const TEAL = "#2DD4BF";
const MUTED = "#334155";

export default function AnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{ name: string; subject: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/study-groups/${id}`).then((res) => setGroupInfo({ name: res.data.name, subject: res.data.subject }));
    fetchAnalytics(id)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 transition-colors duration-300 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
        <p className="text-slate-400 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-8 transition-colors duration-300 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
        <p className="text-slate-400 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Couldn't load analytics.</p>
        <Link to={`/groups/${id}`} className="text-yellow-400 text-sm mt-4 inline-block min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          &larr; Back to group
        </Link>
      </div>
    );
  }

  const pieData = [
    { name: "Completed", value: data.completed_deadlines },
    { name: "Remaining", value: data.total_deadlines - data.completed_deadlines },
  ];

  const hasTrendData = data.weekly_trend.some((t) => t.completed_count > 0);
  const hasContributions = data.member_contributions.some((m) => m.completed_count > 0);

  return (
    <div className="min-h-screen p-8 transition-colors duration-300 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
      <Link
        to={`/groups/${id}`}
        className="text-slate-400 hover:text-yellow-400 text-sm inline-flex items-center gap-1 mb-6 transition min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        &larr; Back to group
      </Link>

      {groupInfo && <GroupTabs groupId={id!} groupName={groupInfo.name} subject={groupInfo.subject} />}
      <p className="text-slate-400 text-sm mb-10 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {data.completed_deadlines} of {data.total_deadlines} deadlines completed
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div style={{ background: "var(--bg-card-yellow)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-5 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <p className="text-3xl font-bold text-[color:var(--text-primary)] min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{data.completion_rate}%</p>
          <p className="text-[color:var(--text-primary)] text-sm mt-1 opacity-70 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Completion rate</p>
        </div>
        <div style={{ background: "var(--bg-card-pink)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-5 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <p className="text-3xl font-bold text-[color:var(--text-primary)] min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{data.current_streak}</p>
          <p className="text-[color:var(--text-primary)] text-sm mt-1 opacity-70 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Current streak (days)</p>
        </div>
        <div style={{ background: "var(--bg-card-sage)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-5 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <p className="text-3xl font-bold text-[color:var(--text-primary)] min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{data.longest_streak}</p>
          <p className="text-[color:var(--text-primary)] text-sm mt-1 opacity-70 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Longest streak (days)</p>
        </div>
        <div style={{ background: "var(--bg-card-blue)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-5 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <p className="text-3xl font-bold text-[color:var(--text-primary)] min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{data.total_deadlines}</p>
          <p className="text-[color:var(--text-primary)] text-sm mt-1 opacity-70 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Total deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-6 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Completion breakdown</h2>
          {data.total_deadlines === 0 ? (
            <p className="text-slate-400 text-sm min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">No deadlines yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  <Cell fill={BRAND} />
                  <Cell fill={MUTED} />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-primary)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-6 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Weekly completion trend</h2>
          {!hasTrendData ? (
            <p className="text-slate-400 text-sm min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">No completions recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.weekly_trend}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "var(--border-subtle)" }}
                  contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 10, color: "var(--text-primary)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                  labelStyle={{ color: "var(--text-secondary)", fontSize: 11 }}
                />
                <Bar dataKey="completed_count" radius={[6, 6, 0, 0]}>
                  {data.weekly_trend.map((entry, index) => {
                    const maxCount = Math.max(...data.weekly_trend.map((t) => t.completed_count));
                    const isMax = entry.completed_count === maxCount && maxCount > 0;
                    return <Cell key={`cell-${index}`} fill={isMax ? BRAND : MUTED} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-6 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Member contribution</h2>
        {!hasContributions ? (
          <p className="text-slate-400 text-sm min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">No completed deadlines assigned to members yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.member_contributions}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="member_name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-primary)" }}
              />
              <Bar dataKey="completed_count" fill={TEAL} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}




