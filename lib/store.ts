import { ConsumptionRecord, EmotionalState, Trigger } from './types';
import { supabase } from './supabase';

export async function getRecords(): Promise<ConsumptionRecord[]> {
  if (!supabase) {
    console.warn('Supabase client is not configured.');
    return [];
  }

  const { data, error } = await supabase
    .from('registros_consumo')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error fetching records:', error);
    return [];
  }

  return data.map((r: any) => ({
    id: r.id,
    dateTime: new Date(r.fecha),
    quantity: r.cantidad_consumida,
    storageAmount: r.stock_restante,
    emotionalState: r.emocion as EmotionalState,
    anxietyLevel: r.nivel_ansiedad,
    triggers: r.motivos as Trigger[],
    notes: r.notas || '',
  }));
}

export async function addRecord(record: Omit<ConsumptionRecord, 'id'>): Promise<ConsumptionRecord> {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const newRecord = {
    fecha: record.dateTime.toISOString(),
    cantidad_consumida: record.quantity,
    stock_restante: record.storageAmount,
    emocion: record.emotionalState,
    nivel_ansiedad: record.anxietyLevel,
    motivos: record.triggers,
    notas: record.notes,
  };

  const { data, error } = await supabase
    .from('registros_consumo')
    .insert([newRecord])
    .select()
    .single();

  if (error) {
    console.error('Error adding record:', error);
    throw error;
  }

  return {
    id: data.id,
    dateTime: new Date(data.fecha),
    quantity: data.cantidad_consumida,
    storageAmount: data.stock_restante,
    emotionalState: data.emocion as EmotionalState,
    anxietyLevel: data.nivel_ansiedad,
    triggers: data.motivos as Trigger[],
    notes: data.notas || '',
  };
}

export async function addStockUpdate(amount: number): Promise<ConsumptionRecord> {
  // Para actualizar el stock sin registrar un consumo real, 
  // insertamos un registro especial con cantidad "" y emoción neutral
  return addRecord({
    dateTime: new Date(),
    quantity: "Actualización de Inventario",
    storageAmount: amount,
    emotionalState: "neutral",
    anxietyLevel: 5,
    triggers: [],
    notes: "Registro de nuevo stock ingresado"
  });
}

export async function deleteRecord(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { error } = await supabase
    .from('registros_consumo')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
}

export async function getStats() {
  if (!supabase) {
    return {
      totalRecords: 0,
      weekRecords: 0,
      monthRecords: 0,
      avgAnxiety: 0,
      mostCommonTrigger: null as string | null,
      daysSinceLastConsumption: null as number | null,
      currentStorage: null as number | null,
    };
  }

  const records = await getRecords();
  
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
