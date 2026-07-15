package models

import "time"

// User represents a registered account in the system.
type User struct {
	ID           string    `db:"id"            json:"id"`
	Email        string    `db:"email"         json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"` // never serialised to JSON
	CreatedAt    time.Time `db:"created_at"    json:"created_at"`
}
