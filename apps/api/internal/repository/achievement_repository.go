package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

type AchievementRepository struct {
	q *sqlcgen.Queries
}

func NewAchievementRepository(q *sqlcgen.Queries) *AchievementRepository {
	return &AchievementRepository{q: q}
}

var _ domain.AchievementRepository = (*AchievementRepository)(nil)

func toDomainAchievement(a sqlcgen.Achievement) *domain.Achievement {
	return &domain.Achievement{
		ID:             a.ID,
		CommunityID:    a.CommunityID,
		Title:          a.Title,
		Description:    textToPtr(a.Description),
		AchievedAt:     dateToTime(a.AchievedAt),
		IconOrBadgeURL: textToPtr(a.IconOrBadgeUrl),
		MemberID:       uuidToPtr(a.MemberID),
		CreatedAt:      tsToTime(a.CreatedAt),
		UpdatedAt:      tsToTime(a.UpdatedAt),
	}
}

func (r *AchievementRepository) Create(ctx context.Context, params domain.CreateAchievementParams) (*domain.Achievement, error) {
	a, err := r.q.CreateAchievement(ctx, sqlcgen.CreateAchievementParams{
		CommunityID:    params.CommunityID,
		Title:          params.Title,
		Description:    ptrToText(params.Description),
		AchievedAt:     timeToDate(params.AchievedAt),
		IconOrBadgeUrl: ptrToText(params.IconOrBadgeURL),
		MemberID:       ptrToUUID(params.MemberID),
	})
	if err != nil {
		return nil, err
	}
	return toDomainAchievement(a), nil
}

func (r *AchievementRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Achievement, error) {
	a, err := r.q.GetAchievementByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toDomainAchievement(a), nil
}

func (r *AchievementRepository) List(ctx context.Context, params domain.ListAchievementsParams) ([]domain.Achievement, int64, error) {
	offset := (params.Page - 1) * params.PerPage
	rows, err := r.q.ListAchievements(ctx, sqlcgen.ListAchievementsParams{
		CommunityID: params.CommunityID,
		PageLimit:   int32(params.PerPage),
		PageOffset:  int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}

	total, err := r.q.CountAchievements(ctx, params.CommunityID)
	if err != nil {
		return nil, 0, err
	}

	result := make([]domain.Achievement, 0, len(rows))
	for _, a := range rows {
		result = append(result, *toDomainAchievement(a))
	}
	return result, total, nil
}

func (r *AchievementRepository) Update(ctx context.Context, params domain.UpdateAchievementParams) (*domain.Achievement, error) {
	a, err := r.q.UpdateAchievement(ctx, sqlcgen.UpdateAchievementParams{
		ID:             params.ID,
		Title:          params.Title,
		Description:    ptrToText(params.Description),
		AchievedAt:     timeToDate(params.AchievedAt),
		IconOrBadgeUrl: ptrToText(params.IconOrBadgeURL),
		MemberID:       ptrToUUID(params.MemberID),
	})
	if err != nil {
		return nil, err
	}
	return toDomainAchievement(a), nil
}

func (r *AchievementRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.q.DeleteAchievement(ctx, id)
}
