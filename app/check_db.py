import sqlite3
conn = sqlite3.connect('database.db')
c = conn.cursor()

c.execute('SELECT COUNT(*) FROM studygroup')
print('Groups:', c.fetchone()[0])

c.execute('SELECT COUNT(*) FROM member')
print('Members:', c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM member WHERE email='test@test.com'")
print('Test user exists:', c.fetchone()[0] > 0)

c.execute('SELECT COUNT(*) FROM deadline')
print('Deadlines:', c.fetchone()[0])

conn.close()
