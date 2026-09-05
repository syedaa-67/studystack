import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import NewGroupModal from "../components/NewGroupModal";
import NotificationBell from "../components/NotificationBell";

interface Group {
  id: number;
  name: string;
  subject?: string;
  description?: string;
  [key: string]: any;
}

interface Deadline {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
  [key: string]: any;
}

export default function Dashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const loadData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const headers = { Authorization: "Bearer " + token };
      const groupsRes = await axios.get(API_URL + "/study-groups/", { headers });
      const deadlinesRes = await axios.get(API_URL + "/deadlines/", { headers });
      
      setGroups(groupsRes.data);
      setDeadlines(deadlinesRes.data);
      console.log("Groups loaded:", groupsRes.data);
      console.log("Deadlines loaded:", deadlinesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const upcoming = deadlines
    .filter((d) => !d.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  if (loading) {
    return <div style={{ background: "var(--bg-app)", color: "var(--text-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6" style={{ background: "var(--bg-app)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "bold" }}>
          Study<span style={{ color: "var(--accent-yellow)" }}>Stack</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ThemeSwitcher />
          <NotificationBell />
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              border: "1px solid var(--border-subtle)",
              borderRadius: "0.5rem",
              background: "transparent",
              color: "var(--text-primary)",
              cursor: "pointer"
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "var(--bg-card-yellow)", padding: "1.25rem", borderRadius: "var(--radius-card)" }}>
          <p style={{ fontSize: "1.875rem", fontWeight: "bold" }}>{groups.length}</p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Study Groups</p>
        </div>
        <div style={{ background: "var(--bg-card-pink)", padding: "1.25rem", borderRadius: "var(--radius-card)" }}>
          <p style={{ fontSize: "1.875rem", fontWeight: "bold" }}>{deadlines.length}</p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Total Deadlines</p>
        </div>
        <div style={{ background: "var(--bg-card-blue)", padding: "1.25rem", borderRadius: "var(--radius-card)" }}>
          <p style={{ fontSize: "1.875rem", fontWeight: "bold" }}>{upcoming.length}</p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Upcoming</p>
        </div>
        <div style={{ background: "var(--bg-card-sage)", padding: "1.25rem", borderRadius: "var(--radius-card)" }}>
          <p style={{ fontSize: "1.875rem", fontWeight: "bold" }}>{deadlines.filter((d) => d.completed).length}</p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Completed</p>
        </div>
      </div>

      {/* Groups and Deadlines */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", minWidth: 0 }}>Your Study Groups</h2>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: "0.75rem 1.5rem",
                fontWeight: "600",
                borderRadius: "0.5rem",
                background: "var(--accent-yellow)",
                color: "#000",
                border: "none",
                cursor: "pointer"
              }}
            >
              + New Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div style={{ background: "var(--bg-card)", padding: "2rem", textAlign: "center", borderRadius: "var(--radius-card)" }}>
              <p style={{ color: "var(--text-secondary)" }}>No study groups yet. Create your first one.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => navigate("/groups/" + group.id)}
                  style={{
                    background: "var(--bg-card)",
                    padding: "1.5rem",
                    borderRadius: "var(--radius-card)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    transition: "transform 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", background: "var(--accent-yellow)", color: "#000", padding: "0.25rem 0.75rem", borderRadius: "9999px", whiteSpace: "nowrap", display: "inline-block", width: "fit-content", maxWidth: "100%" }}>
                    {group.subject}
                  </span>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", marginTop: "0.5rem" }}>{group.name}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{group.description || "No description"}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1.5rem" }}>Upcoming Deadlines</h2>
          <div style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "var(--radius-card)", border: "1px solid var(--border-subtle)" }}>
            {upcoming.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>No upcoming deadlines.</p>
            ) : (
              upcoming.map((d) => (
                <div key={d.id} style={{ background: "var(--bg-card-blue)", padding: "0.75rem", borderRadius: "16px", marginBottom: "0.5rem" }}>
                  <p style={{ fontWeight: "500", fontSize: "0.875rem" }}>{d.title}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {new Date(d.due_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      </div>
      {showModal && <NewGroupModal onClose={() => setShowModal(false)} onCreated={loadData} />}
    </div>
  );
}

