"""
CoastGuard — Initialize SQLite database.

Run once before starting the server:
  python scripts/init_db.py
"""

import sys
import os

# Allow imports from backend/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, engine
import models  # noqa: F401 — registers all models with Base

Base.metadata.create_all(bind=engine)
print("Database tables created successfully.")
print("Tables:", list(Base.metadata.tables.keys()))
