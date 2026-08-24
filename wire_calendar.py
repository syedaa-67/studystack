import re
with open("frontend/src/App.tsx", "r", encoding="utf-8") as f:
    c = f.read()
c = c.replace("import AnalyticsPage from './pages/AnalyticsPage';", "import AnalyticsPage from './pages/AnalyticsPage';\nimport CalendarPage from './pages/CalendarPage';")
c = c.replace("<Route path=\"/groups/:id/analytics\" element={<AnalyticsPage />} />", "<Route path=\"/groups/:id/analytics\" element={<AnalyticsPage />} />\n      <Route path=\"/groups/:id/calendar\" element={<CalendarPage />} />")
with open("frontend/src/App.tsx", "w", encoding="utf-8") as f:
    f.write(c)

with open("frontend/src/components/GroupTabs.tsx", "r", encoding="utf-8") as f:
    g = f.read()
g = g.replace(
    '{ label: "Analytics", path: `/groups/${groupId}/analytics` },',
    '{ label: "Analytics", path: `/groups/${groupId}/analytics` },\n    { label: "Calendar", path: `/groups/${groupId}/calendar` },'
)
with open("frontend/src/components/GroupTabs.tsx", "w", encoding="utf-8") as f:
    f.write(g)

print("done")
