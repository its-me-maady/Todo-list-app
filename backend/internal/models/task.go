package models

import "time"

// Task represents a single to-do item owned by a user.
// Field names mirror the mobile app's Task interface for seamless sync.
type Task struct {
	ID          string     `db:"id"          json:"id"`
	UserID      string     `db:"user_id"     json:"user_id"`
	Title       string     `db:"title"       json:"title"`
	Description string     `db:"description" json:"description"`
	Label       string     `db:"label"       json:"label"`
	Priority    string     `db:"priority"    json:"priority"` // HIGH | MEDIUM | LOW | NONE
	Completed   bool       `db:"completed"   json:"completed"`
	DueDate     *time.Time `db:"due_date"    json:"due_date,omitempty"`
	CreatedAt   time.Time  `db:"created_at"  json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at"  json:"updated_at"`
}
