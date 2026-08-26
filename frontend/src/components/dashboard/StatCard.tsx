import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent: "yellow" | "pink" | "sage" | "blue";
}

const bgMap: Record<StatCardProps["accent"], string> = {
  yellow: "var(--bg-card-yellow)",
  pink: "var(--bg-card-pink)",
  sage: "var(--bg-card-sage)",
  blue: "var(--bg-card-blue)",
};

export default function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div
      className="p-5 flex flex-col justify-between transition-all duration-300 "
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
        borderRadius: "var(--radius-card)",
      }}
    >
      <div className="flex items-center justify-between mb-3 ">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center "
          style={{ background: bgMap[accent], color: "var(--text-primary)" }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold " style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="text-sm " style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}
