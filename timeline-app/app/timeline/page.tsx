'use client'

import { TimelineApp } from '@/app/timeline-app'
import type { Viewport } from 'next';
export default function TimelinePage() {
  return <TimelineApp />
}
export const viewport: Viewport = {
    initialScale: 1,
    width: 'device-width'
}