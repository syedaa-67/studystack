import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import GroupTabs from "../components/GroupTabs";

interface Deadline {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
}

const MONTHS = ["Jan","Feb","March","April","May","June","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["var(--bg-card-yellow)", "var(--bg-card-pink)", "var(--bg-card-sage)", "var(--bg-card-blue)"];

export default function CalendarPage() {
  const { id } = useParams();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [groupInfo, setGroupInfo] = useState<{ name: string; subject: string } | null>(null);
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());

  useEffect(() => {
    if (!id) return;
    api.get(`/study-groups/${id}`).then((res) => {
      setGroupInfo({ name: res.data.name, subject: res.data.subject });
      setDeadlines(res.data.deadlines || []);
    });
  }, [id]);

  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const deadlinesByDay: Record<number, Deadline[]> = {};
  deadlines.forEach((d) => {
    const due = new Date(d.due_date);
    if (due.getMonth() === monthIndex && due.getFullYear() === year) {
      const day = due.getDate();
      if (!deadlinesByDay[day]) deadlinesByDay[day] = [];
      deadlinesByDay[day].push(d);
    }
  });

  const cardStyle: React.CSSProperties = { background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card)" };

  return (
    <div style={{ background: "var(--bg-app)", color: "var(--text-primary)", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {groupInfo && <GroupTabs groupId={id!} groupName={groupInfo.name} subject={groupInfo.subject} />}

        <div style={{ ...cardStyle, padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Deadline Calendar</h2>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {MONTHS.map((m, i) => (
              <button
                key={m}
                onClick={() => setMonthIndex(i)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: monthIndex === i ? "var(--text-primary)" : "var(--bg-app)",
                  color: monthIndex === i ? "var(--bg-app)" : "var(--text-secondary)"
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dayDeadlines = deadlinesByDay[day] || [];
            const date = new Date(year, monthIndex, day);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            return (
              <div key={day} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{ width: "28px", fontWeight: 700, fontSize: "0.9rem", paddingTop: "0.6rem", flexShrink: 0, textAlign: "center" }}>{day}</div>
                <div style={{ flex: 1, display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {dayDeadlines.length === 0 ? (
                    <div style={{ ...cardStyle, padding: "0.6rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem", width: "100%" }}>
                      {isWeekend ? "Weekend" : "No deadlines"}
                    </div>
                  ) : (
                    dayDeadlines.map((d, idx) => (
                      <div key={d.id} style={{ background: COLORS[idx % COLORS.length], borderRadius: "var(--radius-card)", padding: "0.75rem 1rem", minWidth: "220px" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>{d.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-primary)", opacity: 0.7 }}>{new Date(d.due_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        <div style={{ marginTop: "0.4rem", fontSize: "0.7rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "var(--bg-card)", color: "var(--text-primary)", display: "inline-block" }}>
                          {d.completed ? "Confirmed" : "Pending"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
