import re

with open("src/pages/AnalyticsPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old = """<ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.weekly_trend}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="completed_count"
                  stroke={BRAND}
                  strokeWidth={2}
                  dot={{ fill: BRAND, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>"""

new = """<ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.weekly_trend}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "var(--border-subtle)" }}
                  contentStyle={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: 10, color: "var(--text-primary)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                  labelStyle={{ color: "var(--text-secondary)", fontSize: 11 }}
                />
                <Bar dataKey="completed_count" radius={[6, 6, 0, 0]}>
                  {data.weekly_trend.map((entry, index) => {
                    const maxCount = Math.max(...data.weekly_trend.map((t) => t.completed_count));
                    const isMax = entry.completed_count === maxCount && maxCount > 0;
                    return <Cell key={`cell-${index}`} fill={isMax ? BRAND : MUTED} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>"""

count = content.count(old)
print("Matches found:", count)
content_new = content.replace(old, new)

with open("src/pages/AnalyticsPage.tsx", "w", encoding="utf-8") as f:
    f.write(content_new)
