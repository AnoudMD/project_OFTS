import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, SPACING, RADIUS } from '../constants';
import { formatDateTime, getEventStyle } from '../utils';
import type { SupplyChainEvent } from '../types';

interface TraceabilityTimelineProps {
  events: SupplyChainEvent[];
}

const EVENT_ICONS: Record<string, string> = {
  'Harvest':       '🌱',
  'Processing':    '⚙️',
  'Quality Check': '✅',
  'Packaging':     '📦',
  'Shipment':      '🚢',
  'Distribution':  '🏭',
  'Retail':        '🏪',
};

export default function TraceabilityTimeline({ events }: TraceabilityTimelineProps) {
  if (!events.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No supply chain events recorded yet.</Text>
      </View>
    );
  }

  return (
    <View>
      {events.map((event, index) => {
        const style = getEventStyle(event.eventType);
        const isLast = index === events.length - 1;
        return (
          <View key={event._id ?? index} style={styles.row}>
            {/* Timeline line + dot */}
            <View style={styles.lineCol}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              {!isLast && <View style={styles.line} />}
            </View>

            {/* Event card */}
            <View style={[styles.card, !isLast && styles.cardMargin]}>
              {/* Header row */}
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: style.bg }]}>
                  <Text style={styles.typeIcon}>{EVENT_ICONS[event.eventType] ?? '•'}</Text>
                  <Text style={[styles.typeLabel, { color: style.text }]}>{event.eventType}</Text>
                </View>
                <Text style={styles.time}>{formatDateTime(event.timestamp)}</Text>
              </View>

              <Text style={styles.location}>{event.location}</Text>
              {event.actorName && (
                <Text style={styles.actor}>by {event.actorName}</Text>
              )}
              {event.notes ? (
                <Text style={styles.notes}>{event.notes}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row:         { flexDirection: 'row' },
  lineCol:     { width: 28, alignItems: 'center' },
  dot:         { width: 12, height: 12, borderRadius: 6, marginTop: 14 },
  line:        { width: 2, flex: 1, backgroundColor: COLORS.primaryLight, marginVertical: 4 },

  card:        { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardMargin:  { marginBottom: SPACING.md },

  cardHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xs },
  typeBadge:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, paddingHorizontal: SPACING.xs + 2, borderRadius: RADIUS.full, gap: 4 },
  typeIcon:    { fontSize: 12 },
  typeLabel:   { fontSize: SIZES.xs, fontWeight: '700' },

  time:        { fontSize: SIZES.xs, color: COLORS.textMuted },
  location:    { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  actor:       { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  notes:       { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, fontStyle: 'italic' },

  empty:       { padding: SPACING.xl, alignItems: 'center' },
  emptyText:   { color: COLORS.textMuted, fontSize: SIZES.sm },
});
