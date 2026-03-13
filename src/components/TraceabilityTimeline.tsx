'use client';

import type { SupplyChainEvent } from '@/src/types';
import { EventTypeBadge } from './EventTypeBadge';
import { formatDateTime } from '@/src/utils';
import { MapPin, User, FileText } from 'lucide-react';
import { getEventColor } from '@/src/utils';

interface TraceabilityTimelineProps {
  events: SupplyChainEvent[];
}

export function TraceabilityTimeline({ events }: TraceabilityTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No supply chain events recorded yet.</p>;
  }

  return (
    <div className="relative">
      {events.map((event, index) => {
        const color = getEventColor(event.eventType);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white"
                style={{ backgroundColor: color + '22' }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 mt-1 mb-1" style={{ backgroundColor: color + '30', minHeight: '24px' }} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <EventTypeBadge eventType={event.eventType} />
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <User size={11} className="text-gray-400 flex-shrink-0" />
                    <span className="capitalize">{event.actorName} ({event.actorRole})</span>
                  </div>
                  {event.notes && (
                    <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-1.5 pt-1.5 border-t border-gray-50">
                      <FileText size={11} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{event.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
