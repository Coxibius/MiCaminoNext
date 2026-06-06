import { Header } from '@/components/header';
import { RecordsList } from '@/components/records-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function HistorialPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Historial de consumo
            </h1>
            <p className="text-muted-foreground">
              Tu registro completo para revisar con tu psicologa
            </p>
          </div>
          
          <Link href="/registrar">
            <Button size="sm" className="shrink-0">
              <PlusCircle className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </Link>
        </div>

        <RecordsList />
        
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-dashed">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Compartir con tu psicologa</p>
              <p className="text-muted-foreground">
                Puedes mostrar esta pagina directamente en tu sesion o tomar capturas de pantalla.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
