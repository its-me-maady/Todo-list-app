import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { PRIORITY_META, Priority } from '../constants';

interface FilterBarProps {
  activePriority: Priority | null;
  activeLabel: string | null;
  availableLabels: string[];
  isFiltered: boolean;
  onTogglePriority: (priority: Priority) => void;
  onToggleLabel: (label: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  activePriority,
  activeLabel,
  availableLabels,
  isFiltered,
  onTogglePriority,
  onToggleLabel,
  onClear,
}: FilterBarProps) {
  const hasLabels = availableLabels.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isFiltered && (
          <Pressable 
            style={[styles.chip, styles.chipActive]} 
            onPress={onClear}
          >
            <Text style={[styles.chipText, styles.chipTextActive]}>✕ Clear</Text>
          </Pressable>
        )}

        {Object.entries(PRIORITY_META).map(([key, meta]) => {
          const isActive = activePriority === key;
          return (
            <Pressable
              key={key}
              style={
                isActive 
                  ? [styles.chip, styles.chipActive] 
                  : [styles.chip, { borderColor: meta.color + '50', borderWidth: 1 }]
              }
              onPress={() => onTogglePriority(key as Priority)}
            >
              <Text style={isActive ? [styles.chipText, styles.chipTextActive] : styles.chipText}>
                {meta.emoji} {meta.label.replace(/[^a-zA-Z\s]/g, '').trim()}
              </Text>
            </Pressable>
          );
        })}

        {hasLabels && <View style={styles.divider} />}

        {hasLabels && availableLabels.map(label => {
          const isActive = activeLabel === label;
          return (
            <Pressable
              key={label}
              style={isActive ? [styles.chip, styles.chipActive] : styles.chip}
              onPress={() => onToggleLabel(label)}
            >
              <Text style={isActive ? [styles.chipText, styles.chipTextActive] : styles.chipText}>
                # {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
});
