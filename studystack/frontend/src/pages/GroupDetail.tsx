import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import NewDeadlineModal from "../components/NewDeadlineModal";
import NewMemberModal from "../components/NewMemberModal";
import GroupTabs from "../components/GroupTabs";
import { useGroupSocket } from "../hooks/useGroupSocket";
import { fetchAnalytics } from "../api/analytics";
import ResourcesSection from "../components/ResourcesSection";
import type { AnalyticsResponse } from "../api/analytics";

interface Member {
  id: number;
  name: string;
  email: string;
  user_id: number | null;
  role: string;
}

interface Deadline {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
}

interface GroupDetail {
  id: number;
  name: string;
  subject: string;
  description: string | null;
  created_at: string;
  members: Member[];
  deadlines: Deadline[];
  my_role: string;
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const isAdminPlus = group?.my_role === "owner" || group?.my_role === "admin";

  const { onlineUsers, pomodoro, sendPomodoroAction } = useGroupSocket(id ?? "");

  const loadGroup = () => {
    api
      .get(`/study-groups/${id}`)
      .then((res) => setGroup(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  const loadAnalytics = () => {
    if (!id) return;
    fetchAnalytics(id)
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    loadGroup();
    loadAnalytics();
  }, [id]);

  const handleToggleComplete = (deadlineId: number, alreadyCompleted: boolean) => {
    if (alreadyCompleted || togglingId !== null) return;
    setTogglingId(deadlineId);
    api
      .patch(`/deadlines/${deadlineId}/complete`)
      .then(() => {
        loadGroup();
        loadAnalytics();
      })
      .finally(() => setTogglingId(null));
  };

  const formatTimeLeft = () => {
    if (!pomodoro.running || !pomodoro.start_time) {
      const mins = Math.floor(pomodoro.duration / 60);
      const secs = pomodoro.duration % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    const elapsed = Math.floor((Date.now() - new Date(pomodoro.start_time).getTime()) / 1000);
    const remaining = Math.max(pomodoro.duration - elapsed, 0);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
        <p className="text-slate-400">Group not found.</p>
        <Link to="/dashboard" className="text-yellow-400 text-sm mt-4 inline-block">
          &larr; Back to dashboard
        </Link>
      </div>
    );
  }

  const sortedDeadlines = [...group.deadlines].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );
  const completedCount = group.deadlines.filter((d) => d.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 p-8">
      <Link
        to="/dashboard"
        className="text-slate-400 hover:text-yellow-400 text-sm inline-flex items-center gap-1 mb-6 transition"
      >
        &larr; Back to dashboard
      </Link>

      <GroupTabs groupId={group.id} groupName={group.name} subject={group.subject} />
      <p className="text-slate-400 text-sm mb-10 max-w-xl">
        {group.description || "No description"}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{group.members.length}</p>
          <p className="text-slate-400 text-sm mt-1">Members</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{group.deadlines.length}</p>
          <p className="text-slate-400 text-sm mt-1">Deadlines</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">{completedCount}</p>
          <p className="text-slate-400 text-sm mt-1">Completed</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">
            {analytics ? `${analytics.completion_rate}%` : " "}
          </p>
          <p className="text-slate-400 text-sm mt-1">Completion rate</p>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5">
          <p className="text-3xl font-bold text-yellow-400">
            {analytics ? analytics.current_streak : " "}
            <span className="text-base text-slate-400 font-normal"> days</span>
          </p>
          <p className="text-slate-400 text-sm mt-1">Current streak</p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">Group Pomodoro</p>
          <p className="text-4xl font-bold text-yellow-400 tabular-nums">{formatTimeLeft()}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => sendPomodoroAction(pomodoro.running ? "pause" : "start", pomodoro.duration)}
            className="bg-yellow-400 text-slate-900 font-semibold rounded-lg px-5 py-2 text-sm hover:bg-yellow-300 transition"
          >
            {pomodoro.running ? "Pause" : "Start"}
          </button>
          <button
            onClick={() => sendPomodoroAction("reset", 1500)}
            className="border border-white/10 rounded-lg px-5 py-2 text-sm hover:bg-white/10 transition"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Deadlines</h2>
            {isAdminPlus && (
              <button
                onClick={() => setShowDeadlineModal(true)}
                className="bg-yellow-400 text-slate-900 font-semibold rounded-lg px-6 py-3 hover:bg-yellow-300 transition"
              >
                + New Deadline
              </button>
            )}
          </div>

          {sortedDeadlines.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center text-slate-400">
              No deadlines yet for this group.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sortedDeadlines.map((d) => (
                <div
                  key={d.id}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-yellow-400/30 transition"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleComplete(d.id, d.completed)}
                      disabled={d.completed || togglingId === d.id}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        d.completed
                          ? "bg-yellow-400 border-yellow-400 cursor-default"
                          : "border-white/30 hover:border-yellow-400 cursor-pointer"
                      } ${togglingId === d.id ? "opacity-50" : ""}`}
                    >
                      {d.completed && (
                        <span className="text-slate-900 text-xs font-bold">&#10003;</span>
                      )}
                    </button>
                    <div>
                      <p
                        className={`font-medium text-sm ${
                          d.completed ? "line-through text-slate-500" : ""
                        }`}
                      >
                        {d.title}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        Due {new Date(d.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Members</h2>
            {isAdminPlus && (
              <button
                onClick={() => setShowMemberModal(true)}
                className="border border-white/10 rounded-lg px-4 py-2 text-xs hover:bg-white/10 transition"
              >
                + Add
              </button>
            )}
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-5 flex flex-col gap-3">
            {group.members.length === 0 ? (
              <p className="text-slate-400 text-sm">No members yet.</p>
            ) : (
              group.members.map((m) => (
                <div
                  key={m.id}
                  className="bg-white/5 rounded-lg p-4 flex items-center gap-3 border border-white/5"
                >
                  <div className="relative w-9 h-9 shrink-0">
                    <div className="w-9 h-9 rounded-full bg-yellow-400 text-slate-900 font-bold flex items-center justify-center text-sm">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    {onlineUsers.includes(String(m.user_id)) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{m.name}</p>
                      <span className="text-[10px] uppercase tracking-wide text-slate-500 border border-white/10 rounded-full px-2 py-0.5">{m.role}</span>
                    </div>
                    <p className="text-slate-500 text-xs">{m.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showDeadlineModal && (
        <NewDeadlineModal
          groupId={group.id}
          onClose={() => setShowDeadlineModal(false)}
          onCreated={() => {
            loadGroup();
            loadAnalytics();
          }}
        />
      )}

      <ResourcesSection groupId={group.id} currentMemberId={group.members.find((m) => m.user_id !== null)?.id ?? null} />

      {showMemberModal && (
        <NewMemberModal
          groupId={group.id}
          onClose={() => setShowMemberModal(false)}
          onCreated={loadGroup}
        />
      )}
    </div>
  );
}
