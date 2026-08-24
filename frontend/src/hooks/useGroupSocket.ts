import { useEffect, useRef, useState, useCallback } from "react";

interface PomodoroState {
  running: boolean;
  duration: number;
  start_time: string | null;
}

export function useGroupSocket(groupId: number | string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    running: false,
    duration: 1500,
    start_time: null,
  });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !groupId) return;

    const apiUrl = import.meta.env.VITE_API_URL || "https://studystack-z2b3.onrender.com";
    const wsUrl = apiUrl.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsUrl}/ws/groups/${groupId}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "presence") {
        setOnlineUsers(data.online_users);
      } else if (data.type === "pomodoro_state") {
        setPomodoro({
          running: data.running,
          duration: data.duration,
          start_time: data.start_time,
        });
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, [groupId]);

  const sendPomodoroAction = useCallback((action: "start" | "pause" | "reset", duration?: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "pomodoro_action", action, duration }));
    }
  }, []);

  return { onlineUsers, pomodoro, sendPomodoroAction };
}
