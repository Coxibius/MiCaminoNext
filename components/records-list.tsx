'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ConsumptionRecord, 
  emotionalStateLabels, 
  triggerLabels,
  emotionalStateColors,
} from '@/lib/types';
import { getRecords, deleteRecord as removeRecord } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Trash2, Clock, Activity, FileText, AlertTriangle, Package } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function RecordsList() {
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getRecords().then(setRecords);
  }, []);

  const handleDelete = async (id: string) => {
    await removeRecord(id);
    const newRecords = await getRecords();
    setRecords(newRecords);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Sin registros aun
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Cuando registres un momento de consumo, aparecera aqui. 
            Este historial te ayudara a ti y a tu psicologa a entender mejor tus patrones.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {records.length} {records.length === 1 ? 'registro' : 'registros'} en total
      </p>
      
      {records.map((record) => (
        <Card key={record.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(record.dateTime)}
                </CardTitle>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {record.quantity && (
                    <Badge variant="outline" className="text-xs bg-muted/40 font-medium">
                      Consumo: {record.quantity}
                    </Badge>
                  )}
                  {record.storageAmount !== undefined && record.storageAmount !== null && (
                    <Badge variant="outline" className="text-xs text-cyan-600 border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-800/30 flex items-center gap-1 font-medium">
                      <Package className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
                      Stock en casa: {record.storageAmount.toFixed(1)}g
                    </Badge>
                  )}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar registro</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta accion no se puede deshacer. Se eliminara permanentemente este registro de tu historial.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(record.id)}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={cn('text-xs', emotionalStateColors[record.emotionalState])}>
                {emotionalStateLabels[record.emotionalState]}
              </Badge>
              
              <div className="flex items-center gap-1.5 text-sm">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ansiedad:</span>
                <span className={cn(
                  'font-medium',
                  record.anxietyLevel <= 3 ? 'text-success' :
                  record.anxietyLevel <= 6 ? 'text-accent-foreground' :
                  'text-stressed'
                )}>
                  {record.anxietyLevel}/10
                </span>
              </div>
            </div>

            {record.triggers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                {record.triggers.map((trigger) => (
                  <Badge key={trigger} variant="secondary" className="text-xs">
                    {triggerLabels[trigger]}
                  </Badge>
                ))}
              </div>
            )}

            {record.notes && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {record.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
