import sqlite3
import os

DB_PATH = "instance/talent_matching.db"


def add_column_if_missing(cursor, table_name, column_name, column_definition):
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [column[1] for column in cursor.fetchall()]

    if column_name not in columns:
        cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_definition}")
        print(f"Added column: {table_name}.{column_name}")
    else:
        print(f"Column already exists: {table_name}.{column_name}")


def migrate():
    if not os.path.exists(DB_PATH):
        print("Database file not found. Run app.py first to create the database.")
        return

    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    # User membership field
    add_column_if_missing(cursor, "user", "is_member", "BOOLEAN DEFAULT 0 NOT NULL")

    # Candidate profile enhancement
    add_column_if_missing(cursor, "candidate_profile", "preferred_work_mode", "VARCHAR(50)")

    # Job search/filter fields
    add_column_if_missing(cursor, "job", "job_type", "VARCHAR(50)")
    add_column_if_missing(cursor, "job", "salary_min", "INTEGER")
    add_column_if_missing(cursor, "job", "salary_max", "INTEGER")

    connection.commit()
    connection.close()

    print("Database migration completed successfully.")


if __name__ == "__main__":
    migrate()