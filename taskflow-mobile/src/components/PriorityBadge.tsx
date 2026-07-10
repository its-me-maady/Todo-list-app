import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIORITY_META, Priority } from '../constants';

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.NONE;

  return (
    <View style={[styles.badge, { backgroundColor: meta.color + '20' }]}>
      <Text style={[styles.text, { color: meta.color }]}>
        {meta.emoji} {meta.label.replace(/[^a-zA-Z\s]/g, '').trim()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
