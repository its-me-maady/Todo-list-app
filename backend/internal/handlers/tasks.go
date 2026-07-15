package handlers

import (
	"database/sql"
	"errors"
	"log"
	"net/http"

	"taskflow-backend/internal/services"
	"taskflow-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// TaskHandler handles all task CRUD endpoints.
type TaskHandler struct {
	svc *services.TaskService
}

// NewTaskHandler wires up the handler with a task service.
func NewTaskHandler(db *sqlx.DB) *TaskHandler {
	return &TaskHandler{svc: services.NewTaskService(db)}
}

// GetTasks returns all tasks belonging to the authenticated user.
func (h *TaskHandler) GetTasks(c *gin.Context) {
	userID := c.GetString("user_id")
	tasks, err := h.svc.GetByUser(userID)
	if err != nil {
		log.Printf("GetTasks: %v", err)
		utils.Error(c, http.StatusInternalServerError, "internal server error")
		return
	}
	utils.Success(c, http.StatusOK, tasks)
}

// CreateTask inserts a new task for the authenticated user.
func (h *TaskHandler) CreateTask(c *gin.Context) {
	userID := c.GetString("user_id")

	var input services.CreateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid request")
		return
	}

	task, err := h.svc.Create(userID, input)
	if err != nil {
		log.Printf("CreateTask: %v", err)
		utils.Error(c, http.StatusInternalServerError, "internal server error")
		return
	}
	utils.Success(c, http.StatusCreated, task)
}

// UpdateTask applies a partial update to a task owned by the authenticated user.
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	userID := c.GetString("user_id")
	taskID := c.Param("id")

	var input services.UpdateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid request")
		return
	}

	task, err := h.svc.Update(taskID, userID, input)
	if errors.Is(err, sql.ErrNoRows) {
		utils.Error(c, http.StatusNotFound, "task not found")
		return
	}
	if err != nil {
		log.Printf("UpdateTask: %v", err)
		utils.Error(c, http.StatusInternalServerError, "internal server error")
		return
	}
	utils.Success(c, http.StatusOK, task)
}

// DeleteTask removes a task owned by the authenticated user.
// Returns 404 (not 403) when the task doesn't exist or belongs to another user,
// avoiding confirmation that the resource exists at all.
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	userID := c.GetString("user_id")
	taskID := c.Param("id")

	err := h.svc.Delete(taskID, userID)
	if errors.Is(err, services.ErrNotFound) {
		utils.Error(c, http.StatusNotFound, "task not found")
		return
	}
	if err != nil {
		log.Printf("DeleteTask: %v", err)
		utils.Error(c, http.StatusInternalServerError, "internal server error")
		return
	}
	c.Status(http.StatusNoContent)
}
