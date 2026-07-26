from typing import Any, Dict, Optional
from datetime import datetime, timedelta
import threading

class CacheEntry:
    def __init__(self, value: Any, ttl_seconds: int = 300):
        self.value = value
        self.expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)

    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at


class CacheManager:
    """
    A simple, thread-safe in-memory cache manager.
    Can be replaced with Redis later without changing the interface.
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(CacheManager, cls).__new__(cls)
                cls._instance._store: Dict[str, CacheEntry] = {}
            return cls._instance

    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        with self._lock:
            self._store[key] = CacheEntry(value, ttl_seconds)

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            if entry.is_expired():
                del self._store[key]
                return None
            return entry.value

    def delete(self, key: str):
        with self._lock:
            if key in self._store:
                del self._store[key]

    def invalidate_prefix(self, prefix: str):
        with self._lock:
            keys_to_delete = [k for k in self._store.keys() if k.startswith(prefix)]
            for k in keys_to_delete:
                del self._store[k]
                
    def clear(self):
        with self._lock:
            self._store.clear()


# Global instance
cache = CacheManager()
