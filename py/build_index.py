"""
build_index.py
==============
Builds the reverse index for ACME Auto Parts search.

Creates two tables in MySQL:
  - index_term    : unique stemmed terms
  - index_posting : term → part_id mappings with relevance weight

Weight scheme:
  headline match      → 3
  category match      → 2
  manufacturer match  → 1

Usage
-----
  py build_index.py
  py build_index.py --host localhost --port 3306 --user root --password secret --database parts_marketplace

Dependencies
------------
  pip install nltk mysql-connector-python
  python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt_tab')"
"""

import argparse
import re
from collections import defaultdict

import mysql.connector
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

# ── Config ────────────────────────────────────────────────────────────────────

STOP_WORDS = set(stopwords.words("english"))
STEMMER    = PorterStemmer()

WEIGHT_HEADLINE      = 3
WEIGHT_CATEGORY      = 2
WEIGHT_MANUFACTURER  = 1


# ── Helpers ───────────────────────────────────────────────────────────────────

def tokenize(text: str) -> list[str]:
    """Lowercase, tokenize, remove stopwords and non-alpha, then stem."""
    if not text:
        return []
    tokens = word_tokenize(text.lower())
    return [
        STEMMER.stem(t)
        for t in tokens
        if t.isalpha() and t not in STOP_WORDS and len(t) > 1
    ]


# ── Main ──────────────────────────────────────────────────────────────────────

def build(host, port, user, password, database):
    print(f"Connecting to {host}:{port}/{database} ...")
    conn = mysql.connector.connect(
        host=host, port=port, user=user,
        password=password, database=database
    )
    conn.autocommit = False
    cursor = conn.cursor()

    # ── Create index tables ──────────────────────────────────────────────────
    print("Creating index tables ...")
    cursor.execute("DROP TABLE IF EXISTS index_posting")
    cursor.execute("DROP TABLE IF EXISTS index_term")

    cursor.execute("""
        CREATE TABLE index_term (
            id      INT AUTO_INCREMENT PRIMARY KEY,
            term    VARCHAR(100) NOT NULL UNIQUE
        )
    """)

    cursor.execute("""
        CREATE TABLE index_posting (
            term_id INT NOT NULL,
            part_id INT NOT NULL,
            weight  INT NOT NULL DEFAULT 1,
            PRIMARY KEY (term_id, part_id),
            FOREIGN KEY (term_id) REFERENCES index_term(id),
            FOREIGN KEY (part_id) REFERENCES parts(id)
        )
    """)
    conn.commit()
    print("  ✓ index_term and index_posting created")

    # ── Load parts with category and manufacturer ────────────────────────────
    print("Loading parts data ...")
    cursor.execute("""
        SELECT
            p.id,
            p.headline,
            pc.category_name,
            v.manufacturer_name
        FROM parts p
        LEFT JOIN prod_cat pc ON p.category_id = pc.id
        LEFT JOIN parts_vehicles pv ON pv.part_id = p.id
        LEFT JOIN vehicles v ON pv.vehicle_id = v.id
        GROUP BY p.id, p.headline, pc.category_name, v.manufacturer_name
    """)
    rows = cursor.fetchall()
    print(f"  ✓ {len(rows)} part rows fetched")

    # ── Build postings in memory ─────────────────────────────────────────────
    # postings[term][part_id] = max weight seen so far
    print("Building index ...")
    postings = defaultdict(lambda: defaultdict(int))

    for part_id, headline, category, manufacturer in rows:
        for term in tokenize(headline or ""):
            postings[term][part_id] = max(postings[term][part_id], WEIGHT_HEADLINE)
        for term in tokenize(category or ""):
            postings[term][part_id] = max(postings[term][part_id], WEIGHT_CATEGORY)
        for term in tokenize(manufacturer or ""):
            postings[term][part_id] = max(postings[term][part_id], WEIGHT_MANUFACTURER)

    print(f"  ✓ {len(postings)} unique terms indexed")

    # ── Write to DB ──────────────────────────────────────────────────────────
    print("Writing index to database ...")
    term_ids = {}
    total_postings = 0

    for i, (term, part_weights) in enumerate(postings.items()):
        # Insert term
        cursor.execute(
            "INSERT INTO index_term (term) VALUES (%s)",
            (term,)
        )
        term_id = cursor.lastrowid
        term_ids[term] = term_id

        # Insert postings for this term
        for part_id, weight in part_weights.items():
            cursor.execute(
                "INSERT INTO index_posting (term_id, part_id, weight) VALUES (%s, %s, %s)",
                (term_id, part_id, weight)
            )
            total_postings += 1

        # Commit every 500 terms
        if (i + 1) % 500 == 0:
            conn.commit()
            print(f"  {i + 1} terms written...", end="\r", flush=True)

    conn.commit()
    print(f"\n  ✓ {len(term_ids)} terms and {total_postings} postings written")

    cursor.close()
    conn.close()
    print("\nIndex build complete.")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Build ACME reverse index")
    parser.add_argument("--host",     default="localhost")
    parser.add_argument("--port",     default=3306, type=int)
    parser.add_argument("--user",     default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--database", default="parts_marketplace")
    args = parser.parse_args()

    build(args.host, args.port, args.user, args.password, args.database)


if __name__ == "__main__":
    main()