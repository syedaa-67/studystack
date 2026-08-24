with open("frontend/src/pages/GroupDetail.tsx", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace(
    "import ResourcesSection from '../components/ResourcesSection';",
    "import ResourcesSection from '../components/ResourcesSection';\nimport MonthlyContributions from '../components/MonthlyContributions';"
)
c = c.replace(
    "<ResourcesSection groupId={group.id} currentMemberId={myMemberId} />",
    "<div style={{ marginBottom: '1.5rem' }}>\n          <MonthlyContributions members={group.members} deadlines={group.deadlines} />\n        </div>\n\n        <ResourcesSection groupId={group.id} currentMemberId={myMemberId} />"
)
with open("frontend/src/pages/GroupDetail.tsx", "w", encoding="utf-8") as f:
    f.write(c)

with open("frontend/src/components/dashboard/StudyDashboard.tsx", "r", encoding="utf-8") as f:
    d = f.read()
d = d.replace(
    "import GroupTabs from '../GroupTabs';",
    "import GroupTabs from '../GroupTabs';\nimport MonthlyContributions from '../MonthlyContributions';"
)
d = d.replace(
    "<div className='rounded-xl p-6 transition-colors duration-300' style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>\n            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'><Trophy className='w-5 h-5 text-yellow-400' /> Badge Vault</h3>",
    "<MonthlyContributions members={members} deadlines={deadlines} />\n\n          <div className='rounded-xl p-6 transition-colors duration-300' style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>\n            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'><Trophy className='w-5 h-5 text-yellow-400' /> Badge Vault</h3>"
)
with open("frontend/src/components/dashboard/StudyDashboard.tsx", "w", encoding="utf-8") as f:
    f.write(d)

print("done")
