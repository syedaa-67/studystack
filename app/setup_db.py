import sqlite3
from datetime import datetime, timedelta
import bcrypt

print('Setting up database...')

conn = sqlite3.connect('database.db')
c = conn.cursor()

# Create tables
print('Creating tables...')
c.execute('CREATE TABLE IF NOT EXISTS studygroup (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, subject TEXT, created_at TEXT, owner_id INTEGER)')
c.execute('CREATE TABLE IF NOT EXISTS member (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password_hash TEXT, role TEXT, points INTEGER, group_id INTEGER)')
c.execute('CREATE TABLE IF NOT EXISTS deadline (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, due_date TEXT, completed INTEGER, group_id INTEGER)')
c.execute('CREATE TABLE IF NOT EXISTS resource (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, resource_type TEXT, group_id INTEGER, created_by_id INTEGER, created_at TEXT)')
c.execute('CREATE TABLE IF NOT EXISTS badge (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, points INTEGER, member_id INTEGER)')
conn.commit()
print('✅ Tables created')

# Check if data exists
c.execute('SELECT COUNT(*) FROM studygroup')
if c.fetchone()[0] == 0:
    print('Seeding data...')
    
    # Create group
    c.execute('INSERT INTO studygroup (name, subject, created_at) VALUES (?, ?, ?)',
              ('Data Science Study Group', 'Data Science', datetime.now().isoformat()))
    group_id = c.lastrowid
    print(f'✅ Group created: {group_id}')
    
    # Create owner
    pw = bcrypt.hashpw(b'test123', bcrypt.gensalt()).decode('utf-8')
    c.execute('INSERT INTO member (name, email, password_hash, role, points, group_id) VALUES (?, ?, ?, ?, ?, ?)',
              ('Test User', 'test@test.com', pw, 'admin', 45, group_id))
    owner_id = c.lastrowid
    print(f'✅ Owner created: {owner_id}')
    
    # Update group owner
    c.execute('UPDATE studygroup SET owner_id = ? WHERE id = ?', (owner_id, group_id))
    
    # Add members
    c.execute('INSERT INTO member (name, email, role, points, group_id) VALUES (?, ?, ?, ?, ?)',
              ('Alice Johnson', 'alice@test.com', 'member', 30, group_id))
    c.execute('INSERT INTO member (name, email, role, points, group_id) VALUES (?, ?, ?, ?, ?)',
              ('Bob Smith', 'bob@test.com', 'member', 25, group_id))
    print('✅ Members added')
    
    # Add deadlines
    c.execute('INSERT INTO deadline (title, due_date, completed, group_id) VALUES (?, ?, ?, ?)',
              ('Final Project', (datetime.now() + timedelta(days=14)).isoformat(), 0, group_id))
    c.execute('INSERT INTO deadline (title, due_date, completed, group_id) VALUES (?, ?, ?, ?)',
              ('Midterm Review', (datetime.now() + timedelta(days=5)).isoformat(), 0, group_id))
    c.execute('INSERT INTO deadline (title, due_date, completed, group_id) VALUES (?, ?, ?, ?)',
              ('Research Paper', (datetime.now() - timedelta(days=2)).isoformat(), 1, group_id))
    print('✅ Deadlines added')
    
    conn.commit()
    print('\n✅ Database setup complete!')
    print('📧 Login: test@test.com')
    print('🔑 Password: test123')
else:
    print('✅ Data already exists')

conn.close()
