import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import PriorityBadge from './PriorityBadge';
import { Task } from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onToggle, onEdit }: TaskCardProps) {
  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleCardClick = () => {
    onEdit(task);
  };

  return (
    <Pressable
      style={[styles.card, task.isCompleted && styles.cardCompleted]}
      onPress={handleCardClick}
    >
      <Pressable style={styles.checkboxContainer} onPress={handleToggle}>
        <View style={[styles.checkbox, task.isCompleted && styles.checkboxChecked]}>
          {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </Pressable>

      <View style={styles.body}>
        {(task.priority !== 'NONE' || task.label) && (
          <View style={styles.meta}>
            {task.priority !== 'NONE' && <PriorityBadge priority={task.priority} />}
            {!!task.label && (
              <View style={styles.labelBadge}>
                <Text style={styles.labelText}># {task.label}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={[styles.title, task.isCompleted && styles.titleCompleted]}>
          {task.title}
        </Text>

        {!!task.description && (
          <Text style={[styles.description, task.isCompleted && styles.descriptionCompleted]} numberOfLines={2}>
            {task.description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  checkboxContainer: {
    paddingRight: 12,
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  labelBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labelText: {
    fontSize: 12,
    color: '#555',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  descriptionCompleted: {
    color: '#999',
  },
});
