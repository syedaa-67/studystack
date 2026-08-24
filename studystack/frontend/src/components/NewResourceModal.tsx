import { useState } from "react";
import { createResource, uploadFileResource } from "../api/resources";

interface Props {
  groupId: number;
  createdById: number | null;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewResourceModal({ groupId, createdById, onClose, onCreated }: Props) {
  const [type, setType] = useState<"link" | "note" | "file">("note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      if (type === "file") {
        if (!file) {
          setError("Choose a file to upload.");
          setSubmitting(false);
          return;
        }
        await uploadFileResource(groupId, title, file, createdById);
      } else {
        if (!content.trim()) {
          setError(type === "link" ? "Enter a URL." : "Enter note content.");
          setSubmitting(false);
          return;
        }
        await createResource({ group_id: groupId, title, resource_type: type, content, created_by_id: createdById });
      }
      onCreated();
      onClose();
    } catch {
      setError("Something went wrong creating the resource.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/95 backdrop-blur-lg border border-white/10 text-slate-100 rounded-xl p-6 w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold">New Resource</h2>

        <div className="flex gap-2">
          {(["note", "link", "file"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
                type === t ? "bg-yellow-400 text-slate-900" : "border border-white/10 text-slate-300 hover:border-yellow-400/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-400/50 text-slate-100 placeholder:text-slate-500"
        />

        {type === "note" && (
          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-400/50 text-slate-100 placeholder:text-slate-500 resize-none"
          />
        )}

        {type === "link" && (
          <input
            type="url"
            placeholder="https://..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-yellow-400/50 text-slate-100 placeholder:text-slate-500"
          />
        )}

        {type === "file" && (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-400 file:text-slate-900 file:px-4 file:py-2 file:font-semibold"
          />
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-white/10 rounded-lg py-3 text-sm hover:bg-white/10 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-yellow-400 text-slate-900 font-semibold rounded-lg py-3 text-sm hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
