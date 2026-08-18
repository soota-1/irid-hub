package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

type AnnouncementService struct {
	repo domain.AnnouncementRepository
}

func NewAnnouncementService(repo domain.AnnouncementRepository) *AnnouncementService {
	return &AnnouncementService{repo: repo}
}

func (s *AnnouncementService) ListPublic(ctx context.Context, communityID uuid.UUID, page, perPage int) ([]domain.Announcement, int64, error) {
	page, perPage = normalizePage(page, perPage)
	items, total, err := s.repo.List(ctx, domain.ListAnnouncementsParams{
		CommunityID:    communityID,
		IncludeMembers: false,
		Page:           page,
		PerPage:        perPage,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list public announcements: %w", err)
	}
	return items, total, nil
}

// ListInternal requires the caller to already be an authenticated,
// active member — enforced by middleware.RequireRole on the route.
func (s *AnnouncementService) ListInternal(ctx context.Context, communityID uuid.UUID, page, perPage int) ([]domain.Announcement, int64, error) {
	page, perPage = normalizePage(page, perPage)
	items, total, err := s.repo.List(ctx, domain.ListAnnouncementsParams{
		CommunityID:    communityID,
		IncludeMembers: true,
		Page:           page,
		PerPage:        perPage,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("list internal announcements: %w", err)
	}
	return items, total, nil
}

// ListForAdmin is admin-only: includes drafts and members_only entries
// regardless of published state — Task.md Phase 2.4.
func (s *AnnouncementService) ListForAdmin(ctx context.Context, communityID uuid.UUID, page, perPage int) ([]domain.Announcement, int64, error) {
	page, perPage = normalizePage(page, perPage)
	items, total, err := s.repo.ListAll(ctx, domain.ListAllAnnouncementsParams{CommunityID: communityID, Page: page, PerPage: perPage})
	if err != nil {
		return nil, 0, fmt.Errorf("list announcements for admin: %w", err)
	}
	return items, total, nil
}

func (s *AnnouncementService) Create(ctx context.Context, params domain.CreateAnnouncementParams) (*domain.Announcement, error) {
	if err := validateAnnouncementFields(params.Title, params.Content, params.Urgency, params.Visibility); err != nil {
		return nil, err
	}
	a, err := s.repo.Create(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("create announcement: %w", err)
	}
	return a, nil
}

func (s *AnnouncementService) Update(ctx context.Context, params domain.UpdateAnnouncementParams) (*domain.Announcement, error) {
	if err := validateAnnouncementFields(params.Title, params.Content, params.Urgency, params.Visibility); err != nil {
		return nil, err
	}
	a, err := s.repo.Update(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("update announcement: %w", wrapNotFound(err))
	}
	return a, nil
}

func (s *AnnouncementService) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete announcement: %w", wrapNotFound(err))
	}
	return nil
}

func validateAnnouncementFields(title, content string, urgency domain.AnnouncementUrgency, visibility domain.AnnouncementVisibility) error {
	fields := map[string]string{}
	if title == "" {
		fields["title"] = "wajib diisi"
	}
	if content == "" {
		fields["content"] = "wajib diisi"
	}
	if !urgency.Valid() {
		fields["urgency"] = "harus salah satu dari: info, warning, important"
	}
	if !visibility.Valid() {
		fields["visibility"] = "harus salah satu dari: public, members_only"
	}
	if len(fields) > 0 {
		return &ValidationErr{Fields: fields}
	}
	return nil
}
