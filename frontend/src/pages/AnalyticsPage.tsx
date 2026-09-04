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
  const [groupInfo, setGroupInfo] = useState<{ name: string; subject: string; memberCount: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/study-groups/${id}`).then((res) => setGroupInfo({ name: res.data.name, subject: res.data.subject, memberCount: res.data.members?.length || 0 }));
    fetchAnalytics(id)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 transition-colors duration-300 " style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
        <p className="text-slate-400 ">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-8 transition-colors duration-300 " style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
        <p className="text-slate-400 ">Couldn't load analytics.</p>
        <Link to={`/groups/${id}`} className="text-yellow-400 text-sm mt-4 inline-block ">
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
    <div className="min-h-screen p-8 transition-colors duration-300 " style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>
      <Link
        to={`/groups/${id}`}
        className="text-slate-400 hover:text-yellow-400 text-sm inline-flex items-center gap-1 mb-6 transition "
      >
        &larr; Back to group
      </Link>

      {groupInfo && <GroupTabs groupId={id!} groupName={groupInfo.name} subject={groupInfo.subject} memberCount={groupInfo.memberCount} completionRate={data ? Math.round((data.completed_deadlines / (data.total_deadlines || 1)) * 100) : 0} />}
      <p className="text-slate-400 text-sm mb-10 ">
        {data.completed_deadlines} of {data.total_deadlines} deadlines completed
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 ">
        <div style={{ background: "var(--bg-card-yellow)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-5 ">
          <p className="text-3xl font-bold text-[color:var(--text-primary)] ">{data.completion_rate}%</p>
          <p className="text-[color:var(--text-primary)] text-sm mt-1 opacity-70 ">Completion rate</p>
        </div>
        <div style={{ background: "var(--bg-card-pink)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-5 ">
          <p className="text-3xl font-bold text-[color:var(--text-primary)] ">{data.current_streak}</p>
          <p className="text-[color:var(--text-primary)] text-sm mt-1 opacity-70 ">Current streak (days)</p>
        </div>
        <div style={{ background: "var(--bg-card-sage)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-5 ">
          <p className="text-3xl font-bold text-[color:var(--text-primary)] ">{data.longest_streak}</p>
          <p className="text-[color:var(--text-primary)] text-sm mt-1 opacity-70 ">Longest streak (days)</p>
        </div>
        <div style={{ background: "var(--bg-card-blue)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-5 ">
          <p className="text-3xl font-bold text-[color:var(--text-primary)] ">{data.total_deadlines}</p>
          <p className="text-[color:var(--text-primary)] text-sm mt-1 opacity-70 ">Total deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 ">
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-6 ">
          <h2 className="text-lg font-semibold mb-4 ">Completion breakdown</h2>
          {data.total_deadlines === 0 ? (
            <p className="text-slate-400 text-sm ">No deadlines yet.</p>
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

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-6 ">
          <h2 className="text-lg font-semibold mb-4 ">Weekly completion trend</h2>
          {!hasTrendData ? (
            <p className="text-slate-400 text-sm ">No completions recorded yet.</p>
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

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }} className="rounded-xl p-6 ">
        <h2 className="text-lg font-semibold mb-4 ">Member contribution</h2>
        {!hasContributions ? (
          <p className="text-slate-400 text-sm ">No completed deadlines assigned to members yet.</p>
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




