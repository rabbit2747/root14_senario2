import sqlite3
from pathlib import Path


state_root = Path("/seed/state")
ticket_state = state_root / "ticket-service"
ticket_state.mkdir(parents=True, exist_ok=True)

db_path = ticket_state / "tickets.db"
with sqlite3.connect(db_path) as conn:
    conn.executescript(
        """
        DROP TABLE IF EXISTS ticket_comments;
        DROP TABLE IF EXISTS tickets;

        CREATE TABLE tickets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            customer TEXT NOT NULL,
            release_branch TEXT NOT NULL,
            channel TEXT NOT NULL,
            note TEXT NOT NULL,
            evidence TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE ticket_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT NOT NULL,
            author TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(ticket_id) REFERENCES tickets(id)
        );
        """
    )
    conn.execute(
        """
        INSERT INTO tickets (
            id, title, status, customer, release_branch, channel, note, evidence,
            created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "OES-1287",
            "Release pipeline trigger review",
            "open",
            "ANRC",
            "refs/heads/release/2.6.4",
            "anrc",
            "Release Engineering moved the valid build trigger into the release-pipeline repo. Ignore expired tokens in chat exports.",
            "evidence:ticket-release-context",
            "2026-05-02T08:18:22Z",
            "2026-05-02T11:42:09Z",
        ),
    )
    conn.executemany(
        """
        INSERT INTO ticket_comments (ticket_id, author, body, created_at)
        VALUES (?, ?, ?, ?)
        """,
        [
            (
                "OES-1287",
                "maya.release",
                "ANRC requested a limited 2.6.4 channel release. Build trigger should be read from the release branch metadata, not from old chat snippets.",
                "2026-05-02T08:22:41Z",
            ),
            (
                "OES-1287",
                "jules.support",
                "Support KB still points analysts to the repo evidence path after LDAP wiki access is confirmed.",
                "2026-05-02T09:13:07Z",
            ),
            (
                "OES-1287",
                "nari.devops",
                "Expired tokens in retained exports are decoys for incident reconstruction. Current release metadata lives in release-pipeline/release.json.",
                "2026-05-02T11:42:09Z",
            ),
        ],
    )
    conn.commit()

print("[seeder] ticket database written")
