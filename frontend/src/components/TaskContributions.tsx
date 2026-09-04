import { useEffect, useState } from "react";
import { listTasks, getTaskContributions, updateTaskStatus, createTask } from "../api/tasks";
import type { TaskRead, MemberContributionSummary } from "../api/tasks";

interface Member {
  id: number;
  name: string;
}

interface Props {
  groupId: number;
  members: Member[];
  currentMemberId: number | null;
}

const BAR_COLOR = "var(--accent-yellow)";

export default function TaskContributions({ groupId, members }: Props) {
  const [tasks, setTasks] = useState<TaskRead[]>([]);
  const [summaries, setSummaries] = useState<MemberContributionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<number | "">("");

  const load = () => {
    Promise.all([listTasks(groupId), getTaskContributions(groupId)])
      .then(([t, s]) => {
        setTasks(t);
        setSummaries(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [groupId]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    createTask(groupId, {
      title: newTitle.trim(),
      assigned_to: newAssignee === "" ? null : Number(newAssignee),
    }).then(() => {
      setNewTitle("");
      setNewAssignee("");
      load();
    });
  };

  const cycleStatus = (task: TaskRead) => {
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    updateTaskStatus(groupId, task.id, next).then(load);
  };

  const statusLabel = (s: string) => (s === "todo" ? "To-do" : s === "in_progress" ? "In progress" : "Done");
  const statusColor = (s: string) =>
    s === "done" ? "var(--bg-card-sage)" : s === "in_progress" ? "var(--bg-card-yellow)" : "var(--bg-app)";

  if (loading) return null;

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Task Progress</h3><span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.1rem 0.5rem", borderRadius: "9999px", background: "var(--accent-yellow)", color: "#000" }}>{tasks.length}</span></div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {summaries.map((s) => (
          <div key={s.member_id}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              <span style={{ fontWeight: 600 }}>{s.member_name}</span>
              <span style={{ color: "var(--text-secondary)" }}>{s.done}/{s.total_tasks} done ({s.percent_complete}%)</span>
            </div>
            <div style={{ height: "8px", borderRadius: "4px", background: "var(--bg-app)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${s.percent_complete}%`, background: BAR_COLOR, transition: "width 0.3s ease" }} />
            </div>
          </div>
        ))}
        {summaries.length === 0 && (
          <div style={{ textAlign: "center", padding: "1.5rem 0.5rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{"\u2705"}</div>
            <p style={{ fontSize: "0.85rem" }}>No tasks yet — add one below to track group progress.</p>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {tasks.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", background: statusColor(t.status) }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t.title}</span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{t.assigned_to_name || "Unassigned"}</span>
            </div>
            <button
              onClick={() => cycleStatus(t)}
              style={{ fontSize: "0.7rem", fontWeight: 600, border: "1px solid var(--border-subtle)", borderRadius: "0.4rem", padding: "0.3rem 0.6rem", background: "transparent", cursor: "pointer" }}
            >
              {statusLabel(t.status)}
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task title"
          style={{ flex: "1 1 140px", minWidth: 0, background: "var(--bg-app)", border: "1px solid var(--border-subtle)", borderRadius: "0.4rem", padding: "0.4rem 0.6rem", fontSize: "0.8rem", color: "var(--text-primary)" }}
        />
        <select
          value={newAssignee}
          onChange={(e) => setNewAssignee(e.target.value === "" ? "" : Number(e.target.value))}
          style={{ background: "var(--bg-app)", border: "1px solid var(--border-subtle)", borderRadius: "0.4rem", padding: "0.4rem 0.6rem", fontSize: "0.8rem", color: "var(--text-primary)" }}
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          style={{ background: "var(--accent-yellow)", color: "#000", border: "none", borderRadius: "0.4rem", padding: "0.4rem 0.9rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
