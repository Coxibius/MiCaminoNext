export type EmotionalState = 
  | 'tranquilo'
  | 'ansioso'
  | 'estresado'
  | 'triste'
  | 'enojado'
  | 'aburrido'
  | 'feliz'
  | 'neutral';

export type Trigger = 
  | 'estres_laboral'
  | 'problemas_personales'
  | 'aburrimiento'
  | 'presion_social'
  | 'insomnio'
  | 'ansiedad'
  | 'celebracion'
  | 'habito'
  | 'antes_de_dormir'
  | 'recompensa'
  | 'videojuegos_pantallas'
  | 'creatividad_foco'
  | 'soledad'
  | 'frustracion'
  | 'otro';

export interface ConsumptionRecord {
  id: string;
  dateTime: Date;
  emotionalState: EmotionalState;
  triggers: Trigger[];
  anxietyLevel: number; // 1-10
  notes: string;
  quantity?: string;
  storageAmount?: number;
}

export const emotionalStateLabels: Record<EmotionalState, string> = {
  tranquilo: 'Tranquilo/a',
  ansioso: 'Ansioso/a',
  estresado: 'Estresado/a',
  triste: 'Triste',
  enojado: 'Enojado/a',
  aburrido: 'Aburrido/a',
  feliz: 'Feliz',
  neutral: 'Neutral',
};

export const triggerLabels: Record<Trigger, string> = {
  estres_laboral: 'Estres laboral',
  problemas_personales: 'Problemas personales',
  aburrimiento: 'Aburrimiento',
  presion_social: 'Presion social',
  insomnio: 'Insomnio',
  ansiedad: 'Ansiedad',
  celebracion: 'Celebracion',
  habito: 'Por habito',
  antes_de_dormir: 'Antes de dormir',
  recompensa: 'Premio / Me lo gané',
  videojuegos_pantallas: 'Videojuegos o series',
  creatividad_foco: 'Inspiración o enfoque',
  soledad: 'Soledad',
  frustracion: 'Frustración',
  otro: 'Otro',
};

export const emotionalStateColors: Record<EmotionalState, string> = {
  tranquilo: 'bg-calm text-white',
  ansioso: 'bg-anxious text-white',
  estresado: 'bg-stressed text-white',
  triste: 'bg-neutral text-white',
  enojado: 'bg-destructive text-white',
  aburrido: 'bg-muted text-foreground',
  feliz: 'bg-happy text-foreground',
  neutral: 'bg-secondary text-secondary-foreground',
};
