'use client';

import { Sidebar } from 'lucide-react';
import dynamic from 'next/dynamic';
import React from 'react';
import { useUIState } from '@/store/useUIState';
import { MultiModalFAB } from '@/components/multi-modal-fab';
const MapClient = dynamic(() => import('@/app/map/MapClient'), { ssr: false });

export default function MapPage() {
  return (
    <div>
      <MapClient />
      <MultiModalFAB />
    </div>
  );
}