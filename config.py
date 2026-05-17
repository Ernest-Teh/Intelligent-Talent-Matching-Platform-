import os
from datetime import timedelta


class Config:
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-secret-key-change-later")

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)

    # ── Supabase PostgreSQL ──────────────────────────────────────────
    # Replace YOUR_PASSWORD_HERE with your actual Supabase database password
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres.qrudvmruhboyondqwsxx:saadbinwaleed@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }