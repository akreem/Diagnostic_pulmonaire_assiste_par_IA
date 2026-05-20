"""Add medical image upload metadata.

Revision ID: 0002_medical_images
Revises: 0001_initial_auth_audit
Create Date: 2026-05-19
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM as PGEnum

revision: str = "0002_medical_images"
down_revision: str | None = "0001_initial_auth_audit"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    image_status = PGEnum(
        "uploaded",
        "validation_failed",
        "validated",
        "anonymized",
        name="medicalimagestatus",
        create_type=False,
    )
    image_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "medical_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("owner_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=512), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("file_extension", sa.String(length=16), nullable=False),
        sa.Column("file_size_bytes", sa.Integer(), nullable=False),
        sa.Column("encrypted_size_bytes", sa.Integer(), nullable=False),
        sa.Column("checksum_sha256", sa.String(length=64), nullable=False),
        sa.Column("status", image_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_medical_images_id", "medical_images", ["id"])
    op.create_index("ix_medical_images_owner_user_id", "medical_images", ["owner_user_id"])
    op.create_index("ix_medical_images_stored_filename", "medical_images", ["stored_filename"], unique=True)
    op.create_index("ix_medical_images_checksum_sha256", "medical_images", ["checksum_sha256"])
    op.create_index("ix_medical_images_status", "medical_images", ["status"])


def downgrade() -> None:
    op.drop_index("ix_medical_images_status", table_name="medical_images")
    op.drop_index("ix_medical_images_checksum_sha256", table_name="medical_images")
    op.drop_index("ix_medical_images_stored_filename", table_name="medical_images")
    op.drop_index("ix_medical_images_owner_user_id", table_name="medical_images")
    op.drop_index("ix_medical_images_id", table_name="medical_images")
    op.drop_table("medical_images")
    sa.Enum(name="medicalimagestatus").drop(op.get_bind(), checkfirst=True)
