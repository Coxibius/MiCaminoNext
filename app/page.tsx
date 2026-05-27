'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { DashboardStats } from '@/components/dashboard-stats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStats } from '@/lib/store';
import { PlusCircle, MessageCircleHeart, BookOpen, Sparkles } from 'lucide-react';
import { PersonalMotives } from '@/components/personal-motives';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    weekRecords: 0,
    monthRecords: 0,
    avgAnxiety: 0,
    mostCommonTrigger: null as string | null,
    daysSinceLastConsumption: null as number | null,
    currentStorage: null as number | null,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getStats().then(setStats);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Bienvenido a tu camino de recuperacion
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-balance">
            Cada paso cuenta. Esta herramienta te ayudara a entender tus patrones 
            y a tener apoyo cuando lo necesites.
          </p>
        </section>

        {/* Motivos Personales */}
        <PersonalMotives />

        {/* Stats */}
        {mounted && <DashboardStats stats={stats} />}

        {/* Quick Actions */}
        <section className="grid gap-4 sm:grid-cols-2">
          <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <PlusCircle className="h-5 w-5" />
                Registrar momento
              </CardTitle>
              <CardDescription>
                Anota un momento de consumo con todos los detalles para tu seguimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/registrar">
                <Button className="w-full">
                  Nuevo registro
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent-foreground">
                <MessageCircleHeart className="h-5 w-5" />
                Necesito apoyo
              </CardTitle>
              <CardDescription>
                Habla con el asistente IA cuando tengas antojos o momentos dificiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/apoyo">
                <Button variant="secondary" className="w-full">
                  Hablar ahora
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              Consejos rapidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
                <span><strong className="text-foreground">Registra cada vez</strong> - Aunque no te sientas orgulloso/a, cada registro te ayuda a entender tus patrones.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
                <span><strong className="text-foreground">Identifica triggers</strong> - Saber que desencadena el consumo es el primer paso para manejarlo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
                <span><strong className="text-foreground">Usa el apoyo IA</strong> - En momentos de crisis, el chat puede ayudarte con tecnicas de manejo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">4</span>
                <span><strong className="text-foreground">Comparte con tu psicologa</strong> - El historial esta disenado para que puedas revisarlo juntos.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
