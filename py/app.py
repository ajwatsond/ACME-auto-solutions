"""
app.py
======
Flask backend for ACME Auto Parts.
Serves the frontend and provides all API endpoints.

Endpoints
---------
  GET /                                          → serves index.html
  GET /api/search?q=&category=&sort=            → reverse index search
  GET /api/vehicles                             → all makes/models/years
  GET /api/parts/vehicle?year=&make=&model=     → parts for a vehicle
  GET /api/brands                               → all manufacturers
  GET /api/parts/brand?name=                    → parts for a brand

Usage
-----
  pip install flask mysql-connector-python nltk
  py app.py
  py app.py --host localhost --port 3306 --user root --password secret --database parts_marketplace

The Flask dev server runs on http://localhost:5000 by default.
Open index.html at http://localhost:5000
"""

import argparse
from collections import defaultdict

import mysql.connector
from flask import Flask, g, jsonify, request, send_from_directory
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

# ── Config ────────────────────────────────────────────────────────────────────

STOP_WORDS = set(stopwords.words("english"))
STEMMER    = PorterStemmer()

app = Flask(__name__, static_folder=".", static_url_path="")

# Filled in by main() from CLI args
DB_CONFIG = {
    "host":     "localhost",
    "port":     3306,
    "user":     "root",
    "password": "",
    "database": "parts_marketplace",
}


# ── DB helpers ────────────────────────────────────────────────────────────────

def get_db():
    """Return a per-request DB connection stored on Flask's g object."""
    if "db" not in g:
        g.db = mysql.connector.connect(**DB_CONFIG)
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None and db.is_connected():
        db.close()


def query(sql, params=None):
    cursor = get_db().cursor(dictionary=True)
    cursor.execute(sql, params or ())
    rows = cursor.fetchall()
    cursor.close()
    return rows


# ── Search helpers ────────────────────────────────────────────────────────────

def tokenize(text: str) -> list:
    if not text:
        return []
    tokens = word_tokenize(text.lower())
    return [
        STEMMER.stem(t)
        for t in tokens
        if t.isalpha() and t not in STOP_WORDS and len(t) > 1
    ]


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/api/search")
def search():
    q        = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    sort     = request.args.get("sort", "").strip()

    # No query — return top 48 parts (browsing mode)
    if not q:
        sql = """
            SELECT
                p.id, p.headline AS name, p.price_usd AS price,
                p.condition, pc.category_name AS category,
                GROUP_CONCAT(DISTINCT v.manufacturer_name ORDER BY v.manufacturer_name SEPARATOR ', ') AS manufacturers,
                GROUP_CONCAT(DISTINCT CONCAT(v.model_name, ' (', pv.bottom_year, '-', pv.top_year, ')')
                    ORDER BY v.manufacturer_name SEPARATOR ', ') AS compat
            FROM parts p
            LEFT JOIN prod_cat pc ON p.category_id = pc.id
            LEFT JOIN parts_vehicles pv ON pv.part_id = p.id
            LEFT JOIN vehicles v ON pv.vehicle_id = v.id
            {where}
            GROUP BY p.id
            {order}
            LIMIT 48
        """
        where = "WHERE pc.category_name = %s" if category else ""
        params = (category,) if category else ()
        order = _sort_clause(sort)
        rows = query(sql.format(where=where, order=order), params)
        return jsonify(rows)

    # Tokenize + stem the query
    terms = tokenize(q)
    if not terms:
        return jsonify([])

    # Look up term IDs
    placeholders = ", ".join(["%s"] * len(terms))
    term_rows = query(
        f"SELECT id, term FROM index_term WHERE term IN ({placeholders})",
        terms
    )
    if not term_rows:
        return jsonify([])

    term_ids = [r["id"] for r in term_rows]

    # Sum weights per part across all matched terms
    placeholders = ", ".join(["%s"] * len(term_ids))
    posting_rows = query(
        f"""
        SELECT part_id, SUM(weight) AS score
        FROM index_posting
        WHERE term_id IN ({placeholders})
        GROUP BY part_id
        ORDER BY score DESC
        """,
        term_ids
    )
    if not posting_rows:
        return jsonify([])

    # Build ordered part_id list
    scored = {r["part_id"]: r["score"] for r in posting_rows}
    part_ids = list(scored.keys())
    placeholders = ", ".join(["%s"] * len(part_ids))

    where_parts = f"WHERE p.id IN ({placeholders})"
    if category:
        where_parts += " AND pc.category_name = %s"
        params = part_ids + [category]
    else:
        params = part_ids

    rows = query(
        f"""
        SELECT
            p.id, p.headline AS name, p.price_usd AS price,
            p.condition, pc.category_name AS category,
            GROUP_CONCAT(DISTINCT v.manufacturer_name ORDER BY v.manufacturer_name SEPARATOR ', ') AS manufacturers,
            GROUP_CONCAT(DISTINCT CONCAT(v.model_name, ' (', pv.bottom_year, '-', pv.top_year, ')')
                ORDER BY v.manufacturer_name SEPARATOR ', ') AS compat
        FROM parts p
        LEFT JOIN prod_cat pc ON p.category_id = pc.id
        LEFT JOIN parts_vehicles pv ON pv.part_id = p.id
        LEFT JOIN vehicles v ON pv.vehicle_id = v.id
        {where_parts}
        GROUP BY p.id
        """,
        params
    )

    # Attach scores and sort
    for row in rows:
        row["score"] = scored.get(row["id"], 0)

    if sort == "price-asc":
        rows.sort(key=lambda r: r["price"] or 0)
    elif sort == "price-desc":
        rows.sort(key=lambda r: r["price"] or 0, reverse=True)
    elif sort == "name":
        rows.sort(key=lambda r: r["name"] or "")
    else:
        rows.sort(key=lambda r: r["score"], reverse=True)

    return jsonify(rows)


@app.route("/api/vehicles")
def vehicles():
    """Return nested year → make → [models] structure for the vehicle selector."""
    rows = query("""
        SELECT DISTINCT
            v.manufacturer_name AS make,
            v.model_name        AS model,
            pv.bottom_year,
            pv.top_year
        FROM vehicles v
        JOIN parts_vehicles pv ON pv.vehicle_id = v.id
        WHERE v.manufacturer_name IS NOT NULL
          AND v.model_name IS NOT NULL
        ORDER BY v.manufacturer_name, v.model_name
    """)

    # Build: { make: { model: Set(years) } }
    data = defaultdict(lambda: defaultdict(set))
    for r in rows:
        make  = r["make"]
        model = r["model"]
        for year in range(int(r["bottom_year"]), int(r["top_year"]) + 1):
            data[make][model].add(year)

    # Serialize to JSON-friendly format
    result = {
        make: {
            model: sorted(years, reverse=True)
            for model, years in models.items()
        }
        for make, models in sorted(data.items())
    }
    return jsonify(result)


@app.route("/api/parts/vehicle")
def parts_by_vehicle():
    year  = request.args.get("year",  type=int)
    make  = request.args.get("make",  "").strip()
    model = request.args.get("model", "").strip()
    cat   = request.args.get("category", "").strip()
    sort  = request.args.get("sort", "").strip()

    if not all([year, make, model]):
        return jsonify({"error": "year, make, and model are required"}), 400

    where = """
        WHERE v.manufacturer_name = %s
          AND v.model_name = %s
          AND pv.bottom_year <= %s
          AND pv.top_year   >= %s
    """
    params = [make, model, year, year]

    if cat:
        where += " AND pc.category_name = %s"
        params.append(cat)

    order = _sort_clause(sort)

    rows = query(
        f"""
        SELECT
            p.id, p.headline AS name, p.price_usd AS price,
            p.condition, pc.category_name AS category,
            v.manufacturer_name AS make, v.model_name AS model,
            pv.bottom_year, pv.top_year
        FROM parts p
        JOIN parts_vehicles pv ON pv.part_id = p.id
        JOIN vehicles v ON pv.vehicle_id = v.id
        LEFT JOIN prod_cat pc ON p.category_id = pc.id
        {where}
        GROUP BY p.id
        {order}
        """,
        params
    )
    return jsonify(rows)


@app.route("/api/brands")
def brands():
    """Return all manufacturers with part counts."""
    rows = query("""
        SELECT
            v.manufacturer_name AS name,
            COUNT(DISTINCT p.id) AS part_count
        FROM vehicles v
        JOIN parts_vehicles pv ON pv.vehicle_id = v.id
        JOIN parts p ON p.id = pv.part_id
        WHERE v.manufacturer_name IS NOT NULL
        GROUP BY v.manufacturer_name
        ORDER BY part_count DESC
    """)
    return jsonify(rows)


@app.route("/api/parts/brand")
def parts_by_brand():
    name = request.args.get("name", "").strip()
    sort = request.args.get("sort", "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400

    order = _sort_clause(sort)
    rows = query(
        f"""
        SELECT
            p.id, p.headline AS name, p.price_usd AS price,
            p.condition, pc.category_name AS category,
            GROUP_CONCAT(DISTINCT CONCAT(v.model_name, ' (', pv.bottom_year, '-', pv.top_year, ')')
                ORDER BY v.model_name SEPARATOR ', ') AS compat
        FROM parts p
        JOIN parts_vehicles pv ON pv.part_id = p.id
        JOIN vehicles v ON pv.vehicle_id = v.id
        LEFT JOIN prod_cat pc ON p.category_id = pc.id
        WHERE v.manufacturer_name = %s
        GROUP BY p.id
        {order}
        """,
        (name,)
    )
    return jsonify(rows)


# ── Sort helper ───────────────────────────────────────────────────────────────

def _sort_clause(sort: str) -> str:
    if sort == "price-asc":
        return "ORDER BY p.price_usd ASC"
    if sort == "price-desc":
        return "ORDER BY p.price_usd DESC"
    if sort == "name":
        return "ORDER BY p.headline ASC"
    return ""


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="ACME Auto Parts Flask API")
    parser.add_argument("--host",       default="localhost")
    parser.add_argument("--port",       default=3306, type=int)
    parser.add_argument("--user",       default="root")
    parser.add_argument("--password",   default="")
    parser.add_argument("--database",   default="parts_marketplace")
    parser.add_argument("--flask-port", default=5000, type=int)
    args = parser.parse_args()

    DB_CONFIG.update({
        "host":     args.host,
        "port":     args.port,
        "user":     args.user,
        "password": args.password,
        "database": args.database,
    })

    print(f"Starting ACME Auto Parts on http://localhost:{args.flask_port}")
    app.run(debug=True, port=args.flask_port)


if __name__ == "__main__":
    main()