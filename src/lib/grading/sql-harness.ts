// The Python program Piston runs for SQL tasks. The candidate's query is a text file it reads, never code it runs.
export const SQL_HARNESS = String.raw`import sqlite3
import sys

MAX_ROWS = 200


def read(name):
    with open(name, encoding="utf-8") as f:
        return f.read()


def fail(code, message):
    sys.stderr.write(message + "\n")
    sys.exit(code)


def fmt(value):
    if value is None:
        return "NULL"
    if isinstance(value, float):
        text = ("%.6f" % value).rstrip("0").rstrip(".")
        return text if text not in ("", "-0") else "0"
    if isinstance(value, bytes):
        return "<blob>"
    return str(value)


db = sqlite3.connect(":memory:")
db.executescript(read("setup.sql"))

if hasattr(db, "setlimit"):
    db.setlimit(sqlite3.SQLITE_LIMIT_LENGTH, 1000000)

ALLOWED = (
    sqlite3.SQLITE_SELECT,
    sqlite3.SQLITE_READ,
    sqlite3.SQLITE_FUNCTION,
    getattr(sqlite3, "SQLITE_RECURSIVE", 33),
)


def authorizer(action, arg1, arg2, db_name, source):
    return sqlite3.SQLITE_OK if action in ALLOWED else sqlite3.SQLITE_DENY


db.set_authorizer(authorizer)

ticks = [0]


def progress():
    ticks[0] += 1
    return 1 if ticks[0] > 3000 else 0


db.set_progress_handler(progress, 1000)

query = read("query.sql").strip()
if not query:
    fail(2, "Empty query")

try:
    cursor = db.execute(query)
    rows = cursor.fetchmany(MAX_ROWS + 1)
except Exception as error:
    fail(3, "SQL error: " + str(error).splitlines()[0][:200])

if len(rows) > MAX_ROWS:
    fail(4, "Too many rows")

for row in rows:
    print("|".join(fmt(v) for v in row))
`;