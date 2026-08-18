package http

import (
	"github.com/MicahParks/keyfunc/v3"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/soota-1/irid-hub/apps/api/internal/config"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/handler"
	"github.com/soota-1/irid-hub/apps/api/internal/http/middleware"
	"github.com/soota-1/irid-hub/apps/api/internal/repository"
	"github.com/soota-1/irid-hub/apps/api/internal/service"
	"github.com/soota-1/irid-hub/apps/api/internal/storage"

	sqlcgen "github.com/soota-1/irid-hub/apps/api/internal/repository/sqlc/gen"
)

// NewRouter wires repositories → services → handlers and registers every
// route from Task.md Phase 1 behind the appropriate middleware.
func NewRouter(cfg *config.Config, pool *pgxpool.Pool, jwks keyfunc.Keyfunc, logger zerolog.Logger) *gin.Engine {
	q := sqlcgen.New(pool)

	communityRepo := repository.NewCommunityRepository(q)
	userRepo := repository.NewUserRepository(q)
	membershipRepo := repository.NewMembershipRepository(q)
	applicationRepo := repository.NewMembershipApplicationRepository(q)
	eventRepo := repository.NewEventRepository(q)
	eventRsvpRepo := repository.NewEventRsvpRepository(q)
	scheduleRepo := repository.NewTrainingScheduleRepository(q)
	announcementRepo := repository.NewAnnouncementRepository(q)
	galleryRepo := repository.NewGalleryRepository(q)
	achievementRepo := repository.NewAchievementRepository(q)
	dashboardRepo := repository.NewDashboardRepository(q)

	r2Client := storage.NewR2Client(storage.Config{
		AccountID:       cfg.R2AccountID,
		AccessKeyID:     cfg.R2AccessKeyID,
		SecretAccessKey: cfg.R2SecretAccessKey,
		BucketName:      cfg.R2BucketName,
		S3Endpoint:      cfg.R2S3Endpoint,
		PublicURL:       cfg.R2PublicURL,
	})

	communitySvc := service.NewCommunityService(communityRepo)
	userSvc := service.NewUserService(userRepo)
	membershipSvc := service.NewMembershipService(membershipRepo)
	applicationSvc := service.NewMembershipApplicationService(applicationRepo, membershipRepo, userRepo, communityRepo)
	eventSvc := service.NewEventService(eventRepo)
	eventRsvpSvc := service.NewEventRsvpService(eventRsvpRepo, eventRepo)
	scheduleSvc := service.NewTrainingScheduleService(scheduleRepo)
	announcementSvc := service.NewAnnouncementService(announcementRepo)
	gallerySvc := service.NewGalleryService(galleryRepo, r2Client)
	achievementSvc := service.NewAchievementService(achievementRepo)
	dashboardSvc := service.NewAdminDashboardService(membershipRepo, applicationRepo, dashboardRepo)

	healthH := handler.NewHealthHandler(pool)
	communityH := handler.NewCommunityHandler(communitySvc)
	userH := handler.NewUserHandler(userSvc, cfg.ClerkWebhookSigningSecret)
	membershipH := handler.NewMembershipHandler(membershipSvc, communityRepo)
	applicationH := handler.NewMembershipApplicationHandler(applicationSvc, communityRepo)
	eventH := handler.NewEventHandler(eventSvc, eventRsvpSvc, communityRepo)
	scheduleH := handler.NewTrainingScheduleHandler(scheduleSvc, communityRepo)
	announcementH := handler.NewAnnouncementHandler(announcementSvc, communityRepo)
	galleryH := handler.NewGalleryHandler(gallerySvc, communityRepo)
	achievementH := handler.NewAchievementHandler(achievementSvc, communityRepo)
	dashboardH := handler.NewAdminDashboardHandler(dashboardSvc, communityRepo)

	engine := gin.New()
	engine.Use(gin.Recovery())
	engine.Use(middleware.Logging(logger))
	engine.Use(middleware.CORS(cfg.CORSAllowedOrigins))

	auth := middleware.Auth(userRepo, jwks)
	requireMember := middleware.RequireRole(communityRepo, membershipRepo, domain.MembershipRoleMember)
	requireOfficer := middleware.RequireRole(communityRepo, membershipRepo, domain.MembershipRoleOfficer)
	requireAdmin := middleware.RequireRole(communityRepo, membershipRepo, domain.MembershipRoleAdmin)
	publicRateLimit := middleware.RateLimit(cfg.RateLimitRequestsPerMinute)

	engine.GET("/health", healthH.Check)

	v1 := engine.Group("/api/v1")
	{
		v1.GET("/community", communityH.GetCurrent)
		v1.POST("/webhooks/clerk", userH.HandleClerkWebhook)

		v1.GET("/users/me", auth, userH.GetMe)

		v1.GET("/members", auth, requireAdmin, membershipH.List)
		v1.PATCH("/members/:id/role", auth, requireAdmin, membershipH.UpdateRole)

		v1.POST("/membership-applications", publicRateLimit, applicationH.Submit)
		v1.GET("/membership-applications", auth, requireAdmin, applicationH.List)
		v1.PATCH("/membership-applications/:id/approve", auth, requireAdmin, applicationH.Approve)
		v1.PATCH("/membership-applications/:id/reject", auth, requireAdmin, applicationH.Reject)

		v1.GET("/admin/events", auth, requireAdmin, eventH.ListAdmin)
		v1.GET("/events", eventH.List)
		v1.GET("/events/:id", eventH.GetByID)
		v1.POST("/events", auth, requireAdmin, eventH.Create)
		v1.PATCH("/events/:id", auth, requireAdmin, eventH.Update)
		v1.DELETE("/events/:id", auth, requireAdmin, eventH.Delete)
		v1.POST("/events/:id/rsvp", auth, requireMember, eventH.Rsvp)

		v1.GET("/admin/schedules", auth, requireAdmin, scheduleH.ListAdmin)
		v1.GET("/schedules", scheduleH.List)
		v1.POST("/schedules", auth, requireAdmin, scheduleH.Create)
		v1.PATCH("/schedules/:id", auth, requireAdmin, scheduleH.Update)
		v1.DELETE("/schedules/:id", auth, requireAdmin, scheduleH.Delete)

		v1.GET("/admin/announcements", auth, requireAdmin, announcementH.ListAdmin)
		v1.GET("/announcements", announcementH.ListPublic)
		v1.GET("/announcements/internal", auth, requireMember, announcementH.ListInternal)
		v1.POST("/announcements", auth, requireAdmin, announcementH.Create)
		v1.PATCH("/announcements/:id", auth, requireAdmin, announcementH.Update)
		v1.DELETE("/announcements/:id", auth, requireAdmin, announcementH.Delete)

		v1.GET("/gallery", galleryH.List)
		v1.POST("/gallery/presigned-url", auth, requireAdmin, galleryH.PresignUpload)
		v1.POST("/gallery", auth, requireAdmin, galleryH.Create)
		v1.DELETE("/gallery/:id", auth, requireAdmin, galleryH.Delete)

		v1.GET("/achievements", achievementH.List)
		v1.POST("/achievements", auth, requireAdmin, achievementH.Create)
		v1.PATCH("/achievements/:id", auth, requireAdmin, achievementH.Update)
		v1.DELETE("/achievements/:id", auth, requireAdmin, achievementH.Delete)

		v1.GET("/admin/dashboard/summary", auth, requireOfficer, dashboardH.GetSummary)
	}

	return engine
}
