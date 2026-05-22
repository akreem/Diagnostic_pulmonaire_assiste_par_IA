"""Create analysis history

Revision ID: 2b7f3a8c9d10
Revises: 1f725101fe59
Create Date: 2026-05-22 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2b7f3a8c9d10"
down_revision: Union[str, None] = "1f725101fe59"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


analysis_history_status = sa.Enum("pending", "completed", "failed", name="analysishistorystatus")


def upgrade() -> None:
    analysis_history_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "analysis_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_user_id", sa.Integer(), nullable=False),
        sa.Column("medical_image_id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("analysis_status", analysis_history_status, nullable=False),
        sa.Column("prediction", sa.String(length=50), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("latency_ms", sa.Float(), nullable=True),
        sa.Column("severity", sa.String(length=32), nullable=True),
        sa.Column("is_ambiguous", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("gradcam_path", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["medical_image_id"], ["medical_images.id"]),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_analysis_history_id"), "analysis_history", ["id"], unique=False)
    op.create_index(op.f("ix_analysis_history_owner_user_id"), "analysis_history", ["owner_user_id"], unique=False)
    op.create_index(op.f("ix_analysis_history_medical_image_id"), "analysis_history", ["medical_image_id"], unique=False)
    op.create_index(op.f("ix_analysis_history_analysis_status"), "analysis_history", ["analysis_status"], unique=False)
    op.create_index(op.f("ix_analysis_history_prediction"), "analysis_history", ["prediction"], unique=False)
    op.create_index(op.f("ix_analysis_history_severity"), "analysis_history", ["severity"], unique=False)
    op.create_index(op.f("ix_analysis_history_created_at"), "analysis_history", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_analysis_history_created_at"), table_name="analysis_history")
    op.drop_index(op.f("ix_analysis_history_severity"), table_name="analysis_history")
    op.drop_index(op.f("ix_analysis_history_prediction"), table_name="analysis_history")
    op.drop_index(op.f("ix_analysis_history_analysis_status"), table_name="analysis_history")
    op.drop_index(op.f("ix_analysis_history_medical_image_id"), table_name="analysis_history")
    op.drop_index(op.f("ix_analysis_history_owner_user_id"), table_name="analysis_history")
    op.drop_index(op.f("ix_analysis_history_id"), table_name="analysis_history")
    op.drop_table("analysis_history")
    analysis_history_status.drop(op.get_bind(), checkfirst=True)
