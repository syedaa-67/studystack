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
  LineChart,
  Line,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
        <p className="text-slate-400">Couldn't load analytics.</p>
        <Link to={`/groups/${id}`} className="text-yellow-400 text-sm mt-4 inline-block">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
      <Link
        to={`/groups/${id}`}
        className="text-slate-400 hover:text-yellow-400 text-sm inline-flex items-center gap-1 mb-6 transition"
      >
        &larr; Back to group
      </Link>

      {groupInfo && <GroupTabs groupId={id!} groupName={groupInfo.name} subject={groupInfo.subject} />}
      <p className="text-slate-400 text-sm mb-10">
        {data.completed_deadlines} of {data.total_deadlines} deadlines completed
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{data.completion_rate}%</p>
          <p className="text-slate-400 text-sm mt-1">Completion rate</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{data.current_streak}</p>
          <p className="text-slate-400 text-sm mt-1">Current streak (days)</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{data.longest_streak}</p>
          <p className="text-slate-400 text-sm mt-1">Longest streak (days)</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{data.total_deadlines}</p>
          <p className="text-slate-400 text-sm mt-1">Total deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Completion breakdown</h2>
          {data.total_deadlines === 0 ? (
            <p className="text-slate-400 text-sm">No deadlines yet.</p>
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
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Weekly completion trend</h2>
          {!hasTrendData ? (
            <p className="text-slate-400 text-sm">No completions recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.weekly_trend}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
                />
                <Line
                  type="monotone"
                  dataKey="completed_count"
                  stroke={BRAND}
                  strokeWidth={2}
                  dot={{ fill: BRAND, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Member contribution</h2>
        {!hasContributions ? (
          <p className="text-slate-400 text-sm">No completed deadlines assigned to members yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.member_contributions}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="member_name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#f1f5f9" }}
              />
              <Bar dataKey="completed_count" fill={TEAL} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

