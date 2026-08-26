import { useState } from "react";
import api from "../api/client";

interface Props {
  groupId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewMemberModal({ groupId, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    api
      .post("/members/", {
        name: name.trim(),
        email: email.trim(),
        group_id: groupId,
      })
      .then(() => {
        onCreated();
        onClose();
      })
      .catch(() => setError("Failed to add member. Try again."))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-slate-800/95 backdrop-blur-lg border border-white/10 text-slate-100 rounded-xl p-6 w-full max-w-md min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h3 className="text-lg font-bold min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Add Member</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div>
            <label className="text-xs text-slate-400 mb-1 block min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-400/50 transition min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-400/50 transition min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
            />
          </div>

          {error && <p className="text-red-400 text-xs min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-yellow-400 text-slate-900 font-semibold rounded-lg px-6 py-3 mt-2 hover:bg-yellow-300 transition disabled:opacity-50 min-h-screen w-full overflow-x-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
          >
            {submitting ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
