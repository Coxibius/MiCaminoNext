'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, Calendar, Activity, Target, Package } from 'lucide-react';
import { triggerLabels } from '@/lib/types';

interface StatsData {
  totalRecords: number;
  weekRecords: number;
  monthRecords: number;
  avgAnxiety: number;
  mostCommonTrigger: string | null;
  daysSinceLastConsumption: number | null;
  currentStorage: number | null;
}

interface DashboardStatsProps {
  stats: StatsData;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Dias sin consumo
          </CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.daysSinceLastConsumption !== null 
              ? stats.daysSinceLastConsumption 
              : '-'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.daysSinceLastConsumption === null 
              ? 'Sin registros aun'
              : stats.daysSinceLastConsumption === 0 
                ? 'Ultimo registro hoy'
                : 'Sigue asi'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Esta semana
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.weekRecords}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.weekRecords === 0 ? 'Excelente progreso' : 'registros'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nivel ansiedad promedio
          </CardTitle>
          <Activity className="h-4 w-4 text-anxious" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.avgAnxiety || '-'}
            <span className="text-sm font-normal text-muted-foreground">/10</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.avgAnxiety > 7 ? 'Considera hablar con alguien' : 
             stats.avgAnxiety > 4 ? 'Moderado' : 
             stats.avgAnxiety > 0 ? 'Bajo' : 'Sin datos'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Trigger mas comun
          </CardTitle>
          <Target className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-foreground truncate">
            {stats.mostCommonTrigger 
              ? triggerLabels[stats.mostCommonTrigger as keyof typeof triggerLabels] 
              : '-'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.mostCommonTrigger 
              ? 'Trabaja en esto' 
              : 'Sin datos suficientes'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Stock en casa
          </CardTitle>
          <Package className="h-4 w-4 text-cyan-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.currentStorage !== null && stats.currentStorage !== undefined 
              ? `${stats.currentStorage.toFixed(1)}g` 
              : '0.0g'}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {stats.currentStorage === null || stats.currentStorage === undefined || stats.currentStorage === 0 ? (
              <span className="text-success">Fricción alta</span>
            ) : stats.currentStorage <= 2 ? (
              <span className="text-amber-500">Stock bajo</span>
            ) : stats.currentStorage <= 5 ? (
              <span className="text-orange-500">Stock medio</span>
            ) : (
              <span className="text-destructive font-semibold">Stock alto</span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
