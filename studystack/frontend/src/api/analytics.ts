import api from "./client";

export interface TrendPoint {
  period: string;
  completed_count: number;
}

export interface MemberContribution {
  member_id: number;
  member_name: string;
  completed_count: number;
}

export interface AnalyticsResponse {
  total_deadlines: number;
  completed_deadlines: number;
  completion_rate: number;
  weekly_trend: TrendPoint[];
  member_contributions: MemberContribution[];
  current_streak: number;
  longest_streak: number;
}

export function fetchAnalytics(groupId: string | number) {
  return api.get<AnalyticsResponse>(`/study-groups/${groupId}/analytics`).then((res) => res.data);
}
