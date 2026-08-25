import sqlite3
from datetime import datetime, timedelta
import bcrypt

conn = sqlite3.connect('studystack.db')
cursor = conn.cursor()

print('Clearing existing data...')
cursor.execute('DELETE FROM resourceversion')
cursor.execute('DELETE FROM resourcecomment')
cursor.execute('DELETE FROM resource')
cursor.execute('DELETE FROM notification')
cursor.execute('DELETE FROM deadline')
cursor.execute('DELETE FROM badge')
cursor.execute('DELETE FROM member')
cursor.execute('DELETE FROM studygroup')
cursor.execute('DELETE FROM user')
conn.commit()
print('Cleared data')

password_hash = bcrypt.hashpw(b'syeda123', bcrypt.gensalt()).decode('utf-8')
now = datetime.now().isoformat()

cursor.execute('INSERT INTO user (email, hashed_password, created_at) VALUES (?, ?, ?)',
               ('syeda@test.com', password_hash, now))
user_id = cursor.lastrowid

cursor.execute('INSERT INTO studygroup (name, subject, created_at) VALUES (?, ?, ?)',
               ('Data Science Study Group', 'Data Science', now))
group_id = cursor.lastrowid
print('Created group')

cursor.execute('INSERT INTO member (name, email, role, points, group_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
               ('Test User', 'syeda@test.com', 'admin', 45, group_id, user_id))
owner_id = cursor.lastrowid
print('Created owner')

cursor.execute('UPDATE studygroup SET owner_id = ? WHERE id = ?', (owner_id, group_id))

members = [
    ('Alice Johnson', 'alice@test.com', 'member', 30),
    ('Bob Smith', 'bob@test.com', 'member', 25),
    ('Carol Davis', 'carol@test.com', 'member', 20)
]
member_ids = []
for name, email, role, points in members:
    cursor.execute('INSERT INTO member (name, email, role, points, group_id) VALUES (?, ?, ?, ?, ?)',
                   (name, email, role, points, group_id))
    member_ids.append(cursor.lastrowid)
print(f'Created {len(member_ids)} members')

deadlines = [
    ('Final Project Submission', (datetime.now() + timedelta(days=14)).isoformat(), 0, owner_id),
    ('Midterm Review', (datetime.now() + timedelta(days=5)).isoformat(), 0, member_ids[0]),
    ('Group Presentation', (datetime.now() + timedelta(days=10)).isoformat(), 0, member_ids[1]),
    ('Research Paper Draft', (datetime.now() - timedelta(days=2)).isoformat(), 1, member_ids[2]),
]
for title, due_date, completed, assigned_to in deadlines:
    cursor.execute('INSERT INTO deadline (title, due_date, completed, assigned_to_id, group_id) VALUES (?, ?, ?, ?, ?)',
                   (title, due_date, completed, assigned_to, group_id))
print(f'Created {len(deadlines)} deadlines')

resources = [
    ('Data Science Handbook', 'link', 'https://example.com/handbook', owner_id),
    ('Python Notes', 'note', 'Python is versatile...', member_ids[0]),
    ('ML Cheatsheet', 'link', 'https://example.com/ml', member_ids[1]),
]
for title, resource_type, content, created_by in resources:
    cursor.execute('INSERT INTO resource (group_id, title, resource_type, created_by_id, created_at, current_version_number) VALUES (?, ?, ?, ?, ?, ?)',
                   (group_id, title, resource_type, created_by, now, 1))
    resource_id = cursor.lastrowid
    cursor.execute('INSERT INTO resourceversion (resource_id, version_number, content, created_by_id, created_at) VALUES (?, ?, ?, ?, ?)',
                   (resource_id, 1, content, created_by, now))
print(f'Created {len(resources)} resources')

badges = [
    ('Early Bird', owner_id),
    ('Collaborator', member_ids[0]),
]
for name, member_id in badges:
    cursor.execute('INSERT INTO badge (member_id, name, awarded_at) VALUES (?, ?, ?)',
                   (member_id, name, now))
print(f'Created {len(badges)} badges')

conn.commit()
conn.close()

print('Seed complete!')
print(f'Login: syeda@test.com')
print(f'Password: syeda123')