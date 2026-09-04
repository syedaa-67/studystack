
interface GroupMiniHeaderProps {
  groupName: string;
  memberCount: number;
  completionRate: number; // 0-100, from analytics.completion_rate
}

export default function GroupMiniHeader({
  groupName,
  memberCount,
  completionRate,
}: GroupMiniHeaderProps) {
  return (
    <div
      className="sticky z-30 flex items-center justify-between gap-2 px-4 py-2 mb-4 rounded-xl2 border flex-wrap"
      style={{
        top: "0px",
        background: "var(--bg-panel)",
        borderColor: "var(--border-hover)",
        backdropFilter: "blur(6px)",
      }}
    >
      <span
        className="font-semibold"
        style={{ color: "var(--text-primary)", minWidth: 0 }}
      >
        {groupName}
      </span>

      <div className="flex items-center gap-4 text-sm shrink-0" style={{ color: "var(--text-muted)" }}>
        <span>{memberCount} member{memberCount === 1 ? "" : "s"}</span>
        <span>{completionRate}% complete</span>
      </div>
    </div>
  );
}
