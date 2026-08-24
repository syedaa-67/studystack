import api from "./client";

export interface ResourceRead {
  id: number;
  group_id: number;
  title: string;
  resource_type: "link" | "note" | "file";
  created_by_id: number | null;
  created_at: string;
  current_version_number: number;
  current_content: string;
  current_file_path: string | null;
}

export interface ResourceVersionRead {
  id: number;
  version_number: number;
  content: string;
  file_path: string | null;
  change_summary: string | null;
  created_by_id: number | null;
  created_at: string;
}

export interface ResourceCommentRead {
  id: number;
  member_id: number | null;
  content: string;
  created_at: string;
}

export interface ResourceDetail extends ResourceRead {
  versions: ResourceVersionRead[];
  comments: ResourceCommentRead[];
}

export interface DiffLine {
  type: "equal" | "added" | "removed";
  text: string;
}

export interface DiffResponse {
  from_version: number;
  to_version: number;
  lines: DiffLine[];
}

export function listResources(groupId: number | string) {
  return api.get<ResourceRead[]>(`/resources/group/${groupId}`).then((r) => r.data);
}

export function getResource(id: number) {
  return api.get<ResourceDetail>(`/resources/${id}`).then((r) => r.data);
}

export function createResource(payload: {
  group_id: number;
  title: string;
  resource_type: "link" | "note";
  content: string;
  created_by_id?: number | null;
}) {
  return api.post<ResourceRead>("/resources/", payload).then((r) => r.data);
}

export function uploadFileResource(groupId: number, title: string, file: File, createdById?: number | null) {
  const form = new FormData();
  form.append("group_id", String(groupId));
  form.append("title", title);
  if (createdById) form.append("created_by_id", String(createdById));
  form.append("file", file);
  return api
    .post<ResourceRead>("/resources/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
}

export function updateResource(id: number, content: string, changeSummary: string, editedById?: number | null) {
  return api
    .patch<ResourceRead>(`/resources/${id}`, { content, change_summary: changeSummary, edited_by_id: editedById })
    .then((r) => r.data);
}

export function rollbackResource(id: number, versionNumber: number) {
  return api.post<ResourceRead>(`/resources/${id}/rollback/${versionNumber}`).then((r) => r.data);
}

export function diffVersions(id: number, fromVersion: number, toVersion: number) {
  return api.get<DiffResponse>(`/resources/${id}/diff/${fromVersion}/${toVersion}`).then((r) => r.data);
}

export function addComment(id: number, content: string, memberId?: number | null) {
  const params = memberId ? `?member_id=${memberId}` : "";
  return api.post<ResourceCommentRead>(`/resources/${id}/comments${params}`, { content }).then((r) => r.data);
}

export function deleteResource(id: number) {
  return api.delete(`/resources/${id}`);
}

export const fileUrl = (path: string) => `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/uploads/${path}`;

export function summarizeResource(id: number) {
  return api
    .post<{ summary: string }>(`/ai/resources/${id}/summarize`)
    .then((r) => r.data.summary);
}

