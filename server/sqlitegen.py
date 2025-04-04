# Python script to generate multiple game records for 3 users in SQLite
import sqlite3
import random
from datetime import datetime

# Path to the database file
db_path = 'database.db'

# Connect to the SQLite database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Current timestamp for startTime and endTime
current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Generate multiple games for 3 users
number_of_records = 100  # Change this to generate more records
user_ids = [1, 2, 3]  # Assuming there are only 3 users

for _ in range(number_of_records):
    user_id = random.choice(user_ids)
    score = random.randint(10, 500) * 100  # Random score between 1000 and 50000
    duration = (score // 100) * 3  # Calculate duration based on score

    # Insert into the games table
    cursor.execute(
        "INSERT INTO games (userId, startTime, endTime, score, duration) VALUES (?, ?, ?, ?, ?);",
        (user_id, current_time, current_time, score, duration)
    )

# Commit the changes and close the connection
conn.commit()
conn.close()

print(f"Successfully inserted {number_of_records} game records for 3 users.")