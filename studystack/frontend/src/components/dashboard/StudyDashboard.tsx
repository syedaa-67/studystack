import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Trophy, Clock, HelpCircle, Zap, CheckCircle, MessageSquarePlus } from 'lucide-react';
import { useGroupSocket } from '../../hooks/useGroupSocket';
import api from '../../api/client';
import { fetchAnalytics } from '../../api/analytics';
import type { AnalyticsResponse } from '../../api/analytics';
import { fetchLeaderboard } from '../../api/leaderboard';
import { fetchFocusTrend } from '../../api/focusTrend';
import type { FocusTrendPoint } from '../../api/focusTrend';
import { listResources, summarizeResource } from '../../api/resources';
import type { ResourceRead } from '../../api/resources';
import { BADGE_CATALOG } from './types';
import type { LeaderboardEntry, DeadlineInGroup, MemberInGroup } from './types';
import GroupTabs from '../GroupTabs';

interface Props {
  groupId: number | string;
}

export const StudyDashboard: React.FC<Props> = ({ groupId }) => {
  const { onlineUsers, pomodoro, sendPomodoroAction } = useGroupSocket(groupId);
  const [tick, setTick] = useState(0);

  const [groupInfo, setGroupInfo] = useState<{ name: string; subject: string } | null>(null);
  const [members, setMembers] = useState<MemberInGroup[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineInGroup[]>([]);
  const [myMemberId, setMyMemberId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [resources, setResources] = useState<ResourceRead[]>([]);
  const [focusTrend, setFocusTrend] = useState<FocusTrendPoint[]>([]);

  const [showAIPopover, setShowAIPopover] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<number | ''>('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [sosSentId, setSosSentId] = useState<number | null>(null);

  const loadAll = () => {
    api.get(`/study-groups/${groupId}`).then((res) => {
      setMembers(res.data.members);
      setDeadlines(res.data.deadlines);
      setGroupInfo({ name: res.data.name, subject: res.data.subject });
      const mine = res.data.members.find((m: MemberInGroup) => m.user_id !== null);
      setMyMemberId(mine?.id ?? null);
    });
    fetchAnalytics(groupId).then(setAnalytics).catch(() => {});
    fetchLeaderboard(groupId).then((r) => setLeaderboard(r.entries)).catch(() => {});
    listResources(groupId).then(setResources).catch(() => {});
    fetchFocusTrend(groupId).then((r) => setFocusTrend(r.trend)).catch(() => {});
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // refresh focus trend a bit after a pomodoro session ends so the chart updates
  useEffect(() => {
    if (!pomodoro.running) {
      const timeout = setTimeout(() => {
        fetchFocusTrend(groupId).then((r) => setFocusTrend(r.trend)).catch(() => {});
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [pomodoro.running, groupId]);

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

  const myEntry = leaderboard.find((e) => e.member_id === myMemberId);
  const myRank = myEntry ? leaderboard.findIndex((e) => e.member_id === myMemberId) + 1 : null;

  const upcomingDeadlines = [...deadlines]
    .filter((d) => !d.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  const assigneeFor = (d: DeadlineInGroup) => members.find((m) => m.id === d.assigned_to_id);

  const handleSOS = (deadlineId: number, title: string) => {
    setSosSentId(deadlineId);
    setTimeout(() => setSosSentId(null), 2000);
    // eslint-disable-next-line no-console
    console.log(`SOS requested for "${title}"`);
  };

  const handleAIAsk = async () => {
    if (selectedResourceId === '') {
      setAiError('Pick a resource to summarize.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiResponse('');
    try {
      const result = await summarizeResource(Number(selectedResourceId));
      setAiResponse(result);
    } catch {
      setAiError("Couldn't generate a summary right now.");
    } finally {
      setAiLoading(false);
    }
  };

  const badgeDisplay = BADGE_CATALOG.map((def) => {
    const earned = myEntry?.badges.includes(def.name) ?? false;
    let progress = 0;
    if (def.progressOf === 'deadlines') {
      progress = analytics?.member_contributions.find((c) => c.member_id === myMemberId)?.completed_count ?? 0;
    } else if (def.progressOf === 'streak') {
      progress = analytics?.current_streak ?? 0;
    } else {
      progress = resources.filter((r) => r.created_by_id === myMemberId).length;
    }
    return { ...def, earned, progress: Math.min(progress, def.target) };
  });

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100'>
      <div className='max-w-7xl mx-auto'>
        {groupInfo && (
          <GroupTabs groupId={groupId} groupName={groupInfo.name} subject={groupInfo.subject} />
        )}
      </div>

      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4'>
              <div className='text-xs text-slate-400 uppercase'>Completion</div>
              <div className='text-2xl font-bold text-yellow-400 mt-1'>{analytics ? `${analytics.completion_rate}%` : '\u2014'}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4'>
              <div className='text-xs text-slate-400 uppercase flex items-center gap-1'>Streak <Flame className='w-3 h-3 text-orange-500' /></div>
              <div className='text-2xl font-bold text-white mt-1'>{analytics ? `${analytics.current_streak}d` : '\u2014'}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4'>
              <div className='text-xs text-slate-400 uppercase flex items-center gap-1'>Rank <Trophy className='w-3 h-3 text-yellow-400' /></div>
              <div className='text-2xl font-bold text-white mt-1'>{myRank ? `#${myRank}` : '\u2014'}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4'>
              <div className='text-xs text-slate-400 uppercase flex items-center gap-1'>Points <Clock className='w-3 h-3 text-teal-400' /></div>
              <div className='text-2xl font-bold text-white mt-1'>{myEntry ? myEntry.points : '\u2014'}</div>
            </motion.div>
          </div>

          <div className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6'>
            <h3 className='text-lg font-semibold mb-1 text-slate-100'>Weekly Focus Trend</h3>
            <p className='text-xs text-slate-500 mb-4'>Minutes spent in group Pomodoro sessions, last 7 days</p>
            <div className='h-56'>
              {focusTrend.every((p) => p.minutes === 0) ? (
                <div className='h-full flex items-center justify-center text-sm text-slate-500'>
                  No Pomodoro sessions logged yet this week. Start one below to see it here.
                </div>
              ) : (
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={focusTrend}>
                    <XAxis dataKey='day' stroke='#64748b' tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke='#64748b' tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                    <Line type='monotone' dataKey='minutes' stroke='#FBBF24' strokeWidth={3} dot={{ fill: '#FBBF24', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 relative overflow-hidden'>
            {onlineUsers.length > 0 && (
              <div className='absolute top-0 right-0 p-2 text-xs bg-green-500/20 text-green-400 rounded-bl-lg border-l border-b border-white/10'>Live</div>
            )}
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'><Zap className='w-5 h-5 text-yellow-400' /> Live Session</h3>
            <div className='flex -space-x-3 mb-6'>
              {members.filter((m) => m.user_id !== null && onlineUsers.includes(String(m.user_id))).map((m) => (
                <div key={m.id} className='relative w-10 h-10 rounded-full border-2 border-slate-800 bg-yellow-400 text-slate-900 font-bold flex items-center justify-center'>
                  {m.name.charAt(0).toUpperCase()}
                  <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-slate-800' />
                </div>
              ))}
              {onlineUsers.length === 0 && <div className='text-xs text-slate-400'>Nobody else is online right now</div>}
            </div>
            <div className='flex flex-col items-center justify-center mb-4'>
              <div className='w-32 h-32 rounded-full border-4 border-yellow-400/50 flex items-center justify-center text-3xl font-mono font-bold text-white shadow-[0_0_20px_rgba(251,191,36,0.2)]'>
                {formattedTime}
              </div>
              <div className='mt-4 flex gap-3'>
                <button
                  onClick={() => sendPomodoroAction(pomodoro.running ? 'pause' : 'start', pomodoro.duration)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${pomodoro.running ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'}`}
                >
                  {pomodoro.running ? 'Pause' : 'Start Group Pomodoro'}
                </button>
                <button onClick={() => sendPomodoroAction('reset', 1500)} className='px-4 py-2 rounded-lg font-medium bg-white/10 text-slate-300 hover:bg-white/20 transition-colors'>
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'><Clock className='w-5 h-5 text-red-400' /> Deadline SOS</h3>
            <div className='space-y-4'>
              {upcomingDeadlines.length === 0 && <p className='text-sm text-slate-400'>No upcoming deadlines.</p>}
              {upcomingDeadlines.map((d) => {
                const assignee = assigneeFor(d);
                return (
                  <div key={d.id} className='flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-teal-400/30 text-teal-200 text-xs font-bold flex items-center justify-center'>
                        {assignee ? assignee.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className='text-sm font-medium text-slate-200'>{d.title}</div>
                        <div className='text-xs text-slate-400'>Due: {new Date(d.due_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSOS(d.id, d.title)}
                      className='p-2 bg-yellow-400/20 text-yellow-400 rounded-full hover:bg-yellow-400/30 transition-colors text-xs font-semibold px-3'
                    >
                      {sosSentId === d.id ? 'Sent!' : <HelpCircle className='w-4 h-4' />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'><Trophy className='w-5 h-5 text-yellow-400' /> Badge Vault</h3>
            <div className='grid grid-cols-3 gap-3'>
              {badgeDisplay.map((b) => (
                <div key={b.name} className={`flex flex-col items-center p-3 rounded-lg border ${b.earned ? 'border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'border-slate-700 bg-white/5 opacity-60'}`}>
                  <div className='text-2xl mb-1'>{b.icon}</div>
                  <div className='text-[10px] text-center text-slate-300 font-medium'>{b.name}</div>
                  {!b.earned && (
                    <>
                      <div className='w-full mt-2 h-1 bg-slate-700 rounded-full overflow-hidden'>
                        <div className='h-full bg-slate-400 rounded-full' style={{ width: `${(b.progress / b.target) * 100}%` }} />
                      </div>
                      <div className='text-[9px] text-slate-500 mt-1'>{b.progress}/{b.target}</div>
                    </>
                  )}
                  {b.earned && <CheckCircle className='w-3 h-3 text-green-400 mt-1' />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='fixed bottom-6 right-6 z-50'>
        {!showAIPopover ? (
          <button onClick={() => setShowAIPopover(true)} className='w-14 h-14 rounded-full bg-yellow-400 text-slate-900 shadow-lg flex items-center justify-center hover:scale-110 transition-transform'>
            <MessageSquarePlus className='w-6 h-6' />
          </button>
        ) : (
          <div className='w-80 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-4'>
            <div className='flex justify-between items-center mb-3'>
              <span className='text-sm font-semibold text-yellow-400'>Ask Study AI</span>
              <button onClick={() => setShowAIPopover(false)} className='text-slate-400 hover:text-white'>{'\u2715'}</button>
            </div>
            <select
              value={selectedResourceId}
              onChange={(e) => setSelectedResourceId(e.target.value ? Number(e.target.value) : '')}
              className='w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-yellow-400/50 mb-2'
            >
              <option value=''>Pick a resource to summarize...</option>
              {resources.filter((r) => r.resource_type !== 'file').map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            <button
              onClick={handleAIAsk}
              disabled={aiLoading}
              className='w-full py-2 bg-yellow-400/20 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-400/30 transition-colors disabled:opacity-50'
            >
              {aiLoading ? 'Summarizing...' : 'Ask AI'}
            </button>
            {aiError && <p className='text-red-400 text-xs mt-2'>{aiError}</p>}
            {aiResponse && <div className='mt-3 p-3 bg-slate-900/50 rounded-lg text-xs text-slate-300 whitespace-pre-wrap border border-white/5'>{aiResponse}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
