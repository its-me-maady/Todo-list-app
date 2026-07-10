import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import TaskCard from './TaskCard';
import { Task } from '../utils/taskUtils';

interface TaskListProps {
  tasks: Task[];
  allCount: number;
  isFiltered: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddFirst: () => void;
}

export default function TaskList({ tasks, allCount, isFiltered, onToggle, onEdit, onAddFirst }: TaskListProps) {
  const activeTasks = tasks.filter(t => !t.isCompleted);
  const doneTasks = tasks.filter(t => t.isCompleted);

  if (allCount === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎯</Text>
        <Text style={styles.emptyTitle}>Your canvas is clear</Text>
        <Text style={styles.emptySubtitle}>
          Add your first task and start making progress. One step at a time.
        </Text>
        <Pressable style={styles.addButton} onPress={onAddFirst}>
          <Text style={styles.addButtonText}>+ Add First Task</Text>
        </Pressable>
      </View>
    );
  }

  if (tasks.length === 0 && isFiltered) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No matches found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting or clearing your filters.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Active · {activeTasks.length}</Text>
          {activeTasks.map(task => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} />
          ))}
        </View>
      )}

      {doneTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Completed · {doneTasks.length}</Text>
          {doneTasks.map(task => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} />
          ))}
        </View>
      )}
      <View style={{ height: 80 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
