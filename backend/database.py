"""
CoastGuard — Database engine setup.

Modes (controlled by .env):
  1. SQLite (default)      — DATABASE_URL=sqlite:///./coastguard.db
  2. Aurora + password     — DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/dbname
  3. Aurora + IAM auth     — AURORA_USE_IAM_AUTH=true + AURORA_HOST / AURORA_USER / AURORA_DB / AURORA_REGION

For mode 3, boto3 generates a fresh 15-minute auth token for every new
connection.  pool_recycle=840 (14 min) ensures connections are replaced before
the token expires, so the pool never hands out a stale credential.
"""

import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_is_postgres = settings.aurora_use_iam_auth or (
    not settings.database_url.startswith("sqlite")
)


# ── IAM auth helpers ──────────────────────────────────────────────────────────

def _iam_token() -> str:
    """Generate a fresh RDS IAM auth token via boto3."""
    import boto3

    boto_kwargs = {"region_name": settings.aurora_region}
    if settings.aws_access_key_id:
        boto_kwargs["aws_access_key_id"] = settings.aws_access_key_id
    if settings.aws_secret_access_key:
        boto_kwargs["aws_secret_access_key"] = settings.aws_secret_access_key
    if settings.aws_session_token:
        boto_kwargs["aws_session_token"] = settings.aws_session_token

    client = boto3.client("rds", **boto_kwargs)
    return client.generate_db_auth_token(
        DBHostname=settings.aurora_host,
        Port=settings.aurora_port,
        DBUsername=settings.aurora_user,
        Region=settings.aurora_region,
    )


def _iam_creator():
    """
    Return a callable that psycopg2-connects with a fresh IAM token each time.
    SQLAlchemy calls this for every new physical connection, so the token is
    always fresh even after pool_recycle.
    """
    import psycopg2

    def _connect():
        token = _iam_token()
        logger.debug("Aurora IAM token refreshed for %s@%s", settings.aurora_user, settings.aurora_host)
        return psycopg2.connect(
            host=settings.aurora_host,
            port=settings.aurora_port,
            user=settings.aurora_user,
            password=token,
            dbname=settings.aurora_db,
            sslmode="require",
        )

    return _connect


# ── Engine factory ────────────────────────────────────────────────────────────

def _make_engine():
    # ── Mode 3: Aurora + IAM auth ─────────────────────────────────────────────
    if settings.aurora_use_iam_auth:
        if not settings.aurora_host:
            raise ValueError(
                "AURORA_HOST must be set when AURORA_USE_IAM_AUTH=true. "
                "Check your .env file."
            )
        logger.info(
            "Connecting to Aurora via IAM auth: %s@%s:%s/%s",
            settings.aurora_user, settings.aurora_host,
            settings.aurora_port, settings.aurora_db,
        )
        engine = create_engine(
            "postgresql+psycopg2://",   # dialect only; creator() overrides the URL
            creator=_iam_creator(),
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_recycle=840,           # 14 min < 15-min IAM token lifetime
            echo=settings.debug,
        )
        _register_pgvector(engine)
        return engine

    url = settings.database_url

    # ── Mode 1: SQLite ────────────────────────────────────────────────────────
    if url.startswith("sqlite"):
        logger.info("Using SQLite database: %s", url)
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            echo=settings.debug,
        )

    # ── Mode 2: Aurora / PostgreSQL with password in DATABASE_URL ─────────────
    logger.info("Connecting to PostgreSQL: %s", url)
    engine = create_engine(
        url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=1800,
        echo=settings.debug,
    )
    _register_pgvector(engine)
    return engine


def _register_pgvector(engine):
    """Enable pgvector extension on first connect (no-op if not available)."""
    from sqlalchemy import event

    @event.listens_for(engine, "connect")
    def _enable_pgvector(dbapi_conn, connection_record):
        try:
            cursor = dbapi_conn.cursor()
            cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            dbapi_conn.commit()
            cursor.close()
        except Exception as exc:
            logger.warning("pgvector extension not available: %s", exc)

    try:
        from pgvector.sqlalchemy import Vector  # noqa: F401 — registers the type
        logger.info("pgvector registered with SQLAlchemy")
    except ImportError:
        logger.warning("pgvector not installed — Vector columns unavailable. Run: pip install pgvector")


# ── Public objects ────────────────────────────────────────────────────────────

engine = _make_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """Health-check helper used by /api/health."""
    try:
        with engine.connect() as conn:
            if _is_postgres:
                row = conn.execute(text("SELECT version()")).fetchone()
                return {"status": "ok", "backend": "postgresql", "version": str(row[0])}
            else:
                conn.execute(text("SELECT 1"))
                return {"status": "ok", "backend": "sqlite"}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}
