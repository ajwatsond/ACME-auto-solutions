"""
clean_data.py — parts marketplace cleaner + MySQL importer
Same approach as DataImporter.py — uses mysql.connector directly.

Usage
-----
  # Clean only
  py clean_data.py

  # Clean + import into MySQL
  py clean_data.py --import-db --password yourpassword

Dependencies: pip install pandas mysql-connector-python
"""

import argparse
import os
import random
import re
import math

import pandas as pd

# ── Config ────────────────────────────────────────────────────────────────────

RANDOM_SEED = 42

GENERIC_ADDRESSES = [
    "Tbilisi, Vake district", "Tbilisi, Saburtalo district",
    "Tbilisi, Didube district", "Tbilisi, Gldani district",
    "Tbilisi, Isani district", "Tbilisi, Samgori district",
    "Tbilisi, Nadzaladevi district", "Tbilisi, Chugureti district",
    "Tbilisi, Mtatsminda district", "Tbilisi, Krtsanisi district",
]

GENERIC_PART_NAMES = [
    "Auto Part", "Engine Component", "Body Part", "Electrical Component",
    "Suspension Part", "Brake Component", "Transmission Part",
    "Cooling System Part", "Exhaust Component", "Fuel System Part",
    "Interior Component", "Lighting Component", "Steering Part",
    "Drivetrain Component", "Filter Component",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def has_georgian(text):
    return bool(re.search(r"[\u10D0-\u10FF\u10A0-\u10CF]", str(text)))

def extract_latin(text):
    cleaned = re.sub(r"[^\x00-\x7F]+", " ", str(text))
    cleaned = re.sub(r"[^A-Za-z0-9 \-/.,#&()']", " ", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip().strip(",-./").strip()

def random_phone():
    return f"+995 5{random.randint(10,99)} {random.randint(100,999)} {random.randint(100,999)}"

def random_part_name():
    return f"{random.choice(GENERIC_PART_NAMES)} {random.randint(1000,9999)}"

def safe(value):
    """Return None for NaN, otherwise pass the value through."""
    try:
        if value is None or math.isnan(float(value)):
            return None
    except (TypeError, ValueError):
        pass
    return value

# ── Cleaning ──────────────────────────────────────────────────────────────────

def clean_sellers(df):
    df = df.copy()
    df.columns = df.columns.str.lstrip("\ufeff")

    mask = df["seller_name"].apply(has_georgian)
    df.loc[mask, "seller_name"] = "Unknown"
    print(f"  seller_name:   {mask.sum()} Georgian names → 'Unknown'")

    def fix_addr(addr):
        if has_georgian(addr):
            latin = extract_latin(addr)
            if len(latin) < 5 or re.match(r"^Tbilisi\s*$", latin, re.I):
                return random.choice(GENERIC_ADDRESSES)
            return latin
        return str(addr).strip()

    n = df["address"].apply(has_georgian).sum()
    df["address"] = df["address"].apply(fix_addr)
    print(f"  address:       {n} Georgian/mixed → cleaned")

    df["mobile_number"] = [random_phone() for _ in range(len(df))]
    print(f"  mobile_number: {len(df)} numbers → random Georgian mobile")
    return df

def clean_applications(df):
    df = df.copy()
    df.columns = df.columns.str.lstrip("\ufeff")

    def fix_headline(h):
        if pd.isna(h):
            return random_part_name()
        if has_georgian(h):
            latin = extract_latin(h)
            result = latin.strip() if len(latin) >= 4 else random_part_name()
            return result[:255]
        result = str(h).strip()
        return result[:255]  # truncate to VARCHAR(255)

    nulls    = df["headline"].isna().sum()
    georgian = df["headline"].apply(lambda h: not pd.isna(h) and has_georgian(h)).sum()
    df["headline"] = df["headline"].apply(fix_headline)
    print(f"  headline: {nulls} nulls + {georgian} Georgian → cleaned")
    return df

def clean_product_category(df):
    df = df.copy()
    df.columns = df.columns.str.lstrip("\ufeff")
    mask = df["category_name"].isna()
    df.loc[mask, "category_name"] = "Steering Component"
    print(f"  category_name: {mask.sum()} null(s) → 'Steering Component'")
    return df

def clean_compatibility(df):
    df = df.copy()
    before = len(df)
    df = df.drop_duplicates()
    print(f"  duplicates: {before - len(df)} rows dropped")
    bad = df["bottom_year"] > df["top_year"]
    df.loc[bad, ["bottom_year","top_year"]] = df.loc[bad, ["top_year","bottom_year"]].values
    print(f"  year order: {bad.sum()} rows corrected")
    return df

# ── Database import ───────────────────────────────────────────────────────────

def import_to_db(cleaned, host, port, user, password, database):
    try:
        import mysql.connector
    except ImportError:
        print("\nERROR: Run: pip install mysql-connector-python")
        return

    print(f"\nConnecting to {host}:{port}/{database} ...")
    conn = mysql.connector.connect(
        host=host, port=port, user=user, password=password, database=database
    )
    conn.autocommit = False
    cursor = conn.cursor()

    # Disable FK checks so we can delete/insert in any order
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

    # application_status
    print("Loading application_status ...", end=" ", flush=True)
    cursor.execute("DELETE FROM application_status")
    for r in cleaned["application_status.csv"].itertuples(index=False):
        cursor.execute(
            "INSERT INTO application_status (id, status_name) VALUES (%s,%s)",
            (r.id, r.status_name)
        )
    conn.commit()
    print(f"{len(cleaned['application_status.csv'])} rows")

    # vehicle_type
    print("Loading vehicle_type ...", end=" ", flush=True)
    cursor.execute("DELETE FROM vehicle_type")
    for r in cleaned["vehicle_type.csv"].itertuples(index=False):
        cursor.execute(
            "INSERT INTO vehicle_type (id, type_name) VALUES (%s,%s)",
            (r.id, r.type_name)
        )
    conn.commit()
    print(f"{len(cleaned['vehicle_type.csv'])} rows")

    # seller
    print("Loading seller ...", end=" ", flush=True)
    cursor.execute("DELETE FROM seller")
    for r in cleaned["seller.csv"].itertuples(index=False):
        cursor.execute(
            "INSERT INTO seller (id, seller_name, address, mobile_number) VALUES (%s,%s,%s,%s)",
            (r.id, r.seller_name, safe(r.address), safe(r.mobile_number))
        )
    conn.commit()
    print(f"{len(cleaned['seller.csv'])} rows")

    # prod_cat
    print("Loading prod_cat ...", end=" ", flush=True)
    cursor.execute("DELETE FROM prod_cat")
    for r in cleaned["product_category.csv"].itertuples(index=False):
        cursor.execute(
            "INSERT INTO prod_cat (id, category_name, parent_category_id) VALUES (%s,%s,%s)",
            (r.id, r.category_name, safe(r.parent_category_id))
        )
    conn.commit()
    print(f"{len(cleaned['product_category.csv'])} rows")

    # vehicles
    print("Loading vehicles ...", end=" ", flush=True)
    cursor.execute("DELETE FROM vehicles")
    for r in cleaned["vehicles.csv"].itertuples(index=False):
        cursor.execute(
            "INSERT INTO vehicles (id, model_name, manufacturer_name, vehicle_type_id) VALUES (%s,%s,%s,%s)",
            (r.id, safe(r.model_name), safe(r.manufacturer_name), safe(r.vehicle_type_id))
        )
    conn.commit()
    print(f"{len(cleaned['vehicles.csv'])} rows")

    # parts
    print("Loading parts ...", end=" ", flush=True)
    cursor.execute("DELETE FROM parts")
    df = cleaned["applications.csv"]
    for i, r in enumerate(df.itertuples(index=False)):
        cursor.execute("""
            INSERT INTO parts
                (id, headline, price_gel, price_usd, app_register_date,
                 status_id, category_id, vehicle_type_id, seller_id,
                 `condition`, insert_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            r.app_id, r.headline,
            safe(r.price_gel), safe(r.price_usd),
            safe(r.app_register_date),
            safe(r.status_id), safe(r.category_id),
            safe(r.vehicle_type_id), r.seller_id,
            r.item_condition, safe(r.insert_date),
        ))
        if (i + 1) % 5000 == 0:
            conn.commit()
            print(f"{i+1}...", end=" ", flush=True)
    conn.commit()
    print(f"{len(df)} rows")

    # parts_vehicles
    print("Loading parts_vehicles ...", end=" ", flush=True)
    cursor.execute("DELETE FROM parts_vehicles")
    df = cleaned["compatibility.csv"]
    for i, r in enumerate(df.itertuples(index=False)):
        cursor.execute(
            "INSERT INTO parts_vehicles (part_id, vehicle_id, bottom_year, top_year) VALUES (%s,%s,%s,%s)",
            (r.app_id, r.vehicles_id, r.bottom_year, r.top_year)
        )
        if (i + 1) % 5000 == 0:
            conn.commit()
            print(f"{i+1}...", end=" ", flush=True)
    conn.commit()
    print(f"{len(df)} rows")

    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    conn.commit()
    cursor.close()
    conn.close()
    print("\nAll tables loaded successfully.")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Clean + import parts marketplace data")
    parser.add_argument("--input-dir",  default="input")
    parser.add_argument("--output-dir", default="output")
    parser.add_argument("--import-db",  action="store_true")
    parser.add_argument("--host",       default="localhost")
    parser.add_argument("--port",       default=3306, type=int)
    parser.add_argument("--user",       default="root")
    parser.add_argument("--password",   default="")
    parser.add_argument("--database",   default="parts_marketplace")
    args = parser.parse_args()

    random.seed(RANDOM_SEED)
    os.makedirs(args.output_dir, exist_ok=True)

    cleaning_steps = [
        ("seller.csv",           clean_sellers),
        ("applications.csv",     clean_applications),
        ("product_category.csv", clean_product_category),
        ("compatibility.csv",    clean_compatibility),
    ]
    passthrough = ["vehicles.csv", "vehicle_type.csv", "application_status.csv"]

    cleaned = {}

    for filename, clean_fn in cleaning_steps:
        print(f"\nCleaning {filename} ...")
        df = pd.read_csv(os.path.join(args.input_dir, filename))
        df = clean_fn(df)
        df.to_csv(os.path.join(args.output_dir, filename), index=False)
        cleaned[filename] = df
        print(f"  → saved to {args.output_dir}/{filename}")

    for filename in passthrough:
        df = pd.read_csv(os.path.join(args.input_dir, filename))
        df.to_csv(os.path.join(args.output_dir, filename), index=False)
        cleaned[filename] = df
        print(f"\nCopied {filename}")

    print(f"\nCleaning complete. Files in: {args.output_dir}")

    if args.import_db:
        import_to_db(cleaned, args.host, args.port, args.user, args.password, args.database)

if __name__ == "__main__":
    main()