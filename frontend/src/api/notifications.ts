import api from "./client";

export interface Notification {
  id: number;
  deadline_id: number | null;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function fetchNotifications(unreadOnly = false) {
  return api
    .get<Notification[]>(`/notifications/${unreadOnly ? "?unread_only=true" : ""}`)
    .then((res) => res.data);
}

export function markNotificationRead(id: number) {
  return api.patch<Notification>(`/notifications/${id}/read`).then((res) => res.data);
}
