'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  EmotionalState, 
  Trigger, 
  emotionalStateLabels, 
  triggerLabels,
  emotionalStateColors,
} from '@/lib/types';
import { addRecord } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Check, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const emotionalStates: EmotionalState[] = [
  'tranquilo', 'ansioso', 'estresado', 'triste', 
  'enojado', 'aburrido', 'feliz', 'neutral'
];

const triggers: Trigger[] = [
  'estres_laboral', 'problemas_personales', 'aburrimiento',
  'presion_social', 'insomnio', 'ansiedad', 'celebracion', 'habito', 'otro'
];

export function ConsumptionForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<Trigger[]>([]);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState('');
  const [storageAmount, setStorageAmount] = useState(0);

  const toggleTrigger = (trigger: Trigger) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emotionalState) return;

    setSaving(true);
    
    addRecord({
      dateTime: new Date(dateTime),
      emotionalState,
      triggers: selectedTriggers,
      anxietyLevel,
      notes,
      quantity,
      storageAmount,
    });

    setSaved(true);
    setTimeout(() => {
      router.push('/historial');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cuando ocurrio</CardTitle>
          <CardDescription>
            Registra la fecha y hora del momento de consumo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como te sentias</CardTitle>
          <CardDescription>
            Selecciona el estado emocional que mejor describe como te sentias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {emotionalStates.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setEmotionalState(state)}
                className={cn(
                  'rounded-lg px-4 py-3 text-sm font-medium transition-all',
                  emotionalState === state
                    ? emotionalStateColors[state]
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {emotionalStateLabels[state]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nivel de ansiedad</CardTitle>
          <CardDescription>
            Del 1 (muy bajo) al 10 (muy alto), como estaba tu ansiedad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground w-8">1</span>
            <input
              type="range"
              min="1"
              max="10"
              value={anxietyLevel}
              onChange={(e) => setAnxietyLevel(Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-muted-foreground w-8">10</span>
          </div>
          <div className="text-center">
            <span className={cn(
              'inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold',
              anxietyLevel <= 3 ? 'bg-success/20 text-success' :
              anxietyLevel <= 6 ? 'bg-accent/20 text-accent-foreground' :
              'bg-stressed/20 text-stressed'
            )}>
              {anxietyLevel}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Que lo desencadeno</CardTitle>
          <CardDescription>
            Selecciona uno o mas factores que contribuyeron
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {triggers.map((trigger) => (
              <button
                key={trigger}
                type="button"
                onClick={() => toggleTrigger(trigger)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2',
                  selectedTriggers.includes(trigger)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {selectedTriggers.includes(trigger) && <Check className="h-3 w-3" />}
                {triggerLabels[trigger]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cantidad (opcional)</CardTitle>
          <CardDescription>
            Describe brevemente cuanto consumiste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ej: 1 joint, 2 pipazos, etc."
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Almacenamiento en casa (Stock)</CardTitle>
            <CardDescription className="mt-1">
              ¿Cuántos gramos tienes en tu posesión en este momento?
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
            Uso Analítico de IA
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 mt-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Registrar tu stock ayuda a la IA a comprender si tus detonantes se asocian con la <strong>alta exposición</strong> (tener mucho stock cerca) o con la <strong>ansiedad de desabastecimiento</strong> (preocupación al quedarte sin nada).
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground w-8 font-bold">0g</span>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={storageAmount}
              onChange={(e) => setStorageAmount(Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-muted-foreground w-8 font-bold">10g</span>
          </div>
          <div className="text-center flex flex-col items-center justify-center">
            <span 
              className="inline-flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold text-white shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: 
                  storageAmount === 0 ? '#2a9d8f' :
                  storageAmount <= 2 ? '#e9c46a' :
                  storageAmount <= 5 ? '#f4a261' :
                  '#e76f51'
              }}
            >
              {storageAmount.toFixed(1)}g
            </span>
            <span className={cn(
              'badge mt-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm',
              storageAmount === 0 ? 'bg-success/20 text-success border border-success/30' :
              storageAmount <= 2 ? 'bg-warning/20 text-warning-foreground border border-warning/30' :
              storageAmount <= 5 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              'bg-destructive/20 text-destructive border border-destructive/30'
            )}>
              {storageAmount === 0 ? "Sin inventario en casa (Fricción alta, ¡excelente!)" :
               storageAmount <= 2 ? "Inventario bajo (Riesgo de ansiedad de escasez)" :
               storageAmount <= 5 ? "Inventario moderado (Vulnerabilidad media)" :
               "Inventario alto (Exposición alta, riesgo de recaída)"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas personales</CardTitle>
          <CardDescription>
            Cualquier reflexion o pensamiento que quieras registrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe aqui tus pensamientos, como te sientes ahora, que podrias hacer diferente..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full"
        disabled={!emotionalState || saving}
      >
        {saved ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Guardado
          </>
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" />
            Guardar registro
          </>
        )}
      </Button>
    </form>
  );
}
