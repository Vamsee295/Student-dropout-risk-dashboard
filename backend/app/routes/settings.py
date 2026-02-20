"""
Settings API routes.
Provides endpoints to persist and retrieve application settings.
Settings are stored in a JSON file on the server for simplicity.
"""

import json
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

SETTINGS_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "settings.json"


def _ensure_dir():
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)


def _read_settings() -> Dict[str, Any]:
    if SETTINGS_FILE.exists():
        return json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
    return {}


def _write_settings(data: Dict[str, Any]):
    _ensure_dir()
    SETTINGS_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


class SettingsPayload(BaseModel):
    section: str
    data: Dict[str, Any]


@router.get("/settings")
def get_all_settings():
    """Return all persisted settings."""
    return _read_settings()


@router.get("/settings/{section}")
def get_section_settings(section: str):
    """Return settings for a specific section."""
    all_settings = _read_settings()
    return all_settings.get(section, {})


@router.put("/settings")
def save_settings(payload: SettingsPayload):
    """Persist settings for a specific section."""
    try:
        all_settings = _read_settings()
        all_settings[payload.section] = payload.data
        _write_settings(all_settings)
        return {"success": True, "section": payload.section}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
