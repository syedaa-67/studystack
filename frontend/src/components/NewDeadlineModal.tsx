import { useState } from "react";
import api from "../api/client";

interface Props {
  groupId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewDeadlineModal({ groupId, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError("Title and due date are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    api
      .post("/deadlines/", {
        title: title.trim(),
        due_date: new Date(dueDate).toISOString(),
        group_id: groupId,
      })
      .then(() => {
        onCreated();
        onClose();
      })
      .catch(() => setError("Failed to create deadline. Try again."))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 backdrop-blur-lg border border-white/10 text-slate-100 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">New Deadline</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Review"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-400/50 transition"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-yellow-400/50 transition [color-scheme:dark]"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-400 text-slate-900 font-semibold rounded-lg px-6 py-3 mt-2 hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Deadline"}
          </button>
        </form>
      </div>
    </div>
  );
}
