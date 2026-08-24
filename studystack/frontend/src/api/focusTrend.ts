import api from "./client";

export interface FocusTrendPoint {
  day: string;
  date: string;
  minutes: number;
}

export interface FocusTrendResponse {
  trend: FocusTrendPoint[];
}

export function fetchFocusTrend(groupId: string | number) {
  return api
    .get<FocusTrendResponse>(`/study-groups/${groupId}/focus-trend`)
    .then((res) => res.data);
}
