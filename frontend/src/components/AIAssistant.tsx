import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { askAssistant } from "../api/assistant";

interface Props {
  pageContext: string;
  pageData?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function AIAssistant({ pageContext, pageData = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    const q = question.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);
    setError("");
    try {
      const answer = await askAssistant(q, pageContext, pageData);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch {
      setError("Couldn't reach the AI assistant right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-yellow-400 text-slate-900 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <MessageSquarePlus className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-80 max-w-[calc(100vw-2rem)] bg-[color:var(--bg-card)] border border-[color:var(--border-subtle)] rounded-xl shadow-2xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-yellow-400">Ask Study AI</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              {"\u2715"}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto mb-2 flex flex-col gap-2">
            {messages.length === 0 && (
              <p className="text-[color:var(--text-muted)] text-xs">
                Ask me to explain what's on this page, or how to navigate the app.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-xs p-2 rounded-lg whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-yellow-400/20 text-yellow-100 self-end"
                    : "bg-[color:var(--bg-app)] text-[color:var(--text-secondary)] border border-[color:var(--border-subtle)]"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
              placeholder="Ask a question..."
              className="flex-1 bg-[color:var(--bg-app)] border border-[color:var(--border-subtle)] rounded-lg p-2 text-sm text-[color:var(--text-primary)] focus:outline-none focus:border-yellow-400/50"
            />
            <button
              onClick={handleAsk}
              disabled={loading}
              className="px-3 py-2 bg-yellow-400/20 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-400/30 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Ask"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
