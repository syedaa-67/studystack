import React, { useState } from "react";
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
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">New Study Group</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none transition-colors"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Group Name</label>
            <input
              type="text"
              placeholder="e.g. Organic Chemistry Prep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Subject</label>
            <input
              type="text"
              placeholder="e.g. Chemistry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Description (optional)</label>
            <textarea
              placeholder="What is this study group working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-yellow-400 text-slate-950 font-bold rounded-lg px-6 py-3 mt-2 hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}