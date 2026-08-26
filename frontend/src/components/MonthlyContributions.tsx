interface Member {
  id: number;
  name: string;
}
interface Deadline {
  completed: boolean;
  completed_at?: string | null;
  assigned_to_id?: number | null;
}
interface Props {
  members: Member[];
  deadlines: Deadline[];
}

const COLORS = ["var(--bg-card-yellow)", "var(--bg-card-pink)", "var(--bg-card-sage)", "var(--bg-card-blue)"];

export default function MonthlyContributions({ members, deadlines }: Props) {
  const now = new Date();
  const counts: Record<number, number> = {};
  deadlines.forEach((d) => {
    if (!d.completed || !d.completed_at || d.assigned_to_id == null) return;
    const dt = new Date(d.completed_at);
    if (dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()) {
      counts[d.assigned_to_id] = (counts[d.assigned_to_id] || 0) + 1;
    }
  });

  const ranked = members
    .map((m) => ({ member: m, count: counts[m.id] || 0 }))
    .sort((a, b) => b.count - a.count);

  const monthLabel = now.toLocaleString("default", { month: "long" });

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-card)", padding: "1.25rem" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.9rem" }}>{monthLabel} Contributions</h3>
      {ranked.every((r) => r.count === 0) ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No completions yet this month.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {ranked.map((r, idx) => (
            <div key={r.member.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", background: r.count > 0 ? COLORS[idx % COLORS.length] : "var(--bg-app)" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{r.member.name}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
