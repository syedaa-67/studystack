import { useState } from "react";
import api from "../api/client";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function NewGroupModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/study-groups/", { name, subject, description });
      onCreated();
      onClose();
    } catch (err) {
      setError("Could not create group. Are you logged in?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/95 backdrop-blur-lg border border-white/10 text-slate-100 rounded-xl p-8 w-full max-w-md flex flex-col gap-4"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">New Study Group</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <input
          type="text"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-400/50 text-slate-100 placeholder:text-slate-500"
        />
        <input
          type="text"
          placeholder="Subject (e.g. Chemistry)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-400/50 text-slate-100 placeholder:text-slate-500"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-400/50 text-slate-100 placeholder:text-slate-500 resize-none"
          rows={3}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-yellow-400 text-slate-900 font-semibold rounded-lg py-3 mt-2 hover:bg-yellow-300 disabled:opacity-50 transition"
        >
          {saving ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}
