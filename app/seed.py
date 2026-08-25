import sqlite3
from datetime import datetime, timedelta
import bcrypt

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Clear existing data
print('Clearing existing data...')
cursor.execute('DELETE FROM resource')
cursor.execute('DELETE FROM deadline')
cursor.execute('DELETE FROM badge')
cursor.execute('DELETE FROM member')
cursor.execute('DELETE FROM studygroup')
conn.commit()
print('✅ Cleared data')

# Create test user
password_hash = bcrypt.hashpw(b'syeda123', bcrypt.gensalt()).decode('utf-8')
now = datetime.now().isoformat()

# Create group
cursor.execute('INSERT INTO studygroup (name, subject, created_at) VALUES (?, ?, ?)',
               ('Data Science Study Group', 'Data Science', now))
group_id = cursor.lastrowid
print('✅ Created group')

# Create owner
cursor.execute('INSERT INTO member (name, email, password_hash, role, points, group_id) VALUES (?, ?, ?, ?, ?, ?)',
               ('Test User', 'test@test.com', password_hash, 'admin', 45, group_id))
owner_id = cursor.lastrowid
print('✅ Created owner')

# Update group owner
cursor.execute('UPDATE studygroup SET owner_id = ? WHERE id = ?', (owner_id, group_id))

# Add members
member_ids = []
members = [
    ('Alice Johnson', 'alice@test.com', 'member', 30),
    ('Bob Smith', 'bob@test.com', 'member', 25),
    ('Carol Davis', 'carol@test.com', 'member', 20)
]
for name, email, role, points in members:
    cursor.execute('INSERT INTO member (name, email, role, points, group_id) VALUES (?, ?, ?, ?, ?)',
                   (name, email, role, points, group_id))
    member_ids.append(cursor.lastrowid)
print(f'✅ Created {len(member_ids)} members')

# Add deadlines
deadlines = [
    ('Final Project Submission', 'Complete the data science final project', 
     (datetime.now() + timedelta(days=14)).isoformat(), 0, owner_id),
    ('Midterm Review', 'Review and prepare for midterm exam', 
     (datetime.now() + timedelta(days=5)).isoformat(), 0, member_ids[0]),
    ('Group Presentation', 'Prepare and rehearse the group presentation', 
     (datetime.now() + timedelta(days=10)).isoformat(), 0, member_ids[1]),
    ('Research Paper Draft', 'Submit first draft of research paper', 
     (datetime.now() - timedelta(days=2)).isoformat(), 1, member_ids[2]),
]
for title, desc, due_date, completed, assigned_to in deadlines:
    cursor.execute('INSERT INTO deadline (title, description, due_date, completed, assigned_to_id, group_id) VALUES (?, ?, ?, ?, ?, ?)',
                   (title, desc, due_date, completed, assigned_to, group_id))
print(f'✅ Created {len(deadlines)} deadlines')

# Add resources
resources = [
    ('Data Science Handbook', 'Comprehensive guide', 'https://example.com/handbook', None, 'link', owner_id),
    ('Python Notes', 'Class notes for Python', None, 'Python is versatile...', 'note', member_ids[0]),
    ('ML Cheatsheet', 'Quick reference', 'https://example.com/ml', None, 'link', member_ids[1]),
]
for title, desc, url, content, resource_type, created_by in resources:
    cursor.execute('INSERT INTO resource (title, description, url, content, resource_type, group_id, created_by_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                   (title, desc, url, content, resource_type, group_id, created_by, now))
print(f'✅ Created {len(resources)} resources')

# Add badges
badges = [
    ('Early Bird', 'Completed a deadline early', '🐦', 10, owner_id),
    ('Collaborator', 'Added resources to the group', '🤝', 5, member_ids[0]),
    ('Deadline Master', 'Completed 5 deadlines on time', '🎯', 20, member_ids[1]),
]
for name, desc, icon, points, member_id in badges:
    cursor.execute('INSERT INTO badge (name, description, icon, points, member_id) VALUES (?, ?, ?, ?, ?)',
                   (name, desc, icon, points, member_id))
print(f'✅ Created {len(badges)} badges')

conn.commit()
conn.close()

print()
print('📧 Login with: test@test.com')
print('🔑 Password: syeda123')
print('🌱 Database seeding complete!')
