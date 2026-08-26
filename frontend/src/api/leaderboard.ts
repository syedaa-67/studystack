import api from "./client";
import type { LeaderboardResponse } from "../components/dashboard/types";

export function fetchLeaderboard(groupId: string | number) {
  return api
    .get<LeaderboardResponse>(`/study-groups/${groupId}/leaderboard`)
    .then((res) => res.data);
}
