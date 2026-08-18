package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/soota-1/irid-hub/apps/api/internal/domain"
	"github.com/soota-1/irid-hub/apps/api/internal/http/response"
	"github.com/soota-1/irid-hub/apps/api/internal/service"
)

type TrainingScheduleHandler struct {
	svc           *service.TrainingScheduleService
	communityRepo domain.CommunityRepository
}

func NewTrainingScheduleHandler(svc *service.TrainingScheduleService, communityRepo domain.CommunityRepository) *TrainingScheduleHandler {
	return &TrainingScheduleHandler{svc: svc, communityRepo: communityRepo}
}

type trainingScheduleDTO struct {
	ID          string  `json:"id"`
	CommunityID string  `json:"community_id"`
	Title       string  `json:"title"`
	DayOfWeek   int16   `json:"day_of_week"`
	StartTime   string  `json:"start_time"`
	EndTime     string  `json:"end_time"`
	Location    *string `json:"location"`
	IsActive    bool    `json:"is_active"`
}

func toTrainingScheduleDTO(t *domain.TrainingSchedule) trainingScheduleDTO {
	return trainingScheduleDTO{
		ID:          t.ID.String(),
		CommunityID: t.CommunityID.String(),
		Title:       t.Title,
		DayOfWeek:   t.DayOfWeek,
		StartTime:   t.StartTime,
		EndTime:     t.EndTime,
		Location:    t.Location,
		IsActive:    t.IsActive,
	}
}

// List godoc
// @Summary  List active training schedules
// @Tags     schedules
// @Produce  json
// @Success  200  {object}  response.Envelope{data=[]trainingScheduleDTO}
// @Router   /schedules [get]
func (h *TrainingScheduleHandler) List(c *gin.Context) {
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}
	items, err := h.svc.ListActive(c.Request.Context(), community.ID)
	if err != nil {
		handleServiceError(c, err)
		return
	}
	dtos := make([]trainingScheduleDTO, 0, len(items))
	for i := range items {
		dtos = append(dtos, toTrainingScheduleDTO(&items[i]))
	}
	response.OK(c, http.StatusOK, dtos)
}

type upsertTrainingScheduleRequest struct {
	Title     string `json:"title" binding:"required"`
	DayOfWeek int16  `json:"day_of_week"`
	StartTime string `json:"start_time" binding:"required"`
	EndTime   string `json:"end_time" binding:"required"`
	Location  string `json:"location"`
	IsActive  bool   `json:"is_active"`
}

// Create godoc
// @Summary   Create a training schedule
// @Tags      schedules
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     body  body      upsertTrainingScheduleRequest  true  "Schedule"
// @Success   201  {object}  response.Envelope{data=trainingScheduleDTO}
// @Failure   422  {object}  response.Envelope
// @Router    /schedules [post]
func (h *TrainingScheduleHandler) Create(c *gin.Context) {
	var req upsertTrainingScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}
	community, err := h.communityRepo.GetCurrent(c.Request.Context())
	if err != nil {
		handleServiceError(c, err)
		return
	}

	sc, err := h.svc.Create(c.Request.Context(), domain.CreateTrainingScheduleParams{
		CommunityID: community.ID,
		Title:       req.Title,
		DayOfWeek:   req.DayOfWeek,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Location:    strPtr(req.Location),
		IsActive:    req.IsActive,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusCreated, toTrainingScheduleDTO(sc))
}

// Update godoc
// @Summary   Update a training schedule
// @Tags      schedules
// @Accept    json
// @Produce   json
// @Security  BearerAuth
// @Param     id    path      string                          true  "Schedule ID"
// @Param     body  body      upsertTrainingScheduleRequest  true  "Schedule"
// @Success   200  {object}  response.Envelope{data=trainingScheduleDTO}
// @Failure   422  {object}  response.Envelope
// @Router    /schedules/{id} [patch]
func (h *TrainingScheduleHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	var req upsertTrainingScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "format request tidak valid"})
		return
	}

	sc, err := h.svc.Update(c.Request.Context(), domain.UpdateTrainingScheduleParams{
		ID:        id,
		Title:     req.Title,
		DayOfWeek: req.DayOfWeek,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Location:  strPtr(req.Location),
		IsActive:  req.IsActive,
	})
	if err != nil {
		handleServiceError(c, err)
		return
	}
	response.OK(c, http.StatusOK, toTrainingScheduleDTO(sc))
}

// Delete godoc
// @Summary   Delete a training schedule
// @Tags      schedules
// @Security  BearerAuth
// @Param     id  path  string  true  "Schedule ID"
// @Success   204  "No Content"
// @Failure   404  {object}  response.Envelope
// @Router    /schedules/{id} [delete]
func (h *TrainingScheduleHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.ValidationError(c, map[string]string{"id": "format tidak valid"})
		return
	}
	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		handleServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
