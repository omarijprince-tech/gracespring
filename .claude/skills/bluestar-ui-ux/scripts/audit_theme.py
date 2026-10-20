#!/usr/bin/env python3
"""UI/UX + Shopify audit for the Blue Star theme.

Usage: python3 audit_theme.py <theme_dir>

Checks the things that have broken uploads or hurt UX in this project:
section schemas (range steps, select defaults), JSON templates vs schemas,
Liquid pitfalls Shopify rejects, locale keys (EN + ES), color contrast of the
theme palette, one H1 per page, button label/link mismatches and prices typed
into copy. Exit code 1 when any ERROR is found.
"""
import glob
import json
import os
import re
import sys

findings = []


def report(level, where, msg):
    findings.append((level, where, msg))


def strip_comment(text):
    return re.sub(r"^\s*/\*.*?\*/\s*", "", text, flags=re.S)


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.loads(strip_comment(f.read()))


def section_schema(theme, section_type):
    path = os.path.join(theme, "sections", section_type + ".liquid")
    if not os.path.exists(path):
        return None
    m = re.search(r"{% schema %}(.*?){% endschema %}", open(path, encoding="utf-8").read(), re.S)
    return json.loads(m.group(1)) if m else {}


# ---------- schemas ----------
def check_setting_defs(defs, where):
    seen = set()
    for d in defs:
        sid = d.get("id")
        if not sid:
            continue
        if sid in seen:
            report("ERROR", where, f"duplicate setting id '{sid}'")
        seen.add(sid)
        if d.get("type") == "range":
            steps = (d["max"] - d["min"]) / d["step"]
            if not 3 <= steps <= 101:
                report("ERROR", where, f"range '{sid}' has {steps:g} steps (Shopify needs 3–101); use a select")
            default = d.get("default")
            if default is not None and not isinstance(default, (int, float)):
                report("ERROR", where, f"range '{sid}' default {default!r} must be a number")
            elif default is not None and not d["min"] <= default <= d["max"]:
                report("ERROR", where, f"range '{sid}' default {default} outside {d['min']}–{d['max']}")
        if d.get("type") == "select" and "default" in d:
            if d["default"] not in [o["value"] for o in d.get("options", [])]:
                report("ERROR", where, f"select '{sid}' default '{d['default']}' is not an option")


def check_schemas(theme):
    for path in sorted(glob.glob(os.path.join(theme, "sections", "*.liquid"))):
        name = os.path.relpath(path, theme)
        try:
            schema = section_schema(theme, os.path.basename(path)[:-7])
        except json.JSONDecodeError as e:
            report("ERROR", name, f"schema is not valid JSON: {e}")
            continue
        check_setting_defs(schema.get("settings", []), name)
        for block in schema.get("blocks", []):
            check_setting_defs(block.get("settings", []), f"{name} › block {block.get('type')}")
    settings_schema = os.path.join(theme, "config", "settings_schema.json")
    for group in load_json(settings_schema):
        check_setting_defs(group.get("settings", []), f"config/settings_schema.json › {group.get('name')}")


# ---------- templates ----------
def check_values(values, defs, where):
    by_id = {d["id"]: d for d in defs if "id" in d}
    for key, value in values.items():
        d = by_id.get(key)
        if d is None:
            report("ERROR", where, f"setting '{key}' does not exist in the section schema")
            continue
        if d["type"] == "select" and value not in [o["value"] for o in d["options"]]:
            report("ERROR", where, f"'{key}' = '{value}' is not a valid option")
        if d["type"] == "range" and isinstance(value, (int, float)) and not d["min"] <= value <= d["max"]:
            report("ERROR", where, f"'{key}' = {value} outside {d['min']}–{d['max']}")


CALL_WORDS = ("call", "llam", "phone", "teléfono", "telefono")
PRICE_RE = re.compile(r"\$\s?\d")


def check_copy(values, where):
    for key, value in values.items():
        if not isinstance(value, str):
            continue
        if key.endswith("_link") or key.endswith("link"):
            label_key = key.replace("_link", "_label").replace("link", "label")
            label = str(values.get(label_key, "")).lower()
            if not label:
                continue
            if value.startswith("tel:") and not any(w in label for w in CALL_WORDS):
                report("WARN", where, f"button '{values.get(label_key)}' dials the phone ({value}); label should say so or link elsewhere")
            if any(w in label for w in CALL_WORDS) and value and not value.startswith("tel:"):
                report("WARN", where, f"button '{values.get(label_key)}' sounds like a call but links to {value}")
        elif PRICE_RE.search(value) and key not in ("custom_liquid",):
            report("WARN", where, f"price typed into '{key}' ({PRICE_RE.search(value).group(0)}…); prefer the product's live price")


def check_templates(theme):
    files = sorted(glob.glob(os.path.join(theme, "templates", "**", "*.json"), recursive=True))
    files += sorted(glob.glob(os.path.join(theme, "sections", "*.json")))
    for path in files:
        name = os.path.relpath(path, theme)
        data = load_json(path)
        sections = data.get("sections", {})
        h1 = []
        for sid, sec in sections.items():
            where = f"{name} › {sid}"
            schema = section_schema(theme, sec["type"])
            if schema is None:
                report("ERROR", where, f"section type '{sec['type']}' has no sections/{sec['type']}.liquid")
                continue
            settings = sec.get("settings", {})
            check_values(settings, schema.get("settings", []), where)
            if not sec.get("disabled"):
                check_copy(settings, where)
            block_defs = {b.get("type"): b for b in schema.get("blocks", [])}
            blocks = sec.get("blocks", {})
            if blocks and set(sec.get("block_order", [])) != set(blocks):
                report("ERROR", where, "block_order does not match blocks")
            for bid, block in blocks.items():
                bdef = block_defs.get(block["type"])
                if bdef is None and "@app" not in block_defs:
                    report("ERROR", f"{where} › {bid}", f"block type '{block['type']}' not in schema")
                    continue
                if bdef:
                    check_values(block.get("settings", {}), bdef.get("settings", []), f"{where} › {bid}")
                    if not block.get("disabled") and not sec.get("disabled"):
                        check_copy(block.get("settings", {}), f"{where} › {bid}")
            if not sec.get("disabled"):
                if sec["type"] == "hero" and settings.get("heading_tag", "h1") == "h1":
                    h1.append(sid)
                if sec["type"] in ("main-product", "main-collection", "main-page", "main-blog", "main-article",
                                   "main-search", "main-cart", "main-404", "main-contact", "main-list-collections"):
                    h1.append(sid)
        if name.startswith("templates") and len(h1) > 1:
            report("ERROR", name, f"{len(h1)} H1 headings ({', '.join(h1)}); set heading_tag to h2 on all but one")


# ---------- Liquid ----------
def check_liquid(theme):
    for path in sorted(glob.glob(os.path.join(theme, "**", "*.liquid"), recursive=True)):
        name = os.path.relpath(path, theme)
        text = open(path, encoding="utf-8").read()
        for m in re.finditer(r"\{\{(.*?)\}\}", text, re.S):
            for lit in re.findall(r"'([^']*)'", m.group(1)):
                if "{" in lit:
                    line = text[: m.start()].count("\n") + 1
                    report("ERROR", f"{name}:{line}", "brace inside a Liquid string literal; Shopify ends the tag there")
        for m in re.finditer(r"image_tag:[^}%]*?:\s*'[^']*'\s*\|", text):
            line = text[: m.start()].count("\n") + 1
            report("ERROR", f"{name}:{line}", "filter used inside a filter argument; capture the value first")


# ---------- locales ----------
def flatten(d, prefix=""):
    out = {}
    for k, v in d.items():
        key = f"{prefix}{k}"
        if isinstance(v, dict) and not set(v) <= {"one", "other", "zero", "few", "many", "two"}:
            out.update(flatten(v, key + "."))
        else:
            out[key] = v
    return out


def check_locales(theme):
    en = flatten(load_json(os.path.join(theme, "locales", "en.default.json")))
    es_path = os.path.join(theme, "locales", "es.json")
    es = flatten(load_json(es_path)) if os.path.exists(es_path) else {}
    for key in sorted(set(en) - set(es)):
        report("WARN", "locales/es.json", f"missing Spanish translation for '{key}'")
    used = set()
    for path in glob.glob(os.path.join(theme, "**", "*.liquid"), recursive=True):
        used |= set(re.findall(r"'([a-z_0-9]+(?:\.[a-z_0-9]+)+)'\s*\|\s*t\b", open(path, encoding="utf-8").read()))
    for key in sorted(used - set(en)):
        report("ERROR", "locales/en.default.json", f"translation key '{key}' is used but missing")


# ---------- contrast ----------
def luminance(hex_color):
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in (r, g, b)]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast(a, b):
    la, lb = sorted((luminance(a), luminance(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def check_contrast(theme):
    schema = load_json(os.path.join(theme, "config", "settings_schema.json"))
    colors = {d["id"]: d["default"] for g in schema for d in g.get("settings", []) if d.get("type") == "color"}
    data_path = os.path.join(theme, "config", "settings_data.json")
    current = load_json(data_path).get("current", {}) if os.path.exists(data_path) else {}
    if isinstance(current, dict):
        colors.update({k: v for k, v in current.items() if k in colors and isinstance(v, str)})
    white = "#ffffff"
    pairs = [
        ("body text on page", "color_ink", "color_bg", 4.5),
        ("muted text on page", "color_muted", "color_bg", 4.5),
        ("muted text on white cards", "color_muted", None, 4.5),
        ("headings on page", "color_navy", "color_bg", 4.5),
        ("white text on primary buttons", None, "color_blue", 4.5),
        ("white text on dark sections", None, "color_navy", 4.5),
        ("pale text on dark sections", "color_sky_100", "color_navy", 4.5),
        ("links/accents on white", "color_blue", None, 4.5),
        ("dark text on gold badges", "color_navy_900", "color_free", 4.5),
    ]
    for label, fg, bg, need in pairs:
        f = colors.get(fg, white) if fg else white
        b = colors.get(bg, white) if bg else white
        ratio = contrast(f, b)
        if ratio < 3:
            report("ERROR", "colors", f"{label}: {f} on {b} = {ratio:.2f}:1 (needs {need}:1)")
        elif ratio < need:
            report("WARN", "colors", f"{label}: {f} on {b} = {ratio:.2f}:1 (needs {need}:1; ok only for large bold text)")


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    theme = sys.argv[1]
    for check in (check_schemas, check_templates, check_liquid, check_locales, check_contrast):
        check(theme)
    order = {"ERROR": 0, "WARN": 1}
    for level, where, msg in sorted(findings, key=lambda f: order[f[0]]):
        print(f"{level:5} {where}: {msg}")
    errors = sum(1 for f in findings if f[0] == "ERROR")
    warns = len(findings) - errors
    print(f"\n{errors} error(s), {warns} warning(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
