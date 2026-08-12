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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white text-dark rounded-xl2 p-8 w-full max-w-md flex flex-col gap-4"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">New Study Group</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-dark text-xl leading-none"
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
          className="border rounded-full px-4 py-3 outline-none focus:border-brand"
        />
        <input
          type="text"
          placeholder="Subject (e.g. Chemistry)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="border rounded-full px-4 py-3 outline-none focus:border-brand"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded-2xl px-4 py-3 outline-none focus:border-brand resize-none"
          rows={3}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-dark font-semibold rounded-full py-3 mt-2 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}
