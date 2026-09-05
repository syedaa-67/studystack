import { useEffect, useRef, useState } from "react";
import { fetchNotifications, markNotificationRead } from "../api/notifications";
import type { Notification } from "../api/notifications";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    fetchNotifications().then(setNotifications).catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: number) => {
    markNotificationRead(id).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    });
  };

  return (
    <div className="relative " ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative border border-white/10 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/10 transition text-slate-200 "
      >
        {"\u{1F514}"}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-slate-800/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50 ">
          {notifications.length === 0 ? (
            <p className="text-slate-400 text-sm p-4 ">No notifications.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${
                  n.read ? "opacity-50" : ""
                }`}
              >
                <p className="text-sm text-slate-100 ">{n.message}</p>
                <p className="text-slate-500 text-xs mt-1 ">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
