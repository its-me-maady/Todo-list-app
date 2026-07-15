package services

import (
	"errors"
	"time"

	"taskflow-backend/internal/models"

	"github.com/jmoiron/sqlx"
)

// ErrNotFound is returned when a task doesn't exist or isn't owned by the user.
// Handlers map this to 404 — deliberately avoiding 403 to prevent confirming task existence.
var ErrNotFound = errors.New("task not found")

// cols lists the exact columns our Task model maps to.
// We avoid SELECT * because the DB has a legacy `status` enum column not in our model.
const cols = `id, user_id, title, description, label, priority, completed, due_date, created_at, updated_at`

// TaskService handles all task persistence logic.
type TaskService struct {
	db *sqlx.DB
}

// NewTaskService creates a TaskService with the given DB pool.
func NewTaskService(db *sqlx.DB) *TaskService {
	return &TaskService{db: db}
}

// GetByUser returns all tasks for a user, ordered by most recently updated.
func (s *TaskService) GetByUser(userID string) ([]models.Task, error) {
	var tasks []models.Task
	err := s.db.Select(&tasks,
		`SELECT `+cols+` FROM tasks WHERE user_id = $1 ORDER BY updated_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	// Always return an array, never null
	if tasks == nil {
		tasks = []models.Task{}
	}
	return tasks, nil
}

// CreateTaskInput is the validated payload for task creation.
type CreateTaskInput struct {
	Title       string     `json:"title"       binding:"required"`
	Description string     `json:"description"`
	Label       string     `json:"label"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"due_date"`
}

// Create inserts a new task for the given user and returns the created record.
func (s *TaskService) Create(userID string, input CreateTaskInput) (*models.Task, error) {
	if input.Priority == "" {
		input.Priority = "NONE"
	}
	var task models.Task
	err := s.db.QueryRowx(`
		INSERT INTO tasks (user_id, title, description, label, priority, due_date)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING `+cols,
		userID, input.Title, input.Description, input.Label, input.Priority, input.DueDate,
	).StructScan(&task)
	if err != nil {
		return nil, err
	}
	return &task, nil
}

// UpdateTaskInput supports partial updates — only non-nil fields are applied.
type UpdateTaskInput struct {
	Title       *string    `json:"title"`
	Description *string    `json:"description"`
	Label       *string    `json:"label"`
	Priority    *string    `json:"priority"`
	Completed   *bool      `json:"completed"`
	DueDate     *time.Time `json:"due_date"`
}

// Update applies a partial update to a task scoped by user ownership.
// Returns sql.ErrNoRows when the task doesn't exist or isn't owned by the user.
func (s *TaskService) Update(taskID, userID string, input UpdateTaskInput) (*models.Task, error) {
	// Fetch existing task — ownership check via user_id scope
	var existing models.Task
	err := s.db.QueryRowx(
		`SELECT `+cols+` FROM tasks WHERE id = $1 AND user_id = $2`,
		taskID, userID,
	).StructScan(&existing)
	if err != nil {
		return nil, err // propagates sql.ErrNoRows → handler returns 404
	}

	// Apply only provided fields
	if input.Title != nil {
		existing.Title = *input.Title
	}
	if input.Description != nil {
		existing.Description = *input.Description
	}
	if input.Label != nil {
		existing.Label = *input.Label
	}
	if input.Priority != nil {
		existing.Priority = *input.Priority
	}
	if input.Completed != nil {
		existing.Completed = *input.Completed
	}
	if input.DueDate != nil {
		existing.DueDate = input.DueDate
	}

	var updated models.Task
	err = s.db.QueryRowx(`
		UPDATE tasks
		SET title = $1, description = $2, label = $3, priority = $4,
		    completed = $5, due_date = $6, updated_at = NOW()
		WHERE id = $7 AND user_id = $8
		RETURNING `+cols,
		existing.Title, existing.Description, existing.Label, existing.Priority,
		existing.Completed, existing.DueDate, taskID, userID,
	).StructScan(&updated)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// Delete removes a task scoped by user ownership.
// Returns ErrNotFound when no rows are deleted (wrong id or user).
func (s *TaskService) Delete(taskID, userID string) error {
	result, err := s.db.Exec(
		`DELETE FROM tasks WHERE id = $1 AND user_id = $2`,
		taskID, userID,
	)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}
