import json
import sqlite3
from pathlib import Path


db = Path("/seed/wiki/wiki.db")
db.parent.mkdir(parents=True, exist_ok=True)
pages = json.loads(Path("/seed/wiki/seed_pages.json").read_text(encoding="utf-8"))

con = sqlite3.connect(db)
con.execute("create table if not exists pages (slug text primary key, title text not null, body text not null)")
for page in pages:
    con.execute(
        "insert or replace into pages (slug, title, body) values (?, ?, ?)",
        (page["slug"], page["title"], page["body"]),
    )
con.commit()
con.close()
print(f"[seeder] wiki pages written: {len(pages)}")
