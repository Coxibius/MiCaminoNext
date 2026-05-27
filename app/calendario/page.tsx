'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ConsumptionRecord, 
  emotionalStateLabels, 
  triggerLabels,
  emotionalStateColors 
} from '@/lib/types';
import { getRecords } from '@/lib/store';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Package, 
  TrendingUp,
  Award
} from 'lucide-react';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CalendarioPage() {
  const [mounted, setMounted] = useState(false);
  const [allRecords, setAllRecords] = useState<ConsumptionRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    getRecords().then(setAllRecords);
    setSelectedDay(new Date().getDate());
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="h-12 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-[400px] w-full bg-muted animate-pulse rounded-xl" />
        </main>
      </div>
    );
  }

  // Calculate grid layout parameters
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Adjust Monday as first day of week (Spanish standard)
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Filter records to only the current month/year
  const monthRecords = allRecords.filter(r => {
    const d = new Date(r.dateTime);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // Group records by day number
  const recordsByDay: Record<number, ConsumptionRecord[]> = {};
  monthRecords.forEach(r => {
    const d = new Date(r.dateTime);
    const dNum = d.getDate();
    if (!recordsByDay[dNum]) {
      recordsByDay[dNum] = [];
    }
    recordsByDay[dNum].push(r);
  });

  // Stats calculations
  const totalDays = daysInMonth;
  const daysWithConsumption = Object.keys(recordsByDay).length;
  const cleanDays = totalDays - daysWithConsumption;
  const cleanPercentage = Math.round((cleanDays / totalDays) * 100);

  const selectedDayRecords = selectedDay ? (recordsByDay[selectedDay] || []) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Navigation & Header Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Calendario de Consumo
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitorea visualmente tus días sobrios y patrones mensuales
            </p>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] text-center font-semibold text-sm uppercase bg-secondary px-3 py-2 rounded-lg border border-border">
              {monthNames[month]} {year}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Grid Structure */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Calendar Grid */}
          <div className="md:col-span-2 space-y-4">
            <Card className="overflow-hidden border border-border/80 shadow-sm">
              <CardContent className="p-0">
                {/* Day Labels Row */}
                <div className="grid grid-cols-7 bg-muted/50 border-b text-center py-2.5 text-xs font-semibold text-muted-foreground">
                  <div>LUN</div>
                  <div>MAR</div>
                  <div>MIE</div>
                  <div>JUE</div>
                  <div>VIE</div>
                  <div>SAB</div>
                  <div>DOM</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 text-center">
                  {/* Empty cells before start of month */}
                  {Array.from({ length: startDayOfWeek }).map((_, i) => (
                    <div 
                      key={`empty-${i}`} 
                      className="aspect-square border-r border-b border-border/40 bg-muted/10" 
                    />
                  ))}

                  {/* Month days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const hasConsumption = recordsByDay[dayNum] !== undefined;
                    const dayRecords = recordsByDay[dayNum] || [];
                    const isSelected = selectedDay === dayNum;

                    return (
                      <button
                        key={`day-${dayNum}`}
                        onClick={() => setSelectedDay(dayNum)}
                        className={cn(
                          'aspect-square p-1.5 border-r border-b border-border/40 relative flex flex-col justify-between text-left transition-all hover:bg-secondary/40 focus:outline-none',
                          hasConsumption 
                            ? 'bg-rose-50/50 dark:bg-rose-950/15' 
                            : 'bg-emerald-50/40 dark:bg-emerald-950/10',
                          isSelected && 'ring-2 ring-primary ring-inset z-10'
                        )}
                      >
                        {/* Day indicator number */}
                        <span className={cn(
                          'text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center',
                          isSelected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-muted-foreground'
                        )}>
                          {dayNum}
                        </span>

                        {/* Visual details */}
                        {hasConsumption ? (
                          <div className="flex items-center justify-between w-full mt-auto">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-1 rounded">
                              {dayRecords.length}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full flex justify-end mt-auto text-emerald-500/50">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Sobriety Statistics Panel */}
            <div className="grid gap-4 grid-cols-2">
              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Días Limpios
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {cleanDays} <span className="text-sm font-normal text-muted-foreground">de {totalDays}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/80 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" />
                    Sobriedad
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-extrabold text-primary">
                    {cleanPercentage}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Selected Day Details Column */}
          <div className="md:col-span-1">
            <Card className="border border-border/80 shadow-sm h-full flex flex-col">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Día {selectedDay} de {monthNames[month]}
                </CardTitle>
                <CardDescription>
                  Detalle de tus registros para este día
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[480px]">
                {selectedDayRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3 opacity-80" />
                    <p className="text-sm font-semibold text-foreground">¡Día Limpio!</p>
                    <p className="text-xs max-w-[200px] mt-1">
                      No registraste ningún momento de consumo en esta fecha.
                    </p>
                  </div>
                ) : (
                  selectedDayRecords.map((record) => {
                    const timeStr = new Intl.DateTimeFormat('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }).format(new Date(record.dateTime));

                    return (
                      <div key={record.id} className="p-3.5 rounded-xl bg-muted/40 border space-y-3 shadow-sm hover:border-border transition-colors">
                        {/* Header details */}
                        <div className="flex items-center justify-between border-b pb-2">
                          <span className="text-xs font-bold text-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {timeStr}
                          </span>
                          
                          <Badge className={cn('text-[10px] font-semibold py-0.5 px-2', emotionalStateColors[record.emotionalState])}>
                            {emotionalStateLabels[record.emotionalState]}
                          </Badge>
                        </div>

                        {/* Anxiety level */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5" />
                            Ansiedad:
                          </span>
                          <span className={cn(
                            'font-bold',
                            record.anxietyLevel <= 3 ? 'text-success' :
                            record.anxietyLevel <= 6 ? 'text-warning-foreground' :
                            'text-stressed'
                          )}>
                            {record.anxietyLevel}/10
                          </span>
                        </div>

                        {/* Stock & quantity badges */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.quantity && (
                            <Badge variant="secondary" className="text-[10px] py-0 bg-muted border font-medium">
                              Consumo: {record.quantity}
                            </Badge>
                          )}
                          {record.storageAmount !== undefined && record.storageAmount !== null && (
                            <Badge variant="outline" className="text-[10px] text-cyan-600 border-cyan-200 bg-cyan-50 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-800/30 flex items-center gap-1 font-medium">
                              <Package className="h-3 w-3 shrink-0 text-cyan-500" />
                              Stock: {record.storageAmount.toFixed(1)}g
                            </Badge>
                          )}
                        </div>

                        {/* Triggers */}
                        {record.triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-muted-foreground mt-0.5" />
                            {record.triggers.map((trigger) => (
                              <Badge key={trigger} variant="secondary" className="text-[9px] py-0 px-1.5 font-medium opacity-80">
                                {triggerLabels[trigger]}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {record.notes && (
                          <p className="text-xs text-foreground bg-background p-2.5 rounded-lg border border-dashed whitespace-pre-wrap leading-relaxed mt-2">
                            "{record.notes}"
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
