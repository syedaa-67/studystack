import { useEffect, useState } from "react";
import {
  getResource,
  diffVersions,
  rollbackResource,
  addComment,
  fileUrl,
  summarizeResource,
} from "../api/resources";
import type { ResourceDetail, DiffLine } from "../api/resources";

interface Props {
  resourceId: number;
  memberId: number | null;
  onClose: () => void;
  onChanged: () => void;
}

export default function ResourceDetailModal({ resourceId, memberId, onClose, onChanged }: Props) {
  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [compareFrom, setCompareFrom] = useState<number | null>(null);
  const [compareTo, setCompareTo] = useState<number | null>(null);
  const [diffLines, setDiffLines] = useState<DiffLine[] | null>(null);
  const [commentText, setCommentText] = useState("");
  const [rollingBack, setRollingBack] = useState<number | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const load = () => {
    getResource(resourceId).then((r) => {
      setResource(r);
      setLoading(false);
      if (r.versions.length >= 2) {
        setCompareFrom(r.versions[1].version_number);
        setCompareTo(r.versions[0].version_number);
      }
    });
  };

  useEffect(() => {
    load();
  }, [resourceId]);

  useEffect(() => {
    if (compareFrom != null && compareTo != null && compareFrom !== compareTo) {
      diffVersions(resourceId, compareFrom, compareTo).then((d) => setDiffLines(d.lines));
    } else {
      setDiffLines(null);
    }
  }, [compareFrom, compareTo]);

  const handleRollback = async (versionNumber: number) => {
    setRollingBack(versionNumber);
    await rollbackResource(resourceId, versionNumber);
    load();
    onChanged();
    setRollingBack(null);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(resourceId, commentText, memberId);
    setCommentText("");
    load();
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    setSummaryError("");
    try {
      const result = await summarizeResource(resourceId);
      setSummary(result);
    } catch {
      setSummaryError("Couldn't generate a summary right now.");
    } finally {
      setSummarizing(false);
    }
  };

  if (loading || !resource) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-lg border border-white/10 text-slate-100 rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="bg-yellow-400 text-slate-900 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {resource.resource_type}
            </span>
            <h2 className="text-2xl font-bold mt-2">{resource.title}</h2>
            <p className="text-slate-500 text-xs mt-1">
              Current version v{resource.current_version_number}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">
            {"\u2715"}
          </button>
        </div>

        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          {resource.resource_type === "link" ? (
            <a
              href={resource.current_content}
              target="_blank"
              rel="noreferrer"
              className="text-yellow-400 break-all hover:underline"
            >
              {resource.current_content}
            </a>
          ) : resource.resource_type === "file" ? (
            <a
              href={fileUrl(resource.current_file_path ?? "")}
              target="_blank"
              rel="noreferrer"
              className="text-yellow-400 hover:underline"
            >
              &darr; {resource.current_content}
            </a>
          ) : (
            <p className="text-slate-200 whitespace-pre-wrap text-sm">{resource.current_content}</p>
          )}
        </div>

        {resource.resource_type !== "file" && (
          <div>
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="bg-yellow-400 text-slate-900 font-semibold rounded-lg px-5 py-2 text-sm hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {summarizing ? "Summarizing..." : "Summarize with AI"}
            </button>
            {summaryError && <p className="text-red-400 text-sm mt-2">{summaryError}</p>}
            {summary && (
              <div className="bg-white/5 rounded-lg p-4 border border-yellow-400/20 mt-3">
                <p className="text-yellow-400 text-xs font-semibold mb-2">AI Summary</p>
                <p className="text-slate-200 whitespace-pre-wrap text-sm">{summary}</p>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-3">Version history</h3>
          <div className="flex flex-col gap-2">
            {resource.versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/5"
              >
                <div>
                  <p className="text-sm font-medium">
                    v{v.version_number}{" "}
                    {v.version_number === resource.current_version_number && (
                      <span className="text-yellow-400 text-xs">(current)</span>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {v.change_summary} &middot; {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
                {v.version_number !== resource.current_version_number && (
                  <button
                    onClick={() => handleRollback(v.version_number)}
                    disabled={rollingBack !== null}
                    className="text-xs border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/10 transition disabled:opacity-50"
                  >
                    {rollingBack === v.version_number ? "Rolling back..." : "Rollback to this"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {resource.versions.length >= 2 && resource.resource_type !== "file" && (
          <div>
            <h3 className="font-semibold mb-3">Compare versions</h3>
            <div className="flex gap-3 mb-3">
              <select
                value={compareFrom ?? ""}
                onChange={(e) => setCompareFrom(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                {resource.versions.map((v) => (
                  <option key={v.version_number} value={v.version_number}>
                    v{v.version_number}
                  </option>
                ))}
              </select>
              <span className="self-center text-slate-500">&rarr;</span>
              <select
                value={compareTo ?? ""}
                onChange={(e) => setCompareTo(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                {resource.versions.map((v) => (
                  <option key={v.version_number} value={v.version_number}>
                    v{v.version_number}
                  </option>
                ))}
              </select>
            </div>
            {diffLines && (
              <div className="bg-white/5 rounded-lg p-4 font-mono text-xs border border-white/5">
                {diffLines.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.type === "added"
                        ? "text-yellow-400"
                        : line.type === "removed"
                        ? "text-red-400 line-through opacity-70"
                        : "text-slate-400"
                    }
                  >
                    {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
                    {line.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-3">Comments</h3>
          <div className="flex flex-col gap-2 mb-3">
            {resource.comments.length === 0 ? (
              <p className="text-slate-500 text-sm">No comments yet.</p>
            ) : (
              resource.comments.map((c) => (
                <div key={c.id} className="bg-white/5 rounded-lg px-4 py-2 border border-white/5">
                  <p className="text-sm">{c.content}</p>
                  <p className="text-slate-500 text-xs mt-1">{new Date(c.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4  py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-yellow-400/50"
            />
            <button
              type="submit"
              className="bg-yellow-400 text-slate-900 font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-300 transition"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
