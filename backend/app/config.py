import os
import json
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_ENABLED = bool(GEMINI_API_KEY)

_gemini_model = None
if GEMINI_ENABLED:
    try:
        import google.generativeai as genai

        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel(GEMINI_MODEL)
    except Exception as exc:  # pragma: no cover - defensive, keeps API usable offline
        print(f"[config] Gemini init failed, falling back to templates: {exc}")
        GEMINI_ENABLED = False
        _gemini_model = None


def gemini_generate(prompt: str, fallback: str) -> str:
    """Call Gemini if configured; otherwise return a deterministic template fallback.

    Keeps every downstream feature demoable with zero external dependency, and
    upgrades transparently to real GenAI content the moment a key is supplied.
    """
    if not GEMINI_ENABLED or _gemini_model is None:
        return fallback
    try:
        response = _gemini_model.generate_content(prompt)
        text = (response.text or "").strip()
        return text if text else fallback
    except Exception as exc:  # pragma: no cover - network/quota failures
        print(f"[config] Gemini call failed, using fallback: {exc}")
        return fallback


TAXONOMY_PATH = Path(__file__).resolve().parent / "taxonomy.json"


def load_taxonomy() -> list[dict]:
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["vectors"]
