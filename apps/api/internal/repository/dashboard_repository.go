package repository

import (
	"context"

	"github.com/google/uuid"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type DashboardRepository struct {
	q *sqlcgen.Queries
}

func NewDashboardRepository(q *sqlcgen.Queries) *DashboardRepository {
	return &DashboardRepository{q: q}
}

func (r *DashboardRepository) CountUpcomingEvents(ctx context.Context, communityID uuid.UUID) (int64, error) {
	return r.q.CountUpcomingEvents(ctx, communityID)
}
