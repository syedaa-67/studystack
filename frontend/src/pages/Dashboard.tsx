import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import NewGroupModal from "../components/NewGroupModal";

interface StudyGroup {
  id: number;
  name: string;
  subject: string;
  description: string | null;
  created_at: string;
}

interface Deadline {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
  group_id: number;
}

export default function Dashboard() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const loadData = () => {
    Promise.all([api.get("/study-groups/"), api.get("/deadlines/")])
      .then(([groupsRes, deadlinesRes]) => {
        setGroups(groupsRes.data);
        setDeadlines(deadlinesRes.data);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const upcoming = deadlines
    .filter((d) => !d.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-dark text-white p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">
          Study<span className="text-brand">Stack</span>
        </h1>
        <button
          onClick={handleLogout}
          className="border border-white/20 rounded-full px-5 py-2 text-sm hover:bg-white hover:text-dark transition"
        >
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-panel rounded-xl2 p-5">
          <p className="text-3xl font-bold text-brand">{groups.length}</p>
          <p className="text-gray-400 text-sm mt-1">Study Groups</p>
        </div>
        <div className="bg-panel rounded-xl2 p-5">
          <p className="text-3xl font-bold text-brand">{deadlines.length}</p>
          <p className="text-gray-400 text-sm mt-1">Total Deadlines</p>
        </div>
        <div className="bg-panel rounded-xl2 p-5">
          <p className="text-3xl font-bold text-brand">{upcoming.length}</p>
          <p className="text-gray-400 text-sm mt-1">Upcoming</p>
        </div>
        <div className="bg-panel rounded-xl2 p-5">
          <p className="text-3xl font-bold text-brand">
            {deadlines.filter((d) => d.completed).length}
          </p>
          <p className="text-gray-400 text-sm mt-1">Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Study Groups</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-brand text-dark font-semibold rounded-full px-6 py-3 hover:opacity-90"
            >
              + New Group
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : groups.length === 0 ? (
            <div className="bg-panel rounded-xl2 p-8 text-center text-gray-400">
              No study groups yet. Create your first one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-card rounded-xl2 p-6 flex flex-col gap-2 hover:-translate-y-1 transition cursor-pointer border border-white/5"
                >
                  <span className="bg-brand text-dark text-xs font-semibold w-fit px-3 py-1 rounded-full">
                    {group.subject}
                  </span>
                  <h3 className="text-lg font-bold mt-2">{group.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {group.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6">Upcoming Deadlines</h2>
          <div className="bg-panel rounded-xl2 p-5 flex flex-col gap-3">
            {upcoming.length === 0 ? (
              <p className="text-gray-400 text-sm">No upcoming deadlines.</p>
            ) : (
              upcoming.map((d) => (
                <div
                  key={d.id}
                  className="bg-card rounded-xl p-4 flex justify-between items-center border border-white/5"
                >
                  <div>
                    <p className="font-medium text-sm">{d.title}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(d.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-brand"></span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <NewGroupModal
          onClose={() => setShowModal(false)}
          onCreated={loadData}
        />
      )}
    </div>
  );
}
