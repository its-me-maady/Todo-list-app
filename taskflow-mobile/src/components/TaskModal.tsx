import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { PRIORITY, PRIORITY_META, PRESET_LABELS, Priority } from '../constants';
import { Task } from '../utils/taskUtils';

const TITLE_MAX = 100;
const DESC_MAX = 500;

const EMPTY_FORM = {
  title: '',
  description: '',
  label: '',
  priority: PRIORITY.NONE as Priority,
};

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onSave: (formData: any) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function TaskModal({ isOpen, task, onSave, onDelete, onClose }: TaskModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [titleError, setTitleError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  const isEditing = Boolean(task);

  useEffect(() => {
    if (isOpen) {
      setShowDeleteConfirm(false);
      setTitleError('');
      if (task) {
        setForm({
          title: task.title,
          description: task.description || '',
          label: task.label || '',
          priority: task.priority || PRIORITY.NONE,
        });
        setCustomLabel('');
      } else {
        setForm(EMPTY_FORM);
        setCustomLabel('');
      }
    }
  }, [isOpen, task]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && titleError) setTitleError('');
  };

  const handleLabelSelect = (label: string) => {
    setForm(prev => ({ ...prev, label: prev.label === label ? '' : label }));
    setCustomLabel('');
  };

  const handleCustomLabelChange = (val: string) => {
    setCustomLabel(val);
    setForm(prev => ({ ...prev, label: val }));
  };

  const handleSave = () => {
    const trimmed = form.title.trim();
    if (!trimmed) {
      setTitleError('Title is required.');
      return;
    }
    onSave({ ...form, title: trimmed });
    onClose();
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    if (task) {
      onDelete(task.id);
      onClose();
    }
  };

  const isCustomLabel = form.label && !PRESET_LABELS.includes(form.label);

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? '✏️ Edit Task' : '✨ New Task'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Title <Text style={{ color: 'red' }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, titleError ? styles.inputError : null]}
                placeholder="What needs to be done?"
                value={form.title}
                onChangeText={val => handleChange('title', val)}
                maxLength={TITLE_MAX}
              />
              {titleError ? (
                <Text style={styles.errorText}>⚠ {titleError}</Text>
              ) : (
                <Text style={styles.hintText}>{form.title.length}/{TITLE_MAX}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Description <Text style={{ color: '#aaa', fontWeight: 'normal' }}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add more context…"
                value={form.description}
                onChangeText={val => handleChange('description', val)}
                maxLength={DESC_MAX}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.hintText}>{form.description.length}/{DESC_MAX}</Text>
            </View>

            {/* Priority */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.segmentedControl}>
                {Object.entries(PRIORITY_META).map(([key, meta]) => {
                  const isSelected = form.priority === key;
                  return (
                    <Pressable
                      key={key}
                      style={[
                        styles.segmentOption,
                        isSelected && { backgroundColor: meta.color + '20', borderColor: meta.color }
                      ]}
                      onPress={() => handleChange('priority', key)}
                    >
                      <Text style={[styles.segmentText, isSelected && { color: meta.color, fontWeight: 'bold' }]}>
                        {meta.emoji} {key}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Label */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Label</Text>
              <View style={styles.labelSuggestions}>
                {PRESET_LABELS.map(label => (
                  <Pressable
                    key={label}
                    style={[styles.labelChip, form.label === label && styles.labelChipActive]}
                    onPress={() => handleLabelSelect(label)}
                  >
                    <Text style={[styles.labelChipText, form.label === label && styles.labelChipTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Or type a custom label…"
                value={isCustomLabel ? form.label : customLabel}
                onChangeText={handleCustomLabelChange}
                maxLength={30}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {isEditing ? (
              <Pressable
                style={[styles.btn, styles.btnDanger]}
                onPress={handleDelete}
              >
                <Text style={styles.btnDangerText}>
                  {showDeleteConfirm ? '⚠ Confirm Delete' : '🗑 Delete'}
                </Text>
              </Pressable>
            ) : (
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.btn, styles.btnPrimary, !form.title.trim() && styles.btnDisabled]}
              onPress={handleSave}
              disabled={!form.title.trim()}
            >
              <Text style={styles.btnPrimaryText}>
                {isEditing ? '💾 Save Changes' : '✅ Create Task'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#666',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: 'red',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  segmentText: {
    fontSize: 14,
    color: '#555',
  },
  labelSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  labelChipActive: {
    backgroundColor: '#333',
  },
  labelChipText: {
    fontSize: 14,
    color: '#555',
  },
  labelChipTextActive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#007AFF',
  },
  btnDisabled: {
    backgroundColor: '#aaa',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnDanger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'red',
  },
  btnDangerText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnGhostText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
