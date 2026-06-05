'use client';

import { useState, useRef } from 'react';
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
import { Check, Save, MousePointer2, Clock, Plus } from 'lucide-react';

const triggers: Trigger[] = [
  'estres_laboral', 'problemas_personales', 'aburrimiento',
  'presion_social', 'insomnio', 'ansiedad', 'celebracion', 'habito',
  'antes_de_dormir', 'recompensa', 'videojuegos_pantallas', 
  'creatividad_foco', 'soledad', 'frustracion', 'otro'
];

const quantityPresets = ['1 villa / calada', 'Un pipazo', 'Medio porro', 'Porro entero'];

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
  
  // UI toggle states
  const [showDateTime, setShowDateTime] = useState(false);
  const [showAllTriggers, setShowAllTriggers] = useState(false);
  const [showCustomQuantity, setShowCustomQuantity] = useState(false);
  const [showTherapy, setShowTherapy] = useState(false);
  
  // Mood Grid State
  const [pointerPos, setPointerPos] = useState<{x: number, y: number} | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [anxietyLevel, setAnxietyLevel] = useState<number>(5);
  
  // Main form data
  const [selectedTriggers, setSelectedTriggers] = useState<Trigger[]>([]);
  const [quantity, setQuantity] = useState('');
  const [environment, setEnvironment] = useState<'Solo' | 'Acompañado' | null>(null);
  
  // Therapy data
  const [craving, setCraving] = useState<'Leve / Hábito' | 'Moderado' | 'Incontrolable / Crisis' | null>(null);
  const [resistance, setResistance] = useState<'Respirar' | 'Tomar agua' | 'Distraerme' | 'Fui directo' | null>(null);
  const [notes, setNotes] = useState('');
  
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
    
    // Prepare notes with concatenated therapy info to avoid schema changes
    let finalNotes = notes;
    const extraInfo = [];
    if (environment) extraInfo.push(`Contexto: ${environment}`);
    if (craving) extraInfo.push(`Impulso: ${craving}`);
    if (resistance) extraInfo.push(`Resistencia: ${resistance}`);

    if (extraInfo.length > 0) {
      finalNotes = `[${extraInfo.join(' | ')}]\n\n${notes}`.trim();
    }
    
    try {
      await addRecord({
        dateTime: new Date(dateTime),
        emotionalState,
        triggers: selectedTriggers,
        anxietyLevel,
        notes: finalNotes,
        quantity,
      });

      setSaved(true);
      setTimeout(() => {
        router.push('/historial');
      }, 1000);
    } catch (error) {
      console.error(error);
      setSaving(false);
      setSaved(false);
    }
  };

  const getSuggestedTriggers = (): Trigger[] => {
    if (!emotionalState) return [];
    if (['ansioso', 'estresado', 'enojado'].includes(emotionalState)) {
      return ['ansiedad', 'estres_laboral', 'problemas_personales', 'frustracion'];
    }
    if (['aburrido', 'triste'].includes(emotionalState)) {
      return ['aburrimiento', 'habito', 'problemas_personales', 'soledad', 'videojuegos_pantallas'];
    }
    if (['feliz', 'tranquilo', 'neutral'].includes(emotionalState)) {
      return ['celebracion', 'presion_social', 'habito', 'recompensa', 'creatividad_foco', 'antes_de_dormir'];
    }
    return [];
  };

  const displayedTriggers = showAllTriggers ? triggers : getSuggestedTriggers();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-2 border-primary/20 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>¿Cómo te sientes?</CardTitle>
          <CardDescription>
            Toca el mapa para registrar tu estado actual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Grid */}
          <div className="space-y-3">
            <div className="relative w-full aspect-square max-h-[350px] mx-auto select-none touch-none rounded-xl overflow-hidden shadow-inner border border-border/50 bg-slate-900"
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
                  `
                }}
              />
              
              {/* Axes labels */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/70 uppercase tracking-widest">Positivo</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/70 uppercase tracking-widest">Negativo</div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-white/70 uppercase tracking-widest whitespace-nowrap">Baja Energía</div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold text-white/70 uppercase tracking-widest whitespace-nowrap">Alta Ansiedad</div>

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
               <div className="text-center pt-2 animate-in fade-in slide-in-from-top-2">
                 <span className={cn(
                   'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm',
                   emotionalStateColors[emotionalState]
                 )}>
                   Estado: {emotionalStateLabels[emotionalState]} (Ansiedad: {anxietyLevel}/10)
                 </span>
               </div>
            )}
          </div>

          {/* Predictive Triggers */}
          {emotionalState && (
            <div className="space-y-3 pt-2 animate-in fade-in">
              <h4 className="text-sm font-medium leading-none text-muted-foreground">¿Qué lo desencadenó?</h4>
              <div className="flex flex-wrap gap-2">
                {displayedTriggers.map((trigger) => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 border',
                      selectedTriggers.includes(trigger)
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                        : 'bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary'
                    )}
                  >
                    {selectedTriggers.includes(trigger) && <Check className="h-3 w-3" />}
                    {triggerLabels[trigger]}
                  </button>
                ))}
                
                {!showAllTriggers && (
                  <button
                    type="button"
                    onClick={() => setShowAllTriggers(true)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 border border-dashed border-muted-foreground/50 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  >
                    Otro...
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Detalles</CardTitle>
          <CardDescription>
            Información adicional sobre tu consumo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Quantity Presets */}
          <div className="space-y-3">
            <Label>Cantidad</Label>
            <div className="flex flex-wrap gap-2">
              {quantityPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setQuantity(preset);
                    setShowCustomQuantity(false);
                  }}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-all border',
                    quantity === preset && !showCustomQuantity
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border hover:bg-accent'
                  )}
                >
                  {preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowCustomQuantity(true);
                  if (quantityPresets.includes(quantity)) {
                    setQuantity('');
                  }
                }}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-all border',
                  showCustomQuantity || (!quantityPresets.includes(quantity) && quantity !== '')
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background border-border hover:bg-accent'
                )}
              >
                Personalizado
              </button>
            </div>
            
            {(showCustomQuantity || (!quantityPresets.includes(quantity) && quantity !== '')) && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                <Input
                  placeholder="Escribe la cantidad..."
                  value={quantityPresets.includes(quantity) && showCustomQuantity ? '' : quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Social Environment */}
          <div className="space-y-3 pt-2">
            <Label>Entorno (Opcional)</Label>
            <div className="flex gap-2">
              {['Solo', 'Acompañado'].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env as any === environment ? null : env as any)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all border flex-1',
                    environment === env
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border hover:bg-accent'
                  )}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Therapy Collapsible Section */}
          <div className="pt-2 border-t border-border/50">
            {!showTherapy ? (
              <button
                type="button"
                onClick={() => setShowTherapy(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 w-full justify-center rounded-md hover:bg-secondary/50"
              >
                <Plus className="h-4 w-4" />
                Detalles para mi terapia (Opcional)
              </button>
            ) : (
              <div className="space-y-5 animate-in fade-in pt-2">
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    Detalles para terapia
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowTherapy(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Ocultar
                  </button>
                </div>

                {/* Craving */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Fuerza del impulso (Craving)</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Leve / Hábito', 'Moderado', 'Incontrolable / Crisis'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setCraving(level as any === craving ? null : level as any)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-medium transition-all border',
                          craving === level
                            ? 'bg-destructive/10 border-destructive text-destructive'
                            : 'bg-background border-border hover:bg-accent'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resistance */}
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">¿Intentaste resistirte?</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Respirar', 'Tomar agua', 'Distraerme', 'Fui directo'].map((strategy) => (
                      <button
                        key={strategy}
                        type="button"
                        onClick={() => setResistance(strategy as any === resistance ? null : strategy as any)}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-medium transition-all border',
                          resistance === strategy
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-background border-border hover:bg-accent'
                        )}
                      >
                        {strategy}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="notes" className="text-xs text-muted-foreground">Notas personales</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escribe aquí tus pensamientos, cómo te sientes ahora..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date Time Link */}
          <div className="pt-2 border-t border-border/50 text-center">
            {!showDateTime ? (
              <button
                type="button"
                onClick={() => setShowDateTime(true)}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline py-1"
              >
                <Clock className="h-4 w-4" />
                ¿Ocurrió en otro momento?
              </button>
            ) : (
              <div className="space-y-2 text-left bg-secondary/20 p-3 rounded-lg animate-in fade-in">
                <div className="flex justify-between items-center">
                  <Label htmlFor="datetime" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha y Hora</Label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowDateTime(false);
                      const now = new Date();
                      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                      setDateTime(now.toISOString().slice(0, 16));
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Restablecer a Ahora
                  </button>
                </div>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        size="lg" 
        className={cn(
          "w-full shadow-lg transition-all duration-300",
          saved ? "bg-green-600 hover:bg-green-700 text-white" : "",
          saving ? "opacity-90" : ""
        )}
        disabled={!emotionalState || saving || saved}
      >
        {saved ? (
          <>
            <Check className="mr-2 h-5 w-5 animate-in zoom-in" />
            ¡Guardado exitosamente!
          </>
        ) : saving ? (
          <>
            <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Guardando...
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
