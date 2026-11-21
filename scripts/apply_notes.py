"""
Copy notes from data/notes.json into src/data/products.json without re-importing photos.

import_catalog.py does the same while importing, but it needs the Telegram export folder.
Run this after editing data/notes.json:
  python scripts/apply_notes.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOTES = ROOT / "data" / "notes.json"
PRODUCTS = ROOT / "src" / "data" / "products.json"


def main() -> None:
    notes = {k: v for k, v in json.loads(NOTES.read_text(encoding="utf-8")).items() if not k.startswith("_")}
    products = json.loads(PRODUCTS.read_text(encoding="utf-8"))
    for p in products:
        n = notes.get(str(p["order"]))
        if n:
            p["notes"] = n
        else:
            p.pop("notes", None)
    PRODUCTS.write_text(json.dumps(products, ensure_ascii=False, indent=1), encoding="utf-8")
    with_notes = sum(1 for p in products if "notes" in p)
    print(f"{len(products)} products ({with_notes} with notes) -> {PRODUCTS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
