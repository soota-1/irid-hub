package repository

import (
	"context"

	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type CommunityRepository struct {
	q *sqlcgen.Queries
}

func NewCommunityRepository(q *sqlcgen.Queries) *CommunityRepository {
	return &CommunityRepository{q: q}
}

var _ domain.CommunityRepository = (*CommunityRepository)(nil)

func (r *CommunityRepository) GetCurrent(ctx context.Context) (*domain.Community, error) {
	c, err := r.q.GetCurrentCommunity(ctx)
	if err != nil {
		return nil, err
	}
	return &domain.Community{
		ID:            c.ID,
		Slug:          c.Slug,
		Name:          c.Name,
		Tagline:       textToPtr(c.Tagline),
		Description:   textToPtr(c.Description),
		LogoURL:       textToPtr(c.LogoUrl),
		CoverImageURL: textToPtr(c.CoverImageUrl),
		PrimaryColor:  textToPtr(c.PrimaryColor),
		CreatedAt:     tsToTime(c.CreatedAt),
		UpdatedAt:     tsToTime(c.UpdatedAt),
	}, nil
}
