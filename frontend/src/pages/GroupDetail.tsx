import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import GroupTabs from '../components/GroupTabs';
import NewDeadlineModal from '../components/NewDeadlineModal';
import NewMemberModal from '../components/NewMemberModal';
import ResourcesSection from '../components/ResourcesSection';
import MonthlyContributions from '../components/MonthlyContributions';
import TaskContributions from '../components/TaskContributions';
import { fetchAnalytics } from '../api/analytics';
import type { AnalyticsResponse } from '../api/analytics';
import { useGroupSocket } from '../hooks/useGroupSocket';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  user_id?: number | null;
}

interface Deadline {
  id: number;
  title: string;
  due_date: string;
  completed: boolean;
}

interface Group {
  id: number;
  name: string;
  subject: string;
  description: string | null;
  created_at: string;
  members: Member[];
  deadlines: Deadline[];
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [tick, setTick] = useState(0);

  const { pomodoro, sendPomodoroAction } = useGroupSocket(id ?? '');

  const loadGroup = () => {
    const groupId = Number(id);
    if (isNaN(groupId)) {
      setError(true);
      setLoading(false);
      return;
    }
    api.get(`/study-groups/${groupId}`)
      .then((res) => setGroup(res.data))
      .catch((err) => {
        console.error('Error loading group:', err.message);
        setError(true);
      })
      .finally(() => setLoading(false));
    fetchAnalytics(groupId).then(setAnalytics).catch(() => {});
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  useEffect(() => {
    if (!pomodoro.running) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [pomodoro.running]);

  const formattedTime = useMemo(() => {
    let remaining = pomodoro.duration;
    if (pomodoro.running && pomodoro.start_time) {
      const elapsed = Math.floor((Date.now() - new Date(pomodoro.start_time).getTime()) / 1000);
      remaining = Math.max(pomodoro.duration - elapsed, 0);
    }
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomodoro.running, pomodoro.start_time, pomodoro.duration, tick]);

  const toggleComplete = (deadline: Deadline) => {
    setTogglingId(deadline.id);
    const action = deadline.completed ? 'incomplete' : 'complete';
    api.patch(`/deadlines/${deadline.id}/${action}`)
      .then(() => loadGroup())
      .catch(() => {})
      .finally(() => setTogglingId(null));
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', minHeight: '100vh', padding: '2rem' }}>
        Loading group...
      </div>
    );
  }

  if (error || !group) {
    return (
      <div style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', minHeight: '100vh', padding: '2rem' }}>
        <h2>Group not found</h2>
        <p>Group ID: {id}</p>
        <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', background: 'var(--accent-yellow)', color: '#000', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const totalDeadlines = group.deadlines?.length || 0;
  const completedDeadlines = group.deadlines?.filter((d) => d.completed).length || 0;
  const totalMembers = group.members?.length || 0;
  const myMemberId = group.members.find((m) => m.user_id != null)?.id ?? null;

  const sortedDeadlines = [...(group.deadlines || [])].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const cardStyle: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-card)' };

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <GroupTabs
          groupId={group.id}
          groupName={group.name}
          subject={group.subject}
          memberCount={totalMembers}
          completionRate={analytics ? analytics.completion_rate : 0}
        />


        <div style={{ ...cardStyle, padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>{group.description || 'No description'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Members', value: totalMembers, bg: 'var(--bg-card-yellow)' },
            { label: 'Deadlines', value: totalDeadlines, bg: 'var(--bg-card-pink)' },
            { label: 'Completed', value: completedDeadlines, bg: 'var(--bg-card-sage)' },
            { label: 'Completion rate', value: analytics ? `${analytics.completion_rate}%` : '\u2014', bg: 'var(--bg-card-blue)' },
            { label: 'Current streak', value: analytics ? `${analytics.current_streak}d` : '\u2014', bg: 'var(--bg-card-yellow)' },
          ].map((stat) => (
            <div key={stat.label} style={{ ...cardStyle, background: stat.bg, padding: '1.1rem' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', opacity: 0.75 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Group Pomodoro</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-yellow)', fontFamily: 'monospace' }}>{formattedTime}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => sendPomodoroAction(pomodoro.running ? 'pause' : 'start', pomodoro.duration)}
              style={{ background: pomodoro.running ? '#7f1d1d' : 'var(--accent-yellow)', color: pomodoro.running ? '#fecaca' : '#000', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {pomodoro.running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => sendPomodoroAction('reset', 1500)}
              style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>Deadlines</h3>
              <button onClick={() => setShowDeadlineModal(true)} style={{ background: 'var(--accent-yellow)', color: '#000', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                + New Deadline
              </button>
            </div>
            {sortedDeadlines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {sortedDeadlines.map((deadline) => {
                  const overdue = !deadline.completed && new Date(deadline.due_date) < new Date();
                  return (
                  <div key={deadline.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '9999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, background: deadline.completed ? 'var(--bg-card-sage)' : overdue ? 'var(--bg-card-pink)' : 'var(--bg-card-blue)', color: 'var(--text-primary)' }}>
                        {deadline.title.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ textDecoration: deadline.completed ? 'line-through' : 'none', color: deadline.completed ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {deadline.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(deadline.due_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: deadline.completed ? 'var(--bg-card-sage)' : overdue ? 'var(--bg-card-pink)' : 'var(--bg-card-yellow)', color: 'var(--text-primary)' }}>
                        {deadline.completed ? 'Completed' : overdue ? 'Overdue' : 'Upcoming'}
                      </span>
                      <button
                        onClick={() => toggleComplete(deadline)}
                        disabled={togglingId === deadline.id}
                        style={{
                          width: '20px', height: '20px', borderRadius: '9999px', flexShrink: 0, cursor: 'pointer',
                          border: deadline.completed ? 'none' : '2px solid var(--border-hover)',
                          background: deadline.completed ? 'var(--accent-yellow)' : 'transparent',
                          color: '#000', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {deadline.completed ? '\u2713' : ''}
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No deadlines yet</p>
            )}
          </div>

          <div style={{ ...cardStyle, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>Members</h3>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '9999px', background: 'var(--accent-yellow)', color: '#000' }}>{totalMembers}</span>
              </div>
              <button onClick={() => setShowMemberModal(true)} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                + Add
              </button>
            </div>
            {group.members && group.members.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {group.members.map((member) => (
                  <div
                    key={member.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', transition: 'border-color 0.15s ease' }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '9999px', background: 'var(--accent-yellow)', color: '#000', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{member.name}</span>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--accent-yellow)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.05rem 0.35rem' }}>{member.role}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No members yet</p>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <MonthlyContributions members={group.members} deadlines={group.deadlines} />
          <TaskContributions groupId={group.id} members={group.members} currentMemberId={myMemberId} />
        </div>

        <ResourcesSection groupId={group.id} currentMemberId={myMemberId} />
      </div>

      {showDeadlineModal && <NewDeadlineModal groupId={group.id} onClose={() => setShowDeadlineModal(false)} onCreated={loadGroup} />}
      {showMemberModal && <NewMemberModal groupId={group.id} onClose={() => setShowMemberModal(false)} onCreated={loadGroup} />}
    </div>
  );
};

export default GroupDetail;








