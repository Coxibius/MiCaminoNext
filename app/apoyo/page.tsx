import { Header } from '@/components/header';
import { CrisisChat } from '@/components/crisis-chat';

export const dynamic = 'force-dynamic';

export default function ApoyoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Apoyo en momentos dificiles
          </h1>
          <p className="text-muted-foreground">
            Este asistente esta entrenado para ayudarte con antojos, ansiedad y momentos de crisis. 
            Recuerda que no reemplaza a un profesional de salud mental.
          </p>
        </div>

        <CrisisChat />
      </main>
    </div>
  );
}
