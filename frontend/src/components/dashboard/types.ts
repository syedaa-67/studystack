export interface LeaderboardEntry {
  member_id: number;
  member_name: string;
  role: string;
  points: number;
  badges: string[];
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

export interface DeadlineInGroup {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
  completed_at: string | null;
  assigned_to_id: number | null;
}

export interface MemberInGroup {
  id: number;
  name: string;
  email: string;
  user_id: number | null;
  role: string;
}

export interface BadgeDef {
  name: string;
  icon: string;
  description: string;
  progressOf: "deadlines" | "streak" | "resources";
  target: number;
}

export const BADGE_CATALOG: BadgeDef[] = [
  { name: "First Deadline", icon: "\u2705", description: "Complete your first deadline", progressOf: "deadlines", target: 1 },
  { name: "5 Completed", icon: "\u{1F3C6}", description: "Complete 5 deadlines", progressOf: "deadlines", target: 5 },
  { name: "7-Day Streak", icon: "\u{1F525}", description: "7-day completion streak", progressOf: "streak", target: 7 },
  { name: "Resource Contributor", icon: "\u{1F4DA}", description: "Add 3 resources", progressOf: "resources", target: 3 },
];
