import { Header } from '@/components/header';
import { ConsumptionForm } from '@/components/consumption-form';

export const dynamic = 'force-dynamic';

export default function RegistrarPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Registrar momento de consumo
          </h1>
          <p className="text-muted-foreground">
            No hay juicio aqui. Registrar te ayuda a entender tus patrones y es una herramienta 
            valiosa para trabajar con tu psicologa.
          </p>
        </div>

        <ConsumptionForm />
      </main>
    </div>
  );
}
