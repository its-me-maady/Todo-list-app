import { useState, useEffect, useRef, useCallback } from 'react'
import { PRIORITY, PRIORITY_META, PRESET_LABELS } from '../constants'

const TITLE_MAX = 100
const DESC_MAX = 500

const EMPTY_FORM = {
  title: '',
  description: '',
  label: '',
  priority: PRIORITY.NONE,
}

/**
 * TaskModal — bottom sheet for adding / editing a task.
 * Props:
 *   isOpen     — boolean
 *   task       — task object (null = add mode)
 *   onSave     — (formData) => void
 *   onDelete   — (id) => void  (only in edit mode)
 *   onClose    — () => void
 */
export default function TaskModal({ isOpen, task, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [titleError, setTitleError] = useState('')
  const [closing, setClosing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [customLabel, setCustomLabel] = useState('')
  const titleRef = useRef(null)
  const isEditing = Boolean(task)

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      setClosing(false)
      setShowDeleteConfirm(false)
      setTitleError('')
      if (task) {
        setForm({
          title: task.title,
          description: task.description || '',
          label: task.label || '',
          priority: task.priority || PRIORITY.NONE,
        })
        setCustomLabel('')
      } else {
        setForm(EMPTY_FORM)
        setCustomLabel('')
      }
      // Autofocus title after animation
      setTimeout(() => titleRef.current?.focus(), 350)
    }
  }, [isOpen, task])

  // Animate close
  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 220)
  }, [onClose])

  // Close on overlay click
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) handleClose()
  }, [handleClose])

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'title' && titleError) setTitleError('')
  }, [titleError])

  const handleLabelSelect = useCallback((label) => {
    setForm(prev => ({ ...prev, label: prev.label === label ? '' : label }))
    setCustomLabel('')
  }, [])

  const handleCustomLabelChange = useCallback((e) => {
    const val = e.target.value
    setCustomLabel(val)
    setForm(prev => ({ ...prev, label: val }))
  }, [])

  const handleSave = useCallback(() => {
    const trimmed = form.title.trim()
    if (!trimmed) {
      setTitleError('Title is required.')
      titleRef.current?.focus()
      return
    }
    onSave({ ...form, title: trimmed })
    handleClose()
  }, [form, onSave, handleClose])

  const handleDelete = useCallback(() => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }
    onDelete(task.id)
    handleClose()
  }, [showDeleteConfirm, task, onDelete, handleClose])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const isCustomLabel = form.label && !PRESET_LABELS.includes(form.label)

  return (
    <div
      className={`modal-overlay ${closing ? 'modal-overlay--closing' : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Edit task' : 'Add new task'}
    >
      <div className={`modal-sheet ${closing ? 'modal-sheet--closing' : ''}`}>
        {/* Handle */}
        <div className="modal-handle" aria-hidden="true" />

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-header__title">
            {isEditing ? '✏️ Edit Task' : '✨ New Task'}
          </h2>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Title <span aria-hidden="true" style={{ color: 'var(--priority-high)' }}>*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              className="form-input"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              maxLength={TITLE_MAX}
              aria-required="true"
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'title-error' : 'title-hint'}
            />
            {titleError ? (
              <span id="title-error" className="form-error" role="alert">⚠ {titleError}</span>
            ) : (
              <span id="title-hint" className="form-hint">{form.title.length}/{TITLE_MAX}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <textarea
              id="task-desc"
              className="form-textarea"
              placeholder="Add more context…"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              maxLength={DESC_MAX}
              aria-describedby="desc-hint"
            />
            <span id="desc-hint" className="form-hint">{form.description.length}/{DESC_MAX}</span>
          </div>

          {/* Priority */}
          <div className="form-group">
            <span className="form-label" id="priority-label">Priority</span>
            <div
              className="segmented-control"
              role="group"
              aria-labelledby="priority-label"
            >
              {Object.entries(PRIORITY_META).map(([key, meta]) => {
                const isSelected = form.priority === key
                return (
                  <button
                    key={key}
                    type="button"
                    className={`segmented-option ${isSelected ? `segmented-option--selected-${meta.className}` : ''}`}
                    onClick={() => handleChange('priority', key)}
                    aria-pressed={isSelected}
                    aria-label={`Set priority: ${meta.label}`}
                  >
                    {meta.emoji} {key}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Label */}
          <div className="form-group">
            <span className="form-label" id="label-group-label">Label</span>
            <div className="label-suggestions" role="group" aria-labelledby="label-group-label">
              {PRESET_LABELS.map(label => (
                <button
                  key={label}
                  type="button"
                  className={`label-suggestion ${form.label === label ? 'label-suggestion--active' : ''}`}
                  onClick={() => handleLabelSelect(label)}
                  aria-pressed={form.label === label}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              className="form-input"
              style={{ marginTop: '8px' }}
              type="text"
              placeholder="Or type a custom label…"
              value={isCustomLabel ? form.label : customLabel}
              onChange={handleCustomLabelChange}
              maxLength={30}
              aria-label="Custom label"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {isEditing && !showDeleteConfirm && (
            <button className="btn btn--danger" onClick={handleDelete} aria-label="Delete task">
              🗑 Delete
            </button>
          )}
          {isEditing && showDeleteConfirm && (
            <button className="btn btn--danger" onClick={handleDelete} aria-label="Confirm delete task">
              ⚠ Confirm Delete
            </button>
          )}
          {!isEditing && (
            <button className="btn btn--ghost" onClick={handleClose}>
              Cancel
            </button>
          )}
          <button
            className="btn btn--primary"
            onClick={handleSave}
            disabled={!form.title.trim()}
            aria-label={isEditing ? 'Save changes' : 'Create task'}
          >
            {isEditing ? '💾 Save Changes' : '✅ Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
