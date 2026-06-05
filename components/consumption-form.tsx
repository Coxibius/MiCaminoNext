'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  EmotionalState, 
  Trigger, 
  emotionalStateLabels, 
  triggerLabels,
  emotionalStateColors,
} from '@/lib/types';
import { addRecord } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Check, Save, MousePointer2 } from 'lucide-react';

const triggers: Trigger[] = [
  'estres_laboral', 'problemas_personales', 'aburrimiento',
  'presion_social', 'insomnio', 'ansiedad', 'celebracion', 'habito', 'otro'
];

function getEmotionFromCoords(x: number, y: number): EmotionalState {
  // x (anxiety/energy): 0 to 1
  // y (valence/mood): 0 to 1 (0 = positive, 1 = negative)
  
  if (y < 0.5) { // Positive half
    if (x < 0.4) return 'tranquilo';
    if (x < 0.7) return 'neutral';
    return 'feliz';
  } else { // Negative half
    if (x < 0.3) return 'aburrido';
    if (x < 0.5) return 'triste';
    if (x < 0.7) return 'ansioso';
    if (y > 0.7 && x > 0.8) return 'enojado';
    return 'estresado';
  }
}

export function ConsumptionForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  
  // Mood Grid State
  const [pointerPos, setPointerPos] = useState<{x: number, y: number} | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [anxietyLevel, setAnxietyLevel] = useState<number>(5);
  
  const [selectedTriggers, setSelectedTriggers] = useState<Trigger[]>([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const gridRef = useRef<HTMLDivElement>(null);

  const handleGridInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    
    // Clamp between 0 and 1
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    setPointerPos({ x, y });
    
    // Calculate Anxiety (1-10 based on X axis)
    const anxiety = Math.max(1, Math.min(10, Math.round(x * 10)));
    setAnxietyLevel(anxiety);
    
    // Calculate Emotion
    setEmotionalState(getEmotionFromCoords(x, y));
  };

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
    
    try {
      await addRecord({
        dateTime: new Date(dateTime),
        emotionalState,
        triggers: selectedTriggers,
        anxietyLevel,
        notes,
        quantity,
        // storageAmount is undefined, so it doesn't update stock
      });

      setSaved(true);
      setTimeout(() => {
        router.push('/historial');
      }, 1000);
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cuando ocurrió</CardTitle>
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
          <CardTitle>Estado y Desencadenantes</CardTitle>
          <CardDescription>
            Selecciona qué detonó este registro y haz clic en el mapa para ubicar tu estado de ánimo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Triggers */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none">Desencadenantes</h4>
            <div className="flex flex-wrap gap-2">
              {triggers.map((trigger) => (
                <button
                  key={trigger}
                  type="button"
                  onClick={() => toggleTrigger(trigger)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 border',
                    selectedTriggers.includes(trigger)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary'
                  )}
                >
                  {selectedTriggers.includes(trigger) && <Check className="h-3 w-3" />}
                  {triggerLabels[trigger]}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none flex justify-between">
              <span>Mapa Emocional</span>
              {emotionalState && (
                <span className="text-primary font-bold">{emotionalStateLabels[emotionalState]} (Ansiedad: {anxietyLevel}/10)</span>
              )}
            </h4>
            <div className="relative w-full aspect-square max-h-[350px] mx-auto select-none touch-none rounded-xl overflow-hidden shadow-inner border border-border/50"
                 ref={gridRef}
                 onMouseDown={handleGridInteraction}
                 onMouseMove={(e) => {
                   if (e.buttons === 1) handleGridInteraction(e);
                 }}
                 onTouchStart={handleGridInteraction}
                 onTouchMove={handleGridInteraction}
            >
              {/* Grid Background gradient */}
              <div 
                className="absolute inset-0 opacity-80"
                style={{
                  background: `
                    radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 60%),
                    radial-gradient(circle at 100% 0%, #eab308 0%, transparent 60%),
                    radial-gradient(circle at 0% 100%, #64748b 0%, transparent 60%),
                    radial-gradient(circle at 100% 100%, #ef4444 0%, transparent 60%)
                  `,
                  backgroundColor: '#0f172a'
                }}
              />
              
              {/* Axes labels */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/70 uppercase tracking-widest">Positivo</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/70 uppercase tracking-widest">Negativo</div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-white/70 uppercase tracking-widest">Baja Energía</div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold text-white/70 uppercase tracking-widest">Alta Ansiedad</div>

              {/* Grid lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-full h-[1px] bg-white absolute top-1/2" />
                <div className="h-full w-[1px] bg-white absolute left-1/2" />
              </div>

              {/* Interaction prompt */}
              {!pointerPos && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-white/80 animate-pulse">
                  <MousePointer2 className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Toca para ubicar tu estado</span>
                </div>
              )}

              {/* Pointer */}
              {pointerPos && (
                <div 
                  className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.7)] pointer-events-none transition-transform duration-75 scale-110"
                  style={{
                    left: `${pointerPos.x * 100}%`,
                    top: `${pointerPos.y * 100}%`,
                    backgroundColor: emotionalState ? (
                      emotionalState === 'tranquilo' ? '#3b82f6' :
                      emotionalState === 'feliz' ? '#eab308' :
                      emotionalState === 'aburrido' || emotionalState === 'triste' ? '#64748b' :
                      '#ef4444'
                    ) : 'white'
                  }}
                >
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                </div>
              )}
            </div>
            
            {emotionalState && (
               <div className="text-center pt-2">
                 <span className={cn(
                   'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm',
                   emotionalStateColors[emotionalState]
                 )}>
                   Estado: {emotionalStateLabels[emotionalState]}
                 </span>
               </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cantidad y Notas</CardTitle>
          <CardDescription>
            Detalles adicionales de este registro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad (opcional)</Label>
            <Input
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ej: 1 joint, 2 pipazos, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas personales</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe aquí tus pensamientos, cómo te sientes ahora..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full shadow-lg"
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
