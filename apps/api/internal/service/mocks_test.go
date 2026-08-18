package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
)

// Lightweight functional mocks: each field is a func matching one
// interface method, set only what a given test needs. Calling an unset
// method panics with a clear message, which surfaces test bugs fast.

type mockCommunityRepo struct {
	getCurrent func(ctx context.Context) (*domain.Community, error)
}

func (m *mockCommunityRepo) GetCurrent(ctx context.Context) (*domain.Community, error) {
	return m.getCurrent(ctx)
}

type mockUserRepo struct {
	upsertByClerkID func(ctx context.Context, params domain.UpsertUserParams) (*domain.User, error)
	getByClerkID    func(ctx context.Context, clerkUserID string) (*domain.User, error)
	getByID         func(ctx context.Context, id uuid.UUID) (*domain.User, error)
	getByEmail      func(ctx context.Context, email string) (*domain.User, error)
}

func (m *mockUserRepo) UpsertByClerkID(ctx context.Context, params domain.UpsertUserParams) (*domain.User, error) {
	return m.upsertByClerkID(ctx, params)
}
func (m *mockUserRepo) GetByClerkID(ctx context.Context, clerkUserID string) (*domain.User, error) {
	return m.getByClerkID(ctx, clerkUserID)
}
func (m *mockUserRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	return m.getByID(ctx, id)
}
func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	return m.getByEmail(ctx, email)
}

type mockMembershipRepo struct {
	create                func(ctx context.Context, params domain.CreateMembershipParams) (*domain.Membership, error)
	getByID               func(ctx context.Context, id uuid.UUID) (*domain.Membership, error)
	getByCommunityAndUser func(ctx context.Context, communityID, userID uuid.UUID) (*domain.Membership, error)
	list                  func(ctx context.Context, params domain.ListMembershipsParams) ([]domain.Membership, int64, error)
	updateRole            func(ctx context.Context, id uuid.UUID, role domain.MembershipRole) (*domain.Membership, error)
}

func (m *mockMembershipRepo) Create(ctx context.Context, params domain.CreateMembershipParams) (*domain.Membership, error) {
	return m.create(ctx, params)
}
func (m *mockMembershipRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Membership, error) {
	return m.getByID(ctx, id)
}
func (m *mockMembershipRepo) GetByCommunityAndUser(ctx context.Context, communityID, userID uuid.UUID) (*domain.Membership, error) {
	return m.getByCommunityAndUser(ctx, communityID, userID)
}
func (m *mockMembershipRepo) List(ctx context.Context, params domain.ListMembershipsParams) ([]domain.Membership, int64, error) {
	return m.list(ctx, params)
}
func (m *mockMembershipRepo) UpdateRole(ctx context.Context, id uuid.UUID, role domain.MembershipRole) (*domain.Membership, error) {
	return m.updateRole(ctx, id, role)
}

type mockMembershipApplicationRepo struct {
	create            func(ctx context.Context, params domain.CreateMembershipApplicationParams) (*domain.MembershipApplication, error)
	getByID           func(ctx context.Context, id uuid.UUID) (*domain.MembershipApplication, error)
	list              func(ctx context.Context, params domain.ListMembershipApplicationsParams) ([]domain.MembershipApplication, int64, error)
	hasPendingByEmail func(ctx context.Context, communityID uuid.UUID, email string) (bool, error)
	updateStatus      func(ctx context.Context, id uuid.UUID, status domain.MembershipApplicationStatus, reviewedBy uuid.UUID) (*domain.MembershipApplication, error)
}

func (m *mockMembershipApplicationRepo) Create(ctx context.Context, params domain.CreateMembershipApplicationParams) (*domain.MembershipApplication, error) {
	return m.create(ctx, params)
}
func (m *mockMembershipApplicationRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.MembershipApplication, error) {
	return m.getByID(ctx, id)
}
func (m *mockMembershipApplicationRepo) List(ctx context.Context, params domain.ListMembershipApplicationsParams) ([]domain.MembershipApplication, int64, error) {
	return m.list(ctx, params)
}
func (m *mockMembershipApplicationRepo) HasPendingByEmail(ctx context.Context, communityID uuid.UUID, email string) (bool, error) {
	return m.hasPendingByEmail(ctx, communityID, email)
}
func (m *mockMembershipApplicationRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status domain.MembershipApplicationStatus, reviewedBy uuid.UUID) (*domain.MembershipApplication, error) {
	return m.updateStatus(ctx, id, status, reviewedBy)
}

type mockEventRepo struct {
	create     func(ctx context.Context, params domain.CreateEventParams) (*domain.Event, error)
	getByID    func(ctx context.Context, id uuid.UUID) (*domain.Event, error)
	list       func(ctx context.Context, params domain.ListEventsParams) ([]domain.Event, int64, error)
	update     func(ctx context.Context, params domain.UpdateEventParams) (*domain.Event, error)
	softDelete func(ctx context.Context, id uuid.UUID) error
}

func (m *mockEventRepo) Create(ctx context.Context, params domain.CreateEventParams) (*domain.Event, error) {
	return m.create(ctx, params)
}
func (m *mockEventRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Event, error) {
	return m.getByID(ctx, id)
}
func (m *mockEventRepo) List(ctx context.Context, params domain.ListEventsParams) ([]domain.Event, int64, error) {
	return m.list(ctx, params)
}
func (m *mockEventRepo) Update(ctx context.Context, params domain.UpdateEventParams) (*domain.Event, error) {
	return m.update(ctx, params)
}
func (m *mockEventRepo) SoftDelete(ctx context.Context, id uuid.UUID) error {
	return m.softDelete(ctx, id)
}

type mockEventRsvpRepo struct {
	upsert            func(ctx context.Context, eventID, userID uuid.UUID, status domain.EventRsvpStatus) (*domain.EventRsvp, error)
	getByEventAndUser func(ctx context.Context, eventID, userID uuid.UUID) (*domain.EventRsvp, error)
}

func (m *mockEventRsvpRepo) Upsert(ctx context.Context, eventID, userID uuid.UUID, status domain.EventRsvpStatus) (*domain.EventRsvp, error) {
	return m.upsert(ctx, eventID, userID, status)
}
func (m *mockEventRsvpRepo) GetByEventAndUser(ctx context.Context, eventID, userID uuid.UUID) (*domain.EventRsvp, error) {
	return m.getByEventAndUser(ctx, eventID, userID)
}

type mockTrainingScheduleRepo struct {
	create     func(ctx context.Context, params domain.CreateTrainingScheduleParams) (*domain.TrainingSchedule, error)
	getByID    func(ctx context.Context, id uuid.UUID) (*domain.TrainingSchedule, error)
	listActive func(ctx context.Context, communityID uuid.UUID) ([]domain.TrainingSchedule, error)
	update     func(ctx context.Context, params domain.UpdateTrainingScheduleParams) (*domain.TrainingSchedule, error)
	delete     func(ctx context.Context, id uuid.UUID) error
}

func (m *mockTrainingScheduleRepo) Create(ctx context.Context, params domain.CreateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
	return m.create(ctx, params)
}
func (m *mockTrainingScheduleRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.TrainingSchedule, error) {
	return m.getByID(ctx, id)
}
func (m *mockTrainingScheduleRepo) ListActive(ctx context.Context, communityID uuid.UUID) ([]domain.TrainingSchedule, error) {
	return m.listActive(ctx, communityID)
}
func (m *mockTrainingScheduleRepo) Update(ctx context.Context, params domain.UpdateTrainingScheduleParams) (*domain.TrainingSchedule, error) {
	return m.update(ctx, params)
}
func (m *mockTrainingScheduleRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return m.delete(ctx, id)
}

type mockAnnouncementRepo struct {
	create  func(ctx context.Context, params domain.CreateAnnouncementParams) (*domain.Announcement, error)
	getByID func(ctx context.Context, id uuid.UUID) (*domain.Announcement, error)
	list    func(ctx context.Context, params domain.ListAnnouncementsParams) ([]domain.Announcement, int64, error)
	update  func(ctx context.Context, params domain.UpdateAnnouncementParams) (*domain.Announcement, error)
	delete  func(ctx context.Context, id uuid.UUID) error
}

func (m *mockAnnouncementRepo) Create(ctx context.Context, params domain.CreateAnnouncementParams) (*domain.Announcement, error) {
	return m.create(ctx, params)
}
func (m *mockAnnouncementRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Announcement, error) {
	return m.getByID(ctx, id)
}
func (m *mockAnnouncementRepo) List(ctx context.Context, params domain.ListAnnouncementsParams) ([]domain.Announcement, int64, error) {
	return m.list(ctx, params)
}
func (m *mockAnnouncementRepo) Update(ctx context.Context, params domain.UpdateAnnouncementParams) (*domain.Announcement, error) {
	return m.update(ctx, params)
}
func (m *mockAnnouncementRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return m.delete(ctx, id)
}

type mockGalleryRepo struct {
	create  func(ctx context.Context, params domain.CreateGalleryItemParams) (*domain.GalleryItem, error)
	getByID func(ctx context.Context, id uuid.UUID) (*domain.GalleryItem, error)
	list    func(ctx context.Context, params domain.ListGalleryItemsParams) ([]domain.GalleryItem, int64, error)
	delete  func(ctx context.Context, id uuid.UUID) error
}

func (m *mockGalleryRepo) Create(ctx context.Context, params domain.CreateGalleryItemParams) (*domain.GalleryItem, error) {
	return m.create(ctx, params)
}
func (m *mockGalleryRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.GalleryItem, error) {
	return m.getByID(ctx, id)
}
func (m *mockGalleryRepo) List(ctx context.Context, params domain.ListGalleryItemsParams) ([]domain.GalleryItem, int64, error) {
	return m.list(ctx, params)
}
func (m *mockGalleryRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return m.delete(ctx, id)
}

type mockGalleryStorage struct {
	presignUpload func(ctx context.Context, objectKey, contentType string) (string, error)
	publicURL     func(objectKey string) string
	deleteFn      func(ctx context.Context, objectKey string) error
}

func (m *mockGalleryStorage) PresignUpload(ctx context.Context, objectKey, contentType string) (string, error) {
	return m.presignUpload(ctx, objectKey, contentType)
}
func (m *mockGalleryStorage) PublicURL(objectKey string) string { return m.publicURL(objectKey) }
func (m *mockGalleryStorage) Delete(ctx context.Context, objectKey string) error {
	return m.deleteFn(ctx, objectKey)
}

type mockAchievementRepo struct {
	create  func(ctx context.Context, params domain.CreateAchievementParams) (*domain.Achievement, error)
	getByID func(ctx context.Context, id uuid.UUID) (*domain.Achievement, error)
	list    func(ctx context.Context, params domain.ListAchievementsParams) ([]domain.Achievement, int64, error)
	update  func(ctx context.Context, params domain.UpdateAchievementParams) (*domain.Achievement, error)
	delete  func(ctx context.Context, id uuid.UUID) error
}

func (m *mockAchievementRepo) Create(ctx context.Context, params domain.CreateAchievementParams) (*domain.Achievement, error) {
	return m.create(ctx, params)
}
func (m *mockAchievementRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Achievement, error) {
	return m.getByID(ctx, id)
}
func (m *mockAchievementRepo) List(ctx context.Context, params domain.ListAchievementsParams) ([]domain.Achievement, int64, error) {
	return m.list(ctx, params)
}
func (m *mockAchievementRepo) Update(ctx context.Context, params domain.UpdateAchievementParams) (*domain.Achievement, error) {
	return m.update(ctx, params)
}
func (m *mockAchievementRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return m.delete(ctx, id)
}
