"""Add encrypted patient identity mapping.

Revision ID: 0003_patient_identity_maps
Revises: 0002_medical_images
Create Date: 2026-05-19
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_patient_identity_maps"
down_revision: str | None = "0002_medical_images"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "patient_identity_maps",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("medical_image_id", sa.Integer(), sa.ForeignKey("medical_images.id"), nullable=False),
        sa.Column("created_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("anonymous_patient_id", sa.String(length=64), nullable=False),
        sa.Column("encrypted_original_patient_id", sa.String(length=512), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_patient_identity_maps_id", "patient_identity_maps", ["id"])
    op.create_index("ix_patient_identity_maps_medical_image_id", "patient_identity_maps", ["medical_image_id"])
    op.create_index("ix_patient_identity_maps_created_by_user_id", "patient_identity_maps", ["created_by_user_id"])
    op.create_index("ix_patient_identity_maps_anonymous_patient_id", "patient_identity_maps", ["anonymous_patient_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_patient_identity_maps_anonymous_patient_id", table_name="patient_identity_maps")
    op.drop_index("ix_patient_identity_maps_created_by_user_id", table_name="patient_identity_maps")
    op.drop_index("ix_patient_identity_maps_medical_image_id", table_name="patient_identity_maps")
    op.drop_index("ix_patient_identity_maps_id", table_name="patient_identity_maps")
    op.drop_table("patient_identity_maps")
