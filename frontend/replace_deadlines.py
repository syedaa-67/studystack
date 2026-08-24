import re

with open("src/pages/GroupDetail.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r"\{sortedDeadlines\.map\(\(deadline\) => \(.*?\)\)\}", re.DOTALL)

new_block = """{sortedDeadlines.map((deadline) => {
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
                        {deadline.completed ? '\\u2713' : ''}
                      </button>
                    </div>
                  </div>
                  );
                })}"""

content_new = pattern.sub(lambda m: new_block, content)
print("Replacements made:", 1 if new_block in content_new else 0)

with open("src/pages/GroupDetail.tsx", "w", encoding="utf-8") as f:
    f.write(content_new)
