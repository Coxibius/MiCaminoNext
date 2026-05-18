'use client';

import { ConsumptionRecord } from './types';

// In-memory store for demo purposes, synchronized with localStorage
let records: ConsumptionRecord[] = [];

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('micamino_records');
    if (saved) {
      records = JSON.parse(saved).map((r: any) => ({
        ...r,
        dateTime: new Date(r.dateTime)
      }));
    }
  } catch (e) {
    console.error('Error parsing localStorage records', e);
  }
}

export function getRecords(): ConsumptionRecord[] {
  return [...records].sort((a, b) => 
    new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );
}

export function addRecord(record: Omit<ConsumptionRecord, 'id'>): ConsumptionRecord {
  const newRecord: ConsumptionRecord = {
    ...record,
    id: crypto.randomUUID(),
    dateTime: new Date(record.dateTime),
  };
  records.push(newRecord);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('micamino_records', JSON.stringify(records));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }
  return newRecord;
}

export function deleteRecord(id: string): void {
  records = records.filter(r => r.id !== id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('micamino_records', JSON.stringify(records));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }
}

export function getStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const weekRecords = records.filter(r => new Date(r.dateTime) >= weekAgo);
  const monthRecords = records.filter(r => new Date(r.dateTime) >= monthAgo);
  
  const avgAnxiety = records.length > 0 
    ? records.reduce((sum, r) => sum + r.anxietyLevel, 0) / records.length 
    : 0;
  
  const triggerCounts: Record<string, number> = {};
  records.forEach(r => {
    r.triggers.forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });
  
  const mostCommonTrigger = Object.entries(triggerCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  const lastStorageRecord = [...records]
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .find(r => r.storageAmount !== undefined && r.storageAmount !== null);
  const currentStorage = lastStorageRecord && lastStorageRecord.storageAmount !== undefined ? lastStorageRecord.storageAmount : null;
  
  return {
    totalRecords: records.length,
    weekRecords: weekRecords.length,
    monthRecords: monthRecords.length,
    avgAnxiety: Math.round(avgAnxiety * 10) / 10,
    mostCommonTrigger,
    daysSinceLastConsumption: records.length > 0 
      ? Math.floor((now.getTime() - Math.max(...records.map(r => new Date(r.dateTime).getTime()))) / (24 * 60 * 60 * 1000))
      : null,
    currentStorage,
  };
}
