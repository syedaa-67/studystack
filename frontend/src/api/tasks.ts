import api from "./client";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface TaskRead {
  id: number;
  group_id: number;
  title: string;
  description: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberContributionSummary {
  member_id: number;
  member_name: string;
  total_tasks: number;
  done: number;
  in_progress: number;
  todo: number;
  percent_complete: number;
}

export function listTasks(groupId: number | string) {
  return api.get<TaskRead[]>(`/study-groups/${groupId}/tasks`).then((r) => r.data);
}

export function createTask(groupId: number | string, payload: {
  title: string;
  description?: string | null;
  assigned_to?: number | null;
  due_date?: string | null;
}) {
  return api.post<TaskRead>(`/study-groups/${groupId}/tasks`, payload).then((r) => r.data);
}

export function updateTaskStatus(groupId: number | string, taskId: number, status: TaskStatus) {
  return api
    .patch<TaskRead>(`/study-groups/${groupId}/tasks/${taskId}/status`, { status })
    .then((r) => r.data);
}

export function getTaskContributions(groupId: number | string) {
  return api
    .get<MemberContributionSummary[]>(`/study-groups/${groupId}/tasks/contributions`)
    .then((r) => r.data);
}
